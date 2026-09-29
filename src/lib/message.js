import { fill } from './text.js';

/**
 * يبني نص رسالة الاستفسار من بيانات النموذج.
 * القالب كله في site.planner.message ليسهل تعديله أو ترجمته.
 */
export function buildInquiry({ values, dateLabel, template, companyName }) {
  const t = template;
  const line = (label, value) => `• ${label}: ${value}`;
  const lines = [
    fill(t.greeting, { company: companyName }),
    '',
    t.intro,
    '',
    line(t.name, values.name.trim()),
    line(t.destination, values.destination.trim()),
    line(t.date, dateLabel || t.notSet),
    line(t.travelers, values.travelers ? String(values.travelers) : t.notSet),
  ];
  const notes = values.notes.trim();
  if (notes) lines.push(line(t.notes, notes));
  lines.push('', t.closing);

  return {
    subject: fill(t.subject, { destination: values.destination.trim() }),
    body: lines.join('\n'),
  };
}

/** رابط mailto مع ترميز صحيح للموضوع والنص (أسطر CRLF كما يوصي RFC 6068). */
export function mailtoHref(email, { subject, body }) {
  const params = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.replace(/\n/g, '\r\n'))}`;
  return `mailto:${email.trim()}?${params}`;
}

/** رابط wa.me بنص مرمّز؛ يفتح المحادثة ويترك الإرسال للزائر. */
export function whatsappHref(digits, { body }) {
  return `https://wa.me/${digits}?text=${encodeURIComponent(body)}`;
}
