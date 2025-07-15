import React, { useEffect, useState } from 'react';
import './Category.css';

export default function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('https://localhost:7020/api/Product_Categories', { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) {
          setError('Failed to fetch categories.');
          setLoading(false);
          return;
        }
        const data = await res.json();
        setCategories(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch categories.');
        setLoading(false);
      });
  }, []);

  return (
    <div className="category-page" style={{ padding: '2rem' }}>
      <h2>Categories</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {categories.length === 0 ? (
            <li>No categories found.</li>
          ) : (
            categories.map((cat) => (
              <li key={cat.categoryID} style={{ marginBottom: '1rem', background: '#fff', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: '1rem' }}>
                <strong>{cat.prod_CategoryName}</strong><br />
                {/* Add more category fields as needed */}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
