import React from 'react';
import { Link } from 'react-router-dom';
import { ScanFace, ArrowLeft, ShieldCheck } from 'lucide-react';
import { THEME } from './theme';

export default function AuthLayout({ children, icon: Icon = ScanFace, title, subtitle }) {
  return (
    <div style={THEME} className="h-screen w-screen bg-[var(--bg)] text-[var(--fg)] antialiased flex flex-col justify-between font-['Poppins',sans-serif] overflow-hidden">
      {/* Background Soft Color Wash */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 bg-[radial-gradient(circle,rgba(0,154,231,.10),transparent_70%)] blur-3xl" />

      {/* Top Header Navigation */}
      <header className="relative z-10 w-full px-6 py-4 max-w-7xl mx-auto flex items-center justify-between shrink-0">
        <Link to="/" className="group flex items-center gap-2.5 text-[var(--fg)]">
          <span className="grid h-8 w-8 place-items-center transition-transform duration-300">
            <img src="/logo.png" className='w-9/10 h-9/10 object-center object-contain' alt="" />
          </span>
          <span className="text-base font-semibold tracking-tight">Presence</span>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-white/70 px-3.5 py-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--fg)] hover:border-[var(--accent-line)] transition-all backdrop-blur"
        >
          <ArrowLeft size={13} />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Card Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-1 overflow-hidden">
        <div className="w-full max-w-md my-auto">
          <div className="rounded-[2.2rem] border border-[var(--line)] bg-white p-6 sm:p-7 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.08)] backdrop-blur-xl relative overflow-hidden">
            
            {/* Header Icon Badge */}
            <div className="flex flex-col items-center text-center mb-5">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--accent-soft)] border border-[var(--accent-line)] text-[var(--accent)] shadow-sm mb-2.5">
                <Icon size={22} />
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-[var(--fg)]">{title}</h1>
              {subtitle && <p className="mt-1 text-xs text-[var(--muted)] font-normal leading-relaxed">{subtitle}</p>}
            </div>

            {/* Auth Form / Children */}
            {children}
          </div>

          {/* Bottom Security Assurance Tag */}
          <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-[var(--muted)] font-mono">
            <ShieldCheck size={13} className="text-emerald-600" />
            <span>256-Bit Encrypted Biometric Transport</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-3 text-center text-xs text-[var(--muted)] font-mono border-t border-[var(--line)] shrink-0">
        © {new Date().getFullYear()} Presence AI Inc. All rights reserved.
      </footer>
    </div>
  );
}