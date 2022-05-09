import React, { useState, useEffect, setState } from 'react';
import Cookies from 'js-cookie';

function APIConfig(props){
    const [connectionName, setConnectionName] = useState('')
    const [URL, setURL] = useState('')
    const [URLParameters, setURLParameters] = useState('')
    const [paramKey, setParamKey] = useState('')
    const [sourceId, setSourceId] = useState('')
    const [connectionId, setConnectionId] = useState('')
    const [resultObject,setResultObject] = useState('')
    const {
        selectedConnection,
        connName
    } = props


    useEffect(() => {
        if (selectedConnection){
            setConnectionName(connName)
            setURL(selectedConnection.url)
            setURLParameters(selectedConnection.parameters)
            setSourceId(selectedConnection.sourceid)
            setConnectionId(selectedConnection.connectionid)      
            setResultObject(selectedConnection.resultobject)      
        }
    }, [])
    function saveURLParameter(idx, type, value){
        var paramCopy = URLParameters
        console.log("paramUpdate",idx, type, value)
        if (type=='val'){
            paramCopy[idx].value = value
        }else{
            paramCopy[idx].key = value
        }
        setURLParameters(paramCopy)
    }
    function addParameter(){
        var paramCopy = URLParameters
        if (!paramCopy){
            paramCopy=[]
        }
        paramCopy.push({'idx':paramCopy.length,'key':'','value':''})
        setURLParameters(paramCopy)
        setParamKey(new Date())
    }
    function saveAPIConnection(){
        var csrftoken = Cookies.get('csrftoken');
        var body = JSON.stringify({
          'name':connectionName,
          'url':URL,
          'parameters': URLParameters,
          'sourceid':sourceId,
          'connectionid':connectionId,
          'resultobject':resultObject
        })
        fetch('save_connection', {
          method: 'POST',
          credentials: 'include',
          mode: 'same-origin',
          headers: {
            'Accept': 'application/json',
            'X-CSRFToken':csrftoken
          },
          body: body
        }).then(response => response.text())
        .then(data => {
            var resp = JSON.parse(data)
            setSourceId(resp.sourceid)
            setConnectionId(resp.connectionid)
        })
             
    }
    var urlParams = []
    for (var i=0; i < URLParameters.length; i++){
        var param = URLParameters[i]
        urlParams.push(
            <URLParameter saveURLParameter={saveURLParameter} idx={param.idx} defaultValue={param.value} defaultParam={param.key} />
        )
    }
    return(
        <div className="contentCol">
            <div className="leftHeader">Connection Name</div>
            <input className="connInputSmall" type="text" value={connectionName} onChange={e => setConnectionName(e.target.value)}></input>
            <div className="leftHeader">Endpoint URL</div>
            <input className="connInput" type="text" value={URL} onChange={e => setURL(e.target.value)}></input>
            <div className="leftHeader">Endpoint Parameters</div>
            <div onClick={addParameter}>Add Parameter</div>
            {urlParams}
            <div className="leftHeader">Advanced</div>
            <input className="connInputSmall" type="text" value={resultObject} onChange={e => setResultObject(e.target.value)}></input>
            
            <div className="saveButton" onClick={saveAPIConnection}>Save Connection</div>

        </div>
    )
  }

  function URLParameter(props){
    const [parameter, setParameter] = useState('')
    const [value, setValue] = useState('')
    const {
        saveURLParameter,
        idx,
        defaultValue,
        defaultParam
        
    } = props
    useEffect(() => {
        setValue(defaultValue)
        setParameter(defaultParam)
    }, [])
    function setParam(e){
        saveURLParameter(idx, 'param', e.target.value)
        setParameter(e.target.value)
    }
    function setVal(e){
        saveURLParameter(idx, 'val', e.target.value)
        setValue(e.target.value)
    }  
    return(
        <div>
            <input className="connInputSmall" type="text" value={parameter} onChange={setParam}></input>
            <input className="connInputSmall" type="text" value={value} onChange={setVal}></input>
        </div>
    )
  }  
  export default APIConfig;