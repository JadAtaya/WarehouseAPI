import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import './Home.css';

export default function MainLayout() {
  const [user, setUser] = useState({ firstName: '', lastName: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      setLoading(false);
      setError('User email not found. Please log in again.');
      return;
    }
    fetch(`https://localhost:7020/api/Users/GetSingleUser/${encodeURIComponent(userEmail)}`, {
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            setError('You are not authorized. Please log in again.');
          } else if (res.status === 404) {
            setError('User not found.');
          } else {
            setError('An error occurred while fetching user info.');
          }
          setLoading(false);
          return;
        }
        const data = await res.json();
        setUser({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
        });
        setLoading(false);
      })
      .catch(() => {
        setError('An error occurred while fetching user info.');
        setLoading(false);
      });
  }, []);

  return (
    <div className="main-layout">
      <nav className="sidebar-nav">
        <div className="sidebar-user-info">
          <div className="home-user-pfp">
            {/* Replace the SVG below with any SVG file for a custom profile picture */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="16" fill="#cbd5e1" />
              <ellipse cx="16" cy="13" rx="6" ry="6" fill="#fff" />
              <ellipse cx="16" cy="25" rx="10" ry="6" fill="#fff" />
            </svg>
          </div>
          <div className="home-user-details">
            <span className="home-user-welcome">Welcome,<br /></span>
            <span className="home-user-name">
              {loading
                ? 'Loading...'
                : error
                ? error
                : `${user.firstName} ${user.lastName}`}
            </span>
          </div>
        </div>
        <div className="sidebar-nav-buttons">
          <button onClick={() => navigate('/products')}>Products</button>
          <button onClick={() => navigate('/category')}>Categories</button>
          <button onClick={() => navigate('/companies')}>Companies</button>
          <button onClick={() => navigate('/users')}>Users</button>
        </div>
        <div className="sidebar-bottom">
          <button className="return-home-button" onClick={() => navigate('/home')}>
            Return Home
          </button>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
} 