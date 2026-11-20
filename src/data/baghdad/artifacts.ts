import type { AcademyArtifact } from '../../types';

// Crisp inline SVG data-URI comparison plate for modern eras (zero external CDN dependencies)
const QUARTZ_WATCH_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
    <rect width="800" height="600" fill="#EEF5F7"/>
    <circle cx="400" cy="300" r="190" fill="#FFFFFF" stroke="#2B6CB0" stroke-width="14"/>
    <circle cx="400" cy="300" r="160" fill="#FBF8F3" stroke="#94A3B8" stroke-width="3"/>
    <rect x="355" y="40" width="90" height="75" rx="12" fill="#1E293B"/>
    <rect x="355" y="485" width="90" height="75" rx="12" fill="#1E293B"/>
    <text x="400" y="210" text-anchor="middle" font-family="sans-serif" font-size="24" font-weight="700" fill="#2B6CB0">32,768 Hz QUARTZ</text>
    <text x="400" y="325" text-anchor="middle" font-family="monospace" font-size="72" font-weight="700" fill="#1E293B">08:00:00</text>
    <text x="400" y="385" text-anchor="middle" font-family="sans-serif" font-size="22" fill="#526071">Battery + Piezoelectric Crystal</text>
  </svg>`);

const MODERN_PRESS_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
    <rect width="800" height="600" fill="#EEF5F7"/>
    <rect x="130" y="110" width="540" height="380" rx="22" fill="#FFFFFF" stroke="#2B6CB0" stroke-width="8"/>
    <rect x="180" y="165" width="440" height="44" rx="8" fill="#1E293B"/>
    <rect x="180" y="240" width="200" height="190" rx="10" fill="#FBF8F3" stroke="#94A3B8" stroke-width="3"/>
    <rect x="415" y="240" width="205" height="190" rx="10" fill="#FBF8F3" stroke="#94A3B8" stroke-width="3"/>
    <text x="400" y="194" text-anchor="middle" font-family="sans-serif" font-size="22" font-weight="700" fill="#FFFFFF">OFFSET PRINTING &amp; DIGITAL TYPE</text>
    <text x="280" y="330" text-anchor="middle" font-family="sans-serif" font-size="20" font-weight="700" fill="#2B6CB0">Plates &amp; Rollers</text>
    <text x="518" y="330" text-anchor="middle" font-family="sans-serif" font-size="20" font-weight="700" fill="#2F855A">10,000+ Sheets/Hr</text>
  </svg>`);

export const BAGHDAD_ARTIFACTS: AcademyArtifact[] = [
  {
    id: 'astrolabe',
    name: { en: 'Brass Planispheric Astrolabe', ar: 'الأسطرلاب النحاسي المسطح' },
    districtId: 'scholars-library',
    era: { en: 'Late 8th Century CE', ar: 'أواخر القرن الثامن الميلادي' },
    summary: {
      en: 'An engraved handheld brass astronomical calculator projecting the celestial dome onto interchangeable latitude plates.',
      ar: 'حاسبة فلكية نحاسية محمولة تُسقط القبة السماوية على صفائح مدرجة حسب خط العرض.',
    },
    historicalDetail: {
      en: 'Astronomer Muhammad ibn Ibrahim al-Fazari worked in Baghdad crafting brass astrolabes and treatises. Scholars used the back alidade sighting rule to measure star or solar altitude and read the hour on the front rete.',
      ar: 'صنع الفلكيون في بغداد أمثال محمد بن إبراهيم الفزاري الأسطرلابات النحاسية لقياس ارتفاع الشمس والنجوم ومعرفة الوقت وخط العرض.',
    },
    accuracy: 'documented',
    sourceNote: 'Ibn al-Nadim, Kitab al-Fihrist; David A. King, In Synchrony with the Heavens',
    imageCreditId: 'scholars-astrolabe',
    videoId: 'detail-astrolabe',
    hotspots: [
      {
        id: 'ast-1',
        number: 1,
        xPercent: 40,
        yPercent: 25,
        label: { en: 'Throne & Suspension Ring (Kursi)', ar: 'الكرسي وحلقة التعليق' },
        description: {
          en: 'Holding the ring lets gravity align the astrolabe vertically when sighting a star or the midday sun.',
          ar: 'يتدلى الجهاز من الحلقة ليستقيم عمودياً بفعل الجاذبية عند رصد النجوم.',
        },
        accuracy: 'documented',
        sourceNote: 'Abbasid astrolabe manuals',
      },
      {
        id: 'ast-2',
        number: 2,
        xPercent: 42,
        yPercent: 49,
        label: { en: 'Openwork Star Pointer Rete (Ankabut)', ar: 'الشبكة النجمية (العنكبوت)' },
        description: {
          en: 'The rotating cut-brass web carries curved pointers marking bright stars such as Vega, Sirius, and Aldebaran.',
          ar: 'شبكة نحاسية مفرغة تدور فوق الصفيحة وتشير رؤوسها المدببة إلى ألمع النجوم.',
        },
        accuracy: 'documented',
        sourceNote: 'David A. King',
      },
      {
        id: 'ast-3',
        number: 3,
        xPercent: 34,
        yPercent: 56,
        label: { en: 'Interchangeable Tympan Plate (Safiha)', ar: 'الصفيحة المدرجة' },
        description: {
          en: 'Engraved with altitude circles tuned specifically for Baghdad’s latitude (~33° N).',
          ar: 'صفيحة محفورة بدوائر الارتفاع المعايرة خصيصاً لخط عرض بغداد (~٣٣ شمالاً).',
        },
        accuracy: 'documented',
        sourceNote: 'Baghdad horological studies',
      },
      {
        id: 'ast-4',
        number: 4,
        xPercent: 50,
        yPercent: 54,
        label: { en: 'Alidade Sighting Rule (Idada)', ar: 'العضادة والقطب المركزي' },
        description: {
          en: 'Pivoted on the central pin (qutb) with pinhole vanes to measure an angle from 0° to 90° without looking directly at the sun.',
          ar: 'مسطرة دوارة مثقوبة تسمح بقراءة زاوية ارتفاع الشمس من ظل الثقب دون النظر إليها مباشرة.',
        },
        accuracy: 'documented',
        sourceNote: 'Medieval sighting optics',
      },
    ],
  },
  {
    id: 'water-clock',
    name: { en: 'Brass Clepsydra (Water Clock)', ar: 'الساعة المائية النحاسية' },
    districtId: 'audience-hall',
    era: { en: 'c. 790–807 CE', ar: 'نحو ٧٩٠–٨٠٧ م' },
    summary: {
      en: 'A regulated water-powered clock measuring hours by calibrated outflow, rising floats, and bronze chime spheres.',
      ar: 'آلة ميكانيكية تعتمد على تدفق الماء المنضبط وعوامة داخلية لإسقاط كرات نحاسية تعلن الساعات.',
    },
    historicalDetail: {
      en: 'Hydraulic timekeepers at the Abbasid court engineered automated clepsydrae. The Royal Frankish Annals famously describe a water clock sent by Harun’s court reaching Aachen in 807 CE with 12 falling brass balls and opening doors.',
      ar: 'ابتكر المهندسون العباسيون ساعات مائية دقيقة، وسجّلت الحوليات الفرنجية وصول ساعة مائية بديعة من بلاط الرشيد تفتح أبوابها وتسقط كراتها كل ساعة.',
    },
    accuracy: 'documented',
    sourceNote: 'Donald R. Hill, Arabic Water-Clocks; Annales Regni Francorum',
    imageCreditId: 'water-clock-brass',
    videoId: 'detail-water-clock',
    hotspots: [
      {
        id: 'wc-1',
        number: 1,
        xPercent: 36,
        yPercent: 25,
        label: { en: 'Constant-Head Reservoir', ar: 'خزان الضغط الثابت' },
        description: {
          en: 'Keeps water pressure steady so each hour flows at an identical rate regardless of tank depth.',
          ar: 'يحفظ مستوى الضغط المائي ثابتاً لتمر الساعات بوتيرة منتظمة تماماً.',
        },
        accuracy: 'documented',
        sourceNote: 'Donald R. Hill',
      },
      {
        id: 'wc-2',
        number: 2,
        xPercent: 39,
        yPercent: 48,
        label: { en: 'Geared Dial & Zodiac Ring', ar: 'القرص المدرج والتروس' },
        description: {
          en: 'Chains linked to the sinking float rotated gears that marked solar and equinoctial hours.',
          ar: 'تنقل السلاسل حركة العوامة إلى التروس فتدير مؤشر الساعات على الوجه النحاسي.',
        },
        accuracy: 'documented',
        sourceNote: 'Arabic mechanical engineering treatises',
      },
      {
        id: 'wc-3',
        number: 3,
        xPercent: 45,
        yPercent: 59,
        label: { en: 'Chiming Bronze Spheres', ar: 'الكرات النحاسية الرنانة' },
        description: {
          en: 'At the completion of an hour, a release lever dropped a bronze ball into a resonant basin.',
          ar: 'عند تمام كل ساعة تسقط كرة نحاسية في الطست المرن فتصدر رنيناً واضحاً.',
        },
        accuracy: 'documented',
        sourceNote: 'Annales Regni Francorum (807 CE account)',
      },
      {
        id: 'wc-4',
        number: 4,
        xPercent: 34,
        yPercent: 72,
        label: { en: 'Outflow Valve & Basin', ar: 'صمام التصريف والحوض السفلي' },
        description: {
          en: 'Onyx or jewel-lined orifice resisted mineral wear so flow calibration remained accurate.',
          ar: 'فتحة دقيقة مبطنة بالعقيق تقاوم التآكل لضمان دقة التدفق طوال اليوم.',
        },
        accuracy: 'documented',
        sourceNote: 'Hill, Arabic Water-Clocks',
      },
    ],
    comparison: {
      id: 'cmp-clock',
      title: { en: 'Timekeeping Then & Now', ar: 'قياس الزمن بين الأمس واليوم' },
      leftLabel: { en: '800 CE Brass Water Clock', ar: 'الساعة المائية (٨٠٠ م)' },
      rightLabel: { en: 'Modern Quartz Watch', ar: 'ساعة الكوارتز الحديثة' },
      leftDescription: {
        en: 'Driven by gravity, constant-head water flow, floats, and mechanical release levers.',
        ar: 'تعتمد على الجاذبية وتدفق الماء المنضبط والعوامات والعتلات الميكانيكية.',
      },
      rightDescription: {
        en: 'Driven by a battery vibrating a silicon quartz crystal at 32,768 cycles per second.',
        ar: 'تعتمد على بطارية تهز بلورة كوارتز بتردد ٣٢٬٧٦٨ ذبذبة في الثانية.',
      },
      leftImageSrc: '/src/assets/images/abbasid_water_clock_brass_1795208339767.jpg',
      rightImageSrc: QUARTZ_WATCH_SVG,
    },
  },
  {
    id: 'gold-dinar',
    name: { en: 'Abbasid Gold Dinar', ar: 'الدينار العباسي الذهبي' },
    districtId: 'market-street',
    era: { en: 'c. 786–809 CE', ar: 'عهد هارون الرشيد (٧٨٦–٨٠٩ م)' },
    summary: {
      en: 'High-purity ~4.25g gold coinage carrying purely calligraphic Arabic inscriptions and Hijri minting year.',
      ar: 'عملة ذهبية عالية النقاء بوزن نحو ٤٫٢٥ غرام تحمل نقوشاً خطية عربية خالصة دون صور.',
    },
    historicalDetail: {
      en: 'Struck in the City of Peace (Madinat al-Salam), the Abbasid dinar stabilized trade across Mesopotamia, the Mediterranean, and Silk Road caravans.',
      ar: 'ضُربت الدنانير في دار السكة بمدينة السلام فكانت عملة موثوقة في التجارة من المتوسط إلى آسيا الوسطى.',
    },
    accuracy: 'documented',
    sourceNote: 'Michael Bates, Islamic Coins; British Museum & Ashmolean catalogs',
    imageCreditId: 'water-clock-brass',
    videoId: 'detail-gold-dinar',
    hotspots: [
      {
        id: 'gd-1',
        number: 1,
        xPercent: 72,
        yPercent: 60,
        label: { en: 'Central Kufic Epigraphy', ar: 'النقش الكوفي في المركز' },
        description: {
          en: 'Crisp angular Kufic calligraphy fills the obverse field instead of a monarch’s portrait.',
          ar: 'يمتلئ وجه الدينار بالخط الكوفي الهندسي الصارم بدلاً من صورة الحاكم.',
        },
        accuracy: 'documented',
        sourceNote: 'Abbasid numismatic collections',
      },
      {
        id: 'gd-2',
        number: 2,
        xPercent: 76,
        yPercent: 71,
        label: { en: 'Marginal Mint & Year Ring', ar: 'هامش دار السكة والسنة' },
        description: {
          en: 'The outer circular band records the Hijri date and city name in crisp hammered relief.',
          ar: 'يسجل الطوق الدائري السنة الهجرية ومكان الضرب بدقة بالغة.',
        },
        accuracy: 'documented',
        sourceNote: 'British Museum coin archive',
      },
      {
        id: 'gd-3',
        number: 3,
        xPercent: 64,
        yPercent: 69,
        label: { en: '4.25g Mithqal Standard', ar: 'وزن المثقال القياسي (٤٫٢٥ غ)' },
        description: {
          en: 'High gold fineness (~96–98%) allowed traders to accept dinars across imperial borders by weight.',
          ar: 'نقاء الذهب المرتفع جعل الدنانير مقبولة عبر الحدود بالوزن العادل.',
        },
        accuracy: 'documented',
        sourceNote: 'Michael Bates, Islamic Coins',
      },
      {
        id: 'gd-4',
        number: 4,
        xPercent: 56,
        yPercent: 75,
        label: { en: 'Paired Silver Dirham Exchange', ar: 'الموازنة مع الدرهم الفضي' },
        description: {
          en: 'Everyday bazaar purchases used silver dirhams and copper fals alongside gold dinars for large cargo.',
          ar: 'استخدمت الدراهم الفضية في الشراء اليومي إلى جانب الدنانير الذهبية للقوافل الكبرى.',
        },
        accuracy: 'documented',
        sourceNote: 'al-Ya’qubi & merchant ledgers',
      },
    ],
  },
  {
    id: 'manuscript-table',
    name: { en: 'Copyist’s Rag Paper & Reed Pens', ar: 'منضدة النساخ والورق وأقلام القصب' },
    districtId: 'scholars-library',
    era: { en: 'c. 800 CE', ar: 'نحو ٨٠٠ م' },
    summary: {
      en: 'Linen-and-hemp rag paper sheets paired with beveled reed pens and carbon ink in the Scholars’ Library.',
      ar: 'أوراق الكتان والقنب المصقولة مع أقلام القصب وحبر السخام في خزانة العلماء.',
    },
    historicalDetail: {
      en: 'Unlike fragile papyrus or costly sheep-skin parchment, rag paper absorbed ink cleanly without cracking, catalyzing Baghdad’s explosion of manuscript copying and translation.',
      ar: 'بخلاف البردي الهش والرق الباهظ الثمن، احتمل الورق المشرقي الحبر دون تشقق مما أحدث نهضة في النسخ والترجمة.',
    },
    accuracy: 'traditional',
    sourceNote: 'Jonathan Bloom, Paper Before Print; Ibn al-Nadim, al-Fihrist',
    imageCreditId: 'scholars-astrolabe',
    videoId: 'detail-manuscript-table',
    hotspots: [
      {
        id: 'mt-1',
        number: 1,
        xPercent: 64,
        yPercent: 64,
        label: { en: 'Starch-Sized Rag Paper', ar: 'الورق المصقول بالنشا' },
        description: {
          en: 'Burnished with agate or glass stones so the reed nib glided smoothly without ink feathering.',
          ar: 'يُصقل الورق بالعقيق والنشا لتنزلق القصبة بسلاسة دون تسرّب الحبر.',
        },
        accuracy: 'traditional',
        sourceNote: 'Jonathan Bloom, Paper Before Print',
      },
      {
        id: 'mt-2',
        number: 2,
        xPercent: 52,
        yPercent: 74,
        label: { en: 'Hand-Cut Reed Qalam', ar: 'قلم القصب المقطوط' },
        description: {
          en: 'Seasoned river reeds cut at an oblique angle gave Arabic letters sharp thick-and-thin strokes.',
          ar: 'قصب نهري مجفف يُبرى بزاوية مائلة ليمنح الحروف العربية تباينها البديع.',
        },
        accuracy: 'documented',
        sourceNote: 'Arabic calligraphic manuals',
      },
      {
        id: 'mt-3',
        number: 3,
        xPercent: 26,
        yPercent: 67,
        label: { en: 'Brass Inkwell & Raw Cotton Wad', ar: 'المحبرة النحاسية والليقة' },
        description: {
          en: 'A raw silk or cotton wad (liqa) inside the inkwell prevented spills and metered ink onto the nib.',
          ar: 'تُوضع خيوط الحرير أو القطن (الليقة) في المحبرة لتنظيم كمية الحبر على سن القلم.',
        },
        accuracy: 'documented',
        sourceNote: 'Medieval scribal craft',
      },
      {
        id: 'mt-4',
        number: 4,
        xPercent: 76,
        yPercent: 52,
        label: { en: 'Marginal Translation Glosses', ar: 'هوامش الترجمة والشروح' },
        description: {
          en: 'Copyists noted Greek, Syriac, or Sanskrit technical terms in margins to standardize Arabic vocabulary.',
          ar: 'أثبت المترجمون المصطلحات اليونانية والسريانية في الهوامش لتوحيد المصطلح العلمي العربي.',
        },
        accuracy: 'documented',
        sourceNote: 'Dimitri Gutas, Greek Thought, Arabic Culture',
      },
    ],
    comparison: {
      id: 'cmp-paper',
      title: { en: 'Book Production Then & Now', ar: 'صناعة الكتاب بين النسخ والطباعة' },
      leftLabel: { en: '800 CE Hand-Copied Rag Paper', ar: 'النسخ اليدوي على الورق (٨٠٠ م)' },
      rightLabel: { en: 'Modern Offset & Digital Press', ar: 'المطبعة الحديثة والنشر الرقمي' },
      leftDescription: {
        en: 'Skilled warraq copyists produced 1 codex over weeks, verifying accuracy by oral reading.',
        ar: 'ينتج الوراقون النسخة يدوياً في أسابيع مع مقابلتها صوتياً لضمان الدقة.',
      },
      rightDescription: {
        en: 'Automated rotary presses and digital layouts reproduce thousands of identical copies per hour.',
        ar: 'تطبع المطابع الآلية آلاف النسخ المتطابقة في الساعة الواحدة.',
      },
      leftImageSrc: '/src/assets/images/abbasid_scholars_astrolabe_1795208339969.jpg',
      rightImageSrc: MODERN_PRESS_SVG,
    },
  },
  {
    id: 'court-fountain',
    name: { en: 'Octagonal Courtyard Fountain', ar: 'نافورة الصحن المثمنة' },
    districtId: 'great-courtyard',
    era: { en: 'c. 800 CE', ar: 'نحو ٨٠٠ م' },
    summary: {
      en: 'An octagonal white marble basin fed by gravity conduits from the Tigris and Nahr Isa canals.',
      ar: 'حوض رخامي مثمن يتوسط الصحن وتغذيه قنوات مائية متصلة بدجلة ونهر عيسى.',
    },
    historicalDetail: {
      en: 'Water engineering transformed Abbasid Baghdad: inverted siphons, subterranean brick conduits, and stepped marble basins brought cool flowing water right into interior courtyards.',
      ar: 'اعتمدت الهندسة المائية العباسية على القنوات القرميدية الجوفية لإيصال الماء الجاري إلى داخل الصحون.',
    },
    accuracy: 'documented',
    sourceNote: 'Guy Le Strange; Donald R. Hill, Islamic Science and Engineering',
    imageCreditId: 'courtyard-fountain',
    videoId: 'detail-court-fountain',
    hotspots: [
      {
        id: 'cf-1',
        number: 1,
        xPercent: 50,
        yPercent: 58,
        label: { en: 'Tiered Brass Finial', ar: 'العمود النحاسي المتدرج' },
        description: {
          en: 'Raised water through a central pipe, cascading over a wide brass saucer.',
          ar: 'يرتفع الماء داخل أنبوب مركزي لينساب فوق طبق نحاسي عريض.',
        },
        accuracy: 'dramatized',
        sourceNote: 'Composite palace fountain design',
      },
      {
        id: 'cf-2',
        number: 2,
        xPercent: 50,
        yPercent: 73,
        label: { en: 'Octagonal Marble Rim', ar: 'الإفريز الرخامي المثمن' },
        description: {
          en: 'Eight-sided geometry echoed classical Islamic tiling stars and offered cool seating ledges.',
          ar: 'الشكل المثمن يستلهم الزخرف الهندسي ويوفر حافة مريحة للجلوس.',
        },
        accuracy: 'documented',
        sourceNote: 'Abbasid architectural fragments',
      },
      {
        id: 'cf-3',
        number: 3,
        xPercent: 34,
        yPercent: 79,
        label: { en: 'Overflow Drain Runnels', ar: 'قنوات التصريف نحو البستان' },
        description: {
          en: 'No water went to waste—overflow channels irrigated eastern palm and pomegranate beds.',
          ar: 'لا يُهدر الماء؛ بل ينساب الفائض لريّ بساتين النخيل والرمان الشرقية.',
        },
        accuracy: 'documented',
        sourceNote: 'Baghdad hydraulic studies',
      },
      {
        id: 'cf-4',
        number: 4,
        xPercent: 67,
        yPercent: 72,
        label: { en: 'Subterranean Brick Supply', ar: 'القناة القرميدية الجوفية' },
        description: {
          en: 'Covered conduits kept water clean and cool between the river intake and palace basin.',
          ar: 'تحافظ القنوات المسقوفة على برودة الماء ونقائه حتى وصوله للصحن.',
        },
        accuracy: 'documented',
        sourceNote: 'Le Strange',
      },
    ],
  },
  {
    id: 'shatranj-board',
    name: { en: 'Ivory & Walnut Shatranj Board', ar: 'رقعة الشطرنج من العاج والجوز' },
    districtId: 'palace-garden',
    era: { en: 'c. 800 CE', ar: 'نحو ٨٠٠ م' },
    summary: {
      en: 'An 8x8 uncheckered strategy board played with carved Shah, Firzan, Rukh, and elephant (Fil) pieces.',
      ar: 'رقعة إستراتيجية من ٦٤ خانة تُلعب بقطع الشاه والفرزان والرخ والفيل المنحوتة.',
    },
    historicalDetail: {
      en: 'Before modern European chess rules evolved centuries later, Abbasid masters authored manuscripts of opening plans (tabiyat) and endgame puzzles (mansubat) under Harun al-Rashid.',
      ar: 'سبق الأساتذة العباسيون بقرون، فألّفوا كتباً في الافتتاحيات (التعبيات) والمسائل الذهنية (المنصوبات).',
    },
    accuracy: 'traditional',
    sourceNote: 'H.J.R. Murray, A History of Chess; al-Mas’udi',
    imageCreditId: 'round-city-overview',
    videoId: 'detail-shatranj-board',
    hotspots: [
      {
        id: 'sb-1',
        number: 1,
        xPercent: 48,
        yPercent: 48,
        label: { en: 'Uncheckered 64-Square Grid', ar: 'شبكة الـ٦٤ مربعاً الموحدة' },
        description: {
          en: 'Early Abbasid boards used uniform carved grid lines rather than alternating black-and-white squares.',
          ar: 'استخدمت الرقع المبكرة خطوطاً محفورة موحدة دون تلوين متناوب للخانات.',
        },
        accuracy: 'documented',
        sourceNote: 'Murray, A History of Chess',
      },
      {
        id: 'sb-2',
        number: 2,
        xPercent: 60,
        yPercent: 46,
        label: { en: 'Al-Fil (Elephant / Bishop Ancestor)', ar: 'قطعة الفيل' },
        description: {
          en: 'Leapt diagonally exactly two squares, jumping over intervening pieces.',
          ar: 'كان الفيل يقفز قطرياً خانتين متجاوزاً ما بينهما.',
        },
        accuracy: 'documented',
        sourceNote: 'Classical shatranj rules',
      },
      {
        id: 'sb-3',
        number: 3,
        xPercent: 35,
        yPercent: 54,
        label: { en: 'Al-Firzan (Counselor)', ar: 'قطعة الفرزان' },
        description: {
          en: 'Moved one square diagonally at a time—much slower than the modern queen introduced in late 15th-century Europe.',
          ar: 'يتحرك خطوة واحدة قطرياً فقط في هذا العصر، قبل تطور حركة الوزير لاحقاً.',
        },
        accuracy: 'documented',
        sourceNote: 'Murray',
      },
      {
        id: 'sb-4',
        number: 4,
        xPercent: 52,
        yPercent: 62,
        label: { en: 'Abstract Geometric Carving', ar: 'النحت الهندسي التجريدي' },
        description: {
          en: 'Pieces were sculpted with stylized notches and domes of ivory or hard wood.',
          ar: 'نُحتت القطع بأشكال هندسية مجردة من العاج وخشب الأبنوس والجوز.',
        },
        accuracy: 'documented',
        sourceNote: 'Surviving Nishapur & Abbasid chess pieces',
      },
    ],
  },
  {
    id: 'oud',
    name: { en: 'Four-Course Abbasid Court Oud', ar: 'العود العباسي ذو الأوتار الأربعة' },
    districtId: 'audience-hall',
    era: { en: 'c. 800 CE', ar: 'نحو ٨٠٠ م' },
    summary: {
      en: 'A pear-shaped wooden lute strung with four double courses of gut and silk, played with an eagle-quill plectrum.',
      ar: 'آلة وترية خشبية كمثرية الشكل بأربعة أوتار مزدوجة من الأمعاء والحرير، يُعزف عليها بريشة نسر.',
    },
    historicalDetail: {
      en: 'Master musicians like Ibrahim al-Mawsili and his son Ishaq performed at Harun’s gatherings, systematizing rhythmic modes and melodic scales (maqamat ancestors) recorded in Kitab al-Aghani.',
      ar: 'أبدع موسيقيو البلاط مثل إبراهيم الموصلي وابنه إسحاق في مجالس الرشيد، ودوّن الأصفهاني أخبارهم في كتاب الأغاني.',
    },
    accuracy: 'documented',
    sourceNote: 'al-Isfahani, Kitab al-Aghani; Farmer, History of Arabian Music',
    imageCreditId: 'courtyard-fountain',
    videoId: 'detail-oud',
    hotspots: [
      {
        id: 'oud-1',
        number: 1,
        xPercent: 45,
        yPercent: 56,
        label: { en: 'Ribbed Walnut Soundbowl', ar: 'صندوق الصوت من خشب الجوز' },
        description: {
          en: 'Light curved wooden staves formed a resonant acoustic chamber ("al-oud" literally means "the wood").',
          ar: 'ألواح خشبية رقيقة مقوسة تصنع تجويفاً رناناً، ومنها سُميت الآلة بالعود.',
        },
        accuracy: 'documented',
        sourceNote: 'Al-Kindi & al-Isfahani',
      },
      {
        id: 'oud-2',
        number: 2,
        xPercent: 53,
        yPercent: 49,
        label: { en: 'Four Gut & Silk Courses', ar: 'الأوتار الأربعة (البم والمثلث والمثنى والزير)' },
        description: {
          en: 'Named Bamm, Mathlath, Mathna, and Zir—later expanded with a fifth string by Ziryab.',
          ar: 'البم والمثلث والمثنى والزير، قبل أن يضيف زرياب وتراً خامساً في القرن التاسع.',
        },
        accuracy: 'documented',
        sourceNote: 'al-Kindi treatises & Kitab al-Aghani',
      },
      {
        id: 'oud-3',
        number: 3,
        xPercent: 60,
        yPercent: 38,
        label: { en: 'Unfretted Fingerboard', ar: 'رقبة العود الملساء' },
        description: {
          en: 'Allows performers to glide smoothly across quarter-tone intervals in Hijaz, Rast, and Bayati scales.',
          ar: 'يتيح الرأس الأملس عزف أرباع المقامات الشرقية كالحجاز والراست والبيات.',
        },
        accuracy: 'documented',
        sourceNote: 'Arab musicology sources',
      },
      {
        id: 'oud-4',
        number: 4,
        xPercent: 40,
        yPercent: 66,
        label: { en: 'Carved Geometric Soundholes', ar: 'الشمسية الصوتية المحفورة' },
        description: {
          en: 'Circular rosettes carved in spruce or cedar balanced bass warmth with articulate plucks.',
          ar: 'فتحات دائرية مزخرفة توازن بين عمق القرار ووضوح النغمة.',
        },
        accuracy: 'documented',
        sourceNote: 'Historical lute craftsmanship',
      },
    ],
  },
  {
    id: 'spice-stall',
    name: { en: 'Karkh Spice & Textile Stall', ar: 'دكان التوابل والحرير في الكرخ' },
    districtId: 'market-street',
    era: { en: 'c. 800 CE', ar: 'نحو ٨٠٠ م' },
    summary: {
      en: 'An outer-bazaar counter displaying Indian pepper, Ceylon cinnamon, Persian saffron, and brass weighing pans.',
      ar: 'منضدة تجارية تعرض الفلفل الهندي والقرفة والزعفران الفارسي وموازين النحاس الدقيقة.',
    },
    historicalDetail: {
      en: 'Caravans and Basra sea-dhows made Baghdad the hub of Afro-Eurasian spices and textiles—yet historically accurate stalls excluded post-1492 New World crops.',
      ar: 'جعلت القوافل وسفن البصرة بغداد ملتقى توابل المشرق وحريره، مع خلوها التام من محاصيل العالم الجديد.',
    },
    accuracy: 'documented',
    sourceNote: 'al-Ya’qubi; Ibn Khordadbeh, Kitab al-Masalik wa al-Mamalik',
    imageCreditId: 'karkh-spice-market',
    videoId: 'detail-spice-stall',
    hotspots: [
      {
        id: 'sp-1',
        number: 1,
        xPercent: 30,
        yPercent: 72,
        label: { en: 'Saffron & Cinnamon Sacks', ar: 'أكياس الزعفران والقرفة' },
        description: {
          en: 'Aromatic spices used in Abbasid cuisine, court perfumes, and medical compounding.',
          ar: 'استُعملت في المطبخ العباسي والعطور والتركيبات الطبية في البيمارستانات.',
        },
        accuracy: 'documented',
        sourceNote: 'Ibn Sayyar al-Warraq, Kitab al-Tabikh',
      },
      {
        id: 'sp-2',
        number: 2,
        xPercent: 48,
        yPercent: 52,
        label: { en: 'Muhtasib Audited Brass Scales', ar: 'ميزان نحاسي خاضع للحسبة' },
        description: {
          en: 'Calibrated stone and glass ratl weights prevented short-measuring.',
          ar: 'أثقال حجرية وزجاجية معايرة تمنع التطفيف في الوزن.',
        },
        accuracy: 'documented',
        sourceNote: 'Hisba treatises',
      },
      {
        id: 'sp-3',
        number: 3,
        xPercent: 74,
        yPercent: 60,
        label: { en: 'Khurasan Silk Bolts', ar: 'لفائف حرير خراسان' },
        description: {
          en: 'Woven mulberry silk arrived from Nishapur, Merv, and further east along overland routes.',
          ar: 'وصل الحرير الفاخر من نيسابور ومرو والشرق عبر القوافل البرية.',
        },
        accuracy: 'documented',
        sourceNote: 'al-Ya’qubi',
      },
      {
        id: 'sp-4',
        number: 4,
        xPercent: 61,
        yPercent: 40,
        label: { en: 'No Post-1492 New World Crops', ar: 'خلو السوق من محاصيل ما بعد ١٤٩٢' },
        description: {
          en: 'Tomatoes, potatoes, chili peppers, and cacao did not reach Iraq until after the Columbian Exchange.',
          ar: 'لم تصل الطماطم والبطاطس والفلفل الحار والكاكاو إلى العراق إلا بعد قرون.',
        },
        accuracy: 'documented',
        sourceNote: 'Agricultural & culinary chronology',
      },
    ],
  },
];
