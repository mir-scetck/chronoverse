import { Mic, MicOff, Send, ShieldAlert, Square, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { aiService } from '../../ai/AIService';
import type { Character, DialogueTurn } from '../../contracts';
import { CHARACTER_QUICK_QUESTIONS, DIALOGUE_TOPIC_CHIPS } from '../../data/baghdad/characters';
import { BAGHDAD_KNOWLEDGE } from '../../data/knowledge/baghdad-characters';
import { BAGHDAD_WORLD } from '../../data/worlds/baghdad';
import { useT } from '../../i18n/useT';
import { useAcademyStore } from '../../stores/academyStore';
import { useAppStore } from '../../stores/appStore';
import { voiceService } from '../../voice/VoiceService';
import { AccuracyBadge } from '../ui/AccuracyBadge';

interface MessageEntry {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  turn?: DialogueTurn;
}

export function GuidedDialogueBox() {
  const language = useAcademyStore((s) => s.language);
  const { settings, updateSettings, getWorldProgress, recordDialogueTurn } = useAppStore();
  const { t, loc, isRtl } = useT(language);

  const [selectedChar, setSelectedChar] = useState<Character>(BAGHDAD_WORLD.characters[0]);
  const [messages, setMessages] = useState<MessageEntry[]>(() => [
    {
      id: 'init-greeting',
      role: 'assistant',
      text: BAGHDAD_WORLD.characters[0].greetingArabic,
      turn: {
        segments: [
          {
            text: BAGHDAD_WORLD.characters[0].greetingArabic,
            tag: 'dramatized',
            translation: BAGHDAD_WORLD.characters[0].greetingEnglish,
          },
        ],
        emotion: 'warm',
        gesture: 'welcome',
        followUps: BAGHDAD_WORLD.characters[0].suggestedQuestions.slice(0, 3),
      },
    },
  ]);

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [mode, setMode] = useState<'gemini' | 'offline'>('offline');
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [micNote, setMicNote] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const wp = getWorldProgress('baghdad');
  const recSupported = voiceService.isSupportedRecognition();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => {
      voiceService.stopSpeaking();
      voiceService.stopRecognition();
    };
  }, []);

  const handleSelectCharacter = (char: Character) => {
    voiceService.stopSpeaking();
    setSpeaking(false);
    setSelectedChar(char);
    setMessages([
      {
        id: `greet-${char.id}`,
        role: 'assistant',
        text: char.greetingArabic,
        turn: {
          segments: [
            {
              text: char.greetingArabic,
              tag: 'dramatized',
              translation: char.greetingEnglish,
            },
          ],
          emotion: 'warm',
          gesture: 'welcome',
          followUps: char.suggestedQuestions.slice(0, 3),
        },
      },
    ]);
  };

  const handleReadAloud = async (arabicText: string) => {
    if (speaking) {
      voiceService.stopSpeaking();
      setSpeaking(false);
      return;
    }
    voiceService.setPreferences({
      preferredVoiceUri: settings.preferredVoiceUri,
      volume: settings.voiceVolume,
      muted: false,
    });
    setSpeaking(true);
    await voiceService.speak(arabicText, selectedChar.voice, selectedChar.id);
    setSpeaking(false);
  };

  const handleSend = async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed || sending) return;

    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text: trimmed }]);
    setInput('');
    setSending(true);

    const history = messages.slice(-6).map((m) => ({ role: m.role, text: m.text }));
    const res = await aiService.sendMessage({
      worldId: 'baghdad',
      characterId: selectedChar.id,
      language,
      message: trimmed,
      history,
      context: {
        currentLocationId: selectedChar.homeLocationId,
        nearbyObjectIds: [],
        discoveredFactIds: wp.discoveredFacts.map((f) => f.id),
        watchedStoryIds: wp.watchedStories,
      },
      includeTranslation: settings.includeTranslation,
    });

    setMode(res.mode);
    const fullArabic = res.turn.segments.map((s) => s.text).join(' ');
    const knowledge = BAGHDAD_KNOWLEDGE[selectedChar.id];
    const unlockedFacts = (res.discoveredFactIds ?? [])
      .map((fid) => knowledge?.groundingFacts.find((f) => f.id === fid))
      .filter((f): f is NonNullable<typeof f> => Boolean(f))
      .map((f) => ({ id: f.id, text: f.text, source: f.source }));

    recordDialogueTurn('baghdad', {
      isPrimaryCharacter: selectedChar.id === BAGHDAD_WORLD.primaryCharacterId,
      characterName: loc(selectedChar.name),
      question: trimmed,
      reply: fullArabic,
      facts: unlockedFacts,
    });

    setMessages((prev) => [
      ...prev,
      {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: fullArabic,
        turn: res.turn,
      },
    ]);
    setSending(false);
  };

  const handleToggleMic = () => {
    if (!recSupported) {
      setMicNote(t('dialogueMicUnsupported'));
      return;
    }
    if (listening) {
      voiceService.stopRecognition();
      setListening(false);
      return;
    }
    setMicNote(null);
    setListening(true);
    voiceService.startRecognition({
      lang: settings.speechRecognitionLang,
      onInterim: (txt) => setInput(txt),
      onFinal: (txt) => {
        setListening(false);
        setInput(txt);
        if (txt.trim()) void handleSend(txt);
      },
      onError: (code) => {
        setListening(false);
        setMicNote(
          code === 'not-allowed' || code === 'service-not-allowed'
            ? t('dialogueMicDenied')
            : t('dialogueMicUnsupported'),
        );
      },
    });
  };

  const quickQuestions =
    CHARACTER_QUICK_QUESTIONS[selectedChar.id] ?? selectedChar.suggestedQuestions;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12" data-testid="guided-dialogue-box">
      {/* Left: 4 Historical Figures & Guides */}
      <div className="space-y-3 lg:col-span-4">
        {BAGHDAD_WORLD.characters.map((ch) => {
          const active = ch.id === selectedChar.id;
          return (
            <button
              key={ch.id}
              type="button"
              data-testid={`select-character-${ch.id}`}
              onClick={() => handleSelectCharacter(ch)}
              className={`flex w-full cursor-pointer items-start gap-3 rounded-[18px] border p-4 text-start transition-all ${
                active
                  ? 'border-[var(--cv-primary)] bg-[var(--cv-surface)] shadow-[var(--cv-shadow-lift)] ring-2 ring-[var(--cv-primary)]/20'
                  : 'border-[var(--cv-border)] bg-[var(--cv-surface)] hover:border-[var(--cv-primary)]/50'
              }`}
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[var(--cv-accent-honey)] text-base font-bold text-white"
                style={{ backgroundColor: ch.appearance.robeColor }}
              >
                {loc(ch.name).slice(0, 1)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="cv-heading text-base font-bold text-[var(--cv-text)]">
                  {loc(ch.name)}
                </p>
                <p className="text-xs font-medium text-[var(--cv-primary)]">
                  {loc(ch.title)}
                </p>
                <p className="mt-1 line-clamp-2 text-[11px] text-[var(--cv-muted)]">
                  {loc(ch.portrayalNotice)}
                </p>
              </div>
            </button>
          );
        })}

        {/* Topic Category Chips */}
        <div className="cv-card-soft space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--cv-muted)]">
            {t('dialogueSuggestedLabel')}
          </p>
          <div className="flex flex-wrap gap-2">
            {DIALOGUE_TOPIC_CHIPS.map((chip) => (
              <button
                key={chip.category}
                type="button"
                data-testid={`topic-chip-${chip.category}`}
                onClick={() =>
                  void handleSend(isRtl ? chip.sampleQuestionAr : chip.sampleQuestionEn)
                }
                className="cursor-pointer rounded-full border border-[var(--cv-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--cv-text)] hover:border-[var(--cv-primary)] hover:text-[var(--cv-primary)]"
              >
                {loc(chip.label)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Conversation Pane */}
      <div className="cv-card flex min-h-[540px] flex-col justify-between gap-4 lg:col-span-8">
        {/* Permanent Portrayal & Accuracy Banner */}
        <div className="space-y-3 border-b border-[var(--cv-border)] pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="cv-heading text-xl font-bold text-[var(--cv-text)]">
                {loc(selectedChar.name)}
              </h2>
              <p className="text-xs text-[var(--cv-muted)]">{loc(selectedChar.title)}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[var(--cv-surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--cv-primary)]">
                {mode === 'gemini' ? t('dialogueOnlineChip') : t('dialogueOfflineChip')}
              </span>
              <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-[var(--cv-text)]">
                <input
                  type="checkbox"
                  checked={settings.includeTranslation}
                  onChange={(e) => updateSettings({ includeTranslation: e.target.checked })}
                  className="accent-[var(--cv-primary)]"
                />
                <span>{t('dialogueTranslationToggle')}</span>
              </label>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-[12px] border border-[var(--cv-accent-honey)]/45 bg-[#FEF8ED] px-3.5 py-2.5 text-xs text-[var(--cv-text)]">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#9A6008]" />
            <span>{loc(selectedChar.portrayalNotice)}</span>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 space-y-3 overflow-y-auto pe-1 cv-scroll max-h-[380px]"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              data-testid={m.role === 'assistant' ? 'dialogue-assistant-msg' : 'dialogue-user-msg'}
              className={`rounded-[16px] p-4 ${
                m.role === 'user'
                  ? 'ms-10 border border-[var(--cv-primary)]/30 bg-[var(--cv-surface-soft)] text-sm text-[var(--cv-text)]'
                  : 'me-4 border border-[var(--cv-border)] bg-white shadow-sm'
              }`}
            >
              {m.turn ? (
                <div className="space-y-3">
                  {m.turn.segments.map((seg, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="cv-arabic flex-1 text-base font-medium leading-relaxed text-[var(--cv-text)]">
                          {seg.text}
                        </p>
                        <AccuracyBadge kind={seg.tag} />
                      </div>
                      {settings.includeTranslation && seg.translation && (
                        <p className="text-xs leading-relaxed text-[var(--cv-muted)]">
                          {seg.translation}
                        </p>
                      )}
                    </div>
                  ))}
                  <div className="flex items-center justify-end border-t border-[var(--cv-border)]/70 pt-2">
                    <button
                      type="button"
                      onClick={() => void handleReadAloud(m.text)}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[var(--cv-border)] px-3 py-1 text-xs font-semibold text-[var(--cv-primary)] hover:bg-[var(--cv-surface-soft)]"
                    >
                      {speaking ? (
                        <>
                          <Square className="h-3 w-3" />
                          <span>{t('dialogueStopSpeaking')}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-3.5 w-3.5" />
                          <span>{t('dialogueReadAloud')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <p>{m.text}</p>
              )}
            </div>
          ))}
        </div>

        {/* Quick Questions & Form */}
        <div className="space-y-2.5 border-t border-[var(--cv-border)] pt-3">
          <div className="flex flex-wrap gap-1.5">
            {quickQuestions.map((q) => (
              <button
                key={q}
                type="button"
                disabled={sending}
                onClick={() => void handleSend(q)}
                className="cv-arabic cursor-pointer rounded-full border border-[var(--cv-border)] bg-[var(--cv-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--cv-text)] hover:border-[var(--cv-primary)] hover:text-[var(--cv-primary)]"
              >
                {q}
              </button>
            ))}
          </div>

          {micNote && (
            <p className="text-xs font-medium text-[var(--cv-accent-coral)]">{micNote}</p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSend(input);
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={handleToggleMic}
              aria-label={listening ? t('dialogueMicListening') : t('dialogueMicHold')}
              className={`cursor-pointer rounded-full border p-2.5 ${
                listening
                  ? 'border-[var(--cv-accent-coral)] bg-[var(--cv-coral-soft)] text-[var(--cv-accent-coral)]'
                  : 'border-[var(--cv-border-input)] bg-white text-[var(--cv-muted)] hover:text-[var(--cv-text)]'
              }`}
            >
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            <input
              type="text"
              data-testid="people-dialogue-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('dialoguePlaceholder')}
              maxLength={500}
              className="flex-1 rounded-full border border-[var(--cv-border-input)] bg-white px-4 py-2 text-sm text-[var(--cv-text)] placeholder-[var(--cv-muted)]"
            />

            <button
              type="submit"
              data-testid="people-dialogue-send"
              disabled={sending || !input.trim()}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[var(--cv-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--cv-primary-hover)] disabled:opacity-45"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">{t('dialogueSend')}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
