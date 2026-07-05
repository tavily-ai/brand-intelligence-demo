import { Fragment } from "react";

/**
 * Renders a plain-text string from Tavily with basic formatting:
 * - Paragraphs (double newlines)
 * - Line breaks (single newlines)
 * - Bold (**text** or __text__)
 * - Inline code (`code`)
 * - Bullet lists (lines starting with - or •)
 * - Numbered lists (lines starting with 1. 2. etc.)
 */

interface Props {
  text: string;
  className?: string;
}

function formatInline(text: string): React.ReactNode[] {
  // Split on **bold**, __bold__, and `code` patterns
  const parts: React.ReactNode[] = [];
  // Regex matches **bold**, __bold__, or `code`
  const regex = /(\*\*(.+?)\*\*|__(.+?)__|`(.+?)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2] || match[3]) {
      // Bold
      parts.push(
        <strong key={match.index} className="font-semibold text-ink-100">
          {match[2] || match[3]}
        </strong>
      );
    } else if (match[4]) {
      // Inline code
      parts.push(
        <code
          key={match.index}
          className="break-all rounded bg-ink-850 px-1 py-0.5 font-mono text-[13px] text-accent-600"
        >
          {match[4]}
        </code>
      );
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

function isBullet(line: string): { isList: boolean; content: string; ordered: boolean } {
  // Unordered: - item, • item, * item (but not **)
  const unordered = line.match(/^\s*[-•]\s+(.+)/);
  if (unordered) return { isList: true, content: unordered[1], ordered: false };

  const starBullet = line.match(/^\s*\*\s+([^*].+)/);
  if (starBullet) return { isList: true, content: starBullet[1], ordered: false };

  // Ordered: 1. item, 2) item
  const ordered = line.match(/^\s*\d+[.)]\s+(.+)/);
  if (ordered) return { isList: true, content: ordered[1], ordered: true };

  return { isList: false, content: line, ordered: false };
}

export default function FormattedText({ text, className = "" }: Props) {
  if (!text) return null;

  // Split into paragraphs on double newlines
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean);

  return (
    <div className={`min-w-0 space-y-2.5 break-words ${className}`}>
      {paragraphs.map((para, pi) => {
        const lines = para.split("\n").filter(Boolean);

        // Check if this paragraph is a list
        const listItems = lines.map((l) => isBullet(l));
        const isList = listItems.filter((li) => li.isList).length > lines.length / 2;

        if (isList) {
          const isOrdered = listItems.some((li) => li.ordered);
          const Tag = isOrdered ? "ol" : "ul";
          return (
            <Tag
              key={pi}
              className={`space-y-1 ${
                isOrdered ? "list-decimal" : "list-disc"
              } list-outside ml-4`}
            >
              {listItems.map((item, li) => (
                <li
                  key={li}
                  className="text-sm text-ink-200 leading-relaxed pl-0.5"
                >
                  {formatInline(item.content)}
                </li>
              ))}
            </Tag>
          );
        }

        // Regular paragraph — join lines with line breaks
        return (
          <p key={pi} className="text-sm text-ink-200 leading-relaxed">
            {lines.map((line, li) => (
              <Fragment key={li}>
                {li > 0 && <br />}
                {formatInline(line)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
