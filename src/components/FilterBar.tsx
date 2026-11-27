import { ChevronsDownUp, ChevronsUpDown, RotateCcw, Search, Sparkles } from 'lucide-react';
import { TOPICS } from '../data/catalog';
import type { Difficulty, ExperienceYear, QuestionFilterState } from '../types/qa';

interface FilterBarProps {
  filters: QuestionFilterState;
  totalCount: number;
  filteredCount: number;
  allExpanded: boolean;
  showTopicSelect?: boolean;
  showExperienceButtons?: boolean;
  onChange: (patch: Partial<QuestionFilterState>) => void;
  onReset: () => void;
  onToggleExpandAll: () => void;
}

const EXPERIENCE_OPTIONS: Array<{ value: ExperienceYear | 'all'; label: string }> = [
  { value: 'all', label: 'All Years' },
  { value: 1, label: '1 Yr' },
  { value: 2, label: '2 Yrs' },
  { value: 3, label: '3 Yrs' },
  { value: 4, label: '4 Yrs' },
  { value: 5, label: '5+ Yrs' },
];

const DIFFICULTY_OPTIONS: Array<{ value: Difficulty | 'all'; label: string }> = [
  { value: 'all', label: 'All Levels' },
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
];

export function FilterBar({
  filters,
  totalCount,
  filteredCount,
  allExpanded,
  showTopicSelect = false,
  showExperienceButtons = true,
  onChange,
  onReset,
  onToggleExpandAll,
}: FilterBarProps) {
  const hasActiveFilters =
    filters.query.trim() !== '' ||
    (showTopicSelect && filters.topicSlug !== 'all') ||
    (showExperienceButtons && filters.experienceYears !== 'all') ||
    filters.difficulty !== 'all' ||
    filters.only2026 ||
    filters.onlyUnlearned;

  return (
    <section
      aria-label="Filter questions"
      className="rounded-xl bg-[var(--surface-alt)] border border-[var(--divider)] p-3.5 sm:p-4 space-y-3"
    >
      {/* Row 1: Search input + optional topic selector + quick toggles */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1 min-w-0">
          <Search
            className="w-4 h-4 text-[var(--ink-3)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => onChange({ query: e.target.value })}
            placeholder="Filter by keyword, command, or concept..."
            aria-label="Filter questions by keyword"
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-[var(--surface-elv)] border border-[var(--divider)] text-sm text-[var(--ink-1)] placeholder:text-[var(--ink-3)] focus:border-[var(--brand-1)] focus:outline-none transition-colors"
          />
        </div>

        {showTopicSelect && (
          <select
            value={filters.topicSlug}
            onChange={(e) => onChange({ topicSlug: e.target.value })}
            aria-label="Filter by topic"
            className="h-10 px-3 rounded-lg bg-[var(--surface-elv)] border border-[var(--divider)] text-sm text-[var(--ink-1)] focus:border-[var(--brand-1)] focus:outline-none cursor-pointer sm:w-48 shrink-0"
          >
            <option value="all">All Topics ({TOPICS.length})</option>
            {TOPICS.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.shortName}
              </option>
            ))}
          </select>
        )}

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onChange({ only2026: !filters.only2026 })}
            aria-pressed={filters.only2026}
            className={`inline-flex items-center gap-1.5 h-10 px-3.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              filters.only2026
                ? 'bg-[var(--brand-1)] text-[var(--brand-ink)] border-[var(--brand-1)]'
                : 'bg-[var(--surface-elv)] text-[var(--ink-2)] border-[var(--divider)] hover:border-[var(--brand-1)] hover:text-[var(--ink-1)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>2026 Trends</span>
          </button>

          <button
            type="button"
            onClick={() => onChange({ onlyUnlearned: !filters.onlyUnlearned })}
            aria-pressed={filters.onlyUnlearned}
            className={`inline-flex items-center h-10 px-3.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              filters.onlyUnlearned
                ? 'bg-[var(--ink-1)] text-[var(--surface-bg)] border-[var(--ink-1)]'
                : 'bg-[var(--surface-elv)] text-[var(--ink-2)] border-[var(--divider)] hover:border-[var(--ink-3)] hover:text-[var(--ink-1)]'
            }`}
          >
            Unlearned
          </button>
        </div>
      </div>

      {/* Row 2: Experience Year segmented buttons + Difficulty segmented buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          {showExperienceButtons && (
            <div
              role="group"
              aria-label="Filter by years of experience"
              className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[var(--surface-elv)] border border-[var(--divider)]"
            >
              {EXPERIENCE_OPTIONS.map((opt) => {
                const active = filters.experienceYears === opt.value;
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => onChange({ experienceYears: opt.value })}
                    aria-pressed={active}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-[var(--brand-1)] text-[var(--brand-ink)] font-semibold'
                        : 'text-[var(--ink-2)] hover:text-[var(--ink-1)] hover:bg-[var(--surface-soft)]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}

          <div
            role="group"
            aria-label="Filter by difficulty level"
            className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[var(--surface-elv)] border border-[var(--divider)]"
          >
            {DIFFICULTY_OPTIONS.map((opt) => {
              const active = filters.difficulty === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange({ difficulty: opt.value })}
                  aria-pressed={active}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[var(--ink-1)] text-[var(--surface-bg)] font-semibold'
                      : 'text-[var(--ink-2)] hover:text-[var(--ink-1)] hover:bg-[var(--surface-soft)]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Result count & Expand/Reset actions */}
        <div className="flex items-center gap-3 text-xs text-[var(--ink-3)] ml-auto">
          <span className="font-mono tabular-nums">
            Showing <strong className="text-[var(--ink-1)] font-semibold">{filteredCount}</strong> of {totalCount}
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--brand-1)] hover:underline cursor-pointer whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3 h-3" aria-hidden="true" />
              <span>Reset</span>
            </button>
          )}

          {filteredCount > 0 && (
            <button
              type="button"
              onClick={onToggleExpandAll}
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--ink-2)] hover:text-[var(--ink-1)] cursor-pointer whitespace-nowrap shrink-0"
            >
              {allExpanded ? (
                <>
                  <ChevronsDownUp className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Collapse all</span>
                </>
              ) : (
                <>
                  <ChevronsUpDown className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Expand visible</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
