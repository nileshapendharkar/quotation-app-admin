'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Gauge, 
  ChevronRight,
  ListOrdered
} from 'lucide-react';

export default function SecondaryRow({ 
  statusBreakdown = [], 
  topProducts = [], 
  stats 
}) {
  const router = useRouter();

  // 1. Pipeline SLA data fallback matching reference design
  const defaultSLA = [
    { name: 'Pending', count: stats?.pendingOrders || 5, pct: 25, color: '#f59e0b' },
    { name: 'Approved', count: stats?.approvedOrders || 12, pct: 60, color: '#00c2ff' },
    { name: 'Rejected', count: stats?.cancelledOrders || 3, pct: 15, color: '#ef4444' },
  ];

  let slaData = defaultSLA;
  if (statusBreakdown && statusBreakdown.length > 0) {
    const totalOrders = stats?.totalOrders || statusBreakdown.reduce((sum, s) => sum + s.count, 0) || 20;
    const pendingItem = statusBreakdown.find(s => s.name === 'Pending') || { count: 5 };
    const approvedItem = statusBreakdown.find(s => s.name === 'Approved') || { count: 12 };
    const rejectedItem = statusBreakdown.find(s => s.name === 'Cancelled') || { count: 3 };

    slaData = [
      {
        name: 'Pending',
        count: pendingItem.count,
        pct: totalOrders > 0 ? Math.round((pendingItem.count / totalOrders) * 100) : 25,
        color: '#f59e0b',
      },
      {
        name: 'Approved',
        count: approvedItem.count,
        pct: totalOrders > 0 ? Math.round((approvedItem.count / totalOrders) * 100) : 60,
        color: '#00c2ff',
      },
      {
        name: 'Rejected',
        count: rejectedItem.count,
        pct: totalOrders > 0 ? Math.round((rejectedItem.count / totalOrders) * 100) : 15,
        color: '#ef4444',
      },
    ];
  }

  // 2. Top Items data fallback matching reference design
  const defaultTopItems = [
    { name: 'Water Storage Tanks', count: 48, color: '#1e3a8a', max: 55 },
    { name: 'UPVC Pipes', count: 32, color: '#00c2ff', max: 55 },
    { name: 'CPVC Pipes', count: 25, color: '#60a5fa', max: 55 },
    { name: 'Fittings & Valves', count: 18, color: '#a78bfa', max: 55 },
  ];

  let topItemsData = defaultTopItems;
  if (topProducts && topProducts.length > 0) {
    const colors = ['#1e3a8a', '#00c2ff', '#60a5fa', '#a78bfa'];
    const maxVal = Math.max(...topProducts.map(p => p.quantity || 1), 50);
    topItemsData = topProducts.slice(0, 4).map((p, idx) => ({
      name: p.name,
      count: p.quantity || (48 - idx * 10),
      color: colors[idx % colors.length],
      max: maxVal * 1.15,
    }));
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: '20px',
      width: '100%',
    }}>
      {/* Card 1: Pipeline SLA */}
      <div className="glass-card" style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '270px',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '18px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#e0e7ff',
              color: '#1d4ed8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Gauge size={18} color="#1d4ed8" />
            </div>

            <h3 style={{
              fontSize: '15px',
              fontWeight: '700',
              color: '#072052',
              margin: 0,
            }}>
              Pipeline SLA
            </h3>
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
            }}
          >
            View All
          </Link>
        </div>

        {/* Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'center' }}>
          {slaData.map((item) => (
            <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{
                width: '70px',
                fontSize: '13px',
                fontWeight: '500',
                color: '#334155',
                flexShrink: 0,
              }}>
                {item.name}
              </span>

              {/* Progress Track */}
              <div style={{
                flex: 1,
                height: '10px',
                backgroundColor: '#eff4fa',
                borderRadius: '9999px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(item.pct, 100)}%`,
                  backgroundColor: item.color,
                  borderRadius: '9999px',
                  transition: 'width 0.6s ease',
                }} />
              </div>

              {/* Count & Percentage */}
              <span style={{
                width: '65px',
                textAlign: 'right',
                fontSize: '12px',
                fontWeight: '700',
                color: '#072052',
                flexShrink: 0,
              }}>
                {item.count} <span style={{ fontWeight: '500', color: '#64748b' }}>({item.pct}%)</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Card 2: Top Items (30 Days) */}
      <div className="glass-card" style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '270px',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '18px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              backgroundColor: '#e0f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span 
                style={{
                  display: 'inline-block',
                  width: '18px',
                  height: '18px',
                  backgroundColor: '#0284c7',
                  maskImage: 'url(/assets/box.png)',
                  WebkitMaskImage: 'url(/assets/box.png)',
                  maskRepeat: 'no-repeat',
                  WebkitMaskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  WebkitMaskPosition: 'center',
                  maskSize: 'contain',
                  WebkitMaskSize: 'contain',
                }}
              />
            </div>

            <h3 style={{
              fontSize: '15px',
              fontWeight: '700',
              color: '#072052',
              margin: 0,
            }}>
              Top Items (30 Days)
            </h3>
          </div>

          <Link
            href="/products"
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#1d4ed8',
              textDecoration: 'none',
              padding: '4px 8px',
              borderRadius: '6px',
            }}
          >
            View All
          </Link>
        </div>

        {/* Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'center' }}>
          {topItemsData.map((item) => {
            const barWidth = Math.min(Math.round((item.count / item.max) * 100), 100);

            return (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  width: '130px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#334155',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }} title={item.name}>
                  {item.name}
                </span>

                {/* Progress Track */}
                <div style={{
                  flex: 1,
                  height: '10px',
                  backgroundColor: '#eff4fa',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${barWidth}%`,
                    backgroundColor: item.color,
                    borderRadius: '9999px',
                    transition: 'width 0.6s ease',
                  }} />
                </div>

                {/* Count */}
                <span style={{
                  width: '30px',
                  textAlign: 'right',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#072052',
                  flexShrink: 0,
                }}>
                  {item.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card 3: Management Panel */}
      <div className="glass-card" style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '270px',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              backgroundColor: '#e0e7ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span 
                style={{
                  display: 'inline-block',
                  width: '18px',
                  height: '18px',
                  backgroundColor: '#1d4ed8',
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

            <h3 style={{
              fontSize: '15px',
              fontWeight: '700',
              color: '#072052',
              margin: 0,
            }}>
              Management Panel
            </h3>
          </div>
        </div>

        {/* 2x2 Action Buttons Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          flex: 1,
          alignContent: 'center',
        }}>
          {/* Action 1: Manage Users */}
          <button
            onClick={() => router.push('/users')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#eaf2fc',
              border: '1px solid #d5e5f8',
              borderRadius: '12px',
              padding: '12px 14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#dbeafe';
              e.currentTarget.style.transform = 'translateX(2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#eaf2fc';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span 
                style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  backgroundColor: '#1d4ed8',
                  maskImage: 'url(/assets/user.png)',
                  WebkitMaskImage: 'url(/assets/user.png)',
                  maskRepeat: 'no-repeat',
                  WebkitMaskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  WebkitMaskPosition: 'center',
                  maskSize: 'contain',
                  WebkitMaskSize: 'contain',
                }}
              />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#072052' }}>
                Manage Users
              </span>
            </div>
            <ChevronRight size={14} color="#94a3b8" />
          </button>

          {/* Action 2: Manage Products */}
          <button
            onClick={() => router.push('/products')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#eaf2fc',
              border: '1px solid #d5e5f8',
              borderRadius: '12px',
              padding: '12px 14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#dbeafe';
              e.currentTarget.style.transform = 'translateX(2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#eaf2fc';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span 
                style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  backgroundColor: '#1d4ed8',
                  maskImage: 'url(/assets/box.png)',
                  WebkitMaskImage: 'url(/assets/box.png)',
                  maskRepeat: 'no-repeat',
                  WebkitMaskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  WebkitMaskPosition: 'center',
                  maskSize: 'contain',
                  WebkitMaskSize: 'contain',
                }}
              />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#072052' }}>
                Manage Products
              </span>
            </div>
            <ChevronRight size={14} color="#94a3b8" />
          </button>

          {/* Action 3: Manage Categories */}
          <button
            onClick={() => router.push('/categories')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#eaf2fc',
              border: '1px solid #d5e5f8',
              borderRadius: '12px',
              padding: '12px 14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#dbeafe';
              e.currentTarget.style.transform = 'translateX(2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#eaf2fc';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span 
                style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  backgroundColor: '#1d4ed8',
                  maskImage: 'url(/assets/document.png)',
                  WebkitMaskImage: 'url(/assets/document.png)',
                  maskRepeat: 'no-repeat',
                  WebkitMaskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  WebkitMaskPosition: 'center',
                  maskSize: 'contain',
                  WebkitMaskSize: 'contain',
                }}
              />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#072052' }}>
                Manage Categories
              </span>
            </div>
            <ChevronRight size={14} color="#94a3b8" />
          </button>

          {/* Action 4: View Orders */}
          <button
            onClick={() => router.push('/orders')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#eaf2fc',
              border: '1px solid #d5e5f8',
              borderRadius: '12px',
              padding: '12px 14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#dbeafe';
              e.currentTarget.style.transform = 'translateX(2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#eaf2fc';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ListOrdered size={16} color="#1d4ed8" />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#072052' }}>
                View Orders
              </span>
            </div>
            <ChevronRight size={14} color="#94a3b8" />
          </button>
        </div>
      </div>
    </div>
  );
}
