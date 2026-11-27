import {
  ArrowUpRight,
  Bookmark,
  Compass,
  GraduationCap,
  Home,
  Mic,
  X,
} from 'lucide-react';
import { TOPICS, getQuestionsForTopic } from '../data/catalog';
import { computeProgress } from '../utils/qaEngine';
import { TopicIcon } from './TopicIcon';
import type { ActiveSection } from './Header';

interface SidebarProps {
  activeSection: ActiveSection;
  activeTopicSlug: string | null;
  learnedIds: ReadonlySet<string>;
  savedCount: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onNavigate: (hash: string) => void;
}

export function Sidebar({
  activeSection,
  activeTopicSlug,
  learnedIds,
  savedCount,
  mobileOpen,
  onCloseMobile,
  onNavigate,
}: SidebarProps) {
  const handleLink = (hash: string) => {
    onNavigate(hash);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between lg:hidden px-4 py-3 border-b border-[var(--divider)]">
        <span className="text-sm font-semibold text-[var(--ink-1)]">Navigation</span>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-[var(--ink-2)] hover:bg-[var(--surface-soft)]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {/* Practice views */}
        <div>
          <p className="px-2.5 mb-1.5 text-xs font-semibold text-[var(--ink-3)]">
            Study Modes
          </p>
          <div className="space-y-0.5">
            <SidebarNavButton
              active={activeSection === 'home'}
              onClick={() => handleLink('#/')}
              icon={<Home className="w-4 h-4" aria-hidden="true" />}
              label="Overview"
            />
            <SidebarNavButton
              active={activeSection === 'experience'}
              onClick={() => handleLink('#/experience/1')}
              icon={<GraduationCap className="w-4 h-4" aria-hidden="true" />}
              label="By Experience (1–5+ Yrs)"
            />
            <SidebarNavButton
              active={activeSection === 'mock'}
              onClick={() => handleLink('#/mock')}
              icon={<Mic className="w-4 h-4" aria-hidden="true" />}
              label="Mock Interview"
            />
            <SidebarNavButton
              active={activeSection === 'saved'}
              onClick={() => handleLink('#/saved')}
              icon={<Bookmark className="w-4 h-4" aria-hidden="true" />}
              label="Saved Q&As"
              meta={String(savedCount)}
            />
          </div>
        </div>

        {/* All 12 Topics */}
        <div>
          <div className="px-2.5 mb-1.5 flex items-center justify-between">
            <p className="text-xs font-semibold text-[var(--ink-3)]">
              Topics
            </p>
            <span className="text-xs font-mono tabular-nums text-[var(--ink-3)]">
              {TOPICS.length}
            </span>
          </div>

          <div className="space-y-0.5">
            {TOPICS.map((topic) => {
              const qs = getQuestionsForTopic(topic.slug);
              const prog = computeProgress(qs, learnedIds);
              const isActive = activeSection === 'topic' && activeTopicSlug === topic.slug;

              return (
                <button
                  key={topic.slug}
                  type="button"
                  onClick={() => handleLink(`#/t/${topic.slug}`)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors duration-150 cursor-pointer group ${
                    isActive
                      ? 'bg-[var(--brand-soft)] text-[var(--brand-1)] font-semibold'
                      : 'text-[var(--ink-2)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink-1)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`shrink-0 ${
                        isActive ? 'text-[var(--brand-1)]' : 'text-[var(--ink-3)] group-hover:text-[var(--ink-1)]'
                      }`}
                    >
                      <TopicIcon name={topic.icon} className="w-4 h-4" />
                    </span>
                    <span className="text-[13px] truncate flex-1">{topic.shortName}</span>
                    <span className="text-[11px] font-mono tabular-nums text-[var(--ink-3)] shrink-0">
                      {prog.learned}/{prog.total}
                    </span>
                  </div>
                  <div className="mt-1 h-[2px] w-full rounded-full bg-[var(--divider)] overflow-hidden">
                    <div
                      className="h-full bg-[var(--brand-1)] transition-all duration-300"
                      style={{ width: `${prog.percent}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Parent platform reference */}
      <div className="p-3 border-t border-[var(--divider)]">
        <a
          href="https://devops.atrivedi.online/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-[var(--surface-elv)] border border-[var(--divider)] text-xs font-medium text-[var(--ink-2)] hover:border-[var(--brand-1)] hover:text-[var(--brand-1)] transition-colors duration-150"
        >
          <span className="inline-flex items-center gap-2 truncate">
            <Compass className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">devops.atrivedi.online</span>
          </span>
          <ArrowUpRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        </a>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sticky rail */}
      <aside
        aria-label="Topics and study modes"
        className="hidden lg:block w-[268px] shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] bg-[var(--surface-alt)] border-r border-[var(--divider)]"
      >
        {navContent}
      </aside>

      {/* Mobile slide-over drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-[min(85vw,310px)] h-full bg-[var(--surface-alt)] border-r border-[var(--divider)] shadow-2xl">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}

interface SidebarNavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  meta?: string;
}

function SidebarNavButton({ active, onClick, icon, label, meta }: SidebarNavButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] transition-colors duration-150 cursor-pointer ${
        active
          ? 'bg-[var(--brand-soft)] text-[var(--brand-1)] font-semibold'
          : 'text-[var(--ink-2)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink-1)]'
      }`}
    >
      <span className={active ? 'text-[var(--brand-1)]' : 'text-[var(--ink-3)]'}>{icon}</span>
      <span className="truncate flex-1 text-left">{label}</span>
      {meta !== undefined && (
        <span className="text-xs font-mono tabular-nums text-[var(--ink-3)]">{meta}</span>
      )}
    </button>
  );
}
