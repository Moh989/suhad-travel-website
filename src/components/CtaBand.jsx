import React from 'react';
import { useContent } from '../content/index.js';
import Icon from '../ui/Icon.jsx';

export default function CtaBand() {
  const { cta } = useContent();

  return (
    <section className="cta-band on-dark" aria-labelledby="cta-title">
      <span className="cta-band__shapes" aria-hidden="true">
        <i />
        <i />
      </span>
      <div className="container cta-band__inner" data-reveal>
        <h2 id="cta-title" className="cta-band__title">
          <span>{cta.titleLead}</span> <span className="cta-band__accent">{cta.titleRest}</span>
        </h2>
        <div className="cta-band__side">
          <p>{cta.text}</p>
          <a className="btn btn--sun btn--lg" href={cta.button.href}>
            {cta.button.label}
            <Icon name="arrow" size={20} />
          </a>
        </div>
      </div>
    </section>
  );
}
