import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.(QUERY).matches);
}

/** نسخة تفاعلية: تتحدث إن غيّر الزائر الإعداد أثناء التصفح. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion);
  useEffect(() => {
    const mq = window.matchMedia?.(QUERY);
    if (!mq) return undefined;
    const sync = () => setReduced(mq.matches);
    mq.addEventListener?.('change', sync);
    return () => mq.removeEventListener?.('change', sync);
  }, []);
  return reduced;
}

export function scrollToId(id) {
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  return el;
}
