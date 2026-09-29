import React from 'react';
import { isVisible, useContent } from '../content/index.js';
import Icon from '../ui/Icon.jsx';
import Picture from '../ui/Picture.jsx';
import SectionHeading from '../ui/SectionHeading.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';

// عرض الصورة الفعلي في كل موضع من التكوين (أولى بطاقة عريضة، ثم نمط متكرر).
const SIZES = {
  feature: '(min-width: 1024px) 700px, (min-width: 640px) 92vw, 100vw',
  card: '(min-width: 1024px) 420px, (min-width: 640px) 46vw, 100vw',
};

function Program({ program, labels }) {
  const hasContent = program && (program.duration || program.includes?.length || program.terms);
  if (!hasContent) return null;
  return (
    <dl className="dest-card__program">
      {program.duration && (
        <div>
          <dt>{labels.duration}</dt>
          <dd>{program.duration}</dd>
        </div>
      )}
      {program.includes?.length > 0 && (
        <div>
          <dt>{labels.includes}</dt>
          <dd>{program.includes.join('، ')}</dd>
        </div>
      )}
      {program.terms && (
        <div>
          <dt>{labels.terms}</dt>
          <dd>{program.terms}</dd>
        </div>
      )}
    </dl>
  );
}

export default function Destinations({ onInquire }) {
  const { destinations } = useContent();
  const items = destinations.items.filter(isVisible);
  const hasSamples = items.some((d) => d.sample);

  return (
    <section id="destinations" className="section destinations" aria-labelledby="destinations-title">
      <div className="container">
        <div className="destinations__head" data-reveal>
          <SectionHeading id="destinations-title" eyebrow={destinations.eyebrow} title={destinations.title} />
          <div className="destinations__intro">
            <p className="lead">{destinations.intro}</p>
            {hasSamples && (
              <p className="draft-note">
                <Icon name="info" size={18} />
                <span>{destinations.sampleNote}</span>
              </p>
            )}
          </div>
        </div>

        <div className="dest-grid">
          {items.map((d, index) => (
            <article
              key={d.id}
              className="dest-card"
              aria-labelledby={`dest-${d.id}`}
              data-reveal
              style={{ '--reveal-delay': `${(index % 3) * 80}ms` }}
            >
              <div className="dest-card__media cut" data-parallax="16">
                <Picture id={d.image.id} alt={d.image.alt} sizes={index === 0 ? SIZES.feature : SIZES.card} />
                <StatusBadge item={d} className="dest-card__badge" />
              </div>
              <div className="dest-card__body">
                <p className="dest-card__place">
                  <Icon name="pin" size={16} />
                  {d.country}
                </p>
                <h3 id={`dest-${d.id}`} className="dest-card__name">
                  {d.name}
                </h3>
                <p className="dest-card__text">{d.description}</p>
                <Program program={d.program} labels={destinations.programLabels} />
                <button type="button" className="btn btn--text" onClick={() => onInquire(d)}>
                  {destinations.inquireLabel}
                  <span className="visually-hidden">: {d.name}</span>
                  <Icon name="arrow" size={20} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
