import React, { useState, useEffect, setState } from 'react';

function TemplateAppWidget(props) {
const {
  widgetId,
  templateId,
  datasourceSelect,
  templateSelect
} = props

useEffect(() => {
    console.log("effecting",widgetId)
    window.TemplateApp.Widget({
        host: "http://localhost:3000/",
        container: "#templateApp",
        templateId: templateId,
        widgetId:widgetId,
        datasourceSelect:datasourceSelect,
        templateSelect:templateSelect,
        role:'WRITE'
    })
  }, [])

return (
  <div id="templateApp">
  </div>
)
}
export default TemplateAppWidget;


