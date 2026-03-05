import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { FilterResult } from '../../utils/contentFilter';

interface FilteredMessageProps {
  filterResult: FilterResult;
  showOriginal?: boolean;
}

/**
 * Component to display filtered/flagged messages
 */
export const FilteredMessage: React.FC<FilteredMessageProps> = ({
  filterResult,
  showOriginal = false,
}) => {
  const [revealed, setRevealed] = React.useState(false);

  if (!filterResult.flagged) {
    return <span>{filterResult.originalText}</span>;
  }

  // High severity - completely hidden
  if (filterResult.shouldHide && !revealed) {
    return (
      <div className="flex items-center gap-2 py-2 px-3 bg-red-500/10 border border-red-500/30 rounded-lg">
        <AlertTriangle size={16} className="text-red-400 shrink-0" />
        <div className="flex-1">
          <p className="text-xs text-red-300">
            {getCategoryIcon(filterResult.category)} Message hidden: {filterResult.flagReason}
          </p>
          {showOriginal && (
            <button
              onClick={() => setRevealed(true)}
              className="text-xs text-red-400 underline hover:text-red-300 mt-1"
            >
              Show original (admin)
            </button>
          )}
        </div>
      </div>
    );
  }

  // Medium severity - flagged but visible
  if (filterResult.flagged && filterResult.severity === 'medium') {
    return (
      <div className="flex items-start gap-2">
        <AlertTriangle size={14} className="text-yellow-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-white/90">{filterResult.originalText}</p>
          <p className="text-xs text-yellow-400 mt-0.5">⚠️ Flagged for review</p>
        </div>
      </div>
    );
  }

  // Revealed (admin view)
  if (revealed) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2">
        <p className="text-xs text-yellow-300 mb-1">
          ⚠️ Hidden message (admin view):
        </p>
        <p className="text-sm text-white/80">{filterResult.originalText}</p>
        <button
          onClick={() => setRevealed(false)}
          className="text-xs text-yellow-400 underline hover:text-yellow-300 mt-1"
        >
          Hide again
        </button>
      </div>
    );
  }

  return <span>{filterResult.originalText}</span>;
};

function getCategoryIcon(category?: string): string {
  switch (category) {
    case 'scam':
      return '💳';
    case 'sexual':
      return '🔞';
    case 'hate':
      return '⛔';
    case 'violence':
      return '⚠️';
    case 'drugs':
      return '💊';
    case 'personal_info':
      return '🔒';
    default:
      return '⚠️';
  }
}
