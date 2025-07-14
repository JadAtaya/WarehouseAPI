import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        // Store user email in localStorage for later use
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

  return (
    <>
      {/* Set your background image in CSS for .login-bg-image */}
      <div className="login-bg-image"></div>
      <div className="login-bg-decor">
        <div className="bg-circle bg-circle1"></div>
        <div className="bg-circle bg-circle2"></div>
        <div className="bg-circle bg-circle3"></div>
        <div className="bg-line"></div>
        <div className="bg-line2"></div>
      </div>
      <div className="login-container">
        <div className="login-card">
          <h2 className="login-title">Login</h2>
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
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            {!error && message && <div className="success-message">{message}</div>}
            <button type="submit" className="login-button">Login</button>
          </form>
          <button className="register-button" onClick={handleRegister}>
            Register
          </button>
        </div>
      </div>
    </>
  );
}
