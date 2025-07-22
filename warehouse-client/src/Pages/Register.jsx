import React, { useState, useEffect } from 'react';
import './Register.css';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUserPlus, FaSignInAlt } from 'react-icons/fa';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('userEmail')) {
      navigate('/home', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent double submit
    setLoading(true);
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
        setMessage((data.message || 'Registration successful!') + ' Please check your email to verify your account before logging in.');
        // Do not auto-redirect to login; wait for user to verify
      } else {
        setError(data.message || 'Registration failed. Please check your details.');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigate('/login');
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
          <img src={process.env.PUBLIC_URL + "/warehouselogo.png"} alt="Warehouse Logo" className="login-logo" />
          <h2 className="login-title">Create Your Account</h2>
          <p className="login-tagline">Register to start managing your warehouse.</p>
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
            {message && <div className="success-message">{message}</div>}
            <button type="submit" className="login-button" disabled={loading}><FaUserPlus style={{marginRight: '0.5rem'}} />{loading ? 'Registering...' : 'Register'}</button>
          </form>
          <button className="register-button" onClick={handleLogin}>
            <FaSignInAlt style={{marginRight: '0.5rem'}} />Back to Login
          </button>
        </div>
      </div>
    </>
  );
}
