import React, { useEffect, useState } from 'react';
import './Users.css';

function getInitials(firstName, lastName) {
  return `${(firstName?.[0] || '').toUpperCase()}${(lastName?.[0] || '').toUpperCase()}`;
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('https://localhost:7020/api/Users', { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) {
          setError('Failed to fetch users.');
          setLoading(false);
          return;
        }
        const data = await res.json();
        setUsers(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch users.');
        setLoading(false);
      });
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="users-page users-bg-gradient">
      <div className="users-header-alt">
        <div>
          <h2>Users</h2>
          <div className="users-subtitle">Browse and search all registered users in your warehouse system.</div>
        </div>
      </div>
      <div className="users-search-bar-alt">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {loading && <p className="users-loading">Loading...</p>}
      {error && <p className="users-error">{error}</p>}
      {!loading && !error && (
        <div className="users-grid-alt">
          {filteredUsers.length === 0 ? (
            <div className="users-empty-alt">
              <span style={{fontSize: '3rem', display: 'block', marginBottom: '0.7rem'}}>🔍</span>
              <div>No users found.<br/>Try a different search or invite new users!</div>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div className="user-card-alt" key={user.userID}>
                <div className="user-card-top-border"></div>
                <div className="user-avatar-circle">
                  {getInitials(user.firstName, user.lastName)}
                </div>
                <div className="user-card-content-alt">
                  <span className="user-name-alt">{user.firstName} {user.lastName}</span>
                  <span className="user-email-alt">{user.email}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
} 