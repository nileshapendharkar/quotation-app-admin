'use client';
import { useState } from 'react';
import { 
  Calendar, 
  ChevronDown, 
  Check 
} from 'lucide-react';

export default function DashboardToolbar({
  timeRange,
  setTimeRange,
  autoRefresh,
  setAutoRefresh,
  onRefresh,
  onOpenCustomize,
  loading
}) {
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);

  const dateOptions = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: 'ytd', label: 'Year to Date' },
    { value: 'all', label: 'All Time' },
  ];

  const currentLabel = dateOptions.find(o => o.value === timeRange)?.label || 'Last 30 Days';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      flexWrap: 'wrap',
      gap: '12px',
      padding: '0 36px 18px 36px',
      position: 'relative',
      zIndex: 10,
    }}>
      {/* 1. Date Range Dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#ffffff',
            border: '1px solid #dce6f2',
            borderRadius: '10px',
            padding: '8px 14px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#072052',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(11, 37, 89, 0.03)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
        >
          <Calendar size={15} color="#072052" />
          <span>{currentLabel}</span>
          <ChevronDown size={14} color="#64748b" />
        </button>

        {dateDropdownOpen && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            width: '160px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2eaf4',
            boxShadow: '0 10px 25px -5px rgba(11, 37, 89, 0.12)',
            padding: '6px',
            zIndex: 50,
          }}>
            {dateOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setTimeRange(opt.value);
                  setDateDropdownOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: timeRange === opt.value ? '#eff6ff' : 'transparent',
                  color: timeRange === opt.value ? '#1d4ed8' : '#334155',
                  fontSize: '12px',
                  fontWeight: timeRange === opt.value ? '700' : '500',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (timeRange !== opt.value) e.currentTarget.style.backgroundColor = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  if (timeRange !== opt.value) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span>{opt.label}</span>
                {timeRange === opt.value && <Check size={14} color="#1d4ed8" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Live Polling Toggle Button with Wave Asset */}
      <button
        onClick={() => setAutoRefresh(!autoRefresh)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: autoRefresh ? '#ecfdf5' : '#ffffff',
          border: `1px solid ${autoRefresh ? '#a7f3d0' : '#dce6f2'}`,
          borderRadius: '10px',
          padding: '8px 14px',
          fontSize: '13px',
          fontWeight: '600',
          color: autoRefresh ? '#047857' : '#072052',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(11, 37, 89, 0.03)',
          transition: 'all 0.2s',
        }}
        title="Toggle automatic live background data polling"
      >
        <span 
          style={{
            display: 'inline-block',
            width: '16px',
            height: '16px',
            backgroundColor: autoRefresh ? '#10b981' : '#64748b',
            maskImage: 'url(/assets/wave.png)',
            WebkitMaskImage: 'url(/assets/wave.png)',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
            flexShrink: 0,
          }}
        />
        <span>{autoRefresh ? 'Live Polling ON' : 'Live Polling OFF'}</span>
      </button>

      {/* 3. Refresh Button with Refresh Asset */}
      <button
        onClick={onRefresh}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#ffffff',
          border: '1px solid #dce6f2',
          borderRadius: '10px',
          padding: '8px 14px',
          fontSize: '13px',
          fontWeight: '600',
          color: '#072052',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(11, 37, 89, 0.03)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
        title="Refresh data"
      >
        <span 
          className={loading ? 'spin' : ''}
          style={{
            display: 'inline-block',
            width: '15px',
            height: '15px',
            backgroundColor: '#072052',
            maskImage: 'url(/assets/refresh.png)',
            WebkitMaskImage: 'url(/assets/refresh.png)',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
            flexShrink: 0,
          }}
        />
        <span>Refresh</span>
      </button>

      {/* 4. Customize Layout Button with Plus Asset */}
      <button
        onClick={onOpenCustomize}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#274b9b',
          border: 'none',
          borderRadius: '10px',
          padding: '8px 18px',
          fontSize: '13px',
          fontWeight: '600',
          color: '#ffffff',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(39, 75, 155, 0.3)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#1d3b7d';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#274b9b';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
        title="Customize dashboard cards and layout"
      >
        <span 
          style={{
            display: 'inline-block',
            width: '14px',
            height: '14px',
            backgroundColor: '#ffffff',
            maskImage: 'url(/assets/plus.png)',
            WebkitMaskImage: 'url(/assets/plus.png)',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
            flexShrink: 0,
          }}
        />
        <span>Customize Layout</span>
      </button>
    </div>
  );
}
