/**
 * وضع المعاينة فقط (نسخة Claude Artifacts): لوحة التحكم تحفظ في متصفح الزائر
 * بدل الخادم، والموقع يقرأ منها. في النسخة الحقيقية لا يُستخدم هذا الملف.
 */
export const DEMO_KEYS = {
  content: 'suhad-demo-content',
  media: 'suhad-demo-media',
  backups: 'suhad-demo-backups',
  version: 'suhad-demo-version',
};

export function readDemo(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(DEMO_KEYS[key]);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeDemo(key, value) {
  window.localStorage.setItem(DEMO_KEYS[key], JSON.stringify(value));
}
