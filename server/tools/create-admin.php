<?php
/**
 * إنشاء حساب مدير لوحة التحكم أو إعادة تعيينه من سطر الأوامر.
 *
 *   php server/tools/create-admin.php <اسم المستخدم> <كلمة المرور> [--force]
 *
 * دون --force لا يُغيّر حساباً موجوداً (فلا تُمسح كلمة مرور غيّرتها من اللوحة).
 * مكان الحفظ: المجلد في SUHAD_STORAGE، وإلا جذر الموقع (على الخادم عبر SSH).
 * هذا الملف لا يُرفع مع الموقع ولا يعمل من المتصفح.
 */
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require __DIR__ . '/../api/_bootstrap.php';

$args = array_values(array_filter(array_slice($argv, 1), static function ($a) {
    return $a !== '--force';
}));
$force = in_array('--force', $argv, true);
[$username, $password] = $args + [null, null];

if (!$username || $password === null || $password === '') {
    fwrite(STDERR, "الاستخدام: php server/tools/create-admin.php <username> <password> [--force]\n");
    exit(1);
}
if (!preg_match('/^[A-Za-z0-9._-]{3,40}$/', $username)) {
    fwrite(STDERR, "اسم المستخدم: من 3 إلى 40 حرفاً إنجليزياً أو رقماً (ويُسمح بـ . _ -).\n");
    exit(1);
}

$existing = admin_account();
if ($existing && !$force) {
    echo "حساب المدير موجود مسبقاً ({$existing['username']}) — لم يتغير شيء.\n";
    exit(0);
}

write_private('admin', [
    'username' => $username,
    'hash' => password_hash($password, PASSWORD_DEFAULT),
    'createdAt' => date('c'),
]);
// مسح أي قفل سابق لمحاولات الدخول
write_private('attempts', []);

echo ($existing ? 'أُعيد تعيين' : 'أُنشئ') . " حساب المدير: {$username}\n";
if (mb_strlen($password) < 10) {
    echo "تنبيه: كلمة المرور قصيرة. مناسبة للتشغيل المحلي فقط؛ استخدم كلمة أقوى على الموقع المنشور.\n";
}
