import { useEffect, useState } from 'react';

/** يحدد القسم الظاهر حالياً لتمييز رابطه في الترويسة. */
export function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  const key = ids.join('|');

  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!elements.length || !('IntersectionObserver' in window)) return undefined;
    const inBand = new Map();

    const pick = () => {
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom) return setActive(ids[ids.length - 1]);
      const current = ids.find((id) => inBand.get(id));
      if (current) setActive(current);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => inBand.set(e.target.id, e.isIntersecting));
        pick();
      },
      { rootMargin: '-38% 0px -55% 0px' },
    );
    elements.forEach((el) => observer.observe(el));
    window.addEventListener('scroll', pick, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', pick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return active;
}
