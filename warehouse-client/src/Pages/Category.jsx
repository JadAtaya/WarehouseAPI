import React, { useEffect, useState } from 'react';
import './Category.css';
import { FaEdit, FaTrash } from 'react-icons/fa';

function AddCategoryModal({ open, onClose, onAdd }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('https://localhost:7020/api/Product_Categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ prod_CategoryName: name }),
      });
      if (!res.ok) {
        setError('Failed to add category.');
      } else {
        setName('');
        onAdd();
        onClose();
      }
    } catch {
      setError('Failed to add category.');
    }
    setLoading(false);
  };

  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Add Category</h3>
        <form onSubmit={handleSubmit} className="category-form">
          <label>Name<input value={name} onChange={e => setName(e.target.value)} required /></label>
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

function EditCategoryModal({ open, onClose, onEdit, category }) {
  const [name, setName] = useState(category?.prod_CategoryName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(category?.prod_CategoryName || '');
  }, [category, open]);

  if (!open) return null;
  if (!category || !category.categoryID) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Edit Category</h3>
          <div className="form-error">Error: Category ID is missing. Cannot edit this category.</div>
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
      const res = await fetch(`https://localhost:7020/api/Product_Categories/${category.categoryID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ prod_CategoryName: name }),
      });
      if (!res.ok) {
        setError('Failed to update category.');
      } else {
        onEdit();
        onClose();
      }
    } catch {
      setError('Failed to update category.');
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Edit Category</h3>
        <form onSubmit={handleSubmit} className="category-form">
          <label>Name<input value={name} onChange={e => setName(e.target.value)} required /></label>
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

export default function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editCategory, setEditCategory] = useState(null);

  const fetchCategories = () => {
    setLoading(true);
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
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(
    (cat) =>
      cat.prod_CategoryName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (category) => {
    if (!window.confirm(`Are you sure you want to delete '${category.prod_CategoryName}'?`)) return;
    try {
      await fetch(`https://localhost:7020/api/Product_Categories/${category.categoryID}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      fetchCategories();
    } catch {
      alert('Failed to delete category.');
    }
  };

  return (
    <div className="category-page">
      <AddCategoryModal open={showAdd} onClose={() => setShowAdd(false)} onAdd={fetchCategories} />
      <EditCategoryModal open={showEdit} onClose={() => setShowEdit(false)} onEdit={fetchCategories} category={editCategory} />
      <div className="category-header">
        <h2><strong>Categories</strong></h2>
        <button className="add-category-btn" onClick={() => setShowAdd(true)}>+ Add Category</button>
      </div>
      <div className="category-search-bar">
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {loading && <p className="category-loading">Loading...</p>}
      {error && <p className="category-error">{error}</p>}
      {!loading && !error && (
        <div className="category-grid">
          {filteredCategories.length === 0 ? (
            <div className="category-empty">No categories found.</div>
          ) : (
            filteredCategories.map((cat) => (
              <div className="category-card" key={cat.categoryID}>
                <div className="category-card-content">
                  <span className="category-name">{cat.prod_CategoryName}</span>
                  <div className="category-card-actions">
                    <button className="edit-btn" onClick={() => { setEditCategory(cat); setShowEdit(true); }}><FaEdit style={{marginRight: '0.3rem'}} />Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(cat)}><FaTrash style={{marginRight: '0.3rem'}} />Delete</button>
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
