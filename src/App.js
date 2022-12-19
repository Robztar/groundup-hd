import React from 'react';
import { Routes, Route} from "react-router-dom";

import Home from './Pages/Home';
import Edit from './Pages/Edit';
import About from './Pages/About';
import Dash from './Pages/Dash';

const App = ()=>(
  <Routes>
        <Route path="/" element={<Home />} />
        <Route path="edit" element={<Edit />} />
        <Route path="dash" element={<Dash />} />
        <Route path="about" element={<About />} />
  </Routes>
);

export default App;