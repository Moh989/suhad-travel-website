<?php
/**
 * الدخول إلى لوحة التحكم.
 * GET  → الحالة: هل أُنشئ حساب المدير؟ من المستخدم الحالي؟ ورمز الحماية.
 * POST → action: setup | login | logout | password
 */
require __DIR__ . '/_bootstrap.php';

start_session();

if (method() === 'GET') {
    json_out([
        'ok' => true,
        'configured' => admin_account() !== null,
        'user' => current_user(),
        'csrf' => $_SESSION['csrf'],
    ]);
}

require_post();
require_csrf();
$body = body_json();
$action = (string) ($body['action'] ?? '');

/* ---------- الحد من محاولات الدخول ---------- */

function client_key(): string
{
    return hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . '|suhad');
}

function throttle_check(): void
{
    $attempts = read_private('attempts', []);
    $entry = $attempts[client_key()] ?? null;
    if ($entry && ($entry['lockedUntil'] ?? 0) > time()) {
        fail('locked', 429, ['retryAfter' => (int) $entry['lockedUntil'] - time()]);
    }
}

function throttle_record(bool $success): void
{
    $attempts = read_private('attempts', []);
    $key = client_key();
    $now = time();
    // تنظيف السجلات القديمة
    foreach ($attempts as $k => $entry) {
        if (($entry['last'] ?? 0) < $now - 86400) {
            unset($attempts[$k]);
        }
    }
    if ($success) {
        unset($attempts[$key]);
    } else {
        $entry = $attempts[$key] ?? ['count' => 0, 'last' => $now, 'lockedUntil' => 0];
        $window = (int) config('login_lock_minutes') * 60;
        $entry['count'] = ($now - (int) $entry['last'] > $window) ? 1 : (int) $entry['count'] + 1;
        $entry['last'] = $now;
        if ($entry['count'] >= (int) config('login_max_attempts')) {
            $entry['lockedUntil'] = $now + $window;
            $entry['count'] = 0;
        }
        $attempts[$key] = $entry;
    }
    write_private('attempts', $attempts);
}

function valid_username(string $name): bool
{
    return (bool) preg_match('/^[A-Za-z0-9._-]{3,40}$/', $name);
}

function sign_in(string $username): void
{
    session_regenerate_id(true);
    $_SESSION['user'] = $username;
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
}

switch ($action) {
    case 'setup':
        if (admin_account() !== null) {
            fail('already_configured', 403);
        }
        throttle_check();
        $key = (string) ($body['setupKey'] ?? '');
        $expected = (string) config('setup_key');
        if ($expected === '' || !hash_equals($expected, $key)) {
            throttle_record(false);
            fail('bad_setup_key', 403);
        }
        $username = trim((string) ($body['username'] ?? ''));
        $password = (string) ($body['password'] ?? '');
        if (!valid_username($username)) {
            fail('bad_username', 422);
        }
        if (mb_strlen($password) < 10) {
            fail('weak_password', 422);
        }
        write_private('admin', [
            'username' => $username,
            'hash' => password_hash($password, PASSWORD_DEFAULT),
            'createdAt' => date('c'),
        ]);
        throttle_record(true);
        sign_in($username);
        json_out(['ok' => true, 'user' => $username, 'csrf' => $_SESSION['csrf']]);

    case 'login':
        $admin = admin_account();
        if ($admin === null) {
            fail('not_configured', 409);
        }
        throttle_check();
        $username = trim((string) ($body['username'] ?? ''));
        $password = (string) ($body['password'] ?? '');
        $valid = hash_equals((string) $admin['username'], $username)
            && password_verify($password, (string) $admin['hash']);
        if (!$valid) {
            throttle_record(false);
            usleep(400000);
            fail('bad_credentials', 401);
        }
        throttle_record(true);
        if (password_needs_rehash((string) $admin['hash'], PASSWORD_DEFAULT)) {
            $admin['hash'] = password_hash($password, PASSWORD_DEFAULT);
            write_private('admin', $admin);
        }
        sign_in($username);
        json_out(['ok' => true, 'user' => $username, 'csrf' => $_SESSION['csrf']]);

    case 'logout':
        $_SESSION = [];
        session_regenerate_id(true);
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
        json_out(['ok' => true, 'csrf' => $_SESSION['csrf']]);

    case 'password':
        require_auth();
        $admin = admin_account();
        if (!password_verify((string) ($body['current'] ?? ''), (string) $admin['hash'])) {
            fail('bad_credentials', 401);
        }
        $next = (string) ($body['next'] ?? '');
        if (mb_strlen($next) < 10) {
            fail('weak_password', 422);
        }
        $admin['hash'] = password_hash($next, PASSWORD_DEFAULT);
        $admin['changedAt'] = date('c');
        write_private('admin', $admin);
        json_out(['ok' => true]);

    default:
        fail('unknown_action', 400);
}
