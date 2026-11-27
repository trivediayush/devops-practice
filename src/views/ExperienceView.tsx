import { useEffect, useMemo, useState } from 'react';
import { ALL_QUESTIONS, EXPERIENCE_TRACKS } from '../data/catalog';
import { computeExperienceCounts, computeProgress, filterQuestions } from '../utils/qaEngine';
import { FilterBar } from '../components/FilterBar';
import { QuestionCard } from '../components/QuestionCard';
import type { ExperienceYear, QuestionFilterState } from '../types/qa';

interface ExperienceViewProps {
  selectedYear: ExperienceYear;
  learnedIds: ReadonlySet<string>;
  savedIds: ReadonlySet<string>;
  onSelectYear: (yr: ExperienceYear) => void;
  onToggleLearned: (id: string) => void;
  onToggleSaved: (id: string) => void;
  onNotify: (msg: string) => void;
}

const PAGE_SIZE = 35;

export function ExperienceView({
  selectedYear,
  learnedIds,
  savedIds,
  onSelectYear,
  onToggleLearned,
  onToggleSaved,
  onNotify,
}: ExperienceViewProps) {
  const [filters, setFilters] = useState<QuestionFilterState>({
    query: '',
    topicSlug: 'all',
    experienceYears: selectedYear,
    difficulty: 'all',
    only2026: false,
    onlyUnlearned: false,
  });

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [visibleLimit, setVisibleLimit] = useState(PAGE_SIZE);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, experienceYears: selectedYear }));
    setExpandedIds(new Set());
    setVisibleLimit(PAGE_SIZE);
  }, [selectedYear]);

  const trackMeta = useMemo(
    () => EXPERIENCE_TRACKS.find((t) => t.years === selectedYear) ?? EXPERIENCE_TRACKS[0],
    [selectedYear]
  );

  const expCounts = useMemo(() => computeExperienceCounts(ALL_QUESTIONS), []);

  const trackQuestions = useMemo(
    () => ALL_QUESTIONS.filter((q) => q.experienceYears === selectedYear),
    [selectedYear]
  );

  const trackProgress = useMemo(
    () => computeProgress(trackQuestions, learnedIds),
    [trackQuestions, learnedIds]
  );

  const filtered = useMemo(
    () => filterQuestions(trackQuestions, { ...filters, experienceYears: selectedYear }, learnedIds),
    [trackQuestions, filters, selectedYear, learnedIds]
  );

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
    if (allVisibleExpanded) setExpandedIds(new Set());
    else setExpandedIds(new Set(visibleItems.map((q) => q.id)));
  };

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <div>
          <p className="text-xs font-semibold text-[var(--brand-1)] mb-1">
            Beginner to Advanced · 2026 Interview Tracks
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--ink-1)]">
            DevOps Questions by Experience
          </h1>
          <p className="mt-1 text-sm sm:text-[15px] text-[var(--ink-2)] max-w-[66ch]">
            Switch between 1, 2, 3, 4, and 5+ year tracks to focus on the exact depth interviewers
            test at your level.
          </p>
        </div>

        {/* 5-Year Track Selector Tabs */}
        <div
          role="tablist"
          aria-label="Experience years"
          className="grid grid-cols-2 sm:grid-cols-5 gap-2"
        >
          {EXPERIENCE_TRACKS.map((track) => {
            const active = track.years === selectedYear;
            return (
              <button
                key={track.years}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onSelectYear(track.years)}
                className={`text-left px-3.5 py-3 rounded-xl border transition-all duration-150 cursor-pointer ${
                  active
                    ? 'bg-[var(--brand-1)] text-[var(--brand-ink)] border-[var(--brand-1)] shadow-sm'
                    : 'bg-[var(--surface-elv)] text-[var(--ink-1)] border-[var(--divider)] hover:border-[var(--brand-1)]'
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-bold whitespace-nowrap">{track.shortLabel}</span>
                  <span
                    className={`text-xs font-mono tabular-nums ${
                      active ? 'opacity-90' : 'text-[var(--ink-3)]'
                    }`}
                  >
                    {expCounts[track.years]}
                  </span>
                </div>
                <p
                  className={`text-[11.5px] mt-0.5 truncate ${
                    active ? 'opacity-90' : 'text-[var(--ink-3)]'
                  }`}
                >
                  {track.tier}
                </p>
              </button>
            );
          })}
        </div>

        {/* Active Track Summary Card */}
        <div className="rounded-xl bg-[var(--surface-elv)] border border-[var(--divider)] p-4 sm:p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-base font-bold text-[var(--ink-1)]">
              {trackMeta.label} · {trackMeta.tier}
            </h2>
            <span className="text-xs font-mono tabular-nums text-[var(--ink-2)]">
              {trackProgress.learned} / {trackProgress.total} learned ({trackProgress.percent}%)
            </span>
          </div>
          <p className="text-sm text-[var(--ink-2)] mt-1">{trackMeta.summary}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[var(--ink-3)]">
            <span className="font-semibold text-[var(--ink-2)]">Core focus:</span>
            {trackMeta.focusSkills.map((skill, idx) => (
              <span key={skill} className="inline-flex items-center gap-2.5">
                {idx > 0 && <span aria-hidden="true">·</span>}
                <span>{skill}</span>
              </span>
            ))}
          </div>
          <div className="mt-3.5 h-1.5 w-full rounded-full bg-[var(--surface-soft)] overflow-hidden">
            <div
              className="h-full bg-[var(--brand-1)] transition-all duration-300"
              style={{ width: `${trackProgress.percent}%` }}
            />
          </div>
        </div>
      </header>

      <FilterBar
        filters={filters}
        totalCount={trackQuestions.length}
        filteredCount={filtered.length}
        allExpanded={allVisibleExpanded}
        showTopicSelect={true}
        showExperienceButtons={false}
        onChange={(patch) => {
          setFilters((prev) => ({ ...prev, ...patch, experienceYears: selectedYear }));
          setVisibleLimit(PAGE_SIZE);
        }}
        onReset={() => {
          setFilters({
            query: '',
            topicSlug: 'all',
            experienceYears: selectedYear,
            difficulty: 'all',
            only2026: false,
            onlyUnlearned: false,
          });
          setVisibleLimit(PAGE_SIZE);
        }}
        onToggleExpandAll={handleToggleExpandAll}
      />

      {visibleItems.length === 0 ? (
        <div className="rounded-xl bg-[var(--surface-elv)] border border-[var(--divider)] py-14 px-6 text-center">
          <p className="text-base font-semibold text-[var(--ink-1)]">
            No {trackMeta.shortLabel} questions match these filters
          </p>
          <p className="text-sm text-[var(--ink-2)] mt-1">
            Reset topic or difficulty filters to see all {trackQuestions.length} questions in this track.
          </p>
          <button
            type="button"
            onClick={() =>
              setFilters({
                query: '',
                topicSlug: 'all',
                experienceYears: selectedYear,
                difficulty: 'all',
                only2026: false,
                onlyUnlearned: false,
              })
            }
            className="mt-4 h-9 px-4 rounded-lg bg-[var(--brand-1)] text-[var(--brand-ink)] text-xs font-semibold cursor-pointer"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="space-y-3" data-testid="experience-question-list">
          {visibleItems.map((item, idx) => (
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
