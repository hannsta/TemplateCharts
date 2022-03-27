import React, { useState, useEffect, setState } from 'react';
import Editor from './Editor'
import Configuration from './Helpers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function MenuRenderer(props) {
const {
    parsedTemplate,
    properties,
    saveProperties
} = props
const [html, setHtml] = useState('')
const [menuOptions, setMenuOptions] = useState('')

if (!properties){
    var propertyCopy = {}
    for (var userInput of parsedTemplate){
        if (userInput.type=='String'){
            propertyCopy[userInput.name]=''
        }
    }  
    saveProperties(propertyCopy)    
}

var inputMenu = []
for (var userInput of parsedTemplate){
    if (userInput.type=='String'){
        inputMenu.push(<TextInput value={properties[userInput.name]} inputName={userInput.name} saveProperties={saveProperties}/>)
    }
}

return (
  <div id="inputMenu">
      {inputMenu}
  </div>
)
}


function TextInput(props) {
  const {
      value,
      inputName,
      saveProperties
  } = props

  function handleChange(e) {
    saveProperties(inputName, e.target.value)
  }
  return (
      <div>
          <div>{inputName}</div>
          <input type="text" value={value} onChange={handleChange}></input>
      </div>
  )

}
export default MenuRenderer;
