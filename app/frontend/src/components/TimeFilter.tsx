import React from 'react';

export type TimeRange = '7 days' | '30 days' | 'All';

interface TimeFilterProps {
  selected: TimeRange;
  onChange: (range: TimeRange) => void;
}

const timeRanges: TimeRange[] = ['7 days', '30 days', 'All'];

export const TimeFilter: React.FC<TimeFilterProps> = ({ selected, onChange }) => {
  return (
    <div
      id="time.filter"
      style={{
        display: 'flex',
        gap: '12px',
        padding: '24px 0',
        justifyContent: 'center'
      }}
    >
      {timeRanges.map((range) => {
        const isSelected = selected === range;
        return (
          <button
            key={range}
            onClick={() => onChange(range)}
            className="glass-card"
            style={{
              padding: '12px 32px',
              border: isSelected ? '1px solid var(--brand-cyan)' : '1px solid var(--glass-border)',
              borderRadius: '8px',
              background: isSelected ? 'rgba(0, 212, 255, 0.15)' : 'var(--glass-bg)',
              color: isSelected ? 'var(--brand-cyan)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: isSelected ? 600 : 500,
              fontSize: '14px',
              transition: 'all var(--transition-normal)',
              boxShadow: isSelected ? '0 0 20px rgba(0, 212, 255, 0.3)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = 'var(--brand-cyan)';
                e.currentTarget.style.color = 'var(--brand-cyan)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = 'var(--glass-border)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            {range}
          </button>
        );
      })}
    </div>
  );
};
