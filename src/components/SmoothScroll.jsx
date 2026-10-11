import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';

export default function SmoothScroll() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // respect "reduce motion" system setting
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      lerp: 0.075,          // lower = slower and floatier (0.05–0.12 is the useful range)
      wheelMultiplier: 0.9, // lower = each wheel notch travels less
      smoothWheel: true,
    });
    window.__lenis = lenis; // so other code can call scrollTo

    let raf;
    const loop = (t) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  // new page: jump to top, or glide to #section for links like /#pricing
  useEffect(() => {
    const lenis = window.__lenis;
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        setTimeout(() => (lenis ? lenis.scrollTo(el, { offset: -90, duration: 1.6 }) : el.scrollIntoView({ behavior: 'smooth' })), 100);
        return;
      }
    }
    lenis ? lenis.scrollTo(0, { immediate: true }) : window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}