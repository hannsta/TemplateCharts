import React, { useState, useEffect, setState } from 'react';
import Editor from './Editor'
import Configuration from './Helpers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function WidgetList(props) {
    const {
        loadWidget
    } = props
    const [widgets, setWidgets] = useState('')

    useEffect(() => {
        fetch('get_widgets')
        .then(response => response.text())
        .then(data => setWidgets(JSON.parse(data)))
      }, []);
    function selectWidget(e){
        loadWidget(e.target.getAttribute("uuid"))
    }
    var widgetObj = []
    if (widgets){
        for (var widget of widgets){
            widgetObj.push(<div onClick={selectWidget} 
                className="widgetIcon" 
                uuid={widget[1]}>{widget[0]}</div>)
        }
    }
    return (
    <div id="widgetList">
        {widgetObj}
    </div>
    )
}



export default WidgetList;
