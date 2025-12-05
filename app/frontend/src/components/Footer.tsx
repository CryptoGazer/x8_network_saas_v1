import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer
      id="footer"
      style={{
        padding: '48px 0',
        borderTop: '1px solid var(--glass-border)',
        marginTop: '48px'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        <div style={{
          fontSize: '14px',
          color: 'var(--text-secondary)'
        }}>
          Premium AI Sales Agent Platform
        </div>

        <div style={{
          display: 'flex',
          gap: '24px',
          fontSize: '14px'
        }}>
          <a
            href="https://example.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              transition: 'color var(--transition-fast)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--brand-cyan)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            Private Policy
          </a>
          <a
            href="https://example.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              transition: 'color var(--transition-fast)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--brand-cyan)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};
