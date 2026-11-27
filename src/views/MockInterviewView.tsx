import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  Bookmark,
  Check,
  ChevronDown,
  Clock,
  Eye,
  MessageSquareText,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  ALL_QUESTIONS,
  TOPICS,
  getFollowUpsForQuestion,
  getTopicBySlug,
} from '../data/catalog';
import {
  filterQuestions,
  formatTimer,
  pickMockQuestion,
  splitAnswerSteps,
} from '../utils/qaEngine';
import { RichText } from '../components/RichText';
import type { Difficulty, ExperienceYear, QuestionItem } from '../types/qa';

interface MockInterviewViewProps {
  learnedIds: ReadonlySet<string>;
  savedIds: ReadonlySet<string>;
  onToggleLearned: (id: string) => void;
  onToggleSaved: (id: string) => void;
  onNotify: (msg: string) => void;
}

export function MockInterviewView({
  learnedIds,
  savedIds,
  onToggleLearned,
  onToggleSaved,
  onNotify,
}: MockInterviewViewProps) {
  const [topicSlug, setTopicSlug] = useState<string>('all');
  const [experienceYears, setExperienceYears] = useState<ExperienceYear | 'all'>('all');
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');
  const [only2026, setOnly2026] = useState(false);

  const pool = useMemo(
    () =>
      filterQuestions(
        ALL_QUESTIONS,
        {
          query: '',
          topicSlug,
          experienceYears,
          difficulty,
          only2026,
          onlyUnlearned: false,
        },
        learnedIds
      ),
    [topicSlug, experienceYears, difficulty, only2026, learnedIds]
  );

  const [current, setCurrent] = useState<QuestionItem | null>(() =>
    pickMockQuestion(ALL_QUESTIONS)
  );
  const [revealed, setRevealed] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);
  const [sessionCount, setSessionCount] = useState(0);
  const [openFollowUps, setOpenFollowUps] = useState<Record<number, boolean>>({});

  // Pick a fresh matching question whenever filter parameters change
  useEffect(() => {
    const next = pickMockQuestion(pool, null);
    setCurrent(next);
    setRevealed(false);
    setSeconds(0);
    setTimerRunning(Boolean(next));
    setOpenFollowUps({});
  }, [topicSlug, experienceYears, difficulty, only2026]);

  // Live stopwatch
  useEffect(() => {
    if (!timerRunning || !current) return;
    const id = window.setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning, current]);

  const handleNext = () => {
    const next = pickMockQuestion(pool, current?.id ?? null);
    setCurrent(next);
    setRevealed(false);
    setSeconds(0);
    setTimerRunning(Boolean(next));
    setOpenFollowUps({});
  };

  const handleReveal = () => {
    setRevealed(true);
    setTimerRunning(false);
    setSessionCount((c) => c + 1);
  };

  const handleCopySnippet = (snippet: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(snippet).then(
        () => onNotify(`Copied: ${snippet.slice(0, 36)}${snippet.length > 36 ? '…' : ''}`),
        () => onNotify('Clipboard unavailable')
      );
    }
  };

  const topic = current ? getTopicBySlug(current.topicSlug) : undefined;
  const steps = useMemo(() => (current ? splitAnswerSteps(current.answer) : []), [current]);
  const followUps = useMemo(
    () => (current ? getFollowUpsForQuestion(current) : []),
    [current]
  );

  const isLearned = current ? learnedIds.has(current.id) : false;
  const isSaved = current ? savedIds.has(current.id) : false;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[var(--brand-1)] mb-1">
            Timed Spoken Practice
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--ink-1)]">
            Mock Interview Simulator
          </h1>
          <p className="mt-1 text-sm sm:text-[15px] text-[var(--ink-2)] max-w-[64ch]">
            Answer out loud within 90 seconds, then reveal the structured response and handle
            realistic follow-up questions.
          </p>
        </div>

        <div className="text-xs font-mono tabular-nums text-[var(--ink-3)]">
          Session reviewed: <strong className="text-[var(--ink-1)]">{sessionCount}</strong> · Pool:{' '}
          <strong className="text-[var(--ink-1)]">{pool.length}</strong> Q&amp;As
        </div>
      </header>

      {/* Filter Controls */}
      <section
        aria-label="Mock interview settings"
        className="rounded-xl bg-[var(--surface-alt)] border border-[var(--divider)] p-3.5 sm:p-4 flex flex-wrap items-center gap-2.5"
      >
        <select
          value={topicSlug}
          onChange={(e) => setTopicSlug(e.target.value)}
          aria-label="Mock topic filter"
          className="h-10 px-3 rounded-lg bg-[var(--surface-elv)] border border-[var(--divider)] text-sm text-[var(--ink-1)] focus:border-[var(--brand-1)] focus:outline-none cursor-pointer flex-1 min-w-[160px]"
        >
          <option value="all">All Topics ({TOPICS.length})</option>
          {TOPICS.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>

        <select
          value={String(experienceYears)}
          onChange={(e) =>
            setExperienceYears(e.target.value === 'all' ? 'all' : (Number(e.target.value) as ExperienceYear))
          }
          aria-label="Mock experience year filter"
          className="h-10 px-3 rounded-lg bg-[var(--surface-elv)] border border-[var(--divider)] text-sm text-[var(--ink-1)] focus:border-[var(--brand-1)] focus:outline-none cursor-pointer min-w-[140px]"
        >
          <option value="all">All Years (1–5+)</option>
          <option value="1">1 Year (Beginner)</option>
          <option value="2">2 Years (Junior–Mid)</option>
          <option value="3">3 Years (Mid-Level)</option>
          <option value="4">4 Years (Mid–Senior)</option>
          <option value="5">5+ Years (Senior / Staff)</option>
        </select>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty | 'all')}
          aria-label="Mock difficulty filter"
          className="h-10 px-3 rounded-lg bg-[var(--surface-elv)] border border-[var(--divider)] text-sm text-[var(--ink-1)] focus:border-[var(--brand-1)] focus:outline-none cursor-pointer min-w-[140px]"
        >
          <option value="all">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        <button
          type="button"
          onClick={() => setOnly2026((v) => !v)}
          aria-pressed={only2026}
          className={`inline-flex items-center gap-1.5 h-10 px-3.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            only2026
              ? 'bg-[var(--brand-1)] text-[var(--brand-ink)] border-[var(--brand-1)]'
              : 'bg-[var(--surface-elv)] text-[var(--ink-2)] border-[var(--divider)] hover:border-[var(--brand-1)]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          <span>2026 Trends</span>
        </button>
      </section>

      {/* Main Mock Stage */}
      {!current ? (
        <div className="rounded-2xl bg-[var(--surface-elv)] border border-[var(--divider)] p-12 text-center">
          <p className="text-base font-semibold text-[var(--ink-1)]">
            No questions match this filter combination
          </p>
          <p className="text-sm text-[var(--ink-2)] mt-1">
            Widen the experience year or difficulty filter to generate a mock interview prompt.
          </p>
          <button
            type="button"
            onClick={() => {
              setTopicSlug('all');
              setExperienceYears('all');
              setDifficulty('all');
              setOnly2026(false);
            }}
            className="mt-4 h-10 px-4 rounded-lg bg-[var(--brand-1)] text-[var(--brand-ink)] text-sm font-semibold cursor-pointer"
          >
            Reset mock filters
          </button>
        </div>
      ) : (
        <section
          aria-label="Current interview question"
          className="rounded-2xl bg-[var(--surface-elv)] border border-[var(--divider)] p-6 sm:p-8 shadow-[var(--card-shadow)]"
        >
          {/* Meta + Stopwatch Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--divider)]">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--ink-3)]">
              <span className="font-semibold text-[var(--ink-1)]">
                {topic?.name ?? current.topicSlug}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-[var(--ink-2)]">
                {current.experienceYears === 5
                  ? '5+ Yrs'
                  : current.experienceYears === 1
                    ? '1 Yr'
                    : `${current.experienceYears} Yrs`}
              </span>
              <span aria-hidden="true">·</span>
              <span>{current.difficulty}</span>
              {current.is2026Trend && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-[var(--brand-1)]">2026 Trend</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-lg font-mono font-bold tabular-nums text-[var(--brand-1)]">
                <Clock className="w-4 h-4" aria-hidden="true" />
                <span data-testid="mock-timer">{formatTimer(seconds)}</span>
              </span>
              <button
                type="button"
                onClick={() => setTimerRunning((r) => !r)}
                aria-label={timerRunning ? 'Pause timer' : 'Resume timer'}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[var(--divider)] text-[var(--ink-2)] hover:text-[var(--ink-1)] hover:bg-[var(--surface-soft)] cursor-pointer"
              >
                {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSeconds(0);
                  setTimerRunning(true);
                }}
                aria-label="Reset timer"
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[var(--divider)] text-[var(--ink-2)] hover:text-[var(--ink-1)] hover:bg-[var(--surface-soft)] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Question Prompt */}
          <h2 className="mt-6 text-xl sm:text-2xl font-bold leading-snug text-[var(--ink-1)] text-balance">
            {current.question}
          </h2>

          {/* Primary Controls */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {!revealed && (
              <button
                type="button"
                onClick={handleReveal}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-[var(--brand-1)] text-[var(--brand-ink)] text-sm font-semibold hover:bg-[var(--brand-2)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Eye className="w-4 h-4" aria-hidden="true" />
                <span>Reveal Answer</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className={`inline-flex items-center gap-2 h-11 px-5 rounded-lg text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                revealed
                  ? 'bg-[var(--brand-1)] text-[var(--brand-ink)] hover:bg-[var(--brand-2)]'
                  : 'bg-[var(--surface-soft)] text-[var(--ink-1)] border border-[var(--divider)] hover:border-[var(--brand-1)]'
              }`}
            >
              <span>Next Question</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {/* Revealed Answer & Follow-ups */}
          <AnimatePresence>
            {revealed && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="mt-7 pt-6 border-t border-[var(--divider)] space-y-6"
              >
                <div>
                  <p className="text-xs font-semibold text-[var(--ink-3)] mb-3">
                    Model spoken answer
                  </p>
                  <ol className="space-y-2.5 text-[15px] leading-relaxed text-[var(--ink-1)]">
                    {steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span
                          className="mt-1 w-5 h-5 rounded-full shrink-0 inline-flex items-center justify-center text-[11px] font-mono font-semibold tabular-nums bg-[var(--brand-soft)] text-[var(--brand-1)]"
                          aria-hidden="true"
                        >
                          {i + 1}
                        </span>
                        <span className="flex-1 min-w-0">
                          <RichText text={step} onCopyCode={handleCopySnippet} />
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>

                {followUps.length > 0 && (
                  <div className="pt-4 border-t border-[var(--divider)]">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--ink-2)] mb-2.5">
                      <MessageSquareText className="w-3.5 h-3.5 text-[var(--brand-1)]" aria-hidden="true" />
                      <span>Now the interviewer follows up with:</span>
                    </div>
                    <div className="space-y-1.5">
                      {followUps.map((fu, idx) => {
                        const open = Boolean(openFollowUps[idx]);
                        return (
                          <div
                            key={idx}
                            className="rounded-lg bg-[var(--surface-soft)] border border-[var(--divider)]/70"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setOpenFollowUps((prev) => ({ ...prev, [idx]: !prev[idx] }))
                              }
                              aria-expanded={open}
                              className="w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-3 text-[13.5px] font-medium text-[var(--ink-1)] hover:text-[var(--brand-1)] cursor-pointer"
                            >
                              <span>{fu.question}</span>
                              <ChevronDown
                                className={`w-3.5 h-3.5 shrink-0 text-[var(--ink-3)] transition-transform ${
                                  open ? 'rotate-180 text-[var(--brand-1)]' : ''
                                }`}
                                aria-hidden="true"
                              />
                            </button>
                            {open && (
                              <div className="px-3.5 pb-3 text-[13.5px] leading-relaxed text-[var(--ink-2)]">
                                <RichText text={fu.answer} onCopyCode={handleCopySnippet} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-[var(--divider)] flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => onToggleLearned(current.id)}
                    className={`inline-flex items-center gap-1.5 h-10 px-4 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      isLearned
                        ? 'bg-[var(--brand-1)] text-[var(--brand-ink)]'
                        : 'bg-[var(--surface-soft)] text-[var(--ink-1)] border border-[var(--divider)] hover:border-[var(--brand-1)]'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{isLearned ? 'Learned' : 'I knew this'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleSaved(current.id)}
                    className={`inline-flex items-center gap-1.5 h-10 px-4 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      isSaved
                        ? 'bg-[var(--accent-warm-soft)] text-[var(--accent-warm)] border border-[var(--accent-warm)]/40'
                        : 'bg-[var(--surface-soft)] text-[var(--ink-2)] border border-[var(--divider)] hover:text-[var(--ink-1)]'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} aria-hidden="true" />
                    <span>{isSaved ? 'Saved' : 'Save for later'}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}
    </div>
  );
}
