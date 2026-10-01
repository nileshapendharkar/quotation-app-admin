'use client';
import { useState } from 'react';
import { 
  SlidersHorizontal, 
  GripVertical, 
  Eye, 
  EyeOff, 
  X,
  RotateCcw,
  Check
} from 'lucide-react';

export default function CustomizeLayoutModal({
  isOpen,
  onClose,
  widgetList,
  setWidgetList,
  defaultWidgets,
  onSave
}) {
  const [draggedIndex, setDraggedIndex] = useState(null);

  if (!isOpen) return null;

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
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
    setWidgetList(newList);
    setDraggedIndex(null);
  };

  const toggleVisibility = (id) => {
    const updated = widgetList.map(w => w.id === id ? { ...w, visible: !w.visible } : w);
    setWidgetList(updated);
  };

  const setSize = (id, size) => {
    const updated = widgetList.map(w => w.id === id ? { ...w, size } : w);
    setWidgetList(updated);
  };

  const handleReset = () => {
    setWidgetList(defaultWidgets);
    localStorage.removeItem('custom_admin_widget_sizes_v3');
  };

  const handleSaveAndClose = () => {
    localStorage.setItem('custom_admin_widget_sizes_v3', JSON.stringify(widgetList));
    if (onSave) onSave(widgetList);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '560px', padding: '28px' }}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#e0e7ff',
              color: '#1d4ed8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <SlidersHorizontal size={18} color="#1d4ed8" />
            </div>

            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#072052', margin: 0 }}>
                Customize Dashboard Layout
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px', marginLeft: '46px' }}>
          Drag items to reorder widgets, toggle visibility, and configure card sizes.
        </p>

        {/* Widgets List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
          {widgetList.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: draggedIndex === index ? '#eff6ff' : '#f8fafc',
                border: `1px solid ${draggedIndex === index ? '#93c5fd' : '#e2eaf4'}`,
                borderRadius: '12px',
                cursor: 'grab',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <GripVertical size={16} color="#94a3b8" />
                <span style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: item.visible ? '#072052' : '#94a3b8',
                  textDecoration: item.visible ? 'none' : 'line-through',
                }}>
                  {item.label}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Size selector */}
                <select
                  value={item.size || 'medium'}
                  onChange={(e) => setSize(item.id, e.target.value)}
                  style={{
                    fontSize: '12px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid #dce6f2',
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    cursor: 'pointer',
                  }}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="full">Full Width</option>
                </select>

                {/* Visibility Toggle */}
                <button
                  type="button"
                  onClick={() => toggleVisibility(item.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: item.visible ? '#1d4ed8' : '#94a3b8',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title={item.visible ? 'Hide Widget' : 'Show Widget'}
                >
                  {item.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid #f1f5f9',
          paddingTop: '18px',
        }}>
          <button
            onClick={handleReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={14} /> Reset Defaults
          </button>

          <button
            onClick={handleSaveAndClose}
            className="btn-primary"
            style={{ padding: '8px 20px', borderRadius: '10px' }}
          >
            <Check size={16} /> Save & Apply Layout
          </button>
        </div>
      </div>
    </div>
  );
}
