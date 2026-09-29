import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ContentContext, SettingsContext, defaultLocale, featureOn, getContent, getSource } from './content/index.js';
import { currentTheme, initialLang, writePref } from './lib/preferences.js';
import { useActiveSection } from './hooks/useActiveSection.js';
import { prefersReducedMotion, scrollToId } from './hooks/useReducedMotion.js';
import { useReveal } from './hooks/useReveal.js';
import { useScrollEffects } from './hooks/useScrollEffects.js';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Services from './components/Services.jsx';
import Destinations from './components/Destinations.jsx';
import CtaBand from './components/CtaBand.jsx';
import TripPlanner from './components/TripPlanner.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import ContactFab from './components/ContactFab.jsx';
import StructuredData from './components/StructuredData.jsx';

// الأقسام القابلة للترتيب بين الواجهة والتذييل.
const SECTIONS = {
  about: About,
  services: Services,
  destinations: Destinations,
  cta: CtaBand,
  plan: TripPlanner,
};
const DEFAULT_ORDER = Object.keys(SECTIONS).map((id) => ({ id, visible: true }));

/** ترتيب الأقسام الظاهرة كما حددته لوحة التحكم (النموذج يبقى ظاهراً دائماً). */
function visibleSections(layout) {
  const list = Array.isArray(layout?.sections) && layout.sections.length ? layout.sections : DEFAULT_ORDER;
  const seen = new Set();
  const order = list.filter((s) => SECTIONS[s.id] && !seen.has(s.id) && seen.add(s.id));
  if (!seen.has('plan')) order.push({ id: 'plan', visible: true });
  return order.filter((s) => s.visible !== false || s.id === 'plan').map((s) => s.id);
}


function setMeta(name, value) {
  document.querySelector(`meta[name="${name}"]`)?.setAttribute('content', value);
}

export default function App() {
  // إن أوقفت لوحة التحكم تبديل اللغة يبقى الموقع بالعربية.
  const [lang, setLangState] = useState(() =>
    featureOn(getSource(), 'languageSwitch') ? initialLang() : defaultLocale,
  );
  const [theme, setTheme] = useState(currentTheme);
  const [prefill, setPrefill] = useState(null);
  const content = useMemo(() => getContent(lang), [lang]);
  const order = useMemo(() => visibleSections(content.layout), [content.layout]);
  const sectionIds = useMemo(() => ['home', ...order, 'contact'], [order]);
  const active = useActiveSection(sectionIds);
  const anchor = useRef(null);
  useReveal(featureOn(content, 'revealOnScroll'));
  useScrollEffects(featureOn(content, 'parallax'));

  // اللغة: الاتجاه والعنوان والوصف تتبع المحتوى.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.lang = content.locale.code;
    root.dir = content.locale.dir;
    document.title = content.seo.title;
    setMeta('description', content.seo.description);
    // يبقى الزائر عند القسم نفسه بعد تغيّر طول النصوص.
    if (anchor.current) {
      const { el, top } = anchor.current;
      window.scrollBy({ top: el.getBoundingClientRect().top - top, behavior: 'instant' });
      anchor.current = null;
    }
  }, [content]);

  const setLang = useCallback(
    (next) => {
      const section = document.getElementById(active);
      if (section) anchor.current = { el: section, top: section.getBoundingClientRect().top };
      setLangState(next);
      writePref('lang', next);
      try {
        if (window.self === window.top) {
          const url = new URL(window.location.href);
          if (next === defaultLocale) url.searchParams.delete('lang');
          else url.searchParams.set('lang', next);
          window.history.replaceState(null, '', url);
        }
      } catch {
        /* تجاهل: الرابط لا يتغير في بعض البيئات المقيّدة */
      }
    },
    [active],
  );

  // النمط: يتبع إعداد النظام ما لم يختر الزائر، ويتزامن إن غيّرته الصفحة المضيفة.
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setTheme(currentTheme());
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    mq?.addEventListener?.('change', sync);
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => {
      mq?.removeEventListener?.('change', sync);
      observer.disconnect();
    };
  }, []);

  const toggleTheme = useCallback(() => {
    const root = document.documentElement;
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    if (!prefersReducedMotion()) {
      root.classList.add('theme-switching');
      window.setTimeout(() => root.classList.remove('theme-switching'), 450);
    }
    root.dataset.theme = next;
    writePref('theme', next);
  }, []);

  const settings = useMemo(() => ({ lang, setLang, theme, toggleTheme }), [lang, setLang, theme, toggleTheme]);

  const inquire = useCallback((destination) => {
    setPrefill({ id: destination.id, at: Date.now() });
    scrollToId('plan');
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      <ContentContext.Provider value={content}>
        <a className="skip-link" href="#main">
          {content.ui.skipLink}
        </a>
        <Header active={active} sections={sectionIds} />
        <main id="main" tabIndex={-1}>
          <Hero />
          {order.map((id) => {
            const Section = SECTIONS[id];
            return <Section key={id} onInquire={inquire} prefill={prefill} />;
          })}
        </main>
        <SiteFooter sections={sectionIds} />
        <ContactFab />
        <StructuredData />
      </ContentContext.Provider>
    </SettingsContext.Provider>
  );
}
