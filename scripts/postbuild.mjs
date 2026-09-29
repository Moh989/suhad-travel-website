/**
 * بعد vite build: يجهّز dist/ للرفع على استضافة PHP.
 * - ينسخ واجهة لوحة التحكم (server/api) وملفات الحماية .htaccess
 * - يُنشئ index.php من index.html: الخادم يحقن المحتوى المحفوظ ويكتب العنوان والوصف.
 * dist/index.html يبقى نسخة ثابتة احتياطية بالمحتوى الافتراضي (لاستضافة دون PHP).
 */
import { readFile, writeFile, copyFile, mkdir, readdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const api = path.join(dist, 'api');

await mkdir(api, { recursive: true });
for (const file of await readdir(path.join(root, 'server/api'))) {
  if (/\.(php|json)$/.test(file)) await copyFile(path.join(root, 'server/api', file), path.join(api, file));
}
await copyFile(path.join(root, 'server/htaccess/root.htaccess'), path.join(dist, '.htaccess'));
await copyFile(path.join(root, 'server/htaccess/api.htaccess'), path.join(api, '.htaccess'));
await copyFile(path.join(root, 'server/htaccess/admin.htaccess'), path.join(dist, 'admin/.htaccess'));
// ملفات النظام وبيانات محلية لا تُرفع مع البناء
async function removeJunk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.name === '.DS_Store') await rm(full, { force: true });
    else if (entry.isDirectory()) await removeJunk(full);
  }
}
await removeJunk(dist);
await rm(path.join(dist, 'data'), { recursive: true, force: true });
await rm(path.join(dist, 'uploads'), { recursive: true, force: true });

let html = await readFile(path.join(dist, 'index.html'), 'utf8');
const start = html.indexOf('<!--head:start-->');
const end = html.indexOf('<!--head:end-->');
if (start < 0 || end < 0) throw new Error('head markers not found in dist/index.html');
html =
  html.slice(0, start) +
  '<?= suhad_head($content, $lang) ?>' +
  html.slice(end + '<!--head:end-->'.length);
html = html.replace(/<html lang="[^"]*" dir="[^"]*">/, '<html lang="<?= $lang ?>" dir="<?= $lang === \'en\' ? \'ltr\' : \'rtl\' ?>">');
html = html.replace('</head>', '    <?= suhad_inline_content($content) ?>\n  </head>');
const php = "<?php require __DIR__ . '/api/_render.php'; [$content, $lang] = suhad_page(); ?>\n" + html;
await writeFile(path.join(dist, 'index.php'), php);
console.log('postbuild → dist/index.php, dist/api/, .htaccess');
