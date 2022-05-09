import React, { useState, useEffect, setState } from 'react';
import Editor from './Editor'
import Configuration from './Helpers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function TemplateList(props) {
    const {
        loadTemplate
    } = props
    const [templates, setTemplates] = useState('')

    useEffect(() => {
        fetch('get_templates')
        .then(response => response.text())
        .then(data => setTemplates(JSON.parse(data)))
      }, []);
    function selectTemplate(e){
        loadTemplate(e.target.getAttribute("uuid"))
    }
    var templateObj = []
    if (templates){
        for (var template of templates){
            templateObj.push(<div onClick={selectTemplate} className="datasetIcon" uuid={template[1]}>{template[0]}</div>)
        }
    }
    return (
    <div id="templateListContainerApp">
        {templateObj}
    </div>
    )

}



export default TemplateList;
