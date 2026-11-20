import type { VideoClip } from '../../contracts';

export const BAGHDAD_VIDEOS: VideoClip[] = [
  {
    id: 'overview-baghdad-800',
    category: 'overview',
    title: {
      en: 'Madinat al-Salam: Baghdad at 800 CE Overview',
      ar: 'مدينة السلام: نظرة شاملة على بغداد عام ٨٠٠ م',
    },
    summary: {
      en: 'An aerial orientation of Caliph al-Mansur’s circular capital, Tigris canals, royal court, library, and Karkh markets.',
      ar: 'جولة تمهيدية فوق العاصمة الدائرية للمنصور وقنوات دجلة وبلاط الرشيد وخزانة الكتب وسوق الكرخ.',
    },
    durationSec: 24,
    src: '/assets/videos/baghdad/overview-baghdad-800.mp4',
    posterSrc: '/src/assets/images/baghdad_round_city_overview_1795208338186.jpg',
    vttEnSrc: '/assets/videos/baghdad/overview-baghdad-800.en.vtt',
    vttArSrc: '/assets/videos/baghdad/overview-baghdad-800.ar.vtt',
    accuracy: 'documented',
    chapters: [
      { time: 0, label: { en: 'The Round City Plan (762 CE)', ar: 'تخطيط المدينة المدورة (٧٦٢ م)' } },
      { time: 8, label: { en: 'Court & al-Raqqa Context', ar: 'البلاط وسياق الإقامة في الرقة' } },
      { time: 16, label: { en: 'Scholars, Paper & Trade', ar: 'العلماء والورق وحركة التجارة' } },
    ],
    transcript: [
      {
        start: 0,
        end: 8,
        text: {
          en: 'Founded in 762 CE by Caliph al-Mansur along the Tigris, Baghdad’s circular walls opened through four great gates.',
          ar: 'تأسست مدينة السلام عام ٧٦٢ م على يد المنصور بتخطيط دائري تحيط به الأسوار والأبواب الأربعة.',
        },
      },
      {
        start: 8,
        end: 16,
        text: {
          en: 'By 800 CE, Caliph Harun al-Rashid presided over embassies, mazalim justice, and a court spanning Baghdad and al-Raqqa.',
          ar: 'وبحلول عام ٨٠٠ م، استقبل بلاط هارون الرشيد الوفود ونظر في المظالم متنقلاً بين بغداد والرقة.',
        },
      },
      {
        start: 16,
        end: 24,
        text: {
          en: 'Copyists worked on Samarkand rag paper while astronomers calibrated astrolabes and Karkh markets traded silks and spices.',
          ar: 'نسخ الوراقون على ورق سمرقند، وعاير الفلكيون الأسطرلابات، وازدهر سوق الكرخ بالتجارة.',
        },
      },
    ],
  },
  // 6 District Tours
  {
    id: 'tour-golden-gate-approach',
    category: 'district',
    locationId: 'golden-gate-approach',
    title: { en: 'District Tour: Golden Gate Approach', ar: 'جولة حي: مدخل البوابة الذهبية' },
    summary: {
      en: 'Explore the fortified sandstone gatehouse, bent-axis defense, and the processional avenue.',
      ar: 'استكشف البوابة الحجرية المحصنة والمدخل المنكسر والجادة الملكية.',
    },
    durationSec: 18,
    src: '/assets/videos/baghdad/tour-golden-gate.mp4',
    posterSrc: '/src/assets/images/baghdad_round_city_overview_1795208338186.jpg',
    accuracy: 'documented',
    chapters: [
      { time: 0, label: { en: 'Processional Avenue', ar: 'الجادة المرصوفة' } },
      { time: 9, label: { en: 'Defensive Ramparts', ar: 'التحصينات الدفاعية' } },
    ],
    transcript: [
      {
        start: 0,
        end: 9,
        text: {
          en: 'Travellers entered Madinat al-Salam across canal bridges and sandstone paving leading straight toward the Golden Gate.',
          ar: 'عبر المسافرون القنوات فوق الجسور وصولاً إلى الجادة الرملية المؤدية إلى البوابة الذهبية.',
        },
      },
      {
        start: 9,
        end: 18,
        text: {
          en: 'Double mud-brick walls, round bastions, and vaulted guard chambers shielded the administrative heart of the caliphate.',
          ar: 'حمت الأسوار المزدوجة والأبراج المستديرة قلب الخلافة العباسية.',
        },
      },
    ],
  },
  {
    id: 'tour-great-courtyard',
    category: 'district',
    locationId: 'great-courtyard',
    title: { en: 'District Tour: Great Courtyard', ar: 'جولة حي: الصحن الكبير' },
    summary: {
      en: 'See how marble colonnades and the canal-fed octagonal fountain cooled the palace heart.',
      ar: 'شاهد كيف برّدت الأروقة الرخامية والنافورة المثمنة قلب القصر.',
    },
    durationSec: 18,
    src: '/assets/videos/baghdad/tour-great-courtyard.mp4',
    posterSrc: '/src/assets/images/baghdad_courtyard_fountain_1795208338331.jpg',
    accuracy: 'dramatized',
    chapters: [
      { time: 0, label: { en: 'Colonnade Geometry', ar: 'هندسة الأروقة' } },
      { time: 9, label: { en: 'Fountain Cooling', ar: 'تبريد النافورة' } },
    ],
    transcript: [
      {
        start: 0,
        end: 9,
        text: {
          en: 'Surrounding the Great Courtyard, tall pointed arches cast cool geometric shadows across inlaid marble paths.',
          ar: 'تحيط بالصحن الكبير عقود مدببة تلقي بظلالها الباردة على الممرات الرخامية.',
        },
      },
      {
        start: 9,
        end: 18,
        text: {
          en: 'Drawn from the Nahr Isa canal, the octagonal fountain humidified the dry afternoon breeze before it reached the iwan.',
          ar: 'ترطب النافورة المستمدة من نهر عيسى هواء العصر قبل دخوله قاعة الاستقبال.',
        },
      },
    ],
  },
  {
    id: 'tour-audience-hall',
    category: 'district',
    locationId: 'audience-hall',
    title: { en: 'District Tour: Audience Hall & Green Dome', ar: 'جولة حي: قاعة الاستقبال والقبة الخضراء' },
    summary: {
      en: 'Step beneath the Green Dome where Caliph Harun al-Rashid heard petitions and received envoys.',
      ar: 'ادخل تحت القبة الخضراء حيث ينظر الرشيد في المظالم ويستقبل السفارات.',
    },
    durationSec: 20,
    src: '/assets/videos/baghdad/tour-audience-hall.mp4',
    posterSrc: '/src/assets/images/abbasid_water_clock_brass_1795208339767.jpg',
    accuracy: 'documented',
    chapters: [
      { time: 0, label: { en: 'Mazalim Justice', ar: 'مجلس المظالم' } },
      { time: 10, label: { en: 'Envoys & Gifts', ar: 'السفراء والهدايا' } },
    ],
    transcript: [
      {
        start: 0,
        end: 10,
        text: {
          en: 'Beneath the glazed Green Dome, Harun al-Rashid held mazalim hearings alongside Chief Judge Abu Yusuf to address public petitions.',
          ar: 'تحت القبة الخضراء جلس هارون الرشيد والقاضي أبو يوسف لسماع شكاوى الرعية.',
        },
      },
      {
        start: 10,
        end: 20,
        text: {
          en: 'Diplomatic envoys from lands as distant as Charlemagne’s Francia marvelled at woven silks, calligraphy, and brass automata.',
          ar: 'انبهر مبعوثو الملك شارلمان بمنسوجات الطراز والساعات المائية النحاسية.',
        },
      },
    ],
  },
  {
    id: 'tour-palace-garden',
    category: 'district',
    locationId: 'palace-garden',
    title: { en: 'District Tour: Palace Garden', ar: 'جولة حي: بستان القصر' },
    summary: {
      en: 'Stroll beside canal water channels, date palms, fruiting pomegranates, and courtyard shatranj tables.',
      ar: 'تجول بمحاذاة القنوات المائية والنخيل والرمان ومجالس الشطرنج.',
    },
    durationSec: 18,
    src: '/assets/videos/baghdad/tour-palace-garden.mp4',
    posterSrc: '/src/assets/images/baghdad_courtyard_fountain_1795208338331.jpg',
    accuracy: 'documented',
    chapters: [
      { time: 0, label: { en: 'Oasis Canopy', ar: 'مظلة النخيل' } },
      { time: 9, label: { en: 'Courtly Shatranj', ar: 'الشطرنج في البلاط' } },
    ],
    transcript: [
      {
        start: 0,
        end: 9,
        text: {
          en: 'Stone runnels carried Tigris canal water through palm and pomegranate groves, turning arid heat into a fragrant oasis.',
          ar: 'حملت القنوات الحجرية ماء دجلة بين النخيل والرمان لتحويل الحر إلى واحة عطرة.',
        },
      },
      {
        start: 9,
        end: 18,
        text: {
          en: 'In shaded pavilions, poets recited verse and matched wits over carved ivory and walnut shatranj boards.',
          ar: 'في الأروقة الظليلة أنشد الشعراء الشعر وتباروا على رقع الشطرنج.',
        },
      },
    ],
  },
  {
    id: 'tour-scholars-library',
    category: 'district',
    locationId: 'scholars-library',
    title: { en: 'District Tour: Scholars’ Library', ar: 'جولة حي: خزانة العلماء' },
    summary: {
      en: 'Visit copyists and astronomers translating scientific manuscripts onto newly introduced rag paper.',
      ar: 'زُر النساخ والفلكيين وهم يترجمون المخطوطات العلمية على الورق الجديد.',
    },
    durationSec: 18,
    src: '/assets/videos/baghdad/tour-scholars-library.mp4',
    posterSrc: '/src/assets/images/abbasid_scholars_astrolabe_1795208339969.jpg',
    accuracy: 'documented',
    chapters: [
      { time: 0, label: { en: 'Paper Revolution', ar: 'ثورة الورق' } },
      { time: 9, label: { en: 'Multilingual Translation', ar: 'حركة الترجمة' } },
    ],
    transcript: [
      {
        start: 0,
        end: 9,
        text: {
          en: 'In early Abbasid libraries, rag paper from Central Asia lowered the cost of books compared with sheep-skin parchment.',
          ar: 'أخفض الورق القادم من آسيا الوسطى كلفة نسخ الكتب مقارنة بالرق الباهظ.',
        },
      },
      {
        start: 9,
        end: 18,
        text: {
          en: 'Scholars rendered Greek, Syriac, Pahlavi, and Sanskrit works of medicine and astronomy into clear Arabic.',
          ar: 'نقل العلماء رسائل الطب والفلك من اليونانية والسريانية والفارسية والهندية إلى العربية.',
        },
      },
    ],
  },
  {
    id: 'tour-market-street',
    category: 'district',
    locationId: 'market-street',
    title: { en: 'District Tour: Karkh Market Street', ar: 'جولة حي: سوق الكرخ' },
    summary: {
      en: 'Experience the vibrant outer bazaar of spices, silks, coppersmiths, and muhtasib-inspected scales.',
      ar: 'شاهد نبض السوق الخارجي بتوابله وحريره ونحاسه وموازين المحتسب.',
    },
    durationSec: 18,
    src: '/assets/videos/baghdad/tour-market-street.mp4',
    posterSrc: '/src/assets/images/karkh_spice_market_1795208339920.jpg',
    accuracy: 'documented',
    chapters: [
      { time: 0, label: { en: 'Caravan Goods', ar: 'بضائع القوافل' } },
      { time: 9, label: { en: 'Dinars & Hisba Law', ar: 'الدنانير ونظام الحسبة' } },
    ],
    transcript: [
      {
        start: 0,
        end: 9,
        text: {
          en: 'Outside the Round City walls, al-Karkh welcomed silk from Khurasan alongside cinnamon, saffron, and Indian pepper.',
          ar: 'خارج أسوار المدينة المدورة، استقبل الكرخ حرير خراسان والقرفة والزعفران والفلفل.',
        },
      },
      {
        start: 9,
        end: 18,
        text: {
          en: 'Market inspectors checked balance scales while transactions settled in pure gold dinars and silver dirhams.',
          ar: 'راقب المحتسب دقة الموازين بينما تمت المبادلات بالدينار الذهبي والدرهم الفضي.',
        },
      },
    ],
  },
  // 8 Micro-Detail Artifact Clips
  {
    id: 'detail-astrolabe',
    category: 'artifact',
    artifactId: 'astrolabe',
    locationId: 'scholars-library',
    title: { en: 'Micro-Detail: How an Astrolabe Reads the Sky', ar: 'تفصيل دقيق: كيف يقرأ الأسطرلاب السماء' },
    summary: {
      en: 'Close-up breakdown of the throne ring, star-pointer rete, and Baghdad latitude plate.',
      ar: 'شرح قريب لحلقة التعليق وشبكة النجوم وصفيحة خط عرض بغداد.',
    },
    durationSec: 16,
    src: '/assets/videos/baghdad/detail-astrolabe.mp4',
    posterSrc: '/src/assets/images/abbasid_scholars_astrolabe_1795208339969.jpg',
    accuracy: 'documented',
    chapters: [
      { time: 0, label: { en: 'Sighting with the Alidade', ar: 'الرصد بالعضادة' } },
      { time: 8, label: { en: 'Rotating the Star Rete', ar: 'تدوير شبكة النجوم' } },
    ],
    transcript: [
      {
        start: 0,
        end: 8,
        text: {
          en: 'By sighting a bright star through the alidade’s tiny brass vanes, an astronomer reads its altitude degree on the outer rim.',
          ar: 'يرصد الفلكي النجم عبر ثقبي العضادة ليقرأ زاوية ارتفاعه على الإطار الخارجي.',
        },
      },
      {
        start: 8,
        end: 16,
        text: {
          en: 'Turning the star pointer onto that matching altitude circle reveals the exact solar time and rising constellations.',
          ar: 'وبمطابقة مؤشر النجم على دائرة الارتفاع تُعرف الساعة والطوالع الفلكية.',
        },
      },
    ],
  },
  {
    id: 'detail-water-clock',
    category: 'artifact',
    artifactId: 'water-clock',
    locationId: 'audience-hall',
    title: { en: 'Micro-Detail: Mechanics of the Water Clock', ar: 'تفصيل دقيق: آلية الساعة المائية' },
    summary: {
      en: 'Discover how steady hydraulic pressure turned bronze dials and dropped hourly chimes.',
      ar: 'اكتشف كيف حرك الضغط المائي المنتظم التروس وأسقط الكرات كل ساعة.',
    },
    durationSec: 16,
    src: '/assets/videos/baghdad/detail-water-clock.mp4',
    posterSrc: '/src/assets/images/abbasid_water_clock_brass_1795208339767.jpg',
    accuracy: 'documented',
    chapters: [
      { time: 0, label: { en: 'Constant-Head Pressure', ar: 'ثبات ضغط الماء' } },
      { time: 8, label: { en: 'Hourly Bronze Chimes', ar: 'رنين الكرات النحاسية' } },
    ],
    transcript: [
      {
        start: 0,
        end: 8,
        text: {
          en: 'An overflow weir held the upper reservoir level constant so water dripped into the float chamber at an unchanging pace.',
          ar: 'يحفظ المصرف مستوى الماء ثابتاً ليقطر نحو حوض العوامة بسرعة منتظمة.',
        },
      },
      {
        start: 8,
        end: 16,
        text: {
          en: 'As the float rose, geared chains turned the dial and released bronze spheres at each completed hour.',
          ar: 'مع ارتفاع العوامة تدور التروس وتُسقط الكرة النحاسية معلنة تمام الساعة.',
        },
      },
    ],
  },
  {
    id: 'detail-gold-dinar',
    category: 'artifact',
    artifactId: 'gold-dinar',
    locationId: 'market-street',
    title: { en: 'Micro-Detail: Epigraphic Abbasid Gold Dinar', ar: 'تفصيل دقيق: الدينار الذهبي العباسي' },
    summary: {
      en: 'Inspect the Kufic lettering, mint markings, and 4.25g mithqal weight standard.',
      ar: 'تفحّص الخط الكوفي وتاريخ السكة ووزن المثقال القياسي.',
    },
    durationSec: 14,
    src: '/assets/videos/baghdad/detail-gold-dinar.mp4',
    posterSrc: '/src/assets/images/abbasid_water_clock_brass_1795208339767.jpg',
    accuracy: 'documented',
    chapters: [
      { time: 0, label: { en: 'Kufic Epigraphy', ar: 'النقش الكوفي' } },
      { time: 7, label: { en: 'Weighing Purity', ar: 'وزن النقاء' } },
    ],
    transcript: [
      {
        start: 0,
        end: 7,
        text: {
          en: 'Abbasid gold dinars replaced ruler portraits with bold Kufic calligraphy announcing the mint year and city.',
          ar: 'استبدلت الدنانير العباسية صور الملوك بنقوش كوفية تذكر سنة السك والمدينة.',
        },
      },
      {
        start: 7,
        end: 14,
        text: {
          en: 'Struck near 4.25 grams of high-purity gold, they circulated from Iraq to Baltic hoards and Frankish courts.',
          ar: 'بوزن ٤٫٢٥ غرام من الذهب الصافي تداولها التجار من العراق حتى أوروبا.',
        },
      },
    ],
  },
  {
    id: 'detail-manuscript-table',
    category: 'artifact',
    artifactId: 'manuscript-table',
    locationId: 'scholars-library',
    title: { en: 'Micro-Detail: Rag Paper & Reed Pens', ar: 'تفصيل دقيق: الورق وقلم القصب' },
    summary: {
      en: 'Examine how starch-sized linen sheets and cut reed pens transformed manuscript craft.',
      ar: 'تأمل كيف غيّر الورق المصقول بالنشا وأقلام القصب حرفة النسخ.',
    },
    durationSec: 16,
    src: '/assets/videos/baghdad/detail-manuscript-table.mp4',
    posterSrc: '/src/assets/images/abbasid_scholars_astrolabe_1795208339969.jpg',
    accuracy: 'traditional',
    chapters: [
      { time: 0, label: { en: 'Burnishing Paper', ar: 'صقل الورق' } },
      { time: 8, label: { en: 'Cutting the Qalam', ar: 'بري القلم' } },
    ],
    transcript: [
      {
        start: 0,
        end: 8,
        text: {
          en: 'Beaten linen rags formed fibrous sheets sized with wheat starch and polished smooth with an agate stone.',
          ar: 'تُعجن ألياف الكتان وتُصقل بالنشا وحجر العقيق حتى تصبح ملساء كالحرير.',
        },
      },
      {
        start: 8,
        end: 16,
        text: {
          en: 'Beveled reed pens dipped into soot ink inside a silk-lined inkwell gave Abbasid treatises crisp legibility.',
          ar: 'تمنح القصبة المقطوطة مع حبر السخام صفحات المخطوطات وضوحاً يدوم قروناً.',
        },
      },
    ],
  },
  {
    id: 'detail-court-fountain',
    category: 'artifact',
    artifactId: 'court-fountain',
    locationId: 'great-courtyard',
    title: { en: 'Micro-Detail: Courtyard Hydraulic Cooling', ar: 'تفصيل دقيق: تبريد صحن القصر بالماء' },
    summary: {
      en: 'Follow gravity conduits from river intakes to octagonal marble spray basins.',
      ar: 'تتبع القنوات المائية من النهر إلى النافورة الرخامية المثمنة.',
    },
    durationSec: 14,
    src: '/assets/videos/baghdad/detail-court-fountain.mp4',
    posterSrc: '/src/assets/images/baghdad_courtyard_fountain_1795208338331.jpg',
    accuracy: 'documented',
    chapters: [
      { time: 0, label: { en: 'Gravity Siphon', ar: 'انسياب الجاذبية' } },
      { time: 7, label: { en: 'Evaporative Breeze', ar: 'نسيم التبخر' } },
    ],
    transcript: [
      {
        start: 0,
        end: 7,
        text: {
          en: 'Covered brick conduits tapped higher canal levels so natural hydraulic pressure pushed water up the central marble pillar.',
          ar: 'تستفيد القنوات المغطاة من فارق المنسوب لرفع الماء داخل عمود النافورة.',
        },
      },
      {
        start: 7,
        end: 14,
        text: {
          en: 'Evaporation dropped local air temperature before the water drained outward into eastern garden beds.',
          ar: 'يلطّف التبخر حرارة الهواء ثم يتجه الفائض لري أشجار البستان.',
        },
      },
    ],
  },
  {
    id: 'detail-shatranj-board',
    category: 'artifact',
    artifactId: 'shatranj-board',
    locationId: 'palace-garden',
    title: { en: 'Micro-Detail: Courtly Shatranj Strategy', ar: 'تفصيل دقيق: قواعد الشطرنج العباسي' },
    summary: {
      en: 'Compare 800 CE shatranj moves—Fil and Firzan—with modern chess.',
      ar: 'قارن حركات الفيل والفرزان في الشطرنج العباسي بالشطرنج الحديث.',
    },
    durationSec: 14,
    src: '/assets/videos/baghdad/detail-shatranj-board.mp4',
    posterSrc: '/src/assets/images/baghdad_round_city_overview_1795208338186.jpg',
    accuracy: 'documented',
    chapters: [
      { time: 0, label: { en: 'Early Piece Moves', ar: 'حركات القطع القديمة' } },
      { time: 7, label: { en: 'Mansubat Puzzles', ar: 'منصوبات الشطرنج' } },
    ],
    transcript: [
      {
        start: 0,
        end: 7,
        text: {
          en: 'In 800 CE shatranj, the firzan stepped one diagonal square and the elephant leapt two squares diagonally.',
          ar: 'في شطرنج عام ٨٠٠ م تحرك الفرزان خطوة قطرية واحدة وقفز الفيل خانتين.',
        },
      },
      {
        start: 7,
        end: 14,
        text: {
          en: 'Master players recorded delicate endgame studies called mansubat across Baghdad libraries.',
          ar: 'دوّن كبار اللاعبين مسائل نهاية اللعب المعروفة بالمنصوبات في خزائن الكتب.',
        },
      },
    ],
  },
  {
    id: 'detail-oud',
    category: 'artifact',
    artifactId: 'oud',
    locationId: 'audience-hall',
    title: { en: 'Micro-Detail: Craft & Sound of the Abbasid Oud', ar: 'تفصيل دقيق: صناعة العود العباسي ونغمه' },
    summary: {
      en: 'Explore the four-course gut-and-silk lute celebrated by al-Mawsili and al-Kindi.',
      ar: 'استكشف العود ذا الأوتار الأربعة الذي اشتهر به الموصلي والكندي.',
    },
    durationSec: 14,
    src: '/assets/videos/baghdad/detail-oud.mp4',
    posterSrc: '/src/assets/images/baghdad_courtyard_fountain_1795208338331.jpg',
    accuracy: 'documented',
    chapters: [
      { time: 0, label: { en: 'Four Courses', ar: 'الأوتار الأربعة' } },
      { time: 7, label: { en: 'Hijaz & Court Song', ar: 'مقام الحجاز والغناء' } },
    ],
    transcript: [
      {
        start: 0,
        end: 7,
        text: {
          en: 'Carved wooden staves and a parchment-thin soundboard gave the four-course oud warm resonance in vaulted halls.',
          ar: 'منحت أضلاع الخشب الرقيقة العود رنيناً دافئاً داخل القاعات المقببة.',
        },
      },
      {
        start: 7,
        end: 14,
        text: {
          en: 'Philosopher al-Kindi later connected its four strings to cosmic harmony and Arabic rhythmic poetry.',
          ar: 'ربط الكندي أوتاره الأربعة بنسب التناغم الصوتي والإيقاع الشعري العربي.',
        },
      },
    ],
  },
  {
    id: 'detail-spice-stall',
    category: 'artifact',
    artifactId: 'spice-stall',
    locationId: 'market-street',
    title: { en: 'Micro-Detail: Spices, Silk & Scales in Karkh', ar: 'تفصيل دقيق: التوابل والحرير في الكرخ' },
    summary: {
      en: 'Identify authentic 800 CE bazaar goods and why New World crops were absent.',
      ar: 'تعرف على بضائع القرن التاسع الأصيلة وغياب محاصيل العالم الجديد.',
    },
    durationSec: 14,
    src: '/assets/videos/baghdad/detail-spice-stall.mp4',
    posterSrc: '/src/assets/images/karkh_spice_market_1795208339920.jpg',
    accuracy: 'documented',
    chapters: [
      { time: 0, label: { en: 'Authentic Spices', ar: 'التوابل الأصيلة' } },
      { time: 7, label: { en: 'Fair Weights', ar: 'نزاهة الموازين' } },
    ],
    transcript: [
      {
        start: 0,
        end: 7,
        text: {
          en: 'Saffron, black pepper, cloves, and cinnamon arrived by caravan and riverboat into Karkh spice stalls.',
          ar: 'وصل الزعفران والفلفل والقرنفل والقرفة عبر القوافل والسفن إلى الكرخ.',
        },
      },
      {
        start: 7,
        end: 14,
        text: {
          en: 'Muhtasib inspectors verified brass balances while shoppers paid in gold dinars and silver dirhams.',
          ar: 'تحقق المحتسب من دقة الموازين النحاسية أثناء البيع بالدينار والدرهم.',
        },
      },
    ],
  },
];
