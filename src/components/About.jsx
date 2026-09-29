import React from 'react';
import { useContent } from '../content/index.js';
import Picture from '../ui/Picture.jsx';
import SectionHeading from '../ui/SectionHeading.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';

export default function About() {
  const { about } = useContent();
  const [main, inset] = about.images;

  return (
    <section id="about" className="section about" aria-labelledby="about-title">
      <div className="container about__grid">
        <div className="about__text" data-reveal>
          <SectionHeading
            id="about-title"
            eyebrow={about.eyebrow}
            title={about.title}
            badge={<StatusBadge item={about} />}
          />
          {about.paragraphs.map((text) => (
            <p key={text.slice(0, 24)}>{text}</p>
          ))}
        </div>

        <div className="about__media" data-reveal>
          <span className="about__block" aria-hidden="true" />
          <figure className="about__figure about__figure--main">
            <div className="about__frame cut" data-parallax="22">
              <Picture id={main.id} alt={main.alt} sizes="(min-width: 960px) 560px, 88vw" />
            </div>
            <figcaption>{main.caption}</figcaption>
          </figure>
          <figure className="about__figure about__figure--inset">
            <div className="about__frame" data-parallax="12">
              <Picture id={inset.id} alt={inset.alt} sizes="(min-width: 960px) 300px, 50vw" />
            </div>
            <figcaption>{inset.caption}</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
