import React from 'react';
// React Routing
import ReactDOM from 'react-dom';
import { BrowserRouter } from "react-router-dom";

// Styling accross app
import './css/gen/style.css';
import './css/about/about.css';
import './css/dash/dash.css';
import './css/edit/edit.css';
import './css/obj/obj.css';

import App from './App';

import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root')
);

reportWebVitals();