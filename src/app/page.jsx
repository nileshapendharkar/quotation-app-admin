'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Icon from '@/components/Icon';
import { StatCard, RoundGlyph } from '@/components/ui';
import {
  Eye, EyeOff, GripVertical, BarChart3, Settings, History, List, ChevronRight,
  CalendarDays, Square, RectangleHorizontal, Clock,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  ScatterChart, Scatter, ZAxis, Treemap, ComposedChart, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';

// Colours taken from the designer's dashboard screen
const PALETTE = ['#2f4392', '#1eb9ff', '#fead49', '#8b6dfb', '#22c55e', '#f43f5e', '#0ea5e9', '#94a3b8'];
const TOP_ITEM_COLORS = ['#2f4392', '#1eb9ff', '#9bd3fe', '#bdabfc', '#ffc078'];
const STATUS_COLORS = { Pending: '#fead49', Approved: '#1eb9ff', Dispatched: '#1eb9ff', Delivered: '#45c142', Rejected: '#ff1f1f', Cancelled: '#ff1f1f' };
const CORE_STATUSES = ['Pending', 'Approved', 'Rejected', 'Dispatched', 'Cancelled'];

const RANGE_LABELS = { '7days': 'Last 7 Days', '30days': 'Last 30 Days', '90days': 'Last 90 Days', ytd: 'Year to Date', all: 'All Time' };
const RANGE_SHORT = { '7days': '7 Days', '30days': '30 Days', '90days': '90 Days', ytd: 'YTD', all: 'All Time' };

// Grid widths a widget can take (12-column grid)
const SIZE_SPANS = { small: 4, compact: 5, medium: 6, large: 7, wide: 8, full: 12 };
const SIZE_LABELS = { small: 'Small (1/3)', compact: 'Compact (5/12)', medium: 'Medium (1/2)', large: 'Large (7/12)', wide: 'Wide (2/3)', full: 'Full width' };

const CHART_TYPES = {
  monthlyChart: ['area', 'line', 'column', 'composed'],
  categoryPie: ['donut', 'pie', 'treemap', 'column'],
  statusBars: ['progress', 'column', 'bubble'],
  topProducts: ['bar', 'column', 'donut', 'list'],
};

// Default ordered widgets list (layout follows the designer screen)
const DEFAULT_WIDGETS = [
  { id: 'kpiSummary', label: 'Executive KPI Metrics Grid', visible: true, size: 'full', shape: 'rectangle' },
  { id: 'monthlyChart', label: 'Quotation Volume Trend', visible: true, size: 'large', shape: 'rectangle' },
  { id: 'categoryPie', label: 'Category Share', visible: true, size: 'compact', shape: 'rectangle' },
  { id: 'statusBars', label: 'Pipeline SLA', visible: true, size: 'small', shape: 'square' },
  { id: 'topProducts', label: 'Top Items', visible: true, size: 'small', shape: 'square' },
  { id: 'quickActions', label: 'Management Panel', visible: true, size: 'small', shape: 'square' },
  { id: 'recentOrders', label: 'Recent Quotation Stream', visible: true, size: 'full', shape: 'rectangle' },
];
const LAYOUT_KEY = 'custom_admin_widget_sizes_v5';
const CHART_TYPES_KEY = 'custom_admin_chart_types_v1';

// Card header used by every dashboard widget: round icon, title, optional subtitle, right-side action
function WidgetHead({ icon, title, sub, right }) {
  return (
    <div className="card-head">
      <span className="card-head-ic">{icon}</span>
      <div className="card-head-text">
        <div className={`card-title${sub ? ' blue' : ''}`}>{title}</div>
        {sub && <div className="card-sub">{sub}</div>}
      </div>
      {right}
    </div>
  );
}

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

  // Chart type selections
  const [chartTypes, setChartTypes] = useState({ monthlyChart: 'area', categoryPie: 'donut', statusBars: 'progress', topProducts: 'bar' });

  const [widgetList, setWidgetList] = useState(DEFAULT_WIDGETS);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const saved = localStorage.getItem(LAYOUT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = parsed
            .filter(p => DEFAULT_WIDGETS.find(d => d.id === p.id))
            .map(p => ({ ...DEFAULT_WIDGETS.find(d => d.id === p.id), ...p }));
          DEFAULT_WIDGETS.forEach(d => { if (!merged.find(m => m.id === d.id)) merged.push(d); });
          setWidgetList(merged);
        }
      } catch (e) {}
    }
    try {
      const savedTypes = JSON.parse(localStorage.getItem(CHART_TYPES_KEY) || 'null');
      if (savedTypes) setChartTypes(prev => ({ ...prev, ...savedTypes }));
    } catch (e) {}

    fetchDashboardData(timeRange);
  }, []);

  // Re-fetch when the time range changes
  useEffect(() => {
    if (mounted) fetchDashboardData(timeRange);
  }, [timeRange]);

  // Live polling every 10 seconds
  useEffect(() => {
    let interval = null;
    if (autoRefresh) {
      interval = setInterval(() => fetchDashboardData(timeRange, true), 10000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [autoRefresh, timeRange]);

  const saveWidgetOrder = (newList) => {
    setWidgetList(newList);
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(newList));
  };
  const setWidgetSize = (id, size) => saveWidgetOrder(widgetList.map(w => w.id === id ? { ...w, size } : w));
  const setWidgetShape = (id, shape) => saveWidgetOrder(widgetList.map(w => w.id === id ? { ...w, shape } : w));
  const toggleWidgetVisibility = (id) => saveWidgetOrder(widgetList.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  const setChartType = (id, type) => {
    const next = { ...chartTypes, [id]: type };
    setChartTypes(next);
    localStorage.setItem(CHART_TYPES_KEY, JSON.stringify(next));
  };

  // Drag and drop (customize modal)
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
  };
  const handleDragEnd = () => setDraggedIndex(null);
  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
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

  const getChartHeight = (widget) => {
    const size = widget.size || 'medium';
    if (widget.shape === 'square') return size === 'small' ? 240 : 300;
    return size === 'full' ? 280 : 245;
  };

  const rangeShort = RANGE_SHORT[timeRange] || timeRange;

  // ---------- Tooltips ----------
  const TrendTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="chart-tooltip dark-pill">
        <div className="tip-month">{label}</div>
        <div className="tip-value">{payload[0].value} Quotations</div>
      </div>
    );
  };
  const ValueTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="chart-tooltip">
        <div>{label || payload[0].payload.name}</div>
        <div>{payload[0].value} Units</div>
      </div>
    );
  };

  const axisProps = { stroke: '#94a3b8', fontSize: 12, tickLine: false, axisLine: false };

  // ---------- Quotation trend ----------
  const trendData = monthlyTrend.length > 0 && monthlyTrend.some(m => m.count > 0) ? monthlyTrend : [
    { month: 'Jan', count: 10 }, { month: 'Feb', count: 18 }, { month: 'Mar', count: 15 },
    { month: 'Apr', count: 22 }, { month: 'May', count: 27 }, { month: 'Jun', count: 38 },
  ];

  const renderTrendChart = () => {
    const grid = <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e5eaf3" />;
    switch (chartTypes.monthlyChart) {
      case 'line':
        return (
          <LineChart data={trendData} margin={{ top: 15, right: 16, left: -20, bottom: 0 }}>
            {grid}
            <XAxis dataKey="month" {...axisProps} />
            <YAxis allowDecimals={false} {...axisProps} />
            <Tooltip content={<TrendTooltip />} />
            <Line type="monotone" dataKey="count" stroke="#2f4392" strokeWidth={2.5} dot={{ r: 4, fill: '#2f4392', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
          </LineChart>
        );
      case 'column':
        return (
          <BarChart data={trendData} margin={{ top: 15, right: 16, left: -20, bottom: 0 }}>
            {grid}
            <XAxis dataKey="month" {...axisProps} />
            <YAxis allowDecimals={false} {...axisProps} />
            <Tooltip content={<TrendTooltip />} cursor={{ fill: '#eef3fb' }} />
            <Bar dataKey="count" fill="#2f4392" radius={[6, 6, 0, 0]} maxBarSize={44} />
          </BarChart>
        );
      case 'composed':
        return (
          <ComposedChart data={trendData} margin={{ top: 15, right: 16, left: -20, bottom: 0 }}>
            {grid}
            <XAxis dataKey="month" {...axisProps} />
            <YAxis allowDecimals={false} {...axisProps} />
            <Tooltip content={<TrendTooltip />} cursor={{ fill: '#eef3fb' }} />
            <Bar dataKey="count" fill="#c9d4f6" radius={[6, 6, 0, 0]} maxBarSize={44} />
            <Line type="monotone" dataKey="count" stroke="#2f4392" strokeWidth={2.5} dot={{ r: 4, fill: '#2f4392' }} />
          </ComposedChart>
        );
      case 'area':
      default:
        return (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <AreaChart data={trendData} margin={{ top: 15, right: 16, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradientTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4361ee" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#4361ee" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              {grid}
              <XAxis dataKey="month" {...axisProps} />
              <YAxis allowDecimals={false} {...axisProps} domain={[0, 40]} ticks={[0, 10, 20, 30, 40]} />
              <Tooltip content={<TrendTooltip />} cursor={{ stroke: '#9fb0e6', strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey="count" stroke="#2f4392" strokeWidth={2.5} fill="url(#gradientTrend)"
                dot={{ r: 3, fill: '#2f4392', stroke: '#fff', strokeWidth: 1.5 }}
                activeDot={{ r: 6, fill: '#2f4392', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </div>
        );
    }
  };

  // ---------- Category share ----------
  const categoryData = (() => {
    if (categoryBreakdown && categoryBreakdown.length > 0 && categoryBreakdown.some(c => (c.value || c.count) > 0)) {
      const raw = categoryBreakdown.map(c => ({ name: c.name, value: c.value || c.count })).filter(c => c.value > 0).sort((a, b) => b.value - a.value);
      if (raw.length <= 4) return raw;
      const top = raw.slice(0, 3);
      const others = raw.slice(3).reduce((s, c) => s + c.value, 0);
      return [...top, { name: 'Others', value: others }];
    }
    return [
      { name: 'Pipes & Fittings', value: 54, pct: 42, color: '#2f4392' },
      { name: 'Valves & Accessoris', value: 36, pct: 28, color: '#1eb9ff' },
      { name: 'Water Storage Tanks', value: 26, pct: 20, color: '#fead49' },
      { name: 'Others', value: 12, pct: 10, color: '#8b6dfb' },
    ];
  })();
  const categoryTotal = stats?.totalProducts || 128;

  const renderCategoryChart = (height) => {
    const type = chartTypes.categoryPie;
    if (type === 'treemap') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <Treemap data={categoryData} dataKey="value" nameKey="name" stroke="#fff"
            content={({ x, y, width, height: h, index, name, value }) => {
              if (width < 32 || h < 24) return null;
              return (
                <g>
                  <rect x={x} y={y} width={width} height={h} fill={categoryData[index]?.color || PALETTE[index % PALETTE.length]} rx={8} ry={8} stroke="#fff" strokeWidth={3} />
                  <text x={x + width / 2} y={y + h / 2 - 4} textAnchor="middle" fill="#fff" fontSize={12} fontWeight="600">{name}</text>
                  <text x={x + width / 2} y={y + h / 2 + 12} textAnchor="middle" fill="#ffffffcc" fontSize={11}>{value} Units</text>
                </g>
              );
            }}
          />
        </ResponsiveContainer>
      );
    }
    if (type === 'column') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e5eaf3" />
            <XAxis dataKey="name" {...axisProps} fontSize={11} tickFormatter={(v) => v.length > 12 ? v.slice(0, 12) + '…' : v} />
            <YAxis allowDecimals={false} {...axisProps} />
            <Tooltip content={<ValueTooltip />} cursor={{ fill: '#eef3fb' }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40}>
              {categoryData.map((e, i) => <Cell key={i} fill={e.color || PALETTE[i % PALETTE.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }
    // donut (default) and pie: chart + legend side by side, like the design
    const isDonut = type !== 'pie';
    const sumVal = categoryData.reduce((s, c) => s + c.value, 0) || 1;
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', width: '100%' }}>
        <div className="donut-wrap" style={{ width: height, height, flexShrink: 0, position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={isDonut ? '58%' : 0} outerRadius="92%"
                dataKey="value" stroke="#fff" strokeWidth={3} startAngle={90} endAngle={-270}>
                {categoryData.map((e, i) => <Cell key={i} fill={e.color || PALETTE[i % PALETTE.length]} />)}
              </Pie>
              <Tooltip content={<ValueTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {isDonut && (
            <div className="donut-center">
              <span className="dn-sub">Total</span>
              <strong className="dn-num">{categoryTotal}</strong>
              <span className="dn-sub">Items</span>
            </div>
          )}
        </div>
        <div className="legend-list" style={{ flex: 1 }}>
          {categoryData.map((c, i) => {
            const pct = c.pct !== undefined ? c.pct : Math.round((c.value / sumVal) * 100);
            return (
              <div key={c.name} className="legend-item">
                <span className="sw" style={{ background: c.color || PALETTE[i % PALETTE.length] }} />
                <span className="nm" title={c.name}>{c.name}</span>
                <span className="pc">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ---------- Pipeline SLA (status) ----------
  const statusData = (() => {
    if (statusBreakdown && statusBreakdown.length > 0 && statusBreakdown.some(s => s.count > 0)) {
      return statusBreakdown.map(s => ({
        name: s.name,
        count: s.count,
        color: STATUS_COLORS[s.name] || '#94a3b8',
      }));
    }
    return [
      { name: 'Pending', count: 5, pct: 25, color: '#fead49' },
      { name: 'Approved', count: 12, pct: 60, color: '#1eb9ff' },
      { name: 'Rejected', count: 3, pct: 15, color: '#ff1f1f' },
    ];
  })();
  const statusTotal = stats?.totalOrders || statusData.reduce((a, b) => a + b.count, 0) || 20;

  const renderStatusChart = () => {
    switch (chartTypes.statusBars) {
      case 'column':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e5eaf3" />
              <XAxis dataKey="name" {...axisProps} />
              <YAxis allowDecimals={false} {...axisProps} />
              <Tooltip content={<ValueTooltip />} cursor={{ fill: '#eef3fb' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {statusData.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case 'bubble': {
        const scatterData = statusData.map((s, idx) => ({ x: idx + 1, y: s.count, z: (s.count + 1) * 140, name: s.name, color: s.color }));
        return (
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart margin={{ top: 10, right: 20, left: -20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e5eaf3" />
              <XAxis type="number" dataKey="x" name="Status" {...axisProps} fontSize={11} />
              <YAxis type="number" dataKey="y" name="Quotations" allowDecimals={false} {...axisProps} fontSize={11} />
              <ZAxis type="number" dataKey="z" range={[120, 600]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<ValueTooltip />} />
              <Scatter data={scatterData}>
                {scatterData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        );
      }
      case 'progress':
      default:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem', marginTop: '0.4rem' }}>
            {statusData.map((s) => {
              const pct = s.pct !== undefined ? s.pct : (statusTotal ? Math.round((s.count / statusTotal) * 100) : 0);
              return (
                <div key={s.name} className="bar-row">
                  <span className="lbl">{s.name}</span>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${pct}%`, background: s.color }} /></div>
                  <span className="val">{s.count} <em>({pct}%)</em></span>
                </div>
              );
            })}
          </div>
        );
    }
  };

  // ---------- Top items ----------
  const topProductsItems = (() => {
    if (topProducts && topProducts.length > 0 && topProducts.some(p => p.quantity > 0)) {
      return topProducts.slice(0, 4);
    }
    return [
      { name: 'Water Storage Tanks', quantity: 48 },
      { name: 'UPVC Pipes', quantity: 32 },
      { name: 'CPVC Pipes', quantity: 25 },
      { name: 'Fittings & Valves', quantity: 18 },
    ];
  })();

  const renderTopProductsChart = (widgetSize) => {
    const items = topProductsItems;
    const max = Math.max(...items.map(p => p.quantity), 1);

    switch (chartTypes.topProducts) {
      case 'column':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={items} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e5eaf3" />
              <XAxis dataKey="name" {...axisProps} fontSize={10} tickFormatter={(v) => v.length > 10 ? v.slice(0, 10) + '…' : v} />
              <YAxis allowDecimals={false} {...axisProps} fontSize={11} />
              <Tooltip content={<ValueTooltip />} cursor={{ fill: '#eef3fb' }} />
              <Bar dataKey="quantity" radius={[6, 6, 0, 0]} maxBarSize={36}>
                {items.map((e, i) => <Cell key={i} fill={TOP_ITEM_COLORS[i % TOP_ITEM_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case 'donut':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={items} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="quantity" nameKey="name" stroke="#fff" strokeWidth={3}>
                {items.map((e, i) => <Cell key={i} fill={TOP_ITEM_COLORS[i % TOP_ITEM_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<ValueTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'list':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {items.map((p, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.6rem', padding: '0.5rem 0.75rem', background: '#f5f9ff', border: '1px solid #e3ecf8', borderRadius: '0.5rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                  <span style={{ width: '1.5rem', height: '1.5rem', borderRadius: '0.4rem', background: '#e0e7ff', color: '#2f4392', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{idx + 1}</span>
                  <span style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2f4392' }}>{p.quantity}</span>
              </div>
            ))}
          </div>
        );
      case 'bar':
      default:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem', marginTop: '0.3rem' }}>
            {items.map((p, i) => (
              <div key={p.name + i} className="bar-row wide-label">
                <span className="lbl" title={p.name}>{p.name}</span>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${(p.quantity / max) * 100}%`, background: TOP_ITEM_COLORS[i % TOP_ITEM_COLORS.length] }} /></div>
                <span className="val">{p.quantity}</span>
              </div>
            ))}
          </div>
        );
    }
  };

  const viewAll = (href) => <button className="link-btn" onClick={() => router.push(href)}>View All</button>;

  // ---------- Widgets ----------
  const renderWidgetContent = (widget) => {
    const chartHeight = getChartHeight(widget);

    switch (widget.id) {
      case 'kpiSummary': {
        return (
          <div className="stat-grid">
            <StatCard
              tone="indigo"
              loading={loading}
              icon={<Icon name="document" size={26} color="#384dac" />}
              value={stats?.totalOrders ?? 12}
              label="Total Quotations"
              trend="+20%"
              trendTone="green"
              trendLabel="vs previous 30 days"
              spark={monthlyTrend.length > 0 ? monthlyTrend.map(m => m.count) : [10, 18, 15, 22, 27, 38]}
            />
            <StatCard
              tone="green"
              loading={loading}
              icon={<Icon name="pause" size={24} color="#16a34a" />}
              value={stats?.pendingOrders ?? 3}
              label="Pending Action"
              trend="+5%"
              trendTone="orange"
              trendLabel="vs previous 30 days"
              spark={[3, 5, 4, 6, 5, 7]}
            />
            <StatCard
              tone="sky"
              loading={loading}
              icon={<Icon name="group" size={28} color="#0891b2" />}
              value={stats?.totalUsers ?? 5}
              label="Authorized App Users"
              trend="+25%"
              trendTone="green"
              trendLabel="vs previous 30 days"
              spark={[2, 3, 3, 4, 4, 5]}
            />
            <StatCard
              tone="purple"
              loading={loading}
              icon={<Icon name="crowd-of-users" size={28} color="#7c3aed" />}
              value={stats?.totalProducts ?? 128}
              label="Master Product Items"
              trend="+12%"
              trendTone="green"
              trendLabel="vs previous 30 days"
              spark={[80, 95, 105, 115, 120, 128]}
            />
          </div>
        );
      }

      case 'monthlyChart':
        return (
          <div className="ds-card widget">
            <WidgetHead
              icon={<BarChart3 size={24} strokeWidth={2.6} color="#384dac" />}
              title="Quotation Volume Trend"
              sub={`Total quotations created in the ${RANGE_LABELS[timeRange].toLowerCase()}`}
              right={viewAll("/orders")}
            />
            <div style={{ width: '100%', height: chartHeight, minHeight: 220 }}>
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">{renderTrendChart()}</ResponsiveContainer>
              ) : <div style={{ height: '100%', background: '#f6f9fd', borderRadius: 8 }} />}
            </div>
          </div>
        );

      case 'categoryPie':
        return (
          <div className="ds-card widget">
            <WidgetHead
              icon={<Settings size={24} strokeWidth={2.4} color="#1aa3f0" />}
              title={<b style={{ fontWeight: 600 }}>Category Share ({rangeShort})</b>}
              right={
                <select className="field" style={{ width: 'auto', height: '2.3rem', fontSize: '0.9rem' }} value={chartTypes.categoryPie} onChange={(e) => setChartType('categoryPie', e.target.value)}>
                  {CHART_TYPES.categoryPie.map(t => <option key={t} value={t}>{t === 'donut' ? 'By Items' : t[0].toUpperCase() + t.slice(1)}</option>)}
                </select>
              }
            />
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 0.5rem' }}>
              {mounted ? <div style={{ width: '100%' }}>{renderCategoryChart(Math.min(chartHeight - 30, 210))}</div> : null}
            </div>
          </div>
        );

      case 'statusBars':
        return (
          <div className="ds-card widget">
            <WidgetHead icon={<History size={24} strokeWidth={2.4} color="#2f4392" />} title="Pipeline SLA" right={viewAll("/orders")} />
            {mounted ? renderStatusChart() : null}
          </div>
        );

      case 'topProducts':
        return (
          <div className="ds-card widget">
            <WidgetHead icon={<Icon name="box" size={24} color="#2f4392" />} title={`Top Items (${rangeShort})`} right={viewAll("/products")} />
            {mounted ? renderTopProductsChart(widget.size) : null}
          </div>
        );

      case 'quickActions':
        return (
          <div className="ds-card widget">
            <WidgetHead icon={<Settings size={24} strokeWidth={2.4} color="#2f4392" />} title="Management Panel" />
            <div className="mgmt-grid">
              <button className="mgmt-btn" onClick={() => router.push('/users')}>
                <Icon name="user" size={23} color="#485fca" /><span className="nm">Manage Users</span><ChevronRight size={16} />
              </button>
              <button className="mgmt-btn" onClick={() => router.push('/products')}>
                <Icon name="box" size={23} color="#485fca" /><span className="nm">Manage Products</span><ChevronRight size={16} />
              </button>
              <button className="mgmt-btn" onClick={() => router.push('/categories')}>
                <Icon name="document" size={23} color="#485fca" /><span className="nm">Manage Categories</span><ChevronRight size={16} />
              </button>
              <button className="mgmt-btn" onClick={() => router.push('/orders')}>
                <Icon name="order" size={23} color="#485fca" /><span className="nm">View Orders</span><ChevronRight size={16} />
              </button>
            </div>
          </div>
        );

      case 'recentOrders': {
        const asTable = widget.size !== 'small' && widget.size !== 'compact';
        return (
          <div className="ds-card widget">
            <WidgetHead icon={<Icon name="recent" size={22} color="#4361ee" />} title={`Recent Quotation Stream (${rangeShort})`} right={viewAll("/orders")} />
            {recentOrders.length === 0 ? (
              <div className="muted-center" style={{ padding: '2.5rem 1rem', color: '#94a3b8', fontSize: '0.95rem' }}>
                No quotation on the window in this time
              </div>
            ) : asTable ? (
              <div className="table-wrap">
                <table className="ds-table">
                  <thead>
                    <tr><th>Quotation #</th><th>Customer</th><th>Items</th><th>Status</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order.id}>
                        <td className="code-link">{order.orderNo}</td>
                        <td>{order.userName}</td>
                        <td>{order.items?.length || 1} Items</td>
                        <td><span className={`badge badge-${(order.status || 'pending').toLowerCase()}`}>{order.status || 'Pending'}</span></td>
                        <td style={{ color: '#6b7280' }}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="recent-list">
                {recentOrders.map(order => (
                  <div key={order.id} className="recent-item">
                    <div style={{ minWidth: 0 }}>
                      <div className="no">{order.orderNo}</div>
                      <div className="who">{order.userName} · {order.items?.length || 1} items · {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</div>
                    </div>
                    <span className={`badge badge-${(order.status || 'pending').toLowerCase()}`}>{order.status || 'Pending'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  const visibleWidgets = widgetList.filter(w => w.visible);

  const toolbar = (
    <div className="dash-toolbar">
      <div className="select-ic">
        <CalendarDays size={22} className="lead-ic" fill="#2f4392" color="#fff" strokeWidth={1.6} />
        <select className="field" value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
          {Object.entries(RANGE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      <button
        onClick={() => setAutoRefresh(!autoRefresh)}
        className={`btn btn-ghost${autoRefresh ? ' on' : ''}`}
        title="Toggle 10s live auto-polling"
      >
        <Icon name="wave" size={20} className={autoRefresh ? 'spin' : ''} style={autoRefresh ? { animationDuration: '2s' } : undefined} />
        {autoRefresh ? 'Live Polling ON' : 'Live Polling OFF'}
      </button>

      <button onClick={() => fetchDashboardData(timeRange)} className="btn btn-ghost" title="Refresh analytics data">
        <Icon name="refresh" size={20} className={loading ? 'spin' : ''} /> Refresh
      </button>

      <button onClick={() => setShowCustomizeModal(true)} className="btn btn-navy">
        <Icon name="plus" size={18} /> Customize Layout
      </button>
    </div>
  );

  return (
    <AdminLayout
      eyebrow="Welcome Back!"
      title="Admin Dashboard"
      subtitle="Manage quotations, products and customers from one place."
      aside={toolbar}
    >
      <div className="dash-grid">
        {visibleWidgets.map(widget => (
          <div key={widget.id} style={{ gridColumn: `span ${SIZE_SPANS[widget.size] || 6}`, minWidth: 0 }}>
            {renderWidgetContent(widget)}
          </div>
        ))}
      </div>

      {/* Modal: drag & drop, card sizes, shapes and chart types */}
      {showCustomizeModal && (
        <div className="modal-overlay" onClick={() => setShowCustomizeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '44rem' }}>
            <h3 className="modal-title">Customize Dashboard Layout</h3>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '-0.75rem', marginBottom: '1.1rem' }}>
              <strong>Drag &amp; drop</strong> to reorder. Choose each card&apos;s width, shape and chart type, or hide it.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.4rem' }}>
              {widgetList.map((item, index) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`layout-row${draggedIndex === index ? ' dragging' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                    <GripVertical size={16} color="#9ca3af" />
                    <span style={{ fontSize: '0.88rem', fontWeight: 500, color: item.visible ? '#1d2433' : '#9ca3af' }}>{item.label}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {CHART_TYPES[item.id] && (
                      <select className="field" value={chartTypes[item.id]} onChange={(e) => setChartType(item.id, e.target.value)} title="Chart type">
                        {CHART_TYPES[item.id].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    )}
                    <select className="field" value={item.size || 'medium'} onChange={(e) => setWidgetSize(item.id, e.target.value)} title="Card width">
                      {Object.entries(SIZE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                    <button type="button" onClick={() => setWidgetShape(item.id, item.shape === 'square' ? 'rectangle' : 'square')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex' }} title="Toggle rectangle / square">
                      {item.shape === 'square' ? <Square size={16} color="#2f4392" /> : <RectangleHorizontal size={16} color="#2f4392" />}
                    </button>
                    <button type="button" onClick={() => toggleWidgetVisibility(item.id)}
                      style={{ background: 'none', border: 'none', color: item.visible ? '#2f4392' : '#9ca3af', cursor: 'pointer', padding: 2, display: 'flex' }}
                      title={item.visible ? 'Hide widget' : 'Show widget'}>
                      {item.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button className="btn btn-outline btn-sm" onClick={() => saveWidgetOrder(DEFAULT_WIDGETS)}>Reset to Default</button>
              <button className="btn btn-navy btn-sm" onClick={() => setShowCustomizeModal(false)}>Save &amp; Apply Layout</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
