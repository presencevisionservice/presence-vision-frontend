import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Zap, ShieldCheck, LayoutDashboard, FileBarChart, Lock, ScanFace, 
  CheckCircle2, ArrowUpRight, Cpu, Layers, Sparkles, Smartphone, Eye, Check
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { THEME } from './theme';
import { useSlide } from './parallax';

/* ───────── Shared Styling Helpers ───────── */
const wrap = 'mx-auto w-full max-w-[1400px] px-5 sm:px-8';
const h2 = 'text-[clamp(2rem,4.6vw,4.2rem)] font-semibold leading-[1.05] tracking-[-0.035em]';
const tag = 'rounded-full border border-[var(--line)] bg-white/60 px-3 py-1 text-xs text-[var(--muted)]';
const iconBadge = 'grid place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]';

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

/* ───────── Detailed Features Data ───────── */
const DEEP_FEATURES = [
  {
    icon: Zap,
    title: 'Instant Sub-Second Recognition',
    tagline: '0.12s Search Latency',
    desc: 'Whole student batches pass through gate points in seconds. Deep residual networks process multiple faces per frame in real-time without queuing or slowdowns[cite: 3].',
    highlights: ['0.12s vector search[cite: 1, 3]', '99.8% recognition accuracy[cite: 1, 3]', 'Multi-face parallel inference[cite: 6]'],
    stat: 'Sub-100ms pipeline[cite: 6]'
  },
  {
    icon: ShieldCheck,
    title: 'Anti-Spoofing Liveness Guard',
    tagline: 'MiniFASNetV2 Edge Verification',
    desc: 'Deep texture micro-pattern and depth analysis reject paper prints, phone screens, and silicone masks to make proxy marking mathematically impossible[cite: 3, 6].',
    highlights: ['Liveness verification[cite: 1, 3]', 'Screen attack rejection[cite: 1, 6]', 'Paper print detection[cite: 6]'],
    stat: '99.8% spoof rejection[cite: 6]'
  },
  {
    icon: LayoutDashboard,
    title: 'Live Classroom Dashboard',
    tagline: 'Real-Time Telemetry',
    desc: 'Administrators, principals, and department heads view live visual roll calls, track gate check-ins, and inspect live attendance statistics as students enter[cite: 3].',
    highlights: ['Real-time WebSockets[cite: 3]', 'Class & section filters[cite: 3]', 'Late-arrival tags[cite: 3]'],
    stat: '0s dashboard delay[cite: 3]'
  },
  {
    icon: FileBarChart,
    title: 'Automated Academic Reporting',
    tagline: 'PDF & Excel Export Engine',
    desc: 'Generate automated daily attendance logs, monthly course reports, and mandatory shortage-of-attendance lists for university registrars and principals[cite: 3].',
    highlights: ['Automated PDF/Excel exports[cite: 3]', 'Course shortage alerts[cite: 3]', 'Departmental aggregation[cite: 3]'],
    stat: '1-click reporting[cite: 3]'
  },
  {
    icon: Lock,
    title: 'Cryptographic Vector Privacy',
    tagline: '512-D Non-Reversible Embeddings',
    desc: 'Original photos are purged after enrollment. Faces are converted into 512-dimensional vector mathematical representations, making photo reconstruction impossible[cite: 3, 6, 8].',
    highlights: ['Non-reversible vectors[cite: 3, 6]', 'Qdrant collection isolation[cite: 6, 8]', 'AES-256 & TLS 1.3 encryption[cite: 8]'],
    stat: 'Zero photo retention[cite: 3, 8]'
  },
  {
    icon: Smartphone,
    title: 'Instant Parent Notification Engine',
    tagline: 'Automated Attendance Alerts',
    desc: 'Guardians receive instant SMS or app notifications the moment a student checks in at the entrance or is flagged absent/late during morning assembly[cite: 3].',
    highlights: ['Instant guardian alerts[cite: 3]', 'Absence notifications[cite: 3]', 'Custom SMS integration[cite: 3]'],
    stat: 'Instant alerts[cite: 3]'
  }
];

/* ───────── Feature Hero Component ───────── */
function FeaturesHero() {
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
        <Eyebrow icon={Sparkles}>Full Capability Suite</Eyebrow>

        <h1 className="mt-6 text-[clamp(2.6rem,7vw,7rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-[var(--fg)]">
          <motion.span initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} style={{ x: line1 }} className="block">
            Everything attendance needs.
          </motion.span>
          <motion.span initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }} style={{ x: line2 }} className="block text-[var(--accent)]">
            Nothing it doesn't.
          </motion.span>
        </h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
          Explore the deep computer vision models, real-time sync pipelines, and administrative controls engineered into Presence[cite: 3, 6].
        </motion.p>
      </div>
    </section>
  );
}

/* ───────── Feature Grid Component ───────── */
function FeatureGrid() {
  return (
    <section className="py-12 pb-24 sm:pb-32">
      <div className={wrap}>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {DEEP_FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <Drift key={f.title} from={i % 2 === 0 ? 25 : -25} to={i % 2 === 0 ? -25 : 25} className="h-full">
                <div className="group flex h-full flex-col justify-between rounded-[2.5rem] border border-[var(--line)] bg-white p-8 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.08)] transition-all duration-300 hover:border-[var(--accent-line)] hover:shadow-xl">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className={`${iconBadge} h-14 w-14 transition-transform duration-300 group-hover:scale-110 group-hover:bg-[var(--accent)] group-hover:text-white`}>
                        <Icon size={26} />
                      </span>
                      <span className="rounded-full border border-[var(--line)] bg-[var(--card)] px-3 py-1 text-xs font-mono font-medium text-[var(--fg)]">
                        {f.stat}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold tracking-tight text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors">
                      {f.title}
                    </h3>
                    <div className="mt-1 text-xs font-semibold text-[var(--accent)]">{f.tagline}</div>
                    <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">{f.desc}</p>

                    <div className="mt-6 space-y-2 border-t border-[var(--line)] pt-4">
                      {f.highlights.map((h) => (
                        <div key={h} className="flex items-center gap-2 text-xs text-[var(--fg)] font-medium">
                          <Check size={14} className="text-[var(--accent)] shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Drift>
            );
          })}
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

/* ───────── Main Features Page ───────── */
export default function FeaturesPage() {
  return (
    <div style={THEME} className="min-h-screen bg-[var(--bg)] text-[var(--fg)] antialiased [overflow-x:clip]">
      <Navbar />
      <FeaturesHero />
      <FeatureGrid />
      <Footer />
    </div>
  );
}