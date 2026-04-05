import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VehicleRegistration from './pages/VehicleRegistration';
import RTODashboard from './pages/RTODashboard';
import Profile from './pages/Profile';
import LicenseApplication from './pages/LicenseApplication';
import SecurePayment from './pages/SecurePayment';
import Services from './pages/Services';
import IssueReport from './pages/IssueReport';
import MockTest from './pages/MockTest';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register-vehicle" element={<VehicleRegistration />} />
        <Route path="/rto-dashboard" element={<RTODashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/apply-license" element={<LicenseApplication />} />
        <Route path="/payment" element={<SecurePayment />} />
        <Route path="/services" element={<Services />} />
        <Route path="/report-issue" element={<IssueReport />} />
        <Route path="/mock-test" element={<MockTest />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <Router>
      <Navbar />
      <div className="main-content">
        <AnimatedRoutes />
      </div>
    </Router>
  );
};

export default App;
