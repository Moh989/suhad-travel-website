export const LOCALE_CODES = ['ar', 'en'];

// نص مترجم = كائن مفاتيحه رموز لغات فقط، مثل { ar: '…', en: '…' }.
function isLocalized(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    'ar' in value &&
    Object.keys(value).every((key) => LOCALE_CODES.includes(key))
  );
}

/** يحوّل شجرة المحتوى إلى لغة واحدة، مع الرجوع إلى العربية إن غابت الترجمة. */
export function localize(value, lang, fallback = 'ar') {
  if (Array.isArray(value)) return value.map((item) => localize(item, lang, fallback));
  if (isLocalized(value)) {
    // الترجمة الفارغة تُعامل كغائبة فيظهر النص العربي بدلها.
    const own = value[lang];
    const missing = own === undefined || own === null || own === '' || (Array.isArray(own) && own.length === 0);
    return localize(missing ? value[fallback] : own, lang, fallback);
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, localize(item, lang, fallback)]));
  }
  return value;
}
