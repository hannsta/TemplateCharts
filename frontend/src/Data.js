import React, { useState, useEffect, setState } from 'react';
import APIConfig from './APIConfig'

import Cookies from 'js-cookie'
function Data(props){
    const [userData, setUserData] = useState('')
    const [selectedOption, setSelectedOption] = useState('')
    const [selectedConnection, setSelectedConnection] = useState('')
    const [selectedName, setSelectedName] = useState('')

    useEffect(() => {
        fetch('get_user_data')
		.then(response => response.json())
		.then(data => setUserData(data))
    }, [])
    let datasets = []
    if (userData){
        for (const dataset of userData){
            let dset = <Datasource dataset={dataset} selectDataset={selectDataset}/>
            datasets.push(dset)
        }
    }
    function selectDataset(sourceid){
        for (var data of userData){
            if (data.sourceid == sourceid){
                if (data.type == 'API'){
                    setSelectedName(data.name)
                    fetch('get_connection?sourceid='+sourceid)
                    .then(response => response.json())
                    .then(respdata => {
                        setSelectedConnection(respdata[0].fields)
                        setSelectedOption('API')
                    })
                }
            }
        }
    }
    function csvFile(e) {
        e.preventDefault();
        const input = document.getElementById("csvFile").files[0];
        var fileName = document.getElementById("csvFile").value.split('/').pop().split('\\').pop();
        const reader = new FileReader();
        const delimiter = ",";
        reader.onload = function (e) {
           let rawCSV = e.target.result;
           var csrftoken = Cookies.get('csrftoken');
           const requestOptions = {
             method: 'POST',
             headers: { 'Content-Type': 'application/json','X-CSRFToken': csrftoken },
             body: JSON.stringify({name:fileName, data: rawCSV})
           };
           fetch('upload_data', requestOptions)
               .then(response => {
                 if (response.ok){
                   console.log("success!!")
                 }else{
                   console.log("failed")
                 }
               })            
        }
        reader.readAsText(input);
      };
    return(
        <div className="datasetPage">
            <div className="datasetMenu">        
                <div className="leftHeader">Create A New Source</div>
                <div className="newSourceContainer">
                    <div className="newSource" onClick={e => setSelectedOption('FILE')}>
                        <label htmlFor="csvFile" className="custom-file-upload">
                        Upload a CSV File
                        </label>
                    </div>
                    <div className="newSource" onClick={e => setSelectedOption('API')}>
                        <label htmlFor="csvFile" className="custom-file-upload disabled">
                        Connect to API
                        </label> 
                    </div>
                    <div className="newSource" onClick={e => setSelectedOption('FILE')}>
                        <label htmlFor="csvFile" className="custom-file-upload disabled">
                        SQL Query
                        </label> 
                    </div>
                </div>
                <div className="contentCol">
                    <div className="leftHeader">Data Sources</div>
                    <div className="contentCol">
                        <div className="datasetList">
                        {datasets}
                        </div>
                    </div>
                </div>
            </div>
            <div className="dataSourceConfigContainer">
                {selectedOption == 'FILE' && (
                    <input type="file" id="csvFile" onChange={csvFile} accept=".csv" />
                )}
                {selectedOption == 'API' && (
                    <APIConfig connName={selectedName} selectedConnection={selectedConnection} />
                )}
            </div>
        </div>
      )
  
    

  }
  export default Data;

  function Datasource(props){
    const {
        dataset,
        selectDataset
    } = props;
    function getDataSet(e){
        console.log(e.target)
        selectDataset(e.target.getAttribute("uuid"))
    }
    return(
        <div className="datasetContainer" uuid={dataset.sourceid} onClick={getDataSet}>
            <div className="datasetName"  uuid={dataset.sourceid}>
                {dataset.name}
            </div>
            <div className="datasetType" uuid={dataset.sourceid}>
                {dataset.type}
            </div>
        </div>

    )
  }