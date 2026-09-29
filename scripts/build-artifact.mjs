/**
 * يبني نسخة معاينة لـ Claude Artifacts (لا تحتاج خادماً):
 * - artifact-preview/index.html : الموقع
 * - artifact-preview/admin.html : لوحة التحكم في «وضع المعاينة» (تحفظ في متصفح الزائر فقط)
 * React يُحمَّل من cdnjs، وكود الموقع و CSS يُضمَّنان في الصفحتين.
 * هذا السكربت للمعاينة فقط؛ النشر الفعلي يستخدم `npm run build`.
 */
import { build } from 'vite';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'artifact-preview');
const REACT = '18.3.1';
const imp = (p) => import(pathToFileURL(path.join(root, p)).href);

const { default: rawSite } = await imp('src/content/site.js');
const { localize } = await imp('src/content/localize.js');
const { bootScript } = await imp('src/lib/boot.js');
const site = localize(rawSite, 'ar');

async function bundle(entry, name) {
  const tmp = path.join(outDir, `.build-${name}`);
  await rm(tmp, { recursive: true, force: true });
  await build({
    root,
    configFile: false,
    logLevel: 'warn',
    publicDir: false,
    esbuild: { jsx: 'transform', jsxFactory: 'React.createElement', jsxFragment: 'React.Fragment' },
    define: { 'process.env.NODE_ENV': '"production"', __SUHAD_DEMO__: 'true' },
    build: {
      outDir: tmp,
      emptyOutDir: true,
      cssCodeSplit: false,
      lib: { entry: path.join(root, entry), formats: ['iife'], name: `Suhad_${name}`, fileName: () => 'app.js' },
      rollupOptions: {
        external: ['react', 'react-dom', 'react-dom/client'],
        output: {
          globals: { react: 'React', 'react-dom': 'ReactDOM', 'react-dom/client': 'ReactDOM' },
          assetFileNames: 'app.[ext]',
        },
      },
    },
  });
  const js = (await readFile(path.join(tmp, 'app.js'), 'utf8')).replace(/<\/script/gi, '<\\/script');
  const css = await readFile(path.join(tmp, 'app.css'), 'utf8');
  await rm(tmp, { recursive: true, force: true });
  return { js, css };
}

const fonts = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap">`;
const react = `<script src="https://cdnjs.cloudflare.com/ajax/libs/react/${REACT}/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/${REACT}/umd/react-dom.production.min.js"></script>`;

await mkdir(outDir, { recursive: true });

// الموقع: يُغلَّف تلقائياً بهيكل الصفحة عند النشر، فلا يحتوي <html> أو <head>.
const main = await bundle('src/main.jsx', 'site');
await writeFile(
  path.join(outDir, 'index.html'),
  `<title>السهاد للسفر والسياحة</title>
<meta name="description" content="${site.seo.description}">
${fonts}
<script>document.documentElement.lang='ar';document.documentElement.dir='rtl';${bootScript}</script>
<style>
${main.css}
</style>
<div id="root"></div>
<noscript><p style="padding:24px">${site.company.name}</p></noscript>
${react}
<script>
${main.js}
</script>
`,
);

// لوحة التحكم: صفحة إضافية كاملة (تُقدَّم كما هي دون هيكل).
const admin = await bundle('src/admin/main.jsx', 'admin');
await writeFile(
  path.join(outDir, 'admin.html'),
  `<!doctype html>
<html lang="ar" dir="rtl" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>لوحة التحكم — السهاد</title>
${fonts}
<style>
${admin.css}
</style>
</head>
<body>
<div id="admin-root"></div>
${react}
<script>
${admin.js}
</script>
</body>
</html>
`,
);
console.log('artifact preview → artifact-preview/index.html + admin.html');
