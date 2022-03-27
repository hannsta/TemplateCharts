import React, { useState, useEffect, setState } from 'react';
import Editor from './Editor'
import MenuRenderer from './MenuRenderer'
import Cookies from 'js-cookie';
import Configuration from './Helpers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function TemplateGenerator() {

const [template, setTemplate] = useState('')
const [scripts, setScripts] = useState('')
const [templateName, setTemplateName] = useState('')
const [parsedTemplate, setParsedTemplate] = useState('')
const [properties, setProperties] = useState('')
const [time, setTime] = useState('')



function parseTemplate(){
  var csrftoken = Cookies.get('csrftoken');
  var body = JSON.stringify({'properties':properties,'script':template})
  fetch('parse_options', {
    method: 'POST',
    credentials: 'include',
    mode: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'X-CSRFToken':csrftoken
    },
    body: body
  }).then(response => response.text())
  .then(data => setParsedTemplate(JSON.parse(data)))

}
function saveTemplate(){
  var csrftoken = Cookies.get('csrftoken');
  var body = JSON.stringify({
    'scripts':scripts,
    'template':template,
    'templateName': templateName
  })
  fetch('parse_options', {
    method: 'POST',
    credentials: 'include',
    mode: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'X-CSRFToken':csrftoken
    },
    body: body
  }).then(response => response.text())
  .then(console.log("template Saved"))

}
function runTemplate(){
  var csrftoken = Cookies.get('csrftoken');
  var body = JSON.stringify({'properties':properties,'script':template})
  fetch('get_script',{
    method: 'POST',
    credentials: 'include',
    mode: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'X-CSRFToken':csrftoken
    },
    body:body
  })
  .then(response => response.text())
  .then(txt => {
    var scriptURLs = scripts.split(/\r?\n/);
    for (var scriptURL of scriptURLs){
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.onload = function(){
      };
      script.src = scriptURL;
      document.getElementsByTagName('head')[0].appendChild(script);
    }
    eval(txt)
  })
}
function saveProperties(property, value){
  var propertyCopy = properties
  if (!propertyCopy){
    propertyCopy={}
  }
  propertyCopy[property] = value;
  setProperties(propertyCopy);

}
return (
  <div id="templater">
      <div className="templateContainer"> 
        <div className="parseButton" onClick={parseTemplate}>
          Parse Template
        </div>
        <div className="parseButton" onClick={saveTemplate}>
          Save Template
        </div>
        <Editor
          language="javascript"
          displayName="Scripts"
          value={scripts}
          onChange={setScripts}  
        />
        <Editor
          language="javascript"
          displayName="Chart Template"
          value={template}
          onChange={setTemplate}  
        />-
      </div>
      <div className="optionsContainer">
        <div className="parseButton" onClick={runTemplate}>
          Run JS
        </div>
        <MenuRenderer parsedTemplate={parsedTemplate} properties={properties} saveProperties={saveProperties}/>      
      </div>
      <div className="renderContainer">
        <div id="container" ></div>
      </div>

  </div>
)
}
export default TemplateGenerator;