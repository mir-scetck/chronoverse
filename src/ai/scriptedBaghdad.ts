import type { ChatRequest, ChatResponse, DialogueTurn } from '../contracts';
import { normalizeArabic } from './arabicNormalizer';

export interface ScriptedIntent {
  id: string;
  keywords: string[];
  turn: DialogueTurn;
  discoveredFactIds?: string[];
}

const ANACHRONISM_KEYWORDS = [
  'هاتف', 'جوال', 'موبايل', 'انترنت', 'كمبيوتر', 'حاسوب', 'سياره', 'طائره', 'تلفاز',
  'قهوه', 'تبغ', 'طماطم', 'بطاطس', 'مطبعه', 'بارود', 'مدفع', 'مستقبل', 'قرن',
  'phone', 'internet', 'computer', 'car', 'airplane', 'coffee', 'tomato', 'potato', 'future', '2026', '1991', '1492',
];

export const HARUN_INTENTS: ScriptedIntent[] = [
  {
    id: 'greeting',
    keywords: ['سلام', 'مرحبا', 'اهلا', 'تحيه', 'صباح', 'مساء', 'hello', 'hi', 'greetings'],
    turn: {
      segments: [
        {
          text: 'وعليكم السلام ورحمة الله وبركاته، أهلاً بك في رحاب مدينة السلام.',
          tag: 'dramatized',
          translation: 'Peace and blessings be upon you; welcome to the precincts of the City of Peace.',
        },
        {
          text: 'أسس جدي أبو جعفر المنصور هذه المدينة المباركة سنة اثنتين وستين وسبعمائة للميلاد، لتكون حاضرة للعلم والعدل.',
          tag: 'documented',
          translation: 'My grandfather Abu Ja’far al-Mansur founded this blessed city in 762 CE as a seat of learning and justice.',
        },
      ],
      emotion: 'warm',
      gesture: 'welcome',
      followUps: [
        'حدثني عن مدينة السلام وحكمك',
        'لماذا تقيم أحياناً في الرقة؟',
        'أخبرني عن سفارة ملك الفرنجة',
      ],
    },
    discoveredFactIds: ['baghdad-founded-762'],
  },
  {
    id: 'identity',
    keywords: ['من انت', 'عرفني', 'اسمك', 'هارون', 'الرشيد', 'خليفه', 'who are you', 'simulation', 'حقيقي'],
    turn: {
      segments: [
        {
          text: 'أنا هارون بن محمد المهدي، خامس خلفاء بني العباس، توليت الخلافة سنة ست وثمانين وسبعمائة.',
          tag: 'documented',
          translation: 'I am Harun ibn Muhammad al-Mahdi, fifth Abbasid Caliph, having assumed the caliphate in 786 CE.',
        },
        {
          text: 'وأذكرك بصدق أن هذا المجلس محاكاة تاريخية متخيلة لحقبة نحو عام ثمانمائة للميلاد.',
          tag: 'dramatized',
          translation: 'And I remind you plainly that this audience is an imagined historical simulation of around 800 CE.',
        },
      ],
      emotion: 'thoughtful',
      gesture: 'explain',
      followUps: [
        'ما مسؤولياتك في المظالم والحكم؟',
        'أين زوجتك زبيدة وأبناؤك؟',
        'ما أخبار العلماء والنساخ في المكتبة؟',
      ],
    },
    discoveredFactIds: ['harun-reign-786'],
  },
  {
    id: 'raqqa',
    keywords: ['رقه', 'الرشقه', 'سفر', 'بلاط', 'اين تقيم', 'raqqa', 'governance'],
    turn: {
      segments: [
        {
          text: 'إنني أقيم كثيراً في الرقة على ضفاف الفرات منذ نحو أربع سنوات، لأكون أقرب إلى الثغور وشؤون الشام.',
          tag: 'documented',
          translation: 'I reside frequently at al-Raqqa on the Euphrates for roughly four years now, to remain closer to the frontiers and Syrian affairs.',
        },
        {
          text: 'غير أن بغداد تظل قلب الخلافة، وما تراه حولك تصور تركيبي لقصرها لا مخطط أثري مطابق.',
          tag: 'dramatized',
          translation: 'Yet Baghdad remains the heart of the caliphate; what surrounds you is a composite evocation of its palace rather than an exact survey.',
        },
      ],
      emotion: 'thoughtful',
      gesture: 'explain',
      followUps: [
        'أخبرني عن القبة الخضراء',
        'حدثني عن ديوان المظالم',
        'كيف وصل الورق إلى بغداد؟',
      ],
    },
    discoveredFactIds: ['raqqa-court-796', 'composite-palace-note'],
  },
  {
    id: 'embassy-story',
    keywords: ['سفاره', 'شارلمان', 'فرنج', 'هديه', 'ساعه', 'فيل', 'charlemagne', 'embassy', 'story', 'قصه'],
    turn: {
      segments: [
        {
          text: 'لقد استقبل بلاطنا مبعوثين من ملك الفرنجة قارله، يتبادلان معنا المودة والهدايا عبر البحار.',
          tag: 'documented',
          translation: 'Our court has received envoys from the Frankish king Charles, exchanging goodwill and gifts across the seas.',
        },
        {
          text: 'دعني أريك كيف تجتمع الوفود في قاعة الاستقبال وتستعد الهدايا العجيبة كالساعة المائية.',
          tag: 'dramatized',
          translation: 'Let me show you how envoys gather in the audience hall and marvel at gifts such as the water clock.',
        },
      ],
      emotion: 'excited',
      gesture: 'point',
      storyId: 'embassy-to-charlemagne',
      followUps: [
        'كيف تعمل الساعة المائية؟',
        'ما الذي يجده التجار في السوق؟',
        'أخبرني عن حكايات ألف ليلة وليلة',
      ],
    },
    discoveredFactIds: ['charlemagne-envoys', 'water-clock-craft'],
  },
  {
    id: 'paper-story',
    keywords: ['ورق', 'كتاب', 'كتب', 'نسخ', 'نساخ', 'مكتبه', 'ترجمه', 'علم', 'paper', 'library', 'book', 'science'],
    turn: {
      segments: [
        {
          text: 'إن صناعة الورق التي وفدت إلينا من سمرقند قد غيّرت وجه الدواوين وخزائن الكتب.',
          tag: 'traditional',
          translation: 'The craft of papermaking that reached us from Samarkand has transformed chanceries and book treasuries.',
        },
        {
          text: 'كما نشجع نقل علوم الطب والفلك من اليونانية والسريانية والفارسية إلى اللسان العربي المبين.',
          tag: 'documented',
          translation: 'We also encourage translating medicine and astronomy from Greek, Syriac, and Persian into clear Arabic.',
        },
      ],
      emotion: 'warm',
      gesture: 'explain',
      storyId: 'paper-and-the-copyists',
      followUps: [
        'ماذا عن الأسطرلاب والفلك؟',
        'من يتولى القضاء والعدل؟',
        'هل تروى عنك حكايات في الليل؟',
      ],
    },
    discoveredFactIds: ['paper-samarkand-baghdad', 'translation-patronage'],
  },
  {
    id: 'tales-story',
    keywords: ['ليله', 'الف ليله', 'حكايات', 'سهر', 'تنكر', 'اسطوره', 'tales', 'nights', 'literature'],
    turn: {
      segments: [
        {
          text: 'قد يروي الرواة في المجالس حكايات عن تجوالي ليلاً، غير أن كثيراً من تلك القصص من نسج الأدب والخيال.',
          tag: 'dramatized',
          translation: 'Storytellers may recount tales of my wandering by night, yet many such stories belong to literary imagination.',
        },
        {
          text: 'شاهد هذا المشهد الأدبي لتدرك الفرق بين التاريخ المدون وسمر الليالي.',
          tag: 'dramatized',
          translation: 'Witness this literary scene to see the distinction between recorded history and evening tales.',
        },
      ],
      emotion: 'amused',
      gesture: 'greet',
      storyId: 'a-night-of-tales',
      followUps: [
        'أخبرني عن حقائق حكمك الموثقة',
        'ماذا عن السيدة زبيدة؟',
        'حدثني عن الشطرنج والعود',
      ],
    },
    discoveredFactIds: ['literary-nights'],
  },
  {
    id: 'family',
    keywords: ['زبيده', 'ابناء', 'امين', 'مامون', 'عائله', 'اسره', 'برمك', 'برامكه', 'family', 'zubayda'],
    turn: {
      segments: [
        {
          text: 'تُعنى زوجتي زبيدة ببناء السقايات والبرك على طريق الحج، وهو عمل جليل يخدم القوافل.',
          tag: 'documented',
          translation: 'My wife Zubayda devotes herself to building cisterns and wells along the pilgrimage road, a noble service to caravans.',
        },
        {
          text: 'وقد عهدت بالولاية من بعدي لولدي محمد الأمين وعبد الله المأمون، ولا يزال البرامكة اليوم في دواوين الدولة.',
          tag: 'documented',
          translation: 'I have entrusted the succession after me to my sons al-Amin and al-Ma’mun, and the Barmakids presently serve in the chanceries.',
        },
      ],
      emotion: 'warm',
      gesture: 'explain',
      followUps: [
        'حدثني عن القاضي أبي يوسف والعدل',
        'ما مكانة الشطرنج في البلاط؟',
        'كيف تُسقى حدائق القصر؟',
      ],
    },
    discoveredFactIds: ['zubayda-patronage', 'heirs-amin-mamun', 'barmakids-800-standing'],
  },
  {
    id: 'justice',
    keywords: ['عدل', 'قضاء', 'مظالم', 'قانون', 'ضرائب', 'ابو يوسف', 'justice', 'judge', 'حكم'],
    turn: {
      segments: [
        {
          text: 'نجلس في مجالس المظالم لننظر في شكاوى الرعية مباشرة، فإن العدل أساس بقاء الملك.',
          tag: 'documented',
          translation: 'We sit in mazalim assemblies to hear the grievances of subjects directly, for justice is the foundation of rule.',
        },
        {
          text: 'وقد استعنا بالإمام القاضي أبي يوسف في ضبط أحكام الخراج وتنظيم القضاء.',
          tag: 'documented',
          translation: 'We have relied upon the jurist Abu Yusuf to codify land taxation and organize the judiciary.',
        },
      ],
      emotion: 'stern',
      gesture: 'emphasize',
      followUps: [
        'حدثني عن سفارة ملك الفرنجة',
        'ما قيمة الدينار الذهبي؟',
        'كيف تصف القبة الخضراء؟',
      ],
    },
    discoveredFactIds: ['justice-mazalim', 'qadi-abu-yusuf'],
  },
  {
    id: 'science-objects',
    keywords: ['اسطرلاب', 'نجوم', 'فلك', 'شطرنج', 'دينار', 'astrolabe', 'chess', 'coin'],
    turn: {
      segments: [
        {
          text: 'في خزانتنا يدرس الفزاري وغيره قياس ارتفاع النجوم بالأسطرلاب، بينما يتنافس الأدباء في الشطرنج.',
          tag: 'documented',
          translation: 'In our treasury, scholars such as al-Fazari study measuring star altitudes with the astrolabe, while courtiers compete at shatranj.',
        },
        {
          text: 'أما الدنانير الذهبية فتُسك باسم الخلافة وعليها آيات التوحيد دون صور، وتحمل قيمتها وزنها.',
          tag: 'documented',
          translation: 'As for gold dinars, they are minted with epigraphic inscriptions without portraits, carrying value in their weight.',
        },
      ],
      emotion: 'thoughtful',
      gesture: 'explain',
      followUps: [
        'كيف وصل الورق إلى بغداد؟',
        'أخبرني عن سفارة ملك الفرنجة',
        'ما أخبار السوق والتجارة؟',
      ],
    },
    discoveredFactIds: ['astrolabe-use', 'shatranj-court', 'abbasid-dinar'],
  },
  {
    id: 'music-oud',
    keywords: ['عود', 'موسيقي', 'غناء', 'موصلي', 'شعر', 'oud', 'music', 'poetry'],
    turn: {
      segments: [
        {
          text: 'نستمع في مجالس السمر إلى الشعر الفصيح وأنغام العود الخشبي ذي الأوتار الأربعة مع الموصلي وأهل الغناء.',
          tag: 'documented',
          translation: 'In court gatherings we listen to classical Arabic poetry and the four-course wooden oud played by masters such as al-Mawsili.',
        },
      ],
      emotion: 'warm',
      gesture: 'explain',
      followUps: ['ما مكانة الشطرنج في البلاط؟', 'أخبرني عن القبة الخضراء'],
    },
    discoveredFactIds: ['oud-music-tradition'],
  },
  {
    id: 'architecture-dome',
    keywords: ['قبه', 'خضراء', 'ابواب', 'مدوره', 'عماره', 'بناء', 'dome', 'architecture', 'walls'],
    turn: {
      segments: [
        {
          text: 'بُنيت مدينة السلام دائريةً بأربعة أبواب كبرى نحو خراسان والبصرة والكوفة والشام، وتعلو قصرنا القبة الخضراء.',
          tag: 'documented',
          translation: 'Madinat al-Salam was built in a circle with four great gates toward Khurasan, Basra, Kufa, and Damascus, crowned by the Green Dome.',
        },
      ],
      emotion: 'warm',
      gesture: 'point',
      followUps: ['كيف تُسقى حدائق القصر؟', 'أخبرني عن سوق الكرخ'],
    },
    discoveredFactIds: ['green-dome-evocation', 'round-city-gates'],
  },
  {
    id: 'gardens-water',
    keywords: ['حديقه', 'ماء', 'نافوره', 'دجله', 'قناه', 'نخيل', 'garden', 'fountain', 'water'],
    turn: {
      segments: [
        {
          text: 'تنساب المياه إلى صحون القصر وبساتينه عبر قنوات متفرعة من دجلة ونهر عيسى، فتبرد الهواء وتحيي النخيل والرمان.',
          tag: 'documented',
          translation: 'Water flows into the palace courts and orchards through canals drawn from the Tigris and Nahr Isa, cooling the air and nourishing palms and pomegranates.',
        },
      ],
      emotion: 'warm',
      gesture: 'point',
      followUps: [
        'أخبرني عن الساعة المائية',
        'لماذا تقيم أحياناً في الرقة؟',
        'ما الذي يجده الزائر في المكتبة؟',
      ],
    },
    discoveredFactIds: ['tigris-canals'],
  },
  {
    id: 'market-trade',
    keywords: ['سوق', 'تجاره', 'كرخ', 'حرير', 'توابل', 'بضائع', 'market', 'trade', 'spice'],
    turn: {
      segments: [
        {
          text: 'أُخرجت الأسواق إلى الكرخ خارج أسوار المدينة المدورة حفاظاً على أمن الحاضرة وسعتها.',
          tag: 'documented',
          translation: 'The markets were placed in al-Karkh outside the walls of the Round City to preserve the capital’s order and space.',
        },
        {
          text: 'وتصل إليها قوافل الحرير والتوابل والعطور من الشرق والغرب.',
          tag: 'documented',
          translation: 'Caravans of silk, spices, and aromatics reach them from East and West.',
        },
      ],
      emotion: 'warm',
      gesture: 'explain',
      followUps: [
        'حدثني عن العملة والدينار الذهبي',
        'أخبرني عن سفارة ملك الفرنجة',
        'وداعاً يا أمير المؤمنين',
      ],
    },
    discoveredFactIds: ['merchant-karkh', 'silk-road-trade'],
  },
  {
    id: 'daily-life-food',
    keywords: ['يوم', 'حياه', 'طعام', 'اكل', 'لباس', 'طراز', 'daily', 'life', 'food', 'clothes'],
    turn: {
      segments: [
        {
          text: 'يبدأ يوم بغداد مبكراً في الأسواق والحلقات العلمية، وتُعد في المطابخ أطباق الثريد واللحم المتبل بالزعفران والرمان، مع خلو موائدنا من الطماطم أو القهوة.',
          tag: 'documented',
          translation: 'Baghdad’s day begins early in bazaars and study circles, with dishes like tharid spiced with saffron and pomegranate—while tomatoes and coffee are unknown.',
        },
        {
          text: 'أما في البلاط فنتشح بالسواد العباسي الموشى بأشرطة الطراز المذهبة.',
          tag: 'documented',
          translation: 'At court we wear ceremonial Abbasid black adorned with gold-embroidered tiraz bands.',
        },
      ],
      emotion: 'warm',
      gesture: 'explain',
      followUps: ['ما أخبار العلماء والنساخ؟', 'كيف تُحفظ نزاهة السوق؟'],
    },
    discoveredFactIds: ['textiles-tiraz'],
  },
  {
    id: 'baghdad-founding',
    keywords: ['تاسيس', 'منصور', 'تاريخ', 'متي', '762', 'founded', 'history'],
    turn: {
      segments: [
        {
          text: 'اختطّ أبو جعفر المنصور مدينة السلام سنة اثنتين وستين وسبعمائة للميلاد، واختار موضعها لاعتدال مناخها وارتباطها بدجلة والفرات.',
          tag: 'documented',
          translation: 'Abu Ja’far al-Mansur laid out the City of Peace in 762 CE, choosing its site for its climate and link between the Tigris and Euphrates.',
        },
      ],
      emotion: 'thoughtful',
      gesture: 'explain',
      followUps: ['كيف تصف القبة الخضراء؟', 'حدثني عن ديوان المظالم'],
    },
    discoveredFactIds: ['baghdad-founded-762'],
  },
  {
    id: 'farewell',
    keywords: ['وداعا', 'مع السلامه', 'الى اللقاء', 'شكرا', 'bye', 'goodbye', 'thank'],
    turn: {
      segments: [
        {
          text: 'في أمان الله وحفظه، طب مقاماً في أرجاء بغداد وتأمل ما في مكتبتها وأسواقها من آثار.',
          tag: 'dramatized',
          translation: 'Go in God’s peace and protection; explore Baghdad freely and reflect on its library and markets.',
        },
      ],
      emotion: 'warm',
      gesture: 'bow',
      followUps: [
        'أخبرني عن سفارة ملك الفرنجة',
        'كيف وصل الورق إلى بغداد؟',
      ],
    },
  },
];

export const SUPPORTING_INTENTS: Record<string, ScriptedIntent[]> = {
  'palace-steward': [
    {
      id: 'steward-greet',
      keywords: ['سلام', 'مرحبا', 'اهلا', 'تحيه', 'hello', 'hi', 'greetings'],
      turn: {
        segments: [
          {
            text: 'أهلاً بك في الصحن الكبير لقصر السلام؛ أنا المنصور الحاجب، أرحب بالوفود والضيوف.',
            tag: 'dramatized',
            translation: 'Welcome to the Great Courtyard of the Palace; I am al-Mansur al-Hajib, welcoming envoys and guests.',
          },
        ],
        emotion: 'warm',
        gesture: 'welcome',
        followUps: ['أين أجد الخليفة هارون الرشيد؟', 'حدثني عن نافورة الصحن وقنوات دجلة'],
      },
    },
    {
      id: 'steward-directions',
      keywords: ['اين', 'قاعه', 'خليفه', 'مساعده', 'طريق', 'where', 'caliph', 'hall'],
      turn: {
        segments: [
          {
            text: 'تتجه شمالاً عبر الإيوان العظيم لتصل إلى قاعة استقبال أمير المؤمنين، وإلى الغرب تقع خزانة العلماء، وإلى الشرق البستان.',
            tag: 'dramatized',
            translation: 'Proceed north through the great iwan to reach the Caliph’s audience hall; west lies the Scholars’ Library, and east the garden.',
          },
        ],
        emotion: 'warm',
        gesture: 'point',
        followUps: ['هل يقيم البلاط في الرقة أيضاً؟', 'كيف يعمل نظام الحراسة في البوابة الذهبية؟'],
      },
      discoveredFactIds: ['steward-courtyard'],
    },
    {
      id: 'steward-raqqa',
      keywords: ['رقه', 'يقيم', 'بلاط', 'سفر', 'raqqa', 'governance', 'حكم'],
      turn: {
        segments: [
          {
            text: 'يسافر البلاط مراراً بين بغداد والرقة، حيث يقيم الخليفة فترات طويلة لإدارة شؤون الدولة والثغور.',
            tag: 'documented',
            translation: 'The court travels frequently between Baghdad and al-Raqqa, where the Caliph resides for long periods to administer the realm.',
          },
        ],
        emotion: 'thoughtful',
        gesture: 'explain',
        followUps: ['ماذا يُلبس في البلاط العباسي من السواد والطراز؟', 'حدثني عن نافورة الصحن'],
      },
      discoveredFactIds: ['steward-raqqa'],
    },
    {
      id: 'steward-gate-security',
      keywords: ['بوابه', 'حراسه', 'سور', 'دفاع', 'منكسر', 'gate', 'security', 'wall', 'architecture'],
      turn: {
        segments: [
          {
            text: 'صُممت البوابة الذهبية وأبواب المدينة الأربعة بمداخل منكسرة وأبراج مستديرة لضبط الدخول وحفظ أمن القصر.',
            tag: 'documented',
            translation: 'The Golden Gate and the city’s four gates were built with bent entrances and round bastions to regulate entry.',
          },
        ],
        emotion: 'stern',
        gesture: 'explain',
        followUps: ['لماذا أُخرجت الأسواق عن المدينة المدورة؟', 'حدثني عن نافورة الصحن'],
      },
    },
    {
      id: 'steward-fountain',
      keywords: ['نافوره', 'ماء', 'صحن', 'نهر عيسي', 'دجله', 'تبريد', 'fountain', 'water'],
      turn: {
        segments: [
          {
            text: 'تستقي هذه النافورة الرخامية المثمنة من قنوات نهر عيسى ودجلة، فيبرد رذاذها هواء الصحن ثم ينساب إلى البستان.',
            tag: 'documented',
            translation: 'This octagonal marble fountain draws from the Nahr Isa and Tigris canals, cooling courtyard air before draining to the garden.',
          },
        ],
        emotion: 'warm',
        gesture: 'point',
        followUps: ['ماذا عن الأروقة والأعمدة؟', 'ما هي مواعيد مجلس المظالم؟'],
      },
      discoveredFactIds: ['steward-fountain'],
    },
    {
      id: 'steward-tiraz',
      keywords: ['لباس', 'سواد', 'طراز', 'حرير', 'ثياب', 'clothes', 'robe', 'tiraz'],
      turn: {
        segments: [
          {
            text: 'يتشح كبار رجال الدولة بالسواد العباسي، وتُطرز الأكمام في دور الطراز بألقاب الخليفة من خيوط الذهب.',
            tag: 'documented',
            translation: 'Senior officials wear Abbasid black, with sleeves embroidered in state tiraz workshops with golden caliphal inscriptions.',
          },
        ],
        emotion: 'thoughtful',
        gesture: 'explain',
        followUps: ['كيف تُستقبل الوفود الأجنبية؟', 'أين أجد سوق الكرخ؟'],
      },
      discoveredFactIds: ['steward-tiraz'],
    },
    {
      id: 'steward-protocol',
      keywords: ['بروتوكول', 'وفود', 'استقبال', 'ادب', 'مراسم', 'protocol', 'envoys'],
      turn: {
        segments: [
          {
            text: 'يتقدم المبعوثون عبر الصحن بهدوء ووقار بعد تسجيل أسمائهم في ديوان الحجابة وقبل المثول في الإيوان.',
            tag: 'dramatized',
            translation: 'Envoys cross the courtyard in quiet dignity after registering with the chamberlain’s office before entering the iwan.',
          },
        ],
        emotion: 'neutral',
        gesture: 'explain',
        followUps: ['حدثني عن سفراء شارلمان', 'كيف يُضاء القصر عند المساء؟'],
      },
    },
    {
      id: 'steward-lanterns',
      keywords: ['مصباح', 'ليل', 'غسق', 'اضاءه', 'lantern', 'dusk', 'night'],
      turn: {
        segments: [
          {
            text: 'عند غروب الشمس توقد مصابيح الزيت النحاسية المعلقة على الأعمدة لتنير الممرات والصحن.',
            tag: 'dramatized',
            translation: 'At sunset, brass oil lamps suspended along the colonnades are lit to illuminate the passages and courtyard.',
          },
        ],
        emotion: 'warm',
        gesture: 'explain',
        followUps: ['أين تقع خزانة العلماء؟', 'ما طعام الضيوف في القصر؟'],
      },
    },
    {
      id: 'steward-daily-food',
      keywords: ['طعام', 'وليمه', 'ضيف', 'ماء', 'يوم', 'daily', 'life', 'food'],
      turn: {
        segments: [
          {
            text: 'يُقدم للضيوف الخبز الرقيق واللحم المتبل بالزعفران والرمان وشراب التمر المصفى في أوانٍ نحاسية وخزفية.',
            tag: 'documented',
            translation: 'Guests are served flatbread, saffron-and-pomegranate spiced meats, and strained date drinks in brass and glazed ceramic ware.',
          },
        ],
        emotion: 'warm',
        gesture: 'welcome',
        followUps: ['أين أجد سوق التوابل؟', 'كيف يحافظ القصر على الهدوء؟'],
      },
    },
    {
      id: 'steward-library-way',
      keywords: ['مكتبه', 'علماء', 'ورق', 'نساخ', 'اسحاق', 'library', 'science'],
      turn: {
        segments: [
          {
            text: 'اعبر الرواق الغربي لتصل إلى خزانة العلماء، حيث يعمل إسحاق الوراق على نسخ المخطوطات ومعايرة الأسطرلاب.',
            tag: 'dramatized',
            translation: 'Cross the western colonnade to reach the Scholars’ Library, where Ishaq al-Warraq copies manuscripts and calibrates astrolabes.',
          },
        ],
        emotion: 'warm',
        gesture: 'point',
        followUps: ['أين يقع البستان؟', 'أين يقع سوق الكرخ؟'],
      },
    },
    {
      id: 'steward-garden-way',
      keywords: ['بستان', 'حديقه', 'نخيل', 'شطرنج', 'garden', 'palm'],
      turn: {
        segments: [
          {
            text: 'من الرواق الشرقي تدخل البستان المظلل بالنخيل والرمان، وهناك يجلس الأدباء حول رقعة الشطرنج.',
            tag: 'dramatized',
            translation: 'Through the eastern colonnade you enter the palm-and-pomegranate garden where courtiers play shatranj.',
          },
        ],
        emotion: 'warm',
        gesture: 'point',
        followUps: ['أين أجد الخليفة هارون الرشيد؟', 'ما أخبار سوق الكرخ؟'],
      },
    },
    {
      id: 'steward-market-way',
      keywords: ['سوق', 'كرخ', 'تجاره', 'باب', 'خارج', 'market', 'trade'],
      turn: {
        segments: [
          {
            text: 'يمكنك الخروج عبر الباب الغربي إلى سوق الكرخ، فقد فُصلت الأسواق عن الحرم الإداري حفاظاً على النظام.',
            tag: 'documented',
            translation: 'You may step through the western postern to the Karkh market; bazaars were separated from the inner precinct for civic order.',
          },
        ],
        emotion: 'neutral',
        gesture: 'point',
        followUps: ['حدثني عن البوابة الذهبية', 'شكراً لك'],
      },
    },
    {
      id: 'steward-mazalim',
      keywords: ['مظالم', 'عدل', 'شكوي', 'قاضي', 'justice', 'mazalim'],
      turn: {
        segments: [
          {
            text: 'في أيام مجلس المظالم نرتب دخول المتظلمين إلى القاعة بانتظام ليسمع الخليفة وأبو يوسف قضاياهم.',
            tag: 'documented',
            translation: 'On mazalim days we organize petitioners in order so the Caliph and Judge Abu Yusuf can hear their cases.',
          },
        ],
        emotion: 'stern',
        gesture: 'emphasize',
        followUps: ['هل يقيم البلاط في الرقة أيضاً؟', 'أين تقع قاعة الاستقبال؟'],
      },
    },
    {
      id: 'steward-stucco',
      keywords: ['جص', 'زخرف', 'اقواس', 'عمود', 'رخام', 'arch', 'marble', 'stucco'],
      turn: {
        segments: [
          {
            text: 'ترى العقود المدببة والزخارف الجصية الهندسية تزين الأروقة، وهي مستلهمة من العمارة العباسية المبكرة.',
            tag: 'dramatized',
            translation: 'Pointed arches and carved geometric stucco decorate the arcades, inspired by early Abbasid craft.',
          },
        ],
        emotion: 'warm',
        gesture: 'explain',
        followUps: ['حدثني عن نافورة الصحن', 'وداعاً'],
      },
    },
    {
      id: 'steward-farewell',
      keywords: ['وداعا', 'شكرا', 'مع السلامه', 'bye', 'thank', 'goodbye'],
      turn: {
        segments: [
          {
            text: 'رافقك السلامة في أرجاء القصر؛ أنا في خدمتك متى احتجت إلى إرشاد.',
            tag: 'dramatized',
            translation: 'Go safely through the palace grounds; I remain at your service whenever you need guidance.',
          },
        ],
        emotion: 'warm',
        gesture: 'bow',
        followUps: ['أين أجد الخليفة هارون الرشيد؟', 'أين تقع خزانة العلماء؟'],
      },
    },
  ],
  'scholar-translator': [
    {
      id: 'scholar-greet',
      keywords: ['سلام', 'مرحبا', 'اهلا', 'hello', 'hi', 'greetings'],
      turn: {
        segments: [
          {
            text: 'حياك الله في خزانة العلماء؛ أنا إسحاق الوراق، أشتغل بنسخ الرسائل ومعايرة الآلات الفلكية.',
            tag: 'dramatized',
            translation: 'Greetings in the Scholars’ Library; I am Ishaq al-Warraq, occupied with transcribing treatises and calibrating celestial instruments.',
          },
        ],
        emotion: 'warm',
        gesture: 'welcome',
        followUps: ['كيف وصل الورق من سمرقند إلى بغداد؟', 'كيف تقيسون النجوم بالأسطرلاب النحاسي؟'],
      },
    },
    {
      id: 'scholar-paper',
      keywords: ['ورق', 'سمرقند', 'كتان', 'رق', 'بردي', 'paper', 'samarkand', 'parchment'],
      turn: {
        segments: [
          {
            text: 'ننسخ هنا على الورق المصنوع من ألياف الكتان والقنب بحرفة سمرقند، فهو أيسر ثناً وأطوع للقلم من الرق والبردي.',
            tag: 'traditional',
            translation: 'We copy onto linen-and-hemp paper crafted in the Samarkand tradition—easier on the reed pen and far more affordable than parchment or papyrus.',
          },
        ],
        emotion: 'thoughtful',
        gesture: 'explain',
        storyId: 'paper-and-the-copyists',
        followUps: ['مِمَّ تصنعون أقلام القصب وحبر السخام؟', 'من أي لغات تترجمون كتب الطب والفلك؟'],
      },
      discoveredFactIds: ['scholar-paper'],
    },
    {
      id: 'scholar-ink-pens',
      keywords: ['قلم', 'قصب', 'حبر', 'ليقه', 'خط', 'pen', 'ink', 'reed', 'calligraphy'],
      turn: {
        segments: [
          {
            text: 'نقطّ أقلام القصب بزاوية مائلة، ونستخدم حبر السخام الممزوج بالصمغ العربي مع خيوط القطن (الليقة) في المحبرة لضبط التدفق.',
            tag: 'documented',
            translation: 'We bevel reed pens obliquely and write with carbon soot ink mixed with gum arabic, using a cotton wad (liqa) in the inkwell.',
          },
        ],
        emotion: 'thoughtful',
        gesture: 'explain',
        followUps: ['كيف تُجلد المخطوطات؟', 'كيف وصل الورق إلى بغداد؟'],
      },
      discoveredFactIds: ['scholar-ink'],
    },
    {
      id: 'scholar-astrolabe',
      keywords: ['اسطرلاب', 'نجوم', 'شمس', 'مواقيت', 'عضاده', 'astrolabe', 'stars', 'science'],
      turn: {
        segments: [
          {
            text: 'نرصد بالعضادة ارتفاع النجم أو الشمس، ثم ندير شبكة العنكبوت فوق الصفيحة المدرجة لعرض بغداد لنقرأ الساعة والطوالع.',
            tag: 'documented',
            translation: 'With the alidade we measure a star or sun’s altitude, then turn the openwork rete over Baghdad’s plate to read the hour.',
          },
        ],
        emotion: 'excited',
        gesture: 'point',
        followUps: ['من هو الفزاري وماذا ألّف؟', 'كيف تعمل الساعة المائية؟'],
      },
      discoveredFactIds: ['scholar-astrolabe'],
    },
    {
      id: 'scholar-fazari',
      keywords: ['فزاري', 'زيج', 'جداول', 'رياضيات', 'fazari', 'astronomy', 'tables'],
      turn: {
        segments: [
          {
            text: 'اشتهر الفلكي محمد بن إبراهيم الفزاري في بلاطنا بتأليف الرسائل في الأسطرلاب والزيجات الفلكية الدقيقة.',
            tag: 'documented',
            translation: 'The astronomer Muhammad ibn Ibrahim al-Fazari won renown at our court for treatises on the astrolabe and Zij astronomical tables.',
          },
        ],
        emotion: 'thoughtful',
        gesture: 'explain',
        followUps: ['من أي لغات تترجمون الكتب؟', 'كيف تقيسون النجوم بالأسطرلاب؟'],
      },
      discoveredFactIds: ['scholar-fazari'],
    },
    {
      id: 'scholar-translations',
      keywords: ['ترجمه', 'يوناني', 'سرياني', 'فارسي', 'هندي', 'translate', 'greek', 'syriac'],
      turn: {
        segments: [
          {
            text: 'ينقل المترجمون في بغداد رسائل الطب والهندسة والفلك من اليونانية والسريانية والفارسية والسنسكريتية إلى العربية الفصيحة.',
            tag: 'documented',
            translation: 'Translators in Baghdad render medical, geometric, and astronomical texts from Greek, Syriac, Persian, and Sanskrit into clear Arabic.',
          },
        ],
        emotion: 'warm',
        gesture: 'explain',
        followUps: ['ما هي خزانة الحكمة؟', 'ماذا عن كتب الطب؟'],
      },
      discoveredFactIds: ['scholar-astrolabe'],
    },
    {
      id: 'scholar-library',
      keywords: ['خزانه', 'حكمه', 'مكتبه', 'كتب', 'ارفف', 'library', 'khizanat', 'architecture'],
      turn: {
        segments: [
          {
            text: 'تُحفظ المخطوطات واللفائف هنا في خزانة الحكمة على رفوف خشب الأرز بعيداً عن الرطوبة ليراجعها العلماء.',
            tag: 'documented',
            translation: 'Manuscripts and scrolls are kept here in Khizanat al-Hikma on cedar shelves away from dampness for scholars to consult.',
          },
        ],
        emotion: 'warm',
        gesture: 'point',
        followUps: ['كيف وصل الورق إلى بغداد؟', 'من هم النساخ والوراقون؟'],
      },
    },
    {
      id: 'scholar-medicine',
      keywords: ['طب', 'علاج', 'مرض', 'بيمارستان', 'دواء', 'medicine', 'medical', 'health'],
      turn: {
        segments: [
          {
            text: 'نراجع مخطوطات الطب التي تجمع بين تراث الأطباء في جنديسابور والمعارف اليونانية والهندية في تركيب الأدوية.',
            tag: 'documented',
            translation: 'We study medical manuscripts uniting Gondeshapur’s clinical tradition with Greek and Indian pharmacology.',
          },
        ],
        emotion: 'thoughtful',
        gesture: 'explain',
        followUps: ['من أي لغات تترجمون الكتب؟', 'ما هي التوابل المستعملة في الطب؟'],
      },
    },
    {
      id: 'scholar-water-clock',
      keywords: ['ساعه', 'مائيه', 'بنكام', 'تروس', 'هندسه', 'clock', 'clepsydra', 'mechanics'],
      turn: {
        segments: [
          {
            text: 'تعتمد الساعة المائية على توازن الضغط المائي وعوامة تحرك تروساً فتُسقط كرات نحاسية عند كل ساعة تماماً.',
            tag: 'documented',
            translation: 'The water clock relies on balanced water pressure and a float driving gears to drop bronze spheres precisely on the hour.',
          },
        ],
        emotion: 'excited',
        gesture: 'explain',
        followUps: ['كيف تقيسون النجوم بالأسطرلاب؟', 'هل تُرسل هذه الآلات كهديا؟'],
      },
    },
    {
      id: 'scholar-shatranj',
      keywords: ['شطرنج', 'رياضيات', 'حساب', 'منصوبات', 'chess', 'shatranj', 'math'],
      turn: {
        segments: [
          {
            text: 'ندرس مسائل الشطرنج (المنصوبات) كرياضة ذهنية، كما تحفظ الخزانة رسائل الحساب الهندي والمقابلة.',
            tag: 'documented',
            translation: 'We study shatranj endgame puzzles as mental training alongside treatises on calculation and geometry.',
          },
        ],
        emotion: 'amused',
        gesture: 'explain',
        followUps: ['كيف يعمل الأسطرلاب؟', 'ما هي خزانة الحكمة؟'],
      },
    },
    {
      id: 'scholar-binding',
      keywords: ['تجليد', 'جلد', 'مجلد', 'مقابله', 'تدقيق', 'binding', 'bookmaking'],
      turn: {
        segments: [
          {
            text: 'بعد الفراغ من النسخ نُقابل النسخة قراءةً على الأصل لتصحيح السقط، ثم تُخاط الكراريس وتُجلد بالجلد المصبوغ.',
            tag: 'documented',
            translation: 'Once copied, we collate the manuscript orally against the exemplar to catch errors, then sew quires into dyed leather bindings.',
          },
        ],
        emotion: 'thoughtful',
        gesture: 'explain',
        followUps: ['مِمَّ تصنعون أقلام القصب؟', 'أين تباع الكتب في بغداد؟'],
      },
    },
    {
      id: 'scholar-daily',
      keywords: ['يوم', 'حياه', 'دراسه', 'حلقات', 'طعام', 'daily', 'life', 'study'],
      turn: {
        segments: [
          {
            text: 'تبدأ حلقات القراءة بعد الفجر في المسجد الجامع والورّاقين، ونواصل النسخ في ضوء النهار الطبيعي قبل إيقاد السرج.',
            tag: 'documented',
            translation: 'Study circles begin after dawn at the mosque and stationers’ stalls, and we copy in clear daylight before lighting oil lamps.',
          },
        ],
        emotion: 'warm',
        gesture: 'explain',
        followUps: ['كيف يُصنع الحبر والورق؟', 'ماذا يشتري العلماء من سوق الكرخ؟'],
      },
    },
    {
      id: 'scholar-booktrade',
      keywords: ['بيع', 'تجار', 'وراقين', 'سوق', 'شراء', 'trade', 'market', 'buy'],
      turn: {
        segments: [
          {
            text: 'يمتلئ سوق الوراقين بالكتب المنسوخة على الورق، فتصل الرسائل إلى طلاب العلم بأثمان أيسر من ذي قبل.',
            tag: 'documented',
            translation: 'Stationers’ markets fill with paper manuscripts, bringing treatises to students at far more reachable prices than parchment.',
          },
        ],
        emotion: 'warm',
        gesture: 'explain',
        followUps: ['حدثني عن الورق السمرقندي', 'شكراً لك يا إسحاق'],
      },
    },
    {
      id: 'scholar-architecture',
      keywords: ['قاعه', 'اضاءه', 'هواء', 'خشب', 'عماره', 'architecture', 'design'],
      turn: {
        segments: [
          {
            text: 'صُممت نوافذ الخزانة المرتفعة لتغمر الطاولات بضوء النهار دون وهج مباشر يضر بالمخطوطات.',
            tag: 'dramatized',
            translation: 'High clerestory openings wash reading tables in daylight without harsh glare that would fade inks.',
          },
        ],
        emotion: 'neutral',
        gesture: 'point',
        followUps: ['كيف تُحفظ المخطوطات؟', 'وداعاً'],
      },
    },
    {
      id: 'scholar-farewell',
      keywords: ['وداعا', 'شكرا', 'مع السلامه', 'bye', 'thank', 'goodbye'],
      turn: {
        segments: [
          {
            text: 'بارك الله في سعيك لطلب العلم؛ باب الخزانة مفتوح لك دوماً.',
            tag: 'dramatized',
            translation: 'Blessings on your pursuit of learning; the library’s doors remain ever open to you.',
          },
        ],
        emotion: 'warm',
        gesture: 'bow',
        followUps: ['كيف وصل الورق إلى بغداد؟', 'كيف تقيسون النجوم بالأسطرلاب؟'],
      },
    },
  ],
  'spice-merchant': [
    {
      id: 'merchant-greet',
      keywords: ['سلام', 'مرحبا', 'اهلا', 'hello', 'hi', 'greetings'],
      turn: {
        segments: [
          {
            text: 'أهلاً بالضيف الكريم في سوق الكرخ خارج أسوار المدينة المدورة! أنا سالم العطار، تفضل بمعاينة بضائعنا.',
            tag: 'dramatized',
            translation: 'Welcome, honoured guest, to al-Karkh outside the Round City walls! I am Salim al-Attar—come inspect our wares.',
          },
        ],
        emotion: 'warm',
        gesture: 'welcome',
        followUps: ['ما أبرز التوابل والحرير في سوق الكرخ؟', 'كيف توزنون الدنانير الذهبية والدراهم الفضية؟'],
      },
    },
    {
      id: 'merchant-spices',
      keywords: ['توابل', 'فلفل', 'قرفه', 'زعفران', 'هند', 'spice', 'pepper', 'saffron', 'cinnamon'],
      turn: {
        segments: [
          {
            text: 'لدينا الفلفل الهندي والقرفة والقرنفل والزعفران الفارسي، أما نباتات كالطماطم أو البطاطس فلا وجود لها في دنيانا.',
            tag: 'documented',
            translation: 'We carry Indian pepper, cinnamon, cloves, and Persian saffron—whereas plants like tomatoes or potatoes do not exist in our world.',
          },
        ],
        emotion: 'warm',
        gesture: 'point',
        followUps: ['كيف توزنون الدنانير الذهبية؟', 'ما الذي تصل به قوافل المشرق؟'],
      },
      discoveredFactIds: ['merchant-spices'],
    },
    {
      id: 'merchant-dinar',
      keywords: ['دينار', 'ذهب', 'عمله', 'سكه', 'مثقال', 'dinar', 'gold', 'coin'],
      turn: {
        segments: [
          {
            text: 'يُسك الدينار الذهبي العباسي بوزن نحو أربعة غرامات وربع من الذهب الصافي، وعليه خط كوفي بلا صور، ونزنه في الميزان الحساس.',
            tag: 'documented',
            translation: 'The Abbasid gold dinar weighs ~4.25 grams of pure gold with Kufic epigraphy and no portraits, verified on our precision scale.',
          },
        ],
        emotion: 'thoughtful',
        gesture: 'explain',
        followUps: ['وماذا عن الدرهم الفضي؟', 'من يراقب الموازين والأسعار في السوق؟'],
      },
      discoveredFactIds: ['merchant-dinar'],
    },
    {
      id: 'merchant-dirham',
      keywords: ['درهم', 'فضه', 'فلس', 'صرف', 'فكه', 'dirham', 'silver'],
      turn: {
        segments: [
          {
            text: 'أما التعامل اليومي بالخبز والتوابل فيتم بالدرهم الفضي والفلس النحاسي، ويراجع الصرافون عيار الفضة بدقة.',
            tag: 'documented',
            translation: 'Everyday purchases of bread and spices settle in silver dirhams and copper fals, with moneychangers testing purity.',
          },
        ],
        emotion: 'neutral',
        gesture: 'explain',
        followUps: ['كيف توزنون الدنانير؟', 'ما هي رقابة المحتسب؟'],
      },
    },
    {
      id: 'merchant-silk',
      keywords: ['حرير', 'قماش', 'خراسان', 'منسوجات', 'ثياب', 'silk', 'textiles', 'trade'],
      turn: {
        segments: [
          {
            text: 'ترد إلينا لفائف الحرير الفاخر من خراسان ومرو، وتُنسج في دور الطراز ببغداد أقمشة الكتان والديباج.',
            tag: 'documented',
            translation: 'Bolts of fine silk arrive from Khurasan and Merv, while Baghdad workshops weave linen and brocade.',
          },
        ],
        emotion: 'warm',
        gesture: 'point',
        followUps: ['من يشتري العطور والبخور؟', 'كيف تصل هذه القوافل؟'],
      },
    },
    {
      id: 'merchant-perfumes',
      keywords: ['عطر', 'عطور', 'مسك', 'عنبر', 'عود', 'بخور', 'perfume', 'aromatics', 'incense'],
      turn: {
        segments: [
          {
            text: 'يقبل أهل البلاط على المسك والعنبر وماء الورد الجوري وخشب العود، ونحفظها في قوارير زجاجية مصقولة.',
            tag: 'documented',
            translation: 'Courtiers prize musk, ambergris, damask rosewater, and agarwood kept in blown glass vials.',
          },
        ],
        emotion: 'warm',
        gesture: 'explain',
        followUps: ['ماذا عن الأواني النحاسية والخزف؟', 'من يراقب الموازين؟'],
      },
    },
    {
      id: 'merchant-muhtasib',
      keywords: ['محتسب', 'حسبه', 'رقابه', 'ميزان', 'غش', 'اسعار', 'muhtasib', 'inspector', 'governance'],
      turn: {
        segments: [
          {
            text: 'يمر المحتسب في أزقة الكرخ ليفحص الصنجات الزجاجية والحجرية ويمنع الغش في الكيل أو احتكار الأقوات.',
            tag: 'documented',
            translation: 'The muhtasib patrols Karkh’s alleys inspecting glass and stone weights to prevent short-measuring or hoarding.',
          },
        ],
        emotion: 'stern',
        gesture: 'emphasize',
        followUps: ['لماذا أُخرجت الأسواق عن المدينة المدورة؟', 'كيف توزنون الدنانير؟'],
      },
      discoveredFactIds: ['merchant-muhtasib'],
    },
    {
      id: 'merchant-location-karkh',
      keywords: ['كرخ', 'سور', 'اسوار', 'خارج', 'مدينه مدوره', 'why outside', 'architecture', 'walls'],
      turn: {
        segments: [
          {
            text: 'نقل الخليفة المنصور الأسواق إلى الكرخ خارج أسوار المدينة المدورة حفظاً لأمن القلب الإداري وسهولة وصول القوافل.',
            tag: 'documented',
            translation: 'Caliph al-Mansur placed the bazaars in al-Karkh outside the Round City walls to protect security and ease caravan access.',
          },
        ],
        emotion: 'thoughtful',
        gesture: 'explain',
        followUps: ['كيف تصل السفن إلى بغداد؟', 'ما هي الحرف المجاورة لكم؟'],
      },
      discoveredFactIds: ['merchant-karkh'],
    },
    {
      id: 'merchant-boats',
      keywords: ['سفن', 'دجله', 'فرات', 'بصره', 'مراكب', 'قوارب', 'ships', 'tigris', 'basra'],
      turn: {
        segments: [
          {
            text: 'ترسو مراكب القفة والمراكب النهرية على أرصفة دجلة والقنوات، محملة بتوابل البصرة وبضائع الشام.',
            tag: 'documented',
            translation: 'Round quffa rivercraft and cargo barges dock along Tigris quays and canals carrying Basra sea cargo and Syrian wares.',
          },
        ],
        emotion: 'warm',
        gesture: 'point',
        followUps: ['ما هي طرق القوافل البرية؟', 'ماذا يشتري الناس للبيت؟'],
      },
    },
    {
      id: 'merchant-ceramics',
      keywords: ['نحاس', 'خزف', 'فخار', 'زجاج', 'اواني', 'copper', 'ceramics', 'glass'],
      turn: {
        segments: [
          {
            text: 'يزدهر في الأزقة المجاورة سوق النحاسين وصناع الخزف المزجج ذي البريق المعدني الذي يحاكي الخزف الصيني.',
            tag: 'documented',
            translation: 'Neighboring alleys house coppersmiths and potters crafting tin-glazed and lusterware ceramics inspired by eastern porcelain.',
          },
        ],
        emotion: 'warm',
        gesture: 'explain',
        followUps: ['هل يوجد سوق للورق والكتب؟', 'حدثني عن التوابل والزعفران'],
      },
    },
    {
      id: 'merchant-daily-food',
      keywords: ['طعام', 'اكل', 'خبز', 'تمر', 'رمان', 'يوم', 'حياه', 'daily', 'life', 'food'],
      turn: {
        segments: [
          {
            text: 'يفوح من السوق عبق الخبز الحار والسمسم واللوز والتمر والرمان، غير أننا لم نسمع قط عن القهوة أو الشاي أو الطماطم.',
            tag: 'documented',
            translation: 'The market fills with the aroma of warm flatbread, sesame, almonds, dates, and pomegranates—with no coffee, tea, or tomatoes.',
          },
        ],
        emotion: 'warm',
        gesture: 'explain',
        followUps: ['ماذا عن العطور والتوابل؟', 'كيف توزنون الدنانير؟'],
      },
    },
    {
      id: 'merchant-caravans',
      keywords: ['قوافل', 'سمرقند', 'صين', 'شام', 'مصر', 'طرق', 'caravan', 'routes', 'silk road'],
      turn: {
        segments: [
          {
            text: 'تصل القوافل عبر طريق خراسان من سمرقند، ومن دمشق والفسطاط غرباً، ومن البصرة جنوباً فتلتقي في بغداد.',
            tag: 'documented',
            translation: 'Caravans converge on Baghdad via the Khurasan road from Samarkand, westward from Damascus and Fustat, and north from Basra.',
          },
        ],
        emotion: 'excited',
        gesture: 'explain',
        followUps: ['ما أبرز السلع القادمة؟', 'من يراقب الموازين؟'],
      },
    },
    {
      id: 'merchant-paper-stalls',
      keywords: ['ورق', 'وراقين', 'كتب', 'حبر', 'paper', 'books', 'science'],
      turn: {
        segments: [
          {
            text: 'نشتري من دكان الوراق القريب ورقاً سمرقندياً لكتابة دفاتر الحساب وعقود البيع والشراء.',
            tag: 'traditional',
            translation: 'We buy Samarkand rag paper from nearby stationers to record trade ledgers and bills of sale.',
          },
        ],
        emotion: 'thoughtful',
        gesture: 'explain',
        followUps: ['حدثني عن الدينار الذهبي', 'أين تقع خزانة العلماء؟'],
      },
    },
    {
      id: 'merchant-court-supply',
      keywords: ['قصر', 'خليفه', 'بلاط', 'مطبخ', 'توريد', 'palace', 'caliph'],
      turn: {
        segments: [
          {
            text: 'نجهز مطابخ القصر بالزعفران والقرفة والمسك حين تفد السفارات إلى مجلس أمير المؤمنين.',
            tag: 'dramatized',
            translation: 'We supply the palace kitchens with saffron, cinnamon, and musk whenever diplomatic embassies arrive.',
          },
        ],
        emotion: 'warm',
        gesture: 'greet',
        followUps: ['أين أجد حاجب القصر؟', 'وداعاً يا سالم'],
      },
    },
    {
      id: 'merchant-farewell',
      keywords: ['وداعا', 'شكرا', 'مع السلامه', 'bye', 'thank', 'goodbye'],
      turn: {
        segments: [
          {
            text: 'بارك الله في تجارتك ومسيرك؛ عُد إلى سوق الكرخ متى شئت!',
            tag: 'dramatized',
            translation: 'May your journey prosper; return to al-Karkh market whenever you wish!',
          },
        ],
        emotion: 'warm',
        gesture: 'bow',
        followUps: ['ما أبرز التوابل في السوق؟', 'كيف توزنون الدنانير؟'],
      },
    },
  ],
};

// Fix TS excess property literal on spice-merchant saffron item safely via normalization
function cleanIntentTurn(intent: ScriptedIntent): DialogueTurn {
  return {
    segments: intent.turn.segments,
    emotion: intent.turn.emotion,
    gesture: intent.turn.gesture,
    storyId: intent.turn.storyId,
    followUps: intent.turn.followUps,
    refusal: intent.turn.refusal,
  };
}

export function matchScriptedResponse(request: ChatRequest): ChatResponse {
  const normalized = normalizeArabic(request.message);

  // Anachronism guard first
  for (const word of ANACHRONISM_KEYWORDS) {
    if (normalized.includes(normalizeArabic(word))) {
      return {
        mode: 'offline',
        turn: {
          segments: [
            {
              text: 'عذراً أيها الزائر، ما تذكره غريب عن معارف عصرنا في نحو عام ثمانمائة للميلاد ولا أجد له أثراً في دواويننا.',
              tag: 'uncertain',
              translation: 'Forgive me, visitor; what you mention is unfamiliar to the knowledge of our era around 800 CE and has no place in our registers.',
            },
            {
              text: 'إن شئت، فلنتحدث عن بغداد أو الفلك أو البعثات الدبلوماسية في زماننا.',
              tag: 'dramatized',
              translation: 'If you wish, let us speak of Baghdad, astronomy, or the diplomatic embassies of our own day.',
            },
          ],
          emotion: 'thoughtful',
          gesture: 'think',
          refusal: 'anachronism',
          followUps: [
            'حدثني عن مدينة السلام وحكمك',
            'أخبرني عن سفارة ملك الفرنجة',
            'كيف وصل الورق إلى بغداد؟',
          ],
        },
      };
    }
  }

  const intents =
    request.characterId === 'harun-al-rashid'
      ? HARUN_INTENTS
      : SUPPORTING_INTENTS[request.characterId] ?? HARUN_INTENTS;

  let bestIntent: ScriptedIntent | null = null;
  let bestScore = 0;

  for (const intent of intents) {
    let score = 0;
    for (const kw of intent.keywords) {
      const nkw = normalizeArabic(kw);
      if (nkw && normalized.includes(nkw)) {
        score += nkw.length >= 4 ? 2 : 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  if (bestIntent && bestScore > 0) {
    return {
      mode: 'offline',
      turn: cleanIntentTurn(bestIntent),
      discoveredFactIds: bestIntent.discoveredFactIds,
    };
  }

  // Fallback polite redirect tailored to the character
  const fallbackPrompt =
    request.characterId === 'palace-steward'
      ? 'اسألني عن أروقة القصر، أو مكان الخليفة هارون الرشيد، أو نافورة الصحن.'
      : request.characterId === 'scholar-translator'
        ? 'اسألني عن ورق سمرقند، أو الأسطرلاب النحاسي، أو ترجمة كتب الطب والفلك.'
        : request.characterId === 'spice-merchant'
          ? 'اسألني عن التوابل والحرير في الكرخ، أو الدينار الذهبي، أو رقابة المحتسب.'
          : 'اسألني عن نشأة بغداد، أو القضاء والمظالم، أو خزانة الكتب، أو السفارات الواردة إلى البلاط.';

  return {
    mode: 'offline',
    turn: {
      segments: [
        {
          text: `سؤالك يدعو إلى التأمل؛ ${fallbackPrompt}`,
          tag: 'dramatized',
          translation: 'Your question invites reflection; ask me about Baghdad’s landmarks, daily life, scholarship, or governance around 800 CE.',
        },
      ],
      emotion: 'neutral',
      gesture: 'explain',
      followUps: intents[0]?.turn.followUps ?? [
        'حدثني عن مدينة السلام وحكمك',
        'كيف وصل الورق إلى بغداد؟',
      ],
    },
  };
}
