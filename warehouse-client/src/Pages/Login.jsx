import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaSignInAlt, FaUserPlus, FaKey } from 'react-icons/fa';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await fetch('https://localhost:7020/api/Users/Login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      let data = null;
      try {
        data = await response.json();
      } catch (e) {
        const text = await response.text();
        data = { message: text, response: response.ok };
      }

      if (response.ok) {
        setError('');
        setMessage(data.message || 'Logged in!');
        if (data.email) {
          localStorage.setItem('userEmail', data.email);
        } else {
          localStorage.setItem('userEmail', email);
        }
        setTimeout(() => {
          navigate('/home');
        }, 1000);
      } else {
        setMessage('');
        setError(data.message || 'Invalid email or password.');
      }
    } catch (err) {
      setMessage('');
      setError('Something went wrong. Please try again.');
    }
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const handleForgotPassword = () => {
    navigate('/Forgot_password');
  };

  return (
    <>
      <div className="login-bg-image"></div>
      <div className="login-bg-decor">
        <div className="bg-circle bg-circle1"></div>
        <div className="bg-circle bg-circle2"></div>
        <div className="bg-circle bg-circle3"></div>
        <div className="bg-line"></div>
        <div className="bg-line2"></div>
      </div>
      <div className="login-container">
        <div className="login-card enhanced">
          <img src="/warehouselogo.png" alt="Warehouse Logo" className="login-logo" />
          <h2 className="login-title">Welcome Back!</h2>
          <p className="login-tagline">Sign in to manage your warehouse with ease.</p>
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
            <div className="form-group">
              <label>Password</label>
              <div className="input-icon-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            {error && <div className="error-message">{error}</div>}
            {!error && message && <div className="success-message">{message}</div>}
            <button type="submit" className="login-button"><FaSignInAlt style={{marginRight: '0.5rem'}} />Login</button>
          </form>
          <button className="register-button" onClick={handleRegister}>
            <FaUserPlus style={{marginRight: '0.5rem'}} />Register
          </button>
          <button className="forgot-password-button" type="button" onClick={handleForgotPassword}>
            <FaKey style={{marginRight: '0.5rem'}} />Forgot Password ?
          </button>
        </div>
      </div>
    </>
  );
}
