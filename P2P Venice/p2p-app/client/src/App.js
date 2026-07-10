import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Registration from './pages/Registration';
import PassengerDetails from './pages/PassengerDetails';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import DriverLogin from './pages/DriverLogin';

function App() {
  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="nav-logo">P2P Venice</h1>
          <div className="nav-links">
            <Link to="/">Registration</Link>
            <Link to="/driver-login">Driver Login</Link>
            <Link to="/admin">Admin</Link>
          </div>
        </div>
      </nav>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Registration />} />
          <Route path="/driver-login" element={<DriverLogin />} />
          <Route path="/passengers/:teamId" element={<PassengerDetails />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
