<?php
/**
 * للتشغيل المحلي فقط مع خادم PHP المدمج:
 *   SUHAD_STORAGE=.local php -S localhost:8080 -t dist server/dev-router.php
 * يحاكي قواعد .htaccess (منع data/ والملفات الداخلية) ويقدّم الصور المرفوعة من مجلد التخزين.
 */
$uri = rawurldecode((string) parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH));

if (preg_match('#(^|/)data/#', $uri) || preg_match('#/api/(_[^/]*|defaults\.json)$#', $uri)) {
    http_response_code(403);
    echo 'Forbidden';
    return true;
}

$storage = getenv('SUHAD_STORAGE');
if ($storage && preg_match('#/uploads/(.+)$#', $uri, $m)) {
    $root = realpath($storage . '/uploads');
    $file = realpath($storage . '/uploads/' . $m[1]);
    if ($root && $file && strpos($file, $root . DIRECTORY_SEPARATOR) === 0 && is_file($file) && !preg_match('/\.php/i', $file)) {
        header('Content-Type: ' . (mime_content_type($file) ?: 'application/octet-stream'));
        readfile($file);
        return true;
    }
    http_response_code(404);
    return true;
}

return false;
