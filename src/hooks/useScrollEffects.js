import { useEffect } from 'react';
import { prefersReducedMotion } from './useReducedMotion.js';

/**
 * تأثيرات مرتبطة بالتمرير، بإطار رسم واحد لكل حركة تمرير:
 * - --page-progress (0 → 1) على الجذر: يحرّك الطائرة على مسار الترويسة.
 * - --hero-shift على الواجهة: عمق خفيف لصور العرض المتحرك.
 * - --py على كل عنصر [data-parallax="16"]: إزاحة الصورة داخل إطارها أثناء مرورها.
 * العمق والإزاحة يتوقفان عند تفضيل تقليل الحركة؛ مؤشر التقدم يبقى لأنه يتبع يد الزائر مباشرة.
 */
export function useScrollEffects(parallax = true) {
  useEffect(() => {
    const root = document.documentElement;
    const motion = parallax && !prefersReducedMotion();
    const hero = document.getElementById('home');
    const visible = new Set();
    let heroVisible = true;
    let frame = 0;

    const observer =
      motion && 'IntersectionObserver' in window
        ? new IntersectionObserver(
            (entries) => {
              for (const e of entries) {
                if (e.target === hero) heroVisible = e.isIntersecting;
                else if (e.isIntersecting) visible.add(e.target);
                else visible.delete(e.target);
              }
              schedule();
            },
            { rootMargin: '80px 0px' },
          )
        : null;

    if (observer) {
      document.querySelectorAll('[data-parallax]').forEach((el) => observer.observe(el));
      if (hero) observer.observe(hero);
    }

    function update() {
      frame = 0;
      const vh = window.innerHeight;
      const max = root.scrollHeight - vh;
      const y = window.scrollY;
      root.style.setProperty('--page-progress', max > 0 ? Math.min(1, y / max).toFixed(4) : '0');
      if (!motion) return;
      if (hero && heroVisible) hero.style.setProperty('--hero-shift', `${Math.round(Math.min(y, vh) * 0.28)}px`);
      for (const el of visible) {
        const r = el.getBoundingClientRect();
        const strength = Number(el.dataset.parallax) || 16;
        const p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
        el.style.setProperty('--py', `${(Math.max(-1, Math.min(1, p)) * -strength).toFixed(1)}px`);
      }
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [parallax]);
}
