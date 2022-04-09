import React, { useState, useEffect, setState } from 'react';

import Cookies from 'js-cookie'
function Data(props){
    const [userData, setUserData] = useState('')


    useEffect(() => {
        fetch('getUserData')
		.then(response => response.json())
		.then(data => setUserData(data))
    }, [])
    let datasets = []
    if (userData){
        for (const dataset of userData){
            let dset = <div className="reportRow">{dataset.name}</div>
            datasets.push(dset)
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
           fetch('uploadData', requestOptions)
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
    <div className="contentCol">
        <div className="leftHeader">Create A New Source</div>
        <div className="content">
            <div className="dataSourceContent">
                <div className="uploadFile">
                    <label htmlFor="csvFile" className="custom-file-upload">
                    Upload a CSV File
                    <input type="file" id="csvFile" onChange={csvFile} accept=".csv" />
                    </label>
                </div>
            </div>
            <div className="dataSourceContent">
                <div className="uploadFile">
                    <label htmlFor="csvFile" className="custom-file-upload disabled">
                    Connect to API
                    <input type="file" id="csvFile" onChange={csvFile} accept=".csv" />
                    </label> 
                </div>
            </div>
            <div className="dataSourceContent">
                <div className="uploadFile">
                    <label htmlFor="csvFile" className="custom-file-upload disabled">
                    SQL Query
                    <input type="file" id="csvFile" onChange={csvFile} accept=".csv" />
                    </label> 
                </div>
            </div>
        </div>
        <div className="contentCol">
            <div className="leftHeader">Data Sources</div>
            <div className="contentCol">
                <div className="paddedContent">
                {datasets}
                </div>
            </div>
        </div>
        </div>
      )
  
    

  }
  export default Data;