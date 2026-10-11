import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, MailCheck, KeyRound } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayoutPage';
import api from '../services/axios';
import { THEME } from './theme';

const OTP_LENGTH = 4;

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef([]);

  const verificationToken =
    location.state?.verification_token ||
    localStorage.getItem('verification_token');
  const email = location.state?.email || localStorage.getItem('pending_email');

  useEffect(() => {
    if (!verificationToken) {
      navigate('/dashboard', { replace: true });
    }
  }, [verificationToken, navigate]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function handleChange(index, value) {
    if (!/^\d*\$/.test(value)) return;

    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, OTP_LENGTH);
    if (!pasted) return;

    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((ch, i) => (next[i] = ch));
    setOtp(next);

    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  }

  async function handleVerify(e) {
    e.preventDefault();
    setError('');

    const otpString = otp.join('');
    if (otpString.length !== OTP_LENGTH) {
      setError(`Please enter the complete ${OTP_LENGTH}-digit code.`);
      setTimeout(() => setError(''), 2000);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/authentication/user_otp_verify', {
        verification_token: verificationToken,
        otp: otpString,
      });

      localStorage.setItem('store_date', response.data['store_date']);
      localStorage.setItem('store_time', response.data['store_time']);
      localStorage.setItem('is_restricted', false);

      localStorage.removeItem('verification_token');
      localStorage.removeItem('pending_email');

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error(
        'OTP verification failed:',
        err.response ? err.response.data : err.message
      );

      const status = err.response?.status;
      let msg = err.response?.data?.error || 'Verification failed. Please try again.';
      if (status === 429) {
        msg = 'Too many attempts. Please try again later.';
      }

      setError(msg);
      setTimeout(() => setError(''), 2500);

      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={THEME} className="min-h-screen bg-[var(--bg)] text-[var(--fg)] antialiased">
      <AuthLayout
        icon={KeyRound}
        title="Verify Identity"
        subtitle={
          email
            ? `Enter the ${OTP_LENGTH}-digit security token sent to ${email}`
            : `Enter the ${OTP_LENGTH}-digit security code sent to your email.`
        }
      >
        {error && (
          <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-center gap-3">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                className={`w-14 h-16 text-center text-2xl font-bold rounded-2xl border transition-all duration-300 outline-none ${
                  digit
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] shadow-md'
                    : 'border-[var(--line)] bg-[var(--bg)] text-[var(--fg)] focus:border-[var(--accent)] focus:bg-white focus:ring-2 focus:ring-[var(--accent-soft)]'
                }`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[var(--btn-bg)] hover:scale-[1.02] text-[var(--btn-fg)] font-medium py-4 px-4 rounded-full transition-transform duration-300 shadow-lg disabled:opacity-70"
          >
            {loading ? (
              <span className="animate-pulse">Validating Code...</span>
            ) : (
              <>
                <span>Verify & Continue</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[var(--line)] flex items-center justify-center gap-2 text-xs text-[var(--muted)]">
          <MailCheck size={15} className="text-[var(--accent)]" />
          <span>Didn't receive the email?</span>
          <Link
            to="/signup"
            className="text-[var(--accent)] hover:underline font-semibold transition-colors"
          >
            Resend code
          </Link>
        </div>
      </AuthLayout>
    </div>
  );
}