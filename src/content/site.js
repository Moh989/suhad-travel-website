/**
 * ملف المحتوى المركزي لموقع السهاد — بالعربية والإنجليزية معاً.
 *
 * كل نص مكتوب بالصيغة { ar: '…', en: '…' } فيُعدَّل الاتجاهان من مكان واحد.
 * القيم التي لا تتغير بين اللغتين (الصور، البريد، المعرّفات) تُكتب مرة واحدة.
 * إعدادات اللغات نفسها (الاتجاه، تنسيق التاريخ) في content/index.js.
 *
 * حالة المحتوى (status):
 *   'suggested' ← يظهر عليه وسم «مقترح» حتى تعتمده الشركة.
 *   'approved'  ← معتمد، ويختفي الوسم.
 * sample: true ← بيانات تجريبية للمعاينة (وسم «مثال تجريبي»).
 *
 * القيم null تعني أن البيانات لم تُزوَّد بعد؛ يعرض الموقع عندها حالة
 * «لم يُفعَّل بعد» بدلاً من اختلاق أرقام أو روابط.
 */

const site = {
  company: {
    name: {
      ar: 'السهاد للسفر والسياحة المحدودة',
      // لا يوجد اسم إنجليزي في الشعار: هذا نقل صوتي مقترح بانتظار اعتماد الشركة.
      en: 'Al-Suhad Travel & Tourism Ltd.',
    },
    shortName: { ar: 'السهاد', en: 'Al-Suhad' },
    // النطاق النهائي للموقع، مثل 'https://example.com'. يُفعِّل البيانات المنظمة عند تعبئته.
    url: null,
    logo: {
      src: 'brand/suhad-logo-640.png',
      srcSet: 'brand/suhad-logo-320.png 320w, brand/suhad-logo-640.png 640w, brand/suhad-logo.png 1957w',
      width: 1957,
      height: 856,
      alt: { ar: 'السهاد للسفر والسياحة المحدودة', en: 'Al-Suhad Travel & Tourism' },
    },
  },

  contact: {
    // البريد الرسمي للشركة. يفعّل زر «فتح الرسالة في البريد» وزر «تواصل معنا» الثابت.
    email: 'info@alsuhadtours.com',
    // اختياري: رقم واتساب بالصيغة الدولية، مثل '9647XXXXXXXXX'.
    // لا يُعرض الرقم نصاً؛ يظهر فقط زر «متابعة عبر واتساب» بعد مراجعة الرسالة.
    whatsapp: null,
    // ساعات العمل كما تظهر في الموقع.
    hours: [
      {
        days: { ar: 'يومياً عدا الجمعة', en: 'Daily except Friday' },
        time: { ar: 'من 10 صباحاً حتى 5 مساءً', en: '10:00 am – 5:00 pm' },
      },
    ],
    // الصيغة نفسها لمحركات البحث (schema.org): السبت إلى الخميس، 10:00–17:00.
    openingHours: ['Sa-Th 10:00-17:00'],
    // روابط التواصل الاجتماعي: [{ label: { ar: 'إنستغرام', en: 'Instagram' }, href: 'https://…' }]
    social: [],
  },

  /**
   * أماكن الظهور: ترتيب الأقسام بين الواجهة والتذييل، وإظهارها أو إخفاؤها.
   * الواجهة في الأعلى والتذييل في الأسفل دائماً. نموذج «خطط رحلتك» لا يُخفى لأنه الإجراء الرئيسي.
   */
  layout: {
    sections: [
      { id: 'about', visible: true },
      { id: 'services', visible: true },
      { id: 'destinations', visible: true },
      { id: 'cta', visible: true },
      { id: 'plan', visible: true },
    ],
  },

  /** عناصر يمكن إيقافها من لوحة التحكم. */
  features: {
    headerCta: true,
    languageSwitch: true,
    themeToggle: true,
    floatingButton: true,
    scrollRoute: true,
    heroPath: true,
    parallax: true,
    revealOnScroll: true,
  },

  seo: {
    title: {
      ar: 'السهاد للسفر والسياحة المحدودة | خطط رحلتك القادمة',
      en: 'Al-Suhad Travel & Tourism | Plan your next trip',
    },
    description: {
      ar: 'السهاد للسفر والسياحة: أخبرنا عن وجهتك وموعد سفرك وعدد المسافرين، ونساعدك في ترتيب تفاصيل رحلتك.',
      en: 'Al-Suhad Travel & Tourism: tell us your destination, travel dates and group size, and we will help you arrange the details of your trip.',
    },
    ogImage: 'og-image.jpg',
    themeColor: '#5c1337',
  },

  ui: {
    skipLink: { ar: 'انتقل إلى المحتوى', en: 'Skip to content' },
    menuOpen: { ar: 'فتح القائمة', en: 'Open menu' },
    menuClose: { ar: 'إغلاق القائمة', en: 'Close menu' },
    mainNavLabel: { ar: 'التنقل الرئيسي', en: 'Main navigation' },
    darkMode: { ar: 'النمط الليلي', en: 'Dark mode' },
    suggested: { ar: 'مقترح', en: 'Suggested' },
    sample: { ar: 'مثال تجريبي', en: 'Sample' },
    pending: { ar: 'بانتظار التزويد', en: 'Pending' },
    imageNote: { ar: 'صورة توضيحية', en: 'Illustrative photo' },
    slider: {
      label: { ar: 'صور من وجهات مختارة', en: 'Photos from selected destinations' },
      slide: { ar: 'الصورة {n} من {total}', en: 'Photo {n} of {total}' },
      goTo: { ar: 'اعرض الصورة {n}: {place}', en: 'Show photo {n}: {place}' },
      previous: { ar: 'الصورة السابقة', en: 'Previous photo' },
      next: { ar: 'الصورة التالية', en: 'Next photo' },
      pause: { ar: 'إيقاف العرض المتحرك', en: 'Pause slideshow' },
      play: { ar: 'تشغيل العرض المتحرك', en: 'Play slideshow' },
    },
  },

  nav: [
    { id: 'home', href: '#home', label: { ar: 'الرئيسية', en: 'Home' } },
    { id: 'about', href: '#about', label: { ar: 'من نحن', en: 'About' } },
    { id: 'services', href: '#services', label: { ar: 'خدماتنا', en: 'Services' } },
    { id: 'destinations', href: '#destinations', label: { ar: 'الوجهات', en: 'Destinations' } },
    { id: 'contact', href: '#contact', label: { ar: 'تواصل معنا', en: 'Contact' } },
  ],

  headerCta: { href: '#plan', label: { ar: 'خطط رحلتك', en: 'Plan your trip' } },

  hero: {
    eyebrow: { ar: 'السهاد للسفر والسياحة', en: 'Al-Suhad Travel & Tourism' },
    title: { ar: 'وجهتك القادمة تبدأ من السهاد', en: 'Your next destination starts with Al-Suhad' },
    // الكلمة التي تظهر بلون الإبراز داخل العنوان.
    titleHighlight: { ar: 'السهاد', en: 'Al-Suhad' },
    text: {
      ar: 'من الفكرة الأولى إلى تفاصيل الطريق، نساعدك في ترتيب رحلتك بخطوات واضحة.',
      en: 'From the first idea to the last detail, we help you plan your trip in clear, simple steps.',
    },
    primaryCta: { href: '#plan', label: { ar: 'خطط رحلتك معنا', en: 'Plan your trip with us' } },
    secondaryCta: { href: '#destinations', label: { ar: 'استكشف الوجهات', en: 'Explore destinations' } },
    // تشغيل العرض المتحرك تلقائياً، ومدة عرض كل صورة بالميلي ثانية.
    autoplay: true,
    interval: 7000,
    /**
     * صور العرض المتحرك. focus: موضع العنصر الرئيسي في الصورة (0 = اليسار، 1 = اليمين)؛
     * يُستخدم على الحاسوب لإبقائه بعيداً عن النص في الاتجاهين.
     */
    slides: [
      {
        id: 'cappadocia',
        image: 'hero',
        mobileImage: 'heroMobile',
        focus: 0.43,
        place: { ar: 'كابادوكيا، تركيا', en: 'Cappadocia, Türkiye' },
        alt: {
          ar: 'منطاد هوائي يحلّق فوق تلال كابادوكيا عند شروق الشمس',
          en: 'A hot-air balloon over the hills of Cappadocia at sunrise',
        },
      },
      {
        id: 'maldives',
        image: 'slideMaldives',
        mobileImage: 'slideMaldivesMobile',
        focus: 0.5,
        place: { ar: 'جزر المالديف', en: 'The Maldives' },
        alt: {
          ar: 'ممر خشبي فوق مياه فيروزية يقود إلى جزيرة استوائية',
          en: 'A wooden jetty over turquoise water leading to a tropical island',
        },
      },
      {
        id: 'lucerne',
        image: 'slideLucerne',
        mobileImage: 'slideLucerneMobile',
        focus: 0.57,
        place: { ar: 'لوتسيرن، سويسرا', en: 'Lucerne, Switzerland' },
        alt: {
          ar: 'جسر كابيل الخشبي المزيّن بالزهور وبرج الماء الحجري',
          en: 'The flower-lined Chapel Bridge and the stone water tower',
        },
      },
      {
        id: 'dubai',
        image: 'slideDubai',
        mobileImage: 'slideDubaiMobile',
        focus: 0.55,
        place: { ar: 'دبي، الإمارات', en: 'Dubai, UAE' },
        alt: {
          ar: 'أفق دبي ليلاً وبرج خليفة تنعكس أضواؤه على الماء',
          en: 'The Dubai skyline at night with Burj Khalifa reflected in the water',
        },
      },
    ],
  },

  about: {
    status: 'approved',
    eyebrow: { ar: 'من نحن', en: 'About us' },
    title: { ar: 'نرتّب التفاصيل، لتبقى الرحلة لك', en: 'We handle the details, so the journey stays yours' },
    paragraphs: {
      ar: [
        'السهاد للسفر والسياحة شركة تعمل في تنظيم السفر والسياحة. نبدأ معك من سؤال بسيط: كيف تتخيّل رحلتك؟ ثم نساعدك في تحويل الفكرة إلى خطة واضحة.',
        'نستمع إلى ما يهمّك في الوجهة والموعد وطبيعة الإقامة، ونحرص على أن تكون التفاصيل مفهومة لك قبل أن تبدأ السفر.',
      ],
      en: [
        'Al-Suhad Travel & Tourism is a company working in travel and tourism. We start with a simple question: how do you picture your trip? Then we help turn that idea into a clear plan.',
        'We listen to what matters to you in the destination, the timing and the kind of stay, and make sure the details are clear to you before you set off.',
      ],
    },
    images: [
      {
        id: 'aboutDesert',
        alt: {
          ar: 'كثبان رملية حمراء وتكوينات صخرية في صحراء وادي رم',
          en: 'Red sand dunes and rock formations in the Wadi Rum desert',
        },
        caption: { ar: 'وادي رم، الأردن', en: 'Wadi Rum, Jordan' },
      },
      {
        id: 'aboutWing',
        alt: { ar: 'طرف جناح طائرة فوق الغيوم في ضوء الشمس', en: 'An aircraft wing tip above sunlit clouds' },
        caption: { ar: 'فوق الغيوم', en: 'Above the clouds' },
      },
    ],
  },

  services: {
    eyebrow: { ar: 'خدماتنا', en: 'Our services' },
    title: { ar: 'ما نرتّبه لرحلتك', en: 'What we arrange for your trip' },
    intro: {
      ar: 'خدمات أساسية تساعدك على السفر بتفاصيل منظمة، من الحجز حتى برنامج الأيام.',
      en: 'Core services that keep your travel organised, from booking to the day-by-day plan.',
    },
    draftNote: {
      ar: 'قائمة الخدمات مقترحة للمعاينة، وتُعدَّل حسب ما تقدّمه الشركة فعلياً.',
      en: 'This list of services is a suggestion for preview and will be updated to match what the company offers.',
    },
    items: [
      {
        id: 'flights',
        icon: 'plane',
        status: 'approved',
        title: { ar: 'حجوزات الطيران', en: 'Flight bookings' },
        text: {
          ar: 'نبحث معك عن رحلات تناسب وجهتك ومواعيدك، ونوضّح لك الخيارات قبل الحجز.',
          en: 'We look for flights that suit your destination and dates, and explain the options before you book.',
        },
      },
      {
        id: 'hotels',
        icon: 'hotel',
        status: 'approved',
        title: { ar: 'حجوزات الفنادق', en: 'Hotel bookings' },
        text: {
          ar: 'إقامة تلائم طبيعة رحلتك وميزانيتك، في موقع قريب مما تريد رؤيته.',
          en: 'A stay that fits your trip and budget, close to what you want to see.',
        },
      },
      {
        id: 'programs',
        icon: 'map',
        status: 'approved',
        title: { ar: 'البرامج السياحية', en: 'Tour programmes' },
        text: {
          ar: 'برنامج منظّم لأيام الرحلة يجمع الأماكن والتنقلات في خطة واحدة واضحة.',
          en: 'An organised plan for each day, bringing places and transfers together in one clear schedule.',
        },
      },
      {
        id: 'private',
        icon: 'route',
        status: 'approved',
        title: { ar: 'ترتيب الرحلات الخاصة', en: 'Private trip arrangements' },
        text: {
          ar: 'رحلات للعائلات والمجموعات الصغيرة، تُرتَّب تفاصيلها حسب اهتماماتكم وإيقاعكم.',
          en: 'Trips for families and small groups, arranged around your interests and pace.',
        },
      },
    ],
  },

  destinations: {
    eyebrow: { ar: 'الوجهات والبرامج', en: 'Destinations & programmes' },
    title: { ar: 'أماكن تستحق الرحلة', en: 'Places worth the journey' },
    intro: {
      ar: 'اختر وجهة تلهمك، وأرسل لنا استفسارك لنرتّب التفاصيل حولها.',
      en: 'Pick a destination that inspires you and send us your enquiry. We will arrange the details around it.',
    },
    sampleNote: {
      ar: 'الوجهات المعروضة أمثلة تجريبية للمعاينة فقط، ولا تتضمن أسعاراً أو مواعيد أو عروضاً.',
      en: 'These destinations are sample content for preview only. They include no prices, dates or offers.',
    },
    inquireLabel: { ar: 'استفسر عن هذه الوجهة', en: 'Enquire about this destination' },
    programLabels: {
      duration: { ar: 'المدة', en: 'Duration' },
      includes: { ar: 'يشمل', en: 'Includes' },
      terms: { ar: 'الشروط', en: 'Terms' },
    },
    items: [
      {
        id: 'istanbul',
        status: 'approved',
        sample: true,
        name: { ar: 'إسطنبول', en: 'Istanbul' },
        country: { ar: 'تركيا', en: 'Türkiye' },
        description: {
          ar: 'مدينة على ضفتي البوسفور، تجمع الأسواق القديمة والمساجد التاريخية وإطلالات الماء عند الغروب.',
          en: 'A city on both banks of the Bosphorus, with old bazaars, historic mosques and waterside views at sunset.',
        },
        image: {
          id: 'istanbul',
          alt: {
            ar: 'برج غلطة وأحياء إسطنبول القديمة على ضفة القرن الذهبي في ضوء الغروب',
            en: 'Galata Tower and the old quarters of Istanbul on the Golden Horn at sunset',
          },
        },
        // تفاصيل البرنامج تُعرض فقط عند تزويدها بمعلومات حقيقية:
        // program: { duration: { ar: '5 أيام', en: '5 days' }, includes: { ar: ['…'], en: ['…'] }, terms: { ar: '…', en: '…' } }
        program: null,
      },
      {
        id: 'georgia',
        status: 'approved',
        sample: true,
        name: { ar: 'جورجيا', en: 'Georgia' },
        country: { ar: 'جبال القوقاز', en: 'Caucasus Mountains' },
        description: {
          ar: 'جبال خضراء وقرى هادئة وطرق جبلية مفتوحة، لمن يبحث عن الطبيعة والهواء النقي.',
          en: 'Green mountains, quiet villages and open mountain roads, for those looking for nature and fresh air.',
        },
        image: {
          id: 'georgia',
          alt: {
            ar: 'كنيسة الثالوث في جيرغيتي على تلة خضراء وخلفها جبل كازبيك المكسو بالثلج',
            en: 'Gergeti Trinity Church on a green hill below snow-capped Mount Kazbek',
          },
        },
        program: null,
      },
      {
        id: 'dubai',
        status: 'approved',
        sample: true,
        name: { ar: 'دبي', en: 'Dubai' },
        country: { ar: 'الإمارات العربية المتحدة', en: 'United Arab Emirates' },
        description: {
          ar: 'أفق مضيء وشواطئ ومراكز تسوّق، ووجهة قريبة للرحلات القصيرة والعائلية.',
          en: 'A glittering skyline, beaches and shopping, and a nearby choice for short breaks and family trips.',
        },
        image: {
          id: 'dubai',
          alt: {
            ar: 'أفق دبي ليلاً وبرج خليفة تنعكس أضواؤه على الماء',
            en: 'The Dubai skyline at night with Burj Khalifa reflected in the water',
          },
        },
        program: null,
      },
      {
        id: 'kuala-lumpur',
        status: 'approved',
        sample: true,
        name: { ar: 'كوالالمبور', en: 'Kuala Lumpur' },
        country: { ar: 'ماليزيا', en: 'Malaysia' },
        description: {
          ar: 'مدينة حديثة تحيط بها الطبيعة الاستوائية، ومنطلق لاستكشاف الجزر والمرتفعات.',
          en: 'A modern city surrounded by tropical nature, and a starting point for the islands and highlands.',
        },
        image: {
          id: 'malaysia',
          alt: {
            ar: 'برجا بتروناس التوأم مضاءان عند الغسق في كوالالمبور',
            en: 'The Petronas Twin Towers lit up at dusk in Kuala Lumpur',
          },
        },
        program: null,
      },
      {
        id: 'maldives',
        status: 'approved',
        sample: true,
        name: { ar: 'جزر المالديف', en: 'The Maldives' },
        country: { ar: 'المحيط الهندي', en: 'Indian Ocean' },
        description: {
          ar: 'جزر صغيرة ومياه فيروزية صافية، لرحلات الاسترخاء وشهر العسل.',
          en: 'Small islands and clear turquoise water, for relaxing escapes and honeymoons.',
        },
        image: {
          id: 'maldives',
          alt: {
            ar: 'ممر خشبي فوق مياه فيروزية يقود إلى جزيرة استوائية في المالديف',
            en: 'A wooden jetty over turquoise water leading to a tropical island in the Maldives',
          },
        },
        program: null,
      },
      {
        id: 'lucerne',
        status: 'approved',
        sample: true,
        name: { ar: 'لوتسيرن', en: 'Lucerne' },
        country: { ar: 'سويسرا', en: 'Switzerland' },
        description: {
          ar: 'بحيرة وجسور خشبية وجبال قريبة، ومدينة هادئة يسهل التنقل منها إلى جبال الألب.',
          en: 'A lake, wooden bridges and nearby peaks, and a calm city with easy access to the Alps.',
        },
        image: {
          id: 'lucerne',
          alt: {
            ar: 'جسر كابيل الخشبي المزيّن بالزهور وبرج الماء الحجري في لوتسيرن',
            en: 'The flower-lined Chapel Bridge and stone water tower in Lucerne',
          },
        },
        program: null,
      },
    ],
  },

  cta: {
    titleLead: { ar: 'أخبرنا عن رحلتك…', en: 'Tell us about your trip…' },
    titleRest: { ar: 'ودع التفاصيل تبدأ معنا', en: 'and let the details start with us' },
    text: {
      ar: 'بضع معلومات تكفي لنبدأ. تملأ النموذج، وتراجع رسالتك، ثم ترسلها بنفسك.',
      en: 'A few details are enough to begin. Fill in the form, review your message, then send it yourself.',
    },
    button: { href: '#plan', label: { ar: 'ابدأ طلب الرحلة', en: 'Start your trip request' } },
  },

  planner: {
    eyebrow: { ar: 'خطط رحلتك', en: 'Plan your trip' },
    title: { ar: 'خطط رحلتك معنا', en: 'Plan your trip with us' },
    intro: {
      ar: 'املأ ما تعرفه الآن، ولا بأس إن كانت بعض التفاصيل غير محددة بعد.',
      en: 'Fill in what you know now. It is fine if some details are not settled yet.',
    },
    steps: {
      ar: [
        'اكتب التفاصيل الأساسية لرحلتك.',
        'راجع الرسالة الجاهزة قبل إرسالها.',
        'أرسلها من بريدك الإلكتروني، ونتواصل معك للتفاصيل.',
      ],
      en: [
        'Enter the basic details of your trip.',
        'Review the ready-made message before sending it.',
        'Send it from your email, and we will get back to you.',
      ],
    },
    privacy: {
      ar: 'لا يحفظ الموقع بياناتك، ولا نطلب وثائق سفر أو معلومات دفع.',
      en: 'This website does not store your details, and we never ask for travel documents or payment information.',
    },
    formTitle: { ar: 'طلب رحلة', en: 'Trip request' },
    required: { ar: 'مطلوب', en: 'Required' },
    optional: { ar: 'اختياري', en: 'Optional' },
    fields: {
      name: {
        label: { ar: 'الاسم', en: 'Name' },
        placeholder: { ar: 'اسمك الكامل', en: 'Your full name' },
      },
      destination: {
        label: { ar: 'الوجهة المطلوبة', en: 'Destination' },
        placeholder: { ar: 'اكتب الوجهة أو اختر من القائمة', en: 'Type or pick a destination' },
        undecided: { ar: 'لم أحدد بعد، أحتاج اقتراحاً', en: 'Not decided yet, I would like suggestions' },
        prefilled: { ar: 'اخترت: {value}. يمكنك تعديلها.', en: 'Selected: {value}. You can change it.' },
      },
      date: {
        label: { ar: 'تاريخ السفر التقريبي', en: 'Approximate travel date' },
        flexible: { ar: 'مرن / لم أحدد بعد', en: 'Flexible / not decided' },
      },
      travelers: {
        label: { ar: 'عدد المسافرين', en: 'Number of travellers' },
        decrease: { ar: 'إنقاص عدد المسافرين', en: 'Decrease number of travellers' },
        increase: { ar: 'زيادة عدد المسافرين', en: 'Increase number of travellers' },
        min: 1,
        max: 50,
      },
      notes: {
        label: { ar: 'ملاحظات', en: 'Notes' },
        placeholder: {
          ar: 'مثل: رحلة عائلية مع أطفال، أو تفضيلات في الإقامة',
          en: 'For example: a family trip with children, or accommodation preferences',
        },
        maxLength: 500,
      },
    },
    errors: {
      summary: { ar: 'يرجى تصحيح الحقول المشار إليها.', en: 'Please correct the highlighted fields.' },
      nameRequired: { ar: 'اكتب اسمك حتى نعرف بمن نتواصل.', en: 'Enter your name so we know who to contact.' },
      nameShort: { ar: 'الاسم قصير جداً؛ اكتب حرفين على الأقل.', en: 'That name is too short. Use at least 2 characters.' },
      destinationRequired: {
        ar: 'اكتب الوجهة التي تفكر بها، أو اختر «لم أحدد بعد».',
        en: 'Enter the destination you have in mind, or choose “Not decided yet”.',
      },
      travelersRange: { ar: 'اكتب عدداً صحيحاً من {min} إلى {max}.', en: 'Enter a whole number from {min} to {max}.' },
    },
    submit: { ar: 'متابعة عبر البريد الإلكتروني', en: 'Continue by email' },
    submitNote: {
      ar: 'ستظهر لك الرسالة كاملة للمراجعة قبل فتح البريد.',
      en: 'You will see the full message to review before your email app opens.',
    },
    review: {
      title: { ar: 'راجع رسالتك قبل الإرسال', en: 'Review your message before sending' },
      text: {
        ar: 'جهّزنا الرسالة من البيانات التي أدخلتها. يمكنك تعديلها في تطبيق البريد قبل الإرسال.',
        en: 'We have prepared this message from your details. You can still edit it in your email app before sending.',
      },
      to: { ar: 'إلى', en: 'To' },
      subject: { ar: 'الموضوع', en: 'Subject' },
      openEmail: { ar: 'فتح الرسالة في البريد', en: 'Open message in email' },
      openEmailNote: {
        ar: 'سيفتح تطبيق البريد لديك برسالة جاهزة. لن يُرسَل شيء حتى تضغط أنت «إرسال». إن لم يفتح التطبيق، انسخ النص وأرسله إلى العنوان أعلاه.',
        en: 'Your email app will open with the message ready. Nothing is sent until you press Send yourself. If the app does not open, copy the text and send it to the address above.',
      },
      whatsapp: { ar: 'متابعة عبر واتساب', en: 'Continue on WhatsApp' },
      copy: { ar: 'نسخ نص الرسالة', en: 'Copy message text' },
      copied: { ar: 'نُسخ النص', en: 'Text copied' },
      copyFailed: {
        ar: 'تعذّر النسخ التلقائي؛ حدّد النص وانسخه يدوياً.',
        en: 'Could not copy automatically. Select the text and copy it manually.',
      },
      edit: { ar: 'تعديل البيانات', en: 'Edit details' },
      notActiveTitle: { ar: 'التواصل عبر البريد لم يُفعَّل بعد', en: 'Email contact is not active yet' },
      notActiveText: {
        ar: 'سيُضاف عنوان البريد الرسمي للشركة قريباً. يمكنك نسخ نص رسالتك والاحتفاظ به حتى ذلك الحين.',
        en: 'The company’s official email address will be added soon. You can copy your message and keep it until then.',
      },
    },
    message: {
      subject: { ar: 'طلب تخطيط رحلة: {destination}', en: 'Trip planning request: {destination}' },
      greeting: { ar: 'مرحباً فريق {company}،', en: 'Hello {company} team,' },
      intro: { ar: 'أرغب في التخطيط لرحلة، وهذه تفاصيلها:', en: 'I would like to plan a trip. Here are the details:' },
      name: { ar: 'الاسم', en: 'Name' },
      destination: { ar: 'الوجهة المطلوبة', en: 'Destination' },
      date: { ar: 'تاريخ السفر التقريبي', en: 'Approximate travel date' },
      travelers: { ar: 'عدد المسافرين', en: 'Number of travellers' },
      notes: { ar: 'ملاحظات', en: 'Notes' },
      notSet: { ar: 'لم يُحدَّد بعد', en: 'Not decided yet' },
      closing: {
        ar: 'أرجو التواصل معي لمناقشة الخيارات المناسبة.\nشكراً لكم.',
        en: 'Please contact me to discuss suitable options.\nThank you.',
      },
    },
  },

  footer: {
    tagline: {
      ar: 'نساعدك في ترتيب رحلتك، من الفكرة إلى التفاصيل.',
      en: 'We help you plan your trip, from the idea to the details.',
    },
    contactTitle: { ar: 'تواصل معنا', en: 'Contact us' },
    emailLabel: { ar: 'البريد الإلكتروني', en: 'Email' },
    hoursLabel: { ar: 'ساعات العمل', en: 'Working hours' },
    emailPending: { ar: 'سيُضاف البريد الرسمي قريباً', en: 'Official email coming soon' },
    hoursPending: { ar: 'ستُضاف ساعات العمل قريباً', en: 'Working hours coming soon' },
    linksTitle: { ar: 'روابط سريعة', en: 'Quick links' },
    planLink: { ar: 'خطط رحلتك', en: 'Plan your trip' },
    copyEmail: { ar: 'نسخ البريد', en: 'Copy email' },
    copied: { ar: 'نُسخ', en: 'Copied' },
    rights: { ar: 'جميع الحقوق محفوظة.', en: 'All rights reserved.' },
    creditsTitle: { ar: 'مصادر الصور وتراخيصها', en: 'Image sources & licences' },
    creditsNote: {
      ar: 'الصور توضيحية للوجهات ولا تخص الشركة. مصدرها ويكيميديا كومنز، وقد غُيّر مقاسها وقُصّت لتناسب التصميم.',
      en: 'Photos illustrate the destinations and do not belong to the company. They come from Wikimedia Commons and have been resized and cropped for the design.',
    },
    sourceLabel: { ar: 'ويكيميديا كومنز', en: 'Wikimedia Commons' },
  },

  fab: { label: { ar: 'تواصل معنا', en: 'Contact us' } },

  /**
   * مكتبة الصور. كل صورة محفوظة بعدة عروض داخل public/images بالاسم {base}-{width}.webp.
   * position: نقطة التركيز عند القص (object-position).
   */
  media: {
    hero: { base: 'images/hero', widths: [960, 1440, 1920, 2560, 3200], width: 3840, height: 2560, position: '50% 58%', credit: 'hero' },
    heroMobile: { base: 'images/hero-mobile', widths: [480, 720, 1080, 1440], width: 1477, height: 1773, position: '50% 50%', credit: 'hero' },
    slideMaldives: { base: 'images/slide-maldives', widths: [960, 1440, 1920, 2560], width: 3840, height: 1919, position: '50% 62%', credit: 'maldives' },
    slideMaldivesMobile: { base: 'images/slide-maldives-m', widths: [480, 720, 1080, 1440], width: 1599, height: 1919, position: '50% 50%', credit: 'maldives' },
    slideLucerne: { base: 'images/slide-lucerne', widths: [960, 1440, 1920, 2560], width: 3370, height: 2247, position: '50% 45%', credit: 'lucerne' },
    slideLucerneMobile: { base: 'images/slide-lucerne-m', widths: [480, 720, 1080, 1440], width: 1872, height: 2247, position: '50% 40%', credit: 'lucerne' },
    slideDubai: { base: 'images/slide-dubai', widths: [960, 1440, 1920, 2560], width: 3840, height: 2560, position: '50% 40%', credit: 'dubai' },
    slideDubaiMobile: { base: 'images/slide-dubai-m', widths: [480, 720, 1080, 1440], width: 2133, height: 2560, position: '50% 40%', credit: 'dubai' },
    aboutDesert: { base: 'images/about-desert', widths: [640, 960, 1280, 1600], width: 3840, height: 2880, position: '55% 50%', credit: 'aboutDesert' },
    aboutWing: { base: 'images/about-wing', widths: [480, 800, 1200], width: 3840, height: 2550, position: '70% 45%', credit: 'aboutWing' },
    istanbul: { base: 'images/istanbul', widths: [480, 800, 1200, 1600], width: 3840, height: 2562, position: '30% 50%', credit: 'istanbul' },
    georgia: { base: 'images/georgia', widths: [480, 800, 1200, 1600], width: 3840, height: 2560, position: '62% 50%', credit: 'georgia' },
    dubai: { base: 'images/dubai', widths: [480, 800, 1200, 1600], width: 3840, height: 2560, position: '38% 50%', credit: 'dubai' },
    malaysia: { base: 'images/malaysia', widths: [480, 800, 1200, 1600], width: 2289, height: 3440, position: '50% 30%', credit: 'malaysia' },
    maldives: { base: 'images/maldives', widths: [480, 800, 1200, 1600], width: 3840, height: 1919, position: '50% 60%', credit: 'maldives' },
    lucerne: { base: 'images/lucerne', widths: [480, 800, 1200, 1600], width: 3370, height: 2247, position: '60% 50%', credit: 'lucerne' },
  },

  /** مصادر الصور وتراخيصها (تُعرض في التذييل). */
  credits: {
    hero: {
      subject: { ar: 'منطاد فوق كابادوكيا', en: 'Balloon over Cappadocia' },
      author: 'MusikAnimal',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      source: 'https://commons.wikimedia.org/wiki/File:Hot_air_balloon_at_sunrise_over_Cappadocia,_Turkey.JPG',
    },
    aboutDesert: {
      subject: { ar: 'صحراء وادي رم', en: 'Wadi Rum desert' },
      author: "John Romano D'Orazio",
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      source: 'https://commons.wikimedia.org/wiki/File:Red_sand_of_the_Wadi_Rum_desert.jpg',
    },
    aboutWing: {
      subject: { ar: 'جناح طائرة فوق الغيوم', en: 'Wing above the clouds' },
      author: 'U.S. Department of Agriculture',
      license: { ar: 'ملكية عامة', en: 'Public domain' },
      licenseUrl: null,
      source: 'https://commons.wikimedia.org/wiki/File:A_wing_tip_of_an_airplane_(40118125441).jpg',
    },
    istanbul: {
      subject: { ar: 'برج غلطة، إسطنبول', en: 'Galata Tower, Istanbul' },
      author: 'Sonse',
      license: 'CC BY 2.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
      source: 'https://commons.wikimedia.org/wiki/File:Galata_Tower,_Golden_Horn_(52397065499).jpg',
    },
    georgia: {
      subject: { ar: 'كنيسة جيرغيتي وجبل كازبيك', en: 'Gergeti Church and Mount Kazbek' },
      author: 'Braveheart',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      source: 'https://commons.wikimedia.org/wiki/File:Gergeti_Trinity_Church_and_Mt._Kazbeg_01.jpg',
    },
    dubai: {
      subject: { ar: 'أفق دبي ليلاً', en: 'Dubai skyline at night' },
      author: 'Robert Bock',
      license: 'CC0',
      licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
      source: 'https://commons.wikimedia.org/wiki/File:Dubai_skyline_unsplash.jpg',
    },
    malaysia: {
      subject: { ar: 'برجا بتروناس، كوالالمبور', en: 'Petronas Towers, Kuala Lumpur' },
      author: 'Marcin Konsek',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      source: 'https://commons.wikimedia.org/wiki/File:2016_Kuala_Lumpur,_Petronas_Towers_(18).jpg',
    },
    maldives: {
      subject: { ar: 'جزيرة في المالديف', en: 'An island in the Maldives' },
      author: 'Martin Falbisoner',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      source: 'https://commons.wikimedia.org/wiki/File:Diamonds_Thudufushi_Beach_and_Water_Villas,_May_2017_-08.jpg',
    },
    lucerne: {
      subject: { ar: 'جسر كابيل، لوتسيرن', en: 'Chapel Bridge, Lucerne' },
      author: 'Ikiwaner',
      license: 'CC BY-SA 3.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
      source: 'https://commons.wikimedia.org/wiki/File:Luzern_Kapellbruecke.jpg',
    },
  },
};

export default site;
