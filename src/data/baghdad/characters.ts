import type { DialogueTopicChip } from '../../types';

export const DIALOGUE_TOPIC_CHIPS: DialogueTopicChip[] = [
  {
    category: 'daily-life',
    label: { en: 'Daily Life', ar: 'الحياة اليومية' },
    sampleQuestionAr: 'كيف يعيش أهل بغداد يومهم وما طعامهم في هذا العصر؟',
    sampleQuestionEn: 'What is daily life and food like in 800 CE Baghdad?',
  },
  {
    category: 'governance',
    label: { en: 'Governance', ar: 'الحكم والعدل' },
    sampleQuestionAr: 'كيف تدار مجالس المظالم وشؤون الحكم بين بغداد والرقة؟',
    sampleQuestionEn: 'How are justice and governance managed between Baghdad and al-Raqqa?',
  },
  {
    category: 'science',
    label: { en: 'Science', ar: 'العلم والفلك' },
    sampleQuestionAr: 'حدثني عن صناعة الورق والأسطرلاب وترجمة الكتب',
    sampleQuestionEn: 'Tell me about papermaking, the astrolabe, and translating books.',
  },
  {
    category: 'trade',
    label: { en: 'Trade', ar: 'التجارة والدينار' },
    sampleQuestionAr: 'ما أبرز البضائع في سوق الكرخ وكيف توزن الدنانير الذهبية؟',
    sampleQuestionEn: 'What goods fill Karkh Market and how are gold dinars weighed?',
  },
  {
    category: 'architecture',
    label: { en: 'Architecture', ar: 'العمارة والماء' },
    sampleQuestionAr: 'حدثني عن أسوار المدينة المدورة والقبة الخضراء والقنوات',
    sampleQuestionEn: 'Describe the Round City walls, the Green Dome, and water canals.',
  },
];

export const CHARACTER_QUICK_QUESTIONS: Record<string, string[]> = {
  'harun-al-rashid': [
    'حدثني عن مدينة السلام وحكمك',
    'لماذا تقيم أحياناً في الرقة؟',
    'أخبرني عن سفارة ملك الفرنجة',
    'ما مسؤولياتك في المظالم والعدل؟',
    'أخبرني عن القبة الخضراء والعمارة',
  ],
  'palace-steward': [
    'أين أجد الخليفة هارون الرشيد؟',
    'كيف يعمل نظام الحراسة في البوابة الذهبية؟',
    'حدثني عن نافورة الصحن وقنوات دجلة',
    'ماذا يُلبس في البلاط العباسي من السواد والطراز؟',
    'هل يقيم البلاط في الرقة أيضاً؟',
  ],
  'scholar-translator': [
    'كيف وصل الورق من سمرقند إلى بغداد؟',
    'كيف تقيسون النجوم بالأسطرلاب النحاسي؟',
    'من أي لغات تترجمون كتب الطب والفلك؟',
    'مِمَّ تصنعون أقلام القصب وحبر السخام؟',
    'كيف تعمل الساعة المائية وما علاقتها بالهندسة؟',
  ],
  'spice-merchant': [
    'ما أبرز التوابل والحرير في سوق الكرخ؟',
    'كيف توزنون الدنانير الذهبية والدراهم الفضية؟',
    'من يراقب الموازين والأسعار في السوق؟',
    'لماذا أُخرجت الأسواق عن أسوار المدينة المدورة؟',
    'ما الذي تصل به قوافل المشرق وسفن البصرة؟',
  ],
};
