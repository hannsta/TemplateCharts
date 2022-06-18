from django.shortcuts import render
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
from yellowfinintegration.models import Dataset, Template, DataSource, Widget, APIConnection, Dashboard
import datetime
from django.forms.models import model_to_dict
from django.core import serializers
import os
from django.conf import settings
import pandas as pd
import re
from io import StringIO
from . import dataservice
from . import modelservice

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
                    if (len(customVar)<2): continue
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
                selectedColumns[key]=list(property['value'].keys())[0]


        

        outfile+='var selectedColumns='+json.dumps(selectedColumns)+';'
        for line in template.split('\n'):
            placeholders = re.findall('\{{.*?\}}',line)
            if (len(placeholders) > 0):
                for holder in placeholders:
                    customVar = holder.replace('{{','').replace('}}','').split("|")
                    
                    if (len(customVar)>1):
                    
                        if (customVar[1]=='String'):
                            line = line.replace(holder,"'"+properties[customVar[0]]['value']+"'")
                        if (customVar[1]=='SubMenu'):
                            line = line.replace(holder,"")
                        if (customVar[1]== 'MultiSelect'):
                            line = line.replace(holder,"'"+properties[customVar[0]]['value']+"'")           
                        if ('CategoryColumn' == customVar[1] or 'ValueColumn' == customVar[1] ):
                            dataSetVar = list(properties[customVar[0]]['value'].keys())[0]
                            line = line.replace(holder,"dataSet['"+dataSetVar+"']")
                        if ('ColumnList' in customVar[1]):
                            line = line.replace(holder,"dataSet")
                    if (len(customVar)==1 and customVar[0]=='ContainerID'):
                        line = line.replace(holder,widgetid)
                      
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
        dataset = pd.read_csv(data,delimiter=",")
        metadata = {}
        for i in range(len(dataset.columns)):
            colname = dataset.columns[i]
            colname = colname.replace('"','').replace("'","")
            metadata[colname]=dataTypeMap[str(dataset.dtypes[i])]
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
        data_type = 'all'
        if 'type' in request.GET:
            data_type = request.GET['type']
        datasources = list(DataSource.objects.values_list("name", "sourceid"))
       
        datalist = []
        if data_type != 'dataset':
            datasources = list(DataSource.objects.values_list("name", "sourceid","type"))
            for val in datasources:
                if data_type == 'all' or (val[2] == 'API' and data_type == 'api') or (val[2] == 'FILE' and data_type == 'csv'):
                    datalist.append({'name':val[0],'sourceid':val[1]})
        if data_type == 'dataset' or data_type == 'all':
            datasets = list(Dataset.objects.values_list("name", "datasetid"))
            for val in datasets:
                datalist.append({'name':val[0],'sourceid':val[1]})
        content = json.dumps(datalist)

        return HttpResponse(content, content_type='application/json')

def get_source_filters(request):
    if request.method=='GET':
        sourceid = request.GET['sourceid']

        datasets = Dataset.objects.filter(datasetid=sourceid)
        params = json.dumps([])
        if (datasets):
            dataset = datasets.first()
            for datasetNode in dataset.nodes:
                if datasetNode['nodeType'] == 'API Input':
                    sourceid = datasetNode['config']
                    api_connections = APIConnection.objects.filter(sourceid=sourceid) 
                    api_connection = api_connections.first()  
                    params = json.dumps(api_connection.parameters)
        else:
            datas = DataSource.objects.filter(sourceid=sourceid) 
            data = datas.first()
            if (data.type == 'API'):
                api_connections = APIConnection.objects.filter(sourceid=sourceid) 
                api_connection = api_connections.first()  
                params = json.dumps(api_connection.parameters)

        return HttpResponse(params, content_type='application/json')
           
def get_metadata(request):
    if request.method=='GET':
        sourceid = request.GET['sourceid']

        datasets = Dataset.objects.filter(datasetid=sourceid)

        if (datasets):
            dataset = datasets.first()
            metadata = json.dumps(dataservice.get_dataset_metadata(dataset))
        else:
            datas = DataSource.objects.filter(sourceid=sourceid) 
            data = datas.first()
            
            if (data.type=='FILE'):                
                metadata = json.dumps(json.loads(data.metadata))
                
            if (data.type == 'API'):
                api_connections = APIConnection.objects.filter(sourceid=sourceid) 
                api_connection = api_connections.first()
                metadata = json.dumps(dataservice.get_api_metadata(api_connection,  api_connection.parameters, api_connection.resultobject))

        return HttpResponse(metadata, content_type='application/json')

def test_dataset(request):
    if request.method=='GET':
        sourceid = request.GET['datasetid']

        datasets = Dataset.objects.filter(datasetid=sourceid)

        if (datasets):
            dataset = datasets.first()
            verbose_metadata = json.dumps(dataservice.get_dataset_metadata(dataset,verbose=True))

    return HttpResponse(verbose_metadata, content_type='application/json')


@csrf_exempt 
def get_data(request):
    if request.method=='POST':
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)  
        
        #Request Properties
        sourceid = body['sourceid']
        user = request.user.username
        runtimeFilterDefs = body['runtimeFilterDefs']
        runtimeFilterProperties = body['runtimeFilterProperties']
        properties = body['properties']
        source_filters = body['sourceFilterProperties']
 
        if ('widgetid' in body):   
            widgetid = body['widgetid']      

        datasets = Dataset.objects.filter(datasetid=sourceid)
        if (datasets):
            dataset = datasets.first()
            data = dataservice.run_dataset(dataset, source_filters)
        else:
            data = dataservice.get_data(sourceid, source_filters)


        #Get Cached Values
        cachedValues = dataservice.cachedValues(data,runtimeFilterDefs)

        #Process Runtime filters
        data = dataservice.runtimeFilters(data,runtimeFilterProperties)

        #Apply Widget Properties
        if (widgetid):
            properties = modelservice.getWidgetProperties(widgetid,user, properties)
        
        #Agg
        data = dataservice.smartAgg(data,properties)           

        out_type = 'data'
        if 'Data' in properties and 'type' in properties['Data']:
            out_type = properties['Data']['type']
        #Format for response
        print(out_type)
        print("===========================")
        if (out_type=='ColumnListRecords'):
            out_data = data.to_json(orient="records")
            out_data = json.loads(out_data)
        else:
            out_data = {}
            for colname in data.columns:
                out_data[colname] = data[colname].tolist()

            
        return HttpResponse(json.dumps({'dataset':out_data,'filterValues':cachedValues}), content_type='application/json')


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
                'sourceFilters' : widget.sourceFilters,
                'runtimeFilters' : widget.runtimeFilters,
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
def delete_widget(request):
    if request.method=='GET':
        widgetid = request.GET['widgetid']
        widgets = Widget.objects.filter(user=request.user.username, widgetid=widgetid) 
        widget = widgets.first()
        if (widget):    
            widget.delete()
        return HttpResponse(json.dumps({"status":"deleted"}), content_type='application/json')

def save_widget(request):
    if request.method=='POST':
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)  
        widgets = None
        if ('widgetid' in body):
            widgets = Widget.objects.filter(user=request.user.username, widgetid=body['widgetid']) 
        if (widgets):
            widget = widgets.first()
            widget.name = body['widgetName']
            widget.widget = body['widget']
            widget.sourceFilters = body['sourceFilters']
            widget.runtimeFilters = body['runtimeFilters']
            widget.runtimeFilterDefs = body['runtimeFilterDefs']
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
                sourceFilters = body['sourceFilters'],
                runtimeFilters = body['runtimeFilters'],
                runtimeFilterDefs = body['runtimeFilterDefs'],
                templateid = body['templateid'],
                sourceid = body['sourceid']
            )
            widget.save()
        
        content = widget.widgetid
        return HttpResponse(content, content_type='application/json')
def save_dashboard(request):
    if request.method=='POST':
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)  
        dashboards = None
        if ('dashboardid' in body):
            dashboards = Dashboard.objects.filter(user=request.user.username, dashboardid=body['dashboardid']) 
        if (dashboards):
            dashboard = dashboards.first()
            dashboard.name = body['dashboardName']
            dashboard.widgets = body['widgets']
            dashboard.save()
        else:
            dashboard = Dashboard(
                user = request.user.username,
                created = datetime.datetime.now(),
                modified = datetime.datetime.now(),
                name = body['dashboardName'],
                widgets = body['widgets'],
            )
            dashboard.save()
        
        content = dashboard.dashboardid
        return HttpResponse(content, content_type='application/json')

def get_dashboard(request):
    if request.method=='GET':
        dashboardid = request.GET['dashboardid']
        role = request.GET['role']
        dashboards = Dashboard.objects.filter(user=request.user.username, dashboardid=dashboardid) 
        dashboard = dashboards.first()
        if (dashboard):
            dashboardJSON = {
                'dashboardName':dashboard.name,
                'dashboardid':dashboard.dashboardid,
                'widgets':dashboard.widgets
            }
            dashboardJSON = json.dumps(dashboardJSON)
        else:
            dashboardJSON = json.dumps({'error':'no widget found'})
        return HttpResponse(dashboardJSON, content_type='application/json')
def get_dashboards(request):
    if request.method=='GET':
        dashboards = Dashboard.objects.filter(user=request.user.username)
        content  = list(dashboards.values_list("name", "dashboardid"))
        return HttpResponse(json.dumps(content), content_type='application/json')

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


def save_dataset(request):
    if request.method=='POST':
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)  
        datasets = None
        if ('id' in body):
            datasets = Dataset.objects.filter(user=request.user.username, datasetid=body['id']) 
        if (datasets):
            dataset = datasets.first()
            dataset.name = body['name']
            dataset.nodes = body['nodes']
            dataset.save()
        else:
            dataset = Dataset(
                user = request.user.username,
                created = datetime.datetime.now(),
                modified = datetime.datetime.now(),
                name = body['name'],
                nodes = body['nodes'],
            )
            dataset.save()
        
        content = dataset.datasetid
        return HttpResponse(content, content_type='application/json')

def get_dataset(request):
    if request.method=='GET':
        datasetid = request.GET['datasetid']
        datasets = Dataset.objects.filter(user=request.user.username, datasetid=datasetid) 
        dataset = datasets.first()
        if (dataset):
            datasetJSON = {
                'name':dataset.name,
                'id':dataset.id,
                'nodes':dataset.nodes,
            }
            datasetJSON = json.dumps(datasetJSON)
        else:
            datasetJSON = json.dumps({'error':'no widget found'})
        return HttpResponse(datasetJSON, content_type='application/json')
def get_datasets(request):
    if request.method=='GET':
        datasets = Dataset.objects.filter(user=request.user.username)
        content  = list(datasets.values_list("name", "datasetid"))
        return HttpResponse(json.dumps(content), content_type='application/json')
