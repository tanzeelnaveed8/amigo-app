/**
 * Content Filter - Auto-Moderation System
 * Detects and flags potentially inappropriate content
 */

export interface FilterResult {
  isClean: boolean;
  flagged: boolean;
  flagReason?: string;
  category?: 'scam' | 'sexual' | 'hate' | 'violence' | 'drugs' | 'personal_info';
  severity: 'low' | 'medium' | 'high';
  originalText: string;
  shouldHide: boolean; // If true, hide message immediately
}

// Scam/Fraud Detection Patterns
const SCAM_PATTERNS = [
  // Financial scams
  /\b(upi|otp|cvv|pin|atm)\b/gi,
  /\b(win\s*(money|cash|prize)|free\s*(money|cash|gift\s*card))/gi,
  /\b(bitcoin|crypto|investment|double\s*your\s*money)/gi,
  /\b(bank\s*account|credit\s*card|debit\s*card)/gi,
  /\b(paytm|gpay|phonepe|venmo|cashapp|paypal)/gi,
  /\b(send\s*(me|us)\s*(money|cash|\$|₹))/gi,
  /\b(click\s*here|bit\.ly|tinyurl)/gi,
  /\b(verify\s*account|suspended\s*account)/gi,
];

// Sexual Content Patterns
const SEXUAL_PATTERNS = [
  /\b(sex|nude|naked|porn|xxx|nsfw)/gi,
  /\b(dick|cock|pussy|vagina|penis|boobs|tits)/gi,
  /\b(horny|masturbate|orgasm|cum)/gi,
  /\b(onlyfans|snap\s*chat\s*premium)/gi,
  /\b(send\s*(nudes|pics))/gi,
  /\b(hook\s*up|dtf|netflix\s*and\s*chill)/gi,
];

// Hate Speech Patterns
const HATE_PATTERNS = [
  // Slurs (partial list for demonstration - expand as needed)
  /\b(n[i1]gg[ae]r|n[i1]gg[ae]|f[a@]gg[o0]t|tr[a@]nny)/gi,
  /\b(k[i1]ke|sp[i1]c|ch[i1]nk|wetb[a@]ck)/gi,
  /\b(r[e3]t[a@]rd|[a@]ut[i1]st[i1]c)/gi,
  // Hate phrases
  /\b(kill\s*(yourself|urself|all)|die\s*(slow|painful))/gi,
  /\b(hate\s*(you|women|men|gays|trans|blacks|whites|jews|muslims|christians))/gi,
  /\b(go\s*back\s*to\s*(your\s*country|africa|mexico))/gi,
];

// Violence Patterns
const VIOLENCE_PATTERNS = [
  /\b(kill|murder|shoot|stab|bomb|attack|beat\s*up)/gi,
  /\b(gun|weapon|knife|explosive)/gi,
  /\b(threat|hurt|harm|assault)/gi,
  /\b(school\s*shooter|mass\s*shooting)/gi,
];

// Drug-Related Patterns
const DRUG_PATTERNS = [
  /\b(weed|marijuana|cocaine|heroin|meth|lsd|mdma|ecstasy)/gi,
  /\b(drug\s*dealer|selling\s*drugs|buy\s*drugs)/gi,
  /\b(420|blaze\s*it)/gi,
];

// Personal Information Patterns (to prevent doxxing)
const PERSONAL_INFO_PATTERNS = [
  // Phone numbers (various formats)
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  /\b\d{10}\b/g,
  // Email addresses
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  // Addresses (simplified)
  /\b\d{1,5}\s+[\w\s]{1,50}\s+(street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd)\b/gi,
  // Social security numbers (simplified)
  /\b\d{3}-\d{2}-\d{4}\b/g,
];

/**
 * Check if message contains filtered content
 */
export function filterMessage(text: string): FilterResult {
  const result: FilterResult = {
    isClean: true,
    flagged: false,
    severity: 'low',
    originalText: text,
    shouldHide: false,
  };

  if (!text || text.trim().length === 0) {
    return result;
  }

  // Check Scam Patterns
  for (const pattern of SCAM_PATTERNS) {
    if (pattern.test(text)) {
      result.isClean = false;
      result.flagged = true;
      result.category = 'scam';
      result.flagReason = 'Contains potential scam/fraud content';
      result.severity = 'high';
      result.shouldHide = true; // Hide scam messages immediately
      return result;
    }
  }

  // Check Sexual Content
  for (const pattern of SEXUAL_PATTERNS) {
    if (pattern.test(text)) {
      result.isClean = false;
      result.flagged = true;
      result.category = 'sexual';
      result.flagReason = 'Contains sexual content';
      result.severity = 'high';
      result.shouldHide = true; // Hide sexual content immediately
      return result;
    }
  }

  // Check Hate Speech
  for (const pattern of HATE_PATTERNS) {
    if (pattern.test(text)) {
      result.isClean = false;
      result.flagged = true;
      result.category = 'hate';
      result.flagReason = 'Contains hate speech or slurs';
      result.severity = 'high';
      result.shouldHide = true; // Hide hate speech immediately
      return result;
    }
  }

  // Check Violence
  for (const pattern of VIOLENCE_PATTERNS) {
    if (pattern.test(text)) {
      result.isClean = false;
      result.flagged = true;
      result.category = 'violence';
      result.flagReason = 'Contains violent content or threats';
      result.severity = 'high';
      result.shouldHide = true;
      return result;
    }
  }

  // Check Drugs
  for (const pattern of DRUG_PATTERNS) {
    if (pattern.test(text)) {
      result.isClean = false;
      result.flagged = true;
      result.category = 'drugs';
      result.flagReason = 'Contains drug-related content';
      result.severity = 'medium';
      result.shouldHide = false; // Flag but don't auto-hide (could be discussion)
      return result;
    }
  }

  // Check Personal Information
  for (const pattern of PERSONAL_INFO_PATTERNS) {
    if (pattern.test(text)) {
      result.isClean = false;
      result.flagged = true;
      result.category = 'personal_info';
      result.flagReason = 'Contains personal information (potential doxxing)';
      result.severity = 'high';
      result.shouldHide = true;
      return result;
    }
  }

  return result;
}

/**
 * Get user-friendly message for filtered content
 */
export function getFilterMessage(result: FilterResult): string {
  if (result.shouldHide) {
    switch (result.category) {
      case 'scam':
        return 'This message was hidden: potential scam/fraud content detected';
      case 'sexual':
        return 'This message was hidden: inappropriate sexual content';
      case 'hate':
        return 'This message was hidden: hate speech or slurs detected';
      case 'violence':
        return 'This message was hidden: violent content or threats';
      case 'personal_info':
        return 'This message was hidden: personal information detected';
      default:
        return 'This message was hidden: inappropriate content detected';
    }
  } else {
    return 'This message has been flagged for review';
  }
}

/**
 * Check if username is appropriate
 */
export function filterUsername(username: string): { isValid: boolean; reason?: string } {
  const result = filterMessage(username);
  
  if (!result.isClean) {
    return {
      isValid: false,
      reason: result.flagReason || 'Username contains inappropriate content',
    };
  }

  // Additional username-specific checks
  if (username.length < 2) {
    return { isValid: false, reason: 'Username too short' };
  }

  if (username.length > 20) {
    return { isValid: false, reason: 'Username too long' };
  }

  return { isValid: true };
}

/**
 * Sanitize text by replacing filtered words with asterisks
 * (Alternative to hiding - for less severe violations)
 */
export function sanitizeText(text: string): string {
  let sanitized = text;

  const allPatterns = [
    ...SCAM_PATTERNS,
    ...SEXUAL_PATTERNS,
    ...HATE_PATTERNS,
    ...VIOLENCE_PATTERNS,
  ];

  for (const pattern of allPatterns) {
    sanitized = sanitized.replace(pattern, (match) => '*'.repeat(match.length));
  }

  return sanitized;
}

/**
 * Log flagged content (for admin review or analytics)
 */
export interface FlaggedContentLog {
  timestamp: string;
  userId: string;
  crowdId: string;
  messageId: string;
  originalText: string;
  filterResult: FilterResult;
}

// Set to true only for debugging - keeps logs silent by default
const VERBOSE_LOGGING = false;

export function logFlaggedContent(log: FlaggedContentLog): void {
  // Only log to console if verbose logging is enabled
  if (VERBOSE_LOGGING) {
    console.warn('[CONTENT FILTER]', {
      category: log.filterResult.category,
      severity: log.filterResult.severity,
      reason: log.filterResult.flagReason,
      timestamp: log.timestamp,
      crowdId: log.crowdId,
    });
  }

  // Store in localStorage silently
  try {
    const existingLogs = localStorage.getItem('flagged_content_logs');
    const logs = existingLogs ? JSON.parse(existingLogs) : [];
    logs.push(log);
    
    // Keep only last 100 logs
    if (logs.length > 100) {
      logs.shift();
    }
    
    localStorage.setItem('flagged_content_logs', JSON.stringify(logs));
  } catch (e) {
    // Silently fail - don't pollute console with storage errors
    if (VERBOSE_LOGGING) {
      console.error('Failed to log flagged content:', e);
    }
  }
}