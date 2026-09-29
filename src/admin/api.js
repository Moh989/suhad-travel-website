import site from '../content/site.js';
import { mergeContent } from '../content/merge.js';
import { readDemo, writeDemo } from '../lib/demoStore.js';
import { IS_DEMO } from './util.js';

export class ApiError extends Error {
  constructor(code, status = 0, data = null) {
    super(code);
    this.code = code;
    this.status = status;
    this.data = data;
  }
}

/* ---------- الخادم الحقيقي (PHP) ---------- */
function httpApi() {
  const base = new URL('../api/', window.location.href);
  let csrf = '';

  async function call(file, { method = 'GET', body, query, form } = {}) {
    const url = new URL(file, base);
    Object.entries(query || {}).forEach(([k, v]) => url.searchParams.set(k, v));
    const headers = { Accept: 'application/json' };
    if (method !== 'GET') headers['X-CSRF-Token'] = csrf;
    let payload;
    if (form) payload = form;
    else if (body) {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }
    let response;
    try {
      response = await fetch(url, { method, headers, body: payload, credentials: 'same-origin', cache: 'no-store' });
    } catch {
      throw new ApiError('network');
    }
    let data = null;
    try {
      data = await response.json();
    } catch {
      /* ليس JSON */
    }
    if (data?.csrf) csrf = data.csrf;
    if (!response.ok || data?.ok === false) throw new ApiError(data?.error || 'server', response.status, data);
    return data;
  }

  const post = (file, body) => call(file, { method: 'POST', body });

  return {
    demo: false,
    status: () => call('auth.php'),
    setup: (p) => post('auth.php', { action: 'setup', ...p }),
    login: (p) => post('auth.php', { action: 'login', ...p }),
    logout: () => post('auth.php', { action: 'logout' }),
    changePassword: (p) => post('auth.php', { action: 'password', ...p }),
    getContent: () => call('content.php', { query: { scope: 'admin' } }),
    saveContent: (content, baseVersion) => post('content.php', { content, baseVersion }),
    listMedia: () => call('media.php'),
    upload: (file) => {
      const form = new FormData();
      form.append('file', file);
      return call('media.php', { method: 'POST', form });
    },
    updateMedia: (id, patch) => post('media.php', { action: 'update', id, ...patch }),
    deleteMedia: (id) => post('media.php', { action: 'delete', id }),
    listBackups: () => call('backups.php'),
    restoreBackup: (name) => post('backups.php', { name }),
  };
}

/* ---------- المعاينة التجريبية: كل شيء في متصفح الزائر ---------- */
function demoApi() {
  const strip = ({ media, credits, ...rest }) => rest;
  const editable = () => strip(mergeContent(site, readDemo('content') ?? undefined));
  const version = () => String(readDemo('version') ?? 'defaults');
  const library = () => readDemo('media', {});
  const safeWrite = (key, value) => {
    try {
      writeDemo(key, value);
    } catch {
      throw new ApiError('storage_full');
    }
  };
  const inUse = (id) => JSON.stringify(editable()).includes(`"${id}"`);
  const ok = (extra = {}) => Promise.resolve({ ok: true, ...extra });

  function pushBackup() {
    const current = readDemo('content');
    if (!current) return;
    const backups = readDemo('backups', []);
    const stamp = new Date();
    backups.unshift({ name: `demo-${stamp.getTime()}`, savedAt: stamp.toISOString(), content: current });
    safeWrite('backups', backups.slice(0, 8));
  }

  // تصغير الصورة في المتصفح قبل حفظها (مساحة التخزين محدودة).
  function shrink(file) {
    return new Promise((resolve, reject) => {
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return reject(new ApiError('unsupported_type'));
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        if (img.naturalWidth < 200 || img.naturalHeight < 200) return reject(new ApiError('bad_dimensions'));
        const scale = Math.min(1, 1400 / img.naturalWidth);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.naturalWidth * scale);
        canvas.height = Math.round(img.naturalHeight * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve({ src: canvas.toDataURL('image/webp', 0.78), width: canvas.width, height: canvas.height });
      };
      img.onerror = () => reject(new ApiError('unsupported_type'));
      img.src = url;
    });
  }

  return {
    demo: true,
    status: () => ok({ configured: true, user: 'demo', csrf: '' }),
    setup: () => ok({ user: 'demo' }),
    login: () => ok({ user: 'demo' }),
    logout: () => ok(),
    changePassword: () => ok(),
    getContent: () => ok({ content: editable(), version: version() }),
    saveContent: async (content) => {
      pushBackup();
      safeWrite('content', content);
      const v = Date.now().toString(36);
      safeWrite('version', v);
      return { ok: true, version: v, savedAt: new Date().toISOString() };
    },
    listMedia: async () => {
      const all = mergeContent(site.media, library());
      const items = Object.entries(all).map(([id, m]) => ({ ...m, id, uploaded: !!m.uploaded, inUse: inUse(id) }));
      items.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
      return { ok: true, items, credits: site.credits };
    },
    upload: async (file) => {
      if (file.size > 12 * 1024 * 1024) throw new ApiError('too_large');
      const shrunk = await shrink(file);
      const id = `u-demo-${Date.now().toString(36)}`;
      const item = { id, uploaded: true, name: file.name.replace(/\.[^.]+$/, ''), position: '50% 50%', createdAt: new Date().toISOString(), ...shrunk };
      safeWrite('media', { ...library(), [id]: item });
      return { ok: true, item: { ...item, inUse: false } };
    },
    updateMedia: async (id, patch) => {
      const lib = library();
      safeWrite('media', { ...lib, [id]: { ...(lib[id] || {}), ...patch } });
      return { ok: true };
    },
    deleteMedia: async (id) => {
      const lib = library();
      if (!lib[id]?.uploaded) throw new ApiError('not_deletable');
      if (inUse(id)) throw new ApiError('in_use');
      delete lib[id];
      safeWrite('media', lib);
      return { ok: true };
    },
    listBackups: () =>
      ok({ items: readDemo('backups', []).map(({ name, savedAt }) => ({ name, savedAt })), version: version() }),
    restoreBackup: async (name) => {
      const backups = readDemo('backups', []);
      if (name === 'defaults') {
        pushBackup();
        window.localStorage.removeItem('suhad-demo-content');
      } else {
        const found = backups.find((b) => b.name === name);
        if (!found) throw new ApiError('not_found');
        pushBackup();
        safeWrite('content', found.content);
      }
      const v = Date.now().toString(36);
      safeWrite('version', v);
      return { ok: true, version: v };
    },
  };
}

export const api = IS_DEMO ? demoApi() : httpApi();
