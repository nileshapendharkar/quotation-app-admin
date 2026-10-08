'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Icon from '@/components/Icon';
import { Pagination, EmptyState, getUrlQuery } from '@/components/ui';
import { Search } from 'lucide-react';
import { apiFetch, getImageUrl } from '@/lib/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search / filter (applied on Enter or the Filter button, same as the Products page)
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [applied, setApplied] = useState({ search: '', id: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formName, setFormName] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = getUrlQuery('q');
    if (q) { setSearch(q); setApplied({ search: q, id: '' }); }
    fetchCategories();
  }, []);

  const fetchCategories = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const res = await apiFetch('/categories');
    if (res.success) setCategories(res.categories || []);
    if (showLoading) setLoading(false);
  };

  const applyFilter = () => { setApplied({ search, id: selectedId }); setPage(1); };

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

  const term = applied.search.trim().toLowerCase();
  const filtered = categories.filter(c =>
    (!applied.id || c.id === applied.id) &&
    (!term || (c.name || '').toLowerCase().includes(term) || (c.description || '').toLowerCase().includes(term))
  );
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <AdminLayout
      title="Categories"
      subtitle="Organize and manage product categories"
      aside={
        <div className="count-chip">
          <span className="chip-ic"><Icon name="box" size={26} color="#fff" /></span>
          <div><strong>{loading ? '…' : categories.length}</strong><span>Total Categories</span></div>
        </div>
      }
    >
      <div className="ds-card">
        <div className="toolbar">
          <div className="toolbar-group">
            <div className="search-field" style={{ width: '20.6rem' }}>
              <Search size={20} strokeWidth={2.4} className="search-ic" />
              <input
                type="text"
                placeholder="Search category name, ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilter()}
              />
            </div>

            <select className="field" style={{ width: '14.8rem' }} value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <button className="btn btn-outline" style={{ minWidth: '6.9rem' }} onClick={applyFilter}>
              <Icon name="filter" size={20} /> Filter
            </button>
          </div>

          <div className="toolbar-group">
            <button className="btn btn-primary" onClick={openAddModal}>
              <Icon name="plus" size={18} /> Add New Category
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table className="ds-table">
            <thead>
              <tr>
                <th style={{ width: '9rem', paddingLeft: '2.4rem' }}>Image</th>
                <th style={{ width: '20rem' }}>Category Name</th>
                <th>Description</th>
                <th className="center" style={{ width: '16rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="empty-cell">Loading categories...</td></tr>
              ) : paged.map(cat => (
                <tr key={cat.id}>
                  <td style={{ paddingLeft: '2rem', paddingTop: '0.4rem', paddingBottom: '0.4rem' }}>
                    <div className="thumb sm">
                      <img src={getImageUrl(cat.image)} alt={cat.name} />
                    </div>
                  </td>
                  <td>{cat.name}</td>
                  <td style={{ color: '#6b7280' }}>{cat.description || '-'}</td>
                  <td className="center">
                    <div className="row-actions" style={{ gap: '1.6rem' }}>
                      <button className="btn btn-sm btn-soft-blue" onClick={() => openEditModal(cat)}>
                        <Icon name="editing" size={18} /> Edit
                      </button>
                      <button className="btn btn-sm btn-soft-red" onClick={() => handleDelete(cat.id)}>
                        <Icon name="bin" size={18} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length === 0 && (
          <EmptyState
            title="No categories found"
            text={categories.length ? 'Try a different search or filter.' : 'Add your first product category to get started.'}
            action={<button className="btn btn-primary" onClick={openAddModal}><Icon name="plus" size={20} /> Add New Category</button>}
          />
        )}

        <Pagination
          page={page}
          pageSize={pageSize}
          total={filtered.length}
          onPageChange={setPage}
          onPageSizeChange={(n) => { setPageSize(n); setPage(1); }}
          itemLabel="categories"
        />
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>

            <form onSubmit={handleSubmit} className="modal-form">
              <div>
                <label className="form-label">Category Name</label>
                <input type="text" className="field" placeholder="e.g. Industrial Safety" value={formName} onChange={(e) => setFormName(e.target.value)} required />
              </div>

              <div>
                <label className="form-label">Image URL</label>
                {formImage && (
                  <div className="img-preview">
                    <img src={getImageUrl(formImage)} alt="Preview" />
                  </div>
                )}
                <input type="url" className="field" placeholder="https://..." value={formImage} onChange={(e) => setFormImage(e.target.value)} />
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea className="field" rows={3} value={formDesc} onChange={(e) => setFormDesc(e.target.value)} />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
