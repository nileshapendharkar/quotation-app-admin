'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { 
  ShoppingCart, Users, Package, SlidersHorizontal, RefreshCw, 
  Clock, Eye, EyeOff, LayoutGrid, GripVertical, TrendingUp,
  BarChart3, PieChartIcon, Maximize2, Minimize2, Square, RectangleHorizontal,
  Zap, Radio
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, 
  ScatterChart, Scatter, ZAxis, Treemap, ComposedChart, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, Legend, CartesianGrid
} from 'recharts';

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Chart Type Selections State
  const [trendChartType, setTrendChartType] = useState('area'); 
  const [categoryChartType, setCategoryChartType] = useState('donut'); 
  const [statusChartType, setStatusChartType] = useState('progress'); 
  const [topProductsChartType, setTopProductsChartType] = useState('bar');

  // Default ordered widgets list
  const DEFAULT_WIDGETS = [
    { id: 'kpiSummary', label: 'Executive KPI Metrics Grid', visible: true, size: 'full', shape: 'rectangle' },
    { id: 'monthlyChart', label: 'Quotation Volume & Growth Trend', visible: true, size: 'medium', shape: 'rectangle' },
    { id: 'categoryPie', label: 'Product Category Market Share', visible: true, size: 'medium', shape: 'square' },
    { id: 'statusBars', label: 'Order Pipeline & Fulfillment SLA', visible: true, size: 'small', shape: 'square' },
    { id: 'topProducts', label: 'Top Quoted Catalog Items', visible: true, size: 'small', shape: 'square' },
    { id: 'quickActions', label: 'Management Operations Panel', visible: true, size: 'small', shape: 'square' },
    { id: 'recentOrders', label: 'Recent Customer Quotations Stream', visible: true, size: 'full', shape: 'rectangle' },
  ];

  const [widgetList, setWidgetList] = useState(DEFAULT_WIDGETS);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Palette
  const PALETTE = ['#4f46e5', '#10b981', '#f59e0b', '#06b6d4', '#ef4444', '#8b5cf6', '#0284c7', '#f97316'];

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    const saved = localStorage.getItem('custom_admin_widget_sizes_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = parsed.map(p => {
            const def = DEFAULT_WIDGETS.find(d => d.id === p.id);
            return { ...def, ...p };
          });
          DEFAULT_WIDGETS.forEach(d => {
            if (!merged.find(m => m.id === d.id)) merged.push(d);
          });
          setWidgetList(merged);
        }
      } catch(e) {}
    }

    fetchDashboardData(timeRange);
  }, []);

  // Handle Dynamic Time-Range Selection Change
  useEffect(() => {
    if (mounted) {
      fetchDashboardData(timeRange);
    }
  }, [timeRange]);

  // Handle Dynamic Auto-Refresh Polling (10-Second Interval)
  useEffect(() => {
    let interval = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchDashboardData(timeRange, true);
      }, 10000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, timeRange]);

  const saveWidgetOrder = (newList) => {
    setWidgetList(newList);
    localStorage.setItem('custom_admin_widget_sizes_v3', JSON.stringify(newList));
  };

  const setWidgetSize = (id, size) => {
    const updated = widgetList.map(w => w.id === id ? { ...w, size } : w);
    saveWidgetOrder(updated);
  };

  const setWidgetShape = (id, shape) => {
    const updated = widgetList.map(w => w.id === id ? { ...w, shape } : w);
    saveWidgetOrder(updated);
  };

  const toggleWidgetVisibility = (id) => {
    const updated = widgetList.map(w => w.id === id ? { ...w, visible: !w.visible } : w);
    saveWidgetOrder(updated);
  };

  // Drag and Drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
    e.target.style.opacity = '0.4';
  };

  const handleDragEnd = (e) => {
    setDraggedIndex(null);
    e.target.style.opacity = '1';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

    const newList = [...widgetList];
    const [draggedItem] = newList.splice(sourceIndex, 1);
    newList.splice(targetIndex, 0, draggedItem);
    saveWidgetOrder(newList);
    setDraggedIndex(null);
  };

  const fetchDashboardData = async (selectedRange = timeRange, isBackground = false) => {
    if (!isBackground) setLoading(true);
    const res = await apiFetch(`/admin/dashboard-stats?days=${selectedRange}`);
    if (res.success) {
      setStats(res.stats);
      setRecentOrders(res.recentOrders || []);
      setMonthlyTrend(res.monthlyTrend || []);
      setCategoryBreakdown(res.categoryBreakdown || []);
      setStatusBreakdown(res.statusBreakdown || []);
      setTopProducts(res.topProducts || []);
    }
    setLoading(false);
  };

  // Helper to compute CSS Grid colSpan & Height
  const getWidgetStyles = (widget) => {
    const size = widget.size || 'medium';
    const shape = widget.shape || 'rectangle';

    let gridSpan = 'span 6';
    if (size === 'small') gridSpan = 'span 4';
    if (size === 'medium') gridSpan = 'span 6';
    if (size === 'full') gridSpan = 'span 12';

    let chartHeight = 260;
    if (shape === 'square') {
      chartHeight = size === 'small' ? 240 : 320;
    } else {
      chartHeight = size === 'full' ? 280 : 260;
    }

    return { gridSpan, chartHeight, isSquare: shape === 'square' };
  };

  // Glassmorphism Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid #e5e7eb',
          padding: '10px 14px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          fontSize: '12px',
          color: '#1f2937'
        }}>
          <p style={{ fontWeight: '600', marginBottom: '6px', borderBottom: '1px solid #f3f4f6', paddingBottom: '4px', color: '#374151' }}>
            {label || payload[0].payload.name}
          </p>
          {payload.map((entry, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.color || entry.fill }}></span>
              <span style={{ color: '#6b7280' }}>{entry.name || 'Quantity'}:</span>
              <span style={{ fontWeight: '700', color: '#111827' }}>{entry.value} Units</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Dynamic Trend Chart Renderer
  const renderTrendChart = () => {
    const chartData = monthlyTrend.length > 0 ? monthlyTrend : [
      { month: 'Jan', count: 12 }, { month: 'Feb', count: 19 }, { month: 'Mar', count: 15 },
      { month: 'Apr', count: 22 }, { month: 'May', count: 28 }, { month: 'Jun', count: 35 }
    ];

    switch (trendChartType) {
      case 'line':
        return (
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={3.5} dot={{ r: 5, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
          </LineChart>
        );
      case 'column':
        return (
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={48} />
          </BarChart>
        );
      case 'bar':
        return (
          <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
            <XAxis type="number" stroke="#9ca3af" fontSize={12} allowDecimals={false} tickLine={false} axisLine={false} />
            <YAxis dataKey="month" type="category" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} maxBarSize={28} />
          </BarChart>
        );
      case 'composed':
        return (
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill="#c7d2fe" radius={[6, 6, 0, 0]} maxBarSize={48} />
            <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5' }} />
          </ComposedChart>
        );
      case 'area':
      default:
        return (
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradientTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={3.5} fillOpacity={1} fill="url(#gradientTrend)" />
          </AreaChart>
        );
    }
  };

  // Dynamic Category Chart Renderer
  const renderCategoryChart = () => {
    const chartData = categoryBreakdown.length > 0 ? categoryBreakdown : [
      { name: 'Water Storage Tanks', value: 45 },
      { name: 'Pipes & Fittings', value: 28 },
      { name: 'Valves & Accessories', value: 18 }
    ];

    switch (categoryChartType) {
      case 'pie':
        return (
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" outerRadius={85} dataKey="value" stroke="#fff" strokeWidth={2}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          </PieChart>
        );
      case 'treemap':
        return (
          <Treemap
            data={chartData}
            dataKey="value"
            nameKey="name"
            stroke="#fff"
            fill="#4f46e5"
            content={({ x, y, width, height, index, name, value }) => {
              if (width < 32 || height < 24) return null;
              return (
                <g>
                  <rect x={x} y={y} width={width} height={height} fill={PALETTE[index % PALETTE.length]} rx={6} ry={6} stroke="#fff" strokeWidth={2} />
                  <text x={x + width / 2} y={y + height / 2 - 4} textAnchor="middle" fill="#fff" fontSize={12} fontWeight="600">
                    {name}
                  </text>
                  <text x={x + width / 2} y={y + height / 2 + 12} textAnchor="middle" fill="#ffffffcc" fontSize={11}>
                    {value} Units
                  </text>
                </g>
              );
            }}
          />
        );
      case 'column':
        return (
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
              ))}
            </Bar>
          </BarChart>
        );
      case 'bar':
        return (
          <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
            <XAxis type="number" stroke="#9ca3af" fontSize={12} allowDecimals={false} tickLine={false} axisLine={false} />
            <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={24}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
              ))}
            </Bar>
          </BarChart>
        );
      case 'donut':
      default:
        return (
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" stroke="#fff" strokeWidth={2}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          </PieChart>
        );
    }
  };

  // Dynamic Status Chart Renderer
  const renderStatusChart = () => {
    const chartData = statusBreakdown.length > 0 ? statusBreakdown : [
      { name: 'Pending', count: 5, color: '#faad14' },
      { name: 'Approved', count: 12, color: '#1677ff' },
      { name: 'Dispatched', count: 8, color: '#52c41a' },
      { name: 'Delivered', count: 15, color: '#13c2c2' }
    ];

    switch (statusChartType) {
      case 'column':
        return (
          <div style={{ width: '100%', height: 210, minHeight: 200 }}>
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {chartData.map((s, idx) => (
                    <Cell key={idx} fill={s.color || PALETTE[idx]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case 'bubble':
      case 'scatter':
        const scatterData = chartData.map((s, idx) => ({
          x: idx + 1,
          y: s.count,
          z: (s.count + 1) * 140,
          name: s.name,
          color: s.color || PALETTE[idx]
        }));
        return (
          <div style={{ width: '100%', height: 210, minHeight: 200 }}>
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
              <ScatterChart margin={{ top: 10, right: 20, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis type="number" dataKey="x" name="Status Index" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis type="number" dataKey="y" name="Quotations Count" stroke="#9ca3af" fontSize={11} allowDecimals={false} tickLine={false} axisLine={false} />
                <ZAxis type="number" dataKey="z" range={[120, 600]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                <Scatter data={scatterData}>
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        );
      case 'progress':
      default:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' }}>
            {chartData.map((s) => {
              const pct = stats?.totalOrders ? Math.round((s.count / stats.totalOrders) * 100) : 25;
              return (
                <div key={s.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '600', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }}></span>
                      {s.name}
                    </span>
                    <span style={{ fontWeight: '700', color: '#111827' }}>
                      {s.count} <span style={{ fontWeight: 'normal', color: '#9ca3af', fontSize: '12px' }}>({pct}%)</span>
                    </span>
                  </div>
                  <div style={{ height: '8px', width: '100%', background: '#f3f4f6', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: s.color, borderRadius: '6px', transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        );
    }
  };

  // Dynamic Top Products Chart Renderer
  const renderTopProductsChart = (widgetSize) => {
    const chartData = topProducts.length > 0 ? topProducts : [
      { name: 'Standard Water Tank 1000L', quantity: 18 },
      { name: 'Heavy Duty PVC Pipe 100mm', quantity: 15 },
      { name: 'Brass Gate Valve 2 inch', quantity: 12 },
      { name: 'Tri-Layer Tank 500L', quantity: 9 },
      { name: 'CPVC Connector Socket', quantity: 6 }
    ];

    const displayItems = chartData.slice(0, widgetSize === 'small' ? 4 : 5);

    switch (topProductsChartType) {
      case 'column':
        return (
          <div style={{ width: '100%', height: 210, minHeight: 200 }}>
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
              <BarChart data={displayItems} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => val.length > 10 ? val.substring(0, 10) + '...' : val} />
                <YAxis stroke="#9ca3af" fontSize={11} allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="quantity" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={36}>
                  {displayItems.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case 'donut':
        return (
          <div style={{ width: '100%', height: 210, minHeight: 200 }}>
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
              <PieChart>
                <Pie data={displayItems} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="quantity" nameKey="name" stroke="#fff" strokeWidth={2}>
                  {displayItems.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      case 'list':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {displayItems.map((p, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#e0e7ff', color: '#4f46e5', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {idx + 1}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>{p.name}</span>
                </div>
                <span style={{ padding: '2px 8px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', borderRadius: '10px', fontSize: '11px', fontWeight: '600' }}>
                  {p.quantity} Units
                </span>
              </div>
            ))}
          </div>
        );
      case 'bar':
      default:
        return (
          <div style={{ width: '100%', height: 210, minHeight: 200 }}>
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
              <BarChart data={displayItems} layout="vertical" margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" stroke="#9ca3af" fontSize={11} allowDecimals={false} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} width={90} tickFormatter={(val) => val.length > 12 ? val.substring(0, 12) + '...' : val} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="quantity" radius={[0, 6, 6, 0]} maxBarSize={22}>
                  {displayItems.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
    }
  };

  // Card Size Controls
  const renderCardSizeControls = (widget) => {
    const currentSize = widget.size || 'medium';
    const currentShape = widget.shape || 'rectangle';

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f3f4f6', padding: '2px 4px', borderRadius: '6px' }}>
        {['small', 'medium', 'full'].map((sz) => (
          <button
            key={sz}
            onClick={() => setWidgetSize(widget.id, sz)}
            style={{
              padding: '2px 6px',
              fontSize: '11px',
              fontWeight: currentSize === sz ? '700' : '500',
              color: currentSize === sz ? '#4f46e5' : '#6b7280',
              background: currentSize === sz ? '#fff' : 'transparent',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              boxShadow: currentSize === sz ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
            }}
            title={`Set size to ${sz.toUpperCase()}`}
          >
            {sz === 'small' ? 'S' : sz === 'medium' ? 'M' : 'Full'}
          </button>
        ))}

        <div style={{ width: '1px', height: '14px', background: '#e5e7eb', margin: '0 2px' }}></div>

        <button
          onClick={() => setWidgetShape(widget.id, currentShape === 'square' ? 'rectangle' : 'square')}
          style={{
            padding: '2px 4px',
            color: '#6b7280',
            background: 'transparent',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
          title={`Toggle Shape (Current: ${currentShape})`}
        >
          {currentShape === 'square' ? <Square size={13} color="#4f46e5" /> : <RectangleHorizontal size={14} color="#4f46e5" />}
        </button>
      </div>
    );
  };

  // Render individual widget component by ID
  const renderWidgetContent = (widget) => {
    const { chartHeight } = getWidgetStyles(widget);

    switch (widget.id) {
      case 'kpiSummary':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', width: '100%' }}>
            <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Total Quotations ({timeRange})</span>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingCart size={20} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <span style={{ fontSize: '28px', fontWeight: '800', color: '#111827' }}>{loading ? '...' : stats?.totalOrders || 0}</span>
                <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                  <TrendingUp size={14} style={{ marginRight: '2px' }} /> Dynamic
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>Live Couchbase Capella Stream</div>
            </div>

            <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Pending Action</span>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={20} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <span style={{ fontSize: '28px', fontWeight: '800', color: '#111827' }}>{loading ? '...' : stats?.pendingOrders || 0}</span>
                <span className="badge badge-pending" style={{ fontSize: '11px' }}>Review Required</span>
              </div>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>Awaiting Admin Dispatch</div>
            </div>

            <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Authorized App Users</span>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={20} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <span style={{ fontSize: '28px', fontWeight: '800', color: '#111827' }}>{loading ? '...' : stats?.totalUsers || 0}</span>
                <span style={{ fontSize: '12px', color: '#059669', fontWeight: '600' }}>
                  {stats?.activeUsers || 0} Active
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>{stats?.inactiveUsers || 0} Accounts Inactive</div>
            </div>

            <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Master Product Items</span>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={20} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <span style={{ fontSize: '28px', fontWeight: '800', color: '#111827' }}>{loading ? '...' : stats?.totalProducts || 0}</span>
                <span style={{ fontSize: '12px', color: '#7c3aed', fontWeight: '600' }}>
                  {stats?.totalCategories || 0} Categories
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>{stats?.activeProducts || 0} Active Items</div>
            </div>
          </div>
        );

      case 'monthlyChart':
        return (
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', width: '100%', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart3 size={18} color="#4f46e5" /> Volume Trend ({timeRange})
                </h3>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {renderCardSizeControls(widget)}

                <div style={{ display: 'flex', gap: '2px', background: '#f3f4f6', padding: '2px', borderRadius: '6px' }}>
                  {['area', 'line', 'column', 'composed'].map(type => (
                    <button
                      key={type}
                      onClick={() => setTrendChartType(type)}
                      style={{
                        padding: '3px 8px', fontSize: '11px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                        background: trendChartType === type ? '#fff' : 'transparent',
                        color: trendChartType === type ? '#4f46e5' : '#6b7280',
                        fontWeight: trendChartType === type ? '700' : 'normal'
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div style={{ width: '100%', height: chartHeight, minHeight: 220 }}>
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                  {renderTrendChart()}
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '100%', width: '100%', background: '#f9fafb', borderRadius: '8px' }}></div>
              )}
            </div>
          </div>
        );

      case 'categoryPie':
        return (
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', width: '100%', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PieChartIcon size={18} color="#10b981" /> Category Share ({timeRange})
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {renderCardSizeControls(widget)}

                <div style={{ display: 'flex', gap: '2px', background: '#f3f4f6', padding: '2px', borderRadius: '6px' }}>
                  {['donut', 'pie', 'treemap', 'column'].map(type => (
                    <button
                      key={type}
                      onClick={() => setCategoryChartType(type)}
                      style={{
                        padding: '3px 8px', fontSize: '11px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                        background: categoryChartType === type ? '#fff' : 'transparent',
                        color: categoryChartType === type ? '#10b981' : '#6b7280',
                        fontWeight: categoryChartType === type ? '700' : 'normal'
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ width: '100%', height: chartHeight, minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                  {renderCategoryChart()}
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '100%', width: '100%', background: '#f9fafb', borderRadius: '8px' }}></div>
              )}
            </div>
          </div>
        );

      case 'statusBars':
        return (
          <div className="glass-card" style={{ padding: '24px', width: '100%', height: '100%', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>
                Pipeline SLA
              </h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {renderCardSizeControls(widget)}

                <div style={{ display: 'flex', gap: '2px', background: '#f3f4f6', padding: '2px', borderRadius: '6px' }}>
                  {['progress', 'column', 'bubble'].map(type => (
                    <button
                      key={type}
                      onClick={() => setStatusChartType(type)}
                      style={{
                        padding: '3px 6px', fontSize: '10px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                        background: statusChartType === type ? '#fff' : 'transparent',
                        color: statusChartType === type ? '#4f46e5' : '#6b7280',
                        fontWeight: statusChartType === type ? '700' : 'normal'
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {renderStatusChart()}
          </div>
        );

      case 'topProducts':
        return (
          <div className="glass-card" style={{ padding: '24px', width: '100%', height: '100%', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>
                Top Items ({timeRange})
              </h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {renderCardSizeControls(widget)}

                <div style={{ display: 'flex', gap: '2px', background: '#f3f4f6', padding: '2px', borderRadius: '6px' }}>
                  {['bar', 'column', 'donut', 'list'].map(type => (
                    <button
                      key={type}
                      onClick={() => setTopProductsChartType(type)}
                      style={{
                        padding: '3px 6px', fontSize: '10px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                        background: topProductsChartType === type ? '#fff' : 'transparent',
                        color: topProductsChartType === type ? '#10b981' : '#6b7280',
                        fontWeight: topProductsChartType === type ? '700' : 'normal'
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {mounted ? renderTopProductsChart(widget.size) : <div style={{ height: 200, background: '#f9fafb', borderRadius: '8px' }}></div>}
          </div>
        );

      case 'quickActions':
        return (
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>
                  Management Panel
                </h3>
                {renderCardSizeControls(widget)}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={() => router.push('/users')} className="btn-secondary" style={{ padding: '10px 14px', justifyContent: 'flex-start', fontSize: '13px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <Users size={16} color="#4f46e5" /> Manage Users
                </button>
                <button onClick={() => router.push('/products')} className="btn-secondary" style={{ padding: '10px 14px', justifyContent: 'flex-start', fontSize: '13px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <Package size={16} color="#10b981" /> Edit Catalog Products
                </button>
                <button onClick={() => router.push('/orders')} className="btn-secondary" style={{ padding: '10px 14px', justifyContent: 'flex-start', fontSize: '13px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <ShoppingCart size={16} color="#f59e0b" /> Review Quotations
                </button>
              </div>
            </div>

            <div style={{ marginTop: '16px', padding: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', fontSize: '11px', color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={14} color="#16a34a" /> 
              <span>Dynamic Couchbase Sync</span>
            </div>
          </div>
        );

      case 'recentOrders':
        return (
          <div className="glass-card" style={{ padding: '24px', width: '100%', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>Recent Quotation Stream ({timeRange})</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {renderCardSizeControls(widget)}
                <button onClick={() => router.push('/orders')} className="btn-secondary" style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px' }}>
                  View All →
                </button>
              </div>
            </div>

            {recentOrders.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#9ca3af' }}>No quotations in this time window.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '10px 16px', background: '#f9fafb', color: '#6b7280', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Quotation #</th>
                      <th style={{ padding: '10px 16px', background: '#f9fafb', color: '#6b7280', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Customer Name</th>
                      <th style={{ padding: '10px 16px', background: '#f9fafb', color: '#6b7280', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Items Count</th>
                      <th style={{ padding: '10px 16px', background: '#f9fafb', color: '#6b7280', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '10px 16px', background: '#f9fafb', color: '#6b7280', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order.id}>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', fontWeight: '700', color: '#4f46e5', fontSize: '13px', fontFamily: 'monospace' }}>{order.orderNo}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', fontSize: '13px', fontWeight: '600', color: '#111827' }}>{order.userName}</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', fontSize: '13px', color: '#4b5563' }}>{order.items?.length || 1} Items</td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
                          <span className={`badge badge-${(order.status || 'pending').toLowerCase()}`}>
                            {order.status || 'Pending'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', fontSize: '12px', color: '#9ca3af' }}>
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const visibleWidgets = widgetList.filter(w => w.visible);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-body)' }}>
      <Sidebar />
      <Navbar />
      
      <main style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Executive Header Toolbar with Dynamic Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: '#fff', padding: '20px 24px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <LayoutGrid size={24} color="#4f46e5" /> Executive Dynamic Dashboard
            </h1>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
              100% Dynamic Data Visualizations with live time-range filtering and Couchbase Capella polling.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Dynamic Time Range Filter */}
            <select
              className="glass-input"
              style={{ height: '38px', width: '150px', fontSize: '13px', borderRadius: '8px', border: '1px solid #e5e7eb', fontWeight: '600' }}
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="ytd">Year to Date</option>
              <option value="all">All Time</option>
            </select>

            {/* Dynamic Live Polling Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              style={{
                height: '38px',
                padding: '0 14px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: '600',
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
                background: autoRefresh ? '#ecfdf5' : '#fff',
                color: autoRefresh ? '#047857' : '#4b5563'
              }}
              title="Toggle 10s Live Auto-Polling"
            >
              <Radio size={16} color={autoRefresh ? '#047857' : '#9ca3af'} className={autoRefresh ? 'spin' : ''} />
              {autoRefresh ? 'Live Polling ON' : 'Live Polling OFF'}
            </button>

            <button
              onClick={() => fetchDashboardData(timeRange)}
              className="btn-secondary"
              style={{ height: '38px', padding: '0 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Refresh Analytics Data"
            >
              <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
            </button>

            <button
              onClick={() => setShowCustomizeModal(true)}
              className="btn-primary"
              style={{ height: '38px', padding: '0 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', background: '#4f46e5' }}
            >
              <SlidersHorizontal size={16} /> Customize Layout
            </button>
          </div>
        </div>

        {/* Dynamic 12-Column Flexible Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px', width: '100%' }}>
          {visibleWidgets.map(widget => {
            const { gridSpan } = getWidgetStyles(widget);
            return (
              <div key={widget.id} style={{ gridColumn: gridSpan, minWidth: 0 }}>
                {renderWidgetContent(widget)}
              </div>
            );
          })}
        </div>
      </main>

      {/* Modal: Drag & Drop & Resizing Configurator */}
      {showCustomizeModal && (
        <div className="modal-overlay" onClick={() => setShowCustomizeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SlidersHorizontal size={20} color="#4f46e5" /> Layout & Card Size Configurator
            </h3>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
              <strong>Drag & Drop</strong> to reorder. Adjust card sizes (S, M, Full) and shapes (Rectangle vs Square).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {widgetList.map((item, index) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: draggedIndex === index ? '#e0e7ff' : '#f9fafb',
                    border: `1px solid ${draggedIndex === index ? '#818cf8' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    cursor: 'grab',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <GripVertical size={16} color="#9ca3af" />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>{item.label}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <select
                      value={item.size || 'medium'}
                      onChange={(e) => setWidgetSize(item.id, e.target.value)}
                      style={{ fontSize: '12px', padding: '2px 6px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                    >
                      <option value="small">Small (1/3 Width)</option>
                      <option value="medium">Medium (1/2 Width)</option>
                      <option value="full">Full Width (1/1)</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setWidgetShape(item.id, item.shape === 'square' ? 'rectangle' : 'square')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                      title="Toggle Rectangle / Square Shape"
                    >
                      {item.shape === 'square' ? <Square size={16} color="#4f46e5" /> : <RectangleHorizontal size={16} color="#4f46e5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleWidgetVisibility(item.id)}
                      style={{ background: 'none', border: 'none', color: item.visible ? '#4f46e5' : '#9ca3af', cursor: 'pointer', padding: '2px' }}
                      title={item.visible ? 'Hide Widget' : 'Show Widget'}
                    >
                      {item.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                className="btn-secondary"
                onClick={() => saveWidgetOrder(DEFAULT_WIDGETS)}
                style={{ fontSize: '12px', borderRadius: '6px' }}
              >
                Reset Default Sizes
              </button>
              <button className="btn-primary" onClick={() => setShowCustomizeModal(false)} style={{ background: '#4f46e5', borderRadius: '6px' }}>
                Save & Apply Layout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
