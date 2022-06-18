from asyncio import run
import datetime
from functools import cache
import json
import os
import sys
from django.conf import settings
from numpy import False_
import pandas as pd
import requests
import time

from yellowfinintegration.models import APIConnection, DataSource

dataTypeMap = {'object':'TEXT',
            'int64':'NUMERIC',
            'float64':'NUMERIC',
            }

def get_datamap():
    return dataTypeMap;

def get_dataset_metadata(dataset, **kwargs):
    verbose = kwargs.get('verbose', False)
    params = []
    for datasetNode in dataset.nodes:
        if datasetNode['nodeType'] == 'API Input':
            sourceid = datasetNode['config']
            api_connections = APIConnection.objects.filter(sourceid=sourceid) 
            api_connection = api_connections.first()  
            params.extend(api_connection.parameters)
    source_filters = {}
    for param in params:
        source_filters[param['key']]=param['value']
    if verbose:
        data, output_log = run_dataset(dataset,source_filters,verbose=verbose)
    else:
        data = run_dataset(dataset,source_filters,verbose=verbose)
    metadata = {}
    for i in range(len(data.columns)):
        metadata[data.columns[i]]=dataTypeMap[str(data.dtypes[i])]
    if verbose:
        return {'result': metadata, 'output_log':output_log}
    else:
        return metadata

def get_api_data(connection, params, resultobj):
    url = connection.url
    url = url +'?'
    i = 0
    for  key in params:
        if (i>0): url += '&'
        url += key+'='+params[key]
        i+=1
    print("Making API call")
    time1 = time.time()
    response = requests.get(url)
    time2 = time.time()
    print("API Response: "+str(round((time2-time1),4))+" sec")
    json_data = response.json()
    if (resultobj):
        json_data = json_data[resultobj]
    data = pd.json_normalize(json_data)
    time1 = time.time()
    return data

def get_api_metadata(connection, params, resultobj):
    url = connection.url
    url = url +'?'
    i = 0
    print(params)
    for  param in params:
        if (i>0): url += '&'
        url += param['key']+'='+param['value']
        i+=1
    response = requests.get(url)
    json_data = response.json()
    if (resultobj):
        json_data = json_data[resultobj]
    data = pd.json_normalize(json_data)
    metadata = {}
    for i in range(len(data.columns)):
        metadata[data.columns[i]]=dataTypeMap[str(data.dtypes[i])]
    return metadata



def run_dataset(dataset, source_filters, **kwargs):
    verbose = kwargs.get('verbose', False)
    pending_steps = []
    for datasetNode in dataset.nodes:
        print(datasetNode)
        if datasetNode['nodeType'] == 'API Input':
            node = APIInput(datasetNode['id'],datasetNode['inputKeys'],datasetNode['outputKeys'],datasetNode['config'])
            node.setSourceFilters(source_filters)
        if datasetNode['nodeType'] == 'CSV Input':
            node = CSVInput(datasetNode['id'],datasetNode['inputKeys'],datasetNode['outputKeys'],datasetNode['config'])
        if datasetNode['nodeType'] == 'Append Node':
            node = AppendNode(datasetNode['id'],datasetNode['inputKeys'],datasetNode['outputKeys'],datasetNode['config'])
        if datasetNode['nodeType'] == 'Custom Node':
            node = CustomNode(datasetNode['id'],datasetNode['inputKeys'],datasetNode['outputKeys'],datasetNode['config'])
        if datasetNode['nodeType'] == 'Join Node':
            node = JoinNode(datasetNode['id'],datasetNode['inputKeys'],datasetNode['outputKeys'],datasetNode['config'])

        pending_steps.append(node)

    output_log = {
    }
    jobRunning = True
    start_time = time.time()
    while jobRunning:
        current_time = time.time()
        if int(current_time-start_time) > 30:
            output_log['status'] = 'TIMEOUT'
        if len(pending_steps)==0:
            jobRunning = False

        for step in pending_steps:
            if step.status == 'FAILED':
                output_log[step.key] = {'status': step.status, 'message': str(step.output),'duration':step.duration, 'type':type(step).__name__}    
                jobRunning = False
                break         
            if step.status == 'COMPLETED':
                result = step.output
                if verbose:
                    metadata = {}
                    node_preview =  result.head(15).to_json(orient="records")
                    node_preview = json.loads(node_preview)
                    for i in range(len(result.columns)):
                        metadata[result.columns[i]]=dataTypeMap[str(result.dtypes[i])]
                    output_log[step.key] = {'status': step.status, 'rows':result.shape[0], 'metadata':metadata, 'result':node_preview, 'duration':step.duration, 'type':type(step).__name__}
                keys = step.outputKeys
                if len(keys)==0:
                    jobRunning = False
                    break
                for key in keys:
                    for possible_out_step in pending_steps:
                        if possible_out_step.key == key:
                            possible_out_step.setInput(step.key,result)
                pending_steps.remove(step)

            if step.status == 'PENDING':
                if step.inputReqsMet():
                    step.run()      

            if step.status == 'RUNNING':
                continue
    if verbose:
        return result, output_log
    else:
        return result
class Node():
    def __init__(self, key, inputKeys,outputKeys, config):
        self.inputs = []
        self.output = []
        self.key = key
        self.inputKeys = inputKeys
        self.outputKeys = outputKeys
        self.config = config
        self.status = 'PENDING'
        self.duration = 0

    def setInput(self, key, value):
        self.inputs.append({'key':key, 'value':value})

    def inputReqsMet(self):
        if len(self.inputs) == len(self.inputKeys):
            return True
        else:
            return False
    def run(self):
        self.status = 'COMPLETED'  

class APIInput(Node):
        
    def setSourceFilters(self,source_filters):
        self.source_filters = source_filters

    def run(self):
        start_time = time.time()
        print("API Step {} RUNNING".format(self.key))
        try:
            api_connections = APIConnection.objects.filter(sourceid=self.config['value']) 
            api_connection = api_connections.first()
            data = get_api_data(api_connection, self.source_filters, api_connection.resultobject)

            self.output = data
            self.status = 'COMPLETED'  
        except Exception as e: 
            self.output =  e
            self.status = 'FAILED' 
        self.duration = time.time() - start_time

class CSVInput(Node):

    def run(self):
        start_time = time.time()
        print("CSV Step {} RUNNING".format(self.key))
        try:
            datas = DataSource.objects.filter(sourceid=self.config['value']) 
            dataobj = datas.first()
            data = pd.read_csv(os.path.join(settings.BASE_DIR, 'uploads/'+dataobj.name))
            print("CSV Step {} COMPLETED".format(self.key))
            self.output = data
            self.status = 'COMPLETED'  
        except Exception as e: 
            self.output =  e
            self.status = 'FAILED'   
        self.duration = time.time() - start_time

class CustomNode(Node):
    def run(self):
        start_time = time.time()
        print("CustomNode Step {} RUNNING".format(self.key))
        try:
            data = self.inputs[0]['value']
            exec(self.config)
            self.output = data
            self.status = 'COMPLETED'
        except Exception as e: 
            print("Append Step FAILED {}".format(e))
            self.output =  e
            self.status = 'FAILED' 
        self.duration = time.time() - start_time
class JoinNode(Node):
    def run(self):
        start_time = time.time()
        print("JOIN Step {} RUNNING".format(self.key))
        try:
            left = self.inputs[0]['value']
            right = self.inputs[1]['value']
            print(self.config['left'])
            print(self.config['right'])

            data = pd.merge(
                left,
                right,
                how="inner",
                left_on=self.config['left'], 
                right_on=self.config['right']
            )
            print("JOIN Step {} COMPLETED".format(self.key))

            self.output = data
            self.status = 'COMPLETED'  
        except Exception as e: 
            self.output =  e
            self.status = 'FAILED' 
        self.duration = time.time - start_time
class AppendNode(Node):
    def run(self):
        start_time = time.time()
        print("Append Step {} RUNNING".format(self.key))
        try:
            self.status = 'COMPLETED' 
            outDf = self.inputs[0]['value']
            appendDf = self.inputs[1]['value']
            outDf = outDf.append(appendDf, ignore_index=True)
            self.output = outDf
        except Exception as e: 
            print("Append Step FAILED {}".format(e))
            self.output =  e
            self.status = 'FAILED'  
        self.duration = time.time() - start_time
def runtimeFilters(data, runtimeFilterProperties):
    for runtimeFilter in runtimeFilterProperties:
        filter_values = runtimeFilter['values']
        if len(filter_values) > 0:
            data = data[data[runtimeFilter['column']].isin(filter_values)]
    return data

def cachedValues(data, runtimeFilterDefs):
    cachedValues = {}
    for filter in runtimeFilterDefs:
        cachedValues[filter] = list(data[filter].unique())
    return cachedValues


def smartAgg(data,properties):
    groupfields =[]
    numberfields = []
    usedfields = []
    aggs = {}
    for property in properties:
        if (properties[property]):
            print(properties[property])
            type = properties[property]['type']
            value = properties[property]['value']
            if 'Column' in type:
                for col in value:
                    agg = value[col]['agg']
                    usedfields.append(col)
                    prop_type = value[col]['type']
                    if (prop_type=='NUMERIC'):
                        numberfields.append(col)
                        aggs[col] = agg
                    else:
                        groupfields.append(col)

    if (len(usedfields)==0):
        return None

    data = data[usedfields]

    if (len(groupfields)==0 and 'ColumnList' in type):
        for i in range(len(data.columns)):
            if (str(data.dtypes[i]) == 'object'):
                groupfields.append(data.columns[i])

    if (len(groupfields)>0):
        if (len(aggs)>0):
            data = data.groupby(groupfields).agg(aggs).reset_index()
        else:
            data = data.groupby(groupfields).sum().reset_index() 
    return data

def get_data(sourceid, source_filters):
    datas = DataSource.objects.filter(sourceid=sourceid) 
    dataobj = datas.first()
    
    if (dataobj.type=='FILE'):
        data = pd.read_csv(os.path.join(settings.BASE_DIR, 'uploads/'+dataobj.name),delimiter=",")
    if (dataobj.type == 'API'):
        api_connections = APIConnection.objects.filter(sourceid=sourceid) 
        api_connection = api_connections.first()
        data = get_api_data(api_connection, source_filters, api_connection.resultobject)
    
    
    print("number of rows: "+str(data.shape[0]))
    
    return data    

