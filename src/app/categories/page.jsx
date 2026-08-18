'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { Plus, Edit, Trash2, Layers } from 'lucide-react';
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
    setFormImage('https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=400&q=80');
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

    const payload = { name: formName, image: formImage, description: formDesc };

    // --- OPTIMISTIC UI UPDATE ---
    const previousCategories = [...categories];
    if (editingCategory) {
      setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, ...payload } : c));
    } else {
      const tempCategory = { id: 'temp_' + Date.now(), ...payload };
      setCategories([tempCategory, ...categories]);
    }
    setIsModalOpen(false); // Close instantly

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
      // Sync real data silently
      fetchCategories(false);
    } else {
      // --- ROLLBACK ---
      alert(res.message || 'Operation failed. Rolling back changes...');
      setCategories(previousCategories);
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    // --- OPTIMISTIC UI UPDATE ---
    const previousCategories = [...categories];
    setCategories(categories.filter(c => c.id !== id));

    const res = await apiFetch(`/categories/${id}`, { method: 'DELETE' });
    
    if (res.success) {
      fetchCategories(false); // Silently sync
    } else {
      // --- ROLLBACK ---
      alert(res.message || 'Delete failed. Rolling back changes...');
      setCategories(previousCategories);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar title="Category Management" />

        <main style={{ padding: '32px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#f8fafc' }}>Categories List</h2>
            <button className="btn-primary" onClick={openAddModal}>
              <Plus size={18} /> Add Category
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {categories.map(cat => (
              <div key={cat.id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '140px', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
                  <img src={getImageUrl(cat.image)} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', marginBottom: '6px' }}>{cat.name}</h4>
                <p style={{ fontSize: '13px', color: '#94a3b8', flex: 1, marginBottom: '16px' }}>{cat.description || 'No description'}</p>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-glass)', paddingTop: '12px' }}>
                  <button onClick={() => openEditModal(cat)} className="btn-secondary" style={{ padding: '6px 12px' }}>
                    <Edit size={14} />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="btn-danger">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', color: '#f8fafc' }}>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>Category Name</label>
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
                <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>Image URL</label>
                <input
                  type="url"
                  className="glass-input"
                  placeholder="https://..."
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>Description</label>
                <textarea
                  className="glass-input"
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
