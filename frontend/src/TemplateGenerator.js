import React, { useState, useEffect, setState } from 'react';
import Editor from './Editor'
import MenuRenderer from './MenuRenderer'
import Cookies from 'js-cookie';
import Configuration from './Helpers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TemplateList from './TemplateList';
import WidgetList from './WidgetList';
import TemplateAppWidget from './TemplateAppWidget'
function TemplateGenerator() {

const [template, setTemplate] = useState('')
const [scripts, setScripts] = useState('')
const [templateName, setTemplateName] = useState('')
const [templateId, setTemplateId] = useState('')
const [properties, setProperties] = useState('')




function saveTemplate(){
  var csrftoken = Cookies.get('csrftoken');
  var body = JSON.stringify({
    'scripts':scripts,
    'template':template,
    'templateName': templateName,
    'templateId':templateId,
  })
  fetch('save_template', {
    method: 'POST',
    credentials: 'include',
    mode: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'X-CSRFToken':csrftoken
    },
    body: body
  }).then(response => response.text())
  .then(data => setTemplateId(data))

}
function newTemplate(){
  setTemplate(undefined)
  setScripts(undefined)
  setTemplateId(undefined)
  setTemplateName(undefined)
}
function loadTemplate(id){
  fetch('get_template?templateid='+id)
  .then(response => response.text())
  .then(data => {
    var templateData = JSON.parse(data)
    setTemplate(templateData[0].fields.template)
    setScripts(templateData[0].fields.scripts)
    setTemplateId(templateData[0].fields.templateid)
    setTemplateName(templateData[0].fields.name)
  })
}

function saveTemplateName(e){
  setTemplateName(e.target.value);
}


return (
  <div id="templater">
    
      <div className="templateContainer"> 
      <div className="templateMenuOptions">
      <div className="templateMenuOption">
        <input type="text" value={templateName} onChange={saveTemplateName} />'
      </div>  
        <div className="templateMenuOption" onClick={saveTemplate}>
        <img src="/icons/save.svg"></img>
        </div>
        <div className="templateMenuOption" onClick={newTemplate}>
        <img src="/icons/plus.svg"></img>
        </div>
        </div>
        <TemplateList loadTemplate={loadTemplate} />
        <Editor
          language="javascript"
          displayName="Scripts"
          value={scripts}
          onChange={setScripts}  
        />
        <Editor
          classanem="chartTemplateEditor"
          language="javascript"
          displayName="Chart Template"
          value={template}
          onChange={setTemplate}  
        />
      </div>
      <div className="renderContainer">
          <TemplateAppWidget widgetId={undefined} templateId={templateId} datasourceSelect={true} key={templateId}></TemplateAppWidget>
      </div>
  </div>
)
}
export default TemplateGenerator;