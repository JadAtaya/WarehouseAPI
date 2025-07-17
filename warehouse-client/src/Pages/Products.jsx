import React, { useEffect, useState } from 'react';
import './Products.css';
import { FaEdit, FaTrash } from 'react-icons/fa';

const PRODUCTS_PER_PAGE = 9;

function AddProductModal({ open, onClose, onAdd, companies, categories }) {
  const [pName, setPName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [companyID, setCompanyID] = useState('');
  const [categoryID, setCategoryID] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('https://localhost:7020/api/Products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          pName,
          description,
          companyID: Number(companyID),
          categoryID: Number(categoryID),
          quantity: Number(quantity),
          price: Number(price),
        }),
      });
      if (!res.ok) {
        setError('Failed to add product.');
      } else {
        setPName(''); setDescription(''); setQuantity(''); setPrice(''); setCompanyID(''); setCategoryID('');
        onAdd();
        onClose();
      }
    } catch {
      setError('Failed to add product.');
    }
    setLoading(false);
  };

  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Add Product</h3>
        <form onSubmit={handleSubmit} className="product-form">
          <label>Name<input value={pName} onChange={e => setPName(e.target.value)} required /></label>
          <label>Description<input value={description} onChange={e => setDescription(e.target.value)} /></label>
          <label>Company
            <select value={companyID} onChange={e => setCompanyID(e.target.value)} required>
              <option value="" disabled>Select company</option>
              {companies.map(c => <option key={c.companyID} value={c.companyID}>{c.company_Name}</option>)}
            </select>
          </label>
          <label>Category
            <select value={categoryID} onChange={e => setCategoryID(e.target.value)} required>
              <option value="" disabled>Select category</option>
              {categories.map(cat => <option key={cat.categoryID} value={cat.categoryID}>{cat.prod_CategoryName}</option>)}
            </select>
          </label>
          <label>Quantity<input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required min="0" /></label>
          <label>Price<input type="number" value={price} onChange={e => setPrice(e.target.value)} required min="0" step="0.01" /></label>
          {error && <div className="form-error">{error}</div>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditProductModal({ open, onClose, onEdit, product, companies, categories }) {
  console.log('EditProductModal', { open, product });
  // Always call hooks first
  const [pName, setPName] = useState(product?.pName || '');
  const [description, setDescription] = useState(product?.description || '');
  const [quantity, setQuantity] = useState(product?.quantity || '');
  const [price, setPrice] = useState(product?.price || '');
  const [companyID, setCompanyID] = useState(product?.companyID || '');
  const [categoryID, setCategoryID] = useState(product?.categoryID || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setPName(product?.pName || '');
    setDescription(product?.description || '');
    setQuantity(product?.quantity || '');
    setPrice(product?.price || '');
    setCompanyID(product?.companyID || '');
    setCategoryID(product?.categoryID || '');
  }, [product, open]);

  if (!open) return null;
  if (!product || !product.productId) {
    console.error('EditProductModal: Invalid product object:', product);
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Edit Product</h3>
          <div className="form-error">Error: Product ID is missing. Cannot edit this product.</div>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`https://localhost:7020/api/Products/${product.productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          pName,
          description,
          companyID: Number(companyID),
          categoryID: Number(categoryID),
          quantity: Number(quantity),
          price: Number(price),
        }),
      });
      if (!res.ok) {
        setError('Failed to update product.');
      } else {
        onEdit();
        onClose();
      }
    } catch {
      setError('Failed to update product.');
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Edit Product</h3>
        <form onSubmit={handleSubmit} className="product-form">
          <label>Name<input value={pName} onChange={e => setPName(e.target.value)} required /></label>
          <label>Description<input value={description} onChange={e => setDescription(e.target.value)} /></label>
          <label>Company
            <select value={companyID} onChange={e => setCompanyID(e.target.value)} required>
              <option value="" disabled>Select company</option>
              {companies.map(c => <option key={c.companyID} value={c.companyID}>{c.company_Name}</option>)}
            </select>
          </label>
          <label>Category
            <select value={categoryID} onChange={e => setCategoryID(e.target.value)} required>
              <option value="" disabled>Select category</option>
              {categories.map(cat => <option key={cat.categoryID} value={cat.categoryID}>{cat.prod_CategoryName}</option>)}
            </select>
          </label>
          <label>Quantity<input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required min="0" /></label>
          <label>Price<input type="number" value={price} onChange={e => setPrice(e.target.value)} required min="0" step="0.01" /></label>
          {error && <div className="form-error">{error}</div>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);

  const fetchProducts = () => {
    setLoading(true);
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
  };

  useEffect(() => {
    fetchProducts();
    fetch('https://localhost:7020/api/Companies', { credentials: 'include' })
      .then(async (res) => {
        if (res.ok) setCompanies(await res.json());
      });
    fetch('https://localhost:7020/api/Product_Categories', { credentials: 'include' })
      .then(async (res) => {
        if (res.ok) setCategories(await res.json());
      });
    // eslint-disable-next-line
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      product.pName?.toLowerCase().includes(search.toLowerCase()) ||
      product.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE) || 1;
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * PRODUCTS_PER_PAGE,
    page * PRODUCTS_PER_PAGE
  );

  // Reset to page 1 if search changes
  React.useEffect(() => {
    setPage(1);
  }, [search]);

  const handleDelete = async (product) => {
    if (!window.confirm(`Are you sure you want to delete '${product.pName}'?`)) return;
    try {
      await fetch(`https://localhost:7020/api/Products/${product.productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      fetchProducts();
    } catch {
      alert('Failed to delete product.');
    }
  };

  return (
    <div className="products-page">
      <AddProductModal open={showAdd} onClose={() => setShowAdd(false)} onAdd={fetchProducts} companies={companies} categories={categories} />
      <EditProductModal open={showEdit} onClose={() => setShowEdit(false)} onEdit={fetchProducts} product={editProduct} companies={companies} categories={categories} />
      <div className="products-header">
        <div>
          <h2><strong>Products</strong></h2>
          <div className="products-subtitle">Browse, search, and manage all products in your warehouse inventory.</div>
        </div>
        <button className="add-product-btn" onClick={() => setShowAdd(true)}>+ Add Product</button>
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
        <>
          <div className="products-grid">
            {paginatedProducts.length === 0 ? (
              <div className="products-empty">No products found.</div>
            ) : (
              paginatedProducts.map((product) => (
                <div className="product-card" key={product.productId}>
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
                    <div className="product-card-actions">
                      <button
                        className="edit-btn"
                        onClick={() => {
                          console.log('Edit clicked:', product);
                          if (product.productId != null) {
                            setEditProduct(product);
                            setShowEdit(true);
                          }
                        }}
                      >
                        <FaEdit style={{marginRight: '0.3rem'}} />Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(product)}><FaTrash style={{marginRight: '0.3rem'}} />Delete</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {totalPages > 1 && (
            <div className="products-pagination">
              <button onClick={() => setPage(page - 1)} disabled={page === 1}>&lt;</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={page === i + 1 ? 'active-page' : ''}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>&gt;</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
