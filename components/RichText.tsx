import React from 'react';

interface RichTextProps {
  content: string;
  className?: string;
}

export function RichText({ content, className = '' }: RichTextProps) {
  if (!content) return null;

  // Split by bold (**...**) first
  const parts = content.split(/(\*\*.*?\*\*)/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
          // This is a bold section, now check for italics inside
          const innerContent = part.slice(2, -2);
          return (
            <span key={index} className="font-bold">
              <ItalicText content={innerContent} />
            </span>
          );
        }
        // Normal text, check for italics
        return <ItalicText key={index} content={part} />;
      })}
    </span>
  );
}

function ItalicText({ content }: { content: string }) {
  // Split by italic (*...*)
  // Note: We use * for italic. Regex looks for *text*
  const parts = content.split(/(\*[^\*]+\*)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
          return (
            <span key={index} className="italic">
              {part.slice(1, -1)}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}
