import React, { useCallback, useEffect, useRef, useState } from 'react';
import { featureOn, isVisible, useContent } from '../content/index.js';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import { fill } from '../lib/text.js';
import Picture from '../ui/Picture.jsx';
import Icon from '../ui/Icon.jsx';

function HighlightedTitle({ text, highlight }) {
  const at = highlight ? text.lastIndexOf(highlight) : -1;
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <span className="hero__highlight">{highlight}</span>
      {text.slice(at + highlight.length)}
    </>
  );
}

/**
 * الواجهة مع عرض صور متحرك.
 * يتوقف تلقائياً عند: ضغط زر الإيقاف، تركيز لوحة المفاتيح على أزرار التحكم،
 * خروج الواجهة من الشاشة، إخفاء التبويب، أو تفضيل تقليل الحركة (يبدأ متوقفاً).
 */
export default function Hero() {
  const content = useContent();
  const { hero, ui } = content;
  const slides = hero.slides.filter((slide) => isVisible(slide) && content.media[slide.image]);
  const autoplay = hero.autoplay !== false;
  const count = slides.length;
  const reduced = useReducedMotion();

  const [index, setIndex] = useState(0);
  const [previous, setPrevious] = useState(null);
  const [rotated, setRotated] = useState(false);
  const [userPaused, setUserPaused] = useState(reduced || !autoplay);
  const [focusHold, setFocusHold] = useState(false);
  const [offscreen, setOffscreen] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [loaded, setLoaded] = useState(() => new Set([0]));

  const heroRef = useRef(null);
  const indexRef = useRef(0);
  const remaining = useRef(hero.interval);
  const running = count > 1 && !userPaused && !focusHold && !offscreen && !tabHidden;

  const load = useCallback((i) => setLoaded((set) => (set.has(i) ? set : new Set(set).add(i))), []);

  const goTo = useCallback(
    (target) => {
      const next = (target + count) % count;
      if (next === indexRef.current) return;
      setPrevious(indexRef.current);
      indexRef.current = next;
      remaining.current = hero.interval;
      setIndex(next);
      setRotated(true);
      load(next);
    },
    [count, hero.interval, load],
  );

  // المؤقت يحفظ الوقت المتبقي عند الإيقاف ويستأنف منه.
  useEffect(() => {
    if (!running) return undefined;
    const mine = index;
    const started = performance.now();
    const timer = setTimeout(() => goTo(mine + 1), remaining.current);
    return () => {
      clearTimeout(timer);
      if (indexRef.current === mine) {
        remaining.current = Math.max(400, remaining.current - (performance.now() - started));
      }
    };
  }, [running, index, goTo]);

  // تحميل الصورة التالية مسبقاً بعد استقرار الحالية (الأولى تُترك لأولوية التحميل).
  useEffect(() => {
    const timer = setTimeout(() => load((index + 1) % count), index === 0 ? 2500 : 800);
    return () => clearTimeout(timer);
  }, [index, count, load]);

  useEffect(() => {
    if (reduced) setUserPaused(true);
  }, [reduced]);

  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    let observer;
    if ('IntersectionObserver' in window && heroRef.current) {
      observer = new IntersectionObserver(([entry]) => setOffscreen(!entry.isIntersecting));
      observer.observe(heroRef.current);
    }
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      observer?.disconnect();
    };
  }, []);

  const current = slides[index] ?? null;
  const s = ui.slider;

  return (
    <section
      id="home"
      ref={heroRef}
      className={`hero on-dark${running ? '' : ' is-paused'}`}
      aria-labelledby="hero-title"
      style={{ '--interval': `${hero.interval}ms` }}
    >
      <div className="hero__media" role="region" aria-roledescription="carousel" aria-label={s.label}>
        <div className="hero__slides" aria-live={running ? 'off' : 'polite'}>
          {slides.map((slide, i) => {
            const state = i === index ? ' is-active' : i === previous ? ' is-previous' : '';
            return (
              <div
                key={slide.id}
                className={`hero__slide${state}${i === index && rotated ? ' is-entering' : ''}`}
                role="group"
                aria-roledescription="slide"
                aria-label={fill(s.slide, { n: i + 1, total: count })}
                aria-hidden={i !== index}
                style={{ '--fx': slide.focus }}
              >
                {loaded.has(i) && (
                  <Picture
                    id={slide.image}
                    mobileId={slide.mobileImage}
                    alt={slide.alt}
                    sizes="(min-width: 1100px) 130vw, 100vw"
                    priority={i === 0}
                  />
                )}
              </div>
            );
          })}
        </div>
        <span className="hero__scrim" aria-hidden="true" />

        {current && (
          <p className="hero__caption" key={current.id}>
            <Icon name="pin" size={14} />
            {current.place}
            <span aria-hidden="true">·</span>
            {ui.imageNote}
          </p>
        )}

        {featureOn(content, 'heroPath') && (
        <svg className="hero__path" viewBox="0 0 640 300" fill="none" aria-hidden="true" focusable="false">
          <path className="hero__path-line" d="M632 292C520 150 360 70 150 64 96 62 50 70 16 84" />
          <circle cx="632" cy="292" r="4" className="hero__path-dot" />
          <circle cx="16" cy="84" r="7" className="hero__path-ring" />
        </svg>
        )}

        {count > 1 && (
          <div
            className="slider-nav"
            onFocus={(e) => {
              // تركيز لوحة المفاتيح يوقف العرض مؤقتاً؛ نقرة الفأرة لا تفعل.
              if (e.target.matches?.(':focus-visible')) setFocusHold(true);
            }}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) setFocusHold(false);
            }}
          >
            <button type="button" className="slider-nav__btn" aria-label={s.previous} onClick={() => goTo(index - 1)}>
              <Icon name="chevron" size={20} className="icon--back" />
            </button>
            <button
              type="button"
              className="slider-nav__btn"
              aria-label={userPaused ? s.play : s.pause}
              onClick={() => {
                // «تشغيل» صريح من الزائر يستأنف العرض حتى مع بقاء التركيز على الزر.
                if (userPaused) setFocusHold(false);
                setUserPaused(!userPaused);
              }}
            >
              <Icon name={userPaused ? 'play' : 'pause'} size={18} />
            </button>
            <button type="button" className="slider-nav__btn" aria-label={s.next} onClick={() => goTo(index + 1)}>
              <Icon name="chevron" size={20} />
            </button>
            <div className="slider-nav__segments">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  className={`seg${i < index ? ' is-done' : ''}${i === index ? ' is-current' : ''}`}
                  aria-label={fill(s.goTo, { n: i + 1, place: slide.place })}
                  aria-current={i === index ? 'true' : undefined}
                  onClick={() => goTo(i)}
                >
                  <span className="seg__track">
                    {i === index && <span key={`fill-${index}`} className="seg__fill" />}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="container hero__content">
        <p className="hero__eyebrow">
          <span className="eyebrow__mark" aria-hidden="true" />
          {hero.eyebrow}
        </p>
        <h1 id="hero-title" className="hero__title">
          <HighlightedTitle text={hero.title} highlight={hero.titleHighlight} />
        </h1>
        <p className="hero__text">{hero.text}</p>
        <div className="hero__actions">
          <a className="btn btn--sun btn--lg" href={hero.primaryCta.href}>
            {hero.primaryCta.label}
            <Icon name="arrow" size={20} />
          </a>
          <a className="btn btn--outline-light btn--lg" href={hero.secondaryCta.href}>
            {hero.secondaryCta.label}
          </a>
        </div>
      </div>
    </section>
  );
}
