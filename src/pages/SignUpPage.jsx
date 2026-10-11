import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayoutPage';
import api from '../services/axios';
import { THEME } from './theme';

export default function SignupPage() {
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const register_err_msg = localStorage.getItem('registration_error_message');

  function handle_register_error(msg) {
    setErrorMsg(msg);
    setTimeout(() => {
      setErrorMsg('');
    }, 3500);
  }

  useEffect(() => {
    if (register_err_msg) {
      handle_register_error(register_err_msg);
      localStorage.removeItem("registration_error_message");
    }
  }, [register_err_msg]);

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
  
    const formData = new FormData(e.target);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });
  
    try {
      const response = await api.post(`/authentication/user_registration`, data);
      console.log(response.data);

      localStorage.setItem("verification_token", response.data['verification_token']);
      localStorage.setItem("pending_email", data.email);

      navigate("/user-otp-verify");
      setLoading(false);
    } catch (err) {
      console.error("Registration failed:", err.response ? err.response.data : err.message);
      handle_register_error(err.response?.data?.error || "Registration failed. Check inputs.");
      setLoading(false);
    }
  }

  return (
    <div style={THEME} className="h-screen w-screen overflow-hidden bg-[var(--bg)] text-[var(--fg)] antialiased">
      <AuthLayout
        icon={UserPlus}
        title="Create Account"
        subtitle="Register your profile into the Presence AI biometric portal."
      >
        {errorMsg && (
          <div className="mb-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--muted)]">
                <User size={15} />
              </div>
              <input
                type="text"
                name="username"
                required
                className="block w-full pl-10 pr-3.5 py-2.5 border border-[var(--line)] rounded-xl bg-[var(--bg)] text-xs text-[var(--fg)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] focus:border-[var(--accent)] focus:bg-white transition-all"
                placeholder="Aisha Khan"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Institutional Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--muted)]">
                <Mail size={15} />
              </div>
              <input
                type="email"
                name="email"
                required
                className="block w-full pl-10 pr-3.5 py-2.5 border border-[var(--line)] rounded-xl bg-[var(--bg)] text-xs text-[var(--fg)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] focus:border-[var(--accent)] focus:bg-white transition-all"
                placeholder="aisha@institution.edu"
              />
            </div>
          </div>

          {/* Password Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--muted)]">
                  <Lock size={14} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  className="block w-full pl-9 pr-8 py-2.5 border border-[var(--line)] rounded-xl bg-[var(--bg)] text-xs text-[var(--fg)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] focus:border-[var(--accent)] focus:bg-white transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[var(--muted)] hover:text-[var(--fg)]"
                >
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Confirm
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--muted)]">
                  <Lock size={14} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password2"
                  required
                  className="block w-full pl-9 pr-3 py-2.5 border border-[var(--line)] rounded-xl bg-[var(--bg)] text-xs text-[var(--fg)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] focus:border-[var(--accent)] focus:bg-white transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[var(--btn-bg)] hover:scale-[1.02] text-[var(--btn-fg)] font-medium py-3 px-4 rounded-full transition-transform duration-300 mt-2 disabled:opacity-70 shadow-md text-xs"
          >
            {loading ? (
              <span className="animate-pulse">Generating Token...</span>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-3 flex items-center justify-center">
          <div className="flex-grow border-t border-[var(--line)]"></div>
          <span className="px-3 text-[11px] text-[var(--muted)] font-mono bg-[var(--bg)] rounded-full">OR</span>
          <div className="flex-grow border-t border-[var(--line)]"></div>
        </div>

        {/* Google Sign Up Button */}
        <Link 
          to={`${import.meta.env.VITE_API_URL}/authentication/login/google/`} 
          className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-[var(--card)] border border-[var(--line)] text-[var(--fg)] font-medium py-2.5 px-4 rounded-full transition-all duration-300 mb-3 shadow-sm text-xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>Continue with Google</span>
        </Link>

        <div className="pt-2.5 border-t border-[var(--line)] text-center">
          <p className="text-xs text-[var(--muted)]">
            Already registered?{' '}
            <Link to="/login" className="text-[var(--accent)] hover:underline font-semibold transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </AuthLayout>
    </div>
  );
}