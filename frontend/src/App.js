import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Switch,
  Route,
  Link
} from "react-router-dom";

import Codepen from './Codepen';
import logo from './logo.svg';
import './App.css';

function App() {
  return(
    <Router>
    <Routes>
      <Route path="/" element={<Codepen />} />
    </Routes>
  </Router>

  );
}

export default App;
