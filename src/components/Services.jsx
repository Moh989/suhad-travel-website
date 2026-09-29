import React from 'react';
import { isVisible, useContent } from '../content/index.js';
import { statusIsDraft } from '../lib/text.js';
import Icon from '../ui/Icon.jsx';
import SectionHeading from '../ui/SectionHeading.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';

export default function Services() {
  const { services } = useContent();
  const items = services.items.filter(isVisible);
  const hasDrafts = items.some(statusIsDraft);

  return (
    <section id="services" className="section services" aria-labelledby="services-title">
      <div className="container services__grid">
        <div className="services__head" data-reveal>
          <SectionHeading id="services-title" eyebrow={services.eyebrow} title={services.title} />
          <p className="lead">{services.intro}</p>
          {hasDrafts && (
            <p className="draft-note">
              <Icon name="info" size={18} />
              <span>{services.draftNote}</span>
            </p>
          )}
        </div>

        <ul className="services__list" role="list">
          {items.map((service, index) => (
            <li
              key={service.id}
              className="service"
              data-reveal
              style={{ '--reveal-delay': `${index * 70}ms` }}
            >
              <span className="service__icon">
                <Icon name={service.icon} size={26} />
              </span>
              <div className="service__body">
                <h3 className="service__title">
                  {service.title}
                  <StatusBadge item={service} />
                </h3>
                <p>{service.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
