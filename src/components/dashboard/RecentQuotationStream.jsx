'use client';
import Link from 'next/link';

export default function RecentQuotationStream({ recentOrders = [], timeRange = '30 Days' }) {
  const timeLabel = timeRange.includes('day') ? timeRange.replace('days', ' Days') : timeRange;

  return (
    <div className="glass-card" style={{
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
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
                maskImage: 'url(/assets/recent.png)',
                WebkitMaskImage: 'url(/assets/recent.png)',
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
            Recent Quotation Stream ({timeLabel})
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

      {/* Content matching reference empty state */}
      {recentOrders.length === 0 ? (
        <div style={{
          padding: '46px 20px',
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: '13px',
          fontWeight: '500',
        }}>
          No quotation on the window in this time
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th style={{ padding: '10px 16px', background: '#f8fafc', color: '#64748b', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Quotation #</th>
                <th style={{ padding: '10px 16px', background: '#f8fafc', color: '#64748b', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Customer Name</th>
                <th style={{ padding: '10px 16px', background: '#f8fafc', color: '#64748b', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Items Count</th>
                <th style={{ padding: '10px 16px', background: '#f8fafc', color: '#64748b', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '10px 16px', background: '#f8fafc', color: '#64748b', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => {
                const status = (order.status || 'Pending').toLowerCase();
                let badgeClass = 'badge-pending';
                if (status === 'approved') badgeClass = 'badge-approved';
                if (status === 'dispatched') badgeClass = 'badge-dispatched';
                if (status === 'delivered') badgeClass = 'badge-delivered';
                if (status === 'cancelled') badgeClass = 'badge-cancelled';

                return (
                  <tr key={order.id || order.orderNo}>
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#1d4ed8', fontSize: '13px', fontFamily: 'monospace' }}>
                      {order.orderNo || `QT-${order.id?.slice(0, 6)}`}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#072052' }}>
                      {order.userName || order.accountName || 'Customer'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>
                      {order.items?.length || 1} Items
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${badgeClass}`}>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
