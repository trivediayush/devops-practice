import legacyData from './legacyDataset.json';
import { NEW_2026_TOPICS, QUESTIONS_2026 } from './questions2026';
import type {
  ExperienceTrackMeta,
  FollowUpItem,
  QuestionItem,
  TopicDefinition,
  TopicIconName,
} from '../types/qa';

interface LegacyTopic {
  slug: string;
  name: string;
  blurb: string;
  followUps: Array<{ keywords: string[]; question: string; answer: string }>;
  questions: QuestionItem[];
}

interface LegacyDataset {
  genericFollowUps: FollowUpItem[];
  topics: LegacyTopic[];
}

const parsedLegacy = legacyData as unknown as LegacyDataset;

// Cohesive architectural accent palette (zero green, aligned with devops.atrivedi.online stone + cobalt palette)
const LEGACY_TOPIC_VISUALS: Record<string, { icon: TopicIconName; shortName: string; accent: string }> = {
  kubernetes: { icon: 'kubernetes', shortName: 'Kubernetes', accent: '#2558d9' },
  docker: { icon: 'docker', shortName: 'Docker', accent: '#0284c7' },
  'ci-cd': { icon: 'cicd', shortName: 'CI/CD', accent: '#4f46e5' },
  terraform: { icon: 'terraform', shortName: 'Terraform', accent: '#7c3aed' },
  aws: { icon: 'aws', shortName: 'AWS', accent: '#b45309' },
  linux: { icon: 'linux', shortName: 'Linux', accent: '#475569' },
  networking: { icon: 'networking', shortName: 'Networking', accent: '#0891b2' },
  monitoring: { icon: 'monitoring', shortName: 'Monitoring', accent: '#c2410c' },
  'incident-response': { icon: 'incident', shortName: 'Incident & SRE', accent: '#be123c' },
};

const legacyTopics: TopicDefinition[] = parsedLegacy.topics.map((t) => {
  const vis = LEGACY_TOPIC_VISUALS[t.slug] ?? {
    icon: 'kubernetes' as TopicIconName,
    shortName: t.name,
    accent: '#2558d9',
  };
  return {
    slug: t.slug,
    name: t.name,
    shortName: vis.shortName,
    blurb: t.blurb,
    icon: vis.icon,
    accent: vis.accent,
    isNew2026: false,
    followUps: t.followUps,
  };
});

export const TOPICS: TopicDefinition[] = [...legacyTopics, ...NEW_2026_TOPICS];

const TOPIC_MAP = new Map<string, TopicDefinition>(TOPICS.map((t) => [t.slug, t]));

const legacyQuestions: QuestionItem[] = parsedLegacy.topics.flatMap((t) => t.questions);

// Place 2026 questions alongside legacy ones (ordered so 2026 trends surface cleanly when browsing)
export const ALL_QUESTIONS: QuestionItem[] = [...QUESTIONS_2026, ...legacyQuestions];

export const QUESTION_MAP = new Map<string, QuestionItem>(ALL_QUESTIONS.map((q) => [q.id, q]));

export const GENERIC_FOLLOW_UPS: FollowUpItem[] = parsedLegacy.genericFollowUps;

export const EXPERIENCE_TRACKS: ExperienceTrackMeta[] = [
  {
    years: 1,
    label: '1 Year Experience',
    shortLabel: '1 Yr',
    tier: 'Beginner / Entry',
    summary: 'Core Linux triage, Dockerfiles, Git & CI fundamentals, basic Kubernetes pods/services, and cloud networking.',
    focusSkills: ['Linux & Disk/Process Triage', 'Multi-Stage Dockerfiles', 'K8s Probes & Pods', 'VPC & S3 Fundamentals'],
  },
  {
    years: 2,
    label: '2 Years Experience',
    shortLabel: '2 Yrs',
    tier: 'Junior–Mid',
    summary: 'Production CI/CD with OIDC, Terraform remote state & refactoring, Distroless images, Gateway API, and OTel basics.',
    focusSkills: ['Keyless OIDC CI/CD', 'Terraform moved/import', 'Gateway API & Sidecars', 'External Secrets & ESO'],
  },
  {
    years: 3,
    label: '3 Years Experience',
    shortLabel: '3 Yrs',
    tier: 'Mid-Level',
    summary: 'Karpenter/KEDA autoscaling, graceful zero-downtime rollouts, Cilium eBPF, OpenTofu encryption, and Kyverno policies.',
    focusSkills: ['Karpenter & KEDA', 'Cilium eBPF Networking', 'Argo Rollouts Canary', 'High-Cardinality Observability'],
  },
  {
    years: 4,
    label: '4 Years Experience',
    shortLabel: '4 Yrs',
    tier: 'Mid–Senior',
    summary: 'Crossplane IDPs, etcd compaction & PDBs, multi-account AWS guardrails, SBOM/Cosign supply chain, and GPU sharing.',
    focusSkills: ['Crossplane & Backstage IDP', 'Multi-Burn-Rate SLOs', 'Cosign & Falco Runtime', 'GPU MIG & LLM Routing'],
  },
  {
    years: 5,
    label: '5+ Years Experience',
    shortLabel: '5+ Yrs',
    tier: 'Senior / Staff',
    summary: 'Fleet-wide K8s upgrades, multi-region cell failover, SPIFFE Zero-Trust, SLSA L3, FinOps unit economics, and SRE leadership.',
    focusSkills: ['Multi-Region Cell Failover', 'Zero-Trust SPIFFE/SPIRE', 'SLSA L3 Provenance', 'FinOps & GPU Reliability'],
  },
];

export function getTopicBySlug(slug: string): TopicDefinition | undefined {
  return TOPIC_MAP.get(slug);
}

export function getQuestionsForTopic(slug: string): QuestionItem[] {
  return ALL_QUESTIONS.filter((q) => q.topicSlug === slug);
}

export function getFollowUpsForQuestion(question: QuestionItem): FollowUpItem[] {
  if (question.followUps && question.followUps.length > 0) {
    return question.followUps;
  }
  const topic = TOPIC_MAP.get(question.topicSlug);
  const haystack = `${question.question} ${question.answer}`.toLowerCase();
  const matched: FollowUpItem[] = topic
    ? topic.followUps
        .map((f) => ({
          item: { question: f.question, answer: f.answer },
          score: f.keywords.reduce((acc, kw) => acc + (haystack.includes(kw.toLowerCase()) ? 1 : 0), 0),
        }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 2)
        .map((entry) => entry.item)
    : [];

  let hash = 0;
  for (let i = 0; i < question.id.length; i++) {
    hash = (hash * 31 + question.id.charCodeAt(i)) >>> 0;
  }

  const out: FollowUpItem[] = [...matched];
  for (let i = 0; out.length < 3 && i < GENERIC_FOLLOW_UPS.length; i++) {
    const candidate = GENERIC_FOLLOW_UPS[(hash + i) % GENERIC_FOLLOW_UPS.length];
    if (!out.some((x) => x.question === candidate.question)) {
      out.push(candidate);
    }
  }
  return out;
}
