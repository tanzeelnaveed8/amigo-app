# Content Filter - Quick Reference Card

## 🚀 Quick Start

### Is it working?
✅ Try typing "Send me your UPI" in chat → Should be blocked!

### Where is it active?
- ✅ Ghost names (`GhostNameScreen`)
- ✅ Crowd names (`CreateCrowdScreen`)  
- ✅ Chat messages (`CrowdChatScreen`)

---

## 🔍 What Gets Filtered

| Category | Examples | Severity | Action |
|----------|----------|----------|---------|
| 💳 **Scams** | UPI, OTP, bitcoin, "win money" | HIGH | 🚫 Block |
| 🔞 **Sexual** | Explicit words, "send nudes" | HIGH | 🚫 Block |
| ⛔ **Hate** | Slurs, "I hate [group]" | HIGH | 🚫 Block |
| ⚠️ **Violence** | "I'll kill you", weapons | HIGH | 🚫 Block |
| 🔒 **Personal Info** | Phone numbers, emails | HIGH | 🚫 Block |
| 💊 **Drugs** | "weed", "420" | MEDIUM | ⚠️ Flag & Log |

---

## 📋 Common Tasks

### View Logged Violations
```javascript
// Browser console:
JSON.parse(localStorage.getItem('flagged_content_logs') || '[]')
```

### Enable Debug Logging
```typescript
// In /utils/contentFilter.ts:
const VERBOSE_LOGGING = true; // Shows console output
```

### Add New Pattern to Block
```typescript
// In /utils/contentFilter.ts:
const SCAM_PATTERNS = [
  // ... existing patterns
  /\byour_new_pattern\b/gi,
];
```

### Test a Message
```javascript
import { filterMessage } from './utils/contentFilter';
const result = filterMessage("your test message");
console.log(result); // { shouldHide: true/false, ... }
```

---

## 🎯 Integration Points

### 1. Ghost Names
```typescript
// GhostNameScreen.tsx
import { filterUsername } from '../utils/contentFilter';

// In validation:
.refine(val => {
  const filterResult = filterUsername(val);
  return filterResult.isValid;
}, { message: "This name contains inappropriate content." })
```

### 2. Crowd Names
```typescript
// CreateCrowdScreen.tsx
import { filterMessage } from '../utils/contentFilter';

// In validation:
.refine(val => {
  const filterResult = filterMessage(val);
  return !filterResult.shouldHide;
}, { message: 'This name contains inappropriate content.' })
```

### 3. Chat Messages
```typescript
// CrowdChatScreen.tsx
import { filterMessage, logFlaggedContent } from '../utils/contentFilter';

const handleSend = () => {
  const filterResult = filterMessage(inputText);
  
  if (filterResult.shouldHide) {
    alert(`Message blocked: ${filterResult.flagReason}`);
    logFlaggedContent({ /* ... */ });
    return;
  }
  
  sendMessage(...);
};
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Console warnings | Set `VERBOSE_LOGGING = false` |
| False positives | Adjust patterns in `contentFilter.ts` |
| Not blocking | Check pattern syntax (use `/gi` flags) |
| Performance slow | Check regex complexity |
| Logs not saving | Check localStorage permissions |

---

## 📞 Resources

- **Full Docs**: `/docs/CONTENT_FILTER_USAGE.md`
- **Integration Guide**: `/docs/CONTENT_FILTER_INTEGRATION_SUMMARY.md`
- **Troubleshooting**: `/docs/CONTENT_FILTER_TROUBLESHOOTING.md`
- **Console Fix**: `/docs/FIX_CONSOLE_WARNINGS.md`
- **Status Report**: `/docs/CONTENT_FILTER_FINAL_STATUS.md`

---

## ✅ Status

| Component | Status | Notes |
|-----------|--------|-------|
| Filter Engine | ✅ Ready | <1ms performance |
| Ghost Names | ✅ Integrated | Validates on submit |
| Crowd Names | ✅ Integrated | Validates on submit |
| Chat Messages | ✅ Integrated | Real-time blocking |
| Logging | ✅ Working | Silent mode enabled |
| Documentation | ✅ Complete | 5 docs created |
| Apple Compliance | ✅ Ready | Meets guidelines |

---

## 🎉 Quick Test

```javascript
// Copy to browser console:
import { filterMessage } from './utils/contentFilter';

const tests = [
  "Hello world",              // Clean ✅
  "Send me your UPI",         // Blocked 🚫
  "Want to see nudes?",       // Blocked 🚫
  "Anyone smoke weed?",       // Flagged ⚠️
];

tests.forEach(msg => {
  const result = filterMessage(msg);
  console.log(
    result.shouldHide ? "🚫" : result.flagged ? "⚠️" : "✅",
    msg,
    result.flagReason || "Clean"
  );
});
```

---

**Last Updated**: Feb 13, 2026 | **Version**: 1.1.0 | **Status**: ✅ Production Ready
