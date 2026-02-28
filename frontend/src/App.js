import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Account from './pages/Account';

// Placeholder private-route guard — replace with real auth context later
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/signup"   element={<Signup />} />
        <Route
          path="/dashboard"
          element={<PrivateRoute><Dashboard /></PrivateRoute>}
        />
        <Route
          path="/account"
          element={<PrivateRoute><Account /></PrivateRoute>}
        />
        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
