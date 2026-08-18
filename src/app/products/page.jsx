'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { Plus, Search, Edit, Trash2, Filter, Settings2, GripVertical, Eye, EyeOff } from 'lucide-react';
import { apiFetch, getImageUrl } from '@/lib/api';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  // Dynamic Columns State
  const [columns, setColumns] = useState([
    { id: 'image', label: 'Image', visible: true },
    { id: 'name', label: 'Product Name', visible: true },
    { id: 'category', label: 'Category', visible: true },
    { id: 'sizes', label: 'Sizes', visible: true },
    { id: 'description', label: 'Description', visible: false },
    { id: 'details', label: 'Details', visible: false },
    { id: 'specification', label: 'Specification', visible: false },
    { id: 'actions', label: 'Actions', visible: true },
  ]);
  const [showColConfig, setShowColConfig] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formName, setFormName] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formDetails, setFormDetails] = useState('');
  const [formSpecification, setFormSpecification] = useState('');
  const [formSizes, setFormSizes] = useState('');
  const [formPackSizes, setFormPackSizes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    // Load saved columns preference if exists
    const savedCols = localStorage.getItem('nocobase_product_cols');
    if (savedCols) {
      try { setColumns(JSON.parse(savedCols)); } catch(e) {}
    }
  }, []);

  const saveColumns = (newCols) => {
    setColumns(newCols);
    localStorage.setItem('nocobase_product_cols', JSON.stringify(newCols));
  };

  const fetchCategories = async () => {
    const res = await apiFetch('/categories');
    if (res.success) setCategories(res.categories || []);
  };

  const fetchProducts = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    let url = '/products?';
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (selectedCategory) url += `categoryId=${selectedCategory}&`;

    const res = await apiFetch(url);
    if (res.success) setProducts(res.products || []);
    if (showLoading) setLoading(false);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormImage('');
    setFormCategory(categories[0]?.id || '');
    setFormDesc('');
    setFormDetails('');
    setFormSpecification('');
    setFormSizes('');
    setFormPackSizes('');
    setIsModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormImage(prod.image);
    setFormCategory(prod.categoryId);
    setFormDesc(prod.description || '');
    setFormDetails(prod.details || '');
    setFormSpecification(prod.specification || '');
    setFormSizes(prod.sizes ? prod.sizes.join(', ') : '');
    
    // Parse packSizes object to string
    let psStr = '';
    if (prod.packSizes) {
      psStr = Object.entries(prod.packSizes).map(([k, v]) => `${k}:${v}`).join(', ');
    } else if (prod.packSize) {
      psStr = `All:${prod.packSize}`;
    }
    setFormPackSizes(psStr);
    
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formName || !formCategory) return;
    setSubmitting(true);

    // Parse Pack Sizes string back to object
    let parsedPackSizes = null;
    if (formPackSizes) {
      parsedPackSizes = {};
      formPackSizes.split(',').forEach(pair => {
        const [k, v] = pair.split(':').map(s => s.trim());
        if (k && v) parsedPackSizes[k] = parseInt(v) || v;
      });
    }

    const payload = {
      name: formName,
      image: formImage || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=500&q=80',
      categoryId: formCategory,
      description: formDesc,
      details: formDetails,
      specification: formSpecification,
      sizes: formSizes.split(',').map(s => s.trim()).filter(Boolean),
      ...(parsedPackSizes && Object.keys(parsedPackSizes).length > 0 ? { packSizes: parsedPackSizes } : {})
    };

    const previousProducts = [...products];
    const catName = categories.find(c => c.id === formCategory)?.name || 'General';
    
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...payload, categoryName: catName } : p));
    } else {
      const tempProduct = { id: 'temp_' + Date.now(), ...payload, categoryName: catName };
      setProducts([tempProduct, ...products]);
    }
    setIsModalOpen(false);

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
      fetchProducts(false);
    } else {
      alert(res.message || 'Operation failed. Rolling back changes...');
      setProducts(previousProducts);
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const previousProducts = [...products];
    setProducts(products.filter(p => p.id !== id));
    const res = await apiFetch(`/products/${id}`, { method: 'DELETE' });
    if (res.success) {
      fetchProducts(false);
    } else {
      alert(res.message || 'Delete failed. Rolling back changes...');
      setProducts(previousProducts);
    }
  };

  // Drag and drop handlers for column configurator
  const handleDragStart = (e, index) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (sourceIndex === targetIndex) return;

    const newCols = [...columns];
    const [draggedItem] = newCols.splice(sourceIndex, 1);
    newCols.splice(targetIndex, 0, draggedItem);
    saveColumns(newCols);
  };

  const toggleColumn = (id) => {
    const newCols = columns.map(c => c.id === id ? { ...c, visible: !c.visible } : c);
    saveColumns(newCols);
  };

  const renderCell = (col, product) => {
    switch (col.id) {
      case 'image':
        return (
          <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: '#f5f5f5', overflow: 'hidden' }}>
            <img src={getImageUrl(product.image)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        );
      case 'name':
        return <div style={{ fontWeight: '500', color: '#1f2937' }}>{product.name}</div>;
      case 'category':
        return (
          <span className="badge badge-dispatched" style={{ backgroundColor: '#e6f4ff', color: '#1677ff', borderColor: '#91caff' }}>
            {product.categoryName}
          </span>
        );
      case 'sizes':
        return product.sizes && product.sizes.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {product.sizes.map((s, idx) => (
              <span key={idx} className="badge" style={{ background: '#f5f5f5', border: '1px solid #d9d9d9', color: '#595959' }}>{s}</span>
            ))}
          </div>
        ) : <span style={{ color: '#9ca3af' }}>-</span>;
      case 'description':
        return <div style={{ fontSize: '13px', color: '#6b7280' }}>{product.description || '-'}</div>;
      case 'details':
        return <div style={{ fontSize: '13px', color: '#6b7280' }}>{product.details || '-'}</div>;
      case 'specification':
        return <div style={{ fontSize: '13px', color: '#6b7280' }}>{product.specification || '-'}</div>;
      case 'actions':
        return (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button onClick={() => openEditModal(product)} style={{ background: 'none', border: 'none', color: '#1677ff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Edit size={14} /> Edit
            </button>
            <button onClick={() => handleDelete(product.id)} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Trash2 size={14} /> Delete
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const visibleCols = columns.filter(c => c.visible);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-body)' }}>
      <Sidebar />
      <Navbar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '600' }}>Products Collection</h1>
        </div>

        <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          {/* Action Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '260px' }}>
                <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '10px' }} />
                <input
                  type="text"
                  className="glass-input"
                  style={{ paddingLeft: '36px', height: '36px' }}
                  placeholder="Filter products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
                />
              </div>

              <select
                className="glass-input"
                style={{ width: '180px', height: '36px' }}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <button className="btn-secondary" style={{ height: '36px', padding: '0 12px' }} onClick={fetchProducts}>
                <Filter size={16} style={{ marginRight: '6px', display: 'inline' }} /> Filter
              </button>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', position: 'relative' }}>
              <button 
                className="btn-secondary" 
                style={{ height: '36px', padding: '0 12px' }} 
                onClick={() => setShowColConfig(!showColConfig)}
              >
                <Settings2 size={16} style={{ marginRight: '6px', display: 'inline' }} /> Configure Columns
              </button>
              
              <button className="btn-primary" style={{ height: '36px' }} onClick={openAddModal}>
                <Plus size={16} /> Add new
              </button>

              {/* Column Configurator Popover */}
              {showColConfig && (
                <div style={{
                  position: 'absolute',
                  top: '44px',
                  right: '100px',
                  width: '280px',
                  background: '#fff',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 50,
                  padding: '12px'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: '#1f2937' }}>
                    Configure Columns (Drag to Reorder)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {columns.map((col, index) => (
                      <div
                        key={col.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px',
                          background: '#fafafa',
                          border: '1px solid #f0f0f0',
                          borderRadius: '4px',
                          cursor: 'grab'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <GripVertical size={14} color="#9ca3af" />
                          <span style={{ fontSize: '13px', color: '#4b5563' }}>{col.label}</span>
                        </div>
                        <button
                          onClick={() => toggleColumn(col.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: col.visible ? '#1677ff' : '#9ca3af' }}
                        >
                          {col.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Data Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {visibleCols.map(col => (
                    <th key={col.id} style={{ 
                      padding: '12px 24px', 
                      width: col.id === 'image' ? '80px' : col.id === 'actions' ? '140px' : 'auto',
                      textAlign: col.id === 'actions' ? 'center' : 'left'
                    }}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={visibleCols.length} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Loading products...</td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={visibleCols.length} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>No products found.</td>
                  </tr>
                ) : (
                  products.map(product => (
                    <tr key={product.id}>
                      {visibleCols.map(col => (
                        <td key={col.id} style={{ padding: '12px 24px', textAlign: col.id === 'actions' ? 'center' : 'left' }}>
                          {renderCell(col, product)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', color: '#9ca3af', fontSize: '13px' }}>
            Total {products.length} items
          </div>
        </div>
      </div>

      {/* Add / Edit Form Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px', color: '#1f2937' }}>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#4b5563', marginBottom: '6px' }}>Product Name</label>
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
                <label style={{ display: 'block', fontSize: '13px', color: '#4b5563', marginBottom: '6px' }}>Category</label>
                <select
                  className="glass-input"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#4b5563', marginBottom: '6px' }}>Product Image</label>
                {formImage ? (
                  <div style={{ position: 'relative', width: '100%', height: '140px', borderRadius: '6px', overflow: 'hidden', marginBottom: '10px', border: '1px solid #d9d9d9' }}>
                    <img src={getImageUrl(formImage)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#fafafa' }} />
                    <button
                      type="button"
                      onClick={() => setFormImage('')}
                      style={{ position: 'absolute', top: '8px', right: '8px', background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Clear
                    </button>
                  </div>
                ) : null}
                <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                  <input
                    type="url"
                    className="glass-input"
                    placeholder="Image URL (e.g., https://images.unsplash.com/...)"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#4b5563', marginBottom: '6px' }}>Description</label>
                  <textarea
                    className="glass-input"
                    rows={2}
                    placeholder="Short description..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#4b5563', marginBottom: '6px' }}>Details</label>
                  <textarea
                    className="glass-input"
                    rows={2}
                    placeholder="Extended details..."
                    value={formDetails}
                    onChange={(e) => setFormDetails(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#4b5563', marginBottom: '6px' }}>Specification</label>
                <textarea
                  className="glass-input"
                  rows={2}
                  placeholder="Product specifications..."
                  value={formSpecification}
                  onChange={(e) => setFormSpecification(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#4b5563', marginBottom: '6px' }}>Sizes (Comma-separated)</label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="e.g. 1/2 inch, 3/4 inch, 1 inch"
                    value={formSizes}
                    onChange={(e) => setFormSizes(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#4b5563', marginBottom: '6px' }}>Pack Sizes (Size:Qty)</label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="e.g. 1/2:24, 3/4:24"
                    value={formPackSizes}
                    onChange={(e) => setFormPackSizes(e.target.value)}
                  />
                </div>
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
