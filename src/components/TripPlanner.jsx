import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useContent } from '../content/index.js';
import { buildInquiry, mailtoHref, whatsappHref } from '../lib/message.js';
import { fill, isEmail, upcomingMonths, whatsappDigits } from '../lib/text.js';
import Icon from '../ui/Icon.jsx';

const EMPTY = { name: '', destination: '', date: '', travelers: '', notes: '' };
const FIELD_ORDER = ['name', 'destination', 'travelers'];

// يقبل الأرقام العربية الهندية والفارسية ويحوّلها إلى 0-9.
function toLatinDigits(value) {
  return value
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/\D/g, '')
    .slice(0, 3);
}

// تُرجع مفاتيح الرسائل لا نصوصها، فتظهر الرسالة بلغة الواجهة الحالية حتى بعد تبديلها.
function validate(values, { min, max }) {
  const found = {};
  const name = values.name.trim();
  if (!name) found.name = 'nameRequired';
  else if (name.length < 2) found.name = 'nameShort';
  if (!values.destination.trim()) found.destination = 'destinationRequired';
  if (values.travelers !== '') {
    const n = Number(values.travelers);
    if (!Number.isInteger(n) || n < min || n > max) found.travelers = 'travelersRange';
  }
  return found;
}

function Field({ id, label, tag, required, error, hint, children }) {
  return (
    <div className={`field${error ? ' field--invalid' : ''}`}>
      <label className="field__label" htmlFor={id}>
        {label}
        <span className={`field__tag${required ? ' field__tag--required' : ''}`}>{tag}</span>
      </label>
      {children}
      {hint}
      {error && (
        <p className="field__error" id={`${id}-error`}>
          <Icon name="alert" size={16} />
          {error}
        </p>
      )}
    </div>
  );
}

export default function TripPlanner({ prefill }) {
  const { planner, destinations, company, contact, locale } = useContent();
  const f = planner.fields;
  const r = planner.review;

  const [values, setValues] = useState(EMPTY);
  const [errorKeys, setErrors] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [step, setStep] = useState('form');
  const [submitted, setSubmitted] = useState(null);
  const [copyState, setCopyState] = useState('idle');
  const [prefilled, setPrefilled] = useState('');
  const [announce, setAnnounce] = useState(false);
  const [months, setMonths] = useState([]);

  const titleRef = useRef(null);
  const messageRef = useRef(null);
  const inputs = useRef({});
  const shownStep = useRef(step);

  const limits = { min: f.travelers.min, max: f.travelers.max };
  const errors = Object.fromEntries(
    Object.entries(errorKeys)
      .filter(([, key]) => key)
      .map(([field, key]) => [field, fill(planner.errors[key], limits)]),
  );
  const prefillNote = prefilled ? fill(f.destination.prefilled, { value: prefilled }) : '';
  const email = isEmail(contact.email) ? contact.email.trim() : null;
  const whatsapp = whatsappDigits(contact.whatsapp);

  // الأشهر تُحسب في المتصفح حتى تبدأ دائماً من الشهر الحالي.
  useEffect(() => setMonths(upcomingMonths(locale.dateLocale)), [locale.dateLocale]);

  const destinationOptions = useMemo(
    () => [...destinations.items.filter((d) => d.visible !== false).map((d) => d.name), f.destination.undecided],
    [destinations.items, f.destination.undecided],
  );

  // «استفسر عن هذه الوجهة»: تعبئة الوجهة والعودة إلى النموذج.
  useEffect(() => {
    if (!prefill) return;
    const name = destinations.items.find((d) => d.id === prefill.id)?.name ?? '';
    setValues((v) => ({ ...v, destination: name }));
    setErrors(({ destination, ...rest }) => rest);
    setStep('form');
    setPrefilled(name);
    titleRef.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill]);

  // نقل التركيز إلى عنوان اللوحة عند الانتقال بين النموذج والمراجعة.
  useEffect(() => {
    if (shownStep.current === step) return;
    shownStep.current = step;
    titleRef.current?.focus({ preventScroll: true });
  }, [step]);

  const update = (name, value) => {
    const next = { ...values, [name]: value };
    setValues(next);
    if (name === 'destination') setPrefilled('');
    if (attempted || errorKeys[name]) {
      const found = validate(next, limits);
      setErrors((e) => ({ ...e, [name]: found[name] }));
    }
  };

  const onBlur = (name) => {
    if (!values[name]) return;
    const found = validate(values, limits);
    setErrors((e) => ({ ...e, [name]: found[name] }));
  };

  const stepTravelers = (delta) => {
    const { min, max } = f.travelers;
    const current = values.travelers === '' ? 0 : Number(values.travelers);
    const next = Math.min(max, Math.max(min, current + delta));
    update('travelers', String(next));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    setAttempted(true);
    const found = validate(values, limits);
    setErrors(found);
    const firstInvalid = FIELD_ORDER.find((k) => found[k]);
    if (firstInvalid) {
      setAnnounce(true);
      inputs.current[firstInvalid]?.focus();
      return;
    }
    setSubmitted(values);
    setCopyState('idle');
    setAnnounce(false);
    setStep('review');
  };

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(inquiry.body);
      setCopyState('done');
    } catch {
      const selection = window.getSelection();
      selection?.selectAllChildren(messageRef.current);
      setCopyState('failed');
    }
  };

  useEffect(() => {
    if (copyState !== 'done') return undefined;
    const t = setTimeout(() => setCopyState('idle'), 2800);
    return () => clearTimeout(t);
  }, [copyState]);

  // الرسالة تُبنى عند العرض، فتتبع لغة الواجهة إن بدّلها الزائر أثناء المراجعة.
  const inquiry = useMemo(() => {
    if (!submitted) return null;
    const dateLabel = months.find((m) => m.value === submitted.date)?.label;
    return buildInquiry({ values: submitted, dateLabel, template: planner.message, companyName: company.name });
  }, [submitted, months, planner.message, company.name]);

  const describedBy = (name, extra) =>
    [errors[name] ? `trip-${name}-error` : null, extra].filter(Boolean).join(' ') || undefined;
  const travelersNumber = values.travelers === '' ? null : Number(values.travelers);

  return (
    <section id="plan" className="section plan" aria-labelledby="plan-title">
      <div className="container plan__grid">
        <div className="plan__intro" data-reveal>
          <div className="section-head">
            <p className="eyebrow">
              <span className="eyebrow__mark" aria-hidden="true" />
              {planner.eyebrow}
            </p>
            <h2 id="plan-title" className="section-title">
              {planner.title}
            </h2>
          </div>
          <p className="lead">{planner.intro}</p>
          <ol className="route-steps" role="list">
            {planner.steps.map((text, i) => (
              <li key={text}>
                <span className="route-steps__num" aria-hidden="true">
                  {i + 1}
                </span>
                <p>{text}</p>
              </li>
            ))}
          </ol>
          <p className="privacy-note">
            <Icon name="lock" size={18} />
            <span>{planner.privacy}</span>
          </p>
        </div>

        <div className="planner-panel">
          <h3 ref={titleRef} tabIndex={-1} className="planner-panel__title">
            {step === 'form' ? planner.formTitle : r.title}
          </h3>

          {step === 'form' && (
            <form className="form" noValidate onSubmit={onSubmit}>
              <Field
                id="trip-name"
                label={f.name.label}
                tag={planner.required}
                required
                error={errors.name}
              >
                <input
                  ref={(el) => (inputs.current.name = el)}
                  id="trip-name"
                  name="name"
                  className="input"
                  type="text"
                  autoComplete="name"
                  maxLength={80}
                  placeholder={f.name.placeholder}
                  value={values.name}
                  onChange={(e) => update('name', e.target.value)}
                  onBlur={() => onBlur('name')}
                  aria-required="true"
                  aria-invalid={errors.name ? 'true' : undefined}
                  aria-describedby={describedBy('name')}
                />
              </Field>

              <Field
                id="trip-destination"
                label={f.destination.label}
                tag={planner.required}
                required
                error={errors.destination}
                hint={
                  prefillNote ? (
                    <p className="field__hint field__hint--accent" id="trip-destination-note" aria-live="polite">
                      {prefillNote}
                    </p>
                  ) : null
                }
              >
                <input
                  ref={(el) => (inputs.current.destination = el)}
                  id="trip-destination"
                  name="destination"
                  className="input"
                  type="text"
                  list="trip-destination-options"
                  autoComplete="off"
                  maxLength={80}
                  placeholder={f.destination.placeholder}
                  value={values.destination}
                  onChange={(e) => update('destination', e.target.value)}
                  onBlur={() => onBlur('destination')}
                  aria-required="true"
                  aria-invalid={errors.destination ? 'true' : undefined}
                  aria-describedby={describedBy('destination', prefillNote ? 'trip-destination-note' : null)}
                />
                <datalist id="trip-destination-options">
                  {destinationOptions.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </Field>

              <div className="form__row form__row--2">
                <Field id="trip-date" label={f.date.label} tag={planner.optional}>
                  <select
                    id="trip-date"
                    name="date"
                    className="input input--select"
                    value={values.date}
                    onChange={(e) => update('date', e.target.value)}
                  >
                    <option value="">{f.date.flexible}</option>
                    {months.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field id="trip-travelers" label={f.travelers.label} tag={planner.optional} error={errors.travelers}>
                  <div className="stepper">
                    <button
                      type="button"
                      className="stepper__btn"
                      aria-label={f.travelers.decrease}
                      aria-controls="trip-travelers"
                      disabled={travelersNumber === null || travelersNumber <= f.travelers.min}
                      onClick={() => stepTravelers(-1)}
                    >
                      <Icon name="minus" size={20} />
                    </button>
                    <input
                      ref={(el) => (inputs.current.travelers = el)}
                      id="trip-travelers"
                      name="travelers"
                      className="input stepper__input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="—"
                      value={values.travelers}
                      onChange={(e) => update('travelers', toLatinDigits(e.target.value))}
                      onBlur={() => onBlur('travelers')}
                      aria-invalid={errors.travelers ? 'true' : undefined}
                      aria-describedby={describedBy('travelers')}
                    />
                    <button
                      type="button"
                      className="stepper__btn"
                      aria-label={f.travelers.increase}
                      aria-controls="trip-travelers"
                      disabled={travelersNumber !== null && travelersNumber >= f.travelers.max}
                      onClick={() => stepTravelers(1)}
                    >
                      <Icon name="plus" size={20} />
                    </button>
                  </div>
                </Field>
              </div>

              <Field
                id="trip-notes"
                label={f.notes.label}
                tag={planner.optional}
                hint={
                  <p className="field__counter" aria-hidden="true">
                    <bdi>
                      {values.notes.length} / {f.notes.maxLength}
                    </bdi>
                  </p>
                }
              >
                <textarea
                  id="trip-notes"
                  name="notes"
                  className="input input--area"
                  rows={4}
                  maxLength={f.notes.maxLength}
                  placeholder={f.notes.placeholder}
                  value={values.notes}
                  onChange={(e) => update('notes', e.target.value)}
                />
              </Field>

              <div className="form__submit">
                <button type="submit" className="btn btn--plum btn--lg btn--block">
                  <Icon name="mail" size={20} />
                  {planner.submit}
                </button>
                <p className="field__hint">{planner.submitNote}</p>
              </div>
              <p className="visually-hidden" role="status">
                {announce ? planner.errors.summary : ''}
              </p>
            </form>
          )}

          {step === 'review' && inquiry && (
            <div className="review">
              <p className="review__lead">{r.text}</p>
              <dl className="review__meta">
                <div>
                  <dt>{r.to}</dt>
                  <dd>{email ? <bdi dir="ltr">{email}</bdi> : <span className="pending-inline">—</span>}</dd>
                </div>
                <div>
                  <dt>{r.subject}</dt>
                  <dd>{inquiry.subject}</dd>
                </div>
              </dl>
              <pre ref={messageRef} className="review__message" tabIndex={0}>
                {inquiry.body}
              </pre>

              {email ? (
                <div className="review__primary">
                  <a className="btn btn--plum btn--lg btn--block" href={mailtoHref(email, inquiry)}>
                    <Icon name="mail" size={20} />
                    {r.openEmail}
                  </a>
                  <p className="field__hint">{r.openEmailNote}</p>
                </div>
              ) : (
                <div className="notice" role="status">
                  <Icon name="info" size={20} />
                  <div>
                    <strong>{r.notActiveTitle}</strong>
                    <p>{r.notActiveText}</p>
                  </div>
                </div>
              )}

              <div className="review__actions">
                <button type="button" className="btn btn--ghost" onClick={copyMessage}>
                  <Icon name={copyState === 'done' ? 'check' : 'copy'} size={20} />
                  {copyState === 'done' ? r.copied : r.copy}
                </button>
                {whatsapp && (
                  <a
                    className="btn btn--ghost"
                    href={whatsappHref(whatsapp, inquiry)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon name="chat" size={20} />
                    {r.whatsapp}
                  </a>
                )}
                <button type="button" className="btn btn--text" onClick={() => setStep('form')}>
                  <Icon name="edit" size={18} />
                  {r.edit}
                </button>
              </div>
              <p className={copyState === 'failed' ? 'field__hint' : 'visually-hidden'} role="status">
                {copyState === 'done' ? r.copied : copyState === 'failed' ? r.copyFailed : ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
