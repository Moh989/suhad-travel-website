/**
 * يحوّل المحتوى الافتراضي (src/content/site.js) إلى server/api/defaults.json
 * ليقرأه الخادم ولوحة التحكم. يُشغَّل تلقائياً مع البناء.
 */
import { writeFile, access } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { default: site } = await import(pathToFileURL(path.join(root, 'src/content/site.js')).href + `?t=${Date.now()}`);
await writeFile(path.join(root, 'server/api/defaults.json'), JSON.stringify(site, null, 1));
console.log('defaults → server/api/defaults.json');

// مفتاح إعداد عشوائي لكل تثبيت جديد (نسخة جديدة من المستودع)، يُحفظ خارج git.
const localConfig = path.join(root, 'server/api/_config.local.php');
try {
  await access(localConfig);
} catch {
  const key = randomBytes(18).toString('base64url');
  await writeFile(
    localConfig,
    `<?php\n// إعدادات خاصة بهذا التثبيت — لا تُرفع إلى git.\nreturn [\n    'setup_key' => '${key}',\n];\n`,
  );
  console.log(`setup key (أول دخول إلى /admin/): ${key}  — محفوظ في server/api/_config.local.php`);
}
