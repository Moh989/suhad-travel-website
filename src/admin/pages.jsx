import React, { useEffect, useState } from 'react';
import Icon from '../ui/Icon.jsx';
import { api } from './api.js';
import { Switch } from './fields.jsx';
import { FEATURES, SECTION_LABELS, SECTION_PAGE } from './schema.js';
import { assetUrl, errorText, formatDate } from './util.js';

/* ---------- الدخول وإنشاء الحساب الأول ---------- */
export function AuthScreen({ configured, onSignedIn }) {
  const [form, setForm] = useState({ setupKey: '', username: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const isSetup = !configured;

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (isSetup && form.password !== form.confirm) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }
    setBusy(true);
    try {
      const result = isSetup
        ? await api.setup({ setupKey: form.setupKey.trim(), username: form.username.trim(), password: form.password })
        : await api.login({ username: form.username.trim(), password: form.password });
      onSignedIn(result.user);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="a-auth">
      <form className="a-auth__card" onSubmit={submit} noValidate>
        <img className="a-auth__logo" src={assetUrl('brand/suhad-logo-320.png')} alt="السهاد للسفر والسياحة المحدودة" />
        <h1>{isSetup ? 'إنشاء حساب المدير' : 'الدخول إلى لوحة التحكم'}</h1>
        {isSetup && (
          <p className="a-help">
            خطوة لمرة واحدة. مفتاح الإعداد موجود في الملف api/_config.php على الخادم، ويتوقف العمل به بعد إنشاء الحساب.
          </p>
        )}
        {isSetup && (
          <label className="a-field">
            <span className="a-label">مفتاح الإعداد</span>
            <input className="a-input" dir="ltr" autoComplete="off" value={form.setupKey} onChange={set('setupKey')} required />
          </label>
        )}
        <label className="a-field">
          <span className="a-label">اسم المستخدم</span>
          <input className="a-input" dir="ltr" autoComplete="username" value={form.username} onChange={set('username')} required />
        </label>
        <label className="a-field">
          <span className="a-label">كلمة المرور</span>
          <input
            className="a-input"
            dir="ltr"
            type="password"
            autoComplete={isSetup ? 'new-password' : 'current-password'}
            value={form.password}
            onChange={set('password')}
            required
          />
          {isSetup && <span className="a-help">10 أحرف على الأقل.</span>}
        </label>
        {isSetup && (
          <label className="a-field">
            <span className="a-label">تأكيد كلمة المرور</span>
            <input className="a-input" dir="ltr" type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} required />
          </label>
        )}
        {error && (
          <p className="a-inline-msg a-inline-msg--error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="a-btn a-btn--primary a-btn--block" disabled={busy}>
          {busy ? 'لحظة…' : isSetup ? 'إنشاء الحساب والدخول' : 'دخول'}
        </button>
      </form>
    </main>
  );
}

/* ---------- الأقسام وأماكن الظهور ---------- */
export function LayoutPage({ draft, onChange, goTo }) {
  const sections = draft.layout?.sections ?? [];
  const features = draft.features ?? {};
  const setSections = (next) => onChange(['layout', 'sections'], next);
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= sections.length) return;
    const copy = [...sections];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    setSections(copy);
  };
  const count = (items) => `${(items || []).filter((x) => x.visible !== false).length} ظاهر من ${(items || []).length}`;

  return (
    <>
      <section className="a-card">
        <h2 className="a-card__title">ترتيب أقسام الصفحة</h2>
        <p className="a-help">هذا مخطط الصفحة من الأعلى إلى الأسفل. غيّر الترتيب بالأسهم، وأخفِ أي قسم بالمفتاح.</p>
        <ol className="a-pagemap" role="list">
          <li className="a-pagemap__fixed">
            <Icon name="home" size={18} />
            <span>الترويسة والواجهة</span>
            <span className="a-muted">أعلى الصفحة دائماً</span>
          </li>
          {sections.map((s, i) => {
            const label = SECTION_LABELS[s.id] || s.id;
            const locked = s.id === 'plan';
            return (
              <li key={s.id} className={`a-pagemap__item${s.visible === false ? ' is-hidden' : ''}`}>
                <span className="a-pagemap__num">{i + 1}</span>
                <span className="a-pagemap__name">{label}</span>
                {locked ? (
                  <span className="a-muted">يبقى ظاهراً (الإجراء الرئيسي)</span>
                ) : (
                  <Switch
                    checked={s.visible !== false}
                    label={s.visible === false ? 'مخفي' : 'ظاهر'}
                    onChange={(v) => setSections(sections.map((x) => (x.id === s.id ? { ...x, visible: v } : x)))}
                  />
                )}
                <span className="a-pagemap__tools">
                  <button type="button" className="a-icon-btn" disabled={i === 0} aria-label={`نقل للأعلى: ${label}`} onClick={() => move(i, -1)}>
                    <Icon name="up" size={18} />
                  </button>
                  <button
                    type="button"
                    className="a-icon-btn"
                    disabled={i === sections.length - 1}
                    aria-label={`نقل للأسفل: ${label}`}
                    onClick={() => move(i, 1)}
                  >
                    <Icon name="down" size={18} />
                  </button>
                  <button type="button" className="a-btn a-btn--text" onClick={() => goTo(SECTION_PAGE[s.id])}>
                    تعديل المحتوى
                  </button>
                </span>
              </li>
            );
          })}
          <li className="a-pagemap__fixed">
            <Icon name="mail" size={18} />
            <span>التذييل وبيانات التواصل</span>
            <span className="a-muted">أسفل الصفحة دائماً</span>
          </li>
        </ol>
      </section>

      <section className="a-card">
        <h2 className="a-card__title">ظهور العناصر داخل الأقسام</h2>
        <p className="a-help">كل عنصر له زر إظهار/إخفاء (رمز العين) وأسهم ترتيب داخل صفحته.</p>
        <ul className="a-summary" role="list">
          <li>
            <span>صور العرض المتحرك</span>
            <span className="a-muted">{count(draft.hero?.slides)}</span>
            <button type="button" className="a-btn a-btn--text" onClick={() => goTo('hero')}>
              إدارة
            </button>
          </li>
          <li>
            <span>الخدمات</span>
            <span className="a-muted">{count(draft.services?.items)}</span>
            <button type="button" className="a-btn a-btn--text" onClick={() => goTo('services')}>
              إدارة
            </button>
          </li>
          <li>
            <span>الوجهات</span>
            <span className="a-muted">{count(draft.destinations?.items)}</span>
            <button type="button" className="a-btn a-btn--text" onClick={() => goTo('destinations')}>
              إدارة
            </button>
          </li>
          <li>
            <span>روابط القائمة</span>
            <span className="a-muted">{count(draft.nav)}</span>
            <button type="button" className="a-btn a-btn--text" onClick={() => goTo('texts')}>
              إدارة
            </button>
          </li>
        </ul>
      </section>

      <section className="a-card">
        <h2 className="a-card__title">عناصر الموقع</h2>
        <ul className="a-features" role="list">
          {FEATURES.map((f) => (
            <li key={f.key}>
              <Switch checked={features[f.key] !== false} label={f.label} onChange={(v) => onChange(['features', f.key], v)} />
              {f.help && <p className="a-help">{f.help}</p>}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

/* ---------- النسخ السابقة ---------- */
export function BackupsPage({ onRestored, onError, dirty }) {
  const [items, setItems] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const load = () =>
    api
      .listBackups()
      .then((d) => setItems(d.items))
      .catch(onError);
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function restore(name) {
    try {
      await api.restoreBackup(name);
      setConfirm(null);
      await onRestored(name === 'defaults' ? 'عاد المحتوى إلى نسخته الأصلية.' : 'استُعيدت النسخة المختارة.');
      load();
    } catch (e) {
      onError(e);
    }
  }

  const row = (name, title, meta) => (
    <li key={name}>
      <span>
        <strong>{title}</strong>
        {meta && <span className="a-muted"> {meta}</span>}
      </span>
      {confirm === name ? (
        <span className="a-confirm" role="alert">
          <span>استعادة هذه النسخة؟ تُحفظ الحالية نسخةً احتياطية أولاً.</span>
          <button type="button" className="a-btn a-btn--primary" onClick={() => restore(name)}>
            استعادة
          </button>
          <button type="button" className="a-btn a-btn--text" onClick={() => setConfirm(null)}>
            إلغاء
          </button>
        </span>
      ) : (
        <button type="button" className="a-btn a-btn--ghost" onClick={() => setConfirm(name)}>
          <Icon name="undo" size={18} />
          استعادة
        </button>
      )}
    </li>
  );

  return (
    <section className="a-card">
      <h2 className="a-card__title">النسخ السابقة من المحتوى</h2>
      <p className="a-help">تُحفظ نسخة تلقائياً قبل كل حفظ (آخر 30 نسخة). الصور لا تتأثر بالاستعادة.</p>
      {dirty && <p className="a-inline-msg a-inline-msg--warn">لديك تغييرات غير محفوظة ستُستبدل عند الاستعادة.</p>}
      {!items ? (
        <p className="a-muted">جارٍ التحميل…</p>
      ) : (
        <ul className="a-backups" role="list">
          {items.map((b) => row(b.name, formatDate(b.savedAt), null))}
          {!items.length && <li className="a-muted">لا توجد نسخ بعد؛ تُنشأ عند أول حفظ.</li>}
          {row('defaults', 'المحتوى الأصلي للموقع', '(كما سُلّم أول مرة)')}
        </ul>
      )}
    </section>
  );
}

/* ---------- الحساب ---------- */
export function AccountPage({ user, onSignedOut, notify, onError, demo }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <>
      <section className="a-card">
        <h2 className="a-card__title">تغيير كلمة المرور</h2>
        {demo ? (
          <p className="a-help">في وضع المعاينة لا توجد حسابات. على الخادم الحقيقي تغيّر كلمة المرور من هنا.</p>
        ) : (
          <form
            className="a-form-narrow"
            onSubmit={async (e) => {
              e.preventDefault();
              setError('');
              if (form.next !== form.confirm) return setError('كلمتا المرور الجديدتان غير متطابقتين.');
              try {
                await api.changePassword({ current: form.current, next: form.next });
                setForm({ current: '', next: '', confirm: '' });
                notify('تغيّرت كلمة المرور.');
              } catch (err) {
                setError(errorText(err));
              }
            }}
          >
            <input type="text" autoComplete="username" value={user} readOnly hidden />
            <label className="a-field">
              <span className="a-label">كلمة المرور الحالية</span>
              <input className="a-input" dir="ltr" type="password" autoComplete="current-password" value={form.current} onChange={set('current')} />
            </label>
            <label className="a-field">
              <span className="a-label">كلمة المرور الجديدة</span>
              <input className="a-input" dir="ltr" type="password" autoComplete="new-password" value={form.next} onChange={set('next')} />
              <span className="a-help">10 أحرف على الأقل.</span>
            </label>
            <label className="a-field">
              <span className="a-label">تأكيد كلمة المرور الجديدة</span>
              <input className="a-input" dir="ltr" type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} />
            </label>
            {error && (
              <p className="a-inline-msg a-inline-msg--error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="a-btn a-btn--primary">
              تغيير كلمة المرور
            </button>
          </form>
        )}
      </section>
      <section className="a-card">
        <h2 className="a-card__title">الجلسة</h2>
        <p className="a-help">
          مسجّل باسم <bdi dir="ltr">{user}</bdi>. تنتهي الجلسة تلقائياً بعد ساعتين دون نشاط.
        </p>
        <button
          type="button"
          className="a-btn a-btn--ghost"
          onClick={async () => {
            try {
              await api.logout();
              onSignedOut();
            } catch (e) {
              onError(e);
            }
          }}
        >
          <Icon name="logout" size={18} />
          تسجيل الخروج
        </button>
      </section>
    </>
  );
}
