import { Mic, MicOff, Send, Square, Film, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Character, DialogueTurn, FactTag, World } from '../contracts';
import { aiService } from '../ai/AIService';
import { BAGHDAD_KNOWLEDGE } from '../data/knowledge/baghdad-characters';
import { useT } from '../i18n/useT';
import { useAppStore } from '../stores/appStore';
import { voiceService } from '../voice/VoiceService';

interface MessageEntry {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  turn?: DialogueTurn;
}

interface DialogueDrawerProps {
  world: World;
  character: Character;
  currentLocationId: string | null;
  onClose: () => void;
  onPlayStory: (storyId: string) => void;
  onCharacterSpeaking: (speaking: boolean) => void;
  onTriggerGesture: (gesture: DialogueTurn['gesture']) => void;
}

export function DialogueDrawer({
  world,
  character,
  currentLocationId,
  onClose,
  onPlayStory,
  onCharacterSpeaking,
  onTriggerGesture,
}: DialogueDrawerProps) {
  const { settings, updateSettings, getWorldProgress, recordDialogueTurn } = useAppStore();
  const { t, loc } = useT(settings.language);
  const wp = getWorldProgress(world.id);

  const [messages, setMessages] = useState<MessageEntry[]>(() => [
    {
      id: 'greeting',
      role: 'assistant',
      text: character.greetingArabic,
      turn: {
        segments: [
          {
            text: character.greetingArabic,
            tag: 'dramatized',
            translation: character.greetingEnglish,
          },
        ],
        emotion: 'warm',
        gesture: 'welcome',
        followUps: character.suggestedQuestions.slice(0, 3),
      },
    },
  ]);

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [mode, setMode] = useState<'gemini' | 'offline'>('offline');
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [micStatus, setMicStatus] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const recSupported = voiceService.isSupportedRecognition();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    void speakTurn(character.greetingArabic);
    onTriggerGesture('welcome');

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      voiceService.stopSpeaking();
      voiceService.stopRecognition();
      onCharacterSpeaking(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character.id]);

  const speakTurn = async (arabicText: string) => {
    voiceService.setPreferences({
      preferredVoiceUri: settings.preferredVoiceUri,
      volume: settings.voiceVolume,
      muted: settings.muted,
    });
    setSpeaking(true);
    onCharacterSpeaking(true);
    await voiceService.speak(arabicText, character.voice, character.id);
    setSpeaking(false);
    onCharacterSpeaking(false);
  };

  const handleStopVoice = () => {
    voiceService.stopSpeaking();
    setSpeaking(false);
    onCharacterSpeaking(false);
  };

  const sendMessageText = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || sending) return;

    const userMsg: MessageEntry = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    const history = messages.slice(-6).map((m) => ({
      role: m.role,
      text: m.text,
    }));

    const res = await aiService.sendMessage({
      worldId: world.id,
      characterId: character.id,
      language: settings.language,
      message: trimmed,
      history,
      context: {
        currentLocationId,
        nearbyObjectIds: [],
        discoveredFactIds: wp.discoveredFacts.map((f) => f.id),
        watchedStoryIds: wp.watchedStories,
      },
      includeTranslation: settings.includeTranslation,
    });

    setMode(res.mode);
    const fullArabic = res.turn.segments.map((s) => s.text).join(' ');

    const knowledge = BAGHDAD_KNOWLEDGE[character.id];
    const unlockedFacts = (res.discoveredFactIds ?? [])
      .map((fid) => knowledge?.groundingFacts.find((f) => f.id === fid))
      .filter((f): f is NonNullable<typeof f> => Boolean(f))
      .map((f) => ({ id: f.id, text: f.text, source: f.source }));

    recordDialogueTurn(world.id, {
      isPrimaryCharacter: character.id === world.primaryCharacterId,
      characterName: loc(character.name),
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

    onTriggerGesture(res.turn.gesture);
    void speakTurn(fullArabic);
  };

  const handleToggleMic = () => {
    if (!recSupported) {
      setMicStatus(t('dialogueMicUnsupported'));
      return;
    }
    if (listening) {
      voiceService.stopRecognition();
      setListening(false);
      return;
    }

    setMicStatus(null);
    setListening(true);
    voiceService.startRecognition({
      lang: settings.speechRecognitionLang,
      onInterim: (text) => setInput(text),
      onFinal: (text) => {
        setListening(false);
        setInput(text);
        if (text) {
          setTimeout(() => void sendMessageText(text), 450);
        }
      },
      onError: (code) => {
        setListening(false);
        if (code === 'not-allowed' || code === 'service-not-allowed') {
          setMicStatus(t('dialogueMicDenied'));
        } else if (code === 'unsupported') {
          setMicStatus(t('dialogueMicUnsupported'));
        }
      },
    });
  };

  const tagLabels: Record<FactTag, string> = {
    documented: t('tagDocumented'),
    traditional: t('tagTraditional'),
    dramatized: t('tagDramatized'),
    uncertain: t('tagUncertain'),
  };

  const lastAssistantTurn = [...messages].reverse().find((m) => m.role === 'assistant')?.turn;
  const followUps = lastAssistantTurn?.followUps?.slice(0, 3) ?? [];

  return (
    <aside
      role="dialog"
      aria-label={`${t('dialogueTitle')} · ${loc(character.name)}`}
      data-testid="dialogue-drawer"
      className="cv-lapis-theme absolute start-0 end-0 bottom-0 z-30 flex max-h-[84%] flex-col overflow-hidden border-t border-[#D8AE66]/55 bg-[#0C182E]/98 shadow-2xl sm:inset-y-0 sm:start-auto sm:end-0 sm:h-full sm:max-h-full sm:w-[36%] sm:min-w-[330px] sm:max-w-[430px] sm:border-t-0 sm:border-s"
    >
      {/* Header + Portrayal Notice */}
      <div className="shrink-0 border-b border-[#D8AE66]/25 bg-[#162B4D] px-4 py-3">
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#D8AE66]/70 text-sm font-bold text-[#F7F1E1]"
              style={{ backgroundColor: character.appearance.cloakColor }}
            >
              {loc(character.name).slice(0, 1)}
            </div>
            <div>
              <h2 className="cv-display text-lg font-semibold text-[#F7F1E1]">
                {loc(character.name)}
              </h2>
              <p className="text-[11px] font-medium text-[#D8AE66]">{loc(character.title)}</p>
            </div>
          </div>

          <button
            type="button"
            data-testid="dialogue-close-btn"
            onClick={onClose}
            aria-label={t('cardClose')}
            className="cursor-pointer rounded-full p-1.5 text-[#C5D1DE] hover:bg-[#0C182E] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mandatory Portrayal Notice + Mode Chip */}
        <p className="mt-2 rounded-lg border border-[#D8AE66]/25 bg-[#0C182E] px-2.5 py-1.5 text-[11px] leading-snug text-[#C5D1DE]">
          {loc(character.portrayalNotice)}
        </p>

        <div className="mt-2.5 flex items-center justify-between text-[11px]">
          <span className="font-semibold text-[#3A9BA8]">
            {mode === 'gemini' ? t('dialogueOnlineChip') : t('dialogueOfflineChip')}
          </span>
          <label className="flex cursor-pointer items-center gap-1.5 text-[#C5D1DE]">
            <input
              type="checkbox"
              checked={settings.includeTranslation}
              onChange={(e) => updateSettings({ includeTranslation: e.target.checked })}
              className="accent-[#3A9BA8]"
            />
            <span>{t('dialogueTranslationToggle')}</span>
          </label>
        </div>
      </div>

      {/* Scrollable Arabic Conversation */}
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-4 py-3 cv-scroll">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-[14px] p-3.5 ${
              m.role === 'user'
                ? 'ms-8 border border-[#3A9BA8]/40 bg-[#162B4D] text-sm text-[#F7F1E1]'
                : 'me-2 border border-[#D8AE66]/35 bg-[#071020]'
            }`}
          >
            {m.turn ? (
              <div className="space-y-2.5">
                {m.turn.segments.map((seg, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="cv-arabic flex-1 text-base leading-relaxed text-[#F7F1E1]">
                        {seg.text}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider ${
                          seg.tag === 'documented'
                            ? 'text-[#66b88e]'
                            : seg.tag === 'traditional'
                              ? 'text-[#E8C988]'
                              : 'text-[#C5D1DE]'
                        }`}
                      >
                        [{tagLabels[seg.tag]}]
                      </span>
                    </div>
                    {settings.includeTranslation && seg.translation && (
                      <p className="text-xs leading-relaxed text-[#C5D1DE]">
                        {seg.translation}
                      </p>
                    )}
                  </div>
                ))}

                {m.turn.storyId && (
                  <button
                    type="button"
                    data-testid={`watch-story-${m.turn.storyId}`}
                    onClick={() => onPlayStory(m.turn!.storyId!)}
                    className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[#D8AE66] bg-[#162B4D] px-3 py-2 text-xs font-semibold text-[#E8C988] hover:bg-[#D8AE66] hover:text-[#071020]"
                  >
                    <Film className="h-3.5 w-3.5" />
                    <span>{t('dialogueWatchStory')}</span>
                  </button>
                )}
              </div>
            ) : (
              <p className="text-sm">{m.text}</p>
            )}
          </div>
        ))}
      </div>

      {/* Footer Suggestions & Input */}
      <div className="shrink-0 space-y-2 border-t border-[#D8AE66]/25 bg-[#162B4D] px-4 py-2.5">
        {followUps.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {followUps.map((q) => (
              <button
                key={q}
                type="button"
                disabled={sending}
                onClick={() => void sendMessageText(q)}
                className="cv-arabic cursor-pointer rounded-full border border-[#D8AE66]/45 bg-[#0C182E] px-2.5 py-1 text-xs text-[#E8C988] hover:border-[#D8AE66]"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {micStatus && <p className="text-[11px] text-[#D96B52]">{micStatus}</p>}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void sendMessageText(input);
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={handleToggleMic}
            title={listening ? t('dialogueMicListening') : t('dialogueMicHold')}
            className={`cursor-pointer rounded-full border p-2.5 ${
              listening
                ? 'border-[#D96B52] bg-[#D96B52]/20 text-[#F7F1E1]'
                : 'border-[#D8AE66]/35 bg-[#0C182E] text-[#C5D1DE] hover:text-white'
            }`}
          >
            {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>

          <input
            type="text"
            data-testid="dialogue-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('dialoguePlaceholder')}
            maxLength={500}
            className="flex-1 rounded-full border border-[#D8AE66]/35 bg-[#0C182E] px-3.5 py-2 text-sm text-[#F7F1E1] placeholder-[#C5D1DE]/65"
          />

          {speaking && (
            <button
              type="button"
              onClick={handleStopVoice}
              title={t('dialogueStopSpeaking')}
              className="cursor-pointer rounded-full border border-[#D8AE66]/40 bg-[#0C182E] p-2.5 text-[#E8C988]"
            >
              <Square className="h-4 w-4" />
            </button>
          )}

          <button
            type="submit"
            data-testid="dialogue-send-btn"
            disabled={sending || !input.trim()}
            className="cursor-pointer rounded-full bg-[#D8AE66] p-2.5 text-[#071020] hover:bg-[#E8C988] disabled:opacity-45"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

        <p className="text-[10px] leading-tight text-[#C5D1DE]/80">{t('dialogueMicNotice')}</p>
      </div>
    </aside>
  );
}
