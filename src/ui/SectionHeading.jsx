import React from 'react';

export default function SectionHeading({ id, eyebrow, title, badge, className = '' }) {
  return (
    <div className={`section-head ${className}`.trim()}>
      <p className="eyebrow">
        <span className="eyebrow__mark" aria-hidden="true" />
        {eyebrow}
        {badge}
      </p>
      <h2 id={id} className="section-title">
        {title}
      </h2>
    </div>
  );
}
