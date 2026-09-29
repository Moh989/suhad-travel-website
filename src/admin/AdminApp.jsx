import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from '../ui/Icon.jsx';
import { api } from './api.js';
import { Field } from './fields.jsx';
import { MediaPage, MediaPicker } from './media.jsx';
import { AccountPage, AuthScreen, BackupsPage, LayoutPage } from './pages.jsx';
import { PAGES } from './schema.js';
import { IS_DEMO, SITE_URL, assetUrl, errorText, getIn, setIn } from './util.js';

// الرابط إلى القسم المقابل في الموقع لكل صفحة من صفحات اللوحة
const SITE_ANCHOR = { hero: 'home', about: 'about', services: 'services', destinations: 'destinations', cta: 'plan', planner: 'plan', footer: 'contact', settings: 'contact' };

export default function AdminApp() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.status().then(setStatus).catch((e) => setError(errorText(e)));
  }, []);

  if (error) {
    return (
      <main className="a-auth">
        <div className="a-auth__card">
          <p className="a-inline-msg a-inline-msg--error" role="alert">
            {error}
          </p>
          <p className="a-help">
            لوحة التحكم تحتاج خادماً يدعم PHP. إن كنت تعمل محلياً شغّل <code dir="ltr">npm run serve</code>.
          </p>
        </div>
      </main>
    );
  }
  if (!status) return <p className="a-loading">جارٍ التحميل…</p>;
  if (!status.user) {
    return <AuthScreen configured={status.configured} onSignedIn={(user) => setStatus((s) => ({ ...s, configured: true, user }))} />;
  }
  return <Editor user={status.user} onSignedOut={() => setStatus((s) => ({ ...s, user: null }))} />;
}

function Editor({ user, onSignedOut }) {
  const [draft, setDraft] = useState(null);
  const [saved, setSaved] = useState('');
  const [version, setVersion] = useState(null);
  const [media, setMedia] = useState({ items: [], credits: {} });
  const [page, setPage] = useState(() => PAGES.find((p) => p.id === window.location.hash.slice(1))?.id || 'layout');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [picker, setPicker] = useState(null);

  const dirty = draft !== null && JSON.stringify(draft) !== saved;
  const notify = useCallback((text) => setNotice({ type: 'success', text }), []);

  const handleError = useCallback(
    (e) => {
      if (e?.code === 'unauthorized') onSignedOut();
      setNotice({ type: 'error', text: errorText(e), conflict: e?.code === 'conflict' });
    },
    [onSignedOut],
  );

  const loadContent = useCallback(async () => {
    const d = await api.getContent();
    setDraft(d.content);
    setSaved(JSON.stringify(d.content));
    setVersion(d.version);
  }, []);

  const loadMedia = useCallback(async () => {
    const d = await api.listMedia();
    setMedia({ items: d.items, credits: d.credits || {} });
  }, []);

  useEffect(() => {
    Promise.all([loadContent(), loadMedia()]).catch(handleError);
  }, [loadContent, loadMedia, handleError]);

  // تنبيه قبل مغادرة الصفحة مع تغييرات غير محفوظة
  useEffect(() => {
    const warn = (e) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  useEffect(() => {
    try {
      window.history.replaceState(null, '', `#${page}`);
    } catch {
      /* تجاهل */
    }
    window.scrollTo(0, 0);
    document.getElementById('a-main')?.focus({ preventScroll: true });
    // التنبيهات تخص الصفحة التي ظهرت فيها
    setNotice((n) => (n?.conflict ? n : null));
  }, [page]);

  const change = useCallback((path, value) => setDraft((d) => setIn(d, path, value)), []);

  const save = useCallback(async () => {
    if (!dirty || saving) return;
    setSaving(true);
    try {
      const result = await api.saveContent(draft, version);
      setVersion(result.version);
      setSaved(JSON.stringify(draft));
      const time = new Intl.DateTimeFormat('ar-u-nu-latn', { timeStyle: 'short' }).format(new Date());
      notify(`حُفظت التغييرات الساعة ${time}، وتظهر في الموقع الآن.`);
      loadMedia();
    } catch (e) {
      handleError(e);
    } finally {
      setSaving(false);
    }
  }, [dirty, saving, draft, version, notify, loadMedia, handleError]);

  // Ctrl/⌘ + S للحفظ
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save]);

  const mediaById = useMemo(() => Object.fromEntries(media.items.map((m) => [m.id, m])), [media]);
  const ctx = useMemo(
    () => ({
      media: mediaById,
      credits: media.credits,
      pickImage: (current) => new Promise((resolve) => setPicker({ current, resolve })),
      goTo: setPage,
    }),
    [mediaById, media.credits],
  );

  const current = PAGES.find((p) => p.id === page) ?? PAGES[0];
  const anchor = SITE_ANCHOR[current.id];

  let body = null;
  if (!draft) body = <p className="a-muted">جارٍ تحميل المحتوى…</p>;
  else if (current.custom === 'layout') body = <LayoutPage draft={draft} onChange={change} goTo={setPage} />;
  else if (current.custom === 'media')
    body = <MediaPage media={media} reloadMedia={loadMedia} notify={notify} onError={handleError} />;
  else if (current.custom === 'backups')
    body = (
      <BackupsPage
        dirty={dirty}
        onError={handleError}
        onRestored={async (text) => {
          await loadContent();
          notify(text);
        }}
      />
    );
  else if (current.custom === 'account')
    body = <AccountPage user={user} demo={IS_DEMO} onSignedOut={onSignedOut} notify={notify} onError={handleError} />;
  else
    body = (
      <div className="a-card a-form">
        {current.fields.map((f) => (
          <Field
            key={f.key}
            field={f}
            value={getIn(draft, [...current.path, f.key])}
            parent={getIn(draft, current.path)}
            ctx={ctx}
            onChange={(v) => change([...current.path, f.key], v)}
          />
        ))}
      </div>
    );

  return (
    <div className="a-app">
      <header className="a-top">
        <a className="a-top__brand" href={SITE_URL} target="_blank" rel="noopener">
          <img src={assetUrl('brand/suhad-logo-320.png')} alt="السهاد" />
          <span>لوحة التحكم</span>
        </a>
        <p className={`a-top__status${dirty ? ' is-dirty' : ''}`} role="status">
          {saving ? 'جارٍ الحفظ…' : dirty ? 'تغييرات غير محفوظة' : 'كل التغييرات محفوظة'}
        </p>
        <div className="a-top__actions">
          <a className="a-btn a-btn--text" href={SITE_URL} target="_blank" rel="noopener">
            <Icon name="external" size={18} />
            <span className="a-hide-sm">عرض الموقع</span>
          </a>
          {dirty && (
            <button type="button" className="a-btn a-btn--text" onClick={() => setDraft(JSON.parse(saved))}>
              <Icon name="undo" size={18} />
              <span className="a-hide-sm">تجاهل التغييرات</span>
            </button>
          )}
          <button type="button" className="a-btn a-btn--primary" disabled={!dirty || saving} onClick={save}>
            <Icon name="save" size={18} />
            حفظ التغييرات
          </button>
        </div>
      </header>

      {IS_DEMO && (
        <p className="a-demo-banner">
          وضع المعاينة: التغييرات تُحفظ في متصفحك فقط لتجربة اللوحة. على الخادم الحقيقي تُحفظ للجميع وتتطلب تسجيل الدخول.
        </p>
      )}

      <nav className="a-side" aria-label="أقسام لوحة التحكم">
        <ul role="list">
          {PAGES.map((p) => (
            <li key={p.id}>
              <button type="button" aria-current={p.id === page ? 'page' : undefined} onClick={() => setPage(p.id)}>
                <Icon name={p.icon} size={18} />
                {p.title}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <main id="a-main" className="a-main" tabIndex={-1}>
        <div className="a-page-head">
          <div>
            <h1>{current.title}</h1>
            {current.intro && <p className="a-help">{current.intro}</p>}
          </div>
          {anchor && (
            <a className="a-btn a-btn--text" href={`${SITE_URL}#${anchor}`} target="_blank" rel="noopener">
              مشاهدة في الموقع
              <Icon name="external" size={16} />
            </a>
          )}
        </div>

        {notice && (
          <div className={`a-notice a-notice--${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>
            <span>{notice.text}</span>
            {notice.conflict && (
              <button
                type="button"
                className="a-btn a-btn--ghost"
                onClick={() => loadContent().then(() => setNotice(null), handleError)}
              >
                تحميل النسخة الأحدث
              </button>
            )}
            <button type="button" className="a-icon-btn" aria-label="إغلاق التنبيه" onClick={() => setNotice(null)}>
              <Icon name="close" size={18} />
            </button>
          </div>
        )}

        {body}
      </main>

      {picker && (
        <MediaPicker
          media={media}
          current={picker.current}
          reloadMedia={loadMedia}
          onClose={(id) => {
            picker.resolve(id);
            setPicker(null);
          }}
        />
      )}
    </div>
  );
}
