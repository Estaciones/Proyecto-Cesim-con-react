// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardProvider } from './context/DashboardProvider';
import Login from './components/Login';
import Dashboard from './components/dashboard/Dashboard';
import Register from './components/Register'; // si tienes
import './App.css';

function App() {
  return (
    <DashboardProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/" element={<Login />} /> {/* redirige a login por defecto */}
        </Routes>
      </BrowserRouter>
    </DashboardProvider>
  );
}

export default App;