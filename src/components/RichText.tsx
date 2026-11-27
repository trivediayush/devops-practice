import { useMemo } from 'react';
import { tokenizeRichText } from '../utils/qaEngine';

interface RichTextProps {
  text: string;
  onCopyCode?: (snippet: string) => void;
}

export function RichText({ text, onCopyCode }: RichTextProps) {
  const tokens = useMemo(() => tokenizeRichText(text), [text]);

  return (
    <>
      {tokens.map((token, idx) =>
        token.type === 'code' ? (
          <code
            key={idx}
            onClick={
              onCopyCode
                ? (e) => {
                    e.stopPropagation();
                    onCopyCode(token.value);
                  }
                : undefined
            }
            title={onCopyCode ? 'Click to copy command' : undefined}
            className={`font-mono text-[0.86em] px-1.5 py-0.5 rounded-[5px] bg-[var(--surface-code)] text-[var(--ink-1)] break-words ${
              onCopyCode
                ? 'cursor-pointer hover:bg-[var(--brand-soft)] hover:text-[var(--brand-1)] transition-colors duration-150'
                : ''
            }`}
          >
            {token.value}
          </code>
        ) : (
          <span key={idx}>{token.value}</span>
        )
      )}
    </>
  );
}
