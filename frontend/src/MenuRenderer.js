import React, { useState, useEffect, setState } from 'react';
import Select from 'react-select'
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
    saveProperties,
    metaData
} = props
const [html, setHtml] = useState('')
const [menuOptions, setMenuOptions] = useState('')

console.log(properties,parsedTemplate)
var inputMenu = []
for (var userInput of parsedTemplate){
    if (!userInput.name) continue;
    inputMenu.push(<Title inputName={userInput.name}/>)
    if (userInput.type=='String'){
        inputMenu.push(<TextInput value={properties[userInput.name].value} inputName={userInput.name} type={userInput.type} saveProperties={saveProperties} />)
    }
    if (userInput.type=='CategoryColumn'){
        const options = []
        for (var key of Object.keys(metaData)){
            if (metaData[key]=='TEXT'){
                options.push({value:key,label:key})
            }
        }
        inputMenu.push(<SingleSelect options={options} inputName={userInput.name} type={userInput.type} saveProperties={saveProperties} />)
    }
    if (userInput.type=='ValueColumn'){
        const options = []
        for (var key of Object.keys(metaData)){
            if (metaData[key]=='NUMERIC'){
                options.push({value:key,label:key})
            }
        }
        inputMenu.push(<SingleSelect options={options} inputName={userInput.name} type={userInput.type} saveProperties={saveProperties} />)

    }
}
return (
  <div id="inputMenu">
      {inputMenu}
  </div>
)
}

function SingleSelect(props){
    const {
        options,
        inputName,
        type,
        saveProperties
    } = props    
    function handleChange(selectedOption) {
        saveProperties(inputName, type, selectedOption.value)
    }
    return(
        <Select options={options} onChange={handleChange} /> 
    )
}
function TextInput(props) {
  const {
      value,
      inputName,
      type,
      saveProperties
  } = props

  function handleChange(e) {
    saveProperties(inputName, type, e.target.value)
  }
  return (
      <div>
          <input type="text" defaultValue={value} onChange={handleChange}></input>
      </div>
  )

}

function Title(props){
    const {
        inputName,
    } = props
    return (
    <div>{inputName}</div>
    )
}

export default MenuRenderer;
