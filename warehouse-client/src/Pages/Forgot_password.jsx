import React, { useState, useEffect } from 'react';
import './Forgot_password.css';
import { useNavigate } from 'react-router-dom';
import { FaSignInAlt, FaKey } from 'react-icons/fa';

export default function Forgot_password() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('forgot-bg-active');
    return () => {
      document.body.classList.remove('forgot-bg-active');
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      const response = await fetch('https://localhost:7020/api/Users/ForgotPassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        setMessage('Email Sent !');
        setError('');
      } else {
        setMessage('');
        setError('Please enter a valid email address');
      }
    } catch (err) {
      setMessage('');
      setError('There was an error. Please try again.');
    }
    setLoading(false);
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="forgot-bg-container">
      <div className="login-card enhanced">
        <img src="/warehouselogo.png" alt="Warehouse Logo" className="login-logo" />
        <h2 className="login-title">Forgot Password?</h2>
        <p className="login-tagline">Enter your email and we'll send you a new password.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          {!error && message && <div className="success-message">{message}</div>}
          <button type="submit" className="login-button" disabled={loading}>
            <FaKey style={{marginRight: '0.5rem'}} />{loading ? 'Sending...' : 'Send New Password'}
          </button>
        </form>
        <button className="register-button" type="button" onClick={handleBackToLogin}>
          <FaSignInAlt style={{marginRight: '0.5rem'}} />Back to Login
        </button>
      </div>
    </div>
  );
}
