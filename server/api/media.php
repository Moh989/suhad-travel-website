<?php
/**
 * مكتبة الصور.
 * GET                              → كل الصور (الأصلية والمرفوعة) مع حالة الاستخدام.
 * POST (multipart, file)           → رفع صورة.
 * POST {action: "update", id, position?, credit?} → نقطة التركيز ومصدر الصورة.
 * POST {action: "delete", id}      → حذف صورة مرفوعة غير مستخدمة.
 * تغييرات الصور تُحفظ فوراً (لا تحتاج زر «حفظ التغييرات»).
 */
require __DIR__ . '/_bootstrap.php';
require __DIR__ . '/_image.php';

require_auth();

/** هل الصورة مستخدمة في المحتوى الحالي؟ */
function media_in_use(string $id): bool
{
    $json = json_encode(editable_content(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    return strpos((string) $json, '"' . $id . '"') !== false;
}

function media_list(): array
{
    $defaults = defaults()['media'] ?? [];
    $library = media_library();
    $all = merge_content($defaults, $library);
    $content = json_encode(editable_content(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $items = [];
    foreach ($all as $id => $entry) {
        $entry['id'] = $id;
        $entry['uploaded'] = !empty($entry['uploaded']);
        $entry['inUse'] = strpos((string) $content, '"' . $id . '"') !== false;
        $items[] = $entry;
    }
    // المرفوعة حديثاً أولاً
    usort($items, static function ($a, $b) {
        return strcmp((string) ($b['createdAt'] ?? ''), (string) ($a['createdAt'] ?? ''));
    });
    return $items;
}

if (method() === 'GET') {
    json_out(['ok' => true, 'items' => media_list(), 'credits' => defaults()['credits'] ?? []]);
}

require_post();
require_csrf();

// رفع ملف
if (!empty($_FILES['file'])) {
    $entry = image_process_upload($_FILES['file']);
    $library = media_library();
    $library[$entry['id']] = $entry;
    write_json(SUHAD_DATA . '/media.json', $library);
    json_out(['ok' => true, 'item' => $entry + ['inUse' => false]]);
}

$body = body_json();
$id = (string) ($body['id'] ?? '');
$known = array_key_exists($id, defaults()['media'] ?? []) || array_key_exists($id, media_library());
if (!$known) {
    fail('not_found', 404);
}
$library = media_library();

switch ((string) ($body['action'] ?? '')) {
    case 'update':
        $entry = $library[$id] ?? [];
        if (isset($body['position'])) {
            if (!preg_match('/^(100|[1-9]?\d)(\.\d+)?% (100|[1-9]?\d)(\.\d+)?%$/', (string) $body['position'])) {
                fail('bad_position', 422);
            }
            $entry['position'] = (string) $body['position'];
        }
        // مصدر الصورة وترخيصها للصور المرفوعة فقط
        if (isset($body['credit']) && !empty($entry['uploaded'])) {
            $credit = [];
            foreach (['author', 'license', 'licenseUrl', 'source'] as $field) {
                $value = trim((string) ($body['credit'][$field] ?? ''));
                if (in_array($field, ['licenseUrl', 'source'], true) && $value !== '' && !preg_match('#^https?://#i', $value)) {
                    fail('bad_url', 422, ['field' => $field]);
                }
                $credit[$field] = mb_substr($value, 0, 300);
            }
            $subject = $body['credit']['subject'] ?? '';
            $credit['subject'] = is_array($subject)
                ? ['ar' => mb_substr((string) ($subject['ar'] ?? ''), 0, 200), 'en' => mb_substr((string) ($subject['en'] ?? ''), 0, 200)]
                : mb_substr((string) $subject, 0, 200);
            $entry['credit'] = $credit;
        }
        $library[$id] = $entry;
        write_json(SUHAD_DATA . '/media.json', $library);
        json_out(['ok' => true]);

    case 'delete':
        if (empty($library[$id]['uploaded'])) {
            fail('not_deletable', 403);
        }
        if (media_in_use($id)) {
            fail('in_use', 409);
        }
        image_delete_files($library[$id]);
        unset($library[$id]);
        write_json(SUHAD_DATA . '/media.json', $library);
        json_out(['ok' => true]);

    default:
        fail('unknown_action', 400);
}
