import React, { useEffect, useState } from 'react';
import './Products.css';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('https://localhost:7020/api/Products', { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) {
          setError('Failed to fetch products.');
          setLoading(false);
          return;
        }
        const data = await res.json();
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch products.');
        setLoading(false);
      });
  }, []);

  return (
    <div className="products-page" style={{ padding: '2rem' }}>
      <h2>Products</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {products.length === 0 ? (
            <li>No products found.</li>
          ) : (
            products.map((product) => (
              <li key={product.id || product.productID} style={{ marginBottom: '1rem', background: '#fff', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: '1rem' }}>
                <strong>{product.name || product.productName}</strong><br />
                {product.description && <span>{product.description}</span>}
                {/* Add more product fields as needed */}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
