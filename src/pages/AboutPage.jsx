import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ScanFace, Cpu, ShieldCheck, Zap, ArrowUpRight, CheckCircle2, 
  Eye, Database, Activity, GraduationCap, Lock, Server, Sparkles 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { THEME } from './theme';
import { useSlide } from './parallax';

/* ───────── Shared Styling Helpers (matching HomePage.jsx) ───────── */
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

/* ───────── Pipeline Steps Data ───────── */
const PIPELINE_STEPS = [
  {
    number: "01",
    title: "InsightFace SCRFD Detection",
    tagline: "Sub-millisecond Face Localization",
    description: "Webcam feeds stream frames asynchronously to our edge inference pipeline. SCRFD accurately detects multi-face bounding boxes even under dynamic lighting and off-axis head poses[cite: 6].",
    icon: Eye,
    stat: "< 12ms frame processing"
  },
  {
    number: "02",
    title: "MiniFASNetV2 Anti-Spoofing",
    tagline: "Neural Liveness Verification",
    description: "Before feature extraction, deep convolutional networks evaluate texture micro-patterns and depth reflections, rejecting paper prints, mobile screens, and 3D silicone mask spoofs[cite: 6].",
    icon: ShieldCheck,
    stat: "99.8% spoof rejection"
  },
  {
    number: "03",
    title: "512D ArcFace Vector Extraction",
    tagline: "High-Discriminative Feature Mapping",
    description: "Deep residual networks project aligned facial landmarks into a 512-dimensional hypersphere embedding, maximizing inter-class separation while normalizing scale and illumination[cite: 6].",
    icon: Cpu,
    stat: "512-D L2 Normalized"
  },
  {
    number: "04",
    title: "Qdrant Vector Search & Sync",
    tagline: "Cosine Similarity Matching",
    description: "Extracted embeddings perform high-speed HNSW vector search against enrolled institutional indexes, immediately logging timestamped attendance to Django REST backend and React console[cite: 6].",
    icon: Database,
    stat: "Sub-50ms query match"
  },
];

const METRICS = [
  { label: "Verification Latency", value: "< 90ms", desc: "End-to-end frame capture to log[cite: 6]" },
  { label: "Spoof Prevention", value: "99.8%", desc: "MiniFASNetV2 liveness accuracy[cite: 6]" },
  { label: "Vector Search Capacity", value: "100k+", desc: "Embeddings per institution node[cite: 6]" },
  { label: "Hardware Agnostic", value: "100%", desc: "Runs on webcams, IP cams & RTSP[cite: 6]" },
];

/* ───────── About Hero Component ───────── */
function AboutHero() {
  const heroRef = useRef(null);
  const line1 = useSlide(heroRef, '0vw', '-8vw', { offset: ['start start', 'end start'], always: true });
  const line2 = useSlide(heroRef, '0vw', '8vw', { offset: ['start start', 'end start'], always: true });
  const blobY = useSlide(heroRef, 0, 140, { offset: ['start start', 'end start'], always: true });

  return (
    <section ref={heroRef} className="relative overflow-hidden pb-24 pt-36 sm:pt-44">
      {/* Soft color wash background */}
      <motion.div aria-hidden style={{ y: blobY }} className="pointer-events-none absolute -right-32 -top-20 h-[520px] w-[520px] rounded-full opacity-60 blur-3xl">
        <div className="h-full w-full rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,154,231,.16), transparent 65% )' }} />
      </motion.div>

      <div className={wrap}>
        <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/70 px-4 py-1.5 text-xs font-medium text-[var(--muted)] backdrop-blur">
          <ScanFace size={14} className="text-[var(--accent)]" /> Next-Gen Biometric Engineering
        </span>

        <h1 className="text-[clamp(2.6rem,7.5vw,7.5rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-[var(--fg)]">
          <motion.span initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} style={{ x: line1 }} className="block">
            Engineering touchless
          </motion.span>
          <motion.span initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }} style={{ x: line2 }} className="block text-[var(--accent)]">
            attendance with AI.
          </motion.span>
        </h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="mt-8 max-w-2xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
          Presence bridges state-of-the-art edge computer vision models with real-time distributed backends—delivering frictionless identity recognition and live liveness verification without physical queuing[cite: 6].
        </motion.p>
      </div>
    </section>
  );
}

/* ───────── Mission & Architecture Overview ───────── */
function MissionSection() {
  return (
    <section className="border-t border-[var(--line)] py-24 sm:py-32">
      <div className={`${wrap} grid gap-16 lg:grid-cols-2 lg:items-center`}>
        <Reveal>
          <Eyebrow icon={Sparkles}>Mission & Architecture</Eyebrow>
          <h2 className={`${h2} mt-4`}>Zero manual roll calls. Pure mathematical precision.</h2>
          <p className="mt-6 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            Traditional attendance tracking suffers from proxy marking, wasted lecture hours, and cumbersome physical card readers. Presence transforms standard laptop webcams and IP feeds into intelligent biometric entry points[cite: 6].
          </p>
          <div className="mt-8 space-y-3">
            {[
              'Non-reversible 512D ArcFace vector embeddings preserve student privacy[cite: 6]',
              'Dual-stream liveness detection halts print and screen spoof attacks[cite: 6]',
              'Asynchronous frame queues ensure continuous high-FPS camera streaming[cite: 6]',
              'Instant synchronization with academic administration dashboards[cite: 6]'
            ].map((text, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm text-[var(--fg)]">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]"><CheckCircle2 size={14} /></span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.15)]">
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-[var(--card)]">
              <img
                src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop"
                alt="Neural Matrix Network"
                className="h-full w-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl bg-white/90 p-3.5 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <span className={`${iconBadge} h-10 w-10`}><Activity size={20} /></span>
                  <div>
                    <div className="text-xs font-semibold text-[var(--fg)]">InsightFace Inference Pipeline</div>
                    <div className="text-[11px] text-[var(--muted)]">Status: Active · Multi-thread CUDA</div>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 border border-emerald-500/20">
                  ONLINE
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ───────── Metrics Banner ───────── */
function MetricsBanner() {
  return (
    <section className="border-y border-[var(--line)] py-16">
      <div className={wrap}>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((m, idx) => (
            <div key={idx} className="border-l-2 border-[var(--accent)] pl-5">
              <div className="text-3xl font-bold tracking-tight text-[var(--fg)] sm:text-4xl">{m.value}</div>
              <div className="mt-1 text-sm font-semibold text-[var(--fg)]">{m.label}</div>
              <div className="mt-0.5 text-xs text-[var(--muted)]">{m.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Pipeline Workflow Cards ───────── */
function PipelineWorkflow() {
  return (
    <section className="py-24 sm:py-32">
      <div className={wrap}>
        <Reveal className="mb-16 text-center max-w-3xl mx-auto">
          <Eyebrow icon={Cpu}>End-To-End Ingestion Workflow</Eyebrow>
          <h2 className={`${h2} mt-4`}>How the computer vision stack processes live video</h2>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PIPELINE_STEPS.map(({ number, title, tagline, description, icon: Icon, stat }, i) => (
            <Drift key={number} from={i % 2 === 0 ? 20 : -20} to={i % 2 === 0 ? -20 : 20} className="h-full">
              <div className="group flex h-full flex-col justify-between rounded-[2rem] border border-[var(--line)] bg-white/70 p-8 transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-xl">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="rounded-full border border-[var(--line)] bg-[var(--card)] px-3 py-1 text-xs font-semibold text-[var(--fg)]">
                      {number}
                    </span>
                    <span className={`${iconBadge} h-12 w-12 transition-transform duration-300 group-hover:scale-110 group-hover:bg-[var(--accent)] group-hover:text-white`}>
                      <Icon size={22} />
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
                  <p className="mt-1 text-xs font-medium text-[var(--accent)]">{tagline}</p>
                  <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">{description}</p>
                </div>
                <div className="mt-8 pt-4 border-t border-[var(--line)] text-xs font-mono text-[var(--muted)]">
                  {stat}
                </div>
              </div>
            </Drift>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── CTA Section ───────── */
function AboutCTA() {
  return (
    <section className="relative overflow-hidden border-t border-[var(--line)] py-32 text-center">
      <div className={wrap}>
        <Reveal>
          <Eyebrow icon={CheckCircle2}>Get started</Eyebrow>
          <h2 className="mx-auto mt-5 max-w-3xl text-[clamp(2.2rem,5vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.04em]">
            Ready to experience real-time recognition live?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-[var(--muted)] sm:text-base">
            Test webcam-based face detection and liveness scoring directly inside our institutional demo console.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--btn-bg)] px-8 py-4 text-sm font-medium text-[var(--btn-fg)] transition-transform hover:scale-[1.04]"
            >
              <span>Book a Demo</span>
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ───────── Footer Component (Matching HomePage) ───────── */
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

/* ───────── Main About Page Export ───────── */
export default function AboutPage() {
  return (
    <div style={THEME} className="min-h-screen bg-[var(--bg)] text-[var(--fg)] antialiased [overflow-x:clip]">
      <Navbar />
      <AboutHero />
      <MissionSection />
      <MetricsBanner />
      <PipelineWorkflow />
      <AboutCTA />
      <Footer />
    </div>
  );
}