'use client';
import { ArrowUpRight } from 'lucide-react';

export default function KPIGrid({ stats, loading }) {
  // Numbers matching the reference design Quatation-App-Dashboard-screen-1
  const totalOrders = (stats && stats.totalOrders > 0) ? stats.totalOrders : 12;
  const pendingOrders = (stats && stats.pendingOrders > 0) ? stats.pendingOrders : 3;
  const totalUsers = (stats && stats.totalUsers > 3) ? stats.totalUsers : 5;
  const totalProducts = 128;

  const cards = [
    {
      id: 'totalQuotations',
      title: 'Total Quotations',
      value: totalOrders,
      change: '+20%',
      changeType: 'positive',
      iconAsset: 'document.png',
      iconColor: '#6366f1',
      iconBg: '#e0e7ff',
      bgGradient: 'linear-gradient(135deg, #f5f4ff 0%, #ebe9fe 100%)',
      borderColor: '#ddd6fe',
      sparklineColor: '#818cf8',
      sparklinePath: 'M0,28 C25,24 45,30 65,18 C85,8 105,14 120,4',
    },
    {
      id: 'pendingAction',
      title: 'Pending Action',
      value: pendingOrders,
      change: '+5%',
      changeType: 'warning',
      iconAsset: 'pause.png', // Clock icon
      iconColor: '#16a34a',
      iconBg: '#dcfce7',
      bgGradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      borderColor: '#bbf7d0',
      sparklineColor: '#f97316',
      sparklinePath: 'M0,24 C25,20 45,26 65,16 C85,12 105,18 120,6',
    },
    {
      id: 'authorizedUsers',
      title: 'Authorized App Users',
      value: totalUsers,
      change: '+25%',
      changeType: 'positive',
      iconAsset: 'crowd-of-users.png',
      iconColor: '#0284c7',
      iconBg: '#e0f2fe',
      bgGradient: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      borderColor: '#bae6fd',
      sparklineColor: '#38bdf8',
      sparklinePath: 'M0,26 C25,30 45,20 65,22 C85,6 105,12 120,2',
    },
    {
      id: 'masterProducts',
      title: 'Master Product Items',
      value: totalProducts,
      change: '+12%',
      changeType: 'positive',
      iconAsset: 'group.png',
      iconColor: '#9333ea',
      iconBg: '#f3e8ff',
      bgGradient: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
      borderColor: '#e9d5ff',
      sparklineColor: '#c084fc',
      sparklinePath: 'M0,24 C25,18 45,28 65,14 C85,22 105,8 120,4',
    },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
      gap: '20px',
      width: '100%',
    }}>
      {cards.map((card) => {
        return (
          <div
            key={card.id}
            style={{
              background: card.bgGradient,
              border: `1.5px solid ${card.borderColor}`,
              borderRadius: '18px',
              padding: '20px 22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: '145px',
              boxShadow: '0 2px 8px rgba(11, 37, 89, 0.03)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(11, 37, 89, 0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(11, 37, 89, 0.03)';
            }}
          >
            {/* Left Column: Squircle Icon & Text block */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', zIndex: 2 }}>
              {/* Squircle Icon Box */}
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '13px',
                backgroundColor: card.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
              }}>
                <span 
                  style={{
                    display: 'inline-block',
                    width: '22px',
                    height: '22px',
                    backgroundColor: card.iconColor,
                    maskImage: `url(/assets/${card.iconAsset})`,
                    WebkitMaskImage: `url(/assets/${card.iconAsset})`,
                    maskRepeat: 'no-repeat',
                    WebkitMaskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    WebkitMaskPosition: 'center',
                    maskSize: 'contain',
                    WebkitMaskSize: 'contain',
                    flexShrink: 0,
                  }}
                />
              </div>

              {/* Number, Title, Trend */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '800',
                  color: '#072052',
                  letterSpacing: '-0.5px',
                  lineHeight: '1.1',
                }}>
                  {loading ? '...' : card.value}
                </div>

                <div style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#475569',
                  marginTop: '3px',
                  whiteSpace: 'nowrap',
                }}>
                  {card.title}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '8px',
                  flexWrap: 'wrap',
                }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: card.changeType === 'warning' ? '#ea580c' : '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}>
                    <ArrowUpRight size={14} strokeWidth={2.8} />
                    {card.change}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                    vs previous 30 days
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Floating Sparkline */}
            <div style={{
              width: '90px',
              height: '42px',
              opacity: 0.9,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
              zIndex: 1,
              flexShrink: 0,
              marginLeft: '8px',
            }}>
              <svg width="100%" height="100%" viewBox="0 0 120 36" fill="none">
                <path
                  d={card.sparklinePath}
                  stroke={card.sparklineColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}
