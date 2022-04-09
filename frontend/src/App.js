import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Switch,
  Route,
  Link,
  
} from "react-router-dom";

import TemplateGenerator from './TemplateGenerator';
import WidgetPage from './WidgetPage'
import {LoginPage, RegisterPage} from './Login'
import Data from './Data'
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
    <div id="appBody">
      <Router>
        <div id="leftNav">
          <div className="leftNavLink">
            <img src="/icons/plus.svg"></img>
            <Link to="/widgets">Widgets</Link>
          </div>
          <div className="leftNavLink">
            <img src="/icons/bar-chart.svg"></img>
            <Link to="/templates">Templates</Link>
          </div>
          <div className="leftNavLink">
            <img src="/icons/database.svg"></img>
            <Link to="/datasources">Datasources</Link>
          </div>
          <div className="leftNavLink">
            <img src="/icons/user-plus.svg"></img>
            <Link to="/login">Login</Link>
          </div>
          <div className="leftNavLink">
            <img src="/icons/user-circle.svg"></img>
            <Link to="/register">Register</Link>
          </div>
        </div>
        <Routes>
          <Route path="/widgets" element={<WidgetPage />} />
          <Route path="/templates" element={<TemplateGenerator />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/datasources" element={<Data />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
