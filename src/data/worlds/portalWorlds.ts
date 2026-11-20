import type { LocalizedText, WorldId, WorldStatus } from '../../contracts';
import { BAGHDAD_WORLD } from './baghdad';

export interface PortalWorldSummary {
  id: WorldId;
  name: LocalizedText;
  eraLabel: LocalizedText;
  year: number;
  tagline: LocalizedText;
  summary: LocalizedText;
  honestyNote: LocalizedText;
  status: WorldStatus;
  accent: string;
  primaryCharacterName: LocalizedText;
  primaryCharacterTitle: LocalizedText;
  timelineOrder: number;
}

export const PORTAL_WORLDS: PortalWorldSummary[] = [
  {
    id: 'baghdad',
    name: BAGHDAD_WORLD.name,
    eraLabel: BAGHDAD_WORLD.eraLabel,
    year: BAGHDAD_WORLD.year,
    tagline: BAGHDAD_WORLD.tagline,
    summary: BAGHDAD_WORLD.summary,
    honestyNote: BAGHDAD_WORLD.honestyNote,
    status: BAGHDAD_WORLD.status,
    accent: BAGHDAD_WORLD.theme.accent,
    primaryCharacterName: { en: 'Harun al-Rashid', ar: 'هارون الرشيد' },
    primaryCharacterTitle: { en: 'Fifth Abbasid Caliph', ar: 'الخليفة العباسي الخامس' },
    timelineOrder: 0,
  },
  {
    id: 'samarkand',
    name: { en: 'Samarkand', ar: 'سمرقند' },
    eraLabel: { en: '1429 CE', ar: '1429 م' },
    year: 1429,
    tagline: {
      en: 'Ulugh Beg’s astronomical observatory and Registan madrasa',
      ar: 'مرصد أولغ بك الفلكي ومدرسة الريجستان',
    },
    summary: {
      en: 'Interactive celestial demonstrations, meridian arc trench, and star catalogue tables.',
      ar: 'تجارب فلكية تفاعلية ومزولة خط الزوال وجداول النجوم.',
    },
    honestyNote: {
      en: 'Planned world: only the underground meridian arc survives; the observatory superstructure is a planned reconstruction.',
      ar: 'عالم مخطط: لم يتبقَّ من المرصد سوى القوس الأرضي؛ والمبنى تصور مقترح.',
    },
    status: 'planned',
    accent: '#3b7fc4',
    primaryCharacterName: { en: 'Ulugh Beg', ar: 'أولغ بك' },
    primaryCharacterTitle: { en: 'Timurid Astronomer-Ruler', ar: 'الحاكم الفلكي التيموري' },
    timelineOrder: 1,
  },
  {
    id: 'granada',
    name: { en: 'Granada', ar: 'غرناطة' },
    eraLabel: { en: '1492 CE', ar: '1492 م' },
    year: 1492,
    tagline: {
      en: 'Winter in the Alhambra halls during the final days of Nasrid rule',
      ar: 'شتاء الحمراء في الأيام الأخيرة للحكم النصري',
    },
    summary: {
      en: 'Court of the Lions, Hall of Ambassadors, and water channels from the Darro.',
      ar: 'بهو السباع وقاعة السفراء وقنوات المياه الجارية.',
    },
    honestyNote: {
      en: 'Planned world: set in winter 1491–1492 without later 16th-century Palace of Charles V additions.',
      ar: 'عالم مخطط: تدور أحداثه في شتاء 1491–1492 دون الإضافات اللاحقة.',
    },
    status: 'planned',
    accent: '#c7a15a',
    primaryCharacterName: { en: 'Boabdil (Muhammad XII)', ar: 'أبو عبد الله الصغير' },
    primaryCharacterTitle: { en: 'Last Nasrid Sultan', ar: 'آخر سلاطين بني نصر' },
    timelineOrder: 2,
  },
  {
    id: 'kingston',
    name: { en: 'Kingston', ar: 'كينغستون' },
    eraLabel: { en: '1991 CE', ar: '1991 م' },
    year: 1991,
    tagline: {
      en: 'University campus life, DOS computer labs, and pre-web libraries',
      ar: 'الحياة الجامعية ومختبرات الحاسوب ومكتبات ما قبل الويب',
    },
    summary: {
      en: 'Grant Hall, Douglas Library card catalogues, and early 1990s student computing.',
      ar: 'قاعة غرانت وفهارس مكتبة دوغلاس وحواسيب مطلع التسعينيات.',
    },
    honestyNote: {
      en: 'Planned world: living-person portrayal safeguards apply strictly with zero future knowledge.',
      ar: 'عالم مخطط: يخضع لضوابط تمثيل الشخصيات المعاصرة دون أي معرفة بالمستقبل.',
    },
    status: 'planned',
    accent: '#b99a5b',
    primaryCharacterName: { en: 'Young University Student', ar: 'طالب جامعي شاب' },
    primaryCharacterTitle: { en: 'Simulated 1991 Undergraduate', ar: 'محاكاة طالب في عام 1991' },
    timelineOrder: 3,
  },
];

export interface FutureDestination {
  id: string;
  name: LocalizedText;
  eraLabel: LocalizedText;
}

export const FUTURE_DESTINATIONS: FutureDestination[] = [
  { id: 'cairo-1920', name: { en: 'Cairo', ar: 'القاهرة' }, eraLabel: { en: '1920 CE', ar: '1920 م' } },
  { id: 'paris-1889', name: { en: 'Paris', ar: 'باريس' }, eraLabel: { en: '1889 CE', ar: '1889 م' } },
  { id: 'rome-117', name: { en: 'Rome', ar: 'روما' }, eraLabel: { en: '117 CE', ar: '117 م' } },
];
