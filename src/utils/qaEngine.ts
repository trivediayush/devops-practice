import type { ExperienceYear, QuestionFilterState, QuestionItem } from '../types/qa';

export interface TextToken {
  type: 'text' | 'code';
  value: string;
}

const CLI_PATTERN =
  /(?<![./\w-])((?:kubectl|docker|terraform|tofu|aws|df|du|lsof|journalctl|systemctl|ss|curl|dig|git|chmod|chown|find|logrotate|usermod|visudo|openssl|tcpdump|helm|ansible|etcdctl|cilium|argocd|cosign|trivy|syft|grype|kyverno|nc|netstat|nstat|runqlat|biolatency|tcpretrans|tcpconnect|ssh-keyscan|ssh|scp|rsync|crictl|podman|flux|vault|kustomize)\b(?:\s+(?:--?[\w-]+|[\w\-<>/.=:*$%|+~]+)){0,4})/g;

/**
 * Splits a spoken interview answer into clean, scannable numbered steps
 * while preserving decimal numbers (e.g. 1.29), flags, and common abbreviations.
 */
export function splitAnswerSteps(answer: string): string[] {
  const trimmed = answer.trim();
  if (!trimmed) return [];

  // Protect common abbreviations and version numbers before splitting on sentence endings
  const placeholder = '\u0000';
  const protectedText = trimmed
    .replace(/\b(e\.g|i\.e|vs|etc)\./gi, `$1${placeholder}`)
    .replace(/(\d)\.(\d)/g, `$1${placeholder}$2`);

  const parts = protectedText
    .split(/(?<=[.!?])\s+(?=[A-Z"'(\d])/)
    .map((segment) => segment.replaceAll(placeholder, '.').trim())
    .filter(Boolean);

  return parts.length > 0 ? parts : [trimmed];
}

/**
 * Safely tokenizes inline CLI commands and backtick expressions into text/code spans
 * without using dangerouslySetInnerHTML.
 */
export function tokenizeRichText(text: string): TextToken[] {
  if (!text) return [];
  const tokens: TextToken[] = [];
  let lastIndex = 0;

  // Match either explicit backtick code or recognized DevOps CLI commands
  const combined = new RegExp(`\`([^\`]+)\`|${CLI_PATTERN.source}`, 'g');
  let match: RegExpExecArray | null;

  while ((match = combined.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    const codeText = match[1] ?? match[2] ?? match[0];
    tokens.push({ type: 'code', value: codeText });
    lastIndex = combined.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return tokens;
}

/**
 * Multi-facet filter for DevOps Q&As across topic, experience track, difficulty, 2026 trends, and search query.
 */
export function filterQuestions(
  questions: QuestionItem[],
  filters: QuestionFilterState,
  learnedIds: ReadonlySet<string>
): QuestionItem[] {
  const words = filters.query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return questions.filter((item) => {
    if (filters.topicSlug !== 'all' && item.topicSlug !== filters.topicSlug) {
      return false;
    }
    if (filters.experienceYears !== 'all' && item.experienceYears !== filters.experienceYears) {
      return false;
    }
    if (filters.difficulty !== 'all' && item.difficulty !== filters.difficulty) {
      return false;
    }
    if (filters.only2026 && !item.is2026Trend) {
      return false;
    }
    if (filters.onlyUnlearned && learnedIds.has(item.id)) {
      return false;
    }
    if (words.length > 0) {
      const searchable = `${item.question} ${item.answer} ${item.focusArea ?? ''} ${item.topicSlug}`.toLowerCase();
      if (!words.every((word) => searchable.includes(word))) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Ranked global search across questions, answers, focus areas, and topic names.
 */
export function searchQuestions(
  questions: QuestionItem[],
  query: string,
  topicNamesBySlug: ReadonlyMap<string, string>,
  limit = 30
): QuestionItem[] {
  const clean = query.toLowerCase().trim();
  if (!clean) return [];
  const words = clean.split(/\s+/).filter(Boolean);

  const scored: Array<{ item: QuestionItem; score: number }> = [];

  for (const item of questions) {
    const topicName = (topicNamesBySlug.get(item.topicSlug) ?? item.topicSlug).toLowerCase();
    const qLower = item.question.toLowerCase();
    const aLower = item.answer.toLowerCase();
    const fLower = (item.focusArea ?? '').toLowerCase();
    const full = `${qLower} ${aLower} ${fLower} ${topicName}`;

    if (!words.every((w) => full.includes(w))) continue;

    let score = 1;
    if (qLower.includes(clean)) score += 10;
    if (fLower.includes(clean)) score += 8;
    if (topicName.includes(clean)) score += 5;
    for (const w of words) {
      if (qLower.includes(w)) score += 3;
      if (fLower.includes(w)) score += 2;
    }
    if (item.is2026Trend) score += 1.5;

    scored.push({ item, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.item);
}

export interface ProgressStats {
  total: number;
  learned: number;
  percent: number;
}

export function computeProgress(
  questions: QuestionItem[],
  learnedIds: ReadonlySet<string>
): ProgressStats {
  const total = questions.length;
  if (total === 0) return { total: 0, learned: 0, percent: 0 };
  let learned = 0;
  for (const q of questions) {
    if (learnedIds.has(q.id)) learned++;
  }
  return {
    total,
    learned,
    percent: Math.round((learned / total) * 100),
  };
}

export function computeExperienceCounts(
  questions: QuestionItem[]
): Record<ExperienceYear, number> {
  const counts: Record<ExperienceYear, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const q of questions) {
    counts[q.experienceYears] += 1;
  }
  return counts;
}

export function pickMockQuestion(
  pool: QuestionItem[],
  excludeId?: string | null,
  rng: () => number = Math.random
): QuestionItem | null {
  if (pool.length === 0) return null;
  if (pool.length === 1) return pool[0];
  const candidates = excludeId ? pool.filter((q) => q.id !== excludeId) : pool;
  const list = candidates.length > 0 ? candidates : pool;
  const index = Math.floor(rng() * list.length);
  return list[Math.min(index, list.length - 1)];
}

export function formatTimer(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}
