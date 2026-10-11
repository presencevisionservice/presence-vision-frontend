import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  School, Library, GraduationCap, Check, ArrowUpRight, Plus, Minus, 
  Sparkles, HelpCircle, ShieldCheck
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { THEME } from './theme';
import { useSlide } from './parallax';

/* ───────── Shared Styling Helpers ───────── */
const wrap = 'mx-auto w-full max-w-[1400px] px-5 sm:px-8';
const h2 = 'text-[clamp(2rem,4.6vw,4.2rem)] font-semibold leading-[1.05] tracking-[-0.035em]';

function Eyebrow({ icon: I, children }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)]">
      <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]"><I size={13} /></span>
      {children}
    </span>
  );
}

function Reveal({ children, className = '' }) {
  return (
    <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

function Drift({ from, to, className = '', children }) {
  const ref = useRef(null);
  const y = useSlide(ref, from, to);
  return <motion.div ref={ref} style={{ y }} className={`will-change-transform ${className}`}>{children}</motion.div>;
}

/* ───────── Pricing Plans Data ───────── */
const PLANS = [
  { 
    icon: School, 
    n: 'Classroom', 
    d: 'For a small school, a single wing or a coaching academy[cite: 3].', 
    p: '\$49', 
    u: '/ month[cite: 3]', 
    items: ['1 camera feed support[cite: 3]', 'Up to 300 students enrolled[cite: 3]', 'Live attendance dashboard[cite: 3]', 'Email support[cite: 3]'] 
  },
  { 
    icon: Library, 
    n: 'Campus', 
    d: 'For schools and colleges that need more gates, reports and parent alerts[cite: 3].', 
    p: '\$149', 
    u: '/ month[cite: 3]', 
    items: ['Up to 8 cameras[cite: 3]', 'Up to 3,000 students[cite: 3]', 'Parent SMS alerts[cite: 3]', 'Attendance shortage reports[cite: 3]', 'Priority support[cite: 3]'], 
    featured: true 
  },
  { 
    icon: GraduationCap, 
    n: 'University', 
    d: 'For universities and school groups running multiple campuses[cite: 3].', 
    p: 'Custom[cite: 3]', 
    u: '', 
    items: ['Unlimited camera feeds[cite: 3]', 'Multi-campus control[cite: 3]', 'SIS / LMS integration[cite: 3]', 'SSO and audit logs[cite: 3]', 'Dedicated manager[cite: 3]'] 
  },
];
const PLAN_SPEED = [[40, -20], [0, 0], [60, -30]];

/* ───────── FAQ Data ───────── */
const FAQS = [
  ['What hardware do we need?', 'Presence runs on built-in laptop webcams, standard USB webcams, or IP security cameras streaming via RTSP[cite: 3, 6].'],
  ['Can we change plans as our student count grows?', 'Yes! You can upgrade or add additional camera licenses at any time from your admin panel[cite: 3].'],
  ['Is there an enterprise setup fee?', 'Classroom and Campus plans have zero setup fees. University plans include custom implementation and hardware setup services[cite: 3].'],
  ['How is student data protected?', 'All faces are transformed into irreversible 512-D vectors. Original photos are purged immediately[cite: 3, 6, 8].'],
];

/* ───────── Pricing Hero Component ───────── */
function PricingHero() {
  const heroRef = useRef(null);
  const line1 = useSlide(heroRef, '0vw', '-6vw', { offset: ['start start', 'end start'], always: true });
  const line2 = useSlide(heroRef, '0vw', '6vw', { offset: ['start start', 'end start'], always: true });
  const blobY = useSlide(heroRef, 0, 120, { offset: ['start start', 'end start'], always: true });

  return (
    <section ref={heroRef} className="relative overflow-hidden pb-16 pt-36 sm:pt-44">
      <motion.div aria-hidden style={{ y: blobY }} className="pointer-events-none absolute -right-32 -top-20 h-[500px] w-[500px] rounded-full opacity-60 blur-3xl">
        <div className="h-full w-full rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,154,231,.16), transparent 65%)' }} />
      </motion.div>

      <div className={wrap}>
        <Eyebrow icon={Library}>Transparent Pricing</Eyebrow>

        <h1 className="mt-6 text-[clamp(2.6rem,7vw,7rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-[var(--fg)]">
          <motion.span initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} style={{ x: line1 }} className="block">
            Choose a plan that fits
          </motion.span>
          <motion.span initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }} style={{ x: line2 }} className="block text-[var(--accent)]">
            your institution.
          </motion.span>
        </h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
          Simple tier pricing with zero hidden fees. Scale effortlessly from single classrooms to multi-campus universities[cite: 3].
        </motion.p>
      </div>
    </section>
  );
}

/* ───────── Pricing Cards Component ───────── */
function PricingCards() {
  return (
    <section className="py-12 pb-24 sm:pb-32">
      <div className={wrap}>
        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((p, i) => {
            const I = p.icon;
            return (
              <Drift key={p.n} from={PLAN_SPEED[i][0]} to={PLAN_SPEED[i][1]} className="h-full">
                <div className={`flex h-full flex-col rounded-[2.5rem] border p-8 sm:p-10 transition-transform duration-300 hover:-translate-y-1.5 ${p.featured ? 'border-transparent bg-[var(--fg)] text-[var(--bg)] shadow-[0_40px_80px_-30px_rgba(0,154,231,0.55)]' : 'border-[var(--line)] bg-white/80'}`}>
                  <span className={`grid h-12 w-12 place-items-center rounded-2xl ${p.featured ? 'bg-[var(--accent)] text-white' : 'bg-[var(--accent-soft)] text-[var(--accent)]'}`}><I size={22} /></span>
                  <h3 className="mt-6 text-2xl font-semibold">{p.n}</h3>
                  <p className={`mt-2 text-sm leading-relaxed ${p.featured ? 'text-[var(--bg-60)]' : 'text-[var(--muted)]'}`}>{p.d}</p>
                  
                  <ul className="my-8 space-y-3.5 text-sm">
                    {p.items.map((x) => (
                      <li key={x} className="flex items-center gap-3">
                        <Check size={16} className={p.featured ? 'text-[var(--accent)]' : 'text-[var(--accent)]'} />
                        <span>{x}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-4">
                    <div className="mb-6 flex items-baseline gap-1">
                      <span className="text-5xl font-semibold tracking-[-0.04em]">{p.p}</span>
                      <span className={`text-sm ${p.featured ? 'text-[var(--bg-60)]' : 'text-[var(--muted)]'}`}>{p.u}</span>
                    </div>
                    <Link to="/contact" className={`flex items-center justify-center gap-2 rounded-full py-4 text-sm font-medium transition-transform hover:scale-[1.02] ${p.featured ? 'bg-[var(--bg)] text-[var(--fg)]' : 'bg-[var(--btn-bg)] text-[var(--btn-fg)]'}`}>
                      Inquire for {p.n} <ArrowUpRight size={15} />
                    </Link>
                  </div>
                </div>
              </Drift>
            );
          })}
        </div>

        {/* Pricing FAQ Section */}
        <div className="mt-28 grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <Reveal>
            <Eyebrow icon={HelpCircle}>Questions</Eyebrow>
            <h2 className={`${h2} mt-4`}>Frequently asked questions about pricing</h2>
          </Reveal>
          
          <div className="space-y-4">
            {FAQS.map(([q, a], idx) => (
              <Reveal key={q}>
                <div className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-sm">
                  <h3 className="text-base font-semibold tracking-tight text-[var(--fg)]">{q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{a}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Footer Component ───────── */
function Footer() {
  const ref = useRef(null);
  const y = useSlide(ref, '45%', '0%', { offset: ['start end', 'end end'], always: true });
  return (
    <footer ref={ref} className="border-t border-[var(--line)] pt-16">
      <div className={`${wrap} flex flex-col justify-between gap-10 sm:flex-row`}>
        <nav className="flex flex-col gap-2 text-sm" aria-label="Footer navigation">
          <Link to="/about" className="text-[var(--muted)] hover:text-[var(--fg)]">About</Link>
          <Link to="/contact" className="text-[var(--muted)] hover:text-[var(--fg)]">Contact</Link>
          <Link to="/privacy" className="text-[var(--muted)] hover:text-[var(--fg)]">Privacy Policy</Link>
        </nav>
        <div className="flex gap-6 text-sm text-[var(--muted)]">
          {['LinkedIn', 'Facebook', 'Instagram', 'YouTube'].map((s) => <a key={s} href="#" className="hover:text-[var(--fg)]">{s}</a>)}
        </div>
      </div>
      <div className="overflow-hidden">
        <motion.div
          style={{ y, maskImage: 'linear-gradient(to bottom, #000 35%, transparent 95%)', WebkitMaskImage: 'linear-gradient(to bottom, #000 35%, transparent 95%)' }}
          className="select-none text-center text-[clamp(4.5rem,21vw,19rem)] font-semibold leading-[0.85] tracking-[-0.06em]"
        >
          presence
        </motion.div>
      </div>
      <div className={`${wrap} flex flex-col justify-between gap-2 border-t border-[var(--line)] py-6 text-xs text-[var(--muted)] sm:flex-row`}>
        <span>© {new Date().getFullYear()} Presence AI Inc. All rights reserved.</span>
        <span>Face-recognition attendance for educational institutions</span>
      </div>
    </footer>
  );
}

/* ───────── Main Pricing Page ───────── */
export default function PricingPage() {
  return (
    <div style={THEME} className="min-h-screen bg-[var(--bg)] text-[var(--fg)] antialiased [overflow-x:clip]">
      <Navbar />
      <PricingHero />
      <PricingCards />
      <Footer />
    </div>
  );
}