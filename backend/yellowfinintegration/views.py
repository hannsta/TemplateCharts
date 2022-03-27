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
from django.views.decorators.csrf import ensure_csrf_cookie
from yellowfinintegration.models import Template, DataSource
import datetime
from django.forms.models import model_to_dict
from django.core import serializers

import re
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

def get_script(request):
    if request.method=='POST':
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)  
        print(body)
        outfile = ''
        customVars = []
        for line in body['script'].split('\n'):
            placeholders = re.findall('\{{.*?\}}',line)
            if (len(placeholders) > 0):
                for holder in placeholders:
                    print(holder)
                    customVar = holder.replace('{{','').replace('}}','').split("|")
                    if (customVar[1]=='String'):
                        line = line.replace(holder,"'"+body['properties'][customVar[0]]+"'")
            outfile+=line
        return HttpResponse(outfile, content_type='text/plain')
    return HttpResponse(status=503)



@ensure_csrf_cookie
def addUser(request):
    if request.method=='POST':
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)  
        user = User.objects.create_user(body['user'], None, body['password'])
        user.save()
    return HttpResponse(status=204)

def loginUser(request):
    if request.method=='POST':
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)  
        user = authenticate(username=body['user'], password=body['password'])
        if user is not None:
            login(request, user)
            return HttpResponse(status=204)
        else:
            return HttpResponse(status=503)

def logoutUser(request):
    logout(request)
    return HttpResponse(status=204)