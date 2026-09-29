const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * يدمج المحتوى المحفوظ من لوحة التحكم فوق المحتوى الافتراضي.
 * - الكائنات تُدمج بعمق (فتظهر أي حقول جديدة تُضاف للموقع لاحقاً بقيمها الافتراضية).
 * - القوائم تُستبدل كاملة (ترتيب العناصر وحذفها بيد اللوحة).
 * - null قيمة مقصودة (مثل حذف البريد) ولا تُستبدل بالافتراضي.
 */
export function mergeContent(base, override) {
  if (override === undefined) return base;
  // خوادم PHP قد تُرسل الكائن الفارغ {} بصيغة []؛ لا يُمسح به كائن افتراضي.
  if (isObject(base) && Array.isArray(override) && override.length === 0) return base;
  if (isObject(base) && isObject(override)) {
    const out = { ...base };
    for (const key of Object.keys(override)) out[key] = mergeContent(base[key], override[key]);
    return out;
  }
  return override;
}
