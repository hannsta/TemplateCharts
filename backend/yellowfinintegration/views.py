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
from yellowfinintegration.models import Template, DataSource, Widget, APIConnection
import datetime
from django.forms.models import model_to_dict
from django.core import serializers
import os
from django.conf import settings
import pandas as pd
import re
from io import StringIO
from . import dataservice

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

        role = request.GET['role']
        widgetid = None
        if ('widgetid' in request.GET):
            widgetid = request.GET['widgetid']

        widget = None
        if (widgetid and role=='READ'):
            widgets = Widget.objects.filter(user=request.user.username, widgetid=widgetid) 
            widget = widgets.first().widget

        templates = Template.objects.filter(user=request.user.username, templateid=templateid) 
        template = templates.first()
        customVars = []
        for line in template.template.split('\n'):
            placeholders = re.findall('\{{.*?\}}',line)
            if (len(placeholders) > 0):
                for holder in placeholders:
                    customVar = holder.replace('{{','').replace('}}','').split("|")
                    customVarOptions ={
                        'name':customVar[0],
                        'type':customVar[1]
                    }
                    if (len(customVar)>2):
                        customVarOptions['parameters']=customVar[2]
                    optionVisible = True
                    if (widget!=None):
                        if (customVar[0] in widget and widget[customVar[0]]['hidden']):
                            optionVisible = False
                        if (customVar[0] not in widget):
                            optionVisible = False        
                    if (optionVisible):
                        customVars.append(customVarOptions)
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
                    customVarOptions ={
                        'name':customVar[0],
                        'type':customVar[1]
                    }
                    if (len(customVar)>2):
                        customVarOptions['parameters']=customVar[2]
                    customVars.append(customVarOptions)
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
        selectedColumns = {}
        properties = body['properties']

        if ('widgetid' in body):
            
            widgetid = body['widgetid']
            widgets = Widget.objects.filter(user=request.user.username, widgetid=widgetid) 
            widget = widgets.first()
            if (widget):
                widget = widget.widget
                for key in widget:
                    if (widget[key]['hidden']):
                        properties[key]= {'type': widget[key]['type'],'value': widget[key]['value']} 



        for key in properties:
            property = properties[key]
            if (property['type']=='CategoryColumn' or property['type']=='ValueColumn'):
                selectedColumns[key]=property['value'][0]


        

        outfile+='var selectedColumns='+json.dumps(selectedColumns)+';'
        for line in template.split('\n'):
            placeholders = re.findall('\{{.*?\}}',line)
            if (len(placeholders) > 0):
                for holder in placeholders:
                    customVar = holder.replace('{{','').replace('}}','').split("|")
                    if (customVar[1]=='String'):
                        line = line.replace(holder,"'"+properties[customVar[0]]['value']+"'")
                    if (customVar[1]=='SubMenu'):
                        line = line.replace(holder,"")
                    if (customVar[1]== 'MultiSelect'):
                        line = line.replace(holder,"'"+properties[customVar[0]]['value'][0]+"'")           
                    if ('CategoryColumn' == customVar[1] or 'ValueColumn' == customVar[1] ):
                        line = line.replace(holder,"dataSet['"+properties[customVar[0]]['value'][0]+"']")
                    if ('ColumnList' in customVar[1]):
                        line = line.replace(holder,"dataSet")
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
            metadata=str(metadata).replace("'",'"'),
            type = 'FILE'
            )
        datasource.save()
        return HttpResponse(status=200)

def get_user_data(request):
    if request.method=='GET':
        datasources = DataSource.objects
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
        
        if (data.type=='File'):
            data = pd.read_csv(os.path.join(settings.BASE_DIR, 'uploads/'+data.name))
        if (data.type == 'API'):
            api_connections = APIConnection.objects.filter(sourceid=sourceid) 
            api_connection = api_connections.first()
            data = dataservice.get_api_data(api_connection, body['sourceFilterProperties'], api_connection.resultobject)
        print("number of rows: "+str(data.shape[0]))
        properties = body['properties']

        if ('widgetid' in body):
            
            widgetid = body['widgetid']
            widgets = Widget.objects.filter(user=request.user.username, widgetid=widgetid) 
            widget = widgets.first()
            if (widget):
                widget = widget.widget

                for key in widget:
                    if (widget[key]['hidden']):
                        properties[key]= {'type': widget[key]['type'],'value': widget[key]['value']} 



        groupfields =[]
        numberfields = []
        usedfields = []
        for property in properties:
            if (properties[property]):
                type = properties[property]['type']
                value = properties[property]['value']
                if type == 'CategoryColumn':
                    groupfields.append(value[0])
                    usedfields.append(value[0])
                if type == 'ValueColumn':
                    numberfields.append(value[0])
                    usedfields.append(value[0])
                if type=='ColumnList' or type=='ColumnListRecords':
                    usedfields.extend(value)
        if (len(usedfields)==0):
            return HttpResponse(json.dumps({}), content_type='application/json')

        data = data[usedfields]

        if (len(groupfields)==0 and 'ColumnList' in type):
            for i in range(len(data.columns)):
                if (str(data.dtypes[i]) == 'object'):
                    groupfields.append(data.columns[i])
                     
        if (len(groupfields)>0):
            data = data.groupby(groupfields).sum().reset_index()

        if (type=='ColumnListRecords'):
            out_data = data.to_json(orient="records")
            out_data = json.loads(out_data)
        else:
            out_data = {}
            for colname in data.columns:
                out_data[colname] = data[colname].tolist()

            
        return HttpResponse(json.dumps(out_data), content_type='application/json')
     
def get_metadata(request):
    if request.method=='GET':
        sourceid = request.GET['sourceid']
        datas = DataSource.objects.filter(sourceid=sourceid) 
        data = datas.first()
        
        if (data.type=='File'):
            metadata = data.metadata
        if (data.type == 'API'):
            api_connections = APIConnection.objects.filter(sourceid=sourceid) 
            api_connection = api_connections.first()
            metadata = json.dumps(dataservice.get_api_metadata(api_connection,  api_connection.parameters, api_connection.resultobject))

        return HttpResponse(metadata, content_type='application/json')

def get_widget(request):
    if request.method=='GET':
        widgetid = request.GET['widgetid']
        role = request.GET['role']
        widgets = Widget.objects.filter(user=request.user.username, widgetid=widgetid) 
        widget = widgets.first()
        if (widget):
            widgetProperties = widget.widget
            widgetCopy = {}
            if (role=='READ'):
                for key in widgetProperties:
                    if (widgetProperties[key]['hidden']==False):
                        widgetCopy[key] = widgetProperties[key]
            else:
                widgetCopy = widgetProperties
            widgetJson = {
                'sourceid':widget.sourceid,
                'templateid':widget.templateid,
                'widgetName':widget.name,
                'widgetid':widget.widgetid,
                'widget':widgetCopy
            }
            widgetJson = json.dumps(widgetJson)
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

def save_connection(request):
    if request.method=='POST':
        
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)  
        if (body['sourceid']):
            datasources = DataSource.objects.filter(sourceid=body['sourceid']) 
            if (datasources):
                datasource = datasources.first()
                datasource.name=body['name']
                datasource.save()
        else:
            datasource = DataSource(
                name = body['name'],
                type = 'API'
            )
            datasource.save()
        sourceid = datasource.sourceid
        if (body['connectionid']):
            api_connections = APIConnection.objects.filter(sourceid=body['sourceid']) 
            if (api_connections):
                api_connection = api_connections.first()
                api_connection.url = body['url']
                api_connection.parameters = body['parameters']
                api_connection.resultobject = body['resultobject']
                api_connection.save()
        else:
            api_connection = APIConnection(
                url = body['url'],
                parameters = body['parameters'], 
                resultobject = body['resultobject'],
                sourceid = sourceid
            )
            api_connection.save()
        
        content = {'connectionid': str(api_connection.connectionid), 'sourceid': str(sourceid)}
        return HttpResponse(json.dumps(content), content_type='application/json')

def get_connection(request):
    if request.method=='GET':
        sourceid = request.GET['sourceid']
        api_connections = APIConnection.objects.filter(sourceid=sourceid) 
        api_connection = api_connections.first()
        if (api_connection):
            widgetJson = serializers.serialize('json', [api_connection])
        else:
            widgetJson = json.dumps({'error':'no widget found'})
        return HttpResponse(widgetJson, content_type='application/json')

def get_source_filters(request):
    if request.method=='GET':
        sourceid = request.GET['sourceid']
        datas = DataSource.objects.filter(sourceid=sourceid) 
        data = datas.first()
        params = []
        if (data.type == 'API'):
            api_connections = APIConnection.objects.filter(sourceid=sourceid) 
            api_connection = api_connections.first()  
            params = json.dumps(api_connection.parameters)
        return HttpResponse(params, content_type='application/json')
