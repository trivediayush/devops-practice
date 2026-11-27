import { useEffect, useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { getQuestionsForTopic, getTopicBySlug } from '../data/catalog';
import { computeProgress, filterQuestions } from '../utils/qaEngine';
import { FilterBar } from '../components/FilterBar';
import { QuestionCard } from '../components/QuestionCard';
import { TopicIcon } from '../components/TopicIcon';
import type { QuestionFilterState } from '../types/qa';

interface TopicViewProps {
  slug: string;
  focusQuestionId: string | null;
  learnedIds: ReadonlySet<string>;
  savedIds: ReadonlySet<string>;
  onToggleLearned: (id: string) => void;
  onToggleSaved: (id: string) => void;
  onNavigate: (hash: string) => void;
  onNotify: (msg: string) => void;
  onConsumedFocus: () => void;
}

const DEFAULT_FILTERS: QuestionFilterState = {
  query: '',
  topicSlug: 'all',
  experienceYears: 'all',
  difficulty: 'all',
  only2026: false,
  onlyUnlearned: false,
};

const PAGE_SIZE = 35;

export function TopicView({
  slug,
  focusQuestionId,
  learnedIds,
  savedIds,
  onToggleLearned,
  onToggleSaved,
  onNavigate,
  onNotify,
  onConsumedFocus,
}: TopicViewProps) {
  const topic = useMemo(() => getTopicBySlug(slug), [slug]);
  const allTopicQuestions = useMemo(() => getQuestionsForTopic(slug), [slug]);

  const [filters, setFilters] = useState<QuestionFilterState>(DEFAULT_FILTERS);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [visibleLimit, setVisibleLimit] = useState(PAGE_SIZE);

  // Reset filters and pagination when switching topics
  useEffect(() => {
    setFilters(DEFAULT_FILTERS);
    setExpandedIds(new Set());
    setVisibleLimit(PAGE_SIZE);
  }, [slug]);

  const filtered = useMemo(
    () => filterQuestions(allTopicQuestions, filters, learnedIds),
    [allTopicQuestions, filters, learnedIds]
  );

  // Ensure deep-linked question from search is visible, expanded, and scrolled into view
  useEffect(() => {
    if (!focusQuestionId) return;
    const idx = allTopicQuestions.findIndex((q) => q.id === focusQuestionId);
    if (idx === -1) return;

    setFilters(DEFAULT_FILTERS);
    if (idx + 1 > visibleLimit) {
      setVisibleLimit(idx + 10);
    }
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.add(focusQuestionId);
      return next;
    });

    requestAnimationFrame(() => {
      const el = document.getElementById(`q-${focusQuestionId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      onConsumedFocus();
    });
  }, [focusQuestionId, allTopicQuestions, visibleLimit, onConsumedFocus]);

  if (!topic) {
    return (
      <div className="rounded-xl bg-[var(--surface-elv)] border border-[var(--divider)] p-10 text-center">
        <h1 className="text-xl font-bold text-[var(--ink-1)]">Topic not found</h1>
        <p className="text-sm text-[var(--ink-2)] mt-2">
          Choose one of the 12 DevOps interview topics from the overview.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('#/')}
          className="mt-5 h-10 px-4 rounded-lg bg-[var(--brand-1)] text-[var(--brand-ink)] text-sm font-semibold cursor-pointer"
        >
          Back to Overview
        </button>
      </div>
    );
  }

  const progress = computeProgress(allTopicQuestions, learnedIds);
  const visibleItems = filtered.slice(0, visibleLimit);
  const allVisibleExpanded =
    visibleItems.length > 0 && visibleItems.every((q) => expandedIds.has(q.id));

  const handleToggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleExpandAll = () => {
    if (allVisibleExpanded) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(visibleItems.map((q) => q.id)));
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--ink-3)]">
        <button
          type="button"
          onClick={() => onNavigate('#/')}
          className="hover:text-[var(--brand-1)] transition-colors cursor-pointer"
        >
          Topics
        </button>
        <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
        <span className="text-[var(--ink-1)] font-medium">{topic.name}</span>
      </nav>

      {/* Topic Header */}
      <header className="space-y-3">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[var(--surface-elv)] border border-[var(--divider)] inline-flex items-center justify-center text-[var(--brand-1)] shrink-0 mt-0.5">
            <TopicIcon name={topic.icon} className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--ink-1)]">
                {topic.name}
              </h1>
              {topic.isNew2026 && (
                <span className="text-xs font-semibold text-[var(--brand-1)]">
                  2026 Track
                </span>
              )}
            </div>
            <p className="mt-1 text-sm sm:text-[15px] text-[var(--ink-2)] max-w-[68ch]">
              {topic.blurb}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-1">
          <div className="flex-1 min-w-[200px] max-w-sm h-1.5 rounded-full bg-[var(--divider)] overflow-hidden">
            <div
              className="h-full bg-[var(--brand-1)] transition-all duration-300"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <span className="text-xs font-mono tabular-nums text-[var(--ink-2)]">
            {progress.learned} / {progress.total} learned ({progress.percent}%)
          </span>
        </div>
      </header>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        totalCount={allTopicQuestions.length}
        filteredCount={filtered.length}
        allExpanded={allVisibleExpanded}
        showExperienceButtons={true}
        onChange={(patch) => {
          setFilters((prev) => ({ ...prev, ...patch }));
          setVisibleLimit(PAGE_SIZE);
        }}
        onReset={() => {
          setFilters(DEFAULT_FILTERS);
          setVisibleLimit(PAGE_SIZE);
        }}
        onToggleExpandAll={handleToggleExpandAll}
      />

      {/* Questions List */}
      {visibleItems.length === 0 ? (
        <div className="rounded-xl bg-[var(--surface-elv)] border border-[var(--divider)] py-14 px-6 text-center">
          <p className="text-base font-semibold text-[var(--ink-1)]">
            No questions match your current filters
          </p>
          <p className="text-sm text-[var(--ink-2)] mt-1">
            Try clearing a filter or switching to All Years / All Levels.
          </p>
          <button
            type="button"
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="mt-4 h-9 px-4 rounded-lg bg-[var(--brand-1)] text-[var(--brand-ink)] text-xs font-semibold hover:bg-[var(--brand-2)] transition-colors cursor-pointer"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="space-y-3" data-testid="question-list">
          {visibleItems.map((item, idx) => (
            <QuestionCard
              key={item.id}
              item={item}
              indexNumber={idx + 1}
              isExpanded={expandedIds.has(item.id)}
              isLearned={learnedIds.has(item.id)}
              isSaved={savedIds.has(item.id)}
              onToggleExpand={handleToggleExpand}
              onToggleLearned={onToggleLearned}
              onToggleSaved={onToggleSaved}
              onNotify={onNotify}
            />
          ))}

          {filtered.length > visibleLimit && (
            <div className="pt-3 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleLimit((n) => n + PAGE_SIZE)}
                className="h-10 px-5 rounded-lg bg-[var(--surface-elv)] border border-[var(--divider)] text-sm font-semibold text-[var(--ink-1)] hover:border-[var(--brand-1)] hover:text-[var(--brand-1)] transition-colors cursor-pointer"
              >
                Show more questions ({filtered.length - visibleLimit} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
