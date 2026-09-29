/**
 * وصف كل ما يمكن تعديله في لوحة التحكم.
 * كل صفحة تشير إلى جزء من ملف المحتوى (path)، وكل حقل يحدد نوعه وعنوانه.
 * الأنواع: i18n (نص باللغتين)، i18nList (قائمة نصوص باللغتين)، text، number، bool،
 * select، image، focus، group (مجموعة حقول)، list (عناصر قابلة للإضافة والترتيب)، textList.
 */
import { uid } from './util.js';

const i18n = (key, label, o = {}) => ({ type: 'i18n', key, label, ...o });
const area = (key, label, o = {}) => i18n(key, label, { multiline: true, ...o });
const i18nList = (key, label, o = {}) => ({ type: 'i18nList', key, label, ...o });
const text = (key, label, o = {}) => ({ type: 'text', key, label, ...o });
const num = (key, label, o = {}) => ({ type: 'number', key, label, ...o });
const bool = (key, label, o = {}) => ({ type: 'bool', key, label, ...o });
const select = (key, label, options, o = {}) => ({ type: 'select', key, label, options, ...o });
const image = (key, label, o = {}) => ({ type: 'image', key, label, ...o });
const group = (key, label, fields, o = {}) => ({ type: 'group', key, label, fields, ...o });
const list = (key, label, o) => ({ type: 'list', key, label, ...o });
const empty = () => ({ ar: '', en: '' });

export const STATUS_OPTIONS = [
  { value: 'approved', label: 'معتمد' },
  { value: 'suggested', label: 'مقترح (يظهر عليه وسم «مقترح»)' },
];

export const ICON_OPTIONS = [
  { value: 'plane', label: 'طائرة' },
  { value: 'hotel', label: 'فندق' },
  { value: 'map', label: 'خريطة' },
  { value: 'route', label: 'مسار' },
  { value: 'car', label: 'سيارة / تنقلات' },
  { value: 'luggage', label: 'حقيبة سفر' },
  { value: 'ticket', label: 'تذكرة' },
  { value: 'users', label: 'مجموعات وعائلات' },
  { value: 'camera', label: 'جولات وتصوير' },
  { value: 'shield', label: 'حماية / تأمين' },
  { value: 'pin', label: 'موقع' },
  { value: 'clock', label: 'ساعة' },
  { value: 'chat', label: 'محادثة' },
  { value: 'mail', label: 'بريد' },
];

export const SECTION_LABELS = {
  about: 'من نحن',
  services: 'خدماتنا',
  destinations: 'الوجهات والبرامج',
  cta: 'دعوة للتواصل (الشريط البرقوقي)',
  plan: 'نموذج «خطط رحلتك»',
};

export const SECTION_PAGE = { about: 'about', services: 'services', destinations: 'destinations', cta: 'cta', plan: 'planner' };

export const FEATURES = [
  { key: 'headerCta', label: 'زر «خطط رحلتك» في الترويسة' },
  { key: 'languageSwitch', label: 'زر تبديل اللغة (ع / EN)', help: 'عند إيقافه يظهر الموقع بالعربية فقط.' },
  { key: 'themeToggle', label: 'زر النمط الليلي' },
  { key: 'floatingButton', label: 'زر «تواصل معنا» الثابت أسفل الشاشة' },
  { key: 'scrollRoute', label: 'مسار الطائرة أسفل الترويسة أثناء التمرير' },
  { key: 'heroPath', label: 'المسار المنقّط فوق صور الواجهة (على الحاسوب)' },
  { key: 'parallax', label: 'حركة العمق في الصور أثناء التمرير' },
  { key: 'revealOnScroll', label: 'ظهور العناصر تدريجياً أثناء التمرير' },
];

export const PAGES = [
  {
    id: 'layout',
    title: 'الأقسام وأماكن الظهور',
    icon: 'layout',
    custom: 'layout',
    intro: 'رتّب أقسام الصفحة، وأظهر أو أخفِ ما تريد، وفعّل عناصر الموقع أو أوقفها.',
  },
  {
    id: 'hero',
    title: 'الواجهة والعرض المتحرك',
    icon: 'image',
    path: ['hero'],
    fields: [
      i18n('eyebrow', 'السطر الصغير فوق العنوان'),
      i18n('title', 'العنوان الرئيسي'),
      i18n('titleHighlight', 'الجزء المميّز بالأصفر من العنوان', {
        help: 'اكتب كلمة أو أكثر من العنوان نفسه كما هي تماماً.',
      }),
      area('text', 'الوصف تحت العنوان'),
      group('primaryCta', 'الزر الرئيسي (يقود إلى نموذج الطلب)', [i18n('label', 'نص الزر')]),
      group('secondaryCta', 'الزر الثاني (يقود إلى الوجهات)', [i18n('label', 'نص الزر')]),
      bool('autoplay', 'تشغيل العرض المتحرك تلقائياً', {
        default: true,
        help: 'يبقى متوقفاً دائماً لمن فعّل «تقليل الحركة» في جهازه.',
      }),
      num('interval', 'مدة عرض كل صورة (بالثواني)', { scale: 1000, min: 3, max: 30, step: 0.5 }),
      list('slides', 'صور العرض المتحرك', {
        visibleToggle: true,
        itemLabel: (s, i) => s.place?.ar || `صورة ${i + 1}`,
        itemImage: (s) => s.image,
        newItem: () => ({ id: uid('slide'), image: '', mobileImage: '', focus: 0.5, place: empty(), alt: empty(), visible: true }),
        fields: [
          image('image', 'الصورة'),
          {
            type: 'focus',
            key: 'focus',
            label: 'موضع العنصر الرئيسي في الصورة',
            imageKey: 'image',
            help: 'اضغط على الصورة فوق أهم عنصر فيها. على الحاسوب تُزاح الصورة ليبقى هذا العنصر بعيداً عن العنوان.',
          },
          image('mobileImage', 'صورة مخصّصة للهاتف (اختيارية)', {
            optional: true,
            help: 'صورة عمودية تناسب الهاتف. اتركها فارغة لاستخدام الصورة نفسها.',
          }),
          i18n('place', 'اسم المكان (يظهر أعلى الصورة)'),
          i18n('alt', 'وصف الصورة لقارئات الشاشة'),
        ],
      }),
    ],
  },
  {
    id: 'about',
    title: 'من نحن',
    icon: 'users',
    path: ['about'],
    fields: [
      i18n('eyebrow', 'العنوان الصغير'),
      i18n('title', 'العنوان'),
      i18nList('paragraphs', 'الفقرات', { multiline: true }),
      list('images', 'الصورتان', {
        fixed: true,
        itemLabel: (_, i) => (i === 0 ? 'الصورة الكبيرة' : 'الصورة الصغيرة'),
        itemImage: (it) => it.id,
        fields: [image('id', 'الصورة'), i18n('alt', 'وصف الصورة لقارئات الشاشة'), i18n('caption', 'التعليق تحت الصورة')],
      }),
      select('status', 'حالة النص', STATUS_OPTIONS),
    ],
  },
  {
    id: 'services',
    title: 'خدماتنا',
    icon: 'plane',
    path: ['services'],
    fields: [
      i18n('eyebrow', 'العنوان الصغير'),
      i18n('title', 'العنوان'),
      area('intro', 'المقدمة'),
      list('items', 'الخدمات', {
        visibleToggle: true,
        itemLabel: (s, i) => s.title?.ar || `خدمة ${i + 1}`,
        itemIcon: (s) => s.icon,
        newItem: () => ({ id: uid('service'), icon: 'plane', status: 'approved', title: empty(), text: empty(), visible: true }),
        fields: [
          select('icon', 'الأيقونة', ICON_OPTIONS, { preview: 'icon' }),
          i18n('title', 'اسم الخدمة'),
          area('text', 'الوصف'),
          select('status', 'الحالة', STATUS_OPTIONS),
        ],
      }),
      area('draftNote', 'ملاحظة تظهر فقط عند وجود خدمة «مقترحة»'),
    ],
  },
  {
    id: 'destinations',
    title: 'الوجهات والبرامج',
    icon: 'pin',
    path: ['destinations'],
    fields: [
      i18n('eyebrow', 'العنوان الصغير'),
      i18n('title', 'العنوان'),
      area('intro', 'المقدمة'),
      i18n('inquireLabel', 'نص زر الاستفسار على كل وجهة'),
      list('items', 'الوجهات', {
        visibleToggle: true,
        itemLabel: (d, i) => d.name?.ar || `وجهة ${i + 1}`,
        itemImage: (d) => d.image?.id,
        help: 'الوجهة الأولى تظهر بطاقة كبيرة، ثم تتوزع البقية بنمط المجلة.',
        newItem: () => ({
          id: uid('dest'),
          status: 'approved',
          sample: false,
          name: empty(),
          country: empty(),
          description: empty(),
          image: { id: '', alt: empty() },
          program: null,
          visible: true,
        }),
        fields: [
          i18n('name', 'اسم الوجهة'),
          i18n('country', 'البلد أو المنطقة'),
          area('description', 'الوصف'),
          group('image', 'الصورة', [image('id', 'الصورة'), i18n('alt', 'وصف الصورة لقارئات الشاشة')]),
          bool('sample', 'إظهار وسم «مثال تجريبي» على هذه الوجهة'),
          group(
            'program',
            'تفاصيل البرنامج (اختيارية)',
            [i18n('duration', 'المدة'), i18nList('includes', 'يشمل'), area('terms', 'الشروط')],
            { help: 'تظهر على البطاقة فقط إن عُبّئت. لا تُكتب أسعار أو عروض غير مؤكدة.' },
          ),
        ],
      }),
      area('sampleNote', 'ملاحظة «أمثلة تجريبية»', {
        help: 'تظهر فقط إن كانت وجهة واحدة على الأقل معلّمة «مثال تجريبي».',
      }),
      group('programLabels', 'عناوين تفاصيل البرنامج', [i18n('duration', 'المدة'), i18n('includes', 'يشمل'), i18n('terms', 'الشروط')]),
    ],
  },
  {
    id: 'cta',
    title: 'دعوة للتواصل',
    icon: 'chat',
    path: ['cta'],
    fields: [
      i18n('titleLead', 'السطر الأول (أبيض)'),
      i18n('titleRest', 'السطر الثاني (أصفر)'),
      area('text', 'النص'),
      group('button', 'الزر', [i18n('label', 'نص الزر')]),
    ],
  },
  {
    id: 'planner',
    title: 'نموذج «خطط رحلتك»',
    icon: 'mail',
    path: ['planner'],
    fields: [
      i18n('eyebrow', 'العنوان الصغير'),
      i18n('title', 'العنوان'),
      area('intro', 'المقدمة'),
      i18nList('steps', 'الخطوات المرقّمة'),
      area('privacy', 'ملاحظة الخصوصية'),
      i18n('formTitle', 'عنوان النموذج'),
      i18n('required', 'وسم الحقل المطلوب'),
      i18n('optional', 'وسم الحقل الاختياري'),
      group('fields', 'حقول النموذج', [
        group('name', 'الاسم', [i18n('label', 'العنوان'), i18n('placeholder', 'النص الإرشادي')]),
        group('destination', 'الوجهة', [
          i18n('label', 'العنوان'),
          i18n('placeholder', 'النص الإرشادي'),
          i18n('undecided', 'خيار «لم أحدد بعد»'),
          i18n('prefilled', 'رسالة اختيار وجهة من البطاقات', { help: '{value} تُستبدل باسم الوجهة.' }),
        ]),
        group('date', 'تاريخ السفر', [i18n('label', 'العنوان'), i18n('flexible', 'خيار «مرن»')]),
        group('travelers', 'عدد المسافرين', [
          i18n('label', 'العنوان'),
          i18n('decrease', 'وصف زر الإنقاص'),
          i18n('increase', 'وصف زر الزيادة'),
          num('min', 'أقل عدد', { min: 1, max: 10 }),
          num('max', 'أكبر عدد', { min: 2, max: 500 }),
        ]),
        group('notes', 'الملاحظات', [
          i18n('label', 'العنوان'),
          area('placeholder', 'النص الإرشادي'),
          num('maxLength', 'أقصى عدد أحرف', { min: 50, max: 2000 }),
        ]),
      ]),
      i18n('submit', 'زر المتابعة'),
      area('submitNote', 'الملاحظة تحت الزر'),
      group('errors', 'رسائل الأخطاء', [
        i18n('summary', 'رسالة عامة'),
        i18n('nameRequired', 'الاسم فارغ'),
        i18n('nameShort', 'الاسم قصير'),
        i18n('destinationRequired', 'الوجهة فارغة'),
        i18n('travelersRange', 'عدد المسافرين خارج الحد', { help: '{min} و {max} تُستبدلان بالأرقام.' }),
      ]),
      group('review', 'شاشة مراجعة الرسالة', [
        i18n('title', 'العنوان'),
        area('text', 'النص'),
        i18n('to', 'كلمة «إلى»'),
        i18n('subject', 'كلمة «الموضوع»'),
        i18n('openEmail', 'زر فتح البريد'),
        area('openEmailNote', 'الملاحظة تحت زر البريد'),
        i18n('whatsapp', 'زر واتساب'),
        i18n('copy', 'زر النسخ'),
        i18n('copied', 'رسالة نجاح النسخ'),
        i18n('copyFailed', 'رسالة تعذّر النسخ'),
        i18n('edit', 'زر تعديل البيانات'),
        i18n('notActiveTitle', 'عنوان «البريد غير مفعّل»'),
        area('notActiveText', 'نص «البريد غير مفعّل»'),
      ]),
      group(
        'message',
        'قالب الرسالة المرسلة',
        [
          i18n('subject', 'الموضوع', { help: '{destination} = الوجهة' }),
          i18n('greeting', 'التحية', { help: '{company} = اسم الشركة' }),
          i18n('intro', 'المقدمة'),
          i18n('name', 'عنوان الاسم'),
          i18n('destination', 'عنوان الوجهة'),
          i18n('date', 'عنوان التاريخ'),
          i18n('travelers', 'عنوان عدد المسافرين'),
          i18n('notes', 'عنوان الملاحظات'),
          i18n('notSet', 'عبارة «لم يُحدَّد»'),
          area('closing', 'الخاتمة'),
        ],
      ),
    ],
  },
  {
    id: 'footer',
    title: 'التذييل',
    icon: 'type',
    path: ['footer'],
    fields: [
      area('tagline', 'السطر تحت الشعار'),
      i18n('contactTitle', 'عنوان «تواصل معنا»'),
      i18n('emailLabel', 'عنوان البريد'),
      i18n('hoursLabel', 'عنوان ساعات العمل'),
      i18n('emailPending', 'عبارة عند غياب البريد'),
      i18n('hoursPending', 'عبارة عند غياب ساعات العمل'),
      i18n('linksTitle', 'عنوان الروابط السريعة'),
      i18n('planLink', 'زر «خطط رحلتك»'),
      i18n('copyEmail', 'زر نسخ البريد'),
      i18n('copied', 'رسالة نجاح النسخ'),
      i18n('rights', 'عبارة الحقوق'),
      i18n('creditsTitle', 'عنوان مصادر الصور'),
      area('creditsNote', 'ملاحظة مصادر الصور'),
      i18n('sourceLabel', 'نص رابط المصدر'),
    ],
  },
  {
    id: 'settings',
    title: 'التواصل والإعدادات العامة',
    icon: 'sliders',
    path: [],
    fields: [
      group('company', 'الشركة', [
        i18n('name', 'الاسم الكامل'),
        i18n('shortName', 'الاسم المختصر'),
        text('url', 'رابط الموقع النهائي', {
          dir: 'ltr',
          inputType: 'url',
          placeholder: 'https://',
          help: 'يُفعّل الرابط الأساسي والبيانات المنظمة لمحركات البحث.',
        }),
      ]),
      group('contact', 'التواصل', [
        text('email', 'البريد الإلكتروني', { dir: 'ltr', inputType: 'email', nullable: true }),
        text('whatsapp', 'رقم واتساب (اختياري)', {
          dir: 'ltr',
          nullable: true,
          help: 'بالصيغة الدولية مثل 9647XXXXXXXXX. لا يُعرض الرقم؛ يظهر زر «متابعة عبر واتساب» فقط.',
        }),
        list('hours', 'ساعات العمل', {
          itemLabel: (h, i) => h.days?.ar || `فترة ${i + 1}`,
          newItem: () => ({ days: empty(), time: empty() }),
          fields: [i18n('days', 'الأيام'), i18n('time', 'الوقت')],
        }),
        { type: 'textList', key: 'openingHours', label: 'ساعات العمل لمحركات البحث', help: 'بصيغة schema.org، مثل: Sa-Th 10:00-17:00', dir: 'ltr' },
        list('social', 'روابط التواصل الاجتماعي', {
          visibleToggle: true,
          itemLabel: (s, i) => s.label?.ar || `رابط ${i + 1}`,
          newItem: () => ({ label: empty(), href: '', visible: true }),
          fields: [i18n('label', 'الاسم'), text('href', 'الرابط', { dir: 'ltr', inputType: 'url', placeholder: 'https://' })],
        }),
      ]),
      group('seo', 'محركات البحث والمشاركة', [
        i18n('title', 'عنوان الصفحة'),
        area('description', 'وصف الصفحة'),
        image('ogImage', 'صورة المشاركة', { optional: true, help: 'تظهر عند مشاركة رابط الموقع. الافتراضية: صورة المنطاد.' }),
      ]),
    ],
  },
  {
    id: 'texts',
    title: 'نصوص عامة',
    icon: 'type',
    path: [],
    fields: [
      list('nav', 'روابط القائمة', {
        fixed: true,
        noReorder: true,
        visibleToggle: true,
        itemLabel: (n) => n.label?.ar,
        help: 'ترتيبها يتبع ترتيب الأقسام، وروابط الأقسام المخفية تختفي تلقائياً.',
        fields: [i18n('label', 'النص')],
      }),
      group('headerCta', 'زر الترويسة', [i18n('label', 'النص')]),
      group('fab', 'زر التواصل الثابت', [i18n('label', 'النص')]),
      group('ui', 'نصوص الواجهة الأخرى', [
        i18n('skipLink', 'رابط «انتقل إلى المحتوى»'),
        i18n('menuOpen', 'وصف زر فتح القائمة'),
        i18n('menuClose', 'وصف زر إغلاق القائمة'),
        i18n('mainNavLabel', 'اسم القائمة لقارئات الشاشة'),
        i18n('darkMode', 'وصف زر النمط الليلي'),
        i18n('suggested', 'وسم «مقترح»'),
        i18n('sample', 'وسم «مثال تجريبي»'),
        i18n('imageNote', 'عبارة «صورة توضيحية»'),
        group('slider', 'أزرار العرض المتحرك', [
          i18n('label', 'اسم العرض لقارئات الشاشة'),
          i18n('previous', 'زر السابق'),
          i18n('next', 'زر التالي'),
          i18n('pause', 'زر الإيقاف'),
          i18n('play', 'زر التشغيل'),
          i18n('slide', 'وصف الصورة', { help: '{n} رقم الصورة، {total} العدد.' }),
          i18n('goTo', 'زر الانتقال لصورة', { help: '{n} رقم الصورة، {place} المكان.' }),
        ]),
      ]),
    ],
  },
  { id: 'media', title: 'مكتبة الصور', icon: 'camera', custom: 'media' },
  { id: 'backups', title: 'النسخ السابقة', icon: 'history', custom: 'backups' },
  { id: 'account', title: 'الحساب', icon: 'user', custom: 'account' },
];
