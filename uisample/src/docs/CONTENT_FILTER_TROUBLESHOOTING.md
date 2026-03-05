# Content Filter Troubleshooting Guide

## ✅ Fixed Issue: Console Warnings

**Problem**: Console was showing `[CONTENT FILTER]` warnings that looked like errors.

**Solution**: Changed logging to be silent by default. Logs are now stored in localStorage without console output.

**Result**: Clean console, no error spam! 🎉

---

## How to Enable Debug Logging

If you need to see what's being filtered for debugging:

1. Open `/utils/contentFilter.ts`
2. Change line ~264:
   ```typescript
   const VERBOSE_LOGGING = true; // was: false
   ```
3. Save and refresh
4. Now you'll see console warnings when content is filtered

**Remember to set it back to `false` for production!**

---

## Viewing Logged Violations

All flagged content is stored in localStorage. To view:

### Option 1: Browser Console
```javascript
// Get all logs
const logs = JSON.parse(localStorage.getItem('flagged_content_logs') || '[]');
console.table(logs);

// Count by category
const stats = {};
logs.forEach(log => {
  const cat = log.filterResult.category;
  stats[cat] = (stats[cat] || 0) + 1;
});
console.log('Violations by category:', stats);
```

### Option 2: Use Helper Function
```javascript
import { getFilterStatistics } from './utils/contentFilterIntegration';

const stats = getFilterStatistics();
console.log(stats);
// Output:
// {
//   totalFlags: 5,
//   byCategory: { scam: 2, sexual: 1, hate: 2 },
//   bySeverity: { high: 5 }
// }
```

---

## Common Issues

### 1. "False Positives" - Legitimate Messages Blocked

**Example**: User tries to say "I need to kill some time" and it gets blocked for violence.

**Solution**: The patterns are intentionally strict for safety. Options:
1. **Whitelist approach**: Add exception patterns
2. **Context analysis**: Implement ML-based filtering (future enhancement)
3. **Manual review**: Users can report false blocks via Contact Us

**To add exceptions** (example for "kill time"):
```typescript
// In contentFilter.ts, modify VIOLENCE_PATTERNS
const VIOLENCE_PATTERNS = [
  /\b(kill|murder|shoot|stab|bomb|attack|beat\s*up)\b/gi,
];

// Add a pre-check before violence patterns:
// Skip if "kill time" or similar harmless phrases
if (/kill\s*(time|it)/gi.test(text)) {
  // Skip violence check for this phrase
}
```

### 2. Personal Info Filter Too Aggressive

**Example**: User says "I scored 1234567890 points" and it's blocked as a phone number.

**Solution**: The 10-digit pattern `/\b\d{10}\b/g` catches phone numbers but also large numbers.

**To fix**: Make the pattern more specific:
```typescript
// More specific phone number patterns
const PERSONAL_INFO_PATTERNS = [
  // Only block if formatted like a phone
  /\b\d{3}[-.]\d{3}[-.]\d{4}\b/g,  // 123-456-7890
  /\b\(\d{3}\)\s*\d{3}[-.]\d{4}\b/g,  // (123) 456-7890
  // Remove the generic 10-digit pattern
  // /\b\d{10}\b/g,  // <- Comment this out
];
```

### 3. Emoji/Unicode False Matches

**Example**: User sends 🍆 (eggplant emoji) and it passes, but "eggplant" text is flagged.

**Current behavior**: Text patterns only catch text, not emoji.

**Future enhancement**: Add emoji detection if needed:
```typescript
const SEXUAL_EMOJI = /[\u{1F346}\u{1F351}\u{1F34C}]/gu; // 🍆🍑🍌
```

### 4. Case Sensitivity

**Should not be an issue** - All patterns use `/gi` flags (case-insensitive).

If you see case sensitivity issues, check that patterns have the `i` flag:
```typescript
/\b(word)\b/gi  // ✅ Correct
/\b(word)\b/g   // ❌ Missing 'i' flag
```

---

## Performance Issues

### Symptoms:
- Typing lag in chat input
- Slow message sending
- UI freezes

### Diagnosis:
Content filter should be <1ms per message. If it's slower:

1. **Check pattern complexity**: Very complex regex can slow down
2. **Check text length**: Are users sending very long messages?
3. **Browser performance**: Try in different browser

### Fix:
Add length limit before filtering:
```typescript
export function filterMessage(text: string): FilterResult {
  // Limit to 10,000 characters
  if (text.length > 10000) {
    return {
      isClean: false,
      flagged: true,
      category: 'other',
      flagReason: 'Message too long',
      severity: 'high',
      shouldHide: true,
      originalText: text.substring(0, 100) + '...',
    };
  }
  
  // ... rest of function
}
```

---

## Testing Filters

### Test Suite (Copy to browser console):

```javascript
// Test messages
const testMessages = [
  { text: "Hello, how are you?", expected: "clean" },
  { text: "Send me your UPI", expected: "blocked" },
  { text: "Want to see nudes?", expected: "blocked" },
  { text: "I hate you", expected: "blocked" },
  { text: "I'll kill you", expected: "blocked" },
  { text: "Call me at 555-123-4567", expected: "blocked" },
  { text: "Anyone smoke weed here?", expected: "flagged" },
];

// Run tests
import { filterMessage } from './utils/contentFilter';

testMessages.forEach(test => {
  const result = filterMessage(test.text);
  const status = result.shouldHide ? "blocked" : result.flagged ? "flagged" : "clean";
  const passed = status === test.expected;
  console.log(
    passed ? "✅" : "❌",
    `"${test.text}" -> ${status}`,
    passed ? "" : `(expected: ${test.expected})`
  );
});
```

---

## Disabling the Filter (Not Recommended)

If you need to temporarily disable for testing:

### Option 1: Bypass in specific screen
```typescript
// In CrowdChatScreen.tsx, comment out the filter check:
const handleSend = (e?: React.FormEvent) => {
  // ... existing code
  
  // COMMENTED OUT FOR TESTING ONLY
  // const filterResult = filterMessage(inputText);
  // if (filterResult.shouldHide) { ... }
  
  sendMessage(crowdId, inputText, ghostName, ghostSessionId);
  // ...
};
```

### Option 2: Make filter always pass
```typescript
// In contentFilter.ts, return clean result immediately:
export function filterMessage(text: string): FilterResult {
  // TESTING ONLY - BYPASSES ALL FILTERS
  return {
    isClean: true,
    flagged: false,
    severity: 'low',
    originalText: text,
    shouldHide: false,
  };
}
```

**⚠️ WARNING**: Don't ship with filter disabled! Apple will reject.

---

## Updating Filter Patterns

To add new words/phrases to block:

1. Open `/utils/contentFilter.ts`
2. Find the appropriate pattern array:
   - `SCAM_PATTERNS` - Financial scams
   - `SEXUAL_PATTERNS` - Sexual content
   - `HATE_PATTERNS` - Hate speech
   - `VIOLENCE_PATTERNS` - Violent threats
   - `DRUG_PATTERNS` - Drug references
   - `PERSONAL_INFO_PATTERNS` - Phone numbers, emails, etc.

3. Add your pattern:
```typescript
const SCAM_PATTERNS = [
  // ... existing patterns
  /\bnew_scam_keyword\b/gi,  // Add this
];
```

4. Test it:
```javascript
import { filterMessage } from './utils/contentFilter';
const result = filterMessage("message with new_scam_keyword");
console.log(result.shouldHide); // Should be true
```

---

## Support

If you encounter issues:

1. **Check console** (with `VERBOSE_LOGGING = true`)
2. **Review logs** in localStorage
3. **Test patterns** using the test suite above
4. **Check documentation** in `/docs/CONTENT_FILTER_USAGE.md`

---

## FAQ

**Q: Will this work on React Native?**
A: Yes, but replace `localStorage` with `AsyncStorage` from React Native.

**Q: Can users bypass the filter?**
A: Client-side filters can be bypassed by tech-savvy users. For production, implement server-side validation too.

**Q: Does this work in other languages?**
A: Currently English only. Add patterns for other languages as needed.

**Q: How do I test without triggering the filter?**
A: Use the bypass methods above, or test with clean messages.

**Q: What about false positives?**
A: Strict filters = more false positives. Balance safety vs usability based on your needs.

---

**Last Updated**: February 13, 2026
**Status**: ✅ All known issues resolved
