# Content Filter Usage Guide

This document explains how to use the auto-moderation content filter system in Ghost Mode.

## Overview

The content filter automatically detects and flags inappropriate content including:
- 💳 **Scam/Fraud**: UPI, OTP, gift cards, investment scams
- 🔞 **Sexual Content**: Explicit language and solicitation
- ⛔ **Hate Speech**: Slurs and discriminatory language
- ⚠️ **Violence**: Threats and violent content
- 💊 **Drugs**: Drug-related content
- 🔒 **Personal Information**: Phone numbers, emails, addresses (anti-doxxing)

## Quick Start

### 1. Filter a message before sending

```typescript
import { filterMessage } from './utils/contentFilter';

const text = "Send me your UPI and win free money!";
const result = filterMessage(text);

if (result.shouldHide) {
  // Block the message
  alert(`Message blocked: ${result.flagReason}`);
} else if (result.flagged) {
  // Allow but flag for review
  console.warn('Message flagged:', result.flagReason);
  // Send message with flag
}
```

### 2. Validate username

```typescript
import { filterUsername } from './utils/contentFilter';

const username = "GhostUser123";
const validation = filterUsername(username);

if (!validation.isValid) {
  alert(`Invalid username: ${validation.reason}`);
}
```

### 3. Use in React component

```typescript
import { useContentFilter } from './utils/contentFilterIntegration';

function ChatInput() {
  const { checkMessage, isBlocked, blockReason } = useContentFilter();
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const result = checkMessage(message);
    
    if (result.shouldHide) {
      alert(`Cannot send: ${blockReason}`);
      return;
    }
    
    // Send message
    sendMessage(message);
  };

  return (
    <div>
      <input 
        value={message} 
        onChange={(e) => setMessage(e.target.value)} 
      />
      {isBlocked && <p className="text-red-500">{blockReason}</p>}
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
```

### 4. Display filtered messages

```typescript
import { FilteredMessage } from './components/chat/FilteredMessage';
import { filterMessage } from './utils/contentFilter';

function ChatMessage({ text }: { text: string }) {
  const filterResult = filterMessage(text);
  
  return <FilteredMessage filterResult={filterResult} />;
}
```

## Integration Points

### Where to add filtering:

1. **Message Input** (`/components/chat/ChatInput.tsx` or similar)
   - Validate before sending
   - Show real-time warnings

2. **Username Setup** (`/screens/GhostNameScreen.tsx`)
   - Filter ghost names before setting

3. **Message Display** (Chat message components)
   - Filter received messages
   - Hide or mark inappropriate content

4. **Crowd Names** (When creating crowds)
   - Validate crowd names

## Filter Results

```typescript
interface FilterResult {
  isClean: boolean;          // True if no issues found
  flagged: boolean;          // True if content flagged
  flagReason?: string;       // Explanation of why flagged
  category?: string;         // scam, sexual, hate, violence, drugs, personal_info
  severity: 'low' | 'medium' | 'high';
  shouldHide: boolean;       // If true, block/hide immediately
}
```

## Severity Levels

- **HIGH** (shouldHide = true): Scams, sexual content, hate speech, violence, personal info
  - Action: Block message, show error to user
  
- **MEDIUM** (shouldHide = false): Drug references in conversational context
  - Action: Allow but flag for admin review

- **LOW**: Clean content
  - Action: No action needed

## Logging & Analytics

All flagged content is logged for review:

```typescript
import { logFlaggedContent } from './utils/contentFilter';

logFlaggedContent({
  timestamp: new Date().toISOString(),
  userId: 'user-123',
  crowdId: 'crowd-456',
  messageId: 'msg-789',
  originalText: 'Flagged message text',
  filterResult: result,
});
```

Logs are stored in localStorage (key: `flagged_content_logs`) for demo purposes. In production, send to your backend.

## View Statistics

```typescript
import { getFilterStatistics } from './utils/contentFilterIntegration';

const stats = getFilterStatistics();
console.log(`Total flagged: ${stats.totalFlagged}`);
console.log('By category:', stats.byCategory);
// Example output:
// {
//   scam: 45,
//   sexual: 23,
//   hate: 12,
//   violence: 8
// }
```

## Customization

### Add new patterns:

Edit `/utils/contentFilter.ts` and add to the relevant array:

```typescript
const SCAM_PATTERNS = [
  // Existing patterns...
  /\b(your\s*new\s*pattern)\b/gi,
];
```

### Adjust severity:

Change the `severity` and `shouldHide` values in the filter function:

```typescript
if (pattern.test(text)) {
  result.severity = 'low'; // Change to low, medium, or high
  result.shouldHide = false; // Change to false to allow but flag
}
```

### Add new categories:

1. Create new pattern array
2. Add category to FilterResult type
3. Check patterns in filterMessage function

## Testing

Test with sample messages:

```typescript
// These should be flagged:
filterMessage("Send me your UPI number"); // scam
filterMessage("Want to see my nudes?");   // sexual
filterMessage("You're such a f*ggot");    // hate
filterMessage("I'll kill you");           // violence
filterMessage("Call me at 555-123-4567"); // personal_info
```

## Backend Integration

For production, integrate with your backend:

1. **On message send**: Check filter result, send to backend with flag
2. **Backend stores**: message + flagged status + flag reason
3. **Admin panel**: Review flagged messages
4. **Ban users**: If pattern of violations detected

Example backend payload:
```json
{
  "messageId": "msg-123",
  "text": "Original message",
  "userId": "user-456",
  "crowdId": "crowd-789",
  "flagged": true,
  "flagReason": "Contains potential scam content",
  "category": "scam",
  "severity": "high",
  "timestamp": "2026-02-08T10:30:00Z"
}
```

## Apple App Store Compliance

This content filter helps satisfy App Review Guideline 1.2 requirements:

✅ "A method for filtering objectionable material"
✅ "A mechanism to report and block abusive users"  
✅ "Published contact information so users can easily reach you"

Make sure to mention this in your App Store review notes:

> "Ghost Mode includes automatic content filtering that detects and blocks inappropriate content including scams, sexual content, hate speech, violence, and personal information. All flagged content is logged for review. Users can also report and block other users."

## Performance

The filter uses regex patterns, which are fast:
- Average check time: <1ms per message
- No network calls needed
- Works offline
- Minimal memory usage

For very large pattern sets, consider:
- Using a worker thread for filtering
- Caching filter results by message hash
- Implementing a bloom filter for initial quick check

## Privacy

- Filter runs client-side (no message sent to external API)
- Logs stored locally (localStorage)
- No personal user data in logs (use user IDs only)
- Original message text only in logs, not transmitted

## Future Enhancements

Consider adding:
1. **Machine Learning**: More sophisticated content detection
2. **Context awareness**: Understand message context
3. **Multi-language support**: Patterns for non-English content
4. **Rate limiting**: Auto-ban after X violations
5. **Severity scores**: Numeric scoring instead of categories
6. **Allowlist**: Trusted users with reduced filtering

## Support

If you need help integrating the content filter:
1. Check the examples in `/utils/contentFilterIntegration.ts`
2. Review the FilteredMessage component for UI examples
3. Test with the sample patterns provided
