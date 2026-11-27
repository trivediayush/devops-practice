import { useMemo, useState } from 'react';
import { Bookmark, Search } from 'lucide-react';
import { QUESTION_MAP } from '../data/catalog';
import { QuestionCard } from '../components/QuestionCard';
import type { QuestionItem } from '../types/qa';

interface SavedViewProps {
  savedIds: ReadonlySet<string>;
  learnedIds: ReadonlySet<string>;
  onToggleLearned: (id: string) => void;
  onToggleSaved: (id: string) => void;
  onNavigate: (hash: string) => void;
  onNotify: (msg: string) => void;
}

export function SavedView({
  savedIds,
  learnedIds,
  onToggleLearned,
  onToggleSaved,
  onNavigate,
  onNotify,
}: SavedViewProps) {
  const [query, setQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  const savedQuestions = useMemo(() => {
    const out: QuestionItem[] = [];
    for (const id of savedIds) {
      const q = QUESTION_MAP.get(id);
      if (q) out.push(q);
    }
    return out;
  }, [savedIds]);

  const filtered = useMemo(() => {
    const clean = query.toLowerCase().trim();
    if (!clean) return savedQuestions;
    return savedQuestions.filter((q) =>
      `${q.question} ${q.answer} ${q.topicSlug}`.toLowerCase().includes(clean)
    );
  }, [savedQuestions, query]);

  const handleToggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[var(--brand-1)] mb-1">
            Personal Revision Queue
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--ink-1)]">
            Saved Questions
          </h1>
          <p className="mt-1 text-sm sm:text-[15px] text-[var(--ink-2)] max-w-[60ch]">
            Questions you bookmarked for last-minute revision before an interview loop. Stored
            locally in your browser.
          </p>
        </div>
        <span className="text-xs font-mono tabular-nums text-[var(--ink-3)]">
          {savedQuestions.length} saved
        </span>
      </header>

      {savedQuestions.length === 0 ? (
        <div className="rounded-2xl bg-[var(--surface-elv)] border border-[var(--divider)] py-14 px-6 text-center">
          <div className="w-11 h-11 rounded-xl bg-[var(--surface-soft)] border border-[var(--divider)] inline-flex items-center justify-center text-[var(--ink-3)] mx-auto">
            <Bookmark className="w-5 h-5" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-base font-bold text-[var(--ink-1)]">
            No saved questions yet
          </h2>
          <p className="mt-1 text-sm text-[var(--ink-2)] max-w-md mx-auto">
            Open any question in a topic or mock interview and click &ldquo;Save for review&rdquo;
            to build your personal revision shortlist.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate('#/')}
              className="h-10 px-4 rounded-lg bg-[var(--brand-1)] text-[var(--brand-ink)] text-sm font-semibold hover:bg-[var(--brand-2)] transition-colors cursor-pointer"
            >
              Browse Topics
            </button>
            <button
              type="button"
              onClick={() => onNavigate('#/experience/1')}
              className="h-10 px-4 rounded-lg bg-[var(--surface-soft)] border border-[var(--divider)] text-[var(--ink-1)] text-sm font-semibold hover:border-[var(--brand-1)] transition-colors cursor-pointer"
            >
              Explore 1–5+ Yr Tracks
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="relative max-w-md">
            <Search
              className="w-4 h-4 text-[var(--ink-3)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter saved questions..."
              aria-label="Filter saved questions"
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-[var(--surface-elv)] border border-[var(--divider)] text-sm text-[var(--ink-1)] placeholder:text-[var(--ink-3)] focus:border-[var(--brand-1)] focus:outline-none"
            />
          </div>

          <div className="space-y-3" data-testid="saved-question-list">
            {filtered.map((item, idx) => (
              <QuestionCard
                key={item.id}
                item={item}
                indexNumber={idx + 1}
                isExpanded={expandedIds.has(item.id)}
                isLearned={learnedIds.has(item.id)}
                isSaved={savedIds.has(item.id)}
                showTopicLabel={true}
                onToggleExpand={handleToggleExpand}
                onToggleLearned={onToggleLearned}
                onToggleSaved={onToggleSaved}
                onNotify={onNotify}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
