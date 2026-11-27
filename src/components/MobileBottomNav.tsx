import { Bookmark, GraduationCap, Home, Mic } from 'lucide-react';
import type { ActiveSection } from './Header';

interface MobileBottomNavProps {
  activeSection: ActiveSection;
  savedCount: number;
  onNavigate: (hash: string) => void;
}

export function MobileBottomNav({
  activeSection,
  savedCount,
  onNavigate,
}: MobileBottomNavProps) {
  const items: Array<{
    key: ActiveSection;
    label: string;
    hash: string;
    icon: React.ReactNode;
    active: boolean;
  }> = [
    {
      key: 'home',
      label: 'Topics',
      hash: '#/',
      icon: <Home className="w-4 h-4" aria-hidden="true" />,
      active: activeSection === 'home' || activeSection === 'topic',
    },
    {
      key: 'experience',
      label: 'Experience',
      hash: '#/experience/1',
      icon: <GraduationCap className="w-4 h-4" aria-hidden="true" />,
      active: activeSection === 'experience',
    },
    {
      key: 'mock',
      label: 'Mock',
      hash: '#/mock',
      icon: <Mic className="w-4 h-4" aria-hidden="true" />,
      active: activeSection === 'mock',
    },
    {
      key: 'saved',
      label: savedCount > 0 ? `Saved (${savedCount})` : 'Saved',
      hash: '#/saved',
      icon: <Bookmark className="w-4 h-4" aria-hidden="true" />,
      active: activeSection === 'saved',
    },
  ];

  return (
    <nav
      aria-label="Mobile quick navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-14 bg-[var(--surface-elv)] border-t border-[var(--divider)] flex items-stretch"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onNavigate(item.hash)}
          aria-current={item.active ? 'page' : undefined}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors cursor-pointer ${
            item.active
              ? 'text-[var(--brand-1)]'
              : 'text-[var(--ink-3)] hover:text-[var(--ink-1)]'
          }`}
        >
          {item.icon}
          <span className="whitespace-nowrap">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
