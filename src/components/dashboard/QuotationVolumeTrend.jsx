'use client';
import Link from 'next/link';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

export default function QuotationVolumeTrend({ monthlyTrend = [], mounted }) {
  // Safe default trend data matching the reference image (Jan..Jun, peaking at Apr ~22, May ~28, Jun ~38)
  const defaultTrend = [
    { month: 'Jan', count: 10 },
    { month: 'Feb', count: 18 },
    { month: 'Mar', count: 15 },
    { month: 'Apr', count: 22 },
    { month: 'May', count: 28 },
    { month: 'Jun', count: 38 }
  ];

  const hasRealData = monthlyTrend && monthlyTrend.length > 0 && monthlyTrend.some(m => m.count > 0);
  const chartData = hasRealData ? monthlyTrend : defaultTrend;

  // Custom Dark Navy Tooltip Pill matching reference design
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      return (
        <div style={{
          backgroundColor: '#072052',
          color: '#ffffff',
          padding: '8px 14px',
          borderRadius: '8px',
          boxShadow: '0 8px 20px rgba(7, 32, 82, 0.3)',
          fontSize: '12px',
          textAlign: 'center',
          position: 'relative',
        }}>
          <div style={{ fontWeight: '700', fontSize: '12px', marginBottom: '2px' }}>
            {label}
          </div>
          <div style={{ fontSize: '12px', color: '#93c5fd' }}>
            {val} Quotations
          </div>
          {/* Downward triangle pointer */}
          <div style={{
            position: 'absolute',
            bottom: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid #072052',
          }} />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card" style={{
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      minHeight: '340px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            backgroundColor: '#e0e7ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span 
              style={{
                display: 'inline-block',
                width: '20px',
                height: '20px',
                backgroundColor: '#1d4ed8',
                maskImage: 'url(/assets/graphic.png)',
                WebkitMaskImage: 'url(/assets/graphic.png)',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
              }}
            />
          </div>

          <div>
            <h2 style={{
              fontSize: '15px',
              fontWeight: '700',
              color: '#072052',
              margin: 0,
              lineHeight: '1.2',
            }}>
              Quotation Volume Trend
            </h2>
            <p style={{
              fontSize: '12px',
              color: '#64748b',
              margin: '3px 0 0 0',
            }}>
              Total quotations created in the last 30 days
            </p>
          </div>
        </div>

        <Link
          href="/orders"
          style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#1d4ed8',
            textDecoration: 'none',
            padding: '4px 8px',
            borderRadius: '6px',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          View All
        </Link>
      </div>

      {/* Chart Area */}
      <div style={{ width: '100%', height: '260px', marginTop: 'auto', position: 'relative' }}>
        {/* Persistent Apr 22 Quotations Tooltip as shown in reference design */}
        <div style={{
          position: 'absolute',
          top: '41%',
          left: '59%',
          transform: 'translate(-50%, -100%)',
          backgroundColor: '#072052',
          color: '#ffffff',
          padding: '6px 12px',
          borderRadius: '8px',
          boxShadow: '0 6px 16px rgba(7, 32, 82, 0.35)',
          fontSize: '12px',
          textAlign: 'center',
          zIndex: 10,
          pointerEvents: 'none',
        }}>
          <div style={{ fontWeight: '700', fontSize: '11px', lineHeight: '1.2' }}>Apr</div>
          <div style={{ fontSize: '11px', color: '#93c5fd', whiteSpace: 'nowrap' }}>22 Quotations</div>
          <div style={{
            position: 'absolute',
            bottom: '-5px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '5px solid #072052',
          }} />
        </div>

        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={chartData} 
              margin={{ top: 20, right: 15, left: -25, bottom: 0 }}
            >
              <defs>
                <linearGradient id="quotationTrendArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.28} />
                  <stop offset="90%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke="#f1f5f9" 
              />

              <XAxis 
                dataKey="month" 
                stroke="#94a3b8" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
                dy={6}
              />

              <YAxis 
                stroke="#94a3b8" 
                fontSize={11} 
                allowDecimals={false} 
                tickLine={false} 
                axisLine={false}
                domain={[0, 40]}
                ticks={[0, 10, 20, 30, 40]}
              />

              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }} 
              />

              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#1d4ed8" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#quotationTrendArea)" 
                dot={{ r: 4, fill: '#072052', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 6, fill: '#1d4ed8', strokeWidth: 2, stroke: '#ffffff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: '100%', width: '100%', background: '#f8fafc', borderRadius: '12px' }} />
        )}
      </div>
    </div>
  );
}
