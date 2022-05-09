import pandas as pd
import requests
import time

dataTypeMap = {'object':'TEXT',
            'int64':'NUMERIC',
            'float64':'NUMERIC',
            }

def get_datamap():
    return dataTypeMap;


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

