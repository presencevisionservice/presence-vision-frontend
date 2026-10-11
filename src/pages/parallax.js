import { useEffect, useState } from 'react';
import { useScroll, useTransform, useReducedMotion } from 'framer-motion';

/** true on >=768px and when the user hasn't asked for reduced motion */
export function useParallaxOK() {
  const reduced = useReducedMotion();
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const m = window.matchMedia('(min-width: 768px)');
    const f = () => setWide(m.matches);
    f();
    m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
  }, []);
  return wide && !reduced;
}

/** Maps an element's scroll progress to a value range. */
export function useSlide(ref, from, to, { offset = ['start end', 'end start'], always = false, rest } = {}) {
  const reduced = useReducedMotion();
  const ok = useParallaxOK();
  const { scrollYProgress } = useScroll({ target: ref, offset });
  const active = always ? !reduced : ok;
  const r = rest !== undefined ? rest : typeof to === 'string' ? (to.endsWith('vw') ? '0vw' : '0%') : 0;
  return useTransform(scrollYProgress, [0, 1], active ? [from, to] : [r, r]);
}