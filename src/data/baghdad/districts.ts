import type { AcademyDistrict } from '../../types';

export const BAGHDAD_DISTRICTS: AcademyDistrict[] = [
  {
    id: 'golden-gate-approach',
    name: { en: 'Golden Gate Approach', ar: 'مدخل البوابة الذهبية' },
    eraNote: { en: 'Outer Ring · Built 762 CE', ar: 'السور الخارجي · بُني ٧٦٢ م' },
    summary: {
      en: 'A broad sandstone processional avenue leading beneath Baghdad’s monumental gatehouse toward the heart of the Round City.',
      ar: 'جادة مرصوفة بالحجر الرملي تقود عبر البوابة الكبرى نحو قلب المدينة المدورة التي أسسها المنصور.',
    },
    learningGoals: [
      {
        en: 'Understand why Caliph al-Mansur chose a circular four-gated plan in 762 CE.',
        ar: 'فهم أسباب اختيار الخليفة المنصور للتخطيط الدائري ذي الأبواب الأربعة عام ٧٦٢ م.',
      },
      {
        en: 'Identify defensive ramparts, bent entrances, and processional paving.',
        ar: 'التعرف على الأسوار الدفاعية والمداخل المنكسرة ورصف الطريق الملكي.',
      },
    ],
    imageCreditId: 'round-city-overview',
    videoId: 'tour-golden-gate-approach',
    accuracy: 'documented',
    mapCoords: { x: 50, y: 84 },
    artifactIds: ['gold-dinar'],
    hotspots: [
      {
        id: 'gg-1',
        number: 1,
        xPercent: 50,
        yPercent: 28,
        label: { en: 'Concentric Round Walls', ar: 'الأسوار الدائرية المتراكزة' },
        description: {
          en: 'Al-Ya’qubi records double mud-brick walls, a deep moat, and four equidistant gates facing Khurasan, Basra, Kufa, and Damascus.',
          ar: 'يصف اليعقوبي أسواراً مزدوجة من اللبن وخندقاً مائياً وأربعة أبواب نحو خراسان والبصرة والكوفة والشام.',
        },
        accuracy: 'documented',
        sourceNote: 'al-Ya’qubi, Kitab al-Buldan',
      },
      {
        id: 'gg-2',
        number: 2,
        xPercent: 34,
        yPercent: 52,
        label: { en: 'Bent-Axis Gatehouse', ar: 'المدخل المنكسر المحصن' },
        description: {
          en: 'Bent passageways slowed cavalry charges and forced incoming caravans to turn sharply inside the gatehouse.',
          ar: 'كانت الممرات المنكسرة تُبطئ الفرسان وتُخضع القوافل القادمة للمراقبة عند دخول البوابة.',
        },
        accuracy: 'documented',
        sourceNote: 'K.A.C. Creswell, Early Muslim Architecture',
      },
      {
        id: 'gg-3',
        number: 3,
        xPercent: 66,
        yPercent: 63,
        label: { en: 'Tigris Canal Approaches', ar: 'قنوات دجلة المحيطة' },
        description: {
          en: 'Canals bridged the Tigris and Nahr Isa, supplying brick kilns, gardens, and city moats.',
          ar: 'ربطت القنوات نهر دجلة بنهر عيسى لإمداد المدينة بالماء وحركة القوارب.',
        },
        accuracy: 'documented',
        sourceNote: 'Guy Le Strange, Baghdad during the Abbasid Caliphate',
      },
      {
        id: 'gg-4',
        number: 4,
        xPercent: 51,
        yPercent: 43,
        label: { en: 'Central Green Dome Axis', ar: 'محور القبة الخضراء المركزي' },
        description: {
          en: 'The Palace of the Golden Gate and its green-tiled dome stood at the geometric center of the circle.',
          ar: 'توسط قصر الباب الذهبي وقبته الخضراء مركز الدائرة ليكون مرئياً من الأرجاء.',
        },
        accuracy: 'traditional',
        sourceNote: 'al-Khatib al-Baghdadi, Tarikh Baghdad',
      },
    ],
    quiz: [
      {
        id: 'gg-q1',
        prompt: {
          en: 'In what year did Caliph al-Mansur found the Round City of Baghdad (Madinat al-Salam)?',
          ar: 'في أي عام أسس الخليفة أبو جعفر المنصور مدينة السلام (بغداد المدورة)؟',
        },
        options: [
          { id: 'a', text: { en: '762 CE', ar: '٧٦٢ م' } },
          { id: 'b', text: { en: '809 CE', ar: '٨٠٩ م' } },
          { id: 'c', text: { en: '1492 CE', ar: '١٤٩٢ م' } },
        ],
        correctOptionId: 'a',
        explanation: {
          en: 'Al-Mansur laid the circular foundation of Madinat al-Salam in 762 CE (145 AH).',
          ar: 'وضع المنصور أسس مدينة السلام الدائرية عام ٧٦٢ م (١٤٥ هـ).',
        },
        accuracy: 'documented',
      },
      {
        id: 'gg-q2',
        prompt: {
          en: 'How many main outer gates opened through the Round City walls?',
          ar: 'كم عدد الأبواب الرئيسية في سور المدينة المدورة الخارجي؟',
        },
        options: [
          { id: 'a', text: { en: 'Two gates', ar: 'بابان' } },
          { id: 'b', text: { en: 'Four gates (Khurasan, Basra, Kufa, Damascus)', ar: 'أربعة أبواب (خراسان والبصرة والكوفة والشام)' } },
          { id: 'c', text: { en: 'Twelve gates', ar: 'اثنا عشر باباً' } },
        ],
        correctOptionId: 'b',
        explanation: {
          en: 'Each of the four gates pointed along imperial roads toward Khurasan, Basra, Kufa, and Damascus.',
          ar: 'اتجهت الأبواب الأربعة نحو طرق خراسان والبصرة والكوفة والشام.',
        },
        accuracy: 'documented',
      },
      {
        id: 'gg-q3',
        prompt: {
          en: 'Why were bustling commercial markets moved outside the inner Round City walls?',
          ar: 'لماذا نُقلت الأسواق التجارية المزدحمة إلى خارج أسوار المدينة المدورة؟',
        },
        options: [
          { id: 'a', text: { en: 'To maintain palace security and reduce crowding around the core', ar: 'للحفاظ على أمن الحاضرة وتخفيف الازدحام حول قلب القصر' } },
          { id: 'b', text: { en: 'Because merchants disliked marble paving', ar: 'لأن التجار لم يفضلوا الرخام' } },
          { id: 'c', text: { en: 'So ships could sail inside the palace dome', ar: 'لتبحر السفن تحت قبة القصر' } },
        ],
        correctOptionId: 'a',
        explanation: {
          en: 'Al-Mansur relocated stalls to al-Karkh outside the walls to preserve quiet, order, and security inside the administrative ring.',
          ar: 'نُقلت الدكاكين إلى الكرخ خارج السور لصيانة الهدوء والنظام والأمن في القلب الإداري.',
        },
        accuracy: 'documented',
      },
    ],
  },
  {
    id: 'great-courtyard',
    name: { en: 'Great Courtyard', ar: 'الصحن الكبير' },
    eraNote: { en: 'Palace Precinct · Composite Evocation', ar: 'رحاب القصر · تصور تركيبي' },
    summary: {
      en: 'A colonnaded courtyard centered on an octagonal marble fountain cooled by water drawn from the Tigris and Nahr Isa canals.',
      ar: 'صحن واسع تحيط به الأروقة والأعمدة، تتوسطه نافورة رخامية مثمنة تستقي من قنوات دجلة ونهر عيسى.',
    },
    learningGoals: [
      {
        en: 'Explore how courtyard fountains and arcades passively cooled Baghdad palaces.',
        ar: 'استكشاف دور النوافير والأروقة في تبريد قصور بغداد طبيعياً.',
      },
      {
        en: 'Distinguish composite architectural reconstruction from surviving ruins.',
        ar: 'التمييز بين إعادة البناء التركيبية والآثار المعمارية الباقية.',
      },
    ],
    imageCreditId: 'courtyard-fountain',
    videoId: 'tour-great-courtyard',
    accuracy: 'dramatized',
    mapCoords: { x: 50, y: 54 },
    artifactIds: ['court-fountain'],
    hotspots: [
      {
        id: 'gc-1',
        number: 1,
        xPercent: 50,
        yPercent: 68,
        label: { en: 'Octagonal Marble Basin', ar: 'حوض النافورة المثمن' },
        description: {
          en: 'Evaporating spray cooled afternoon air across the shaded marble arcade.',
          ar: 'يساعد رذاذ الماء المتبخر على تلطيف حرارة العصر داخل الأروقة الظليلة.',
        },
        accuracy: 'documented',
        sourceNote: 'Abbasid hydraulic engineering surveys',
      },
      {
        id: 'gc-2',
        number: 2,
        xPercent: 22,
        yPercent: 45,
        label: { en: 'Pointed Brick Colonnades', ar: 'الأروقة المقوسة بالآجر' },
        description: {
          en: 'Two-centered pointed arches carried covered walkways shielding courtiers from midday sun.',
          ar: 'تحمل العقود المدببة ممرات مسقوفة تقي الجالسين والوفود من وهج الشمس.',
        },
        accuracy: 'documented',
        sourceNote: 'Creswell, Early Muslim Architecture',
      },
      {
        id: 'gc-3',
        number: 3,
        xPercent: 78,
        yPercent: 36,
        label: { en: 'Carved Stucco Dadoes', ar: 'الزخارف الجصية المنحوتة' },
        description: {
          en: 'Geometric and vegetal stucco reliefs inspired by early Abbasid palaces in Iraq.',
          ar: 'ألواح جصية هندسية ونباتية مستلهمة من قصور العصر العباسي الأول.',
        },
        accuracy: 'dramatized',
        sourceNote: 'Composite palace design after Samarra motifs',
      },
      {
        id: 'gc-4',
        number: 4,
        xPercent: 52,
        yPercent: 20,
        label: { en: 'Green Dome Silhouette', ar: 'إطلالة القبة الخضراء' },
        description: {
          en: 'Rising 80 cubits in chroniclers’ accounts above the audience hall behind the northern iwan.',
          ar: 'ترتفع القبة في كتب المؤرخين فوق الإيوان الشمالي لتظلل قاعة الخليفة.',
        },
        accuracy: 'traditional',
        sourceNote: 'al-Khatib al-Baghdadi',
      },
    ],
    quiz: [
      {
        id: 'gc-q1',
        prompt: {
          en: 'Which canal system helped bring Euphrates water toward western Baghdad and its palace fountains?',
          ar: 'أي قناة كبرى ساهمت في إيصال المياه إلى غربي بغداد ونوافيرها؟',
        },
        options: [
          { id: 'a', text: { en: 'Nahr Isa', ar: 'نهر عيسى' } },
          { id: 'b', text: { en: 'The Thames Aqueduct', ar: 'قناة التايمز' } },
          { id: 'c', text: { en: 'The Rhine Trench', ar: 'خندق الراين' } },
        ],
        correctOptionId: 'a',
        explanation: {
          en: 'Nahr Isa linked Euphrates waters into western Baghdad, feeding orchards, baths, and courtyard conduits.',
          ar: 'وصل نهر عيسى مياه الفرات إلى غربي بغداد فغذى البساتين والنوافير.',
        },
        accuracy: 'documented',
      },
      {
        id: 'gc-q2',
        prompt: {
          en: 'Why do historians label our 3D palace floor plan as a "Composite Evocation"?',
          ar: 'لماذا يصف المؤرخون مخطط القصر عندنا بأنه «تصور تركيبي»؟',
        },
        options: [
          { id: 'a', text: { en: 'No complete architectural blueprint of Harun’s palace survives today', ar: 'لأنه لم يبقَ مخطط معماري كامل لقصر الرشيد حتى اليوم' } },
          { id: 'b', text: { en: 'Because the palace floated on boats', ar: 'لأن القصر كان يطفو على القوارب' } },
          { id: 'c', text: { en: 'Because Baghdad was built in 1991', ar: 'لأن بغداد بُنيت عام ١٩٩١' } },
        ],
        correctOptionId: 'a',
        explanation: {
          en: 'Historical honesty requires noting that while chronicles describe the palace, no archaeological floor plan survives.',
          ar: 'الأمانة التاريخية تقتضي توضيح أن المصادر تصفه دون بقاء مخطط أثري كامل.',
        },
        accuracy: 'documented',
      },
      {
        id: 'gc-q3',
        prompt: {
          en: 'How did covered colonnades improve comfort in the Great Courtyard?',
          ar: 'كيف حسّنت الأروقة المسقوفة المناخ داخل الصحن الكبير؟',
        },
        options: [
          { id: 'a', text: { en: 'By creating deep shade and channeling cool air off the fountain', ar: 'بتوفير الظل العميق وتمرير النسيم المبرد من النافورة' } },
          { id: 'b', text: { en: 'By storing snow from Alaska', ar: 'بتخزين الثلوج المستوردة' } },
          { id: 'c', text: { en: 'By blocking all doors permanently', ar: 'بإغلاق الأبواب كلها' } },
        ],
        correctOptionId: 'a',
        explanation: {
          en: 'Shaded arcades combined with central water evaporation cooled the courtyard microclimate naturally.',
          ar: 'تجمع الأروقة الظليلة مع تبخر الماء لتبريد الصحن بصورة طبيعية.',
        },
        accuracy: 'documented',
      },
    ],
  },
  {
    id: 'audience-hall',
    name: { en: 'Audience Hall', ar: 'قاعة الاستقبال' },
    eraNote: { en: 'Beneath the Green Dome · c. 800 CE', ar: 'تحت القبة الخضراء · نحو ٨٠٠ م' },
    summary: {
      en: 'The vaulted throne iwan where Caliph Harun al-Rashid heard mazalim justice petitions, welcomed foreign envoys, and patronized poets and timekeepers.',
      ar: 'القاعة المقببة تحت القبة الخضراء حيث ينظر الخليفة هارون الرشيد في المظالم ويستقبل السفراء والعلماء.',
    },
    learningGoals: [
      {
        en: 'Learn about mazalim justice sessions and Abbasid court protocol.',
        ar: 'التعرف على مجالس المظالم وبروتوكول البلاط العباسي.',
      },
      {
        en: 'Examine diplomatic gifts and Harun al-Rashid’s court residences in both Baghdad and al-Raqqa.',
        ar: 'دراسة الهدايا الدبلوماسية وإقامة الرشيد بين بغداد والرقة.',
      },
    ],
    imageCreditId: 'water-clock-brass',
    videoId: 'tour-audience-hall',
    accuracy: 'documented',
    mapCoords: { x: 50, y: 20 },
    artifactIds: ['water-clock', 'oud'],
    hotspots: [
      {
        id: 'ah-1',
        number: 1,
        xPercent: 42,
        yPercent: 46,
        label: { en: 'Brass Clepsydra Mechanism', ar: 'آلية الساعة المائية النحاسية' },
        description: {
          en: 'Float-regulated water clocks chimed hours and inspired diplomatic awe across Eurasia.',
          ar: 'تعتمد على عوامات الماء لضبط الساعات، وقد أبهرت الوفود والملوك.',
        },
        accuracy: 'documented',
        sourceNote: 'Donald R. Hill, Arabic Water-Clocks',
      },
      {
        id: 'ah-2',
        number: 2,
        xPercent: 72,
        yPercent: 64,
        label: { en: 'Epigraphic Gold Dinars', ar: 'الدنانير الذهبية المنقوشة' },
        description: {
          en: 'Standardized caliphal currency minted without human portraits, bearing Kufic inscriptions.',
          ar: 'عملة ذهبية موحدة منقوشة بالخط الكوفي دون صور شخصية.',
        },
        accuracy: 'documented',
        sourceNote: 'Abbasid Numismatic Collections',
      },
      {
        id: 'ah-3',
        number: 3,
        xPercent: 24,
        yPercent: 30,
        label: { en: 'Ceremonial Tiraz Black', ar: 'السواد العباسي والطراز' },
        description: {
          en: 'Abbasid ceremonial robes used deep dyed black fabric with gold-embroidered tiraz bands.',
          ar: 'اتخذ العباسيون السواد شعاراً رسمياً مع أشرطة الطراز المذهبة.',
        },
        accuracy: 'documented',
        sourceNote: 'al-Tabari & textile archaeology',
      },
      {
        id: 'ah-4',
        number: 4,
        xPercent: 60,
        yPercent: 25,
        label: { en: 'Mazalim Petition Register', ar: 'سجل شكاوى المظالم' },
        description: {
          en: 'Caliphs and Chief Judge Abu Yusuf heard citizens’ appeals against tax or administrative abuse.',
          ar: 'مجلس لسماع شكاوى الرعية بإشراف الخليفة وقاضي القضاة أبي يوسف.',
        },
        accuracy: 'documented',
        sourceNote: 'Abu Yusuf, Kitab al-Kharaj',
      },
    ],
    quiz: [
      {
        id: 'ah-q1',
        prompt: {
          en: 'Where did Harun al-Rashid frequently hold his primary court residence from around 796 CE?',
          ar: 'أين أقام هارون الرشيد بلاطه غالباً منذ نحو عام ٧٩٦ م؟',
        },
        options: [
          { id: 'a', text: { en: 'Al-Raqqa on the Euphrates', ar: 'مدينة الرقة على الفرات' } },
          { id: 'b', text: { en: 'Granada', ar: 'غرناطة' } },
          { id: 'c', text: { en: 'Kingston', ar: 'كينغستون' } },
        ],
        correctOptionId: 'a',
        explanation: {
          en: 'From 796 CE onward, Harun resided much of the time at al-Raqqa to oversee frontier and Syrian administration.',
          ar: 'أقام الرشيد في الرقة على الفرات فترات طويلة لإدارة الثغور وشؤون الشام.',
        },
        accuracy: 'documented',
      },
      {
        id: 'ah-q2',
        prompt: {
          en: 'Which Frankish ruler exchanged diplomatic envoys with Harun al-Rashid’s court?',
          ar: 'أي ملك للفرنجة تبادل السفراء مع بلاط هارون الرشيد؟',
        },
        options: [
          { id: 'a', text: { en: 'Charlemagne', ar: 'شارلمان (قارله)' } },
          { id: 'b', text: { en: 'Julius Caesar', ar: 'يوليوس قيصر' } },
          { id: 'c', text: { en: 'Napoleon', ar: 'نابليون' } },
        ],
        correctOptionId: 'a',
        explanation: {
          en: 'The Royal Frankish Annals record embassies between Charlemagne and Harun al-Rashid starting around 797 CE.',
          ar: 'توثق الحوليات الفرنجية تبادل السفراء بين شارلمان والرشيد بدءاً من نحو ٧٩٧ م.',
        },
        accuracy: 'documented',
      },
      {
        id: 'ah-q3',
        prompt: {
          en: 'Are the nocturnal adventures of Harun in disguise from 1001 Nights treated as documented chronicles?',
          ar: 'هل تُعدّ قصص تنكر الرشيد ليلاً في ألف ليلة وليلة وقائع تاريخية موثقة؟',
        },
        options: [
          { id: 'a', text: { en: 'No — they are later literary fiction (dramatized)', ar: 'لا — بل هي حكايات أدبية متخيلة لاحقة' } },
          { id: 'b', text: { en: 'Yes, written by Harun himself', ar: 'نعم كتبها الرشيد بنفسه' } },
          { id: 'c', text: { en: 'They happened in Rome', ar: 'وقعت في روما' } },
        ],
        correctOptionId: 'a',
        explanation: {
          en: 'Alf Layla wa Layla belongs to literary storytelling rather than contemporary historical annals.',
          ar: 'تنتمي ألف ليلة وليلة إلى الإبداع الأدبي لا إلى التدوين التاريخي المعاصر.',
        },
        accuracy: 'documented',
      },
    ],
  },
  {
    id: 'palace-garden',
    name: { en: 'Palace Garden', ar: 'بستان القصر' },
    eraNote: { en: 'Eastern Terrace · Canal-Irrigated', ar: 'الشرفة الشرقية · مروية بالقنوات' },
    summary: {
      en: 'Date palms, pomegranates, shaded stone water channels, and ivory-and-wood shatranj tables where courtiers debated strategy.',
      ar: 'بستان النخيل والرمان وقنوات الماء المبردة ومجالس لعبة الشطرنج الفكرية.',
    },
    learningGoals: [
      {
        en: 'Examine canal irrigation and agricultural botany in Abbasid Iraq.',
        ar: 'دراسة هندسة القنوات والزراعة في العراق العباسي.',
      },
      {
        en: 'Trace how shatranj (early chess) spread as an intellectual courtly pursuit.',
        ar: 'تتبع انتشار الشطرنج كرياضة ذهنية في المجالس العباسية.',
      },
    ],
    imageCreditId: 'courtyard-fountain',
    videoId: 'tour-palace-garden',
    accuracy: 'documented',
    mapCoords: { x: 82, y: 42 },
    artifactIds: ['shatranj-board'],
    hotspots: [
      {
        id: 'pg-1',
        number: 1,
        xPercent: 48,
        yPercent: 74,
        label: { en: 'Chahar Bagh Water Channel', ar: 'قناة الماء الرخامية' },
        description: {
          en: 'Shallow stone runnels linked basins to citrus and pomegranate beds.',
          ar: 'قنوات حجرية ضحلة توصل الماء العذب إلى أحواض الرمان والنخيل.',
        },
        accuracy: 'documented',
        sourceNote: 'Le Strange, Baghdad during the Abbasid Caliphate',
      },
      {
        id: 'pg-2',
        number: 2,
        xPercent: 72,
        yPercent: 24,
        label: { en: 'Date Palms & Shade Canopy', ar: 'أشجار النخيل والظلال' },
        description: {
          en: 'Tall date palms formed an upper canopy sheltering fruit trees below.',
          ar: 'ظلّلت أشجار النخيل الباسقة الأشجار المثمرة دونها من حر الصيف.',
        },
        accuracy: 'documented',
        sourceNote: 'Abbasid agricultural manuals (Kitab al-Filaha)',
      },
      {
        id: 'pg-3',
        number: 3,
        xPercent: 28,
        yPercent: 58,
        label: { en: 'Shatranj Garden Pavilions', ar: 'مجالس الشطرنج في البستان' },
        description: {
          en: 'Poets and strategists played shatranj on inlaid walnut and ivory boards.',
          ar: 'تنافس الشعراء والعلماء على رقع الشطرنج المطعمة بالخشب والعاج.',
        },
        accuracy: 'traditional',
        sourceNote: 'H.J.R. Murray, A History of Chess',
      },
      {
        id: 'pg-4',
        number: 4,
        xPercent: 54,
        yPercent: 44,
        label: { en: 'Acoustic Water Drop', ar: 'خرير السقايات المائية' },
        description: {
          en: 'Stepped stone lips produced gentle acoustic white noise that masked court conversations.',
          ar: 'صُممت حواف القنوات المتدرجة لإحداث خرير هادئ يلطّف السمع.',
        },
        accuracy: 'dramatized',
        sourceNote: 'Architectural acoustic reconstruction',
      },
    ],
    quiz: [
      {
        id: 'pg-q1',
        prompt: {
          en: 'What was shatranj in 800 CE Baghdad?',
          ar: 'ما هي لعبة الشطرنج في بغداد عام ٨٠٠ م؟',
        },
        options: [
          { id: 'a', text: { en: 'A prized strategic board game ancestral to modern chess', ar: 'لعبة ذكاء استراتيجية سابقة للشطرنج الحديث' } },
          { id: 'b', text: { en: 'A horse-drawn plough', ar: 'محراث زراعي' } },
          { id: 'c', text: { en: 'A type of copper coin', ar: 'نوع من العملات النحاسية' } },
        ],
        correctOptionId: 'a',
        explanation: {
          en: 'Shatranj arrived from India via Persia and became a celebrated intellectual game at the Abbasid court.',
          ar: 'وصلت الشطرنج عبر فارس وأصبحت من أشهر ألعاب الفكر في البلاط العباسي.',
        },
        accuracy: 'documented',
      },
      {
        id: 'pg-q2',
        prompt: {
          en: 'How did tiered planting (tall date palms over pomegranates) help Baghdad gardens?',
          ar: 'كيف أفادت الزراعة المتدرجة (النخيل فوق الرمان) بساتين بغداد؟',
        },
        options: [
          { id: 'a', text: { en: 'Palms shaded lower fruit trees and lowered soil evaporation', ar: 'ظلّل النخيل الأشجار الأصغر وقلّل تبخر الماء من التربة' } },
          { id: 'b', text: { en: 'It eliminated all need for water canals', ar: 'ألغى الحاجة للماء نهائياً' } },
          { id: 'c', text: { en: 'It turned dates into brass', ar: 'حوّل التمر إلى نحاس' } },
        ],
        correctOptionId: 'a',
        explanation: {
          en: 'Multi-level oasis gardening shielded tender crops from intense sun while retaining moisture.',
          ar: 'تحمي المظلة العلوية للنخيل المحاصيل الحساسة وتحافظ على رطوبة التربة.',
        },
        accuracy: 'documented',
      },
      {
        id: 'pg-q3',
        prompt: {
          en: 'Is the legend that Harun sent an ornate chess set directly to Charlemagne confirmed by contemporary annals?',
          ar: 'هل تؤكد الحوليات المعاصرة رواية إرسال هارون رقعة شطرنج لشارلمان؟',
        },
        options: [
          { id: 'a', text: { en: 'No — that detail rests on later tradition rather than contemporary records', ar: 'لا — فهي رواية مأثورة متأخرة لم تثبت في الحوليات المعاصرة' } },
          { id: 'b', text: { en: 'Yes, signed receipts survive from 800 CE', ar: 'نعم يوجد إيصال موقع من ٨٠٠ م' } },
          { id: 'c', text: { en: 'Only in Samarkand', ar: 'في سمرقند فقط' } },
        ],
        correctOptionId: 'a',
        explanation: {
          en: 'While the elephant Abul-Abbas and water clock are in Frankish annals, the "Charlemagne chessmen" belong to later tradition.',
          ar: 'تذكر الحوليات الفيل والساعة المائية، بينما نُسبت قطع الشطرنج إلى التراث اللاحق.',
        },
        accuracy: 'traditional',
      },
    ],
  },
  {
    id: 'scholars-library',
    name: { en: 'Scholars’ Library', ar: 'خزانة العلماء' },
    eraNote: { en: 'Khizanat al-Hikma · Western Wing', ar: 'خزانة الحكمة · الجناح الغربي' },
    summary: {
      en: 'Cedar bookshelves filled with treatises where copyists worked on Samarkand rag paper and astronomers calibrated brass astrolabes.',
      ar: 'رفوف خشب الأرز العامرة بالمخطوطات حيث ينسخ الوراقون على ورق سمرقند ويعاير الفلكيون الأسطرلابات.',
    },
    learningGoals: [
      {
        en: 'Understand how linen rag paper transformed scholarship in Baghdad.',
        ar: 'فهم كيف أحدث ورق الكتان تحولاً في تدوين العلوم ببغداد.',
      },
      {
        en: 'Learn how early Abbasid translations united Greek, Syriac, Sanskrit, and Pahlavi knowledge in Arabic.',
        ar: 'التعرف على حركة الترجمة المبكرة من اليونانية والسريانية والهندية والفارسية إلى العربية.',
      },
    ],
    imageCreditId: 'scholars-astrolabe',
    videoId: 'tour-scholars-library',
    accuracy: 'documented',
    mapCoords: { x: 18, y: 38 },
    artifactIds: ['astrolabe', 'manuscript-table'],
    hotspots: [
      {
        id: 'sl-1',
        number: 1,
        xPercent: 44,
        yPercent: 52,
        label: { en: 'Planispheric Brass Astrolabe', ar: 'الأسطرلاب النحاسي المسطح' },
        description: {
          en: 'Used by Baghdad astronomers such as al-Fazari to determine star altitudes, time, and latitude.',
          ar: 'استعمله الفلكيون أمثال الفزاري لقياس ارتفاع النجوم وتحديد المواقيت.',
        },
        accuracy: 'documented',
        sourceNote: 'David A. King, In Synchrony with the Heavens',
      },
      {
        id: 'sl-2',
        number: 2,
        xPercent: 68,
        yPercent: 68,
        label: { en: 'Linen & Hemp Rag Paper', ar: 'صحائف الورق المشرقي' },
        description: {
          en: 'Lighter than parchment and more durable than papyrus, rag paper spread from Samarkand to Iraq in the late 700s.',
          ar: 'أخف من الرق وأمتن من البردي، انتشر من سمرقند إلى دواوين بغداد أواخر القرن الثامن.',
        },
        accuracy: 'traditional',
        sourceNote: 'Jonathan Bloom, Paper Before Print',
      },
      {
        id: 'sl-3',
        number: 3,
        xPercent: 24,
        yPercent: 66,
        label: { en: 'Qalam Reed Pens & Carbon Ink', ar: 'أقلام القصب والحبر الأسود' },
        description: {
          en: 'Obliquely trimmed reed pens dipped in soot-and-gum ink wrote crisp Kufic and early Naskh scripts.',
          ar: 'أقلام قصب مقطوطة بميل تغمس في حبر السخام والصمغ لخط واضح ثابت.',
        },
        accuracy: 'documented',
        sourceNote: 'Abbasid calligraphy & codicology',
      },
      {
        id: 'sl-4',
        number: 4,
        xPercent: 78,
        yPercent: 34,
        label: { en: 'Khizanat al-Hikma Scrolls', ar: 'لفائف خزانة الحكمة' },
        description: {
          en: 'Early court treasuries collected medical, mathematical, and astronomical treatises before al-Ma’mun’s later expansions.',
          ar: 'جمعت خزائن البلاط المبكرة رسائل الطب والفلك والرياضيات قبل توسعها في عهد المأمون.',
        },
        accuracy: 'documented',
        sourceNote: 'Dimitri Gutas, Greek Thought, Arabic Culture',
      },
    ],
    quiz: [
      {
        id: 'sl-q1',
        prompt: {
          en: 'From which Central Asian city does tradition say papermaking spread to Baghdad in the late 8th century?',
          ar: 'من أي مدينة في آسيا الوسطى تشير الروايات إلى انتقال صناعة الورق نحو بغداد؟',
        },
        options: [
          { id: 'a', text: { en: 'Samarkand', ar: 'سمرقند' } },
          { id: 'b', text: { en: 'Lisbon', ar: 'لشبونة' } },
          { id: 'c', text: { en: 'Kingston', ar: 'كينغستون' } },
        ],
        correctOptionId: 'a',
        explanation: {
          en: 'Traditional accounts credit Samarkand artisans with transferring rag-papermaking craft into Iraq.',
          ar: 'تذكر الروايات التاريخية انتقال حرفة صناعة الورق من سمرقند إلى دواوين العراق.',
        },
        accuracy: 'traditional',
      },
      {
        id: 'sl-q2',
        prompt: {
          en: 'What was an Abbasid brass astrolabe used for?',
          ar: 'فيمَ استُخدم الأسطرلاب النحاسي في العصر العباسي؟',
        },
        options: [
          { id: 'a', text: { en: 'Measuring celestial altitudes, telling time, and finding latitude', ar: 'قياس ارتفاع النجوم وتحديد المواقيت وخط العرض' } },
          { id: 'b', text: { en: 'Grinding saffron spices', ar: 'طحن توابل الزعفران' } },
          { id: 'c', text: { en: 'Printing newspapers', ar: 'طباعة الصحف اليومية' } },
        ],
        correctOptionId: 'a',
        explanation: {
          en: 'An astrolabe projects the sky onto calibrated brass plates so scholars could compute time and star positions.',
          ar: 'يُسقط الأسطرلاب القبة السماوية على صفائح نحاسية مدرجة لحساب الوقت ومواضع النجوم.',
        },
        accuracy: 'documented',
      },
      {
        id: 'sl-q3',
        prompt: {
          en: 'Which term describes an Abbasid scholar-artisan who prepared paper and copied manuscripts?',
          ar: 'ما اللقب الذي أُطلق على صانع الورق وناسخ الكتب وبائعها في بغداد؟',
        },
        options: [
          { id: 'a', text: { en: 'Al-Warraq (The Copyist-Stationer)', ar: 'الورّاق' } },
          { id: 'b', text: { en: 'Al-Qadi', ar: 'القاضي' } },
          { id: 'c', text: { en: 'Al-Mallah', ar: 'الملاح' } },
        ],
        correctOptionId: 'a',
        explanation: {
          en: 'Warraqun ran manuscript workshops and book markets that turned Baghdad into a center of publishing by hand.',
          ar: 'شكّل الوراقون عصب حركة التأليف والنسخ وسوق الكتب في بغداد.',
        },
        accuracy: 'documented',
      },
    ],
  },
  {
    id: 'market-street',
    name: { en: 'Karkh Market Street', ar: 'سوق الكرخ' },
    eraNote: { en: 'Outer Bazaar · Outside the Walls', ar: 'السوق الخارجي · خارج الأسوار' },
    summary: {
      en: 'Timber-awned bazaar outside the Round City walls receiving silks, spices, ceramics, and aromatics weighed against pure gold dinars.',
      ar: 'سوق مسقوف بالمظلات الخشبية خارج أسوار المدينة المدورة يستقبل الحرير والتوابل والعطور الموزونة بالدينار الذهبي.',
    },
    learningGoals: [
      {
        en: 'Trace Silk Road and Indian Ocean trade connections arriving in Baghdad c. 800 CE.',
        ar: 'تتبع طرق التجارة البرية والبحرية الواصلة إلى أسواق بغداد نحو ٨٠٠ م.',
      },
      {
        en: 'Spot anachronisms: foods like tomatoes, potatoes, coffee, and tobacco were NOT present in 800 CE Baghdad!',
        ar: 'اكتشاف المفارقات الزمنية: لم تكن الطماطم والبطاطس والقهوة والتبغ معروفة في بغداد عام ٨٠٠ م!',
      },
    ],
    imageCreditId: 'karkh-spice-market',
    videoId: 'tour-market-street',
    accuracy: 'documented',
    mapCoords: { x: 20, y: 72 },
    artifactIds: ['spice-stall', 'gold-dinar'],
    hotspots: [
      {
        id: 'ms-1',
        number: 1,
        xPercent: 46,
        yPercent: 56,
        label: { en: 'Precision Balance Scale', ar: 'الميزان الحساس للدنانير' },
        description: {
          en: 'Merchants weighed gold dinars (~4.25g) and silver dirhams to verify purity and exact bullion value.',
          ar: 'وزن التجار الدنانير الذهبية (نحو ٤٫٢٥ غرام) والدراهم الفضية للتحقق من العيار والوزن.',
        },
        accuracy: 'documented',
        sourceNote: 'Michael Bates, Islamic Coins',
      },
      {
        id: 'ms-2',
        number: 2,
        xPercent: 25,
        yPercent: 68,
        label: { en: 'Cinnamon, Pepper & Saffron', ar: 'القرفة والفلفل والزعفران' },
        description: {
          en: 'Indian Ocean and Persian spices filled woven sacks—while New World tomatoes and potatoes were centuries away.',
          ar: 'توافدت توابل الهند وفارس، في حين لم تصل الطماطم أو البطاطس إلا بعد قرون.',
        },
        accuracy: 'documented',
        sourceNote: 'Ibn Khordadbeh, Kitab al-Masalik',
      },
      {
        id: 'ms-3',
        number: 3,
        xPercent: 72,
        yPercent: 46,
        label: { en: 'Engraved Copper & Silk Bolts', ar: 'النحاس المنقوش وأثواب الحرير' },
        description: {
          en: 'Specialized streets grouped spice-sellers, coppersmiths, silk weavers, and bookbinders by trade.',
          ar: 'تخصّصت أزقة السوق لكل حرفة من العطارين والنحاسين والحريريين.',
        },
        accuracy: 'documented',
        sourceNote: 'al-Ya’qubi, Kitab al-Buldan',
      },
      {
        id: 'ms-4',
        number: 4,
        xPercent: 58,
        yPercent: 22,
        label: { en: 'Muhtasib Market Oversight', ar: 'رقابة المحتسب في السوق' },
        description: {
          en: 'Market inspectors checked weights, measures, and fair pricing under Abbasid civic law.',
          ar: 'راقب المحتسب دقة الموازين والمكاييل وجودة السلع ومنع الغش.',
        },
        accuracy: 'documented',
        sourceNote: 'Hisba manuals & al-Tabari',
      },
    ],
    quiz: [
      {
        id: 'ms-q1',
        prompt: {
          en: 'Which of these items could a shopper genuinely buy in Karkh Market in 800 CE?',
          ar: 'أيّ من السلع التالية كان يمكن شراؤها حقاً في سوق الكرخ عام ٨٠٠ م؟',
        },
        options: [
          { id: 'a', text: { en: 'Saffron, cinnamon, pepper, and Khurasan silk', ar: 'الزعفران والقرفة والفلفل وحرير خراسان' } },
          { id: 'b', text: { en: 'Tomatoes and roasted coffee beans', ar: 'الطماطم وبن القهوة المحمص' } },
          { id: 'c', text: { en: 'Printed paperback novels', ar: 'الروايات الورقية المطبوعة بآلة' } },
        ],
        correctOptionId: 'a',
        explanation: {
          en: 'Eastern spices and silk flowed into 800 CE Baghdad; tomatoes came from the Americas post-1492, and coffee spread centuries later.',
          ar: 'كانت التوابل والحرير في أسواق ٨٠٠ م، أما الطماطم والقهوة فظهرت لاحقاً بقرون.',
        },
        accuracy: 'documented',
      },
      {
        id: 'ms-q2',
        prompt: {
          en: 'What distinguished Abbasid gold dinars visually from Byzantine or Roman coins?',
          ar: 'بماذا تميّز الدينار العباسي الذهبي بصرياً عن العملات البيزنطية؟',
        },
        options: [
          { id: 'a', text: { en: 'Purely epigraphic Kufic Arabic calligraphy with no human portraits', ar: 'نقوش خطية عربية خالصة دون صور حكام' } },
          { id: 'b', text: { en: 'Square plastic tokens', ar: 'قطع مربعة بلاستيكية' } },
          { id: 'c', text: { en: 'Printed paper banknotes', ar: 'أوراق نقدية مطبوعة' } },
        ],
        correctOptionId: 'a',
        explanation: {
          en: 'Following Abd al-Malik’s coinage reform, Abbasid dinars featured calligraphic inscriptions and exact ~4.25g gold weight.',
          ar: 'اعتمدت السكة العباسية الخط الكوفي دون صور، بوزن قياسي نحو ٤٫٢٥ غرام ذهب.',
        },
        accuracy: 'documented',
      },
      {
        id: 'ms-q3',
        prompt: {
          en: 'Why were trades organized into separate alleys in al-Karkh?',
          ar: 'لماذا خُصصت أزقة مستقلة لكل حرفة في سوق الكرخ؟',
        },
        options: [
          { id: 'a', text: { en: 'For fair price comparison, guild inspection by the muhtasib, and clean separation of crafts', ar: 'لتسهيل مقارنة الأسعار ورقابة المحتسب وفصل الحرف النظيفة عن الصاخبة' } },
          { id: 'b', text: { en: 'To hide goods from travellers', ar: 'لإخفاء البضائع عن المسافرين' } },
          { id: 'c', text: { en: 'Because carts had no wheels', ar: 'لأن العربات بلا عجلات' } },
        ],
        correctOptionId: 'a',
        explanation: {
          en: 'Grouping crafts helped buyers compare quality and enabled the market inspector (muhtasib) to audit scales.',
          ar: 'يسّر تجميع الحرف على المشترين المقارنة، وعلى المحتسب فحص الموازين.',
        },
        accuracy: 'documented',
      },
    ],
  },
];
