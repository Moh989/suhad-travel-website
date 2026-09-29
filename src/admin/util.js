/* global __SUHAD_DEMO__ */
export const IS_DEMO = typeof __SUHAD_DEMO__ !== 'undefined' && __SUHAD_DEMO__;

// اللوحة في /admin/ والموقع في المجلد الأعلى؛ في المعاينة التجريبية الصفحتان في المجلد نفسه.
export const SITE_ROOT = new URL(IS_DEMO ? './' : '../', window.location.href);
export const SITE_URL = IS_DEMO ? './' : '../';

export const getIn = (obj, path) => path.reduce((o, k) => (o == null ? undefined : o[k]), obj);

export function setIn(obj, path, value) {
  if (!path.length) return value;
  const [key, ...rest] = path;
  const base = obj ?? (typeof key === 'number' ? [] : {});
  const copy = Array.isArray(base) ? [...base] : { ...base };
  copy[key] = setIn(base[key], rest, value);
  return copy;
}

export const uid = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

export function assetUrl(path) {
  if (!path) return '';
  if (/^(data:|blob:|https?:)/.test(path)) return path;
  return new URL(path, SITE_ROOT).href;
}

/** رابط معاينة صغيرة لصورة من المكتبة. */
export function previewSrc(m, target = 800) {
  if (!m) return '';
  if (m.src) return assetUrl(m.src);
  const widths = m.widths || [];
  const w = widths.find((x) => x >= target) ?? widths[widths.length - 1];
  return assetUrl(`${m.base}-${w}.${m.ext || 'webp'}`);
}

export const i18nText = (value, lang = 'ar') =>
  typeof value === 'string' ? value : (value?.[lang] ?? value?.ar ?? '');

const ERRORS = {
  network: 'تعذّر الاتصال بالخادم. تحقق من الاتصال ثم أعد المحاولة.',
  unauthorized: 'انتهت الجلسة. سجّل الدخول مرة أخرى.',
  csrf: 'انتهت صلاحية الصفحة. حدّثها ثم أعد المحاولة.',
  bad_credentials: 'اسم المستخدم أو كلمة المرور غير صحيحة.',
  locked: 'محاولات دخول كثيرة. انتظر {minutes} دقيقة ثم أعد المحاولة.',
  bad_setup_key: 'مفتاح الإعداد غير صحيح.',
  already_configured: 'حساب المدير موجود مسبقاً. سجّل الدخول.',
  not_configured: 'لم يُنشأ حساب المدير بعد.',
  bad_username: 'اسم المستخدم: من 3 إلى 40 حرفاً إنجليزياً أو رقماً (ويُسمح بـ . _ -).',
  weak_password: 'كلمة المرور يجب ألا تقل عن 10 أحرف.',
  conflict: 'حُفظت نسخة أحدث من مكان آخر. حمّل النسخة الأحدث قبل الحفظ حتى لا تضيع تعديلات.',
  invalid_content: 'المحتوى غير مكتمل ولم يُحفظ. حدّث الصفحة وأعد المحاولة.',
  invalid_email: 'البريد الإلكتروني غير صحيح.',
  too_large: 'الملف أكبر من المسموح ({mb} ميغابايت).',
  unsupported_type: 'صيغة الصورة غير مدعومة. استخدم JPG أو PNG أو WebP.',
  bad_dimensions: 'أبعاد الصورة غير مناسبة: يجب أن تكون بين 200 و10000 بكسل.',
  upload_failed: 'تعذّر رفع الملف. أعد المحاولة.',
  in_use: 'الصورة مستخدمة في الموقع. غيّرها في مكان استخدامها أولاً ثم احذفها.',
  not_deletable: 'صور التصميم الأصلية لا تُحذف.',
  bad_url: 'الرابط يجب أن يبدأ بـ https://',
  storage_not_writable: 'لا يمكن الكتابة على الخادم. تأكد أن مجلدَي data و uploads قابلان للكتابة.',
  storage_full: 'امتلأت مساحة المتصفح في وضع المعاينة. احذف بعض الصور المرفوعة.',
};

export function errorText(error) {
  const code = error?.code || 'unknown';
  const template = ERRORS[code] || `حدث خطأ غير متوقع (${code}).`;
  const minutes = Math.max(1, Math.ceil((error?.data?.retryAfter || 60) / 60));
  return template.replace('{minutes}', String(minutes)).replace('{mb}', '12');
}

export function formatDate(iso) {
  try {
    return new Intl.DateTimeFormat('ar-u-nu-latn', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/** اسم مفهوم للصورة: اسم الملف المرفوع، أو موضوع صورة التصميم مع نوع القص. */
export function mediaName(m, credits = {}) {
  if (!m) return '';
  if (m.name) return m.name;
  const credit = typeof m.credit === 'string' ? credits[m.credit] : m.credit;
  const subject = i18nText(credit?.subject) || m.id;
  if (/Mobile$/.test(m.id)) return `${subject} · قصّ الهاتف`;
  if (/^(slide|hero$)/.test(m.id)) return `${subject} · عريضة للواجهة`;
  return subject;
}
