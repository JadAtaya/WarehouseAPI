import './App.css';
import Login from './Pages/Login.jsx';
import Register from './Pages/Register.jsx';
import Home from './Pages/Home.jsx';
import Products from './Pages/Products.jsx';
import Category from './Pages/Category.jsx';
import Companies from './Pages/Companies.jsx';
import Users from './Pages/Users.jsx';
import MainLayout from './Pages/MainLayout.jsx';
import ForgotPassword from './Pages/Forgot_password.jsx';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import React, { useEffect, useRef } from 'react';

function isAuthenticated() {
  return Boolean(localStorage.getItem('userEmail'));
}

function ProtectedRoute({ children }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children ? children : <Outlet />;
}

// Helper to decode JWT and get expiry
function getTokenExpiry(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null; // exp is in seconds, JS uses ms
  } catch {
    return null;
  }
}

function AutoLogoutManager() {
  const logoutTimerRef = useRef(null);
  const navigate = useNavigate();

  // Automatic logout function
  const autoLogout = React.useCallback(() => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userID');
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const setLogoutTimer = () => {
      const token = localStorage.getItem('jwtToken');
      if (token) {
        const expiry = getTokenExpiry(token);
        if (expiry) {
          const now = Date.now();
          if (expiry <= now) {
            autoLogout();
          } else {
            const timeout = expiry - now;
            logoutTimerRef.current = setTimeout(autoLogout, timeout);
          }
        }
      }
    };
    setLogoutTimer();
    // Listen for token changes (e.g., login, logout in other tabs)
    const onStorage = (e) => {
      if (e.key === 'jwtToken') {
        if (logoutTimerRef.current) {
          clearTimeout(logoutTimerRef.current);
          logoutTimerRef.current = null;
        }
        setLogoutTimer();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }
      window.removeEventListener('storage', onStorage);
    };
  }, [autoLogout]);

  return null;
}

function App() {
  return (
    <Router>
      <AutoLogoutManager />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot_password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/category" element={<Category />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/users" element={<Users />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
