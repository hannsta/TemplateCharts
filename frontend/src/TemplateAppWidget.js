import React, { useState, useEffect, setState } from 'react';
import Select from 'react-select'
import Editor from './Editor'
import Configuration from './Helpers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons'
import { ToastContainer, toast } from 'react-toastify';

function TemplateAppWidget(props) {
const {
  widgetId,
  templateId,
  datasourceSelect,
  templateSelect
} = props

useEffect(() => {
    window.TemplateApp.Widget({
        host: "http://localhost:3000/",
        container: "#templateApp",
        templateId: templateId,
        widgetId:widgetId,
        datasourceSelect:datasourceSelect,
        templateSelect:templateSelect
    })
  }, [])

return (
  <div id="templateApp">
  </div>
)
}
export default TemplateAppWidget;


