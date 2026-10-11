import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, animate, useInView, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import {
  ArrowUpRight, Plus, Minus, Check, School, BookOpen, GraduationCap, Users, Zap, ShieldCheck, LayoutDashboard,
  Bell, FileBarChart, Lock, UserPlus, ScanFace, CheckCircle2, Clock, UserX, UserCheck, CalendarCheck, Smartphone,
  Building2, Library,
} from 'lucide-react';
import Hero from '../components/Hero';
import Navbar from '../components/Navbar';
import { THEME } from './theme';
import { useSlide } from './parallax';

/* ───────── helpers ───────── */
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

function Btn({ to, children, ghost }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium transition-transform hover:scale-[1.04] ${
        ghost ? 'border border-[var(--line)] bg-white/60 text-[var(--fg)] hover:bg-white' : 'bg-[var(--btn-bg)] text-[var(--btn-fg)]'
      }`}
    >
      {children}
      <ArrowUpRight size={15} />
    </Link>
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

function Marquee({ children, speed = 30 }) {
  return (
    <div className="overflow-hidden">
      <div className="mq flex w-max" style={{ animationDuration: `${speed}s` }}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>{children}</div>
      </div>
    </div>
  );
}

function Count({ to, suffix }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 2, ease: 'easeOut', onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [inView, to]);
  return <span ref={ref}>{v}{suffix}</span>;
}

/* ───────── 1. Institutions marquee ───────── */
const INSTITUTIONS = [
  [School, 'Greenfield School'], [GraduationCap, 'Northgate University'], [BookOpen, 'Summit College'], [Library, 'Crescent Academy'],
  [School, 'Horizon Public School'], [Building2, 'Riverside Institute'], [GraduationCap, 'Unity University'], [BookOpen, 'Maple Grove College'],
];

function Institutions() {
  return (
    <section className="border-y border-[var(--line)] py-14">
      <div className={`${wrap} mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between`}>
        <Eyebrow icon={GraduationCap}>Our institutions</Eyebrow>
        <h2 className="text-lg font-medium tracking-tight sm:text-2xl">Trusted by schools, colleges and universities</h2>
      </div>
      <Marquee speed={40}>
        {INSTITUTIONS.map(([I, name]) => (
          <span key={name} className="flex items-center gap-3 px-8 text-xl font-medium tracking-tight text-[var(--muted)] sm:px-12 sm:text-2xl">
            <span className={`${iconBadge} h-11 w-11`}><I size={20} /></span>{name}
          </span>
        ))}
      </Marquee>
    </section>
  );
}

/* ───────── 2. Scroll-driven demo text ───────── */
function Reel() {
  const ref = useRef(null);
  const x = useSlide(ref, '8%', '-38%', { always: true });
  return (
    <section ref={ref} className="overflow-hidden py-20">
      <Link to="/about" className="group block">
        <motion.div style={{ x }} className="flex w-max whitespace-nowrap text-[clamp(3.4rem,11vw,10rem)] font-semibold leading-none tracking-[-0.05em] transition-opacity group-hover:opacity-60">
          {[0, 1, 2].map((i) => <span key={i} className="pr-[0.4em]">Watch our demo ·</span>)}
        </motion.div>
      </Link>
    </section>
  );
}

/* ───────── 3. Who it's for ───────── */
const AUDIENCE = [
  { icon: School, t: 'Schools', d: 'Mark the whole class at the gate before the first bell. Parents are told within seconds if a child is late or absent.', tags: ['Primary', 'Secondary', 'Parent alerts'] },
  { icon: BookOpen, t: 'Colleges', d: 'Replace paper registers with lecture-wise attendance that is reported straight to each department.', tags: ['Lectures', 'Departments'] },
  { icon: GraduationCap, t: 'Universities', d: 'Handle thousands of students across faculties and campuses, with attendance shortage reports per course.', tags: ['Multi-campus', 'Courses'] },
  { icon: Users, t: 'Academies', d: 'Coaching centers, madrasas and training institutes get batch-wise check-in without extra hardware.', tags: ['Batches', 'Webcam ready'] },
];

function AudienceCard({ u, i }) {
  const ref = useRef(null);
  const bigY = useSlide(ref, '-18%', '18%', { always: true });
  const bigR = useSlide(ref, -12, 12, { always: true });
  const I = u.icon;
  return (
    <Link to="/contact" className="group block">
      <div
        ref={ref}
        className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-[var(--line)] sm:aspect-[4/3]"
        style={{ background: `radial-gradient(70% 70% at ${25 + i * 18}% 20%, #ffffff, var(--card) 75%)` }}
      >
        <motion.div aria-hidden style={{ y: bigY, rotate: bigR }} className="absolute -right-10 top-1/2 -translate-y-1/2 text-[var(--accent)] opacity-[0.09]">
          <I className="h-[340px] w-[340px]" strokeWidth={1} />
        </motion.div>
        <span className={`${iconBadge} absolute left-6 top-6 h-16 w-16 border border-[var(--accent-line)] bg-white shadow-lg transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110`}>
          <I size={30} />
        </span>
        <span className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-[var(--fg)] text-[var(--bg)] opacity-0 transition-opacity group-hover:opacity-100"><ArrowUpRight size={18} /></span>
        <span className="absolute bottom-6 left-6 text-[clamp(2.2rem,5vw,4.2rem)] font-semibold tracking-[-0.045em]">{u.t}</span>
      </div>
      <div className="mt-5 flex items-start justify-between gap-6">
        <p className="max-w-sm text-sm leading-relaxed text-[var(--muted)]">{u.d}</p>
        <div className="flex shrink-0 flex-wrap justify-end gap-2">{u.tags.map((x) => <span key={x} className={tag}>{x}</span>)}</div>
      </div>
    </Link>
  );
}

function Audience() {
  const col = [[0, 2], [1, 3]];
  return (
    <section className="py-24 sm:py-32">
      <div className={wrap}>
        <Reveal className="mb-14 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <Eyebrow icon={School}>Who it's for</Eyebrow>
            <h2 className={`${h2} mt-4 max-w-3xl`}>Made for every kind of educational institution</h2>
          </div>
          <Btn to="/contact" ghost>Book an intro call</Btn>
        </Reveal>
        <div className="grid gap-x-5 gap-y-14 md:grid-cols-2">
          {col.map((ids, c) => (
            <Drift key={c} from={c === 0 ? 0 : 140} to={c === 0 ? 0 : -60} className="flex flex-col gap-14">
              {ids.map((i) => <AudienceCard key={i} u={AUDIENCE[i]} i={i} />)}
            </Drift>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── 4. Pinned 3-step scroll story ───────── */
const STEPS = [
  { icon: UserPlus, t: 'Enroll each student once', d: 'Upload the admission photo. Presence saves an encrypted face vector and never keeps the picture.' },
  { icon: ScanFace, t: 'Students walk in, attendance marks itself', d: 'A camera at the gate or classroom door recognizes each student, checks they are real and logs the time.' },
  { icon: LayoutDashboard, t: 'Teachers and parents stay informed', d: 'Class-wise attendance, late arrivals and absences show up instantly, and guardians get an alert.' },
];

function Pane({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.95 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 grid place-items-center px-4"
    >
      {children}
    </motion.div>
  );
}

function EnrollVisual() {
  const bars = [30, 62, 45, 80, 55, 92, 40, 70, 58, 85, 48, 76, 36, 66, 90, 52, 74, 44, 82, 60];
  return (
    <Pane>
      <div className="w-[min(88%,390px)] rounded-3xl border border-[var(--line)] bg-white p-5 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.35)]">
        <div className="flex items-center gap-4">
          <span className={`${iconBadge} h-16 w-16`}><UserPlus size={28} /></span>
          <div className="flex-1 space-y-2.5">
            <div className="h-3 w-3/4 rounded-full bg-[var(--card)]" />
            <div className="h-3 w-1/2 rounded-full bg-[var(--card)]" />
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {['Class 10-A', 'Roll no. 24', 'Photo added'].map((x) => <span key={x} className={tag}>{x}</span>)}
        </div>
        <div className="mt-5 rounded-2xl bg-[var(--card)] p-4">
          <div className="mb-3 flex items-center justify-between text-xs text-[var(--muted)]"><span>Face vector</span><span>512 dimensions</span></div>
          <div className="flex h-14 items-end gap-1">
            {bars.map((h, k) => (
              <motion.span key={k} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.15 + k * 0.03, duration: 0.4 }} style={{ height: `${h}%`, transformOrigin: 'bottom' }} className="flex-1 rounded-t bg-[var(--accent)]" />
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-600"><CheckCircle2 size={15} /> Student enrolled securely</div>
      </div>
    </Pane>
  );
}

function ScanVisual() {
  return (
    <Pane>
      <div className="relative">
        <div className="relative h-[min(34vh,300px)] w-[min(34vh,300px)] rounded-[28px] border-2 border-[var(--accent-line)] bg-white shadow-[0_30px_80px_-30px_rgba(61,90,254,0.5)] md:h-[min(40vh,360px)] md:w-[min(40vh,360px)]">
          <i className="absolute left-3 top-3 h-4 w-4 rounded-tl-lg border-l-2 border-t-2 border-[var(--accent)]" />
          <i className="absolute right-3 top-3 h-4 w-4 rounded-tr-lg border-r-2 border-t-2 border-[var(--accent)]" />
          <i className="absolute bottom-3 left-3 h-4 w-4 rounded-bl-lg border-b-2 border-l-2 border-[var(--accent)]" />
          <i className="absolute bottom-3 right-3 h-4 w-4 rounded-br-lg border-b-2 border-r-2 border-[var(--accent)]" />
          <div className="grid h-full w-full place-items-center"><ScanFace strokeWidth={1.1} className="h-[55%] w-[55%] text-[var(--accent)]" /></div>
          <span className="pv-sweep absolute inset-x-4 h-0.5 rounded-full bg-[var(--accent)] shadow-[0_0_16px_3px_rgba(61,90,254,0.55)]" />
        </div>
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--fg)] px-4 py-2 text-xs font-medium text-[var(--bg)] shadow-xl">
          <CheckCircle2 size={13} className="mr-1.5 inline -mt-0.5 text-emerald-400" />Aisha Khan · Class 10-A
        </span>
        <span className="absolute -left-6 top-6 hidden items-center gap-2 rounded-2xl border border-[var(--line)] bg-white px-3 py-2 text-xs shadow-lg sm:flex"><ShieldCheck size={16} className="text-emerald-600" />Liveness: real</span>
        <span className="absolute -right-6 top-24 hidden items-center gap-2 rounded-2xl border border-[var(--line)] bg-white px-3 py-2 text-xs shadow-lg sm:flex"><Zap size={16} className="text-[var(--accent)]" />0.12s</span>
      </div>
    </Pane>
  );
}

function DashVisual() {
  const stats = [
    [UserCheck, '247', 'Present', 'text-emerald-600 bg-emerald-50'],
    [Clock, '6', 'Late', 'text-amber-600 bg-amber-50'],
    [UserX, '12', 'Absent', 'text-rose-600 bg-rose-50'],
  ];
  return (
    <Pane>
      <div className="w-[min(90%,430px)] rounded-3xl border border-[var(--line)] bg-white p-5 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.35)]">
        <div className="mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-semibold"><CalendarCheck size={16} className="text-[var(--accent)]" />Today · Class 10-A</span>
          <span className="text-xs text-[var(--muted)]">08:30 AM</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {stats.map(([I, n, l, c]) => (
            <div key={l} className="rounded-2xl bg-[var(--card)] p-3">
              <span className={`grid h-8 w-8 place-items-center rounded-xl ${c}`}><I size={15} /></span>
              <div className="mt-2 text-xl font-semibold tracking-tight">{n}</div>
              <div className="text-[11px] text-[var(--muted)]">{l}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex h-16 items-end gap-1.5">
          {[55, 70, 62, 85, 78, 92, 68, 88].map((h, k) => (
            <motion.span key={k} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.15 + k * 0.05, duration: 0.45 }} style={{ height: `${h}%`, transformOrigin: 'bottom' }} className="flex-1 rounded-t-md bg-[var(--accent)] opacity-80" />
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[var(--accent-line)] bg-[var(--accent-soft)] p-3 text-xs">
          <Smartphone size={18} className="shrink-0 text-[var(--accent)]" />
          <span><b className="font-semibold">12 parent alerts sent</b><br /><span className="text-[var(--muted)]">Guardians notified of absences</span></span>
        </div>
      </div>
    </Pane>
  );
}

const VISUALS = [EnrollVisual, ScanVisual, DashVisual];

function SegBar({ p, k }) {
  const scaleX = useTransform(p, [k / 3, (k + 1) / 3], [0, 1]);
  return (
    <span className="h-1 flex-1 overflow-hidden bg-black/10">
      <motion.span style={{ scaleX, transformOrigin: 'left' }} className="block h-full w-full rounded-full bg-[var(--accent)]" />
    </span>
  );
}

function StepsStory() {
  const ref = useRef(null);
  const [i, setI] = useState(0);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  useMotionValueEvent(p, 'change', (v) => setI(Math.max(0, Math.min(2, Math.floor(v * 3)))));
  const numY = useTransform(p, [0, 1], ['25%', '-25%']);
  const glowX = useTransform(p, [0, 1], ['-25%', '25%']);
  const Visual = VISUALS[i];

  return (
    <section ref={ref} className="relative h-[320vh] border-t border-[var(--line)]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div aria-hidden style={{ y: numY }} className="pointer-events-none absolute -left-4 top-1/2 -translate-y-1/2 select-none text-[clamp(14rem,34vw,30rem)] font-semibold leading-none tracking-[-0.08em] text-black/[0.04]">
          0{i + 1}
        </motion.div>

        <div className={`${wrap} relative grid items-center gap-8 pt-16 md:grid-cols-[1fr_1.05fr] md:gap-16 md:pt-0`}>
          {/* visual */}
          <div className="relative order-1 md:order-2">
            <div className="relative h-[42vh] overflow-hidden rounded-[2rem] border border-[var(--line)] bg-gradient-to-br from-white to-[var(--card)] md:h-[68vh]">
              <motion.div aria-hidden style={{ x: glowX }} className="absolute -top-20 left-1/2 h-72 w-72 rounded-full opacity-70 blur-3xl" >
                <div className="h-full w-full rounded-full" style={{ background: 'radial-gradient(circle, rgba(61,90,254,.28), transparent 70%)' }} />
              </motion.div>
              <div aria-hidden className="absolute inset-0 opacity-60" style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,.13) 1px, transparent 1.3px)', backgroundSize: '22px 22px' }} />
              <span className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/90 px-3.5 py-1.5 text-xs font-medium">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]" />Step {i + 1} of 3
              </span>
              <AnimatePresence mode="wait"><Visual key={i} /></AnimatePresence>
              <div className="absolute inset-x-6 bottom-5 z-10 flex gap-2">{[0, 1, 2].map((k) => <SegBar key={k} p={p} k={k} />)}</div>
            </div>
          </div>

          {/* steps */}
          <div className="order-2 md:order-1">
            <Eyebrow icon={Zap}>How it works</Eyebrow>
            <h2 className={`${h2} mb-8 mt-4`}>From roll call to done in 3 steps</h2>
            <ol className="relative space-y-6 pl-14">
              <span aria-hidden className="absolute left-[19px] top-2 h-[calc(100%-1rem)] w-px bg-[var(--line)]" />
              <motion.span aria-hidden style={{ scaleY: p, transformOrigin: 'top' }} className="absolute left-[19px] top-2 h-[calc(100%-1rem)] w-px bg-[var(--accent)]" />
              {STEPS.map((s, k) => {
                const I = s.icon;
                const on = k === i;
                const done = k < i;
                return (
                  <li key={s.t} className={`relative transition-opacity duration-500 ${on ? 'opacity-100' : 'opacity-35 max-md:hidden'}`}>
                    <span className={`absolute -left-14 top-0 grid h-10 w-10 place-items-center rounded-full border transition-all duration-500 ${on || done ? 'border-[var(--accent)] bg-[var(--accent)] text-white shadow-[0_10px_24px_-8px_rgba(61,90,254,0.7)]' : 'border-[var(--line)] bg-white text-[var(--muted)]'} ${on ? 'scale-110' : ''}`}>
                      {done ? <Check size={17} /> : <I size={17} />}
                    </span>
                    <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">{s.t}</h3>
                    <motion.div initial={false} animate={{ height: on ? 'auto' : 0, opacity: on ? 1 : 0 }} transition={{ duration: 0.4 }} className="overflow-hidden">
                      <p className="max-w-md pt-2 text-sm leading-relaxed text-[var(--muted)]">{s.d}</p>
                    </motion.div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── 5. Features ───────── */
const FEATURES = [
  { icon: Zap, t: 'Instant recognition', d: 'Whole classes pass through the gate in seconds, with no queue at the morning bell.', tags: ['0.12s search', '99.8% match'] },
  { icon: ShieldCheck, t: 'Proxy-proof attendance', d: 'Liveness checks reject photos and phone screens, so no student can mark a friend present.', tags: ['Liveness', 'Anti-spoofing'] },
  { icon: LayoutDashboard, t: 'Live class dashboard', d: 'Teachers and coordinators see arrivals as they happen, by class, section or department.', tags: ['Real time', 'Class-wise'] },
  { icon: FileBarChart, t: 'Reports for administration', d: 'Daily, monthly and shortage-of-attendance reports ready for principals and registrars.', tags: ['PDF', 'Excel'] },
  { icon: Lock, t: 'Student data privacy', d: 'Faces are stored as encrypted, non-reversible vectors, never as photos.', tags: ['Encryption', 'Consent controls'] },
];

function FeatureRow({ f, i, active, setActive }) {
  const ref = useRef(null);
  const x = useSlide(ref, i % 2 ? -70 : 70, i % 2 ? 70 : -70);
  const I = f.icon;
  return (
    <li ref={ref} onMouseEnter={() => setActive(i)} className="border-t border-[var(--line)] last:border-b">
      <div className={`grid gap-4 py-8 transition-opacity duration-300 md:grid-cols-[96px_1.2fr_1fr] md:items-center ${active === i ? 'opacity-100' : 'opacity-40'}`}>
        <span className={`${iconBadge} h-14 w-14 transition-transform duration-300 ${active === i ? 'scale-110 bg-[var(--accent)] text-white' : ''}`}><I size={24} /></span>
        <motion.h3 style={{ x }} className="text-2xl font-semibold tracking-[-0.03em] sm:text-4xl">{f.t}</motion.h3>
        <div>
          <p className="text-sm leading-relaxed text-[var(--muted)]">{f.d}</p>
          <div className="mt-4 flex flex-wrap gap-2">{f.tags.map((t) => <span key={t} className={tag}>{t}</span>)}</div>
        </div>
      </div>
    </li>
  );
}

function Features() {
  const [active, setActive] = useState(0);
  return (
    <section id="features" className="border-t border-[var(--line)] py-24 sm:py-32">
      <div className={wrap}>
        <Reveal className="mb-14">
          <Eyebrow icon={ShieldCheck}>What you get</Eyebrow>
          <h2 className={`${h2} mt-4 max-w-3xl`}>Everything attendance needs. Nothing it doesn't.</h2>
        </Reveal>
        <ul onMouseLeave={() => setActive(0)}>{FEATURES.map((f, i) => <FeatureRow key={f.t} f={f} i={i} active={active} setActive={setActive} />)}</ul>
      </div>
    </section>
  );
}

/* ───────── 6. Pricing ───────── */
const PLANS = [
  { icon: School, n: 'Classroom', d: 'For a small school, a single wing or a coaching academy.', p: '$49', u: '/ month', items: ['1 camera', 'Up to 300 students', 'Live dashboard', 'Email support'] },
  { icon: Library, n: 'Campus', d: 'For schools and colleges that need more gates, reports and parent alerts.', p: '$149', u: '/ month', items: ['Up to 8 cameras', 'Up to 3,000 students', 'Parent alerts', 'Attendance shortage reports', 'Priority support'], featured: true },
  { icon: GraduationCap, n: 'University', d: 'For universities and school groups running multiple campuses.', p: 'Custom', u: '', items: ['Unlimited cameras', 'Multi-campus control', 'SIS / LMS integration', 'SSO and audit logs', 'Dedicated manager'] },
];
const PLAN_SPEED = [[40, -20], [0, 0], [60, -30]];

function Pricing() {
  return (
    <section id="pricing" className="border-t border-[var(--line)] py-24 sm:py-32">
      <div className={wrap}>
        <Reveal className="mb-14">
          <Eyebrow icon={Library}>Pricing</Eyebrow>
          <h2 className={`${h2} mt-4 max-w-3xl`}>Choose a plan that fits your institution</h2>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {PLANS.map((p, i) => {
            const I = p.icon;
            return (
              <Drift key={p.n} from={PLAN_SPEED[i][0]} to={PLAN_SPEED[i][1]} className="h-full">
                <div className={`flex h-full flex-col rounded-[2rem] border p-8 transition-transform duration-300 hover:-translate-y-1.5 ${p.featured ? 'border-transparent bg-[var(--fg)] text-[var(--bg)] shadow-[0_40px_80px_-30px_rgba(61,90,254,0.55)]' : 'border-[var(--line)] bg-white/70'}`}>
                  <span className={`grid h-12 w-12 place-items-center rounded-2xl ${p.featured ? 'bg-[var(--accent)] text-white' : 'bg-[var(--accent-soft)] text-[var(--accent)]'}`}><I size={22} /></span>
                  <h3 className="mt-5 text-xl font-semibold">{p.n}</h3>
                  <p className={`mt-2 text-sm leading-relaxed ${p.featured ? 'text-[var(--bg-60)]' : 'text-[var(--muted)]'}`}>{p.d}</p>
                  <ul className="my-8 space-y-3 text-sm">
                    {p.items.map((x) => <li key={x} className="flex items-center gap-3"><Check size={15} className={p.featured ? 'text-[var(--bg)]' : 'text-[var(--accent)]'} />{x}</li>)}
                  </ul>
                  <div className="mt-auto">
                    <div className="mb-6 flex items-baseline gap-1">
                      <span className="text-5xl font-semibold tracking-[-0.04em]">{p.p}</span>
                      <span className={`text-sm ${p.featured ? 'text-[var(--bg-60)]' : 'text-[var(--muted)]'}`}>{p.u}</span>
                    </div>
                    <Link to="/contact" className={`flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-medium transition-transform hover:scale-[1.02] ${p.featured ? 'bg-[var(--bg)] text-[var(--fg)]' : 'bg-[var(--btn-bg)] text-[var(--btn-fg)]'}`}>
                      Inquire for {p.n} <ArrowUpRight size={15} />
                    </Link>
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

/* ───────── 7. Testimonials + stats ───────── */
const VOICES = [
  { q: 'Morning roll call went from fifteen minutes to zero. Our teachers got that time back for teaching.', n: 'Aisha Khan', r: 'Principal, Greenfield School' },
  { q: 'Attendance shortage reports used to take our staff days. Now they are one click for every department.', n: 'Usman Tariq', r: 'Registrar, Northgate University' },
  { q: 'Parents love the instant alerts, and we used the webcams we already had. No new hardware needed.', n: 'Hira Malik', r: 'Head of Academics, Summit College' },
];
const STATS = [
  { icon: School, to: 250, s: '+', l: 'Institutions live' },
  { icon: ScanFace, to: 99, s: '%', l: 'Recognition accuracy' },
  { icon: Clock, to: 15, s: ' min', l: 'Saved per class each morning' },
];

function Voices() {
  return (
    <section className="overflow-hidden border-t border-[var(--line)] py-24 sm:py-32">
      <div className={wrap}>
        <Reveal className="mb-14">
          <Eyebrow icon={Users}>Voices from campus</Eyebrow>
          <h2 className={`${h2} mt-4 max-w-3xl`}>Trusted by principals, registrars and teachers</h2>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {VOICES.map((v, i) => (
            <Drift key={v.n} from={[0, 80, 30][i]} to={[-40, -40, -80][i]} className="h-full">
              <figure className="flex h-full flex-col justify-between rounded-[2rem] border border-[var(--line)] bg-white/70 p-8 transition-transform duration-300 hover:-translate-y-1.5">
                <blockquote className="text-lg font-medium leading-relaxed tracking-tight">“{v.q}”</blockquote>
                <figcaption className="mt-10 flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-[var(--accent)] text-sm font-semibold text-white">{v.n.split(' ').map((w) => w[0]).join('')}</span>
                  <span className="text-sm font-medium">{v.n}<span className="block font-normal text-[var(--muted)]">{v.r}</span></span>
                </figcaption>
              </figure>
            </Drift>
          ))}
        </div>

        <div className="mt-28 grid gap-10 border-t border-[var(--line)] pt-14 sm:grid-cols-3">
          {STATS.map((s, i) => {
            const I = s.icon;
            return (
              <Drift key={s.l} from={[30, 0, -30][i]} to={[-30, 0, 30][i]}>
                <span className={`${iconBadge} mb-5 h-12 w-12`}><I size={22} /></span>
                <div className="text-[clamp(3.4rem,8vw,7rem)] font-semibold leading-none tracking-[-0.05em]"><Count to={s.to} suffix={s.s} /></div>
                <div className="mt-3 text-sm text-[var(--muted)]">{s.l}</div>
              </Drift>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ───────── 8. FAQ ───────── */
const FAQS = [
  ['What does Presence do?', 'Presence marks student attendance automatically by recognizing faces from a standard camera, with liveness checks that block photos and screens.'],
  ['How long does setup take?', 'Most institutions are live within a day: connect a camera, import students from a spreadsheet, and enroll faces from admission photos.'],
  ['Is student data safe?', 'Faces are converted to encrypted, non-reversible vectors, and original photos are not needed after enrollment. You control who can see attendance data.'],
  ['Do we need parent consent?', 'We provide a consent form template and per-student opt-out controls so your institution can follow its own policies and local rules.'],
  ['Which cameras are supported?', 'Built-in laptop webcams, USB cameras and RTSP streams from standard IP cameras.'],
  ['Can it connect to our student system?', 'Campus and University plans can import students from CSV and connect to your SIS or LMS.'],
];

function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className="border-t border-[var(--line)] py-24 sm:py-32">
      <div className={`${wrap} grid gap-12 md:grid-cols-[1fr_1.4fr]`}>
        <div className="md:sticky md:top-32 md:self-start">
          <Eyebrow icon={BookOpen}>FAQ</Eyebrow>
          <h2 className={`${h2} mt-4`}>Questions? We are here to help</h2>
        </div>
        <div>
          {FAQS.map(([q, a], i) => {
            const isOpen = open === i;
            return (
              <div key={q} className="border-t border-[var(--line)] last:border-b">
                <button onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-6 py-6 text-left">
                  <span className="text-base font-medium tracking-tight sm:text-xl">{q}</span>
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors ${isOpen ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : 'border-[var(--line)]'}`}>{isOpen ? <Minus size={15} /> : <Plus size={15} />}</span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                      <p className="max-w-xl pb-6 text-sm leading-relaxed text-[var(--muted)]">{a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ───────── 9. CTA ───────── */
function CTA() {
  const ref = useRef(null);
  const ringA = useSlide(ref, 0.6, 1.5, { always: true, rest: 1 });
  const ringB = useSlide(ref, 0.4, 1.15, { always: true, rest: 1 });
  const textY = useSlide(ref, 60, -60, { always: true });
  const capY = useSlide(ref, -80, 80, { always: true });
  return (
    <section ref={ref} className="relative isolate overflow-hidden py-32 sm:py-48">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 grid place-items-center">
        <motion.div style={{ scale: ringA }} className="absolute h-[760px] w-[760px] rounded-full border border-[var(--line)]" />
        <motion.div style={{ scale: ringB }} className="absolute h-[520px] w-[520px] rounded-full border border-[var(--accent-line)]" />
        <div className="h-[420px] w-[420px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(61,90,254,.16), transparent 70%)' }} />
        <motion.div style={{ y: capY }} className="absolute left-[10%] top-[18%] text-[var(--accent)] opacity-25"><GraduationCap size={72} strokeWidth={1.2} /></motion.div>
        <motion.div style={{ y: textY }} className="absolute bottom-[16%] right-[10%] text-[var(--accent)] opacity-25"><BookOpen size={64} strokeWidth={1.2} /></motion.div>
      </div>
      <motion.div style={{ y: textY }} className={`${wrap} text-center`}>
        <Eyebrow icon={CheckCircle2}>Get started</Eyebrow>
        <h2 className="mx-auto mt-5 max-w-4xl text-[clamp(2.2rem,6vw,5.5rem)] font-semibold leading-[1.02] tracking-[-0.04em]">
          Ready to end morning roll call for good?
        </h2>
        <div className="mt-10"><Btn to="/contact">Book a demo</Btn></div>
      </motion.div>
    </section>
  );
}

/* ───────── Footer ───────── */
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

/* ───────── Page ───────── */
export default function HomePage() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const go = () => setReady(true);
    const idle = typeof window.requestIdleCallback === 'function';
    const id = idle ? window.requestIdleCallback(go, { timeout: 1200 }) : window.setTimeout(go, 0);
    return () => (idle && window.cancelIdleCallback ? window.cancelIdleCallback(id) : window.clearTimeout(id));
  }, []);

  return (
    <div style={THEME} className="min-h-screen bg-[var(--bg)] text-[var(--fg)] antialiased [overflow-x:clip]">
      <style>{`
        @keyframes mq { to { transform: translateX(-50%); } }
        .mq { animation: mq 30s linear infinite; }
        @keyframes pvSweep { 0%{top:6%;opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{top:92%;opacity:0} }
        .pv-sweep { animation: pvSweep 3s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .mq, .pv-sweep { animation: none; } }
      `}</style>
      <Navbar />
      <Hero />
      <Institutions />
      <Reel />
      {ready && (<><Audience /><StepsStory /><Features /><Pricing /><Voices /><FAQ /><CTA /></>)}
      <Footer />
    </div>
  );
}