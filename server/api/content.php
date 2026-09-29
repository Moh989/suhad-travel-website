<?php
/**
 * المحتوى.
 * GET                → المحتوى الكامل للموقع (عام).
 * GET ?scope=admin   → المحتوى القابل للتحرير ورقم نسخته (للمدير).
 * POST {content, baseVersion} → حفظ (للمدير)، مع نسخة احتياطية تلقائية.
 */
require __DIR__ . '/_bootstrap.php';

if (method() === 'GET') {
    if (($_GET['scope'] ?? '') === 'admin') {
        require_auth();
        json_out(['ok' => true, 'content' => editable_content(), 'version' => content_version()]);
    }
    json_out(site_content());
}

require_post();
require_auth();
require_csrf();
$body = body_json();

$content = $body['content'] ?? null;
$required = ['company', 'contact', 'layout', 'features', 'seo', 'ui', 'nav', 'headerCta', 'hero', 'about',
    'services', 'destinations', 'cta', 'planner', 'footer', 'fab'];
if (!is_array($content) || is_list_array($content)) {
    fail('invalid_content', 422);
}
foreach ($required as $key) {
    if (!isset($content[$key]) || !is_array($content[$key])) {
        fail('invalid_content', 422, ['field' => $key]);
    }
}
// الصور ومصادرها تُدار من مكتبة الصور، لا من هنا.
unset($content['media'], $content['credits']);

/** الروابط الخارجية: http(s) فقط، وإلا تُفرَّغ. */
$safeUrl = static function ($value) {
    return is_string($value) && preg_match('#^https?://#i', trim($value)) ? trim($value) : null;
};
$content['company']['url'] = $safeUrl($content['company']['url'] ?? null);
if (isset($content['contact']['social']) && is_array($content['contact']['social'])) {
    foreach ($content['contact']['social'] as $i => $link) {
        $content['contact']['social'][$i]['href'] = $safeUrl($link['href'] ?? null);
    }
}
$email = $content['contact']['email'] ?? null;
if ($email !== null && $email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fail('invalid_email', 422);
}

if ((string) ($body['baseVersion'] ?? '') !== content_version()) {
    fail('conflict', 409, ['version' => content_version()]);
}

ensure_storage();
backup_current('save');
write_json(SUHAD_DATA . '/content.json', $content);
json_out(['ok' => true, 'version' => content_version(), 'savedAt' => date('c')]);

function backup_current(string $reason): void
{
    $current = SUHAD_DATA . '/content.json';
    if (!is_file($current)) {
        return;
    }
    $name = 'content-' . date('Ymd-His') . '-' . bin2hex(random_bytes(2)) . '.json';
    @copy($current, SUHAD_DATA . '/backups/' . $name);
    $files = glob(SUHAD_DATA . '/backups/content-*.json') ?: [];
    rsort($files);
    foreach (array_slice($files, (int) config('backups_keep')) as $old) {
        @unlink($old);
    }
}
