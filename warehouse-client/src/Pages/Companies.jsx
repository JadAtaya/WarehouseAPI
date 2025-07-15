import React, { useEffect, useState } from 'react';
import './Companies.css';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('https://localhost:7020/api/Companies', { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) {
          setError('Failed to fetch companies.');
          setLoading(false);
          return;
        }
        const data = await res.json();
        setCompanies(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch companies.');
        setLoading(false);
      });
  }, []);

  return (
    <div className="companies-page" style={{ padding: '2rem' }}>
      <h2>Companies</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {companies.length === 0 ? (
            <li>No companies found.</li>
          ) : (
            companies.map((company) => (
              <li key={company.companyID} style={{ marginBottom: '1rem', background: '#fff', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: '1rem' }}>
                <strong>{company.company_Name}</strong><br />
                {/* Add more company fields as needed */}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
} 