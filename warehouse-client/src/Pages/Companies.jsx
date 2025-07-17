import React, { useEffect, useState } from 'react';
import './Companies.css';
import { FaEdit, FaTrash } from 'react-icons/fa';

function AddCompanyModal({ open, onClose, onAdd }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('https://localhost:7020/api/Companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ company_Name: name }),
      });
      if (!res.ok) {
        setError('Failed to add company.');
      } else {
        setName('');
        onAdd();
        onClose();
      }
    } catch {
      setError('Failed to add company.');
    }
    setLoading(false);
  };

  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Add Company</h3>
        <form onSubmit={handleSubmit} className="company-form">
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

function EditCompanyModal({ open, onClose, onEdit, company }) {
  const [name, setName] = useState(company?.company_Name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(company?.company_Name || '');
  }, [company, open]);

  if (!open) return null;
  if (!company || !company.companyID) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Edit Company</h3>
          <div className="form-error">Error: Company ID is missing. Cannot edit this company.</div>
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
      const res = await fetch(`https://localhost:7020/api/Companies/${company.companyID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ company_Name: name }),
      });
      if (!res.ok) {
        setError('Failed to update company.');
      } else {
        onEdit();
        onClose();
      }
    } catch {
      setError('Failed to update company.');
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Edit Company</h3>
        <form onSubmit={handleSubmit} className="company-form">
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

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editCompany, setEditCompany] = useState(null);

  const fetchCompanies = () => {
    setLoading(true);
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
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter(
    (company) =>
      company.company_Name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (company) => {
    if (!window.confirm(`Are you sure you want to delete '${company.company_Name}'?`)) return;
    try {
      await fetch(`https://localhost:7020/api/Companies/${company.companyID}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      fetchCompanies();
    } catch {
      alert('Failed to delete company.');
    }
  };

  return (
    <div className="companies-page">
      <AddCompanyModal open={showAdd} onClose={() => setShowAdd(false)} onAdd={fetchCompanies} />
      <EditCompanyModal open={showEdit} onClose={() => setShowEdit(false)} onEdit={fetchCompanies} company={editCompany} />
      <div className="companies-header">
        <div>
          <h2><strong>Companies</strong></h2>
          <div className="companies-subtitle">View and manage all companies associated with your warehouse products.</div>
        </div>
        <button className="add-company-btn" onClick={() => setShowAdd(true)}>+ Add Company</button>
      </div>
      <div className="companies-search-bar">
        <input
          type="text"
          placeholder="Search companies..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {loading && <p className="companies-loading">Loading...</p>}
      {error && <p className="companies-error">{error}</p>}
      {!loading && !error && (
        <div className="companies-grid">
          {filteredCompanies.length === 0 ? (
            <div className="companies-empty">No companies found.</div>
          ) : (
            filteredCompanies.map((company) => (
              <div className="company-card" key={company.companyID}>
                <div className="company-card-content">
                  <span className="company-name">{company.company_Name}</span>
                  <div className="company-card-actions">
                    <button className="edit-btn" onClick={() => { setEditCompany(company); setShowEdit(true); }}><FaEdit style={{marginRight: '0.3rem'}} />Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(company)}><FaTrash style={{marginRight: '0.3rem'}} />Delete</button>
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