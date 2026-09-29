/** يستبدل {key} داخل النص بقيمته. */
export function fill(template, values = {}) {
  return String(template).replace(/\{(\w+)\}/g, (match, key) => (key in values ? values[key] : match));
}

export function isEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function whatsappDigits(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  return digits.length >= 8 ? digits : null;
}

/** أشهر السفر المقترحة: من الشهر الحالي ولمدة 18 شهراً. */
export function upcomingMonths(dateLocale, count = 18, from = new Date()) {
  const format = new Intl.DateTimeFormat(dateLocale, { month: 'long', year: 'numeric' });
  const months = [];
  for (let i = 0; i < count; i += 1) {
    const d = new Date(from.getFullYear(), from.getMonth() + i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push({ value, label: format.format(d) });
  }
  return months;
}

export function statusIsDraft(item) {
  return item?.status !== 'approved';
}

/** يسمح فقط بروابط http(s) و mailto و tel والروابط الداخلية (#). */
export function safeHref(value) {
  if (typeof value !== 'string') return null;
  const v = value.trim();
  if (v.startsWith('#')) return v;
  return /^(https?:|mailto:|tel:)/i.test(v) ? v : null;
}

/** روابط القائمة للأقسام الظاهرة فقط، بترتيبها في الصفحة. */
export function navLinks(nav, sections) {
  return nav
    .filter((link) => link.visible !== false && sections.includes(link.id))
    .sort((a, b) => sections.indexOf(a.id) - sections.indexOf(b.id));
}
