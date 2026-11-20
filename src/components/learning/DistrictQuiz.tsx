import { Award, CheckCircle2, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useT } from '../../i18n/useT';
import { eventBus } from '../../services/eventBus';
import { useAcademyStore } from '../../stores/academyStore';
import type { QuizQuestion } from '../../types';
import { AccuracyBadge } from '../ui/AccuracyBadge';

interface DistrictQuizProps {
  districtId: string;
  questions: QuizQuestion[];
}

export function DistrictQuiz({ districtId, questions }: DistrictQuizProps) {
  const language = useAcademyStore((s) => s.language);
  const passedIds = useAcademyStore((s) => s.passedQuizDistrictIds);
  const markQuizPassed = useAcademyStore((s) => s.markQuizPassed);
  const { t, loc } = useT(language);

  const [index, setIndex] = useState(0);
  const [selectedOptId, setSelectedOptId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = questions[index];
  const alreadyPassed = passedIds.includes(districtId);

  if (!current) return null;

  const handleCheck = () => {
    if (!selectedOptId || checked) return;
    setChecked(true);
    const isCorrect = selectedOptId === current.correctOptionId;
    if (isCorrect) {
      setScore((s) => s + 1);
      eventBus.emit('audio:quiz:chime', { kind: 'correct' });
    } else {
      eventBus.emit('audio:quiz:chime', { kind: 'gentle' });
    }
  };

  const handleNext = () => {
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
      setSelectedOptId(null);
      setChecked(false);
    } else {
      setFinished(true);
      markQuizPassed(districtId);
      eventBus.emit('audio:quiz:chime', { kind: 'complete' });
    }
  };

  const handleReset = () => {
    setIndex(0);
    setSelectedOptId(null);
    setChecked(false);
    setScore(0);
    setFinished(false);
  };

  return (
    <div className="cv-card space-y-4" data-testid="district-quiz">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="cv-heading text-xl font-bold text-[var(--cv-text)]">
          {t('quizTitle')}
        </h3>
        <div className="flex items-center gap-2">
          {alreadyPassed && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--cv-accent-sage)] px-3 py-1 text-xs font-semibold text-white">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t('quizComplete')}
            </span>
          )}
          <span className="cv-tabular rounded-full bg-[var(--cv-surface-soft)] px-3 py-1 text-xs font-bold text-[var(--cv-primary)]">
            {index + 1} / {questions.length}
          </span>
        </div>
      </div>

      {finished ? (
        <div className="space-y-4 rounded-[14px] border border-[var(--cv-accent-sage)]/40 bg-[#ECF7F1] p-5 text-center">
          <Award className="mx-auto h-10 w-10 text-[var(--cv-accent-sage)]" />
          <p className="cv-heading text-lg font-bold text-[var(--cv-text)]">
            {t('quizComplete')}
          </p>
          <p className="cv-tabular text-sm font-semibold text-[var(--cv-accent-sage)]">
            {t('quizScore')}: {score} / {questions.length}
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[var(--cv-border)] bg-white px-4 py-2 text-xs font-semibold text-[var(--cv-text)] hover:border-[var(--cv-primary)]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{t('errorRetry')}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="text-base font-semibold leading-relaxed text-[var(--cv-text)]">
              {loc(current.prompt)}
            </p>
            <AccuracyBadge kind={current.accuracy} />
          </div>

          <div className="space-y-2.5">
            {current.options.map((opt) => {
              const isSelected = selectedOptId === opt.id;
              const isCorrectOpt = opt.id === current.correctOptionId;

              let styleClass =
                'border-[var(--cv-border)] bg-[var(--cv-surface)] hover:border-[var(--cv-primary)]';
              if (checked) {
                if (isCorrectOpt) {
                  styleClass = 'border-[var(--cv-accent-sage)] bg-[#ECF7F1] font-semibold';
                } else if (isSelected) {
                  styleClass = 'border-[var(--cv-accent-coral)] bg-[var(--cv-coral-soft)]';
                }
              } else if (isSelected) {
                styleClass = 'border-[var(--cv-primary)] bg-[var(--cv-surface-soft)] font-semibold';
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={checked}
                  onClick={() => setSelectedOptId(opt.id)}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-[14px] border px-4 py-3 text-start text-sm text-[var(--cv-text)] transition-colors ${styleClass}`}
                >
                  <span>{loc(opt.text)}</span>
                  {checked && isCorrectOpt && (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--cv-accent-sage)]" />
                  )}
                </button>
              );
            })}
          </div>

          {checked && (
            <div className="rounded-[12px] border border-[var(--cv-border)] bg-[var(--cv-surface-soft)] p-3.5 text-xs leading-relaxed text-[var(--cv-text)]">
              {loc(current.explanation)}
            </div>
          )}

          <div className="flex justify-end">
            {!checked ? (
              <button
                type="button"
                disabled={!selectedOptId}
                onClick={handleCheck}
                className="cursor-pointer rounded-full bg-[var(--cv-primary)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--cv-primary-hover)] disabled:opacity-45"
              >
                {t('quizCheckAnswer')}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="cursor-pointer rounded-full bg-[var(--cv-accent-sage)] px-5 py-2 text-sm font-semibold text-white hover:opacity-92"
              >
                {t('quizNext')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
