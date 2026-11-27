import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, Moon, Search, Sun, X } from 'lucide-react';
import { BrandEmblem } from './TopicIcon';

export type ActiveSection = 'home' | 'topic' | 'experience' | 'mock' | 'saved';

interface HeaderProps {
  activeSection: ActiveSection;
  savedCount: number;
  isDark: boolean;
  mobileNavOpen: boolean;
  onToggleMobileNav: () => void;
  onNavigate: (hash: string) => void;
  onOpenSearch: () => void;
  onToggleTheme: () => void;
}

export function Header({
  activeSection,
  savedCount,
  isDark,
  mobileNavOpen,
  onToggleMobileNav,
  onNavigate,
  onOpenSearch,
  onToggleTheme,
}: HeaderProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setScrollProgress(max > 40 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  const navLinkClass = (active: boolean) =>
    `relative py-1 text-sm font-medium transition-colors duration-150 whitespace-nowrap shrink-0 ${
      active
        ? 'text-[var(--brand-1)]'
        : 'text-[var(--ink-2)] hover:text-[var(--ink-1)]'
    }`;

  return (
    <header className="sticky top-0 z-40 h-14 bg-[var(--surface-bg)] border-b border-[var(--divider)]">
      {/* Subtle GPU-composited top reading rail matching devops.atrivedi.online */}
      <div
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 h-[2.5px] z-50 pointer-events-none"
      >
        <div
          className="h-full w-full bg-[var(--brand-1)] origin-left transition-transform duration-100 ease-out"
          style={{
            transform: `scaleX(${scrollProgress})`,
            opacity: scrollProgress > 0.01 ? 1 : 0,
          }}
        />
      </div>

      <div className="max-w-[1440px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Single-line Brand wordmark */}
        <div className="flex items-center gap-2.5 shrink-0 min-w-0">
          <button
            type="button"
            onClick={onToggleMobileNav}
            aria-label={mobileNavOpen ? 'Close topics menu' : 'Open topics menu'}
            aria-expanded={mobileNavOpen}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 -ml-2 rounded-lg text-[var(--ink-2)] hover:text-[var(--ink-1)] hover:bg-[var(--surface-soft)] transition-colors duration-150 shrink-0"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <a
            href="#/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('#/');
            }}
            className="inline-flex items-center gap-2.5 text-[var(--ink-1)] font-bold text-[15.5px] tracking-tight whitespace-nowrap shrink-0"
          >
            <BrandEmblem className="w-7 h-7 shrink-0" />
            <span>DevOps Practice</span>
          </a>
        </div>

        {/* Zone 2: Clean single-line navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-6 shrink-0"
        >
          <a
            href="#/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('#/');
            }}
            aria-current={activeSection === 'home' || activeSection === 'topic' ? 'page' : undefined}
            className={navLinkClass(activeSection === 'home' || activeSection === 'topic')}
          >
            Topics
          </a>
          <a
            href="#/experience/1"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('#/experience/1');
            }}
            aria-current={activeSection === 'experience' ? 'page' : undefined}
            className={navLinkClass(activeSection === 'experience')}
          >
            By Experience
          </a>
          <a
            href="#/mock"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('#/mock');
            }}
            aria-current={activeSection === 'mock' ? 'page' : undefined}
            className={navLinkClass(activeSection === 'mock')}
          >
            Mock Interview
          </a>
          <a
            href="#/saved"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('#/saved');
            }}
            aria-current={activeSection === 'saved' ? 'page' : undefined}
            className={navLinkClass(activeSection === 'saved')}
          >
            Saved
            {savedCount > 0 && (
              <span className="ml-1.5 text-xs font-mono tabular-nums text-[var(--ink-3)]">
                ({savedCount})
              </span>
            )}
          </a>
          <a
            href="https://devops.atrivedi.online/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 py-1 text-sm font-medium text-[var(--ink-2)] hover:text-[var(--brand-1)] transition-colors duration-150 whitespace-nowrap shrink-0"
          >
            <span>Cheatsheets</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-75" aria-hidden="true" />
          </a>
        </nav>

        {/* Zone 3: Primary Search action & Theme Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search all questions"
            className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-[var(--surface-elv)] border border-[var(--divider)] text-sm text-[var(--ink-2)] hover:border-[var(--brand-1)] hover:text-[var(--ink-1)] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Search className="w-4 h-4 text-[var(--ink-3)]" aria-hidden="true" />
            <span className="hidden sm:inline">Search Q&amp;As</span>
            <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[11px] font-mono text-[var(--ink-3)] bg-[var(--surface-soft)] rounded border border-[var(--divider)]">
              /
            </kbd>
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--divider)] bg-[var(--surface-elv)] text-[var(--ink-2)] hover:text-[var(--ink-1)] hover:border-[var(--ink-3)] transition-colors duration-150 shrink-0 cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
