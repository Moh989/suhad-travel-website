import { LOCALES, defaultLocale } from '../content/index.js';

/*
 * تفضيلات العرض فقط (اللغة والنمط) تُحفظ في متصفح الزائر لراحته.
 * لا تُحفظ أي بيانات شخصية أو بيانات من النموذج.
 */
const KEYS = { lang: 'suhad-lang', theme: 'suhad-theme' };

export function readPref(name) {
  try {
    return window.localStorage.getItem(KEYS[name]);
  } catch {
    return null;
  }
}

export function writePref(name, value) {
  try {
    window.localStorage.setItem(KEYS[name], value);
  } catch {
    /* التخزين غير متاح (نافذة خاصة مثلاً) — يعمل الموقع دونه */
  }
}

export function initialLang() {
  let fromUrl = null;
  try {
    fromUrl = new URLSearchParams(window.location.search).get('lang');
  } catch {
    /* تجاهل */
  }
  const candidates = [fromUrl, readPref('lang'), document.documentElement.lang];
  return candidates.find((code) => code && LOCALES[code]) ?? defaultLocale;
}

/** النمط الحالي: الاختيار الصريح في data-theme، وإلا إعداد النظام. */
export function currentTheme() {
  const attr = document.documentElement.dataset.theme;
  if (attr === 'dark' || attr === 'light') return attr;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
