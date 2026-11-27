import { useCallback, useEffect, useMemo, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { Analytics } from '@vercel/analytics/react';
import { ArrowUpRight } from 'lucide-react';
import { Header, type ActiveSection } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SearchModal } from './components/SearchModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { HomeView } from './views/HomeView';
import { TopicView } from './views/TopicView';
import { ExperienceView } from './views/ExperienceView';
import { MockInterviewView } from './views/MockInterviewView';
import { SavedView } from './views/SavedView';
import type { ExperienceYear, QuestionItem } from './types/qa';

interface RouteState {
  section: ActiveSection;
  topicSlug: string | null;
  experienceYear: ExperienceYear;
}

function parseHash(rawHash: string): RouteState {
  const parts = rawHash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts[0] === 't' && parts[1]) {
    return { section: 'topic', topicSlug: parts[1], experienceYear: 1 };
  }
  if (parts[0] === 'experience') {
    const parsed = Number(parts[1]);
    const yr: ExperienceYear =
      parsed === 1 || parsed === 2 || parsed === 3 || parsed === 4 || parsed === 5 ? parsed : 1;
    return { section: 'experience', topicSlug: null, experienceYear: yr };
  }
  if (parts[0] === 'mock') {
    return { section: 'mock', topicSlug: null, experienceYear: 1 };
  }
  if (parts[0] === 'saved') {
    return { section: 'saved', topicSlug: null, experienceYear: 1 };
  }
  return { section: 'home', topicSlug: null, experienceYear: 1 };
}

function loadIdSet(key: string, legacyKey?: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set(parsed.map(String));
    }
    // Seamlessly migrate legacy numeric IDs ('done'/'saved' -> 'leg-ID')
    if (legacyKey) {
      const oldRaw = localStorage.getItem(legacyKey);
      if (oldRaw) {
        const oldParsed = JSON.parse(oldRaw);
        if (Array.isArray(oldParsed)) {
          return new Set(oldParsed.map((x) => (typeof x === 'number' ? `leg-${x}` : String(x))));
        }
      }
    }
  } catch {
    // ignore storage quota / privacy mode errors
  }
  return new Set();
}

export default function App() {
  const [route, setRoute] = useState<RouteState>(() => parseHash(window.location.hash));
  const [learnedIds, setLearnedIds] = useState<Set<string>>(() => loadIdSet('dp_learned', 'done'));
  const [savedIds, setSavedIds] = useState<Set<string>>(() => loadIdSet('dp_saved', 'saved'));
  const [isDark, setIsDark] = useState<boolean>(() =>
    document.documentElement.classList.contains('dark')
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [focusQuestionId, setFocusQuestionId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Hash navigation listener
  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseHash(window.location.hash));
      setMobileNavOpen(false);
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Persist learned & saved progress
  useEffect(() => {
    try {
      localStorage.setItem('dp_learned', JSON.stringify([...learnedIds]));
    } catch {
      // ignore
    }
  }, [learnedIds]);

  useEffect(() => {
    try {
      localStorage.setItem('dp_saved', JSON.stringify([...savedIds]));
    } catch {
      // ignore
    }
  }, [savedIds]);

  // Global keyboard shortcuts: / or Cmd/Ctrl+K opens search
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === '/' && !isTyping && !searchOpen) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [searchOpen]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2000);
    return () => window.clearTimeout(id);
  }, [toast]);

  const notify = useCallback((message: string) => {
    setToast(message);
  }, []);

  const navigate = useCallback((hash: string) => {
    if (window.location.hash === hash) {
      setRoute(parseHash(hash));
      setMobileNavOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.location.hash = hash;
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', next ? '#1b1d22' : '#2558d9');
      try {
        localStorage.setItem('dp_theme', next ? 'dark' : 'light');
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const toggleLearned = useCallback((id: string) => {
    setLearnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSaved = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setToast('Removed from saved');
      } else {
        next.add(id);
        setToast('Saved for revision');
      }
      return next;
    });
  }, []);

  const handleSelectSearchQuestion = useCallback(
    (item: QuestionItem) => {
      setFocusQuestionId(item.id);
      navigate(`#/t/${item.topicSlug}`);
    },
    [navigate]
  );

  const handleConsumedFocus = useCallback(() => {
    setFocusQuestionId(null);
  }, []);

  const savedCount = useMemo(() => savedIds.size, [savedIds]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen flex flex-col bg-[var(--surface-bg)] text-[var(--ink-1)]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[var(--brand-1)] focus:text-[var(--brand-ink)] focus:text-sm focus:font-semibold"
        >
          Skip to main content
        </a>

        <Header
          activeSection={route.section}
          savedCount={savedCount}
          isDark={isDark}
          mobileNavOpen={mobileNavOpen}
          onToggleMobileNav={() => setMobileNavOpen((o) => !o)}
          onNavigate={navigate}
          onOpenSearch={() => setSearchOpen(true)}
          onToggleTheme={toggleTheme}
        />

        <div className="flex-1 w-full max-w-[1440px] mx-auto flex min-w-0">
          <Sidebar
            activeSection={route.section}
            activeTopicSlug={route.topicSlug}
            learnedIds={learnedIds}
            savedCount={savedCount}
            mobileOpen={mobileNavOpen}
            onCloseMobile={() => setMobileNavOpen(false)}
            onNavigate={navigate}
          />

          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 min-w-0 px-4 sm:px-6 lg:px-10 pt-6 sm:pt-8 pb-24 md:pb-14 focus:outline-none"
          >
            <div className="max-w-[980px] mx-auto">
              {route.section === 'home' && (
                <HomeView
                  learnedIds={learnedIds}
                  savedCount={savedCount}
                  onNavigate={navigate}
                  onOpenSearch={() => setSearchOpen(true)}
                />
              )}

              {route.section === 'topic' && route.topicSlug && (
                <TopicView
                  slug={route.topicSlug}
                  focusQuestionId={focusQuestionId}
                  learnedIds={learnedIds}
                  savedIds={savedIds}
                  onToggleLearned={toggleLearned}
                  onToggleSaved={toggleSaved}
                  onNavigate={navigate}
                  onNotify={notify}
                  onConsumedFocus={handleConsumedFocus}
                />
              )}

              {route.section === 'experience' && (
                <ExperienceView
                  selectedYear={route.experienceYear}
                  learnedIds={learnedIds}
                  savedIds={savedIds}
                  onSelectYear={(yr) => navigate(`#/experience/${yr}`)}
                  onToggleLearned={toggleLearned}
                  onToggleSaved={toggleSaved}
                  onNotify={notify}
                />
              )}

              {route.section === 'mock' && (
                <MockInterviewView
                  learnedIds={learnedIds}
                  savedIds={savedIds}
                  onToggleLearned={toggleLearned}
                  onToggleSaved={toggleSaved}
                  onNotify={notify}
                />
              )}

              {route.section === 'saved' && (
                <SavedView
                  savedIds={savedIds}
                  learnedIds={learnedIds}
                  onToggleLearned={toggleLearned}
                  onToggleSaved={toggleSaved}
                  onNavigate={navigate}
                  onNotify={notify}
                />
              )}

              {/* Quiet Editorial Footer */}
              <footer className="mt-14 pt-6 border-t border-[var(--divider)] flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--ink-3)]">
                <span>DevOps Practice · 2026 Interview Q&amp;A Handbook</span>
                <a
                  href="https://devops.atrivedi.online/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-[var(--ink-2)] hover:text-[var(--brand-1)] transition-colors"
                >
                  <span>Companion to devops.atrivedi.online</span>
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </footer>
            </div>
          </main>
        </div>

        <MobileBottomNav
          activeSection={route.section}
          savedCount={savedCount}
          onNavigate={navigate}
        />

        <SearchModal
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          onSelectQuestion={handleSelectSearchQuestion}
        />

        {/* Accessible Toast Feedback */}
        {toast && (
          <div
            role="status"
            aria-live="polite"
            className="fixed left-1/2 -translate-x-1/2 bottom-20 md:bottom-6 z-50 px-4 py-2 rounded-lg bg-[var(--ink-1)] text-[var(--surface-bg)] text-xs font-semibold shadow-lg pointer-events-none"
          >
            {toast}
          </div>
        )}

        <Analytics />
      </div>
    </MotionConfig>
  );
}
