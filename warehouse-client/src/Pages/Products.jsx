import React, { useEffect, useState } from 'react';
import './Products.css';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

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

  const filteredProducts = products.filter(
    (product) =>
      product.pName?.toLowerCase().includes(search.toLowerCase()) ||
      product.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="products-page">
      <div className="products-header">
        <h2>Products</h2>
        <button className="add-product-btn" disabled title="Coming soon">+ Add Product</button>
      </div>
      <div className="products-search-bar">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {loading && <p className="products-loading">Loading...</p>}
      {error && <p className="products-error">{error}</p>}
      {!loading && !error && (
        <div className="products-grid">
          {filteredProducts.length === 0 ? (
            <div className="products-empty">No products found.</div>
          ) : (
            filteredProducts.map((product) => (
              <div className="product-card" key={product.id || product.productID}>
                <div className="product-card-content">
                  <div className="product-card-title-row">
                    <span className="product-card-name">{product.pName}</span>
                  </div>
                  {product.description && <div className="product-card-description">{product.description}</div>}
                  <div className="product-info-row">
                    <span className="product-label">Quantity:</span>
                    <span className="product-value">{product.quantity}</span>
                  </div>
                  <div className="product-info-row">
                    <span className="product-label">Price:</span>
                    <span className="product-value">${product.price}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
