import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NeuralBackground from '../components/NeuralBackground';

export default function AuthPage() {
  // Initialize language from localStorage, default to 'EN'
  const [language, setLanguage] = useState(() => {
    const savedLang = localStorage.getItem('user_lang');
    return savedLang === 'es' ? 'ES' : 'EN';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [resetStep, setResetStep] = useState<'email' | 'code' | 'password'>('email');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { login, register, loginWithOAuth, requestPasswordReset, verifyResetCode, resetPassword, requestMagicLink } = useAuth();
  const navigate = useNavigate();

  // Translation object
  const t = {
    en: {
      nameRequired: 'Please enter your full name',
      registrationFailed: 'Registration failed. Email may already be registered.',
      resetCodeSent: 'Reset code sent to your email. Check your inbox!',
      resetCodeFailed: 'Failed to send reset code. Please try again.',
      codeVerified: 'Code verified! Now enter your new password.',
      invalidCode: 'Invalid or expired code. Please try again.',
      passwordMinLength: 'Password must be at least 6 characters',
      passwordResetSuccess: 'Password reset successful! Redirecting...',
      passwordResetFailed: 'Failed to reset password. Please try again.',
      invalidCredentials: 'Invalid credentials',
      registrationError: 'Registration failed',
      resetError: 'Reset failed',
      loginError: 'Login failed',
      emailRequired: 'Please enter your email address',
      magicLinkSent: 'Magic link sent! Check your email for the login link.',
      magicLinkFailed: 'Failed to send magic link. Please try again.',
      magicLinkError: 'Failed to send magic link',
      welcomeBack: 'Welcome Back',
      createAccount: 'Create Account',
      resetPassword: 'Reset Password',
      signInSubtitle: 'Sign in to access your dashboard',
      signUpSubtitle: 'Sign up to get started',
      resetSubtitle: 'Enter your email to reset password',
      continueWithGoogle: 'Continue with Google',
      continueWithFacebook: 'Continue with Facebook',
      orContinueWithEmail: 'or continue with email',
      fullName: 'Full Name',
      email: 'Email',
      password: 'Password',
      verificationCode: 'Verification Code',
      newPassword: 'New Password',
      enterCodePlaceholder: 'Enter 6-digit code',
      processing: 'Processing...',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      sendResetCode: 'Send Reset Code',
      verifyCode: 'Verify Code',
      resetPasswordBtn: 'Reset Password',
      forgotPassword: 'Forgot password?',
      noAccount: "Don't have an account?",
      signUpLink: 'Sign up',
      magicLink: 'Send me a magic link',
      haveAccount: 'Already have an account?',
      signInLink: 'Sign in',
      backToSignIn: 'Back to sign in'
    },
    es: {
      nameRequired: 'Por favor ingrese su nombre completo',
      registrationFailed: 'Registro fallido. El correo puede estar ya registrado.',
      resetCodeSent: '¡Código de restablecimiento enviado a su correo! Revise su bandeja de entrada.',
      resetCodeFailed: 'Error al enviar el código. Por favor intente de nuevo.',
      codeVerified: '¡Código verificado! Ahora ingrese su nueva contraseña.',
      invalidCode: 'Código inválido o expirado. Por favor intente de nuevo.',
      passwordMinLength: 'La contraseña debe tener al menos 6 caracteres',
      passwordResetSuccess: '¡Contraseña restablecida con éxito! Redirigiendo...',
      passwordResetFailed: 'Error al restablecer contraseña. Por favor intente de nuevo.',
      invalidCredentials: 'Credenciales inválidas',
      registrationError: 'Registro fallido',
      resetError: 'Restablecimiento fallido',
      loginError: 'Inicio de sesión fallido',
      emailRequired: 'Por favor ingrese su dirección de correo',
      magicLinkSent: '¡Enlace mágico enviado! Revise su correo para el enlace de inicio de sesión.',
      magicLinkFailed: 'Error al enviar enlace mágico. Por favor intente de nuevo.',
      magicLinkError: 'Error al enviar enlace mágico',
      welcomeBack: 'Bienvenido de Nuevo',
      createAccount: 'Crear Cuenta',
      resetPassword: 'Restablecer Contraseña',
      signInSubtitle: 'Inicie sesión para acceder a su panel',
      signUpSubtitle: 'Regístrese para comenzar',
      resetSubtitle: 'Ingrese su correo para restablecer contraseña',
      continueWithGoogle: 'Continuar con Google',
      continueWithFacebook: 'Continuar con Facebook',
      orContinueWithEmail: 'o continuar con correo',
      fullName: 'Nombre Completo',
      email: 'Correo',
      password: 'Contraseña',
      verificationCode: 'Código de Verificación',
      newPassword: 'Nueva Contraseña',
      enterCodePlaceholder: 'Ingrese código de 6 dígitos',
      processing: 'Procesando...',
      signIn: 'Iniciar Sesión',
      signUp: 'Registrarse',
      sendResetCode: 'Enviar Código',
      verifyCode: 'Verificar Código',
      resetPasswordBtn: 'Restablecer Contraseña',
      forgotPassword: '¿Olvidó su contraseña?',
      noAccount: '¿No tiene cuenta?',
      signUpLink: 'Regístrese',
      magicLink: 'Enviarme un enlace mágico',
      haveAccount: '¿Ya tiene cuenta?',
      signInLink: 'Iniciar sesión',
      backToSignIn: 'Volver a inicio de sesión'
    }
  };

  const lang = language.toLowerCase() as 'en' | 'es';
  const translations = t[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!fullName.trim()) {
          setError(translations.nameRequired);
          setLoading(false);
          return;
        }
        const success = await register(email, password, fullName);
        if (success) {
          navigate('/');
        } else {
          setError(translations.registrationFailed);
        }
      } else if (mode === 'reset') {
        if (resetStep === 'email') {
          const success = await requestPasswordReset(email);
          if (success) {
            setSuccessMessage(translations.resetCodeSent);
            setResetStep('code');
          } else {
            setError(translations.resetCodeFailed);
          }
        } else if (resetStep === 'code') {
          const success = await verifyResetCode(email, resetCode);
          if (success) {
            setSuccessMessage(translations.codeVerified);
            setResetStep('password');
          } else {
            setError(translations.invalidCode);
          }
        } else if (resetStep === 'password') {
          if (newPassword.length < 6) {
            setError(translations.passwordMinLength);
            setLoading(false);
            return;
          }
          const success = await resetPassword(email, resetCode, newPassword);
          if (success) {
            setSuccessMessage(translations.passwordResetSuccess);
            setTimeout(() => navigate('/'), 1500);
          } else {
            setError(translations.passwordResetFailed);
          }
        }
      } else {
        const success = await login(email, password);
        if (success) {
          navigate('/');
        } else {
          setError(translations.invalidCredentials);
        }
      }
    } catch (err) {
      setError(mode === 'signup' ? translations.registrationError : mode === 'reset' ? translations.resetError : translations.loginError);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    loginWithOAuth(provider);
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError(translations.emailRequired);
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const success = await requestMagicLink(email);
      if (success) {
        setSuccessMessage(translations.magicLinkSent);
      } else {
        setError(translations.magicLinkFailed);
      }
    } catch (err) {
      setError(translations.magicLinkError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <NeuralBackground isDark={true} />

      <div className="relative z-10 w-full max-w-md px-8">
        <div className="group relative">
          <div className="absolute -inset-8 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl blur-3xl" />

          <div className="relative bg-black/40 backdrop-blur-xl border border-blue-400/20 rounded-3xl p-12">
            <div className="text-center mb-8">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 blur-xl" />
                <span className="relative text-3xl font-extralight tracking-wider">
                  x8work
                </span>
              </div>
              {/* Language Toggle */}
              <div className="flex justify-center mb-4">
                <button
                  onClick={() => {
                    const newLang = language === 'EN' ? 'ES' : 'EN';
                    setLanguage(newLang);
                    localStorage.setItem('user_lang', newLang.toLowerCase());
                  }}
                  className="text-xs px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                >
                  {language === 'EN' ? 'ES' : 'EN'}
                </button>
              </div>
              <h1 className="text-2xl font-light tracking-tight mb-2">
                {mode === 'signin' && translations.welcomeBack}
                {mode === 'signup' && translations.createAccount}
                {mode === 'reset' && translations.resetPassword}
              </h1>
              <p className="text-sm font-light opacity-60">
                {mode === 'signin' && translations.signInSubtitle}
                {mode === 'signup' && translations.signUpSubtitle}
                {mode === 'reset' && translations.resetSubtitle}
              </p>
            </div>

            {(mode === 'signin' || mode === 'signup') && (
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => handleSocialLogin('google')}
                  type="button"
                  className="w-full px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 font-light"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>{translations.continueWithGoogle}</span>
                </button>

                <button
                  onClick={() => handleSocialLogin('facebook')}
                  type="button"
                  className="w-full px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 font-light"
                >
                  <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>{translations.continueWithFacebook}</span>
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-blue-400/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-black/40 text-gray-400 font-light">{translations.orContinueWithEmail}</span>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <label className="text-sm font-light opacity-70 flex items-center space-x-2">
                    <span>{translations.fullName}</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 bg-black/20 border border-blue-400/20 rounded-xl focus:border-cyan-400/40 outline-none transition-all duration-300 font-light text-white"
                    placeholder="John Doe"
                    required
                  />
                </div>
              )}

              {mode === 'reset' && resetStep === 'email' && (
                <div className="space-y-2">
                  <label className="text-sm font-light opacity-70 flex items-center space-x-2">
                    <Mail className="w-4 h-4" strokeWidth={1} />
                    <span>{translations.email}</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-black/20 border border-blue-400/20 rounded-xl focus:border-cyan-400/40 outline-none transition-all duration-300 font-light text-white"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              )}

              {mode === 'reset' && resetStep === 'code' && (
                <div className="space-y-2">
                  <label className="text-sm font-light opacity-70 flex items-center space-x-2">
                    <Lock className="w-4 h-4" strokeWidth={1} />
                    <span>{translations.verificationCode}</span>
                  </label>
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    className="w-full px-4 py-3 bg-black/20 border border-blue-400/20 rounded-xl focus:border-cyan-400/40 outline-none transition-all duration-300 font-light text-white text-center text-2xl tracking-widest"
                    placeholder={translations.enterCodePlaceholder}
                    required
                    maxLength={6}
                  />
                </div>
              )}

              {mode === 'reset' && resetStep === 'password' && (
                <div className="space-y-2">
                  <label className="text-sm font-light opacity-70 flex items-center space-x-2">
                    <Lock className="w-4 h-4" strokeWidth={1} />
                    <span>{translations.newPassword}</span>
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-black/20 border border-blue-400/20 rounded-xl focus:border-cyan-400/40 outline-none transition-all duration-300 font-light text-white"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              )}

              {mode !== 'reset' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-light opacity-70 flex items-center space-x-2">
                      <Mail className="w-4 h-4" strokeWidth={1} />
                      <span>{translations.email}</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-black/20 border border-blue-400/20 rounded-xl focus:border-cyan-400/40 outline-none transition-all duration-300 font-light text-white"
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-light opacity-70 flex items-center space-x-2">
                      <Lock className="w-4 h-4" strokeWidth={1} />
                      <span>{translations.password}</span>
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-black/20 border border-blue-400/20 rounded-xl focus:border-cyan-400/40 outline-none transition-all duration-300 font-light text-white"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                </>
              )}

              {error && (
                <div className="text-red-400 text-sm font-light text-center">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="text-green-400 text-sm font-light text-center">
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group/btn relative w-full px-8 py-4 rounded-full overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-2xl group-hover/btn:blur-3xl transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-cyan-400/40 group-hover/btn:border-cyan-400/60 rounded-full transition-all duration-500" />
                <span className="relative text-lg font-light tracking-wide flex items-center justify-center space-x-2">
                  <span>
                    {loading && translations.processing}
                    {!loading && mode === 'signin' && translations.signIn}
                    {!loading && mode === 'signup' && translations.signUp}
                    {!loading && mode === 'reset' && resetStep === 'email' && translations.sendResetCode}
                    {!loading && mode === 'reset' && resetStep === 'code' && translations.verifyCode}
                    {!loading && mode === 'reset' && resetStep === 'password' && translations.resetPasswordBtn}
                  </span>
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" strokeWidth={1} />
                </span>
              </button>
            </form>

            <div className="mt-6 text-center space-y-2">
              {mode === 'signin' && (
                <>
                  <button
                    onClick={() => {
                      setMode('reset');
                      setError('');
                      setSuccessMessage('');
                      setResetStep('email');
                    }}
                    type="button"
                    className="text-sm font-light opacity-60 hover:opacity-100 transition-opacity duration-300"
                  >
                    {translations.forgotPassword}
                  </button>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-sm font-light opacity-60">{translations.noAccount}</span>
                    <button
                      onClick={() => {
                        setMode('signup');
                        setError('');
                        setSuccessMessage('');
                      }}
                      type="button"
                      className="text-sm font-light text-cyan-400 hover:text-cyan-300 transition-colors duration-300"
                    >
                      {translations.signUpLink}
                    </button>
                  </div>
                  <button
                    onClick={handleMagicLink}
                    type="button"
                    className="text-sm font-light text-blue-400 hover:text-blue-300 transition-colors duration-300"
                  >
                    {translations.magicLink}
                  </button>
                </>
              )}
              {mode === 'signup' && (
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-sm font-light opacity-60">{translations.haveAccount}</span>
                  <button
                    onClick={() => {
                      setMode('signin');
                      setError('');
                      setSuccessMessage('');
                    }}
                    type="button"
                    className="text-sm font-light text-cyan-400 hover:text-cyan-300 transition-colors duration-300"
                  >
                    {translations.signInLink}
                  </button>
                </div>
              )}
              {mode === 'reset' && (
                <button
                  onClick={() => {
                    setMode('signin');
                    setResetStep('email');
                    setResetCode('');
                    setNewPassword('');
                    setError('');
                    setSuccessMessage('');
                  }}
                  type="button"
                  className="text-sm font-light text-cyan-400 hover:text-cyan-300 transition-colors duration-300"
                >
                  {translations.backToSignIn}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
