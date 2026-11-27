import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_QUESTIONS, TOPICS, getFollowUpsForQuestion } from '../data/catalog';
import {
  computeExperienceCounts,
  computeProgress,
  filterQuestions,
  formatTimer,
  pickMockQuestion,
  searchQuestions,
  splitAnswerSteps,
  tokenizeRichText,
} from './qaEngine';

test('catalog contains 480+ questions across 12 topics and all 5 experience years (1-5+)', () => {
  assert.equal(TOPICS.length, 12);
  assert.ok(ALL_QUESTIONS.length >= 480, `Expected >=480 questions, got ${ALL_QUESTIONS.length}`);

  const counts = computeExperienceCounts(ALL_QUESTIONS);
  for (const yr of [1, 2, 3, 4, 5] as const) {
    assert.ok(counts[yr] >= 15, `Expected >=15 questions for ${yr} Yr track, got ${counts[yr]}`);
  }

  const trendCount = ALL_QUESTIONS.filter((q) => q.is2026Trend).length;
  assert.ok(trendCount >= 60, `Expected >=60 2026-trend questions, got ${trendCount}`);
});

test('catalog strictly excludes career prep, 6LPA, CTC, and salary negotiation content', () => {
  const forbidden = /\b(6\s*lpa|lpa|current\s+ctc|expected\s+ctc|salary\s+negotiation|hr\s+answers|resume\s+tips)\b/i;
  for (const q of ALL_QUESTIONS) {
    assert.equal(
      forbidden.test(`${q.question} ${q.answer}`),
      false,
      `Forbidden career/salary content found in ${q.id}: ${q.question}`
    );
  }
  for (const t of TOPICS) {
    assert.equal(forbidden.test(`${t.name} ${t.blurb}`), false, `Forbidden text in topic ${t.slug}`);
  }
});

test('splitAnswerSteps splits sentences cleanly while keeping e.g. and decimals intact', () => {
  const steps = splitAnswerSteps(
    'Use Gateway API (e.g. HTTPRoute v1.2) instead of Ingress annotations. Run kubectl describe pod to verify events.'
  );
  assert.equal(steps.length, 2);
  assert.ok(steps[0].includes('e.g. HTTPRoute v1.2'));
  assert.ok(steps[1].startsWith('Run kubectl describe pod'));
});

test('tokenizeRichText highlights DevOps CLI commands safely without splitting ssh words', () => {
  const tokens = tokenizeRichText('Run kubectl describe pod and check `ndots:5` config.');
  const codeValues = tokens.filter((t) => t.type === 'code').map((t) => t.value);
  assert.ok(codeValues.some((v) => v.includes('kubectl describe pod')));
  assert.ok(codeValues.includes('ndots:5'));

  const sshTokens = tokenizeRichText('Fix by running ssh-keyscan target-host >> ~/.ssh/known_hosts first.');
  const sshCodes = sshTokens.filter((t) => t.type === 'code').map((t) => t.value);
  assert.equal(sshCodes.includes('ss'), false, 'Must not slice "ss" out of ssh-keyscan or .ssh');
  assert.ok(sshCodes.some((v) => v.startsWith('ssh-keyscan target-host')));
});

test('filterQuestions filters by experience year, difficulty, 2026 trend, unlearned, and search query', () => {
  const learned = new Set<string>([ALL_QUESTIONS[0].id]);
  const res = filterQuestions(
    ALL_QUESTIONS,
    {
      query: 'karpenter',
      topicSlug: 'all',
      experienceYears: 'all',
      difficulty: 'all',
      only2026: true,
      onlyUnlearned: false,
    },
    learned
  );
  assert.ok(res.length >= 2, 'Expected Karpenter 2026 questions to match');
  assert.ok(res.every((q) => q.is2026Trend));

  const exp5 = filterQuestions(
    ALL_QUESTIONS,
    {
      query: '',
      topicSlug: 'kubernetes',
      experienceYears: 5,
      difficulty: 'Advanced',
      only2026: true,
      onlyUnlearned: false,
    },
    learned
  );
  assert.ok(exp5.length >= 2);
  assert.ok(exp5.every((q) => q.experienceYears === 5 && q.topicSlug === 'kubernetes'));
});

test('searchQuestions ranks title and focusArea matches above body-only matches', () => {
  const names = new Map(TOPICS.map((t) => [t.slug, t.name]));
  const hits = searchQuestions(ALL_QUESTIONS, 'Gateway API', names, 10);
  assert.ok(hits.length >= 1);
  assert.ok(
    hits[0].question.toLowerCase().includes('gateway api') ||
      (hits[0].focusArea ?? '').toLowerCase().includes('gateway api')
  );
});

test('computeProgress, pickMockQuestion, follow-ups, and formatTimer behave deterministically', () => {
  const subset = ALL_QUESTIONS.slice(0, 4);
  const prog = computeProgress(subset, new Set([subset[0].id, subset[2].id]));
  assert.deepEqual(prog, { total: 4, learned: 2, percent: 50 });

  const picked = pickMockQuestion(subset, subset[0].id, () => 0);
  assert.equal(picked?.id, subset[1].id);

  const followUps = getFollowUpsForQuestion(subset[0]);
  assert.ok(followUps.length >= 2);

  assert.equal(formatTimer(0), '0:00');
  assert.equal(formatTimer(75), '1:15');
});
