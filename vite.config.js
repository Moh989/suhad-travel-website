import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import site from './src/content/site.js';
import { localize } from './src/content/localize.js';
import { bootScript } from './src/lib/boot.js';

const escapeAttr = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const srcSet = (m) => m.widths.map((w) => `${m.base}-${w}.webp ${w}w`).join(', ');

/**
 * يملأ عنوان الصفحة ووصفها وبيانات المشاركة في index.html من ملف المحتوى،
 * فيبقى src/content/site.js المصدر الوحيد لهذه القيم.
 */
function contentMeta() {
  // الصفحة الثابتة تُكتب بالعربية (اللغة الأساسية)؛ React يبدّل العنوان والوصف عند اختيار الإنجليزية.
  const { seo, company, media, hero } = localize(site, 'ar');
  const firstSlide = hero.slides[0];
  const absolute = (path) => (company.url ? new URL(path, company.url).href : path);
  const heroWide = media[firstSlide.image];
  const heroMobile = media[firstSlide.mobileImage];
  const values = {
    LANG: 'ar',
    DIR: 'rtl',
    OG_LOCALE: 'ar_AR',
    OG_LOCALE_ALT: 'en_GB',
    BOOT_SCRIPT: bootScript,
    TITLE: escapeAttr(seo.title),
    DESCRIPTION: escapeAttr(seo.description),
    SITE_NAME: escapeAttr(company.name),
    THEME_COLOR: seo.themeColor,
    OG_IMAGE: escapeAttr(absolute(seo.ogImage)),
    OG_IMAGE_ALT: escapeAttr(firstSlide.alt),
    CANONICAL: company.url
      ? `<link rel="canonical" href="${escapeAttr(company.url)}" />\n    <meta property="og:url" content="${escapeAttr(company.url)}" />`
      : '<!-- أضف company.url في ملف المحتوى لتفعيل الرابط الأساسي (canonical) -->',
    HERO_PRELOAD: [
      `<link rel="preload" as="image" type="image/webp" imagesrcset="${srcSet(heroMobile)}" imagesizes="100vw" media="(max-width: 699px)" fetchpriority="high" />`,
      `<link rel="preload" as="image" type="image/webp" imagesrcset="${srcSet(heroWide)}" imagesizes="(min-width: 1100px) 130vw, 100vw" media="(min-width: 700px)" fetchpriority="high" />`,
    ].join('\n    '),
  };
  return {
    name: 'content-meta',
    transformIndexHtml: (html) => html.replace(/%SEO_(\w+)%/g, (match, key) => values[key] ?? match),
  };
}

const here = (p) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  base: './',
  plugins: [react(), contentMeta()],
  define: { __SUHAD_DEMO__: 'false' },
  build: {
    rollupOptions: {
      // صفحتان: الموقع، ولوحة التحكم في /admin/
      input: { main: here('./index.html'), admin: here('./admin/index.html') },
    },
  },
  server: {
    // أثناء التطوير: واجهة PHP تعمل عبر «npm run dev:api» على المنفذ 8080
    proxy: {
      '/api': 'http://localhost:8080',
      '/uploads': 'http://localhost:8080',
    },
  },
});
