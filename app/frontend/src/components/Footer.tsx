import React from 'react';

interface FooterProps {
  language?: 'EN' | 'ES';
}

export const Footer: React.FC<FooterProps> = ({ language = 'EN' }) => {
  const translations = {
    en: {
      tagline: 'Premium AI Sales Agent Platform',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service'
    },
    es: {
      tagline: 'Plataforma Premium de Agente de Ventas con IA',
      privacyPolicy: 'Política de Privacidad',
      termsOfService: 'Términos de Servicio'
    }
  };

  const lang = language.toLowerCase() as 'en' | 'es';
  const t = translations[lang];

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
          {t.tagline}
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
            {t.privacyPolicy}
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
            {t.termsOfService}
          </a>
        </div>
      </div>
    </footer>
  );
};
