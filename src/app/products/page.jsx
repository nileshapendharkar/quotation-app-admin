'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Icon from '@/components/Icon';
import { Pagination, EmptyState, getUrlQuery } from '@/components/ui';
import { Search, GripVertical, Eye, EyeOff } from 'lucide-react';
import { apiFetch, getImageUrl } from '@/lib/api';

// Header labels as shown in the design (saved column settings keep their order/visibility,
// but always use these labels)
const COLUMN_LABELS = {
  code: 'General Product Code',
  productCode: 'Size Product Code',
  name: 'Product Name',
  category: 'Category',
  uom: 'UOM',
  sizes: 'Sizes',
  packing: 'Packing',
  status: 'Status - Active/Inactive',
  image: 'Image',
  description: 'Description',
  details: 'Details',
  specification: 'Specification',
  actions: 'Actions',
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Complete column list
  const [columns, setColumns] = useState([
    { id: 'code', label: 'General ProductCode', visible: true },
    { id: 'productCode', label: 'Size ProductCode', visible: true },
    { id: 'name', label: 'Product Name', visible: true },
    { id: 'category', label: 'Category', visible: true },
    { id: 'uom', label: 'UOM', visible: true },
    { id: 'sizes', label: 'Sizes', visible: true },
    { id: 'packing', label: 'Packing', visible: true },
    { id: 'status', label: 'Status - Active/Inactive', visible: true },
    { id: 'image', label: 'Image', visible: true },
    { id: 'description', label: 'Description', visible: false },
    { id: 'details', label: 'Details', visible: false },
    { id: 'specification', label: 'Specification', visible: false },
    { id: 'actions', label: 'Actions', visible: true },
  ]);
  const [showColConfig, setShowColConfig] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formUom, setFormUom] = useState('Nos');
  const [formDesc, setFormDesc] = useState('');
  const [formDetails, setFormDetails] = useState('');
  const [formSpecification, setFormSpecification] = useState('');
  const [formSizes, setFormSizes] = useState('');
  const [formPacking, setFormPacking] = useState('');
  const [formStatus, setFormStatus] = useState('Active');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
    // ?q= comes from the global header search
    const q = getUrlQuery('q');
    if (q) setSearch(q);
    fetchProducts(true, q);
    const savedCols = localStorage.getItem('nocobase_product_cols_v3');
    if (savedCols) {
      try {
        const parsed = JSON.parse(savedCols);
        // Ensure new column is included even if there's saved storage configuration
        const hasProductCode = parsed.some(c => c.id === 'productCode');
        if (!hasProductCode) {
          const codeIdx = parsed.findIndex(c => c.id === 'code');
          const insertIdx = codeIdx !== -1 ? codeIdx + 1 : 1;
          parsed.splice(insertIdx, 0, { id: 'productCode', label: 'ProductCode', visible: true });
        }
        setColumns(parsed);
      } catch(e) {}
    }
  }, []);

  const saveColumns = (newCols) => {
    setColumns(newCols);
    localStorage.setItem('nocobase_product_cols_v3', JSON.stringify(newCols));
  };

  const fetchCategories = async () => {
    const res = await apiFetch('/categories');
    if (res.success) setCategories(res.categories || []);
  };

  const fetchProducts = async (showLoading = true, searchTerm = search) => {
    if (showLoading) setLoading(true);
    let url = '/products?includeInactive=true&';
    if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;
    if (selectedCategory) url += `categoryId=${selectedCategory}&`;

    const res = await apiFetch(url);
    if (res.success) setProducts(res.products || []);
    if (showLoading) { setLoading(false); setPage(1); }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormCode('PRD-' + Math.floor(10000 + Math.random() * 90000));
    setFormName('');
    setFormImage('');
    setFormCategory(categories[0]?.id || '');
    setFormUom('Nos');
    setFormDesc('');
    setFormDetails('');
    setFormSpecification('');
    setFormSizes('');
    setFormPacking('');
    setFormStatus('Active');
    setIsModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);

    let codeStr = prod.code || prod.productCode || '';
    if (!codeStr && prod.sizeProductCodes && Object.keys(prod.sizeProductCodes).length > 0) {
      if (prod.sizes && prod.sizes.length > 0) {
        codeStr = prod.sizes
          .map(s => {
            const c = prod.sizeProductCodes[s];
            return c ? `${s}:${c}` : null;
          })
          .filter(Boolean)
          .join(', ');
      }
      if (!codeStr) {
        codeStr = Object.entries(prod.sizeProductCodes).map(([k, v]) => `${k}:${v}`).join(', ');
      }
    }
    setFormCode(codeStr || ('PRD-' + prod.id.slice(-5)));

    setFormName(prod.name);
    setFormImage(prod.image);
    setFormCategory(prod.categoryId);
    setFormUom(prod.uom || 'Nos');
    setFormDesc(prod.description || '');
    setFormDetails(prod.details || '');
    setFormSpecification(prod.specification || '');
    setFormSizes(prod.sizes ? prod.sizes.join(', ') : '');
    setFormStatus(prod.status || 'Active');

    let psStr = prod.packing || '';
    if (!psStr && prod.packSizes) {
      if (prod.sizes && prod.sizes.length > 0) {
        psStr = prod.sizes
          .map(s => {
            const v = (prod.packings && prod.packings[s] !== undefined)
              ? prod.packings[s]
              : (prod.packSizes && prod.packSizes[s] !== undefined)
              ? prod.packSizes[s]
              : '';
            return v !== '' ? `${s}:${v}` : null;
          })
          .filter(Boolean)
          .join(', ');
      }
      if (!psStr) {
        psStr = Object.entries(prod.packSizes).map(([k, v]) => `${k}:${v}`).join(', ');
      }
    } else if (!psStr && prod.packSize) {
      psStr = `All:${prod.packSize}`;
    }
    setFormPacking(psStr);

    setIsModalOpen(true);
  };

  // One-click status toggle (Active <-> Inactive)
  const handleToggleStatus = async (prod) => {
    const nextStatus = prod.status === 'Inactive' ? 'Active' : 'Inactive';
    const previousProducts = [...products];

    setProducts(products.map(p => p.id === prod.id ? { ...p, status: nextStatus } : p));

    const res = await apiFetch(`/products/${prod.id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: nextStatus })
    });

    if (res.success) {
      fetchProducts(false);
    } else {
      alert(res.message || 'Failed to update product status.');
      setProducts(previousProducts);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formName || !formCategory) return;
    setSubmitting(true);

    let parsedPackSizes = null;
    if (formPacking && formPacking.includes(':')) {
      parsedPackSizes = {};
      formPacking.split(',').forEach(pair => {
        const [k, v] = pair.split(':').map(s => s.trim());
        if (k && v) parsedPackSizes[k] = parseInt(v) || v;
      });
    }

    let parsedProductCodes = null;
    let singleCode = formCode;
    if (formCode && formCode.includes(':')) {
      parsedProductCodes = {};
      formCode.split(',').forEach(pair => {
        const [k, v] = pair.split(':').map(s => s.trim());
        if (k && v) parsedProductCodes[k] = v;
      });
      singleCode = '';
    }

    const payload = {
      code: singleCode,
      name: formName,
      uom: formUom,
      image: formImage || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=500&q=80',
      categoryId: formCategory,
      description: formDesc,
      details: formDetails,
      specification: formSpecification,
      sizes: formSizes.split(',').map(s => s.trim()).filter(Boolean),
      packing: formPacking,
      status: formStatus,
      ...(parsedPackSizes && Object.keys(parsedPackSizes).length > 0 ? { packSizes: parsedPackSizes } : {}),
      sizeProductCodes: parsedProductCodes || {}
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
  const handleDragEnd = (e) => { e.target.style.opacity = '1'; };
  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
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

  // Helper to find key in map matching size regardless of formatting
  const findSizeKey = (sizeMap, querySize) => {
    if (!sizeMap || !querySize) return null;
    const queryStr = String(querySize).trim().toLowerCase();
    const normalizedQuery = queryStr.replace(/[^a-z0-9]/g, '');

    for (const key of Object.keys(sizeMap)) {
      if (key.toLowerCase() === queryStr) return key;
    }
    for (const key of Object.keys(sizeMap)) {
      if (key.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedQuery) return key;
    }
    return null;
  };

  const getProductPackingForSize = (product, size) => {
    if (!product) return '-';
    if (product.packings && typeof product.packings === 'object') {
      if (product.packings[size] !== undefined) return product.packings[size];
      const matched = findSizeKey(product.packings, size);
      if (matched && product.packings[matched] !== undefined) return product.packings[matched];
    }
    if (product.packSizes && typeof product.packSizes === 'object') {
      if (product.packSizes[size] !== undefined) return product.packSizes[size];
      const matched = findSizeKey(product.packSizes, size);
      if (matched && product.packSizes[matched] !== undefined) return product.packSizes[matched];
    }
    if (typeof product.packing === 'string' && product.packing.includes(':')) {
      const pairs = product.packing.split(',').map(p => p.trim());
      for (const pair of pairs) {
        const [k, v] = pair.split(':').map(s => s.trim());
        if (k && v) {
          const normK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
          const normS = String(size).toLowerCase().replace(/[^a-z0-9]/g, '');
          if (normK === normS || normS.includes(normK) || normK.includes(normS)) return v;
        }
      }
    }
    if (product.packing !== undefined && product.packing !== null && typeof product.packing !== 'object' && !String(product.packing).includes(':')) {
      return product.packing;
    }
    if (product.packSize !== undefined && product.packSize !== null && typeof product.packSize !== 'object' && !String(product.packSize).includes(':')) {
      return product.packSize;
    }
    return '-';
  };

  const getProductCodeForSize = (product, size) => {
    if (!product) return '-';
    if (product.sizeProductCodes && typeof product.sizeProductCodes === 'object') {
      if (product.sizeProductCodes[size]) return product.sizeProductCodes[size];
      const matched = findSizeKey(product.sizeProductCodes, size);
      if (matched && product.sizeProductCodes[matched]) return product.sizeProductCodes[matched];
    }
    return product.code || product.productCode || '-';
  };

  const renderCell = (col, product) => {
    switch (col.id) {
      case 'code':
        return <span className="code-link">{product.code || product.productCode || `PRD-${(product.id || '').slice(-5)}`}</span>;
      case 'productCode':
        if (product.sizes && product.sizes.length > 0) {
          return (
            <div className="variant-list code-list">
              {product.sizes.map((s, idx) => (
                <div key={idx} className="variant-row code-text">
                  {getProductCodeForSize(product, s)}
                </div>
              ))}
            </div>
          );
        }
        if (product.sizeProductCodes && Object.keys(product.sizeProductCodes).length > 0) {
          return (
            <div className="variant-list code-list">
              {Object.values(product.sizeProductCodes).map((code, idx) => (
                <div key={idx} className="variant-row code-text">{code}</div>
              ))}
            </div>
          );
        }
        return <span style={{ color: '#9ca3af' }}>{product.code || product.productCode || '-'}</span>;
      case 'name':
        return <div className="name-cell">{product.name}</div>;
      case 'category':
        return (
          <span className="cat-badge">
            <Icon name="box" size={26} />
            <span>{product.categoryName}</span>
          </span>
        );
      case 'uom':
        return <span>{product.uom || 'Nos'}</span>;
      case 'sizes':
        return product.sizes && product.sizes.length > 0 ? (
          <div className="variant-list size-list">
            {product.sizes.map((s, idx) => (
              <div key={idx} className="variant-row">
                <span className="size-chip">{s}</span>
              </div>
            ))}
          </div>
        ) : <span style={{ color: '#9ca3af' }}>-</span>;
      case 'packing': {
        if (product.sizes && product.sizes.length > 0) {
          return (
            <div className="variant-list packing-list">
              {product.sizes.map((s, idx) => (
                <div key={idx} className="variant-row">
                  <span className="packing-chip">{getProductPackingForSize(product, s)}</span>
                </div>
              ))}
            </div>
          );
        }
        let singlePack = product.packing;
        if (!singlePack && product.packSize) singlePack = product.packSize;
        if (!singlePack && product.packSizes && typeof product.packSizes === 'object') {
          const vals = Object.values(product.packSizes);
          singlePack = vals.length === 1 ? vals[0] : (vals.length > 0 ? vals.join(', ') : '-');
        }
        return <span className="packing-chip">{singlePack || '-'}</span>;
      }
      case 'status': {
        const isActive = product.status !== 'Inactive';
        return (
          <div className="status-wrap">
            <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>{isActive ? 'Active' : 'Inactive'}</span>
            <button
              className={`switch${isActive ? ' on' : ''}`}
              onClick={() => handleToggleStatus(product)}
              title={`Click to set ${isActive ? 'Inactive' : 'Active'}`}
              aria-label={`Set ${isActive ? 'Inactive' : 'Active'}`}
            />
          </div>
        );
      }
      case 'image':
        return (
          <div className="thumb">
            <img src={getImageUrl(product.image)} alt={product.name} />
          </div>
        );
      case 'description':
        return <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{product.description || '-'}</div>;
      case 'details':
        return <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{product.details || '-'}</div>;
      case 'specification':
        return <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{product.specification || '-'}</div>;
      case 'actions':
        return (
          <div className="row-actions">
            <button className="btn btn-sm btn-soft-blue" onClick={() => openEditModal(product)}>
              <Icon name="editing" size={18} /> Edit
            </button>
            <button className="btn btn-sm btn-soft-red" onClick={() => handleDelete(product.id)}>
              <Icon name="bin" size={18} /> Delete
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const visibleCols = columns.filter(c => c.visible);
  const pagedProducts = products.slice((page - 1) * pageSize, page * pageSize);

  return (
    <AdminLayout
      title="Products"
      subtitle="Complete Product Master"
      aside={
        <div className="count-chip">
          <span className="chip-ic"><Icon name="box" size={26} color="#fff" /></span>
          <div><strong>{loading ? '…' : products.length}</strong><span>Total Products</span></div>
        </div>
      }
    >
      <div className="ds-card">
        {/* Action toolbar */}
        <div className="toolbar">
          <div className="toolbar-group">
            <div className="search-field" style={{ width: '20.6rem' }}>
              <Search size={20} strokeWidth={2.4} className="search-ic" />
              <input
                type="text"
                placeholder="Search by Code, Name, Category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
              />
            </div>

            <select
              className="field"
              style={{ width: '14.8rem' }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <button className="btn btn-outline" style={{ minWidth: '6.9rem' }} onClick={() => fetchProducts()}>
              <Icon name="filter" size={20} /> Filter
            </button>
          </div>

          <div className="toolbar-group">
            <button className="btn btn-outline" onClick={() => setShowColConfig(!showColConfig)}>
              <Icon name="setting" size={22} /> Configure Columns
            </button>
            <button className="btn btn-primary" onClick={openAddModal} style={{ minWidth: '10.8rem' }}>
              <Icon name="plus" size={18} /> Add Product
            </button>

            {/* Column configurator popover */}
            {showColConfig && (
              <div className="popover" style={{ right: '12rem' }}>
                <div className="popover-title">Configure Columns (drag to reorder)</div>
                {columns.map((col, index) => (
                  <div
                    key={col.id}
                    className="col-row"
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <GripVertical size={14} color="#9ca3af" /> {COLUMN_LABELS[col.id] || col.label}
                    </span>
                    <button onClick={() => toggleColumn(col.id)} style={{ color: col.visible ? '#0d6efd' : '#9ca3af' }}>
                      {col.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Data table */}
        <div className="table-wrap">
          <table className="ds-table">
            <thead>
              <tr>
                {visibleCols.map(col => (
                  <th key={col.id} className={col.id === 'actions' ? 'center' : ''} style={{
                    width: col.id === 'image' ? '7rem' : col.id === 'actions' ? '14rem' : undefined,
                    minWidth: col.id === 'code' || col.id === 'productCode' ? '8.2rem' : col.id === 'status' ? '10.5rem' : undefined,
                  }}>
                    {COLUMN_LABELS[col.id] || col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={visibleCols.length} className="empty-cell">Loading products...</td></tr>
              ) : pagedProducts.map(product => (
                <tr key={product.id}>
                  {visibleCols.map(col => (
                    <td key={col.id} className={col.id === 'actions' ? 'center' : ''}>
                      {renderCell(col, product)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && products.length === 0 && (
          <EmptyState
            title="No products found"
            text="Try a different search or category, or add a new product."
            action={<button className="btn btn-primary" onClick={openAddModal}><Icon name="plus" size={20} /> Add Product</button>}
          />
        )}

        <Pagination
          page={page}
          pageSize={pageSize}
          total={products.length}
          onPageChange={setPage}
          onPageSizeChange={(n) => { setPageSize(n); setPage(1); }}
          itemLabel="products"
        />
      </div>

      {/* Add / Edit form modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '38rem' }}>
            <h3 className="modal-title">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid-1-2">
                <div>
                  <label className="form-label">Product Code *</label>
                  <input
                    type="text"
                    className="field"
                    placeholder="e.g. PRD-1001 or 300L:FG-400128, 500L:FG-400124"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    className="field"
                    placeholder="e.g. Heavy Duty CPVC Fitting"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-3">
                <div>
                  <label className="form-label">Category *</label>
                  <select className="field" value={formCategory} onChange={(e) => setFormCategory(e.target.value)} required>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">UOM (Unit)</label>
                  <select className="field" value={formUom} onChange={(e) => setFormUom(e.target.value)}>
                    {/* keep the product's own UOM (e.g. "LTR") selectable even if it is not in the standard list */}
                    {formUom && !['Nos', 'Pcs', 'Box', 'Set', 'Mtr', 'Bundle', 'Kg', 'Pkt', 'Ltr'].includes(formUom) && (
                      <option value={formUom}>{formUom}</option>
                    )}
                    <option value="Nos">Nos</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Box">Box</option>
                    <option value="Set">Set</option>
                    <option value="Mtr">Mtr</option>
                    <option value="Bundle">Bundle</option>
                    <option value="Kg">Kg</option>
                    <option value="Pkt">Pkt</option>
                    <option value="Ltr">Ltr</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select className="field" value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div>
                  <label className="form-label">Sizes (comma-separated)</label>
                  <input type="text" className="field" placeholder="e.g. 1/2 inch, 3/4 inch, 1 inch" value={formSizes} onChange={(e) => setFormSizes(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Packing</label>
                  <input type="text" className="field" placeholder="e.g. 1/2:24, 3/4:24 or 24 Pcs/Box" value={formPacking} onChange={(e) => setFormPacking(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="form-label">Product Image</label>
                {formImage ? (
                  <div className="img-preview">
                    <img src={getImageUrl(formImage)} alt="Preview" />
                    <button type="button" className="btn btn-sm btn-soft-red" onClick={() => setFormImage('')} style={{ position: 'absolute', top: 8, right: 8 }}>
                      Clear
                    </button>
                  </div>
                ) : null}
                <input type="url" className="field" placeholder="Image URL (e.g., https://images.unsplash.com/...)" value={formImage} onChange={(e) => setFormImage(e.target.value)} />
              </div>

              <div className="form-grid-2">
                <div>
                  <label className="form-label">Description</label>
                  <textarea className="field" rows={2} placeholder="Short description..." value={formDesc} onChange={(e) => setFormDesc(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Details</label>
                  <textarea className="field" rows={2} placeholder="Extended details..." value={formDetails} onChange={(e) => setFormDetails(e.target.value)} />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save & Sync MongoDB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
