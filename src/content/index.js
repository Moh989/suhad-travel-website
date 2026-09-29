import { createContext, useContext } from 'react';
import site from './site.js';
import { localize } from './localize.js';
import { mergeContent } from './merge.js';
import { readDemo } from '../lib/demoStore.js';

/**
 * إعدادات اللغات. لإضافة لغة: أضفها هنا وأضف مفتاحها إلى LOCALE_CODES في localize.js،
 * ثم أضف ترجمتها بجانب كل نص في site.js.
 */
export const LOCALES = {
  ar: { code: 'ar', dir: 'rtl', dateLocale: 'ar-u-nu-latn', label: 'العربية', short: 'ع', ogLocale: 'ar_AR' },
  en: { code: 'en', dir: 'ltr', dateLocale: 'en-GB', label: 'English', short: 'EN', ogLocale: 'en_GB' },
};
export const defaultLocale = 'ar';

/* global __SUHAD_DEMO__ */
export const IS_DEMO = typeof __SUHAD_DEMO__ !== 'undefined' && __SUHAD_DEMO__;

/**
 * مصدر المحتوى:
 * 1. ما يحقنه الخادم في الصفحة (window.__SITE_CONTENT__) — المحتوى المحفوظ من لوحة التحكم.
 * 2. في المعاينة: ما حفظته اللوحة التجريبية في المتصفح.
 * 3. وإلا المحتوى الافتراضي في site.js.
 */
function loadSource() {
  if (typeof window === 'undefined') return site;
  const injected = window.__SITE_CONTENT__;
  if (injected && typeof injected === 'object') return mergeContent(site, injected);
  if (IS_DEMO) {
    const content = readDemo('content');
    const media = readDemo('media', {});
    const merged = mergeContent(site, content ?? undefined);
    return { ...merged, media: mergeContent(site.media, media) };
  }
  return site;
}

let sourceCache = null;
const cache = {};

/** يُحسب عند أول استخدام (بعد أن يحقن الخادم المحتوى أو يُجلب أثناء التطوير). */
export function getSource() {
  if (!sourceCache) sourceCache = loadSource();
  return sourceCache;
}

export function getContent(lang = defaultLocale) {
  const code = LOCALES[lang] ? lang : defaultLocale;
  if (!cache[code]) cache[code] = { ...localize(getSource(), code), locale: LOCALES[code] };
  return cache[code];
}

/** الميزات قابلة للإيقاف من لوحة التحكم؛ الغائب منها يُعدّ مفعّلاً. */
export const featureOn = (content, key) => content.features?.[key] !== false;
export const isVisible = (item) => item?.visible !== false;

export const ContentContext = createContext(null);
export const useContent = () => useContext(ContentContext);

export const SettingsContext = createContext({
  lang: defaultLocale,
  setLang: () => {},
  theme: 'light',
  toggleTheme: () => {},
});
export const useSettings = () => useContext(SettingsContext);
