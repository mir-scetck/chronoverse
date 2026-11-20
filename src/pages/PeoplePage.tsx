import { GuidedDialogueBox } from '../components/learning/GuidedDialogueBox';
import { SectionHeader } from '../components/ui/Primitives';
import { useT } from '../i18n/useT';
import { useAcademyStore } from '../stores/academyStore';

export function PeoplePage() {
  const language = useAcademyStore((s) => s.language);
  const { t } = useT(language);

  return (
    <div className="space-y-8" data-testid="people-page">
      <SectionHeader
        eyebrow={t('entryPortrayalHeader')}
        title={t('dialogueTitle')}
        subtitle={t('dialoguePlaceholder')}
      />
      <GuidedDialogueBox />
    </div>
  );
}
