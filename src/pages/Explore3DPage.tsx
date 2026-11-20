import { useSearchParams } from 'react-router-dom';
import { EmbeddedBaghdadExhibit } from '../components/exhibit/EmbeddedBaghdadExhibit';
import { SectionHeader } from '../components/ui/Primitives';
import { useT } from '../i18n/useT';
import { useAcademyStore } from '../stores/academyStore';

export function Explore3DPage() {
  const [searchParams] = useSearchParams();
  const language = useAcademyStore((s) => s.language);
  const { t } = useT(language);
  const locId = searchParams.get('loc');

  return (
    <div className="space-y-6" data-testid="explore-3d-page">
      <SectionHeader
        eyebrow={t('browserWorldBadge')}
        title={t('beginJourney')}
        subtitle={t('entryControlsDesktop')}
      />
      <EmbeddedBaghdadExhibit initialLocationId={locId} autoStart={Boolean(locId)} />
    </div>
  );
}
