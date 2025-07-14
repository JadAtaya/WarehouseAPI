import React, { useState } from 'react';
import './Register.css';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await fetch('https://localhost:7020/api/Users/Register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      let data = null;
      try {
        data = await response.json();
      } catch (e) {
        const text = await response.text();
        data = { message: text, response: response.ok };
      }

      if (response.ok) {
        setMessage(data.message || 'Registration successful!');
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      } else {
        setError(data.message || 'Registration failed. Please check your details.');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    }
  };

  const handleLogin = () => {
    navigate('/login');
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
          <h2 className="login-title">Register</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                placeholder="Enter your first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                placeholder="Enter your last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
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
            {message && <div className="success-message">{message}</div>}
            <button type="submit" className="login-button">Register</button>
          </form>
          <button className="register-button" onClick={handleLogin}>
            Back to Login
          </button>
        </div>
      </div>
    </>
  );
}
