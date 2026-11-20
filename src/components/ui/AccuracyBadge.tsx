import { HelpCircle, ScrollText, ShieldCheck, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { FactTag } from '../../contracts';
import { useT } from '../../i18n/useT';
import { useAcademyStore } from '../../stores/academyStore';

interface AccuracyBadgeProps {
  tag?: FactTag;
  kind?: FactTag;
  size?: 'sm' | 'md';
  showTooltip?: boolean;
}

const BADGE_CONFIG: Record<
  FactTag,
  {
    bg: string;
    text: string;
    border: string;
    Icon: typeof ShieldCheck;
  }
> = {
  documented: {
    bg: 'bg-[#E9F6EF]',
    text: 'text-[#1F6140]',
    border: 'border-[#2F855A]/35',
    Icon: ShieldCheck,
  },
  traditional: {
    bg: 'bg-[#FEF5E6]',
    text: 'text-[#8C530D]',
    border: 'border-[#E69F3E]/45',
    Icon: ScrollText,
  },
  dramatized: {
    bg: 'bg-[#EEF5F7]',
    text: 'text-[#1E538A]',
    border: 'border-[#2B6CB0]/35',
    Icon: Sparkles,
  },
  uncertain: {
    bg: 'bg-[#FDF0ED]',
    text: 'text-[#9E3924]',
    border: 'border-[#D96B52]/40',
    Icon: HelpCircle,
  },
};

export function AccuracyBadge({
  tag,
  kind,
  size = 'sm',
  showTooltip = true,
}: AccuracyBadgeProps) {
  const language = useAcademyStore((s) => s.language);
  const { t } = useT(language);
  const [open, setOpen] = useState(false);

  const effectiveTag: FactTag = tag ?? kind ?? 'documented';

  const labelMap: Record<FactTag, string> = {
    documented: t('tagDocumented'),
    traditional: t('tagTraditional'),
    dramatized: t('tagDramatized'),
    uncertain: t('tagUncertain'),
  };

  const tipMap: Record<FactTag, string> = {
    documented: t('tagDocumentedTip'),
    traditional: t('tagTraditionalTip'),
    dramatized: t('tagDramatizedTip'),
    uncertain: t('tagUncertainTip'),
  };

  const cfg = BADGE_CONFIG[effectiveTag];
  const Icon = cfg.Icon;

  const badgeClasses = `inline-flex items-center gap-1.5 rounded-full border font-bold ${cfg.bg} ${cfg.text} ${cfg.border} ${
    size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs'
  }`;

  if (!showTooltip) {
    return (
      <span
        className={badgeClasses}
        title={tipMap[effectiveTag]}
        aria-label={`${labelMap[effectiveTag]}: ${tipMap[effectiveTag]}`}
      >
        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>{labelMap[effectiveTag]}</span>
      </span>
    );
  }

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
        aria-label={`${labelMap[effectiveTag]}: ${tipMap[effectiveTag]}`}
        title={tipMap[effectiveTag]}
        className={`${badgeClasses} cursor-pointer`}
      >
        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>{labelMap[effectiveTag]}</span>
      </button>

      {open && (
        <span
          role="tooltip"
          className="absolute start-0 top-full z-30 mt-1.5 w-60 rounded-xl border border-[#D8E1E8] bg-white p-2.5 text-start text-xs font-normal leading-snug text-[#1E293B] shadow-lg"
        >
          {tipMap[effectiveTag]}
        </span>
      )}
    </span>
  );
}
