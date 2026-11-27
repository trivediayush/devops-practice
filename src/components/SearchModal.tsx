import { useEffect, useMemo, useRef, useState } from 'react';
import { CornerDownLeft, Search, X } from 'lucide-react';
import { ALL_QUESTIONS, TOPICS } from '../data/catalog';
import { searchQuestions } from '../utils/qaEngine';
import type { QuestionItem } from '../types/qa';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelectQuestion: (item: QuestionItem) => void;
}

const SUGGESTIONS = ['Karpenter', 'Gateway API', 'Cilium eBPF', 'Crossplane', 'Cosign', 'OOMKilled', 'ndots:5', 'OpenTelemetry'];

export function SearchModal({ open, onClose, onSelectQuestion }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const topicNameMap = useMemo(() => new Map(TOPICS.map((t) => [t.slug, t.shortName])), []);

  const results = useMemo(
    () => searchQuestions(ALL_QUESTIONS, query, topicNameMap, 24),
    [query, topicNameMap]
  );

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  if (!open) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown' && results.length > 0) {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp' && results.length > 0) {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && results[activeIndex]) {
      e.preventDefault();
      onSelectQuestion(results[activeIndex]);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 bg-black/55"
      role="dialog"
      aria-modal="true"
      aria-label="Search interview questions"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={handleKeyDown}
    >
      <div className="w-full max-w-2xl rounded-xl bg-[var(--surface-elv)] border border-[var(--divider)] shadow-2xl overflow-hidden flex flex-col max-h-[76vh]">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--divider)]">
          <Search className="w-4 h-4 text-[var(--ink-3)] shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 490+ DevOps Q&As (e.g. Karpenter, OOMKilled, state lock, Cosign)..."
            aria-label="Search all questions"
            className="flex-1 min-w-0 bg-transparent text-[15px] text-[var(--ink-1)] placeholder:text-[var(--ink-3)] focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[var(--ink-3)] hover:text-[var(--ink-1)] hover:bg-[var(--surface-soft)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results or Quick Suggestions */}
        <div className="overflow-y-auto p-2 flex-1">
          {!query.trim() ? (
            <div className="p-3">
              <p className="text-xs font-semibold text-[var(--ink-3)] mb-2.5">
                Popular 2026 interview topics
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--surface-soft)] text-[var(--ink-2)] border border-[var(--divider)] hover:border-[var(--brand-1)] hover:text-[var(--brand-1)] transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-sm text-[var(--ink-3)]">
              No matching questions for &ldquo;{query}&rdquo;. Try another keyword.
            </div>
          ) : (
            <ul role="listbox" aria-label="Search results" className="space-y-1">
              {results.map((item, idx) => {
                const isSelected = idx === activeIndex;
                const yr = item.experienceYears === 5 ? '5+ Yrs' : item.experienceYears === 1 ? '1 Yr' : `${item.experienceYears} Yrs`;
                return (
                  <li key={item.id} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => {
                        onSelectQuestion(item);
                        onClose();
                      }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-lg transition-colors flex items-start justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--brand-soft)] text-[var(--ink-1)]'
                          : 'hover:bg-[var(--surface-soft)] text-[var(--ink-1)]'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-snug line-clamp-2">
                          {item.question}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--ink-3)]">
                          <span>{topicNameMap.get(item.topicSlug) ?? item.topicSlug}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{yr}</span>
                          <span aria-hidden="true">·</span>
                          <span>{item.difficulty}</span>
                          {item.is2026Trend && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-[var(--brand-1)] font-medium">2026 Trend</span>
                            </>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <CornerDownLeft className="w-4 h-4 mt-1 shrink-0 text-[var(--brand-1)]" aria-hidden="true" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2.5 border-t border-[var(--divider)] bg-[var(--surface-alt)] flex items-center justify-between text-xs text-[var(--ink-3)]">
          <span>Use ↑↓ arrows and Enter to jump directly to a Q&amp;A</span>
          <span className="font-mono tabular-nums">{results.length > 0 ? `${results.length} shown` : `${ALL_QUESTIONS.length} total`}</span>
        </div>
      </div>
    </div>
  );
}
