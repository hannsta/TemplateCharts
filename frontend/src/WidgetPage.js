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
function WidgetPage() {

const [template, setTemplate] = useState('')
const [scripts, setScripts] = useState('')
const [templateName, setTemplateName] = useState('')
const [templateId, setTemplateId] = useState('')
const [properties, setProperties] = useState('')
const [widgetId, setWidgetId] = useState('')


function loadWidget(uuid){
  fetch('get_widget?widgetid='+uuid+'&role=WRITE')
  .then(response => response.json())
  .then(data => {
    setWidgetId(data.widgetid)
  })
}


return (
  <div id="templater">
      <div className="renderContainer">
          <TemplateAppWidget widgetId={widgetId} templateId={templateId} datasourceSelect={true} templateSelect={true} key={widgetId}></TemplateAppWidget>
      </div>
      <WidgetList loadWidget={loadWidget} />

  </div>
)
}
export default WidgetPage;