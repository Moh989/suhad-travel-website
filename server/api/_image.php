<?php
/**
 * معالجة الصور المرفوعة: التحقق، تصحيح الاتجاه، وإنشاء عدة مقاسات.
 * تُحفظ بصيغة WebP إن دعمها الخادم، وإلا JPEG. إن لم تتوفر مكتبة GD تُحفظ الصورة كما هي.
 */

function image_process_upload(array $file): array
{
    $error = $file['error'] ?? UPLOAD_ERR_NO_FILE;
    if ($error === UPLOAD_ERR_INI_SIZE || $error === UPLOAD_ERR_FORM_SIZE) {
        fail('too_large', 413);
    }
    if ($error !== UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name'] ?? '')) {
        fail('upload_failed', 400);
    }
    if ((int) $file['size'] > (int) config('max_upload_mb') * 1024 * 1024) {
        fail('too_large', 413);
    }

    $info = @getimagesize($file['tmp_name']);
    $types = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png'];
    if (defined('IMAGETYPE_WEBP')) {
        $types[IMAGETYPE_WEBP] = 'webp';
    }
    if (!$info || !isset($types[$info[2]])) {
        fail('unsupported_type', 415);
    }
    [$width, $height, $type] = [(int) $info[0], (int) $info[1], (int) $info[2]];
    if ($width < 200 || $height < 200 || $width > 10000 || $height > 10000 || $width * $height > 50000000) {
        fail('bad_dimensions', 422);
    }

    ensure_storage();
    $id = 'u-' . date('ymd') . '-' . bin2hex(random_bytes(4));
    $name = mb_substr(preg_replace('/[^\p{L}\p{N} ._-]+/u', '', pathinfo((string) ($file['name'] ?? ''), PATHINFO_FILENAME)) ?: $id, 0, 80);
    $entry = ['id' => $id, 'uploaded' => true, 'name' => $name, 'position' => '50% 50%', 'createdAt' => date('c')];

    $image = image_load($file['tmp_name'], $type);
    if ($image === null) {
        // دون GD: تُحفظ الصورة الأصلية كما هي.
        $target = SUHAD_UPLOADS . '/' . $id . '.' . $types[$type];
        if (!move_uploaded_file($file['tmp_name'], $target)) {
            fail('storage_not_writable', 500);
        }
        return $entry + ['src' => 'uploads/' . $id . '.' . $types[$type], 'width' => $width, 'height' => $height];
    }

    $image = image_fix_orientation($image, $file['tmp_name'], $type);
    $width = imagesx($image);
    $height = imagesy($image);
    $format = function_exists('imagewebp') ? 'webp' : 'jpg';

    $widths = array_values(array_filter((array) config('image_widths'), static function ($w) use ($width) {
        return $w <= $width;
    }));
    if (!$widths) {
        $widths = [$width];
    }
    foreach ($widths as $w) {
        $h = (int) round($height * $w / $width);
        $resized = imagecreatetruecolor($w, $h);
        if ($format === 'webp') {
            imagealphablending($resized, false);
            imagesavealpha($resized, true);
            imagefill($resized, 0, 0, imagecolorallocatealpha($resized, 0, 0, 0, 127));
        } else {
            imagefill($resized, 0, 0, imagecolorallocate($resized, 255, 255, 255));
        }
        imagecopyresampled($resized, $image, 0, 0, 0, 0, $w, $h, $width, $height);
        $path = SUHAD_UPLOADS . '/' . $id . '-' . $w . '.' . $format;
        $saved = $format === 'webp' ? imagewebp($resized, $path, 78) : imagejpeg($resized, $path, 82);
        imagedestroy($resized);
        if (!$saved) {
            fail('storage_not_writable', 500);
        }
    }
    imagedestroy($image);

    return $entry + [
        'base' => 'uploads/' . $id,
        'widths' => $widths,
        'ext' => $format,
        'width' => $width,
        'height' => $height,
    ];
}

function image_load(string $path, int $type)
{
    if (!extension_loaded('gd') || !function_exists('imagecreatetruecolor')) {
        return null;
    }
    @ini_set('memory_limit', '512M');
    switch ($type) {
        case IMAGETYPE_JPEG:
            $image = function_exists('imagecreatefromjpeg') ? @imagecreatefromjpeg($path) : false;
            break;
        case IMAGETYPE_PNG:
            $image = function_exists('imagecreatefrompng') ? @imagecreatefrompng($path) : false;
            break;
        default:
            $image = function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($path) : false;
    }
    return $image ?: null;
}

/** صور الهاتف تحمل اتجاهها في بيانات EXIF؛ نطبّقه فعلياً على البكسلات. */
function image_fix_orientation($image, string $path, int $type)
{
    if ($type !== IMAGETYPE_JPEG || !function_exists('exif_read_data')) {
        return $image;
    }
    $exif = @exif_read_data($path);
    $angles = [3 => 180, 6 => -90, 8 => 90];
    $orientation = (int) ($exif['Orientation'] ?? 1);
    if (!isset($angles[$orientation])) {
        return $image;
    }
    $rotated = imagerotate($image, $angles[$orientation], 0);
    if ($rotated) {
        imagedestroy($image);
        return $rotated;
    }
    return $image;
}

function image_delete_files(array $entry): void
{
    $id = (string) ($entry['id'] ?? '');
    if (!preg_match('/^u-\d{6}-[0-9a-f]{8}$/', $id)) {
        return;
    }
    foreach (glob(SUHAD_UPLOADS . '/' . $id . '*') ?: [] as $file) {
        @unlink($file);
    }
}
