import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Switch,
  Route,
  Link,
  
} from "react-router-dom";

import TemplateGenerator from './TemplateGenerator';
import {LoginPage, RegisterPage} from './Login'
import logo from './logo.svg';
import './App.css';
import Cookies from 'js-cookie';

function App() {
  var csrftoken = Cookies.get('csrftoken');
  if (!csrftoken){
    fetch('csrf')
    .then(function(){
      console.log("got CSRF")
    })
  }
  return(

    <Router>
      <Link to="/">Home</Link>
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
      <Routes>
        <Route path="/" element={<TemplateGenerator />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
}

export default App;
