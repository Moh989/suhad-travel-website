<?php
/**
 * يُستدعى من index.php: يحقن المحتوى المحفوظ في الصفحة ويكتب عنوانها ووصفها
 * وبيانات المشاركة من لوحة التحكم، فتظهر التعديلات فوراً ولمحركات البحث أيضاً.
 */
require_once __DIR__ . '/_bootstrap.php';

function suhad_t($value, string $lang): string
{
    if (is_array($value)) {
        return (string) ($value[$lang] ?? $value['ar'] ?? '');
    }
    return (string) $value;
}

function suhad_e($value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/** مسار أكبر نسخة من صورة في المكتبة (أو المسار نفسه إن لم تكن من المكتبة). */
function suhad_image_path(array $content, string $ref): string
{
    $m = $content['media'][$ref] ?? null;
    if (!$m) {
        return $ref;
    }
    if (!empty($m['src'])) {
        return (string) $m['src'];
    }
    $widths = (array) ($m['widths'] ?? []);
    return $m['base'] . '-' . end($widths) . '.' . ($m['ext'] ?? 'webp');
}

function suhad_srcset(array $m): string
{
    if (!empty($m['src'])) {
        return suhad_e($m['src']);
    }
    $ext = $m['ext'] ?? 'webp';
    return suhad_e(implode(', ', array_map(static function ($w) use ($m, $ext) {
        return $m['base'] . '-' . $w . '.' . $ext . ' ' . $w . 'w';
    }, (array) ($m['widths'] ?? []))));
}

function suhad_page(): array
{
    $content = site_content();
    $lang = ($_GET['lang'] ?? '') === 'en' && (($content['features']['languageSwitch'] ?? true) !== false) ? 'en' : 'ar';
    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: no-cache');
    return [$content, $lang];
}

function suhad_head(array $content, string $lang): string
{
    $seo = $content['seo'] ?? [];
    $title = suhad_e(suhad_t($seo['title'] ?? '', $lang));
    $description = suhad_e(suhad_t($seo['description'] ?? '', $lang));
    $siteName = suhad_e(suhad_t($content['company']['name'] ?? '', $lang));
    $url = (string) ($content['company']['url'] ?? '');
    $image = suhad_image_path($content, (string) ($seo['ogImage'] ?? 'og-image.jpg'));
    if ($url !== '') {
        $image = rtrim($url, '/') . '/' . ltrim($image, '/');
    }
    $out = [
        "<title>{$title}</title>",
        "<meta name=\"description\" content=\"{$description}\" />",
        '<meta name="theme-color" content="' . suhad_e($seo['themeColor'] ?? '#5c1337') . '" />',
        '<meta property="og:type" content="website" />',
        '<meta property="og:locale" content="' . ($lang === 'en' ? 'en_GB' : 'ar_AR') . '" />',
        "<meta property=\"og:site_name\" content=\"{$siteName}\" />",
        "<meta property=\"og:title\" content=\"{$title}\" />",
        "<meta property=\"og:description\" content=\"{$description}\" />",
        '<meta property="og:image" content="' . suhad_e($image) . '" />',
        '<meta name="twitter:card" content="summary_large_image" />',
        "<meta name=\"twitter:title\" content=\"{$title}\" />",
        "<meta name=\"twitter:description\" content=\"{$description}\" />",
        '<meta name="twitter:image" content="' . suhad_e($image) . '" />',
    ];
    if ($url !== '') {
        $canonical = suhad_e(rtrim($url, '/') . '/' . ($lang === 'en' ? '?lang=en' : ''));
        $out[] = "<link rel=\"canonical\" href=\"{$canonical}\" />";
        $out[] = "<meta property=\"og:url\" content=\"{$canonical}\" />";
        $out[] = '<link rel="alternate" hreflang="ar" href="' . suhad_e(rtrim($url, '/') . '/') . '" />';
        $out[] = '<link rel="alternate" hreflang="en" href="' . suhad_e(rtrim($url, '/') . '/?lang=en') . '" />';
    }
    // تحميل مسبق لأول صورة ظاهرة في العرض المتحرك
    foreach ((array) ($content['hero']['slides'] ?? []) as $slide) {
        if (($slide['visible'] ?? true) === false || empty($content['media'][$slide['image'] ?? ''])) {
            continue;
        }
        $wide = $content['media'][$slide['image']];
        $mobile = $content['media'][$slide['mobileImage'] ?? ''] ?? $wide;
        $out[] = '<link rel="preload" as="image" imagesrcset="' . suhad_srcset($mobile) . '" imagesizes="100vw" media="(max-width: 699px)" fetchpriority="high" />';
        $out[] = '<link rel="preload" as="image" imagesrcset="' . suhad_srcset($wide) . '" imagesizes="(min-width: 1100px) 130vw, 100vw" media="(min-width: 700px)" fetchpriority="high" />';
        break;
    }
    return implode("\n    ", $out);
}

/** المحتوى داخل وسم script، مع ترميز يمنع كسر الوسم. */
function suhad_inline_content(array $content): string
{
    $json = json_encode($content, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
    return '<script>window.__SITE_CONTENT__=' . $json . ';</script>';
}
