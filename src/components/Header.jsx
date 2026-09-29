import React, { useEffect, useRef, useState } from 'react';
import { LOCALES, featureOn, useContent, useSettings } from '../content/index.js';
import { navLinks } from '../lib/text.js';
import Icon from '../ui/Icon.jsx';

const FOCUSABLE = 'a[href], button:not([disabled])';

export default function Header({ active, sections }) {
  const content = useContent();
  const { company, headerCta, ui } = content;
  const nav = navLinks(content.nav, sections);
  const on = (key) => featureOn(content, key);
  const { lang, setLang, theme, toggleTheme } = useSettings();
  const other = LOCALES[lang === 'ar' ? 'en' : 'ar'];
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // قائمة الهاتف: قفل التمرير، الإغلاق بـ Esc، وحصر التركيز داخلها.
  useEffect(() => {
    if (!open) return undefined;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => panelRef.current?.querySelector(FOCUSABLE)?.focus());

    const onKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = [toggleRef.current, ...panelRef.current.querySelectorAll(FOCUSABLE)];
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const desktop = window.matchMedia('(min-width: 1024px)');
    const onDesktop = () => desktop.matches && setOpen(false);

    document.addEventListener('keydown', onKey);
    desktop.addEventListener?.('change', onDesktop);
    return () => {
      cancelAnimationFrame(frame);
      root.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
      desktop.removeEventListener?.('change', onDesktop);
    };
  }, [open]);

  const close = () => setOpen(false);
  const current = (id) => (active === id ? 'true' : undefined);

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <div className="container site-header__bar">
        <a className="brand logo-plate" href="#home" onClick={close}>
          <img
            src={company.logo.src}
            srcSet={company.logo.srcSet}
            sizes="(min-width: 1024px) 130px, 108px"
            width={company.logo.width}
            height={company.logo.height}
            alt={company.logo.alt}
            fetchpriority="high"
          />
        </a>

        <nav className="primary-nav" aria-label={ui.mainNavLabel}>
          <ul role="list">
            {nav.map((link) => (
              <li key={link.id}>
                <a href={link.href} aria-current={current(link.id)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-tools">
          {on('languageSwitch') && (
          <button
            type="button"
            className="tool-btn tool-btn--lang"
            lang={other.code}
            aria-label={other.label}
            title={other.label}
            onClick={() => setLang(other.code)}
          >
            {other.short}
          </button>
          )}
          {on('themeToggle') && (
          <button
            type="button"
            className="tool-btn"
            aria-label={ui.darkMode}
            aria-pressed={theme === 'dark'}
            title={ui.darkMode}
            onClick={toggleTheme}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={20} />
          </button>
          )}
        </div>

        {on('headerCta') && (
          <a className="btn btn--plum btn--sm header-cta" href={headerCta.href} onClick={close}>
            {headerCta.label}
          </a>
        )}

        <button
          ref={toggleRef}
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? ui.menuClose : ui.menuOpen}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="menu-toggle__icon" aria-hidden="true">
            <span />
            <span />
          </span>
        </button>
      </div>

      {/* مسار رحلة يتقدّم مع التمرير */}
      {on('scrollRoute') && (
        <div className="scroll-route" aria-hidden="true">
          <span className="scroll-route__fill" />
          <span className="scroll-route__plane">
            <Icon name="plane" size={14} />
          </span>
        </div>
      )}

      <div id="mobile-menu" ref={panelRef} className="mobile-menu" data-open={open}>
        <nav aria-label={ui.mainNavLabel}>
          <ul role="list">
            {nav.map((link) => (
              <li key={link.id}>
                <a href={link.href} aria-current={current(link.id)} onClick={close}>
                  {link.label}
                  <Icon name="arrow" size={20} />
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a className="btn btn--sun btn--lg btn--block" href={headerCta.href} onClick={close}>
          {headerCta.label}
          <Icon name="arrow" size={20} />
        </a>
      </div>
    </header>
  );
}
