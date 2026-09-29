import React from 'react';
import { useContent } from '../content/index.js';
import { statusIsDraft } from '../lib/text.js';

/** وسم «مقترح» أو «مثال تجريبي» حسب حالة العنصر في ملف المحتوى. */
export default function StatusBadge({ item, className = '' }) {
  const { ui } = useContent();
  const kind = item?.sample ? 'sample' : statusIsDraft(item) ? 'suggested' : null;
  if (!kind) return null;
  return (
    <span className={`badge badge--${kind} ${className}`.trim()}>{kind === 'sample' ? ui.sample : ui.suggested}</span>
  );
}
