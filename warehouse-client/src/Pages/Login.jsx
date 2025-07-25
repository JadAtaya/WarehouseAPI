import React, { useState, useEffect, /* useRef */ } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaSignInAlt, FaUserPlus, FaKey } from 'react-icons/fa';

// Helper for authenticated fetch requests
export function authFetch(url, options = {}) {
  const token = localStorage.getItem('jwtToken');
  const headers = {
    ...options.headers,
    'Authorization': token ? `Bearer ${token}` : undefined,
    'Content-Type': 'application/json',
  };
  return fetch(url, { ...options, headers });
}

// Helper to decode JWT and get expiry
/*
function getTokenExpiry(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null; // exp is in seconds, JS uses ms
  } catch {
    return null;
  }
}
*/

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('userEmail')) {
      navigate('/home', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await fetch('https://the-warehouselb-dcemdma9gzgxd6bw.westeurope-01.azurewebsites.net/api/Users/Login', {
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
        // Check if user is verified (assuming API returns isVerified or similar)
        if (data.isVerified === false || (typeof data.message === 'string' && data.message.toLowerCase().includes('not verified'))) {
          setError('Your account is not verified. A new verification email will be sent to you.');
          setMessage('');
          setResending(true);
          // Send verification email
          fetch('https://the-warehouselb-dcemdma9gzgxd6bw.westeurope-01.azurewebsites.net/api/Users/SendVerificationLink', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          })
            .then(async (res) => {
              let msg = 'A new verification email has been sent.';
              try {
                const data = await res.json();
                if (data.message) msg = data.message;
              } catch {}
              setMessage(msg);
            })
            .catch(() => {
              setMessage('Failed to send verification email. Please try again later.');
            })
            .finally(() => setResending(false));
          return;
        }
        setError('');
        setMessage(data.message || 'Logged in!');
        if (data.email) {
          localStorage.setItem('userEmail', data.email);
        } else {
          localStorage.setItem('userEmail', email);
        }
        // Store JWT token if present
        if (data.token) {
          localStorage.setItem('jwtToken', data.token);
        }
        // Store userID in localStorage for pfp editing
        console.log('Login API response:', data);
        if (data.user && typeof data.user.userID !== 'undefined') {
          console.log('Setting userID:', data.user.userID);
          localStorage.setItem('userID', String(data.user.userID));
          const userID = data.user.userID;
          const username = data.email || email;
          // 1. Check for existing active session
          try {
            const historyRes = await fetch('https://the-warehouselb-dcemdma9gzgxd6bw.westeurope-01.azurewebsites.net/api/Login_History');
            if (historyRes.ok) {
              const history = await historyRes.json();
              const activeSession = Array.isArray(history)
                ? history.find(h => h.userID === userID && h.isActive)
                : null;
              if (activeSession) {
                // 2. Close the previous session
                await fetch('https://the-warehouselb-dcemdma9gzgxd6bw.westeurope-01.azurewebsites.net/api/Login_History', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userID,
                    username,
                    loggedin_at: new Date().toISOString(),
                    isActive: false
                  }),
                });
              }
            }
          } catch (e) {
            // Optionally handle error
            console.error('Failed to check/close previous login session', e);
          }
          // 3. Create the new active session
          try {
            await fetch('https://the-warehouselb-dcemdma9gzgxd6bw.westeurope-01.azurewebsites.net/api/Login_History', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userID,
                username,
                loggedin_at: new Date().toISOString(),
                isActive: true
              }),
            });
          } catch (e) {
            // Optionally handle error (fire-and-forget)
            console.error('Failed to log login history', e);
          }
        } else {
          console.log('userID not found in response');
        }
        setTimeout(() => {
          console.log('Navigating to /home and reloading');
          navigate('/home');
          setTimeout(() => { window.location.reload(); }, 100); // Ensure reload after navigation
        }, 1000);
      } else {
        fetch('https://the-warehouselb-dcemdma9gzgxd6bw.westeurope-01.azurewebsites.net/api/Users/CheckEmailVerified', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
          .then(async (res) => {
            let checkData = null;
            try {
              checkData = await res.json();
            } catch {
              setMessage('');
              setError(data.message || 'Invalid email or password.');
              return;
            }
            if (checkData && checkData.isVerified === false) {
              setError('Your account is not verified. A new verification email will be sent to you.');
              setMessage('');
              setResending(true);
              // Send verification email
              fetch('https://the-warehouselb-dcemdma9gzgxd6bw.westeurope-01.azurewebsites.net/api/Users/SendVerificationLink', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
              })
                .then(async (res) => {
                  let msg = 'A new verification email has been sent.';
                  try {
                    const data = await res.json();
                    if (data.message) msg = data.message;
                  } catch {}
                  setMessage(msg);
                })
                .catch(() => {
                  setMessage('Failed to send verification email. Please try again later.');
                })
                .finally(() => setResending(false));
            } else {
              setMessage('');
              setError(data.message || 'Invalid email or password.');
            }
          })
          .catch(() => {
            setMessage('');
            setError(data.message || 'Invalid email or password.');
          });
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
          <img src={process.env.PUBLIC_URL + "/warehouselogo.png"} alt="Warehouse Logo" className="login-logo" />
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
            <button type="submit" className="login-button" disabled={resending}><FaSignInAlt style={{marginRight: '0.5rem'}} />Login</button>
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
