import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Lock, Database, Key, CheckCircle2, ScanFace, 
  FileText, Cpu, AlertCircle, ArrowUpRight, Sparkles 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { THEME } from './theme';
import { useSlide } from './parallax';

/* ───────── Shared Styling Helpers (matching HomePage & AboutPage) ───────── */
const wrap = 'mx-auto w-full max-w-[1400px] px-5 sm:px-8';
const h2 = 'text-[clamp(2rem,4.6vw,4.2rem)] font-semibold leading-[1.05] tracking-[-0.035em]';
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

/* ───────── Privacy Policy Data ───────── */
const POLICY_SECTIONS = [
  {
    icon: ScanFace,
    title: "No Raw Photo Retention",
    summary: "Raw facial images captured during enrollment are immediately transformed into 512-dimensional L2-normalized vector embeddings using InsightFace ArcFace. Once the vector is calculated, the raw image frame is purged from transient memory[cite: 8].",
    detail: "Embeddings cannot be reconstructed into original human facial photos[cite: 8]."
  },
  {
    icon: Database,
    title: "Vector DB Storage & Cosine Indexing",
    summary: "Facial vectors are stored inside isolated institutional collections within our Qdrant vector engine. All vector queries are executed over encrypted transport layer channels using TLS 1.3[cite: 8].",
    detail: "Strict multi-tenant isolation prevents cross-institution vector leaks[cite: 8]."
  },
  {
    icon: ShieldCheck,
    title: "Anti-Spoofing Liveness Verification",
    summary: "MiniFASNetV2 convolutional neural networks analyze frame liveness directly on edge nodes to confirm physical presence before triggering database lookups[cite: 8].",
    detail: "Prevents spoofing attempts via paper photos, digital screens, or 3D masks[cite: 8]."
  },
  {
    icon: Lock,
    title: "Encryption in Transit & At Rest",
    summary: "All API traffic between webcam client interfaces, FastAPI inference services, and Django REST admin backends is protected with AES-256 encryption at rest and TLS 1.3 in transit[cite: 8].",
    detail: "Industry-standard cryptographic controls for enterprise higher education[cite: 8]."
  },
  {
    icon: Key,
    title: "User Rights & Data Purging",
    summary: "Students and faculty members retain full rights under applicable data protection frameworks to request inspection or permanent deletion of their numerical vector token from the system[cite: 8].",
    detail: "One-click admin purge immediately removes vector points from Qdrant indexes[cite: 8]."
  },
  {
    icon: FileText,
    title: "Compliance & Institutional Governance",
    summary: "Presence AI adheres to GDPR and higher education biometric compliance standards, strictly auditing log creation and maintaining transparent data retention timelines[cite: 8].",
    detail: "Attendance logs are retained strictly per institutional academic policies[cite: 8]."
  }
];

/* ───────── Hero Component ───────── */
function PrivacyHero() {
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
        <Eyebrow icon={ShieldCheck}>Biometric Data Governance</Eyebrow>

        <h1 className="mt-6 text-[clamp(2.6rem,7vw,7rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-[var(--fg)]">
          <motion.span initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} style={{ x: line1 }} className="block">
            Your Biometric Privacy,
          </motion.span>
          <motion.span initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }} style={{ x: line2 }} className="block text-[var(--accent)]">
            Mathematically Protected.
          </motion.span>
        </h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
          Presence AI is engineered around privacy-by-design principles: turning facial imagery into irreversible numerical mathematical representations[cite: 8].
        </motion.p>
        <div className="mt-4 text-xs font-mono font-medium text-[var(--accent)] uppercase tracking-wider">
          Last updated: October 2026 • Version 2.4 Governance[cite: 8]
        </div>
      </div>
    </section>
  );
}

/* ───────── Policy Cards Section ───────── */
function PolicyGrid() {
  return (
    <section className="py-12 pb-24 sm:pb-32">
      <div className={wrap}>
        <div className="mx-auto max-w-5xl space-y-6">
          {POLICY_SECTIONS.map(({ icon: Icon, title, summary, detail }, idx) => (
            <Drift key={title} from={idx % 2 === 0 ? 20 : -20} to={idx % 2 === 0 ? -20 : 20}>
              <div className="group rounded-[2.5rem] border border-[var(--line)] bg-white p-8 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.08)] transition-all duration-300 hover:border-[var(--accent-line)] hover:shadow-xl flex flex-col md:flex-row gap-6 items-start">
                <span className={`${iconBadge} h-14 w-14 shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:bg-[var(--accent)] group-hover:text-white`}>
                  <Icon size={26} />
                </span>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold tracking-tight text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors">
                      {title}
                    </h2>
                    <span className="text-xs font-mono font-medium text-[var(--muted)]">0{idx + 1}</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                    {summary}
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] border border-[var(--accent-line)] px-4 py-1.5 text-xs font-medium text-[var(--accent)]">
                    <CheckCircle2 size={14} className="text-[var(--accent)]" />
                    <span>{detail}</span>
                  </div>
                </div>
              </div>
            </Drift>
          ))}
        </div>

        {/* Security Audit Banner */}
        <Reveal className="mt-16 mx-auto max-w-5xl">
          <div className="rounded-[2.5rem] border border-[var(--accent-line)] bg-[var(--accent-soft)] p-8 flex flex-col sm:flex-row items-center gap-6">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-[var(--accent)] shadow-md">
              <Lock size={28} />
            </span>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-semibold text-[var(--fg)]">Need a custom Security Audit or Data Processing Agreement?</h3>
              <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
                Our engineering team provides comprehensive architectural documentation and security whitepapers for university IT and compliance officers[cite: 8].
              </p>
            </div>
            <Link
              to="/contact"
              className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[var(--btn-bg)] px-6 py-3 text-xs font-medium text-[var(--btn-fg)] transition-transform hover:scale-[1.04]"
            >
              <span>Contact Compliance Desk</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ───────── Footer Component (Matching All Pages) ───────── */
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

/* ───────── Main Privacy Page Export ───────── */
export default function PrivacyPage() {
  return (
    <div style={THEME} className="min-h-screen bg-[var(--bg)] text-[var(--fg)] antialiased [overflow-x:clip]">
      <Navbar />
      <PrivacyHero />
      <PolicyGrid />
      <Footer />
    </div>
  );
}