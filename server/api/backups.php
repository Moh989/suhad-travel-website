<?php
/**
 * النسخ السابقة من المحتوى (تُنشأ تلقائياً عند كل حفظ).
 * GET  → القائمة، الأحدث أولاً.
 * POST {name} → استعادة نسخة، أو name = "defaults" للعودة إلى المحتوى الأصلي.
 */
require __DIR__ . '/_bootstrap.php';

require_auth();

if (method() === 'GET') {
    $files = glob(SUHAD_DATA . '/backups/content-*.json') ?: [];
    rsort($files);
    $items = array_map(static function ($path) {
        return ['name' => basename($path), 'savedAt' => date('c', (int) filemtime($path)), 'size' => filesize($path)];
    }, $files);
    json_out(['ok' => true, 'items' => $items, 'version' => content_version()]);
}

require_post();
require_csrf();
$body = body_json();
$name = (string) ($body['name'] ?? '');

if ($name !== 'defaults' && !preg_match('/^content-\d{8}-\d{6}-[0-9a-f]{4}\.json$/', $name)) {
    fail('bad_name', 422);
}
$source = $name === 'defaults' ? null : SUHAD_DATA . '/backups/' . $name;
if ($source !== null && !is_file($source)) {
    fail('not_found', 404);
}

ensure_storage();
$current = SUHAD_DATA . '/content.json';
if (is_file($current)) {
    @copy($current, SUHAD_DATA . '/backups/content-' . date('Ymd-His') . '-' . bin2hex(random_bytes(2)) . '.json');
}
if ($source === null) {
    @unlink($current);
} else {
    write_atomic($current, (string) file_get_contents($source));
}
json_out(['ok' => true, 'version' => content_version()]);
