import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bookmark, Check, ChevronDown, Copy, MessageSquareText } from 'lucide-react';
import { getFollowUpsForQuestion, getTopicBySlug } from '../data/catalog';
import { splitAnswerSteps } from '../utils/qaEngine';
import { RichText } from './RichText';
import type { QuestionItem } from '../types/qa';

interface QuestionCardProps {
  item: QuestionItem;
  indexNumber: number;
  isExpanded: boolean;
  isLearned: boolean;
  isSaved: boolean;
  showTopicLabel?: boolean;
  onToggleExpand: (id: string) => void;
  onToggleLearned: (id: string) => void;
  onToggleSaved: (id: string) => void;
  onNotify: (message: string) => void;
}

export function QuestionCard({
  item,
  indexNumber,
  isExpanded,
  isLearned,
  isSaved,
  showTopicLabel = false,
  onToggleExpand,
  onToggleLearned,
  onToggleSaved,
  onNotify,
}: QuestionCardProps) {
  const [openFollowUps, setOpenFollowUps] = useState<Record<number, boolean>>({});

  const topic = useMemo(() => getTopicBySlug(item.topicSlug), [item.topicSlug]);
  const steps = useMemo(() => splitAnswerSteps(item.answer), [item.answer]);
  const followUps = useMemo(() => getFollowUpsForQuestion(item), [item]);

  const yearLabel = item.experienceYears === 5 ? '5+ Yrs' : item.experienceYears === 1 ? '1 Yr' : `${item.experienceYears} Yrs`;

  const handleCopySnippet = (snippet: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(snippet).then(
        () => onNotify(`Copied: ${snippet.slice(0, 36)}${snippet.length > 36 ? '…' : ''}`),
        () => onNotify('Clipboard unavailable')
      );
    }
  };

  const handleCopyFullQA = () => {
    const payload = `Q: ${item.question}\n\nA:\n${steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(payload).then(
        () => onNotify('Copied question & answer'),
        () => onNotify('Clipboard unavailable')
      );
    }
  };

  return (
    <article
      id={`q-${item.id}`}
      data-question-id={item.id}
      className={`rounded-xl bg-[var(--surface-elv)] border transition-colors duration-150 ${
        isExpanded
          ? 'border-[var(--brand-1)]/45 shadow-[var(--card-shadow-hover)]'
          : 'border-[var(--divider)] shadow-[var(--card-shadow)] hover:border-[var(--ink-3)]/50'
      }`}
    >
      <button
        type="button"
        onClick={() => onToggleExpand(item.id)}
        aria-expanded={isExpanded}
        aria-controls={`qa-body-${item.id}`}
        className="w-full text-left px-4 sm:px-5 py-4 flex items-start gap-3.5 cursor-pointer group"
      >
        <span
          className={`mt-0.5 w-7 h-7 rounded-md shrink-0 inline-flex items-center justify-center text-xs font-mono font-semibold tabular-nums transition-colors duration-150 ${
            isLearned
              ? 'bg-[var(--brand-1)] text-[var(--brand-ink)]'
              : 'bg-[var(--surface-soft)] text-[var(--ink-3)] group-hover:text-[var(--ink-1)]'
          }`}
          aria-hidden="true"
        >
          {isLearned ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : String(indexNumber).padStart(2, '0')}
        </span>

        <div className="flex-1 min-w-0">
          <h3 className="text-[15.5px] sm:text-[16px] font-semibold leading-snug text-[var(--ink-1)] pr-2">
            {item.question}
          </h3>

          {/* Clean unboxed inline metadata with typographic separators (zero pill clutter) */}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--ink-3)]">
            {showTopicLabel && topic && (
              <>
                <span className="font-medium text-[var(--ink-2)]">{topic.shortName}</span>
                <span aria-hidden="true">·</span>
              </>
            )}
            <span className="font-mono tabular-nums text-[var(--ink-2)]">{yearLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{item.difficulty}</span>
            {item.is2026Trend && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-[var(--brand-1)]">2026 Trend</span>
              </>
            )}
            {item.focusArea && (
              <>
                <span aria-hidden="true">·</span>
                <span>{item.focusArea}</span>
              </>
            )}
            {item.kind === 'edge-case' && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[var(--accent-warm)] font-medium">Edge Case</span>
              </>
            )}
            {isLearned && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-[var(--brand-1)]">Learned</span>
              </>
            )}
            {isSaved && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-[var(--accent-warm)]">Saved</span>
              </>
            )}
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 mt-1.5 shrink-0 text-[var(--ink-3)] transition-transform duration-200 ease-out ${
            isExpanded ? 'rotate-180 text-[var(--brand-1)]' : 'group-hover:text-[var(--ink-1)]'
          }`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={`qa-body-${item.id}`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-[var(--divider)] px-4 sm:px-5 pt-4 pb-5 sm:pl-[3.625rem]"
          >
            <p className="text-xs font-semibold text-[var(--ink-3)] mb-3">
              Structured interview answer
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

            {/* Interactive Follow-up Questions */}
            {followUps.length > 0 && (
              <div className="mt-5 pt-4 border-t border-[var(--divider)]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--ink-2)] mb-2.5">
                  <MessageSquareText className="w-3.5 h-3.5 text-[var(--brand-1)]" aria-hidden="true" />
                  <span>Likely interviewer follow-ups</span>
                </div>
                <div className="space-y-1.5">
                  {followUps.map((fu, idx) => {
                    const fuOpen = Boolean(openFollowUps[idx]);
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
                          aria-expanded={fuOpen}
                          className="w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-3 text-[13.5px] font-medium text-[var(--ink-1)] hover:text-[var(--brand-1)] transition-colors duration-150 cursor-pointer"
                        >
                          <span>{fu.question}</span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 shrink-0 text-[var(--ink-3)] transition-transform duration-150 ${
                              fuOpen ? 'rotate-180 text-[var(--brand-1)]' : ''
                            }`}
                            aria-hidden="true"
                          />
                        </button>
                        {fuOpen && (
                          <div className="px-3.5 pb-3 pt-0.5 text-[13.5px] leading-relaxed text-[var(--ink-2)]">
                            <RichText text={fu.answer} onCopyCode={handleCopySnippet} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action bar */}
            <div className="mt-5 pt-3.5 border-t border-[var(--divider)] flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleLearned(item.id)}
                className={`inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                  isLearned
                    ? 'bg-[var(--brand-1)] text-[var(--brand-ink)] hover:bg-[var(--brand-2)]'
                    : 'bg-[var(--surface-soft)] text-[var(--ink-1)] border border-[var(--divider)] hover:border-[var(--brand-1)] hover:text-[var(--brand-1)]'
                }`}
              >
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{isLearned ? 'Learned' : 'Mark as learned'}</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleSaved(item.id)}
                className={`inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                  isSaved
                    ? 'bg-[var(--accent-warm-soft)] text-[var(--accent-warm)] border border-[var(--accent-warm)]/40'
                    : 'bg-[var(--surface-soft)] text-[var(--ink-2)] border border-[var(--divider)] hover:border-[var(--ink-3)] hover:text-[var(--ink-1)]'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} aria-hidden="true" />
                <span>{isSaved ? 'Saved' : 'Save for review'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyFullQA}
                className="inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--ink-2)] hover:text-[var(--ink-1)] hover:bg-[var(--surface-soft)] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ml-auto"
              >
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Copy Q&amp;A</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
