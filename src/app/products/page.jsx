'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { Plus, Search, Edit, Trash2, Package, Image as ImageIcon, Check } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formName, setFormName] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    const res = await apiFetch('/categories');
    if (res.success) setCategories(res.categories || []);
  };

  const fetchProducts = async () => {
    setLoading(true);
    let url = '/products?';
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (selectedCategory) url += `categoryId=${selectedCategory}&`;

    const res = await apiFetch(url);
    if (res.success) setProducts(res.products || []);
    setLoading(false);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormImage('https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=500&q=80');
    setFormCategory(categories[0]?.id || '');
    setFormDesc('');
    setIsModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormImage(prod.image);
    setFormCategory(prod.categoryId);
    setFormDesc(prod.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formName || !formCategory) return;
    setSubmitting(true);

    const payload = {
      name: formName,
      image: formImage,
      categoryId: formCategory,
      description: formDesc
      // STRICTLY NO PRICE FIELD!
    };

    let res;
    if (editingProduct) {
      res = await apiFetch(`/products/${editingProduct.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
    } else {
      res = await apiFetch('/products', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }

    setSubmitting(false);

    if (res.success) {
      setIsModalOpen(false);
      fetchProducts();
    } else {
      alert(res.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const res = await apiFetch(`/products/${id}`, { method: 'DELETE' });
    if (res.success) {
      fetchProducts();
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar title="Product Management (No Price)" />

        <main style={{ padding: '32px', flex: 1 }}>
          {/* Action Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative', width: '280px' }}>
                <Search size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '12px' }} />
                <input
                  type="text"
                  className="glass-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
                />
              </div>

              <select
                className="glass-input"
                style={{ width: '200px' }}
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                }}
              >
                <option value="" style={{ background: '#0f172a' }}>All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id} style={{ background: '#0f172a' }}>{c.name}</option>
                ))}
              </select>

              <button className="btn-secondary" onClick={fetchProducts}>Filter</button>
            </div>

            <button className="btn-primary" onClick={openAddModal}>
              <Plus size={18} /> Add Product
            </button>
          </div>

          {/* Product Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {products.map(product => (
              <div key={product.id} className="glass-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '180px', position: 'relative', background: '#000' }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(8px)',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#38bdf8'
                  }}>
                    {product.categoryName}
                  </div>
                </div>

                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc', marginBottom: '8px' }}>
                    {product.name}
                  </h4>
                  <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px', flex: 1 }}>
                    {product.description || 'No description provided.'}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-glass)' }}>
                    <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '700' }}>
                      ✓ Quotation Ready
                    </span>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => openEditModal(product)} className="btn-secondary" style={{ padding: '6px 12px' }}>
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="btn-danger">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', color: '#f8fafc' }}>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>Product Name</label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="e.g. Heavy Duty Safety Helmet"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>Category</label>
                <select
                  className="glass-input"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  required
                >
                  <option value="" style={{ background: '#0f172a' }}>Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id} style={{ background: '#0f172a' }}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>Image URL</label>
                <input
                  type="url"
                  className="glass-input"
                  placeholder="https://images.unsplash.com/..."
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>Description</label>
                <textarea
                  className="glass-input"
                  rows={3}
                  placeholder="Product specifications and details..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </div>

              <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.1)', fontSize: '12px', color: '#38bdf8', textAlign: 'center' }}>
                Note: No Price field is included. Product operates on Quotation Quantity only.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
