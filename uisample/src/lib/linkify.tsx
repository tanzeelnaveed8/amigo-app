import React from 'react';

// URL regex pattern
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

export function linkifyText(text: string): React.ReactNode[] {
  const parts = text.split(URL_REGEX);
  
  return parts.map((part, index) => {
    if (part.match(URL_REGEX)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#9B7BFF] underline hover:text-[#B88DFF] transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
}
