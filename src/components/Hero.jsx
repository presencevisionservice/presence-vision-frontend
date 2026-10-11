import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Copy, Check, CheckCircle2, Zap, ShieldCheck, ScanFace, GraduationCap, BookOpen, Bell, Users } from 'lucide-react';
import { useSlide } from '../pages/parallax';

const EMAIL = 'presencevisionservice@gmail.com'; // change to your real address
const STUDENTS = [
  ['Aisha Khan', 'Class 10-A'],
  ['Usman Tariq', 'Class 9-C'],
  ['Hira Malik', 'BSCS · Sem 3'],
  ['Sana Iqbal', 'Class 8-B'],
];

function Clock() {
  const [t, setT] = useState('--:--');
  useEffect(() => {
    const tick = () => setT(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);
  const off = -new Date().getTimezoneOffset() / 60;
  return (
    <div className="text-sm text-[var(--muted)]">
      <div>GMT{off >= 0 ? '+' : ''}{off}</div>
      <div className="text-2xl tabular-nums text-[var(--fg)]">{t}</div>
    </div>
  );
}

function FloatTile({ y, icon: I, className }) {
  return (
    <motion.div
      style={{ y, background: 'var(--chip)' }}
      className={`absolute grid h-12 w-12 place-items-center rounded-2xl border border-[var(--line)] text-[var(--accent)] shadow-[0_18px_40px_-12px_rgba(61,90,254,0.35)] backdrop-blur-md md:h-16 md:w-16 ${className}`}
    >
      <I className="h-5 w-5 md:h-7 md:w-7" />
    </motion.div>
  );
}

function Chip({ y, className, icon: I, title, sub }) {
  return (
    <motion.div
      style={{ y, background: 'var(--chip)' }}
      className={`absolute hidden items-center gap-3 rounded-2xl border border-[var(--line)] px-4 py-3 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.2)] backdrop-blur-md md:flex ${className}`}
    >
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--accent)] text-white"><I size={18} /></span>
      <div className="text-xs"><b className="block font-semibold text-[var(--fg)]">{title}</b><span className="text-[var(--muted)]">{sub}</span></div>
    </motion.div>
  );
}

export default function Hero() {
  const heroRef = useRef(null);
  const frameRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [n, setN] = useState(0);

  const line1 = useSlide(heroRef, '0vw', '-12vw', { offset: ['start start', 'end start'], always: true });
  const line2 = useSlide(heroRef, '0vw', '12vw', { offset: ['start start', 'end start'], always: true });
  const metaY = useSlide(heroRef, 0, -60, { offset: ['start start', 'end start'] });
  const blobY = useSlide(heroRef, 0, 160, { offset: ['start start', 'end start'], always: true });

  const { scrollYProgress: fp } = useScroll({ target: frameRef, offset: ['start end', 'center center'] });
  const frameScale = useTransform(fp, [0, 1], [0.86, 1]);
  const frameRadius = useTransform(fp, [0, 1], [64, 32]);
  const innerY = useSlide(frameRef, '-6%', '6%', { always: true });
  const t1 = useSlide(frameRef, 70, -50);
  const t2 = useSlide(frameRef, 130, -90);
  const t3 = useSlide(frameRef, 40, -110);
  const t4 = useSlide(frameRef, 160, -60);
  const chipA = useSlide(frameRef, 150, -60);
  const chipB = useSlide(frameRef, 230, -120);
  const chipC = useSlide(frameRef, 90, -170);

  useEffect(() => {
    const id = setInterval(() => setN((v) => v + 1), 2400);
    return () => clearInterval(id);
  }, []);
  const [name, cls] = STUDENTS[n % STUDENTS.length];

  const copy = async () => {
    try { await navigator.clipboard.writeText(EMAIL); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };

  return (
    <section ref={heroRef} className="relative overflow-hidden bg-[var(--bg)] pb-24 pt-32 sm:pt-40">
      <style>{`
        @keyframes pvSweep { 0%{top:6%;opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{top:92%;opacity:0} }
        @keyframes pvRing { 0%{transform:scale(.6);opacity:.7} 100%{transform:scale(1.25);opacity:0} }
        @keyframes pvPop { from{opacity:0;transform:translate(-50%,6px) scale(.92)} to{opacity:1;transform:translate(-50%,0) scale(1)} }
        .pv-sweep{animation:pvSweep 3s ease-in-out infinite}
        .pv-ring{animation:pvRing 4s ease-out infinite}
        .pv-pop{animation:pvPop .35s ease-out}
        @media (prefers-reduced-motion: reduce){.pv-sweep,.pv-ring,.pv-pop{animation:none}}
      `}</style>

      {/* soft color wash */}
      <motion.div aria-hidden style={{ y: blobY }} className="pointer-events-none absolute -right-40 -top-24 h-[640px] w-[640px] rounded-full opacity-70 blur-3xl" >
        <div className="h-full w-full rounded-full" style={{ background: 'radial-gradient(circle, rgba(61,90,254,.18), transparent 65%)' }} />
      </motion.div>
      <motion.div aria-hidden style={{ y: blobY }} className="pointer-events-none absolute -left-52 top-64 h-[520px] w-[520px] rounded-full opacity-60 blur-3xl">
        <div className="h-full w-full rounded-full" style={{ background: 'radial-gradient(circle, rgba(16,185,129,.14), transparent 65%)' }} />
      </motion.div>

      <div className="relative mx-auto w-full max-w-[1400px] px-5 sm:px-8">
        <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/70 px-4 py-1.5 text-xs font-medium text-[var(--muted)] backdrop-blur">
          <GraduationCap size={14} className="text-[var(--accent)]" /> Smart attendance for schools, colleges and universities
        </span>

        <h1 className="text-[clamp(2.6rem,8.6vw,8.5rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-[var(--fg)]">
          <motion.span initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} style={{ x: line1 }} className="block">
            Attendance that
          </motion.span>
          <motion.span initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }} style={{ x: line2 }} className="block text-right text-[var(--accent)]">
            takes itself.
          </motion.span>
        </h1>

        <motion.div style={{ y: metaY }} className="mt-12 grid gap-8 border-t border-[var(--line)] pt-6 sm:grid-cols-3 sm:items-end">
          <p className="max-w-xs text-sm leading-relaxed text-[var(--muted)]">
            Students walk in, get recognized and get marked. No roll call, no cards, no proxy attendance.
          </p>
          <div className="sm:justify-self-center"><Clock /></div>
          <button onClick={copy} className="group flex items-center gap-3 text-left sm:justify-self-end" aria-label="Copy email address">
            <span className="text-sm leading-snug text-[var(--muted)]">presencevisionservice<span className="text-[var(--fg)]">@</span>gmail.com</span>
            <span className="grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] text-[var(--fg)] transition-colors group-hover:bg-[var(--fg)] group-hover:text-[var(--bg)]">
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </span>
          </button>
        </motion.div>
      </div>

      {/* Icon scene */}
      <div className="relative mx-auto mt-16 w-full max-w-[1400px] px-5 sm:px-8">
        <motion.div
          ref={frameRef}
          style={{
            scale: frameScale,
            borderRadius: frameRadius,
            transformOrigin: '50% 0%',
            background: 'radial-gradient(75% 100% at 50% 35%, #ffffff, var(--card))',
          }}
          className="relative aspect-[4/3] overflow-hidden border border-[var(--line)] sm:aspect-[16/8]"
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage: 'radial-gradient(rgba(0,0,0,.16) 1px, transparent 1.3px)',
              backgroundSize: '24px 24px',
              maskImage: 'radial-gradient(60% 80% at 50% 50%, #000, transparent 80%)',
              WebkitMaskImage: 'radial-gradient(60% 80% at 50% 50%, #000, transparent 80%)',
            }}
          />

          <motion.div style={{ y: innerY }} className="absolute inset-0 grid place-items-center">
            {[0, 1.3, 2.6].map((d) => (
              <span key={d} aria-hidden className="pv-ring absolute aspect-square h-[78%] rounded-full border border-[var(--accent-line)]" style={{ animationDelay: `${d}s` }} />
            ))}

            <div className="relative aspect-[4/5] h-[66%] rounded-[28px] border-2 border-[var(--accent-line)] bg-white/80 shadow-[0_30px_80px_-30px_rgba(61,90,254,0.5)] backdrop-blur">
              <i className="absolute left-3 top-3 h-4 w-4 rounded-tl-lg border-l-2 border-t-2 border-[var(--accent)]" />
              <i className="absolute right-3 top-3 h-4 w-4 rounded-tr-lg border-r-2 border-t-2 border-[var(--accent)]" />
              <i className="absolute bottom-3 left-3 h-4 w-4 rounded-bl-lg border-b-2 border-l-2 border-[var(--accent)]" />
              <i className="absolute bottom-3 right-3 h-4 w-4 rounded-br-lg border-b-2 border-r-2 border-[var(--accent)]" />
              <div className="grid h-full w-full place-items-center">
                <ScanFace strokeWidth={1.1} className="h-[52%] w-[52%] text-[var(--accent)]" />
              </div>
              <span className="pv-sweep absolute inset-x-4 h-0.5 rounded-full bg-[var(--accent)] shadow-[0_0_16px_3px_rgba(61,90,254,0.55)]" />
              <span
                key={name}
                className="pv-pop absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--fg)] px-4 py-2 text-xs font-medium text-[var(--bg)] shadow-xl"
              >
                <CheckCircle2 size={13} className="mr-1.5 inline -mt-0.5 text-emerald-400" />{name} · {cls}
              </span>
            </div>
          </motion.div>

          <FloatTile y={t1} icon={GraduationCap} className="left-[9%] top-[16%]" />
          <FloatTile y={t2} icon={BookOpen} className="right-[10%] top-[20%]" />
          <FloatTile y={t3} icon={Bell} className="left-[16%] bottom-[14%]" />
          <FloatTile y={t4} icon={Users} className="right-[15%] bottom-[16%]" />

          <span className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/90 px-3.5 py-1.5 text-xs font-medium text-[var(--fg)]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />Main Gate Camera 01 · Live
          </span>
        </motion.div>

        <Chip y={chipA} icon={CheckCircle2} title={name} sub={`Marked present · 08:02 · ${cls}`} className="-left-1 top-[14%] lg:-left-6" />
        <Chip y={chipB} icon={Zap} title="0.12s recognition" sub="99.8% match rate" className="-right-1 top-[42%] lg:-right-6" />
        <Chip y={chipC} icon={ShieldCheck} title="Liveness: real" sub="Photos and screens rejected" className="bottom-8 left-[10%]" />
      </div>
    </section>
  );
}