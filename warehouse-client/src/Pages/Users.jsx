import React, { useEffect, useState } from 'react';
import './Users.css';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <div className="users-page" style={{ padding: '2rem' }}>
      <h2>Users</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {users.length === 0 ? (
            <li>No users found.</li>
          ) : (
            users.map((user) => (
              <li key={user.userID} style={{ marginBottom: '1rem', background: '#fff', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: '1rem' }}>
                <strong>{user.firstName} {user.lastName}</strong><br />
                <span>{user.email}</span><br />
                {/* Do NOT display the password */}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
} 