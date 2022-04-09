from django.shortcuts import render
from . import yellowfin
import json
from django.shortcuts import render
from django.http import HttpRequest
from django.http import HttpResponseRedirect
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from yellowfinintegration.models import Template, DataSource, Widget
import datetime
from django.forms.models import model_to_dict
from django.core import serializers
import os
from django.conf import settings
import pandas as pd
import re
from io import StringIO

# Create your views here.
def get_refresh_token(request):
    refresh_token = yellowfin.get_refresh_token()
    data = json.dumps(refresh_token)
    return HttpResponse(data, content_type='application/json')

@ensure_csrf_cookie
def csrf(request):
    data = json.dumps({
        'test':'true'
    })
    return HttpResponse(data, content_type='application/json')

def save_template(request):
    if request.method=='POST':
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)  
        templates = None
        if (body['templateId']):
            templates = Template.objects.filter(user=request.user.username, templateid=body['templateId']) 
        if (templates):
            template = templates.first()
            template.name = body['templateName']
            template.template = body['template']
            template.scripts = body['scripts']
            template.save()
        else:
            template = Template(
                user = request.user.username,
                name = body['templateName'],
                created = datetime.datetime.now(),
                modified = datetime.datetime.now(),
                template = body['template'],
                scripts = body['scripts']
                )
            template.save()
        
        content = template.templateid
        return HttpResponse(content, content_type='application/json')

def get_template(request):
    if request.method=='GET':
        templateid = request.GET['templateid']
        templates = Template.objects.filter(user=request.user.username, templateid=templateid) 
        template = templates.first()
        customVars = []
        for line in template.template.split('\n'):
            placeholders = re.findall('\{{.*?\}}',line)
            if (len(placeholders) > 0):
                for holder in placeholders:
                    customVar = holder.replace('{{','').replace('}}','').split("|")
                    customVars.append({
                        'name':customVar[0],
                        'type':customVar[1]
                    })
        content = serializers.serialize('json', [template])
        content = json.loads(content)
        content[0]['parsed'] = customVars
        return HttpResponse(json.dumps(content), content_type='application/json')


def get_templates(request):
    if request.method=='GET':
        templates = Template.objects.filter(user=request.user.username)
        content  = list(templates.values_list("name", "templateid"))
        return HttpResponse(json.dumps(content), content_type='application/json')

def parse_options(request):
    if request.method=='POST':
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)  
        customVars = []
        for line in body['script'].split('\n'):
            placeholders = re.findall('\{{.*?\}}',line)
            if (len(placeholders) > 0):
                for holder in placeholders:
                    customVar = holder.replace('{{','').replace('}}','').split("|")
                    customVars.append({
                        'name':customVar[0],
                        'type':customVar[1]
                    })
        return HttpResponse(json.dumps(customVars), content_type='application/json')
    return HttpResponse(status=503)

@csrf_exempt 
def get_script(request):
    if request.method=='POST':
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)  
        outfile = ''
        customVars = []
        
        if (body['templateid']):
            templateid = body['templateid']
            templates = Template.objects.filter(user=request.user.username, templateid=templateid) 
            template = templates.first().template
        else:
            template =  body['script']


        for line in template.split('\n'):
            placeholders = re.findall('\{{.*?\}}',line)
            if (len(placeholders) > 0):
                for holder in placeholders:
                    print(holder)
                    customVar = holder.replace('{{','').replace('}}','').split("|")
                    if (customVar[1]=='String'):
                        line = line.replace(holder,"'"+body['properties'][customVar[0]]['value']+"'")
                    if ('Column' in customVar[1]):
                        line = line.replace(holder,"dataSet['"+body['properties'][customVar[0]]['value']+"']")
            outfile+=line
        return HttpResponse(outfile, content_type='text/plain')
    return HttpResponse(status=503)



@ensure_csrf_cookie
def add_user(request):
    if request.method=='POST':
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)  
        user = User.objects.create_user(body['user'], None, body['password'])
        user.save()
    return HttpResponse(status=204)

def login_user(request):
    if request.method=='POST':
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)  
        user = authenticate(username=body['user'], password=body['password'])
        if user is not None:
            login(request, user)
            return HttpResponse(status=204)
        else:
            return HttpResponse(status=503)

def logout_user(request):
    logout(request)
    return HttpResponse(status=204)



def upload_data(request):
    if request.method=='POST':
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)  
        data = StringIO(body['data'])
        dataTypeMap = {'object':'TEXT',
        'int64':'NUMERIC',
        'float64':'NUMERIC',
        }
        dataset = pd.read_csv(data)
        metadata = {}
        for i in range(len(dataset.columns)):
            metadata[dataset.columns[i]]=dataTypeMap[str(dataset.dtypes[i])]
        dataset.to_csv(os.path.join(settings.BASE_DIR, 'uploads/'+body['name']))
        datasource = DataSource(
            user=request.user.username, 
            name=body['name'],
            location= '/uploads/'+body['name'],
            metadata=str(metadata).replace("'",'"')
            )
        datasource.save()
        return HttpResponse(status=200)

def get_user_data(request):
    if request.method=='GET':
        datasources = DataSource.objects.filter(user=request.user.username) 
        content = json.dumps(list(datasources.values()))
        return HttpResponse(content, content_type='application/json')
@csrf_exempt 
def get_data(request):
    if request.method=='POST':
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)  
        sourceid = body['sourceid']
        datas = DataSource.objects.filter(sourceid=sourceid) 
        data = datas.first()
        data = pd.read_csv(os.path.join(settings.BASE_DIR, 'uploads/'+data.name))
        groupfields =[]
        numberfields = []
        usedfields = []
        for property in body['properties']:
            if (body['properties'][property]):
                type = body['properties'][property]['type']
                value = body['properties'][property]['value']
                print(property)
                if type == 'CategoryColumn':
                    groupfields.append(value)
                    usedfields.append(value)
                if type=='ValueColumn':
                    numberfields.append(value)
                    usedfields.append(value)
        if (len(usedfields)==0):
            return HttpResponse(json.dumps({}), content_type='application/json')
        data = data[usedfields]
        data = data.groupby(groupfields).sum().reset_index()
        print(data)
        out_data = {}
        for colname in data.columns:
            out_data[colname] = data[colname].tolist()
        #js = data.to_json(orient = 'values')
        return HttpResponse(json.dumps(out_data), content_type='application/json')
     
def get_metadata(request):
    if request.method=='GET':
        sourceid = request.GET['sourceid']
        datas = DataSource.objects.filter(sourceid=sourceid) 
        data = datas.first()
        return HttpResponse(data.metadata, content_type='application/json')

def get_widget(request):
    if request.method=='GET':
        widgetid = request.GET['widgetid']
        widgets = Widget.objects.filter(user=request.user.username, widgetid=widgetid) 
        widget = widgets.first()
        if (widget):
            widgetJson = serializers.serialize('json', [widget])
        else:
            widgetJson = json.dumps({'error':'no widget found'})
        return HttpResponse(widgetJson, content_type='application/json')
def get_widgets(request):
    if request.method=='GET':
        widgets = Widget.objects.filter(user=request.user.username)
        content  = list(widgets.values_list("name", "widgetid"))
        return HttpResponse(json.dumps(content), content_type='application/json')
def save_widget(request):
    if request.method=='POST':
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)  
        widgets = None
        if (body['widgetid']):
            widgets = Widget.objects.filter(user=request.user.username, widgetid=body['widgetid']) 
        if (widgets):
            widget = widgets.first()
            widget.name = body['widgetName']
            widget.widget = body['widget']
            widget.templateid = body['templateid']
            widget.sourceid = body['sourceid']
            widget.save()
        else:
            widget = Widget(
                user = request.user.username,
                created = datetime.datetime.now(),
                modified = datetime.datetime.now(),
                name = body['widgetName'],
                widget = body['widget'],
                templateid = body['templateid'],
                sourceid = body['sourceid']
            )
            widget.save()
        
        content = widget.widgetid
        return HttpResponse(content, content_type='application/json')
