<?php
/**
 * إعدادات لوحة التحكم.
 * القيم السرية (مثل setup_key) في _config.local.php بجانب هذا الملف، ولا تُرفع إلى git.
 * يُنشأ ذلك الملف تلقائياً بمفتاح عشوائي عند أول بناء (npm run build).
 */
$local = is_file(__DIR__ . '/_config.local.php') ? (array) require __DIR__ . '/_config.local.php' : [];

return $local + [
    // دون مفتاح إعداد لا يمكن إنشاء حساب المدير من المتصفح (استخدم server/tools/create-admin.php).
    'setup_key' => getenv('SUHAD_SETUP_KEY') ?: '',

    // مكان حفظ البيانات (data/) والصور المرفوعة (uploads/). افتراضياً: جذر الموقع.
    'storage' => getenv('SUHAD_STORAGE') ?: dirname(__DIR__),

    'max_upload_mb' => 12,
    'max_content_kb' => 1500,
    'session_minutes' => 120,
    'backups_keep' => 30,
    'login_max_attempts' => 5,
    'login_lock_minutes' => 15,
    'image_widths' => [480, 800, 1200, 1600, 2400],
];
