#!/bin/zsh
# ─────────────────────────────────────────────────────────────
#  تشغيل موقع السهاد محلياً (الموقع + لوحة التحكم)
#  انقر على هذا الملف مرتين في Finder، أو شغّله من الطرفية:  ./start.command
#  للإيقاف: اضغط Control + C في نافذة الطرفية.
# ─────────────────────────────────────────────────────────────

cd "$(dirname "$0")" || exit 1

# حساب المدير المحلي من local.env (على جهازك فقط، لا يُرفع إلى git):
#   ADMIN_USER=...
#   ADMIN_PASS=...
# إن لم يوجد الملف تطلب لوحة التحكم إنشاء الحساب بمفتاح الإعداد عند أول دخول.
[[ -f local.env ]] && source ./local.env
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

pause_and_exit() { echo; echo "$1"; read -r "?اضغط Enter للإغلاق…"; exit 1; }

# PHP: من النظام، أو Homebrew، أو XAMPP
PHP_BIN=""
for candidate in "$(command -v php 2>/dev/null)" /opt/homebrew/bin/php /usr/local/bin/php /Applications/XAMPP/xamppfiles/bin/php; do
  if [[ -n "$candidate" && -x "$candidate" ]]; then PHP_BIN="$candidate"; break; fi
done
[[ -z "$PHP_BIN" ]] && pause_and_exit "لم يُعثر على PHP. ثبّته بالأمر: brew install php  (أو ثبّت XAMPP)."
command -v node >/dev/null 2>&1 || pause_and_exit "Node.js غير مثبت. نزّله من https://nodejs.org"

echo "▸ السهاد للسفر والسياحة — تشغيل محلي"
echo "  PHP: $("$PHP_BIN" -r 'echo PHP_VERSION;')  ·  Node: $(node -v)"

if [[ ! -d node_modules ]]; then
  echo "▸ تثبيت الحزم لأول مرة…"
  npm install --no-audit --no-fund || pause_and_exit "تعذّر تثبيت الحزم."
fi

echo "▸ بناء الموقع…"
npm run build --silent >/tmp/suhad-build.log 2>&1 || { cat /tmp/suhad-build.log; pause_and_exit "فشل البناء (التفاصيل أعلاه)."; }

# البيانات المحلية (المحتوى المحفوظ والصور المرفوعة) في .local/ وتبقى بين مرات التشغيل
STORAGE="$PWD/.local"
mkdir -p "$STORAGE"
if [[ -n "$ADMIN_USER" && -n "$ADMIN_PASS" ]]; then
  SUHAD_STORAGE="$STORAGE" "$PHP_BIN" server/tools/create-admin.php "$ADMIN_USER" "$ADMIN_PASS" | sed 's/^/▸ /'
fi

PORT=8080
while lsof -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1; do PORT=$((PORT + 1)); done
URL="http://localhost:$PORT"

echo
echo "  الموقع:        $URL/"
echo "  لوحة التحكم:   $URL/admin/"
[[ -n "$ADMIN_USER" ]] && echo "  اسم المستخدم:  $ADMIN_USER"
echo
echo "  للإيقاف: Control + C"
echo "─────────────────────────────────────────────"

[[ -z "$NO_OPEN" ]] && (sleep 1 && open "$URL/" && open "$URL/admin/") &
SUHAD_STORAGE="$STORAGE" exec "$PHP_BIN" -S "localhost:$PORT" -t dist server/dev-router.php
