import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter, Routes, Route } from "react-router";
import reportWebVitals from './reportWebVitals';
import Semester from './pages/Semester';
import Subject from './pages/Subject';
import Note from './pages/Note';
import Result from './pages/Result';
import Home from './pages/Home';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
<BrowserRouter>
<Routes>
  <Route path="/" element={<Semester/>} />
  <Route path='/sub' element={<Subject/>}/>
  <Route path='/main' element={<App/>}/>
  <Route path='/note' element={<Note/>}/>
  <Route path='/result' element={<Result/>}/>
  <Route path='/home' element={<Home/>}/>
</Routes>
</BrowserRouter>
);
reportWebVitals();
