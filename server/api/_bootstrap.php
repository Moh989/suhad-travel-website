<?php
/**
 * أساس واجهة لوحة التحكم: الإعدادات، التخزين، الجلسة، الحماية.
 * يعمل على PHP 7.4 أو أحدث، دون قاعدة بيانات.
 */
declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '0');

$GLOBALS['SUHAD_CONFIG'] = require __DIR__ . '/_config.php';

define('SUHAD_STORAGE', rtrim((string) $GLOBALS['SUHAD_CONFIG']['storage'], '/\\'));
define('SUHAD_DATA', SUHAD_STORAGE . '/data');
define('SUHAD_UPLOADS', SUHAD_STORAGE . '/uploads');
// أول سطر في الملفات الخاصة: يمنع عرضها إن طُلبت مباشرة من المتصفح.
define('SUHAD_GUARD', "<?php http_response_code(404); exit; ?>\n");

// بدائل بسيطة إن لم تكن إضافة mbstring مفعّلة على الخادم.
if (!function_exists('mb_strlen')) {
    function mb_strlen(string $s): int
    {
        return (int) preg_match_all('/./us', $s);
    }
}
if (!function_exists('mb_substr')) {
    function mb_substr(string $s, int $start, ?int $length = null): string
    {
        preg_match_all('/./us', $s, $m);
        return implode('', array_slice($m[0], $start, $length));
    }
}

function config(string $key)
{
    return $GLOBALS['SUHAD_CONFIG'][$key] ?? null;
}

/* ---------- الاستجابة ---------- */

function json_out($data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(string $code, int $status = 400, array $extra = []): void
{
    json_out(['ok' => false, 'error' => $code] + $extra, $status);
}

function method(): string
{
    return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
}

function require_post(): void
{
    if (method() !== 'POST') {
        fail('method_not_allowed', 405);
    }
}

function body_json(): array
{
    $limit = (int) config('max_content_kb') * 1024;
    $raw = (string) file_get_contents('php://input');
    if (strlen($raw) > $limit) {
        fail('too_large', 413);
    }
    $data = json_decode($raw === '' ? '{}' : $raw, true);
    if (!is_array($data)) {
        fail('bad_json', 400);
    }
    return $data;
}

/* ---------- التخزين ---------- */

function ensure_storage(): void
{
    foreach ([SUHAD_DATA, SUHAD_DATA . '/backups', SUHAD_UPLOADS] as $dir) {
        if (!is_dir($dir) && !@mkdir($dir, 0775, true) && !is_dir($dir)) {
            fail('storage_not_writable', 500, ['path' => basename($dir)]);
        }
    }
    $deny = "<IfModule mod_authz_core.c>\n  Require all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\n  Order allow,deny\n  Deny from all\n</IfModule>\n";
    if (!is_file(SUHAD_DATA . '/.htaccess')) {
        @file_put_contents(SUHAD_DATA . '/.htaccess', $deny);
    }
    if (!is_file(SUHAD_UPLOADS . '/.htaccess')) {
        @file_put_contents(SUHAD_UPLOADS . '/.htaccess', "<FilesMatch \"\\.(php[0-9]?|phtml|phar|cgi|pl|py|sh)$\">\n" . $deny . "</FilesMatch>\n");
    }
    if (!is_file(SUHAD_UPLOADS . '/index.html')) {
        @file_put_contents(SUHAD_UPLOADS . '/index.html', '');
    }
}

function write_atomic(string $path, string $data): void
{
    ensure_storage();
    $tmp = $path . '.' . bin2hex(random_bytes(4)) . '.tmp';
    if (@file_put_contents($tmp, $data, LOCK_EX) === false || !@rename($tmp, $path)) {
        @unlink($tmp);
        fail('storage_not_writable', 500);
    }
}

function read_json(string $path, $default = null)
{
    if (!is_file($path)) {
        return $default;
    }
    $data = json_decode((string) file_get_contents($path), true);
    return is_array($data) ? $data : $default;
}

function write_json(string $path, $data): void
{
    write_atomic($path, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
}

/** ملفات خاصة (بيانات الدخول ومحاولاته) تُحفظ بصيغة PHP محمية. */
function read_private(string $name, $default = null)
{
    $path = SUHAD_DATA . '/' . $name . '.php';
    if (!is_file($path)) {
        return $default;
    }
    $data = json_decode(substr((string) file_get_contents($path), strlen(SUHAD_GUARD)), true);
    return is_array($data) ? $data : $default;
}

function write_private(string $name, $data): void
{
    write_atomic(SUHAD_DATA . '/' . $name . '.php', SUHAD_GUARD . json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
}

/* ---------- المحتوى ---------- */

function is_list_array(array $value): bool
{
    $i = 0;
    foreach ($value as $key => $_) {
        if ($key !== $i++) {
            return false;
        }
    }
    return true;
}

/** دمج مطابق لـ src/content/merge.js: الكائنات بعمق، والقوائم تُستبدل. */
function merge_content($base, $over)
{
    if (is_array($base) && !is_list_array($base) && is_array($over)) {
        if ($over === []) {
            return $base;
        }
        if (!is_list_array($over)) {
            foreach ($over as $key => $value) {
                $base[$key] = array_key_exists($key, $base) ? merge_content($base[$key], $value) : $value;
            }
            return $base;
        }
    }
    return $over;
}

function defaults(): array
{
    static $defaults = null;
    if ($defaults === null) {
        $defaults = read_json(__DIR__ . '/defaults.json', []);
    }
    return $defaults;
}

function stored_content(): ?array
{
    return read_json(SUHAD_DATA . '/content.json', null);
}

function media_library(): array
{
    return read_json(SUHAD_DATA . '/media.json', []);
}

function content_version(): string
{
    $path = SUHAD_DATA . '/content.json';
    return is_file($path) ? substr(sha1_file($path), 0, 16) : 'defaults';
}

/** المحتوى الكامل كما يراه الموقع: الافتراضي + المحفوظ + مكتبة الصور. */
function site_content(): array
{
    $defaults = defaults();
    $stored = stored_content();
    $content = $stored ? merge_content($defaults, $stored) : $defaults;
    $content['media'] = merge_content($defaults['media'] ?? [], media_library());
    $content['credits'] = $defaults['credits'] ?? [];
    return $content;
}

/** المحتوى القابل للتحرير (دون مكتبة الصور ومصادرها التي تُدار منفصلة). */
function editable_content(): array
{
    $content = site_content();
    unset($content['media'], $content['credits']);
    return $content;
}

/* ---------- الجلسة والحماية ---------- */

function is_https(): bool
{
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
}

function start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    session_name('suhad_admin');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => is_https(),
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
    $ttl = (int) config('session_minutes') * 60;
    if (isset($_SESSION['seen']) && time() - (int) $_SESSION['seen'] > $ttl) {
        $_SESSION = [];
        session_regenerate_id(true);
    }
    $_SESSION['seen'] = time();
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
}

function current_user(): ?string
{
    start_session();
    return isset($_SESSION['user']) ? (string) $_SESSION['user'] : null;
}

function require_auth(): void
{
    if (!current_user()) {
        fail('unauthorized', 401);
    }
}

/** كل طلب يغيّر شيئاً يحمل رمزاً من الجلسة نفسها (حماية من CSRF). */
function require_csrf(): void
{
    start_session();
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!is_string($token) || $token === '' || !hash_equals((string) $_SESSION['csrf'], $token)) {
        fail('csrf', 403);
    }
}

function admin_account(): ?array
{
    $admin = read_private('admin', null);
    return is_array($admin) && !empty($admin['hash']) ? $admin : null;
}
