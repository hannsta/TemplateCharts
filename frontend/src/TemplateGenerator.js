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
  fetch('get_template?templateid='+id+'&role=WRITE')
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
        <input type="text" value={templateName} onChange={saveTemplateName} />
      </div>  
        <div className="templateMenuOption" onClick={saveTemplate}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="-3 -3 24 24" width="24" fill="currentColor"><path d="M2 0h11.22a2 2 0 0 1 1.345.52l2.78 2.527A2 2 0 0 1 18 4.527V16a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm0 2v14h14V4.527L13.22 2H2zm4 8h6a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2zm0 2v4h6v-4H6zm7-9a1 1 0 0 1 1 1v3a1 1 0 0 1-2 0V4a1 1 0 0 1 1-1zM5 3h5a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm1 3h3V5H6v1z"></path></svg>
        </div>
        <div className="templateMenuOption" onClick={newTemplate}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="-4.5 -4.5 24 24" width="24" fill="currentColor"><path d="M8.9 6.9v-5a1 1 0 1 0-2 0v5h-5a1 1 0 1 0 0 2h5v5a1 1 0 1 0 2 0v-5h5a1 1 0 1 0 0-2h-5z"></path></svg>
        </div>
        </div>
        <TemplateList loadTemplate={loadTemplate} />
        <div className="templateEditorContainer">
          <div className="scriptTemplateEditor">
            <Editor
              language="javascript"
              displayName="Scripts"
              value={scripts}
              onChange={setScripts}  
            />
          </div>
          <div className="chartTemplateEditor">
            <Editor
              language="javascript"
              displayName="Chart Template"
              value={template}
              onChange={setTemplate}  
            />
          </div>
        </div>
      </div>
      <div className="widgetContainer">
          <TemplateAppWidget widgetId={undefined} templateId={templateId} datasourceSelect={true} key={templateId}></TemplateAppWidget>
      </div>
  </div>
)
}
export default TemplateGenerator;