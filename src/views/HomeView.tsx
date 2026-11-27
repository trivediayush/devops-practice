import { useMemo } from 'react';
import { ArrowRight, Mic, Search } from 'lucide-react';
import {
  ALL_QUESTIONS,
  EXPERIENCE_TRACKS,
  TOPICS,
  getQuestionsForTopic,
} from '../data/catalog';
import { computeExperienceCounts, computeProgress } from '../utils/qaEngine';
import { TopicIcon } from '../components/TopicIcon';

interface HomeViewProps {
  learnedIds: ReadonlySet<string>;
  savedCount: number;
  onNavigate: (hash: string) => void;
  onOpenSearch: () => void;
}

export function HomeView({
  learnedIds,
  savedCount,
  onNavigate,
  onOpenSearch,
}: HomeViewProps) {
  const overall = useMemo(
    () => computeProgress(ALL_QUESTIONS, learnedIds),
    [learnedIds]
  );

  const trendCount = useMemo(
    () => ALL_QUESTIONS.filter((q) => q.is2026Trend).length,
    []
  );

  const expCounts = useMemo(
    () => computeExperienceCounts(ALL_QUESTIONS),
    []
  );

  return (
    <div className="space-y-10">
      {/* Architectural Hero (Stone & Graphite + Cobalt accent — matching devops.atrivedi.online) */}
      <section className="rounded-2xl bg-[var(--surface-elv)] border border-[var(--divider)] p-5 sm:p-8 shadow-[var(--card-shadow)]">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold text-[var(--brand-1)] mb-2">
            2026 DevOps, Cloud &amp; SRE Interview Bank
          </p>
          <h1 className="text-[1.65rem] sm:text-[2.35rem] font-extrabold tracking-tight leading-[1.14] text-[var(--ink-1)] text-balance">
            Real DevOps interview questions, structured answers, every experience level.
          </h1>
          <p className="mt-3 text-[14.5px] sm:text-base text-[var(--ink-2)] leading-relaxed max-w-[62ch]">
            Practice production troubleshooting scenarios, 2026 platform and AI infrastructure trends,
            and realistic interviewer follow-ups from 1 year beginner roles through 5+ year senior and
            staff loops.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('#/mock')}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-[var(--brand-1)] text-[var(--brand-ink)] text-sm font-semibold hover:bg-[var(--brand-2)] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Mic className="w-4 h-4" aria-hidden="true" />
              <span>Start Mock Interview</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('#/experience/1')}
              className="inline-flex items-center gap-2 h-11 px-4 rounded-lg bg-[var(--surface-soft)] border border-[var(--divider)] text-[var(--ink-1)] text-sm font-semibold hover:border-[var(--brand-1)] hover:text-[var(--brand-1)] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Browse 1–5+ Yr Tracks</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onOpenSearch}
              className="inline-flex items-center gap-2 h-11 px-4 rounded-lg text-[var(--ink-2)] hover:text-[var(--ink-1)] hover:bg-[var(--surface-soft)] text-sm font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Search className="w-4 h-4" aria-hidden="true" />
              <span>Search all Q&amp;As</span>
            </button>
          </div>
        </div>

        {/* Clean 4-column tabular KPI strip */}
        <div className="mt-7 pt-6 border-t border-[var(--divider)] grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          <div>
            <p className="text-2xl font-bold font-mono tabular-nums text-[var(--ink-1)]">
              {overall.total}
            </p>
            <p className="text-xs text-[var(--ink-3)] mt-0.5">Questions &amp; Answers</p>
          </div>
          <div>
            <p className="text-2xl font-bold font-mono tabular-nums text-[var(--brand-1)]">
              {trendCount}
            </p>
            <p className="text-xs text-[var(--ink-3)] mt-0.5">2026 Trend Scenarios</p>
          </div>
          <div>
            <p className="text-2xl font-bold font-mono tabular-nums text-[var(--ink-1)]">
              {overall.learned}
              <span className="text-sm font-normal text-[var(--ink-3)] ml-1">
                ({overall.percent}%)
              </span>
            </p>
            <p className="text-xs text-[var(--ink-3)] mt-0.5">Marked as Learned</p>
          </div>
          <div>
            <p className="text-2xl font-bold font-mono tabular-nums text-[var(--ink-1)]">
              {savedCount}
            </p>
            <p className="text-xs text-[var(--ink-3)] mt-0.5">Saved for Revision</p>
          </div>
        </div>
      </section>

      {/* Experience Tracks: 1 Year -> 5+ Years */}
      <section aria-labelledby="exp-tracks-heading">
        <div className="flex flex-wrap items-end justify-between gap-2 mb-4">
          <div>
            <h2
              id="exp-tracks-heading"
              className="text-xl font-bold tracking-tight text-[var(--ink-1)]"
            >
              Practice by Experience Level
            </h2>
            <p className="text-sm text-[var(--ink-2)] mt-0.5">
              Beginner to advanced interview tracks aligned with 2026 hiring expectations.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('#/experience/1')}
            className="text-sm font-semibold text-[var(--brand-1)] hover:underline inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Open track hub</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
          {EXPERIENCE_TRACKS.map((track) => {
            const trackQs = ALL_QUESTIONS.filter((q) => q.experienceYears === track.years);
            const prog = computeProgress(trackQs, learnedIds);

            return (
              <button
                key={track.years}
                type="button"
                onClick={() => onNavigate(`#/experience/${track.years}`)}
                className="group text-left rounded-xl bg-[var(--surface-elv)] border border-[var(--divider)] p-4 shadow-[var(--card-shadow)] hover:border-[var(--brand-1)] hover:shadow-[var(--card-shadow-hover)] transition-all duration-150 flex flex-col cursor-pointer"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-base font-bold text-[var(--ink-1)] group-hover:text-[var(--brand-1)] transition-colors">
                    {track.shortLabel}
                  </span>
                  <span className="text-xs font-mono tabular-nums text-[var(--ink-3)]">
                    {expCounts[track.years]} Qs
                  </span>
                </div>
                <p className="text-xs font-medium text-[var(--brand-1)] mt-0.5">
                  {track.tier}
                </p>
                <p className="text-xs text-[var(--ink-2)] leading-relaxed mt-2 line-clamp-3 flex-1">
                  {track.summary}
                </p>
                <div className="mt-4">
                  <div className="h-[3px] w-full rounded-full bg-[var(--divider)] overflow-hidden">
                    <div
                      className="h-full bg-[var(--brand-1)] transition-all duration-300"
                      style={{ width: `${prog.percent}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11.5px] font-mono tabular-nums text-[var(--ink-3)]">
                    <span>{prog.learned}/{prog.total} learned</span>
                    <span>{prog.percent}%</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* All 12 Topics Grid */}
      <section aria-labelledby="topics-heading">
        <div className="mb-4">
          <h2
            id="topics-heading"
            className="text-xl font-bold tracking-tight text-[var(--ink-1)]"
          >
            Browse by Topic
          </h2>
          <p className="text-sm text-[var(--ink-2)] mt-0.5">
            12 core DevOps, Cloud, Security, Platform, and AI Infrastructure question banks.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {TOPICS.map((topic) => {
            const qs = getQuestionsForTopic(topic.slug);
            const prog = computeProgress(qs, learnedIds);
            const topic2026Count = qs.filter((q) => q.is2026Trend).length;

            return (
              <button
                key={topic.slug}
                type="button"
                onClick={() => onNavigate(`#/t/${topic.slug}`)}
                className="group text-left rounded-xl bg-[var(--surface-elv)] border border-[var(--divider)] p-5 shadow-[var(--card-shadow)] hover:border-[var(--brand-1)] hover:shadow-[var(--card-shadow-hover)] transition-all duration-150 flex flex-col cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[var(--surface-soft)] border border-[var(--divider)] inline-flex items-center justify-center text-[var(--ink-2)] group-hover:text-[var(--brand-1)] group-hover:border-[var(--brand-1)]/40 transition-colors shrink-0">
                    <TopicIcon name={topic.icon} className="w-4 h-4" />
                  </div>
                  {topic.isNew2026 && (
                    <span className="text-xs font-semibold text-[var(--brand-1)]">
                      New for 2026
                    </span>
                  )}
                </div>

                <h3 className="mt-3.5 text-base font-bold text-[var(--ink-1)] group-hover:text-[var(--brand-1)] transition-colors">
                  {topic.name}
                </h3>
                <p className="mt-1.5 text-sm text-[var(--ink-2)] leading-relaxed flex-1">
                  {topic.blurb}
                </p>

                <div className="mt-4">
                  <div className="h-[3px] w-full rounded-full bg-[var(--divider)] overflow-hidden">
                    <div
                      className="h-full bg-[var(--brand-1)] transition-all duration-300"
                      style={{ width: `${prog.percent}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-[var(--ink-3)] font-mono tabular-nums">
                    <span>
                      {qs.length} Q&amp;As · {topic2026Count} 2026
                    </span>
                    <span>{prog.percent}% learned</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
