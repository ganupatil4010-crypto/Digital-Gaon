import { useState, useEffect } from 'react';
import axios from 'axios';
// Stabilization: Restoring deployment integrity
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import OtpVerify from './components/OtpVerify';
import Dashboard from './components/Dashboard';

function App() {
  const [userEmail, setUserEmail] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setIsAuthenticated(false);
    setUserEmail(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedEmail = localStorage.getItem('userEmail');
    if (token) {
      setIsAuthenticated(true);
    }
    if (savedEmail) {
      setUserEmail(savedEmail);
    }

    // Set up global axios interceptor for 401 Unauthorized
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          console.warn('Session expired or unauthorized. Logging out...');
          handleLogout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const handleGoogleLogin = (email) => {
    setUserEmail(email);
  };

  const handleVerifySuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" />
              ) : userEmail ? (
                <div className="bg-blobs auth-container">
                  <OtpVerify email={userEmail} onVerifySuccess={handleVerifySuccess} />
                </div>
              ) : (
                <div className="bg-blobs auth-container">
                  <Login onGoogleLogin={handleGoogleLogin} />
                </div>
              )
            } 
          />
          <Route 
            path="/login" 
            element={<Navigate to="/" />} 
          />
          <Route 
            path="/admin" 
            element={<Navigate to="/dashboard" />} 
          />
          <Route 
            path="/admin-panel" 
            element={<Navigate to="/dashboard" />} 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? (
                <Dashboard onLogout={handleLogout} userEmail={userEmail} />
              ) : (
                <Navigate to="/" />
              )
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
