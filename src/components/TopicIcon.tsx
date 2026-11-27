import {
  Activity,
  Boxes,
  Cloud,
  Compass,
  Container,
  Cpu,
  GitBranch,
  Layers,
  Network,
  ShieldCheck,
  Siren,
  Terminal,
} from 'lucide-react';
import type { TopicIconName } from '../types/qa';

interface TopicIconProps {
  name: TopicIconName;
  className?: string;
}

export function TopicIcon({ name, className = 'w-4 h-4' }: TopicIconProps) {
  switch (name) {
    case 'kubernetes':
      return <Boxes className={className} aria-hidden="true" />;
    case 'docker':
      return <Container className={className} aria-hidden="true" />;
    case 'cicd':
      return <GitBranch className={className} aria-hidden="true" />;
    case 'terraform':
      return <Layers className={className} aria-hidden="true" />;
    case 'aws':
      return <Cloud className={className} aria-hidden="true" />;
    case 'linux':
      return <Terminal className={className} aria-hidden="true" />;
    case 'networking':
      return <Network className={className} aria-hidden="true" />;
    case 'monitoring':
      return <Activity className={className} aria-hidden="true" />;
    case 'incident':
      return <Siren className={className} aria-hidden="true" />;
    case 'platform':
      return <Compass className={className} aria-hidden="true" />;
    case 'security':
      return <ShieldCheck className={className} aria-hidden="true" />;
    case 'ai-finops':
      return <Cpu className={className} aria-hidden="true" />;
  }
}

export function BrandEmblem({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 88 88"
      className={className}
      aria-hidden="true"
    >
      <rect width="88" height="88" rx="20" fill="#2558D9" />
      <rect
        x="2"
        y="2"
        width="84"
        height="84"
        rx="18"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.18"
        strokeWidth="2"
      />
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 30 L38 44 L23 58" stroke="#FFFFFF" strokeWidth="6.5" />
        <path d="M43 58 H63" stroke="#BFDBFE" strokeWidth="6" />
        <path d="M51 28 H63 V42" stroke="#FFFFFF" strokeWidth="4.5" strokeOpacity="0.92" />
        <circle cx="48" cy="28" r="5" fill="#FFFFFF" />
        <circle cx="63" cy="44" r="5" fill="#BFDBFE" />
      </g>
    </svg>
  );
}
