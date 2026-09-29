import { useEffect } from 'react';
import { prefersReducedMotion } from './useReducedMotion.js';

/**
 * ظهور هادئ عند التمرير. العناصر مرئية دائماً في وضع السكون؛
 * الحركة تُشغَّل فقط للعناصر التي كانت خارج الشاشة ثم دخلتها،
 * فلا يتأخر أي محتوى إن تعذّر المراقِب أو فُضِّل تقليل الحركة.
 */
export function useReveal(enabled = true) {
  useEffect(() => {
    if (!enabled || !('IntersectionObserver' in window) || prefersReducedMotion()) return undefined;
    const initial = new WeakSet();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const el = entry.target;
        if (!initial.has(el)) {
          initial.add(el);
          if (entry.isIntersecting) observer.unobserve(el);
          continue;
        }
        if (entry.isIntersecting) {
          el.classList.add('is-revealing');
          observer.unobserve(el);
        }
      }
    });
    document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [enabled]);
}
