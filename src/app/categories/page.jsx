'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { apiFetch, getImageUrl } from '@/lib/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formName, setFormName] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const res = await apiFetch('/categories');
    if (res.success) setCategories(res.categories || []);
    if (showLoading) setLoading(false);
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormName('');
    setFormImage('');
    setFormDesc('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormImage(cat.image);
    setFormDesc(cat.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formName) return;
    setSubmitting(true);

    const payload = { 
      name: formName, 
      image: formImage || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=400&q=80', 
      description: formDesc 
    };

    const previousCategories = [...categories];
    if (editingCategory) {
      setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, ...payload } : c));
    } else {
      const tempCategory = { id: 'temp_' + Date.now(), ...payload };
      setCategories([tempCategory, ...categories]);
    }
    setIsModalOpen(false);

    let res;
    if (editingCategory) {
      res = await apiFetch(`/categories/${editingCategory.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
    } else {
      res = await apiFetch('/categories', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }

    setSubmitting(false);

    if (res.success) {
      fetchCategories(false);
    } else {
      alert(res.message || 'Operation failed. Rolling back changes...');
      setCategories(previousCategories);
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    const previousCategories = [...categories];
    setCategories(categories.filter(c => c.id !== id));

    const res = await apiFetch(`/categories/${id}`, { method: 'DELETE' });
    
    if (res.success) {
      fetchCategories(false);
    } else {
      alert(res.message || 'Delete failed. Rolling back changes...');
      setCategories(previousCategories);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-body)' }}>
      <Sidebar />
      <Navbar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '600' }}>Categories Management</h1>
        </div>

        <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '16px 24px', borderBottom: '1px solid var(--border-color)' }}>
            <button className="btn-primary" style={{ height: '36px' }} onClick={openAddModal}>
              <Plus size={16} /> Add new category
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ width: '80px', padding: '12px 24px' }}>Image</th>
                  <th>Category Name</th>
                  <th>Description</th>
                  <th style={{ width: '160px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Loading categories...</td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>No categories found.</td>
                  </tr>
                ) : (
                  categories.map(cat => (
                    <tr key={cat.id}>
                      <td style={{ padding: '12px 24px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '6px', background: '#f5f5f5', overflow: 'hidden' }}>
                          <img src={getImageUrl(cat.image)} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '500', color: '#1f2937', fontSize: '15px' }}>{cat.name}</div>
                      </td>
                      <td style={{ color: '#6b7280' }}>
                        {cat.description || '-'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                          <button onClick={() => openEditModal(cat)} style={{ background: 'none', border: 'none', color: '#1677ff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Edit size={14} /> Edit
                          </button>
                          <button onClick={() => handleDelete(cat.id)} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', color: '#9ca3af', fontSize: '13px' }}>
            Total {categories.length} categories
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px', color: '#1f2937' }}>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#4b5563', marginBottom: '6px' }}>Category Name</label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="e.g. Industrial Safety"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#4b5563', marginBottom: '6px' }}>Image URL</label>
                {formImage && (
                  <div style={{ width: '100%', height: '120px', borderRadius: '6px', overflow: 'hidden', marginBottom: '10px', border: '1px solid #d9d9d9' }}>
                    <img src={getImageUrl(formImage)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#fafafa' }} />
                  </div>
                )}
                <input
                  type="url"
                  className="glass-input"
                  placeholder="https://..."
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#4b5563', marginBottom: '6px' }}>Description</label>
                <textarea
                  className="glass-input"
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
