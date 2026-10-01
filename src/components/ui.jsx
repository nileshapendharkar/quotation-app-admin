'use client';
import { useId } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Sparkline – small smooth area line used inside the stat cards.      */
/* When `data` is missing it draws the gentle decorative wave from the */
/* design (no numbers are implied, it is just an accent).              */
/* ------------------------------------------------------------------ */
const DECORATIVE = [22, 18, 20, 34, 37, 31, 36, 52];

export function Sparkline({ data, color = '#6d5fd6', className = 'stat-spark' }) {
  const gid = useId().replace(/:/g, '');
  const values = Array.isArray(data) && data.length > 1 ? data : DECORATIVE;
  const W = 120, H = 60, pad = 4;
  const max = Math.max(...values), min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * W,
    H - pad - ((v - min) / range) * (H - pad * 2.5),
  ]);
  // Catmull-Rom → cubic bezier for a smooth curve
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return (
    <svg className={className} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L${W},${H} L0,${H} Z`} fill={`url(#${gid})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* StatCard – the coloured KPI tiles on Dashboard / Orders / Users.    */
/* ------------------------------------------------------------------ */
const TONE_LINE = {
  indigo: '#6d5fd6', green: '#ffa53a', sky: '#29b6f6', purple: '#7a5af5',
  orange: '#ffa53a', red: '#ff4d5e', mint: '#2fd06a',
};

export function StatCard({
  tone = 'indigo',
  icon,
  value,
  label,
  trend,
  trendTone = 'green',
  trendLabel = 'vs previous 30 days',
  meta,
  sub,
  spark,
  compact = false,
  loading = false,
}) {
  return (
    <div className={`stat-card tone-${tone}${compact ? ' compact' : ''}`}>
      <div className="stat-ic">{icon}</div>
      <div className="stat-body">
        <div className="stat-value">{loading ? '…' : value}</div>
        <div className="stat-label">{label}</div>
        {trend && (
          <div className="stat-trend">
            <span className={`trend-badge ${trendTone}`}>
              <span className="trend-arrow">↗</span> {trend}
            </span>
            {trendLabel && <span className="trend-sub">{trendLabel}</span>}
          </div>
        )}
        {!trend && meta && (
          <div className="stat-meta"><span className="meta-dot" />{meta}</div>
        )}
        {!trend && sub && <div className="stat-sub">{sub}</div>}
      </div>
      <Sparkline data={spark} color={TONE_LINE[tone]} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pagination – "Showing 1 to 6 of 297 products"  ‹ 1 2 3 … 50 ›       */
/* ------------------------------------------------------------------ */
function pageList(current, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '…', totalPages];
  if (current >= totalPages - 3) return [1, '…', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, '…', current - 1, current, current + 1, '…', totalPages];
}

export function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange, itemLabel = 'items', pageSizeOptions = [6, 10, 25, 50, 100] }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <div className="table-foot">
      <div className="showing">
        {total === 0 ? `Showing 0 of 0 ${itemLabel}` : `Showing ${from} to ${to} of ${total} ${itemLabel}`}
      </div>
      <div className="pager">
        <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
          <ChevronLeft size={16} />
        </button>
        {pageList(page, totalPages).map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} className="ellipsis">…</span>
          ) : (
            <button key={p} className={p === page ? 'current' : ''} onClick={() => onPageChange(p)}>{p}</button>
          )
        )}
        <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} aria-label="Next page">
          <ChevronRight size={16} />
        </button>
        {onPageSizeChange && (
          <select className="field" value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
            {pageSizeOptions.map((n) => <option key={n} value={n}>{n} per page</option>)}
          </select>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* EmptyState – illustration + message + optional action button        */
/* ------------------------------------------------------------------ */
export function EmptyState({ image = '/design/empty-quotations.png', title, text, action }) {
  return (
    <div className="empty-state">
      <img src={image} alt="" />
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

/* Coloured round badge icons used in a few stat cards (clock / play / cross) */
export function RoundGlyph({ children, bg }) {
  return (
    <span style={{ width: '2.3rem', height: '2.3rem', borderRadius: '50%', background: bg, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </span>
  );
}

/* Read ?q= from the URL (set by the header search) without needing a Suspense boundary */
export function getUrlQuery(name = 'q') {
  if (typeof window === 'undefined') return '';
  try { return new URLSearchParams(window.location.search).get(name) || ''; } catch (e) { return ''; }
}

/* ------------------------------------------------------------------ */
// Daily counts for the last `days` days – used for the small sparkline in each stat card.
// Returns undefined when there is no data so the card shows its neutral accent line.
export function dailySeries(items, days = 14) {
  if (!items.length) return undefined;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const buckets = Array(days).fill(0);
  items.forEach(o => {
    if (!o.createdAt) return;
    const d = new Date(o.createdAt); d.setHours(0, 0, 0, 0);
    const diff = Math.round((today - d) / 86400000);
    if (diff >= 0 && diff < days) buckets[days - 1 - diff]++;
  });
  return buckets.some(Boolean) ? buckets : undefined;
}
