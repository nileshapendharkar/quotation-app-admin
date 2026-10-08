'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Icon from '@/components/Icon';
import { StatCard, Pagination, EmptyState, RoundGlyph, getUrlQuery, dailySeries } from '@/components/ui';
import { FileSpreadsheet, Download, GripVertical, Eye, EyeOff, Clock, X, CalendarDays, Search } from 'lucide-react';
import { apiFetch, API_BASE } from '@/lib/api';

const COLUMN_LABELS = {
  orderNo: 'Order #',
  customer: 'Customer info',
  items: 'Requested Items',
  date: 'Date',
  status: 'Status',
  actions: 'Actions',
};

const DATE_RANGES = [
  { value: 'all', label: 'Select Date Range', days: null },
  { value: 'today', label: 'Today', days: 0 },
  { value: '7', label: 'Last 7 Days', days: 7 },
  { value: '30', label: 'Last 30 Days', days: 30 },
  { value: '90', label: 'Last 90 Days', days: 90 },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');
  const [showFilter, setShowFilter] = useState(false);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dynamic Columns State
  const [columns, setColumns] = useState([
    { id: 'orderNo', label: 'Order #', visible: true },
    { id: 'customer', label: 'Customer Info', visible: true },
    { id: 'items', label: 'Requested Items', visible: true },
    { id: 'date', label: 'Date', visible: true },
    { id: 'status', label: 'Status', visible: true },
    { id: 'actions', label: 'Actions', visible: true },
  ]);
  const [showColConfig, setShowColConfig] = useState(false);

  useEffect(() => {
    const q = getUrlQuery('q');
    if (q) { setQuery(q); setShowFilter(true); }
    fetchOrders();
    // Load saved columns preference if exists
    const savedCols = localStorage.getItem('nocobase_order_cols');
    if (savedCols) {
      try { setColumns(JSON.parse(savedCols)); } catch(e) {}
    }
  }, []);

  useEffect(() => { setPage(1); }, [activeTab, dateRange, query]);

  const saveColumns = (newCols) => {
    setColumns(newCols);
    localStorage.setItem('nocobase_order_cols', JSON.stringify(newCols));
  };

  // All orders are loaded once; tabs, date range and search filter them in the browser
  const fetchOrders = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const res = await apiFetch(`/orders/admin/all-orders?status=All`);
    if (res.success) setOrders(res.orders || []);
    if (showLoading) setLoading(false);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const previousOrders = [...orders];
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

    const res = await apiFetch(`/orders/admin/status/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus })
    });

    if (res.success) {
      fetchOrders(false);
    } else {
      alert(res.message || 'Failed to update status. Rolling back changes...');
      setOrders(previousOrders);
    }
  };

  const handleDownloadPDF = (orderId, orderNo) => {
    const token = localStorage.getItem('admin_token');
    const url = `${API_BASE}/orders/download-pdf/${orderId}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `Quotation_${orderNo}.pdf`;
        link.click();
      })
      .catch(() => alert('PDF download failed'));
  };

  const handleDownloadExcel = (orderId, orderNo) => {
    const token = localStorage.getItem('admin_token');
    const url = `${API_BASE}/orders/download-excel/${orderId}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `Quotation_${orderNo}.xlsx`;
        link.click();
      })
      .catch(() => alert('Excel download failed'));
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
  const toggleColumn = (id) => saveColumns(columns.map(c => c.id === id ? { ...c, visible: !c.visible } : c));

  // ---------- Filtering ----------
  const byStatus = (s) => orders.filter(o => (o.status || '').toLowerCase() === s.toLowerCase());
  const pending = byStatus('Pending');
  const dispatched = byStatus('Dispatched');
  const cancelled = byStatus('Cancelled');

  const range = DATE_RANGES.find(r => r.value === dateRange);
  const cutoff = (() => {
    if (!range || range.days === null) return null;
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - range.days);
    return d;
  })();
  const q = query.trim().toLowerCase();
  const filteredOrders = orders.filter(o => {
    if (activeTab !== 'All' && (o.status || '').toLowerCase() !== activeTab.toLowerCase()) return false;
    if (cutoff && (!o.createdAt || new Date(o.createdAt) < cutoff)) return false;
    if (q) {
      const hay = [o.orderNo, o.userName, o.userEmail, o.userMobile, o.companyName, ...(o.items || []).map(i => i.productName)]
        .filter(Boolean).join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  const pagedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);
  const filtersActive = activeTab !== 'All' || dateRange !== 'all' || !!q;

  const renderCell = (col, order) => {
    switch (col.id) {
      case 'orderNo':
        return <span className="code-link" style={{ fontWeight: 500 }}>{order.orderNo}</span>;
      case 'customer':
        return (
          <>
            <div style={{ fontWeight: 500 }}>{order.userName}</div>
            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{order.userEmail} | {order.userMobile}</div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 2 }}>{order.companyName}</div>
          </>
        );
      case 'items':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: '16rem' }}>
            {(order.items || []).map((item, i) => (
              <div key={i} style={{ fontSize: '0.8rem', background: '#f8fbff', border: '1px solid #e3ecf8', padding: '0.5rem 0.75rem', borderRadius: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600 }}>{item.productName}</span>
                  <span style={{ color: '#0d6efd', fontWeight: 600, background: '#e6f0ff', padding: '0.1rem 0.4rem', borderRadius: '0.3rem', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                    Qty: {item.quantity}
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', color: '#4b5563', fontSize: '0.72rem' }}>
                  {item.productCode && <span style={{ background: '#eef2f7', padding: '0.1rem 0.3rem', borderRadius: '0.25rem' }}><strong>ProductCode:</strong> {item.productCode}</span>}
                  {item.size && <span style={{ background: '#eef2f7', padding: '0.1rem 0.3rem', borderRadius: '0.25rem' }}><strong>Size:</strong> {item.size}</span>}
                  {item.packing && <span style={{ background: '#eef2f7', padding: '0.1rem 0.3rem', borderRadius: '0.25rem' }}><strong>Packing:</strong> {item.packing}</span>}
                  <span style={{ background: '#fff4dc', color: '#92400e', padding: '0.1rem 0.3rem', borderRadius: '0.25rem' }}><strong>UOM:</strong> {item.uom || 'Nos'}</span>
                  {item.total && <span style={{ background: '#dcfce7', color: '#166534', padding: '0.1rem 0.3rem', borderRadius: '0.25rem', fontWeight: 600 }}><strong>Total:</strong> {item.total}</span>}
                  {item.categoryName && <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.1rem 0.3rem', borderRadius: '0.25rem' }}>{item.categoryName}</span>}
                </div>
              </div>
            ))}
          </div>
        );
      case 'date':
        return <span style={{ color: '#6b7280' }}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</span>;
      case 'status':
        return (
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(order.id, e.target.value)}
            className={`status-select badge-${(order.status || 'pending').toLowerCase()}`}
          >
            <option value="Pending">Pending</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        );
      case 'actions':
        return (
          <div className="row-actions">
            <button onClick={() => handleDownloadPDF(order.id, order.orderNo)} className="btn btn-sm btn-outline">
              <Download size={14} /> PDF
            </button>
            <button onClick={() => handleDownloadExcel(order.id, order.orderNo)} className="btn btn-sm btn-excel">
              <FileSpreadsheet size={14} /> Excel
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const visibleCols = columns.filter(c => c.visible);
  const count = (list) => (loading ? '…' : list.length);

  return (
    <AdminLayout
      title="Quotation Requests"
      subtitle="Manage and track all quotation requests"
    >
      <div className="stat-grid" style={{ marginTop: '-0.6rem' }}>
        <StatCard compact tone="indigo" icon={<Icon name="document" size={30} />} value={count(orders)} label="Total Requests" sub="All quotation requests" spark={dailySeries(orders)} />
        <StatCard compact tone="orange" icon={<RoundGlyph bg="#f39a1c"><Clock size={20} strokeWidth={2.6} /></RoundGlyph>} value={count(pending)} label="Pending Action" sub="Awaiting admin action" spark={dailySeries(pending)} />
        <StatCard compact tone="sky" icon={<Icon name="truck" size={36} />} value={count(dispatched)} label="Dispatched" sub="Converted to orders" spark={dailySeries(dispatched)} />
        <StatCard compact tone="red" icon={<RoundGlyph bg="#ef3340"><X size={22} strokeWidth={3} /></RoundGlyph>} value={count(cancelled)} label="Cancelled" sub="Not processed" spark={dailySeries(cancelled)} />
      </div>

      <div className="ds-card" style={{ marginTop: '1.25rem' }}>
        {/* Action toolbar */}
        <div className="toolbar" style={{ padding: '1.35rem 1.75rem 1.1rem' }}>
          <div className="tabs">
            {[['All', orders], ['Pending', pending], ['Dispatched', dispatched], ['Cancelled', cancelled]].map(([tab]) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`tab${activeTab === tab ? ' active' : ''}`}>
                {tab}
              </button>
            ))}
          </div>

          <div className="toolbar-group" style={{ gap: '0.9rem' }}>
            <div className="select-ic">
              <CalendarDays size={22} className="lead-ic" fill="#1d2433" color="#fff" strokeWidth={1.6} />
              <select className="field" style={{ width: '14.6rem', borderColor: '#d6dce6' }} value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                {DATE_RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            <button className={`btn btn-outline${showFilter ? ' active' : ''}`} style={{ minWidth: '8.2rem' }} onClick={() => setShowFilter(!showFilter)}>
              <Icon name="filter" size={22} /> Filter
            </button>

            <div style={{ position: 'relative' }}>
              <button className="btn btn-outline" onClick={() => setShowColConfig(!showColConfig)}>
                <Icon name="setting" size={24} /> Configure Columns
              </button>

              {showColConfig && (
                <div className="popover">
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
        </div>

        {showFilter && (
          <div style={{ padding: '0 1.75rem 1.1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="search-field" style={{ width: '26rem', maxWidth: '100%' }}>
              <Search size={20} strokeWidth={2.4} className="search-ic" />
              <input
                type="text"
                autoFocus
                placeholder="Search order #, customer, mobile, company, product..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            {filtersActive && (
              <button className="link-btn" onClick={() => { setActiveTab('All'); setDateRange('all'); setQuery(''); }}>Clear all filters</button>
            )}
          </div>
        )}

        {/* Data table */}
        <div className="table-wrap">
          <table className="ds-table">
            <thead>
              <tr>
                {visibleCols.map(col => (
                  <th key={col.id} className={col.id === 'actions' || col.id === 'date' || col.id === 'status' ? 'center' : ''} style={col.id === 'orderNo' ? { paddingLeft: '2.8rem' } : undefined}>
                    {COLUMN_LABELS[col.id] || col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={visibleCols.length} className="empty-cell">Loading requests...</td></tr>
              ) : pagedOrders.map(order => (
                <tr key={order.id}>
                  {visibleCols.map(col => (
                    <td key={col.id} className={col.id === 'actions' || col.id === 'date' || col.id === 'status' ? 'center' : ''} style={col.id === 'orderNo' ? { paddingLeft: '2.8rem' } : undefined}>
                      {renderCell(col, order)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filteredOrders.length === 0 && (
          filtersActive && orders.length > 0 ? (
            <EmptyState
              title={`No ${activeTab === 'All' ? '' : activeTab.toLowerCase() + ' '}quotation requests found`}
              text="Nothing matches the selected filters."
              action={<button className="btn btn-primary" onClick={() => { setActiveTab('All'); setDateRange('all'); setQuery(''); }}>Clear Filters</button>}
            />
          ) : (
            <EmptyState
              title="No quotation requests found"
              text="When customers request quotations, they will appear here."
              action={<button className="btn btn-primary" onClick={() => fetchOrders()}><Icon name="refresh" size={22} /> Refresh</button>}
            />
          )
        )}

        <Pagination
          page={page}
          pageSize={pageSize}
          total={filteredOrders.length}
          onPageChange={setPage}
          onPageSizeChange={(n) => { setPageSize(n); setPage(1); }}
          itemLabel="requests"
        />
      </div>
    </AdminLayout>
  );
}
