import { Link } from 'react-router-dom';
import { useT } from '../../i18n/useT';
import { useAcademyStore } from '../../stores/academyStore';
import type { AccuracyKind } from '../../types';
import { AccuracyBadge } from '../ui/AccuracyBadge';
import { useState } from 'react';

interface ConceptNode {
  id: string;
  titleEn: string;
  titleAr: string;
  summaryEn: string;
  summaryAr: string;
  linksEn: string[];
  linksAr: string[];
  route: string;
  accuracy: AccuracyKind;
}

const PILLARS: ConceptNode[] = [
  {
    id: 'round-city',
    titleEn: 'Round City Urban Plan',
    titleAr: 'تخطيط المدينة المدورة',
    summaryEn: 'Caliph al-Mansur laid out four radial avenues converging on the Mosque and Palace of the Golden Gate (762 CE).',
    summaryAr: 'خطط المنصور أربع جادات رئيسية تتلاقى في المسجد الجامع وقصر الباب الذهبي (٧٦٢ م).',
    linksEn: ['Golden Gate bent defenses', 'Separation of outer Karkh markets'],
    linksAr: ['تحصينات البوابة الذهبية المنكسرة', 'فصل أسواق الكرخ خارج الأسوار'],
    route: '/districts/golden-gate-approach',
    accuracy: 'documented',
  },
  {
    id: 'scholarship',
    titleEn: 'Scholarship & Rag Paper',
    titleAr: 'خزانة الكتب وصناعة الورق',
    summaryEn: 'Samarkand paper craft, reed pens, and multilingual translation turned manuscripts into an accessible scholarly trade.',
    summaryAr: 'أسهم ورق سمرقند وأقلام القصب والترجمة في انتشار المخطوطات بين العلماء والوراقين.',
    linksEn: ['Brass planispheric astrolabes', 'Khizanat al-Hikma cedar shelves'],
    linksAr: ['الأسطرلاب النحاسي المسطح', 'رفوف خزانة الحكمة'],
    route: '/districts/scholars-library',
    accuracy: 'traditional',
  },
  {
    id: 'hydraulics',
    titleEn: 'Tigris & Nahr Isa Hydraulics',
    titleAr: 'هندسة المياه والقنوات',
    summaryEn: 'Gravity-fed canals nourished palm gardens, marble courtyard fountains, and regulated water clocks.',
    summaryAr: 'غذت القنوات المتصلة بدجلة ونهر عيسى البساتين والنوافير والساعات المائية.',
    linksEn: ['Octagonal courtyard fountain', 'Clepsydra timekeeping'],
    linksAr: ['نافورة الصحن المثمنة', 'الساعة المائية (البنكام)'],
    route: '/districts/palace-garden',
    accuracy: 'documented',
  },
  {
    id: 'diplomacy',
    titleEn: 'Court, Mazalim & Diplomacy',
    titleAr: 'البلاط والمظالم والدبلوماسية',
    summaryEn: 'Harun al-Rashid governed between Baghdad and al-Raqqa while exchanging embassies with Charlemagne.',
    summaryAr: 'تنقل بلاط هارون الرشيد بين بغداد والرقة، وتبادل السفارات مع بلاط شارلمان.',
    linksEn: ['Mazalim justice petitions', 'Abbasid black & gold tiraz robes'],
    linksAr: ['مجالس المظالم والقضاء', 'السواد العباسي وشرائط الطراز'],
    route: '/districts/audience-hall',
    accuracy: 'documented',
  },
  {
    id: 'karkh-trade',
    titleEn: 'Karkh Trade & Gold Dinar',
    titleAr: 'تجارة الكرخ والدينار الذهبي',
    summaryEn: 'Caravans and Tigris rivercraft converged outside the walls under the muhtasib’s supervision of weights.',
    summaryAr: 'التقت القوافل ومراكب دجلة في سوق الكرخ تحت رقابة المحتسب على الموازين.',
    linksEn: ['4.25g epigraphic gold dinar', 'Pre-1492 Old World spices'],
    linksAr: ['الدينار الذهبي المنقوش (٤.٢٥ جم)', 'توابل الهند وخراسان قبل ١٤٩٢'],
    route: '/districts/market-street',
    accuracy: 'documented',
  },
];

export function ConceptMap() {
  const language = useAcademyStore((s) => s.language);
  const { t, isRtl } = useT(language);
  const [activeId, setActiveId] = useState<string>(PILLARS[0].id);
  const active = PILLARS.find((p) => p.id === activeId) ?? PILLARS[0];

  return (
    <div className="cv-card space-y-5" data-testid="concept-map">
      <div>
        <h3 className="cv-heading text-xl font-bold text-[var(--cv-text)]">
          {t('conceptMapTitle')}
        </h3>
        <p className="mt-1 text-sm text-[var(--cv-muted)]">{t('conceptMapHint')}</p>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {PILLARS.map((node) => {
          const isActive = node.id === active.id;
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => setActiveId(node.id)}
              className={`cursor-pointer rounded-full border px-4 py-2 text-xs font-bold transition-colors ${
                isActive
                  ? 'border-[var(--cv-primary)] bg-[var(--cv-primary)] text-white'
                  : 'border-[var(--cv-border)] bg-[var(--cv-surface-soft)] text-[var(--cv-text)] hover:border-[var(--cv-primary)]'
              }`}
            >
              {isRtl ? node.titleAr : node.titleEn}
            </button>
          );
        })}
      </div>

      <div className="rounded-[16px] border border-[var(--cv-border)] bg-[var(--cv-surface-soft)] p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="cv-heading text-lg font-bold text-[var(--cv-text)]">
            {isRtl ? active.titleAr : active.titleEn}
          </h4>
          <AccuracyBadge kind={active.accuracy} />
        </div>

        <p className="text-sm leading-relaxed text-[var(--cv-text)]">
          {isRtl ? active.summaryAr : active.summaryEn}
        </p>

        <div className="flex flex-wrap gap-2">
          {(isRtl ? active.linksAr : active.linksEn).map((lnk) => (
            <span
              key={lnk}
              className="rounded-full border border-[var(--cv-border)] bg-white px-3 py-1 text-xs font-medium text-[var(--cv-muted)]"
            >
              {lnk}
            </span>
          ))}
        </div>

        <div className="pt-1">
          <Link
            to={active.route}
            className="inline-flex items-center gap-2 text-xs font-bold text-[var(--cv-primary)] hover:underline"
          >
            {t('mapOpenLesson')}
          </Link>
        </div>
      </div>
    </div>
  );
}
