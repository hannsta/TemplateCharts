import Cookies from 'js-cookie'
import React, { useState, useEffect, setState } from 'react';

function LoginPage(){

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    function loginUser(){
      var csrftoken = Cookies.get('csrftoken');
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json','X-CSRFToken': csrftoken },
        body: JSON.stringify({user: username, password: password})
      };
      fetch('loginUser', requestOptions)
          .then(response => {
            if (response.ok){
              console.log("success!!")
              this.props.loginEvent();
            }else{
              console.log("failed")
            }
          })
    }
    function changeUsername(e){
        setUsername(e.target.value)
    }
    function changePassword(e){
        setPassword(e.target.value)
    }
    if (!username){
        setUsername('username')
        setPassword('password')
    }
    return(
        <div className="content loginContent">
            <div className="section loginSection">
            <div className="leftHeader">Login User</div>
            <div className="paddedContent">
                <div className="col desc">Username</div>
                <div className="col">
                <input type="text" value={username} onChange={changeUsername}></input>
                </div>
                <div className="col desc">Password</div>
                <div className="col">
                <input type="text" value={password} onChange={changePassword}></input>
                </div>
                <div className="col"><div className="saveButtonSmall" id="titleSave" onClick={loginUser}>Login</div></div>
            </div>
            </div>
        </div>
    )
  

  }
  function RegisterPage(){
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    function createUser(){
      var csrftoken = Cookies.get('csrftoken');

      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json','X-CSRFToken': csrftoken },
        body: JSON.stringify({user: username, password: password})
      };
      fetch('addUser', requestOptions)
          .then(response => response.json())
          .then(data => console.log(data));     
    }
    function changeUsername(e){
        setUsername(e.target.value)
    }
    function changePassword(e){
        setPassword(e.target.value)
    }
    if (!username){
        setUsername('')
        setPassword('')
    }
      return(
        <div className="content loginContent">
            <div className="section loginSection">
              <div className="leftHeader">Create User</div>
              <div className="paddedContent">
                <div className="col desc">Username</div>
                <div className="col">
                <input type="text" value={username} onChange={changeUsername}></input>
                </div>
                <div className="col desc">Password</div>
                <div className="col">
                <input type="text" value={password} onChange={changePassword}></input>
                </div>
                <div className="col"><div className="saveButtonSmall" id="titleSave" onClick={createUser}>Create</div></div>
              </div>
            </div>
          </div>
      )
  
    
  }
  export  {LoginPage,RegisterPage};