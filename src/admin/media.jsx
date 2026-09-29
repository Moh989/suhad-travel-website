import React, { useEffect, useRef, useState } from 'react';
import Icon from '../ui/Icon.jsx';
import { api } from './api.js';
import { errorText, i18nText, mediaName, previewSrc } from './util.js';

/* ---------- الرفع ---------- */
export function Uploader({ onUploaded, compact = false }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [drag, setDrag] = useState(false);

  async function upload(files) {
    const list = [...files].filter(Boolean);
    if (!list.length) return;
    setBusy(true);
    setMessage(null);
    const done = [];
    for (const file of list) {
      try {
        const { item } = await api.upload(file);
        done.push(item);
      } catch (e) {
        setMessage({ type: 'error', text: `${file.name}: ${errorText(e)}` });
      }
    }
    setBusy(false);
    if (done.length) {
      setMessage((m) => m ?? { type: 'success', text: done.length === 1 ? 'رُفعت الصورة.' : `رُفعت ${done.length} صور.` });
      onUploaded?.(done);
    }
    if (input.current) input.current.value = '';
  }

  return (
    <div
      className={`a-upload${drag ? ' is-drag' : ''}${compact ? ' a-upload--compact' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        upload(e.dataTransfer.files);
      }}
    >
      <Icon name="upload" size={22} />
      <div>
        <p className="a-upload__title">{busy ? 'جارٍ الرفع والمعالجة…' : 'اسحب الصور هنا أو اخترها من جهازك'}</p>
        <p className="a-help">JPG أو PNG أو WebP، حتى 12 ميغابايت. تُنشأ منها مقاسات مناسبة لكل شاشة تلقائياً.</p>
      </div>
      <label className="a-btn a-btn--ghost">
        اختيار صور
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="visually-hidden"
          disabled={busy}
          onChange={(e) => upload(e.target.files)}
        />
      </label>
      {message && (
        <p className={`a-inline-msg a-inline-msg--${message.type}`} role="status">
          {message.text}
        </p>
      )}
    </div>
  );
}

/* ---------- الشبكة ---------- */
function MediaGrid({ items, credits, selected, onSelect, onConfirm }) {
  return (
    <ul className="a-media-grid" role="list">
      {items.map((m) => (
        <li key={m.id}>
          <button
            type="button"
            className={`a-media${selected === m.id ? ' is-selected' : ''}`}
            aria-pressed={selected === m.id}
            onClick={() => onSelect(m.id)}
            onDoubleClick={() => onConfirm?.(m.id)}
          >
            <img src={previewSrc(m, 480)} alt="" loading="lazy" />
            <span className="a-media__name">{mediaName(m, credits)}</span>
            <span className="a-media__tags">
              {m.uploaded ? <span className="a-tag">مرفوعة</span> : <span className="a-tag a-tag--soft">من التصميم</span>}
              {m.inUse && <span className="a-tag a-tag--ok">مستخدمة</span>}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ---------- نقطة التركيز ---------- */
const parsePos = (pos) => {
  const [x, y] = String(pos || '50% 50%').split(' ').map((v) => parseFloat(v));
  return { x: Number.isFinite(x) ? x : 50, y: Number.isFinite(y) ? y : 50 };
};

function FocalEditor({ item, onSaved, onError }) {
  const [pos, setPos] = useState(parsePos(item.position));
  const [saving, setSaving] = useState(false);
  useEffect(() => setPos(parsePos(item.position)), [item.id, item.position]);
  const value = `${Math.round(pos.x)}% ${Math.round(pos.y)}%`;
  const changed = value !== `${Math.round(parsePos(item.position).x)}% ${Math.round(parsePos(item.position).y)}%`;

  return (
    <div className="a-focal">
      <p className="a-label">نقطة التركيز عند القص</p>
      <p className="a-help">
        اضغط على أهم جزء في الصورة. يبقى ظاهراً مهما تغيّر شكل الإطار (هاتف، بطاقة، شاشة عريضة).
      </p>
      <button
        type="button"
        className="a-focal__stage"
        dir="ltr"
        aria-label="تحديد نقطة التركيز"
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
      >
        <img src={previewSrc(item, 1200)} alt="" />
        <span className="a-focal__dot" style={{ left: `${pos.x}%`, top: `${pos.y}%` }} aria-hidden="true" />
      </button>
      <div className="a-focal__previews" aria-label="معاينة القص">
        {[
          ['16 / 9', 'عريض'],
          ['4 / 5', 'بطاقة'],
          ['1 / 1', 'مربع'],
        ].map(([ratio, name]) => (
          <figure key={ratio}>
            <img src={previewSrc(item, 480)} alt="" style={{ aspectRatio: ratio, objectPosition: value }} />
            <figcaption>{name}</figcaption>
          </figure>
        ))}
      </div>
      <div className="a-row">
        <span className="a-muted" dir="ltr">
          {value}
        </span>
        <button
          type="button"
          className="a-btn a-btn--primary"
          disabled={!changed || saving}
          onClick={async () => {
            setSaving(true);
            try {
              await api.updateMedia(item.id, { position: value });
              onSaved('حُفظت نقطة التركيز وتظهر في الموقع الآن.');
            } catch (e) {
              onError(e);
            } finally {
              setSaving(false);
            }
          }}
        >
          حفظ نقطة التركيز
        </button>
      </div>
    </div>
  );
}

function CreditEditor({ item, credits, onSaved, onError }) {
  const initial = typeof item.credit === 'object' && item.credit ? item.credit : {};
  const [credit, setCredit] = useState(initial);
  useEffect(() => setCredit(typeof item.credit === 'object' && item.credit ? item.credit : {}), [item.id, item.credit]);

  if (!item.uploaded) {
    const c = typeof item.credit === 'string' ? credits[item.credit] : null;
    return c ? (
      <div className="a-credit">
        <p className="a-label">المصدر والترخيص</p>
        <p className="a-muted">
          {i18nText(c.subject)} · {c.author} · {i18nText(c.license)}
        </p>
      </div>
    ) : null;
  }

  const set = (key, v) => setCredit((c) => ({ ...c, [key]: v }));
  const subject = typeof credit.subject === 'object' ? credit.subject : { ar: credit.subject || '', en: '' };
  return (
    <form
      className="a-credit"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await api.updateMedia(item.id, { credit: { ...credit, subject } });
          onSaved('حُفظ مصدر الصورة.');
        } catch (err) {
          onError(err);
        }
      }}
    >
      <p className="a-label">المصدر والترخيص (يظهر في «مصادر الصور» أسفل الموقع)</p>
      <p className="a-help">اتركها فارغة إن كانت الصورة ملكاً للشركة.</p>
      <div className="a-credit__grid">
        <label>
          <span>الموضوع بالعربية</span>
          <input className="a-input" value={subject.ar || ''} onChange={(e) => set('subject', { ...subject, ar: e.target.value })} />
        </label>
        <label>
          <span>الموضوع بالإنجليزية</span>
          <input className="a-input" dir="ltr" value={subject.en || ''} onChange={(e) => set('subject', { ...subject, en: e.target.value })} />
        </label>
        <label>
          <span>المصوّر</span>
          <input className="a-input" dir="auto" value={credit.author || ''} onChange={(e) => set('author', e.target.value)} />
        </label>
        <label>
          <span>الترخيص</span>
          <input className="a-input" dir="ltr" placeholder="CC BY 4.0" value={credit.license || ''} onChange={(e) => set('license', e.target.value)} />
        </label>
        <label>
          <span>رابط الترخيص</span>
          <input className="a-input" dir="ltr" type="url" placeholder="https://" value={credit.licenseUrl || ''} onChange={(e) => set('licenseUrl', e.target.value)} />
        </label>
        <label>
          <span>رابط المصدر</span>
          <input className="a-input" dir="ltr" type="url" placeholder="https://" value={credit.source || ''} onChange={(e) => set('source', e.target.value)} />
        </label>
      </div>
      <button type="submit" className="a-btn a-btn--ghost">
        حفظ المصدر
      </button>
    </form>
  );
}

/* ---------- صفحة المكتبة ---------- */
export function MediaPage({ media, reloadMedia, notify, onError }) {
  const [selected, setSelected] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const item = media.items.find((m) => m.id === selected);
  useEffect(() => setConfirmDelete(false), [selected]);

  return (
    <>
      <section className="a-card">
        <Uploader
          onUploaded={(items) => {
            reloadMedia();
            setSelected(items[0].id);
          }}
        />
      </section>
      <div className="a-media-layout">
        <section className="a-card">
          <h2 className="a-card__title">كل الصور ({media.items.length})</h2>
          <MediaGrid items={media.items} credits={media.credits} selected={selected} onSelect={setSelected} />
        </section>
        <aside className="a-card a-media-detail" aria-live="polite">
          {!item ? (
            <p className="a-muted">اختر صورة لتعديل نقطة التركيز أو المصدر، أو لحذفها.</p>
          ) : (
            <>
              <h2 className="a-card__title">{mediaName(item, media.credits)}</h2>
              <p className="a-muted" dir="ltr">
                {item.width}×{item.height} · {item.id}
              </p>
              <FocalEditor item={item} onSaved={(t) => (notify(t), reloadMedia())} onError={onError} />
              <CreditEditor item={item} credits={media.credits} onSaved={(t) => (notify(t), reloadMedia())} onError={onError} />
              {item.uploaded && (
                <div className="a-danger-zone">
                  {item.inUse ? (
                    <p className="a-help">هذه الصورة مستخدمة في الموقع، لذا لا يمكن حذفها. غيّرها في مكان استخدامها أولاً.</p>
                  ) : confirmDelete ? (
                    <div className="a-confirm" role="alert">
                      <span>حذف الصورة نهائياً من الخادم؟</span>
                      <button
                        type="button"
                        className="a-btn a-btn--danger"
                        onClick={async () => {
                          try {
                            await api.deleteMedia(item.id);
                            setSelected(null);
                            notify('حُذفت الصورة.');
                            reloadMedia();
                          } catch (e) {
                            onError(e);
                          }
                        }}
                      >
                        حذف نهائي
                      </button>
                      <button type="button" className="a-btn a-btn--text" onClick={() => setConfirmDelete(false)}>
                        إلغاء
                      </button>
                    </div>
                  ) : (
                    <button type="button" className="a-btn a-btn--text a-btn--danger-text" onClick={() => setConfirmDelete(true)}>
                      <Icon name="trash" size={18} />
                      حذف الصورة
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </aside>
      </div>
    </>
  );
}

/* ---------- نافذة اختيار صورة ---------- */
export function MediaPicker({ media, current, onClose, reloadMedia }) {
  const dialog = useRef(null);
  const [selected, setSelected] = useState(current || null);

  useEffect(() => {
    const d = dialog.current;
    if (d && !d.open) d.showModal?.();
    const onCancel = (e) => {
      e.preventDefault();
      onClose(null);
    };
    d?.addEventListener('cancel', onCancel);
    return () => d?.removeEventListener('cancel', onCancel);
  }, [onClose]);

  return (
    <dialog ref={dialog} className="a-dialog" aria-labelledby="picker-title">
      <div className="a-dialog__head">
        <h2 id="picker-title">اختيار صورة</h2>
        <button type="button" className="a-icon-btn" aria-label="إغلاق" onClick={() => onClose(null)}>
          <Icon name="close" size={20} />
        </button>
      </div>
      <div className="a-dialog__body">
        <Uploader
          compact
          onUploaded={async (items) => {
            await reloadMedia();
            setSelected(items[0].id);
          }}
        />
        <MediaGrid
          items={media.items}
          credits={media.credits}
          selected={selected}
          onSelect={setSelected}
          onConfirm={(id) => onClose(id)}
        />
      </div>
      <div className="a-dialog__foot">
        <button type="button" className="a-btn a-btn--primary" disabled={!selected} onClick={() => onClose(selected)}>
          استخدام الصورة المحددة
        </button>
        <button type="button" className="a-btn a-btn--text" onClick={() => onClose(null)}>
          إلغاء
        </button>
      </div>
    </dialog>
  );
}
