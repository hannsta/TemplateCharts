import React, { useState } from 'react'

export default function Configuration(props) {
    const {
        onSave
    } = props
    const [host, setHost] = useState(true)
    const [user, setUser] = useState(true)
    const [password, setPassword] = useState(true)

    return (
        <div className="config container">
            Username:
            <TextInput value={user} onChange={setUser}/>
            Password
            <TextInput value={password} onChange={setPassword}/>
            <div className="configSaveButton" onClick={onSave}>Save Configurations</div>
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