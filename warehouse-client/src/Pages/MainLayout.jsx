import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import './Home.css';
import { FaBoxOpen, FaTags, FaBuilding, FaUsers, FaHome, FaSignOutAlt } from 'react-icons/fa';

export default function MainLayout() {
  const [user, setUser] = useState({ firstName: '', lastName: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      setLoading(false);
      setError('User email not found. Please log in again.');
      return;
    }
    fetch(`https://the-warehouselb-dcemdma9gzgxd6bw.westeurope-01.azurewebsites.net/api/Users/GetSingleUser/${encodeURIComponent(userEmail)}`, {
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

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      // Add Login_History API call for logout
      const userID = localStorage.getItem('userID');
      const userEmail = localStorage.getItem('userEmail');
      if (userID && userEmail) {
        fetch('https://the-warehouselb-dcemdma9gzgxd6bw.westeurope-01.azurewebsites.net/api/Login_History', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userID: Number(userID),
            username: userEmail,
            loggedin_at: new Date().toISOString(),
            isActive: false
          }),
        }).catch(() => {});
      }
      localStorage.removeItem('userEmail');
      navigate('/login');
    }
  };

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
          <button onClick={() => navigate('/products')} className={location.pathname.startsWith('/products') ? 'active' : ''}><FaBoxOpen /> Products</button>
          <button onClick={() => navigate('/category')} className={location.pathname.startsWith('/category') ? 'active' : ''}><FaTags /> Categories</button>
          <button onClick={() => navigate('/companies')} className={location.pathname.startsWith('/companies') ? 'active' : ''}><FaBuilding /> Companies</button>
          <button onClick={() => navigate('/users')} className={location.pathname.startsWith('/users') ? 'active' : ''}><FaUsers /> Users</button>
        </div>
        <div className="sidebar-logo-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '8rem 0'}}>
          <img src={process.env.PUBLIC_URL + "/warehouselogo.png"} alt="Warehouse Logo" style={{ width: '200px', height: '200px', margin: '0 auto', marginLeft: '-8px' }} />
        </div>
        <div className="sidebar-bottom">
          <button className="return-home-button" onClick={() => navigate('/home')}>
            <FaHome style={{marginRight: '0.5rem'}} />Return Home
          </button>
          <button className="logout-button" onClick={handleLogout} style={{marginTop: '0.5rem'}}>
            <FaSignOutAlt style={{marginRight: '0.5rem'}} />Logout
          </button>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
} 