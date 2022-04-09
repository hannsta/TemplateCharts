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


function loadWidget(){

}


return (
  <div id="templater">
      <WidgetList loadWidget={loadWidget} />
      <div className="renderContainer">
          <TemplateAppWidget widgetId={undefined} templateId={templateId} datasourceSelect={true} templateSelect={true} key={templateId}></TemplateAppWidget>
      </div>
  </div>
)
}
export default WidgetPage;