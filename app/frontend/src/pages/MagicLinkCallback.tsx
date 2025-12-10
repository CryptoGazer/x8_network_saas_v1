import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NeuralBackground from '../components/NeuralBackground';

export default function MagicLinkCallback() {
  const navigate = useNavigate();
  const { verifyMagicLink } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState('');
  const hasVerified = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent duplicate requests
      if (hasVerified.current) return;
      hasVerified.current = true;

      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (!token) {
        setStatus('error');
        setError('No magic link token found');
        setTimeout(() => navigate('/auth'), 3000);
        return;
      }

      try {
        const success = await verifyMagicLink(token);
        if (success) {
          setStatus('success');
          setTimeout(() => navigate('/'), 1000);
        } else {
          setStatus('error');
          setError('Invalid or expired magic link');
          setTimeout(() => navigate('/auth'), 3000);
        }
      } catch (err) {
        setStatus('error');
        setError('Failed to verify magic link');
        setTimeout(() => navigate('/auth'), 3000);
      }
    };

    handleCallback();
  }, [navigate, verifyMagicLink]);

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <NeuralBackground isDark={true} />

      <div className="relative z-10 w-full max-w-md px-8">
        <div className="group relative">
          <div className="absolute -inset-8 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl blur-3xl" />

          <div className="relative bg-black/40 backdrop-blur-xl border border-blue-400/20 rounded-3xl p-12 text-center">
            {status === 'processing' && (
              <>
                <div className="mb-6">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
                </div>
                <h1 className="text-2xl font-light tracking-tight mb-2">
                  Verifying Magic Link...
                </h1>
                <p className="text-sm font-light opacity-60">
                  Please wait while we sign you in
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="mb-6 text-green-400">
                  <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-light tracking-tight mb-2">
                  Success!
                </h1>
                <p className="text-sm font-light opacity-60">
                  Redirecting to dashboard...
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="mb-6 text-red-400">
                  <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-light tracking-tight mb-2">
                  Verification Failed
                </h1>
                <p className="text-sm font-light opacity-60 mb-4">
                  {error}
                </p>
                <p className="text-xs font-light opacity-40">
                  Redirecting to login...
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
