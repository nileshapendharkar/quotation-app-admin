'use client';
import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function CategoryShareDonut({ categoryBreakdown = [], mounted, totalCount = 128 }) {
  const [filterType, setFilterType] = useState('By Items');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Exact Palette and Labels from reference design
  const defaultData = [
    { name: 'Pipes & Fittings', value: 42, color: '#274396' },
    { name: 'Valves & Accessaris', value: 28, color: '#00c2ff' },
    { name: 'Water Storage Tanks', value: 20, color: '#f59e0b' },
    { name: 'Others', value: 10, color: '#8b5cf6' },
  ];

  let chartData = defaultData;
  const calculatedTotal = 128;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: '#072052',
          color: '#ffffff',
          padding: '6px 12px',
          borderRadius: '8px',
          boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
          fontSize: '12px',
        }}>
          <span style={{ fontWeight: '600' }}>{data.name}: </span>
          <span style={{ fontWeight: '700', color: '#38bdf8' }}>{data.value}%</span>
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
            backgroundColor: '#e0f2fe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span 
              style={{
                display: 'inline-block',
                width: '20px',
                height: '20px',
                backgroundColor: '#0284c7',
                maskImage: 'url(/assets/setting.png)',
                WebkitMaskImage: 'url(/assets/setting.png)',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
              }}
            />
          </div>

          <h2 style={{
            fontSize: '15px',
            fontWeight: '700',
            color: '#072052',
            margin: 0,
          }}>
            Category Share (30 Days)
          </h2>
        </div>

        {/* Filter Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ffffff',
              border: '1px solid #dce6f2',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '600',
              color: '#334155',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <span>{filterType}</span>
            <ChevronDown size={13} color="#64748b" />
          </button>

          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              right: 0,
              width: '130px',
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #e2eaf4',
              boxShadow: '0 8px 20px rgba(11, 37, 89, 0.1)',
              padding: '4px',
              zIndex: 50,
            }}>
              {['By Items', 'By Orders', 'By Revenue'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setFilterType(opt);
                    setDropdownOpen(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: filterType === opt ? '#eff6ff' : 'transparent',
                    color: filterType === opt ? '#1d4ed8' : '#334155',
                    fontSize: '12px',
                    fontWeight: filterType === opt ? '700' : '500',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span>{opt}</span>
                  {filterType === opt && <Check size={13} color="#1d4ed8" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Body: Donut chart with Center text + Legend */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        flex: 1,
      }}>
        {/* Donut Chart Container with Center Text */}
        <div style={{
          position: 'relative',
          width: '200px',
          height: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
        }}>
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={88}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ width: '170px', height: '170px', borderRadius: '50%', border: '16px solid #f1f5f9' }} />
          )}

          {/* Centered Donut Text */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
              Total
            </div>
            <div style={{
              fontSize: '26px',
              fontWeight: '800',
              color: '#072052',
              lineHeight: '1.1',
              letterSpacing: '-0.5px',
            }}>
              {calculatedTotal}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
              Items
            </div>
          </div>
        </div>

        {/* Legend on the right */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          minWidth: '200px',
          flex: 1,
        }}>
          {chartData.map((entry, index) => (
            <div
              key={`legend-${index}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: entry.color,
                  display: 'inline-block',
                }} />
                <span style={{ color: '#334155', fontWeight: '500' }}>
                  {entry.name}
                </span>
              </div>

              <span style={{ fontWeight: '700', color: '#072052' }}>
                {entry.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
