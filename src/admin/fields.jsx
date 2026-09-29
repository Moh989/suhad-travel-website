import React, { useEffect, useId, useState } from 'react';
import Icon from '../ui/Icon.jsx';
import { mediaName, previewSrc } from './util.js';

const LANGS = [
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'en', name: 'English', dir: 'ltr' },
];

function Help({ id, text }) {
  return text ? (
    <p className="a-help" id={id}>
      {text}
    </p>
  ) : null;
}

export function Switch({ checked, onChange, label, disabled, describedBy }) {
  return (
    <label className={`a-switch${disabled ? ' is-disabled' : ''}`}>
      <input
        type="checkbox"
        role="switch"
        checked={!!checked}
        disabled={disabled}
        aria-describedby={describedBy}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="a-switch__track" aria-hidden="true">
        <span className="a-switch__thumb" />
      </span>
      <span className="a-switch__label">{label}</span>
    </label>
  );
}

/* ---------- نص باللغتين ---------- */
function I18nInput({ field, value, onChange }) {
  const id = useId();
  const v = typeof value === 'string' ? { ar: value, en: '' } : value || {};
  const Tag = field.multiline ? 'textarea' : 'input';
  return (
    <fieldset className="a-field a-i18n" aria-describedby={field.help ? `${id}-h` : undefined}>
      <legend className="a-label">{field.label}</legend>
      <div className="a-i18n__grid">
        {LANGS.map((l) => (
          <label key={l.code} className="a-i18n__col">
            <span className="a-lang" lang={l.code}>
              {l.name}
              {l.code === 'en' && v.ar && !v.en && <span className="a-missing">فارغ: ستظهر العربية مكانه</span>}
            </span>
            <Tag
              className="a-input"
              dir={l.dir}
              lang={l.code}
              rows={field.multiline ? 3 : undefined}
              value={v[l.code] ?? ''}
              onChange={(e) => onChange({ ...v, [l.code]: e.target.value })}
            />
          </label>
        ))}
      </div>
      <Help id={`${id}-h`} text={field.help} />
    </fieldset>
  );
}

/* ---------- قائمة نصوص: كل سطر عنصر (أو كل فقرة مفصولة بسطر فارغ) ---------- */
const splitter = (multiline) => (multiline ? /\n\s*\n/ : /\n/);
const joiner = (multiline) => (multiline ? '\n\n' : '\n');
const toList = (raw, multiline) =>
  raw
    .split(splitter(multiline))
    .map((s) => s.trim())
    .filter(Boolean);

function LinesInput({ value, onChange, multiline, dir, lang, label, describedBy }) {
  const list = Array.isArray(value) ? value : [];
  const [raw, setRaw] = useState(list.join(joiner(multiline)));
  // مزامنة إن تغيّرت القيمة من الخارج (مثل «تجاهل التغييرات»)
  useEffect(() => {
    if (toList(raw, multiline).join('\u0000') !== list.join('\u0000')) setRaw(list.join(joiner(multiline)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <textarea
      className="a-input"
      dir={dir}
      lang={lang}
      aria-label={label}
      aria-describedby={describedBy}
      rows={Math.max(3, list.length + (multiline ? list.length * 2 : 1))}
      value={raw}
      onChange={(e) => {
        setRaw(e.target.value);
        onChange(toList(e.target.value, multiline));
      }}
    />
  );
}

function I18nListField({ field, value, onChange }) {
  const id = useId();
  const v = value && !Array.isArray(value) ? value : { ar: Array.isArray(value) ? value : [], en: [] };
  const hint = field.multiline ? 'افصل بين الفقرات بسطر فارغ.' : 'كل سطر عنصر مستقل.';
  return (
    <fieldset className="a-field a-i18n">
      <legend className="a-label">{field.label}</legend>
      <div className="a-i18n__grid">
        {LANGS.map((l) => (
          <label key={l.code} className="a-i18n__col">
            <span className="a-lang" lang={l.code}>
              {l.name}
            </span>
            <LinesInput
              value={v[l.code]}
              multiline={field.multiline}
              dir={l.dir}
              lang={l.code}
              describedBy={`${id}-h`}
              onChange={(list) => onChange({ ...v, [l.code]: list })}
            />
          </label>
        ))}
      </div>
      <Help id={`${id}-h`} text={field.help ? `${field.help} ${hint}` : hint} />
    </fieldset>
  );
}

/* ---------- الصور ---------- */
function ImageField({ field, value, onChange, ctx }) {
  const id = useId();
  const m = value ? ctx.media[value] : null;
  return (
    <div className="a-field" role="group" aria-labelledby={`${id}-l`}>
      <span className="a-label" id={`${id}-l`}>
        {field.label}
      </span>
      <div className="a-image">
        <div className="a-image__thumb">
          {m ? <img src={previewSrc(m, 480)} alt="" /> : <Icon name="image" size={28} />}
        </div>
        <div className="a-image__meta">
          <span className="a-muted">
            {m ? `${mediaName(m, ctx.credits)} · ${m.width}×${m.height}` : value ? 'الصورة الافتراضية' : 'لم تُختر صورة'}
          </span>
          <div className="a-row">
            <button
              type="button"
              className="a-btn a-btn--ghost"
              onClick={async () => {
                const picked = await ctx.pickImage(value);
                if (picked) onChange(picked);
              }}
            >
              <Icon name="image" size={18} />
              {m ? 'تغيير الصورة' : 'اختيار صورة'}
            </button>
            {field.optional && value && (
              <button type="button" className="a-btn a-btn--text" onClick={() => onChange('')}>
                إزالة
              </button>
            )}
          </div>
        </div>
      </div>
      <Help text={field.help} />
    </div>
  );
}

/** موضع العنصر الرئيسي أفقياً (0 يسار الصورة، 1 يمينها). */
function FocusField({ field, value, onChange, parent, ctx }) {
  const id = useId();
  const m = ctx.media[parent?.[field.imageKey]];
  const x = typeof value === 'number' ? value : 0.5;
  const set = (n) => onChange(Math.round(Math.min(1, Math.max(0, n)) * 100) / 100);
  return (
    <div className="a-field" dir="ltr">
      <span className="a-label" id={`${id}-l`} dir="rtl">
        {field.label}
      </span>
      {m ? (
        <button
          type="button"
          className="a-focus"
          aria-labelledby={`${id}-l`}
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            set((e.clientX - r.left) / r.width);
          }}
        >
          <img src={previewSrc(m, 800)} alt="" />
          <span className="a-focus__line" style={{ left: `${x * 100}%` }} aria-hidden="true" />
        </button>
      ) : (
        <p className="a-muted" dir="rtl">
          اختر الصورة أولاً.
        </p>
      )}
      <input
        type="range"
        className="a-range"
        min="0"
        max="100"
        value={Math.round(x * 100)}
        aria-labelledby={`${id}-l`}
        onChange={(e) => set(Number(e.target.value) / 100)}
      />
      <div dir="rtl">
        <Help text={field.help} />
      </div>
    </div>
  );
}

/* ---------- قوائم العناصر ---------- */
function ListEditor({ field, value, onChange, ctx }) {
  const items = Array.isArray(value) ? value : [];
  const keyOf = (item, i) => item?.id ?? `i${i}`;
  const [open, setOpen] = useState(() => new Set());
  const [confirmKey, setConfirmKey] = useState(null);

  const toggle = (key) =>
    setOpen((set) => {
      const next = new Set(set);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const update = (i, next) => onChange(items.map((it, j) => (j === i ? next : it)));
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const copy = [...items];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
  };
  const add = () => {
    const item = field.newItem();
    onChange([...items, item]);
    setOpen((set) => new Set(set).add(keyOf(item, items.length)));
  };

  return (
    <div className="a-field a-list">
      <div className="a-list__head">
        <h3 className="a-label">{field.label}</h3>
        <span className="a-muted">
          {items.filter((it) => it?.visible !== false).length} ظاهر من {items.length}
        </span>
      </div>
      <Help text={field.help} />
      <ol className="a-list__items">
        {items.map((item, i) => {
          const key = keyOf(item, i);
          const isOpen = open.has(key);
          const hidden = item?.visible === false;
          const thumb = field.itemImage ? ctx.media[field.itemImage(item)] : null;
          const title = field.itemLabel?.(item, i) || `عنصر ${i + 1}`;
          return (
            <li key={key} className={`a-item${hidden ? ' is-hidden' : ''}`}>
              <div className="a-item__bar">
                <button type="button" className="a-item__toggle" aria-expanded={isOpen} onClick={() => toggle(key)}>
                  <span className="a-item__num">{i + 1}</span>
                  {thumb && <img className="a-item__thumb" src={previewSrc(thumb, 480)} alt="" />}
                  {field.itemIcon && (
                    <span className="a-item__icon">
                      <Icon name={field.itemIcon(item)} size={20} />
                    </span>
                  )}
                  <span className="a-item__title">{title}</span>
                  {hidden && <span className="a-tag">مخفي</span>}
                  <Icon name={isOpen ? 'up' : 'down'} size={18} />
                </button>
                <div className="a-item__tools">
                  {field.visibleToggle && (
                    <button
                      type="button"
                      className="a-icon-btn"
                      aria-pressed={!hidden}
                      aria-label={`${hidden ? 'إظهار' : 'إخفاء'}: ${title}`}
                      title={hidden ? 'إظهار في الموقع' : 'إخفاء من الموقع'}
                      onClick={() => update(i, { ...item, visible: hidden })}
                    >
                      <Icon name={hidden ? 'eyeOff' : 'eye'} size={18} />
                    </button>
                  )}
                  {!field.noReorder && (
                    <>
                      <button type="button" className="a-icon-btn" disabled={i === 0} aria-label={`نقل للأعلى: ${title}`} onClick={() => move(i, -1)}>
                        <Icon name="up" size={18} />
                      </button>
                      <button
                        type="button"
                        className="a-icon-btn"
                        disabled={i === items.length - 1}
                        aria-label={`نقل للأسفل: ${title}`}
                        onClick={() => move(i, 1)}
                      >
                        <Icon name="down" size={18} />
                      </button>
                    </>
                  )}
                  {!field.fixed && (
                    <button type="button" className="a-icon-btn a-icon-btn--danger" aria-label={`حذف: ${title}`} onClick={() => setConfirmKey(key)}>
                      <Icon name="trash" size={18} />
                    </button>
                  )}
                </div>
              </div>
              {confirmKey === key && (
                <div className="a-confirm" role="alert">
                  <span>حذف «{title}»؟ يمكنك التراجع بـ«تجاهل التغييرات» قبل الحفظ.</span>
                  <button
                    type="button"
                    className="a-btn a-btn--danger"
                    onClick={() => {
                      onChange(items.filter((_, j) => j !== i));
                      setConfirmKey(null);
                    }}
                  >
                    حذف
                  </button>
                  <button type="button" className="a-btn a-btn--text" onClick={() => setConfirmKey(null)}>
                    إلغاء
                  </button>
                </div>
              )}
              {isOpen && (
                <div className="a-item__body">
                  {field.fields.map((f) => (
                    <Field
                      key={f.key}
                      field={f}
                      value={item?.[f.key]}
                      parent={item}
                      ctx={ctx}
                      onChange={(v) => update(i, { ...item, [f.key]: v })}
                    />
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {!field.fixed && (
        <button type="button" className="a-btn a-btn--ghost a-list__add" onClick={add}>
          <Icon name="plus" size={18} />
          إضافة
        </button>
      )}
    </div>
  );
}

/* ---------- الموزّع ---------- */
export function Field({ field, value, onChange, parent, ctx }) {
  const id = useId();
  const described = field.help ? `${id}-h` : undefined;

  switch (field.type) {
    case 'i18n':
      return <I18nInput field={field} value={value} onChange={onChange} />;
    case 'i18nList':
      return <I18nListField field={field} value={value} onChange={onChange} />;
    case 'textList':
      return (
        <div className="a-field">
          <label className="a-label" htmlFor={id}>
            {field.label}
          </label>
          <LinesInput value={value} dir={field.dir} describedBy={described} onChange={onChange} label={field.label} />
          <Help id={described} text={field.help} />
        </div>
      );
    case 'text':
      return (
        <div className="a-field">
          <label className="a-label" htmlFor={id}>
            {field.label}
          </label>
          <input
            id={id}
            className="a-input"
            type={field.inputType || 'text'}
            dir={field.dir}
            placeholder={field.placeholder}
            aria-describedby={described}
            value={value ?? ''}
            onChange={(e) => onChange(field.nullable && e.target.value.trim() === '' ? null : e.target.value)}
          />
          <Help id={described} text={field.help} />
        </div>
      );
    case 'number': {
      const scale = field.scale || 1;
      return (
        <div className="a-field a-field--narrow">
          <label className="a-label" htmlFor={id}>
            {field.label}
          </label>
          <input
            id={id}
            className="a-input"
            type="number"
            dir="ltr"
            min={field.min}
            max={field.max}
            step={field.step || 1}
            aria-describedby={described}
            value={value == null ? '' : value / scale}
            onChange={(e) => e.target.value !== '' && onChange(Math.round(Number(e.target.value) * scale))}
          />
          <Help id={described} text={field.help} />
        </div>
      );
    }
    case 'bool':
      return (
        <div className="a-field">
          <Switch checked={value ?? field.default ?? false} label={field.label} describedBy={described} onChange={onChange} />
          <Help id={described} text={field.help} />
        </div>
      );
    case 'select':
      return (
        <div className="a-field a-field--narrow">
          <label className="a-label" htmlFor={id}>
            {field.label}
          </label>
          <div className="a-row">
            {field.preview === 'icon' && value && (
              <span className="a-item__icon">
                <Icon name={value} size={22} />
              </span>
            )}
            <select id={id} className="a-input" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
              {field.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <Help id={described} text={field.help} />
        </div>
      );
    case 'image':
      return <ImageField field={field} value={value} onChange={onChange} ctx={ctx} />;
    case 'focus':
      return <FocusField field={field} value={value} onChange={onChange} parent={parent} ctx={ctx} />;
    case 'group':
      return (
        <fieldset className="a-group">
          <legend className="a-group__title">{field.label}</legend>
          <Help id={described} text={field.help} />
          {field.fields.map((f) => (
            <Field
              key={f.key}
              field={f}
              value={value?.[f.key]}
              parent={value}
              ctx={ctx}
              onChange={(v) => onChange({ ...(value || {}), [f.key]: v })}
            />
          ))}
        </fieldset>
      );
    case 'list':
      return <ListEditor field={field} value={value} onChange={onChange} ctx={ctx} />;
    default:
      return null;
  }
}
