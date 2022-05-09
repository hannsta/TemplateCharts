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
          <div className="logoSpace"></div>
          <div className="leftNavLink">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="-4.5 -4.5 24 24" width="24" fill="currentColor"><path d="M8.9 6.9v-5a1 1 0 1 0-2 0v5h-5a1 1 0 1 0 0 2h5v5a1 1 0 1 0 2 0v-5h5a1 1 0 1 0 0-2h-5z"></path></svg>
            <Link to="/widgets">Widgets</Link>
          </div>
          <div className="leftNavLink">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -4 24 24" width="24" fill="currentColor"><path d="M1 0a1 1 0 0 1 1 1v14a1 1 0 0 1-2 0V1a1 1 0 0 1 1-1zm12 4a1 1 0 0 1 1 1v10a1 1 0 0 1-2 0V5a1 1 0 0 1 1-1zM7 8a1 1 0 0 1 1 1v6a1 1 0 0 1-2 0V9a1 1 0 0 1 1-1z"></path></svg>
            <Link to="/templates">Templates</Link>
          </div>
          <div className="leftNavLink">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 24 24" width="24" fill="currentColor"><path d="M3 12a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H3zm0-2a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3 3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3v-4a3 3 0 0 1 3-3zm0-8a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H3zm2 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm3 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm0 10a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-3 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"></path></svg>            
            <Link to="/datasources">Datasources</Link>
          </div>
          <div className="leftNavLink">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 24 24" width="24" fill="currentColor"><path d="M3.534 10.07a1 1 0 1 1 .733 1.86A3.579 3.579 0 0 0 2 15.26V17a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1.647a3.658 3.658 0 0 0-2.356-3.419 1 1 0 1 1 .712-1.868A5.658 5.658 0 0 1 14 15.353V17a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3v-1.74a5.579 5.579 0 0 1 3.534-5.19zM7 0a4 4 0 0 1 4 4v2a4 4 0 1 1-8 0V4a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v2a2 2 0 1 0 4 0V4a2 2 0 0 0-2-2zm10 3h2a1 1 0 0 1 0 2h-2v2a1 1 0 0 1-2 0V7h-2a1 1 0 0 1 0-2h2V3a1 1 0 0 1 2 0v2z"></path></svg>
            <Link to="/login">Login</Link>
          </div>
          <div className="leftNavLink">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 24 24" width="24" fill="currentColor"><path d="M10 20C4.477 20 0 15.523 0 10S4.477 0 10 0s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0-14a4 4 0 0 1 4 4v2a4 4 0 1 1-8 0V8a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v2a2 2 0 1 0 4 0V8a2 2 0 0 0-2-2zM5.91 16.876a8.033 8.033 0 0 1-1.58-1.232 5.57 5.57 0 0 1 2.204-1.574 1 1 0 1 1 .733 1.86c-.532.21-.993.538-1.358.946zm8.144.022a3.652 3.652 0 0 0-1.41-.964 1 1 0 1 1 .712-1.868 5.65 5.65 0 0 1 2.284 1.607 8.032 8.032 0 0 1-1.586 1.225z"></path></svg>
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
