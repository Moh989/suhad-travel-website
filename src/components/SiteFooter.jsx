import React, { useEffect, useState } from 'react';
import { IS_DEMO, useContent } from '../content/index.js';
import { isEmail, navLinks, safeHref } from '../lib/text.js';
import Icon from '../ui/Icon.jsx';

function CopyEmail({ email, label, done }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return undefined;
    const t = setTimeout(() => setCopied(false), 2400);
    return () => clearTimeout(t);
  }, [copied]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      /* يبقى العنوان ظاهراً وقابلاً للتحديد يدوياً */
    }
  };
  return (
    <button type="button" className="copy-chip" onClick={copy}>
      <Icon name={copied ? 'check' : 'copy'} size={16} />
      <span aria-live="polite">{copied ? done : label}</span>
    </button>
  );
}

/** مصادر الصور المعروضة فعلاً في الصفحة فقط. */
function usedCredits(content) {
  const { hero, about, destinations, media, credits } = content;
  const ids = [
    ...hero.slides.filter((s) => s.visible !== false).flatMap((s) => [s.image, s.mobileImage]),
    ...about.images.map((i) => i.id),
    ...destinations.items.filter((d) => d.visible !== false).map((d) => d.image?.id),
  ];
  const seen = new Map();
  for (const id of ids) {
    const credit = media[id]?.credit;
    const entry = typeof credit === 'string' ? credits[credit] : credit;
    if (entry?.author || entry?.source) seen.set(entry.source || entry.author, entry);
  }
  return [...seen.values()];
}

export default function SiteFooter({ sections }) {
  const content = useContent();
  const { company, contact, footer, headerCta } = content;
  const nav = navLinks(content.nav, sections);
  const credits = usedCredits(content);
  const email = isEmail(contact.email) ? contact.email.trim() : null;
  const hours = Array.isArray(contact.hours) && contact.hours.length ? contact.hours : null;
  const social = (contact.social ?? [])
    .map((s) => ({ ...s, href: safeHref(s?.href) }))
    .filter((s) => s.href && s.visible !== false);
  const year = new Date().getFullYear();
  // لا نكرر النقطة إن انتهى الاسم بها (مثل «Ltd.»).
  const nameEnd = /[.]$/.test(company.name) ? ' ' : '. ';

  return (
    <footer id="contact" className="site-footer" aria-labelledby="contact-title">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <img
            className="logo-plate"
            src={company.logo.src}
            srcSet={company.logo.srcSet}
            sizes="200px"
            width={company.logo.width}
            height={company.logo.height}
            alt={company.logo.alt}
            loading="lazy"
          />
          <p>{footer.tagline}</p>
        </div>

        <div className="site-footer__contact">
          <h2 id="contact-title" className="site-footer__title">
            {footer.contactTitle}
          </h2>
          <ul className="contact-list" role="list">
            <li>
              <span className="contact-list__icon">
                <Icon name="mail" size={20} />
              </span>
              <div>
                <span className="contact-list__label">{footer.emailLabel}</span>
                {email ? (
                  <span className="contact-list__value contact-list__value--row">
                    <a href={`mailto:${email}`}>
                      <bdi dir="ltr">{email}</bdi>
                    </a>
                    <CopyEmail email={email} label={footer.copyEmail} done={footer.copied} />
                  </span>
                ) : (
                  <span className="pending">{footer.emailPending}</span>
                )}
              </div>
            </li>
            <li>
              <span className="contact-list__icon">
                <Icon name="clock" size={20} />
              </span>
              <div>
                <span className="contact-list__label">{footer.hoursLabel}</span>
                {hours ? (
                  <ul className="hours" role="list">
                    {hours.map((h) => (
                      <li key={h.days}>
                        <span>{h.days}</span>
                        <bdi>{h.time}</bdi>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="pending">{footer.hoursPending}</span>
                )}
              </div>
            </li>
          </ul>
          {social.length > 0 && (
            <ul className="social" role="list">
              {social.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <a className="btn btn--plum site-footer__cta" href={headerCta.href}>
            {footer.planLink}
            <Icon name="arrow" size={20} />
          </a>
        </div>

        <nav className="site-footer__links" aria-labelledby="footer-links-title">
          <h2 id="footer-links-title" className="site-footer__title">
            {footer.linksTitle}
          </h2>
          <ul role="list">
            {nav.map((link) => (
              <li key={link.id}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="container site-footer__bottom">
        <p>
          © <bdi>{year}</bdi> {company.name}
          {nameEnd}
          {footer.rights}
        </p>
        {IS_DEMO && (
          <a className="demo-admin-link" href="admin.html">
            لوحة التحكم (معاينة تجريبية)
          </a>
        )}
        {credits.length > 0 && (
        <details className="credits">
          <summary>{footer.creditsTitle}</summary>
          <p>{footer.creditsNote}</p>
          <ul role="list">
            {credits.map((c) => (
              <li key={c.source || c.author}>
                <span>{c.subject}</span>
                <span aria-hidden="true"> · </span>
                <bdi dir="ltr">{c.author}</bdi>
                <span aria-hidden="true"> · </span>
                {safeHref(c.licenseUrl) ? (
                  <a href={safeHref(c.licenseUrl)} target="_blank" rel="noopener noreferrer">
                    <bdi dir="ltr">{c.license}</bdi>
                  </a>
                ) : (
                  <span>{c.license}</span>
                )}
                <span aria-hidden="true"> · </span>
                {safeHref(c.source) && (
                  <a href={safeHref(c.source)} target="_blank" rel="noopener noreferrer">
                    {footer.sourceLabel}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </details>
        )}
      </div>
    </footer>
  );
}
