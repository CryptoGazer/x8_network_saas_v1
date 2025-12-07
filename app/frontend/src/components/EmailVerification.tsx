import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

interface EmailVerificationProps {
  email: string;
  onVerified: (code: string) => void;
  onBack: () => void;
  onResend: () => void;
  language: string;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  onVerified,
  onBack,
  onResend,
  language
}) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const t = {
    EN: {
      title: 'Email Verification',
      subtitle: 'Enter the 6-digit code sent to',
      codeLabel: 'Verification Code',
      verify: 'Verify Code',
      resend: 'Resend Code',
      resendIn: 'Resend in',
      seconds: 'seconds',
      back: 'Back',
      success: 'Code verified successfully!',
      invalid: 'Invalid or expired code',
      checkEmail: 'Check your email inbox and spam folder'
    },
    ES: {
      title: 'Verificación de Email',
      subtitle: 'Ingresa el código de 6 dígitos enviado a',
      codeLabel: 'Código de Verificación',
      verify: 'Verificar Código',
      resend: 'Reenviar Código',
      resendIn: 'Reenviar en',
      seconds: 'segundos',
      back: 'Volver',
      success: '¡Código verificado exitosamente!',
      invalid: 'Código inválido o expirado',
      checkEmail: 'Revisa tu bandeja de entrada y spam'
    }
  }[language] || t.EN;

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedCode = value.slice(0, 6);
      const newCode = [...code];
      for (let i = 0; i < pastedCode.length && index + i < 6; i++) {
        newCode[index + i] = pastedCode[i];
      }
      setCode(newCode);

      // Focus on the last filled input or the next empty one
      const nextIndex = Math.min(index + pastedCode.length, 5);
      document.getElementById(`code-${nextIndex}`)?.focus();
      return;
    }

    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }

    // Auto-submit if all 6 digits are entered
    if (newCode.every(digit => digit !== '') && index === 5) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  const handleVerify = async (codeString?: string) => {
    const verificationCode = codeString || code.join('');

    if (verificationCode.length !== 6) {
      setError(t.invalid);
      return;
    }

    try {
      setSuccess(true);
      setTimeout(() => {
        onVerified(verificationCode);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.invalid);
      setSuccess(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    try {
      await onResend();
      setResendCooldown(60); // 60 second cooldown
      setCode(['', '', '', '', '', '']);
      setError(null);
      document.getElementById('code-0')?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '48px 40px',
        borderRadius: '16px'
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '8px',
            marginBottom: '24px',
            fontSize: '14px',
            transition: 'color var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--brand-cyan)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <ArrowLeft size={18} />
          {t.back}
        </button>

        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(0, 184, 230, 0.2) 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            {success ? (
              <CheckCircle size={32} color="var(--brand-cyan)" />
            ) : (
              <Mail size={32} color="var(--brand-cyan)" />
            )}
          </div>

          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '12px'
          }}>
            {t.title}
          </h1>

          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            {t.subtitle}
          </p>
          <p style={{
            color: 'var(--brand-cyan)',
            fontSize: '14px',
            fontWeight: 600,
            marginTop: '4px'
          }}>
            {email}
          </p>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '12px',
            marginTop: '8px'
          }}>
            {t.checkEmail}
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          marginBottom: '32px'
        }}>
          {code.map((digit, index) => (
            <input
              key={index}
              id={`code-${index}`}
              type="text"
              maxLength={6}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={success}
              style={{
                width: '52px',
                height: '64px',
                fontSize: '24px',
                fontWeight: 700,
                textAlign: 'center',
                background: success ? 'rgba(0, 212, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                border: success
                  ? '2px solid var(--brand-cyan)'
                  : digit
                    ? '2px solid rgba(0, 212, 255, 0.5)'
                    : '2px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: success ? 'var(--brand-cyan)' : 'var(--text-primary)',
                outline: 'none',
                transition: 'all var(--transition-fast)',
                fontFamily: 'monospace'
              }}
              onFocus={(e) => {
                if (!success) {
                  e.target.style.borderColor = 'var(--brand-cyan)';
                  e.target.style.background = 'rgba(0, 212, 255, 0.1)';
                }
              }}
              onBlur={(e) => {
                if (!success && !digit) {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                }
              }}
            />
          ))}
        </div>

        {error && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(255, 107, 107, 0.1)',
            border: '1px solid rgba(255, 107, 107, 0.3)',
            borderRadius: '8px',
            color: '#ff6b6b',
            fontSize: '14px',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(0, 212, 255, 0.1)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '8px',
            color: 'var(--brand-cyan)',
            fontSize: '14px',
            marginBottom: '24px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <CheckCircle size={18} />
            {t.success}
          </div>
        )}

        <button
          onClick={() => handleVerify()}
          disabled={code.some(digit => !digit) || success}
          style={{
            width: '100%',
            padding: '14px',
            background: code.every(digit => digit) && !success
              ? 'linear-gradient(135deg, var(--brand-cyan) 0%, var(--brand-teal) 100%)'
              : 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '16px',
            fontWeight: 600,
            cursor: code.every(digit => digit) && !success ? 'pointer' : 'not-allowed',
            transition: 'all var(--transition-fast)',
            marginBottom: '16px',
            opacity: code.every(digit => digit) && !success ? 1 : 0.5
          }}
        >
          {t.verify}
        </button>

        <div style={{
          textAlign: 'center'
        }}>
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0}
            style={{
              background: 'none',
              border: 'none',
              color: resendCooldown > 0 ? 'var(--text-muted)' : 'var(--brand-cyan)',
              fontSize: '14px',
              cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
              textDecoration: 'underline',
              transition: 'opacity var(--transition-fast)'
            }}
          >
            {resendCooldown > 0
              ? `${t.resendIn} ${resendCooldown} ${t.seconds}`
              : t.resend
            }
          </button>
        </div>
      </div>
    </div>
  );
};
