import React from 'react';
import { useContent } from '../content/index.js';

// صور الموقع محفوظة بعدة عروض ({base}-{width}.{ext})؛ الصورة المرفوعة دون معالجة لها src واحد.
const ext = (m) => m.ext || 'webp';
const srcSet = (m) => (m.src ? undefined : m.widths.map((w) => `${m.base}-${w}.${ext(m)} ${w}w`).join(', '));
const fallbackSrc = (m) => m.src || `${m.base}-${m.widths[Math.min(1, m.widths.length - 1)]}.${ext(m)}`;

/**
 * صورة متجاوبة من مكتبة الصور.
 * mobileId: قصّ بديل للهاتف (art direction) يُستخدم تحت mobileQuery.
 */
export default function Picture({
  id,
  mobileId,
  alt,
  sizes = '100vw',
  mobileSizes = '100vw',
  mobileQuery = '(max-width: 699px)',
  priority = false,
  className = '',
}) {
  const { media } = useContent();
  const m = media[id];
  if (!m) return null;
  const mm = mobileId && mobileId !== id ? media[mobileId] : null;

  return (
    <picture
      className={`pic ${className}`.trim()}
      style={{ '--obj-pos': m.position, '--obj-pos-sm': (mm ?? m).position }}
    >
      {mm && (
        <source
          media={mobileQuery}
          srcSet={srcSet(mm) ?? mm.src}
          sizes={mm.src ? undefined : mobileSizes}
          width={mm.width}
          height={mm.height}
        />
      )}
      <img
        src={fallbackSrc(m)}
        srcSet={srcSet(m)}
        sizes={m.src ? undefined : sizes}
        width={m.width}
        height={m.height}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchpriority={priority ? 'high' : undefined}
      />
    </picture>
  );
}
