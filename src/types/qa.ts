export type ExperienceYear = 1 | 2 | 3 | 4 | 5;

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type QuestionKind = 'scenario' | 'edge-case' | 'architecture' | 'troubleshooting';

export type TopicIconName =
  | 'kubernetes'
  | 'docker'
  | 'cicd'
  | 'terraform'
  | 'aws'
  | 'linux'
  | 'networking'
  | 'monitoring'
  | 'incident'
  | 'platform'
  | 'security'
  | 'ai-finops';

export interface FollowUpItem {
  question: string;
  answer: string;
}

export interface TopicFollowUp extends FollowUpItem {
  keywords: string[];
}

export interface QuestionItem {
  id: string;
  topicSlug: string;
  question: string;
  answer: string;
  experienceYears: ExperienceYear;
  difficulty: Difficulty;
  is2026Trend: boolean;
  kind: QuestionKind;
  followUps?: FollowUpItem[];
  focusArea?: string;
}

export interface TopicDefinition {
  slug: string;
  name: string;
  shortName: string;
  blurb: string;
  icon: TopicIconName;
  accent: string;
  isNew2026?: boolean;
  followUps: TopicFollowUp[];
}

export interface ExperienceTrackMeta {
  years: ExperienceYear;
  label: string;
  shortLabel: string;
  tier: string;
  summary: string;
  focusSkills: string[];
}

export interface QuestionFilterState {
  query: string;
  topicSlug: string | 'all';
  experienceYears: ExperienceYear | 'all';
  difficulty: Difficulty | 'all';
  only2026: boolean;
  onlyUnlearned: boolean;
}
