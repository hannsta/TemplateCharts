import React, { useState, useEffect, setState } from 'react';
import Editor from './Editor'
import Configuration from './Helpers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Codepen() {

const [html, setHtml] = useState('')



const YELLOWFIN_URL="http://localhost:8080"



return (
  <div id="container">

  </div>
)
}



function TextInput(props) {
  const {
      value,
      onChange
  } = props

  function handleChange(e) {
      onChange(e.target.value);
  }
  return (
      <div >
          <input type="text" value={value} onChange={handleChange}></input>
      </div>
  )

}
function TextInput(props) {
  const {
      value,
      onChange
  } = props

  function handleChange(e) {
      onChange(e.target.value);
  }
  return (
      <div >
          <input type="text" value={value} onChange={handleChange}></input>
      </div>
  )

}
export default Codepen;
