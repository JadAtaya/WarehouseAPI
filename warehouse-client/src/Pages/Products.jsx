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
  const [imageFile, setImageFile] = useState(null); // <-- Add image file state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

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
          isDeleted: false,
        }),
      });
      if (!res.ok) {
        setError('Failed to add product.');
      } else {
        const data = await res.json();
        // Upload image if selected
        if (imageFile && data.productId) {
          const formData = new FormData();
          formData.append('image', imageFile);
          await fetch(`https://localhost:7020/api/Products/${data.productId}/upload-image`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
          });
        }
        setPName(''); setDescription(''); setQuantity(''); setPrice(''); setCompanyID(''); setCategoryID(''); setImageFile(null);
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
              {companies.filter(c => !c.isDeleted).map(c => <option key={c.companyID} value={c.companyID}>{c.company_Name}</option>)}
            </select>
          </label>
          <label>Category
            <select value={categoryID} onChange={e => setCategoryID(e.target.value)} required>
              <option value="" disabled>Select category</option>
              {categories.filter(cat => !cat.isDeleted).map(cat => <option key={cat.categoryID} value={cat.categoryID}>{cat.prod_CategoryName}</option>)}
            </select>
          </label>
          <label>Quantity<input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required min="0" onWheel={e => e.target.blur()} /></label>
          <label>Price<input type="number" value={price} onChange={e => setPrice(e.target.value)} required min="0" step="0.01" onWheel={e => e.target.blur()} /></label>
          <label>Image<input type="file" accept="image/*" onChange={handleFileChange} /></label>
          {imageFile && <div>Selected file: {imageFile.name}</div>}
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
  const [imageFile, setImageFile] = useState(null); // <-- Add image file state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setPName(product?.pName || '');
    setDescription(product?.description || '');
    setQuantity(product?.quantity || '');
    setPrice(product?.price || '');
    setCompanyID(product?.companyID || '');
    setCategoryID(product?.categoryID || '');
    setImageFile(null); // Reset image file on open/product change
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

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

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
        // Upload image if selected
        if (imageFile) {
          const formData = new FormData();
          formData.append('image', imageFile);
          await fetch(`https://localhost:7020/api/Products/${product.productId}/upload-image`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
          });
        }
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
              {companies.filter(c => !c.isDeleted).map(c => <option key={c.companyID} value={c.companyID}>{c.company_Name}</option>)}
            </select>
          </label>
          <label>Category
            <select value={categoryID} onChange={e => setCategoryID(e.target.value)} required>
              <option value="" disabled>Select category</option>
              {categories.filter(cat => !cat.isDeleted).map(cat => <option key={cat.categoryID} value={cat.categoryID}>{cat.prod_CategoryName}</option>)}
            </select>
          </label>
          <label>Quantity<input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required min="0" onWheel={e => e.target.blur()} /></label>
          <label>Price<input type="number" value={price} onChange={e => setPrice(e.target.value)} required min="0" step="0.01" onWheel={e => e.target.blur()} /></label>
          {/* Show current image if available */}
          {product.imagePath && !imageFile && (
            <div style={{ marginBottom: 8 }}>
              <div>Current Image:</div>
              <img
                src={`https://localhost:7020/${product.imagePath}`}
                alt={product.pName}
                style={{ width: '100%', maxHeight: 150, objectFit: 'contain', marginBottom: 8 }}
              />
            </div>
          )}
          <label>Change Image<input type="file" accept="image/*" onChange={handleFileChange} /></label>
          {imageFile && <div>Selected file: {imageFile.name}</div>}
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

  const filteredProducts = products
    .filter(product => !product.isDeleted)
    .filter(
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
      await fetch(`https://localhost:7020/api/Products/${product.productId}/isdeleted`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isDeleted: true }),
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
                    {/* Display product image if available */}
                    {product.imagePath && (
                      <img
                        src={`https://localhost:7020/${product.imagePath}`}
                        alt={product.pName}
                        className="product-image"
                        style={{ width: '100%', maxHeight: 150, objectFit: 'contain', marginBottom: 8 }}
                      />
                    )}
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
