import { Compass, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useT } from '../../i18n/useT';
import { useAcademyStore } from '../../stores/academyStore';

const QAMAR_TIPS = [
  {
    en: 'Look for green Documented shields when comparing chronicles with later 1001 Nights tales.',
    ar: 'ابحث عن شارة «موثّق» الخضراء لتمييز السجلات التاريخية عن حكايات ألف ليلة وليلة.',
  },
  {
    en: 'Al-Mansur designed the Round City in 762 CE with four great gates facing the four quarters of the empire.',
    ar: 'صمّم المنصور المدينة المدورة عام ٧٦٢ م بأربعة أبواب كبرى تتجه نحو أقاليم الدولة.',
  },
  {
    en: 'Click any numbered pin on an artifact photograph to inspect brass dials, reeds, or calligraphy close up.',
    ar: 'انقر على أي رقم فوق صورة القطعة الأثرية لتكبير تفاصيل النحاس أو أقلام القصب أو الخط.',
  },
  {
    en: 'Ask Caliph Harun al-Rashid or Ishaq the Copyist about al-Raqqa or rag paper in Arabic or English!',
    ar: 'اسأل الخليفة هارون الرشيد أو إسحاق الوراق عن مدينة الرقة أو صناعة الورق بالعربية أو الإنجليزية!',
  },
];

export function QamarMascot({ tipIndex }: { tipIndex?: number }) {
  const language = useAcademyStore((s) => s.language);
  const qamarVisible = useAcademyStore((s) => s.qamarVisible);
  const setQamarVisible = useAcademyStore((s) => s.setQamarVisible);
  const { t, loc } = useT(language);
  const [idx, setIdx] = useState(tipIndex ?? 0);

  if (!qamarVisible) {
    return (
      <div className="cv-no-print flex justify-end">
        <button
          type="button"
          data-testid="qamar-show-btn"
          onClick={() => setQamarVisible(true)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#D8E1E8] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1E293B] shadow-sm hover:bg-[#EEF5F7]"
        >
          <Eye className="h-3.5 w-3.5 text-[#2B6CB0]" />
          <span>{t('qamarShow')}</span>
        </button>
      </div>
    );
  }

  const tip = QAMAR_TIPS[idx % QAMAR_TIPS.length];

  return (
    <aside
      data-testid="qamar-mascot"
      aria-label={t('qamarName')}
      className="cv-no-print flex flex-col items-start gap-4 rounded-[18px] border border-[#D8E1E8] bg-[#EEF5F7] p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-3.5">
        {/* Custom SVG Brass Astrolabe Character */}
        <svg
          width="60"
          height="64"
          viewBox="0 0 64 68"
          fill="none"
          aria-hidden="true"
          className="shrink-0"
        >
          {/* Hanging Brass Ring */}
          <circle cx="32" cy="8" r="5" stroke="#B7791F" strokeWidth="2.5" fill="#FEF5E6" />
          <path d="M27 13 L32 10 L37 13" stroke="#B7791F" strokeWidth="2.2" strokeLinecap="round" />
          {/* Astrolabe Body */}
          <circle cx="32" cy="39" r="24" fill="#E69F3E" stroke="#9C6114" strokeWidth="2.4" />
          <circle cx="32" cy="39" r="19" fill="#FFFDF8" stroke="#D8AE66" strokeWidth="1.5" />
          {/* Degree ticks */}
          <path
            d="M32 17 V21 M32 57 V61 M10 39 H14 M50 39 H54"
            stroke="#9C6114"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Expressive Eyes */}
          <circle cx="25" cy="36" r="3.4" fill="#1E293B" />
          <circle cx="39" cy="36" r="3.4" fill="#1E293B" />
          <circle cx="26.1" cy="34.8" r="1.1" fill="#FFFFFF" />
          <circle cx="40.1" cy="34.8" r="1.1" fill="#FFFFFF" />
          {/* Cheerful Smile */}
          <path
            d="M26 44 Q32 49 38 44"
            stroke="#1E293B"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Tiny Brass Rete Pointer */}
          <line x1="17" y1="49" x2="47" y2="29" stroke="#2B6CB0" strokeWidth="1.8" strokeOpacity="0.45" />
        </svg>

        <div>
          <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#2B6CB0]">
            <Compass className="h-3.5 w-3.5" />
            <span>{t('qamarName')}</span>
          </p>
          <p className="mt-1 text-sm font-medium leading-snug text-[#1E293B]">
            {loc(tip)}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => setIdx((v) => v + 1)}
          title={t('qamarNextTip')}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#94A3B8] bg-white px-3 py-1.5 text-xs font-semibold text-[#1E293B] hover:bg-[#FBF8F3]"
        >
          <RefreshCw className="h-3.5 w-3.5 text-[#2B6CB0]" />
          <span>{t('qamarNextTip')}</span>
        </button>
        <button
          type="button"
          data-testid="qamar-hide-btn"
          onClick={() => setQamarVisible(false)}
          aria-label={t('qamarHide')}
          className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-transparent px-2.5 py-1.5 text-xs font-semibold text-[#526071] hover:bg-white hover:text-[#1E293B]"
        >
          <EyeOff className="h-3.5 w-3.5" />
          <span>{t('qamarHide')}</span>
        </button>
      </div>
    </aside>
  );
}
