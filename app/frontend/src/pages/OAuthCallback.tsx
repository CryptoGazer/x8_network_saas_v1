import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../utils/api';
import NeuralBackground from '../components/NeuralBackground';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      const errorParam = params.get('error');

      if (errorParam) {
        setStatus('error');
        setError(errorParam);
        setTimeout(() => navigate('/auth'), 3000);
        return;
      }

      if (access_token && refresh_token) {
        // Store tokens
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('isAuthenticated', 'true');

        try {
          // Fetch user data
          await apiClient.getCurrentUser();
          setStatus('success');
          setTimeout(() => navigate('/'), 1000);
        } catch (error) {
          setStatus('error');
          setError('Failed to fetch user data');
          setTimeout(() => navigate('/auth'), 3000);
        }
      } else {
        setStatus('error');
        setError('No tokens received');
        setTimeout(() => navigate('/auth'), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

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
                  Processing...
                </h1>
                <p className="text-sm font-light opacity-60">
                  Completing your sign in
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
                  Authentication Failed
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
