import React, { useEffect, useState, useRef } from 'react';
import './Users.css';

function getInitials(firstName, lastName) {
  return `${(firstName?.[0] || '').toUpperCase()}${(lastName?.[0] || '').toUpperCase()}`;
}

// Helper to get logged-in user ID from localStorage or cookie (adjust as needed)
function getLoggedInUserId() {
  // Example: from localStorage
  return localStorage.getItem('userID');
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [pfpFile, setPfpFile] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef();

  const loggedInUserId = getLoggedInUserId();

  const fetchUsers = () => {
    setLoading(true);
    fetch('https://the-warehouselb-dcemdma9gzgxd6bw.westeurope-01.azurewebsites.net/api/Users', { credentials: 'include' })
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
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Clean up preview URL when file changes or component unmounts
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const filteredUsers = users.filter(
    user => !user.isDeleted &&
      (`${user.firstName} ${user.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()))
  );

  const handlePfpChange = (e, userID) => {
    const file = e.target.files[0];
    setPfpFile(file);
    setUploadingId(userID);
    setUploadError('');
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handlePfpUpload = async (userID) => {
    if (!pfpFile) return;
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('image', pfpFile);
      const res = await fetch(`https://the-warehouselb-dcemdma9gzgxd6bw.westeurope-01.azurewebsites.net/api/Users/${userID}/upload-image`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!res.ok) {
        setUploadError('Failed to upload image.');
      } else {
        setPfpFile(null);
        setUploadingId(null);
        setPreviewUrl(null);
        fetchUsers();
      }
    } catch {
      setUploadError('Failed to upload image.');
    }
  };

  const handleAvatarClick = (isCurrentUser) => {
    if (isCurrentUser && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

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
            filteredUsers.map((user) => {
              const isCurrentUser = String(user.userID) === String(loggedInUserId);
              return (
                <div className="user-card-alt" key={user.userID}>
                  <div className="user-card-top-border"></div>
                  <div
                    className={`user-avatar-circle${isCurrentUser ? ' user-avatar-editable' : ''}`}
                    onClick={() => handleAvatarClick(isCurrentUser)}
                    title={isCurrentUser ? 'Click avatar to change photo' : ''}
                    style={{ cursor: isCurrentUser ? 'pointer' : 'default', position: 'relative' }}
                  >
                    {isCurrentUser && previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', border: '2px solid #4a90e2' }}
                      />
                    ) : isCurrentUser && user.imagePath ? (
                      <img
                        src={`https://the-warehouselb-dcemdma9gzgxd6bw.westeurope-01.azurewebsites.net/${user.imagePath}`}
                        alt={user.firstName + ' ' + user.lastName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                      />
                    ) : (
                      getInitials(user.firstName, user.lastName)
                    )}
                    {isCurrentUser && (
                      <span style={{
                        position: 'absolute',
                        bottom: 2,
                        right: 2,
                        background: '#fff',
                        borderRadius: '50%',
                        padding: 2,
                        fontSize: 12,
                        color: '#4a90e2',
                        border: '1px solid #4a90e2',
                        zIndex: 2
                      }}>✎</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={isCurrentUser ? fileInputRef : null}
                    style={{ display: 'none' }}
                    onChange={e => handlePfpChange(e, user.userID)}
                  />
                  <div className="user-card-content-alt">
                    <span className="user-name-alt">{user.firstName} {user.lastName}</span>
                    <span className="user-email-alt">{user.email}</span>
                  </div>
                  {/* Only allow editing pfp for the logged-in user */}
                  {isCurrentUser && (
                    <div style={{ marginTop: 10, textAlign: 'center' }}>
                      {pfpFile && (
                        <>
                          <button
                            onClick={() => handlePfpUpload(user.userID)}
                            disabled={!pfpFile || uploadingId !== user.userID}
                            style={{ marginBottom: 4, background: '#4a90e2', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', cursor: 'pointer' }}
                          >
                            {uploadingId === user.userID ? 'Uploading...' : 'Upload Photo'}
                          </button>
                          <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Preview above</div>
                        </>
                      )}
                      <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                        Click avatar to change photo
                      </div>
                      {uploadError && <div className="form-error" style={{ marginTop: 4 }}>{uploadError}</div>}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
} 