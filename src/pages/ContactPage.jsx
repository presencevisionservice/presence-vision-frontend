import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Building, ShieldCheck, Clock, MessageSquare, Send, CheckCircle2, 
  ArrowUpRight, Mail, Phone, MapPin, Sparkles, AlertCircle 
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

/* ───────── Channel Options ───────── */
const CONTACT_CHANNELS = [
  {
    icon: Building,
    title: "Institutional Deployments",
    desc: "Custom multi-node deployment plans for universities, colleges, and enterprise campuses[cite: 7].",
    action: "sales@presence.ai"
  },
  {
    icon: ShieldCheck,
    title: "Security & Compliance Audits",
    desc: "Inquire about our biometric data encryption, GDPR standards, and local processing pipelines[cite: 7].",
    action: "security@presence.ai"
  },
  {
    icon: Clock,
    title: "24/7 Technical Support",
    desc: "Dedicated response engineers for camera integration, RTSP streaming, and vector index sync[cite: 7].",
    action: "support@presence.ai"
  }
];

/* ───────── Hero Header Component ───────── */
function ContactHero() {
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
        <Eyebrow icon={MessageSquare}>Enterprise Integration Desk</Eyebrow>
        
        <h1 className="mt-6 text-[clamp(2.6rem,7vw,7rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-[var(--fg)]">
          <motion.span initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} style={{ x: line1 }} className="block">
            Get in touch with our
          </motion.span>
          <motion.span initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }} style={{ x: line2 }} className="block text-[var(--accent)]">
            biometric AI team.
          </motion.span>
        </h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
          Have questions about integrating Presence with your institutional database or camera hardware? Send us a message below[cite: 7].
        </motion.p>
      </div>
    </section>
  );
}

/* ───────── Main Contact Section (Channels & Form) ───────── */
function ContactMain() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', institution: '' });
  const [status, setStatus] = useState('idle');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStatus('sent');
      setForm({ name: '', email: '', subject: '', message: '', institution: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="py-12 pb-24 sm:pb-32">
      <div className={wrap}>
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
          
          {/* Left Info Column */}
          <div className="lg:col-span-5 space-y-5">
            {CONTACT_CHANNELS.map(({ icon: Icon, title, desc, action }, idx) => (
              <Drift key={title} from={idx % 2 === 0 ? 15 : -15} to={idx % 2 === 0 ? -15 : 15}>
                <div className="group rounded-[2rem] border border-[var(--line)] bg-white/70 p-6 backdrop-blur-xl transition-all duration-300 hover:border-[var(--accent-line)] hover:shadow-lg">
                  <div className="flex items-center gap-4">
                    <span className={`${iconBadge} h-12 w-12 transition-transform group-hover:scale-110 group-hover:bg-[var(--accent)] group-hover:text-white`}>
                      <Icon size={22} />
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-[var(--fg)]">{title}</h3>
                      <div className="text-xs font-mono font-medium text-[var(--accent)]">{action}</div>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">{desc}</p>
                </div>
              </Drift>
            ))}

            <Reveal>
              <div className="rounded-[2rem] border border-[var(--accent-line)] bg-[var(--accent-soft)] p-6 flex items-center gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <ShieldCheck size={24} />
                </span>
                <div>
                  <div className="text-xs font-semibold text-[var(--fg)]">Enterprise SLA Guaranteed</div>
                  <div className="text-[11px] text-[var(--muted)] mt-0.5">Under 2-hour turnaround for institutional inquiry setups[cite: 7].</div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right Contact Form Column */}
          <div className="lg:col-span-7">
            <Reveal>
              <form
                onSubmit={handleSubmit}
                className="rounded-[2.5rem] border border-[var(--line)] bg-white p-8 sm:p-10 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.12)] space-y-6"
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--fg)] uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Dr. Tariq Mahmood"
                      required
                      className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3.5 text-sm text-[var(--fg)] placeholder-[var(--muted)] outline-none transition focus:border-[var(--accent)] focus:bg-white focus:ring-2 focus:ring-[var(--accent-soft)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--fg)] uppercase tracking-wider">Institutional Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="tariq@university.edu"
                      required
                      className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3.5 text-sm text-[var(--fg)] placeholder-[var(--muted)] outline-none transition focus:border-[var(--accent)] focus:bg-white focus:ring-2 focus:ring-[var(--accent-soft)]"
                    />
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--fg)] uppercase tracking-wider">Institution / Organization</label>
                    <input
                      type="text"
                      name="institution"
                      value={form.institution}
                      onChange={handleChange}
                      placeholder="Faculty of Computer Science"
                      className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3.5 text-sm text-[var(--fg)] placeholder-[var(--muted)] outline-none transition focus:border-[var(--accent)] focus:bg-white focus:ring-2 focus:ring-[var(--accent-soft)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--fg)] uppercase tracking-wider">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="Webcam Integration Request"
                      required
                      className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3.5 text-sm text-[var(--fg)] placeholder-[var(--muted)] outline-none transition focus:border-[var(--accent)] focus:bg-white focus:ring-2 focus:ring-[var(--accent-soft)]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[var(--fg)] uppercase tracking-wider">Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Provide details about your student batch size, camera setup, or preferred timeline..."
                    required
                    className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3.5 text-sm text-[var(--fg)] placeholder-[var(--muted)] outline-none transition focus:border-[var(--accent)] focus:bg-white focus:ring-2 focus:ring-[var(--accent-soft)] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-[var(--btn-bg)] px-8 py-4 text-sm font-medium text-[var(--btn-fg)] transition-transform hover:scale-[1.02] disabled:opacity-60"
                >
                  {status === 'sending' ? (
                    <span className="animate-pulse">Transmitting inquiry...</span>
                  ) : (
                    <>
                      <span>Submit Integration Inquiry</span>
                      <Send size={15} />
                    </>
                  )}
                </button>

                {status === 'sent' && (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-medium text-center flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>Inquiry received! Our team will get back to you within 2 hours[cite: 7].</span>
                  </div>
                )}
                {status === 'error' && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-medium text-center flex items-center justify-center gap-2">
                    <AlertCircle size={16} />
                    <span>An error occurred sending your message. Please retry[cite: 7].</span>
                  </div>
                )}
              </form>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ───────── Footer Component (Matching HomePage & AboutPage) ───────── */
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

/* ───────── Main Contact Page Export ───────── */
export default function ContactPage() {
  return (
    <div style={THEME} className="min-h-screen bg-[var(--bg)] text-[var(--fg)] antialiased [overflow-x:clip]">
      <Navbar />
      <ContactHero />
      <ContactMain />
      <Footer />
    </div>
  );
}