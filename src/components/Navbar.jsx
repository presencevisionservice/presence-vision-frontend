import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ScanFace } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { THEME } from '../pages/theme';

const LINKS = [
  { to: '/about', label: 'About' },
  { to: '/features', label: 'Features' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/contact', label: 'Contact' },
  { to: '/privacy', label: 'Privacy' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const { user, loading } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    const onResize = () => window.innerWidth >= 768 && setOpen(false);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const cta = user ? { to: '/dashboard', label: 'Dashboard' } : { to: '/contact', label: 'Book a demo' };

  return (
    <header style={THEME} className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-8">
      <nav
        aria-label="Main navigation"
        style={scrolled || open ? { background: 'var(--bg-80)' } : undefined}
        className={`relative mx-auto flex max-w-[1400px] items-center justify-between rounded-full border py-2 pl-3 pr-2 transition-all duration-300 ${
          scrolled || open ? ' shadow-[0_10px_40px_-20px_rgba(0,0,0,0.15)] backdrop-blur-sm' : 'border-transparent'
        }`}
      >
        <Link to="/" aria-label="Presence home" className="group flex items-center gap-2.5 text-[var(--fg)]">
          <span className="grid h-9 w-9 place-items-center rounded-full flex items-center justify-center content-center transition-transform duration-300">
            <img src="/logo.png" className="w-9/10 h-9/10 object-contain object-center" alt="" />
          </span>
          <span className="text-lg font-semibold tracking-tight">Presence</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} className={`text-sm transition-colors ${pathname === l.to ? 'text-[var(--fg)]' : 'text-[var(--muted)] hover:text-[var(--fg)]'}`}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {!user && !loading && <Link to="/login" className="px-3 text-sm text-[var(--muted)] transition-colors hover:text-[var(--fg)]">Log in</Link>}
          <Link to={cta.to} className="rounded-full bg-[var(--btn-bg)] px-5 py-2.5 text-sm font-medium text-[var(--btn-fg)] transition-transform hover:scale-[1.04]">
            {cta.label}
          </Link>
        </div>

        <button onClick={() => setOpen((v) => !v)} aria-label="Toggle menu" aria-expanded={open} className="grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] text-[var(--fg)] md:hidden">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>

        {open && (
          <div style={{ background: 'var(--bg-95)' }} className="absolute left-0 right-0 top-full mt-2 flex flex-col gap-1 rounded-3xl border border-[var(--line)] p-4 backdrop-blur-xl md:hidden">
            {LINKS.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 text-base text-[var(--fg)] hover:bg-black/5">{l.label}</Link>
            ))}
            <Link to={cta.to} onClick={() => setOpen(false)} className="mt-2 rounded-full bg-[var(--btn-bg)] py-3 text-center text-sm font-medium text-[var(--btn-fg)]">{cta.label}</Link>
          </div>
        )}
      </nav>
    </header>
  );
}