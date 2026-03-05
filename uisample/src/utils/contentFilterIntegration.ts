/**
 * Content Filter Integration Guide
 * 
 * This file shows how to integrate the content filter into your chat system
 */

import { filterMessage, filterUsername, logFlaggedContent, FilterResult } from './contentFilter';

// ============================================
// EXAMPLE 1: Filter messages before sending
// ============================================

export function sendMessage(
  messageText: string,
  userId: string,
  crowdId: string,
  messageId: string
): { success: boolean; error?: string; filterResult?: FilterResult } {
  // Run content filter
  const filterResult = filterMessage(messageText);

  // If message should be hidden, reject it
  if (filterResult.shouldHide) {
    // Log the violation
    logFlaggedContent({
      timestamp: new Date().toISOString(),
      userId,
      crowdId,
      messageId,
      originalText: messageText,
      filterResult,
    });

    return {
      success: false,
      error: `Message blocked: ${filterResult.flagReason}`,
      filterResult,
    };
  }

  // If flagged but not hidden, send with flag
  if (filterResult.flagged) {
    logFlaggedContent({
      timestamp: new Date().toISOString(),
      userId,
      crowdId,
      messageId,
      originalText: messageText,
      filterResult,
    });

    // Send message but mark as flagged in your database
    // Your backend should store: { ...message, flagged: true, flagReason: filterResult.flagReason }
  }

  return {
    success: true,
    filterResult,
  };
}

// ============================================
// EXAMPLE 2: Filter messages when receiving
// ============================================

export interface Message {
  id: string;
  text: string;
  userId: string;
  crowdId: string;
  timestamp: string;
  flagged?: boolean;
  flagReason?: string;
  shouldHide?: boolean;
}

export function processReceivedMessage(message: Message): Message {
  const filterResult = filterMessage(message.text);

  return {
    ...message,
    flagged: filterResult.flagged,
    flagReason: filterResult.flagReason,
    shouldHide: filterResult.shouldHide,
  };
}

// ============================================
// EXAMPLE 3: Filter username during setup
// ============================================

export function validateUsername(username: string): { valid: boolean; error?: string } {
  const result = filterUsername(username);

  if (!result.isValid) {
    return {
      valid: false,
      error: result.reason || 'Username contains inappropriate content',
    };
  }

  return { valid: true };
}

// ============================================
// EXAMPLE 4: React Hook for filtering
// ============================================

import { useState, useCallback } from 'react';

export function useContentFilter() {
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState<string>('');

  const checkMessage = useCallback((text: string): FilterResult => {
    const result = filterMessage(text);
    
    if (result.shouldHide) {
      setIsBlocked(true);
      setBlockReason(result.flagReason || 'Message contains inappropriate content');
    } else {
      setIsBlocked(false);
      setBlockReason('');
    }

    return result;
  }, []);

  const resetBlock = useCallback(() => {
    setIsBlocked(false);
    setBlockReason('');
  }, []);

  return {
    checkMessage,
    isBlocked,
    blockReason,
    resetBlock,
  };
}

// ============================================
// EXAMPLE 5: Real-time input validation
// ============================================

export function validateInputRealtime(text: string): {
  hasWarning: boolean;
  warningMessage?: string;
  severity: 'low' | 'medium' | 'high';
} {
  const result = filterMessage(text);

  if (!result.flagged) {
    return { hasWarning: false, severity: 'low' };
  }

  if (result.shouldHide) {
    return {
      hasWarning: true,
      warningMessage: `⚠️ This message will be blocked: ${result.flagReason}`,
      severity: result.severity,
    };
  }

  return {
    hasWarning: true,
    warningMessage: `⚠️ This message will be flagged for review`,
    severity: result.severity,
  };
}

// ============================================
// EXAMPLE 6: Batch filter for message history
// ============================================

export function filterMessageHistory(messages: Message[]): Message[] {
  return messages.map((message) => {
    const filterResult = filterMessage(message.text);
    
    return {
      ...message,
      flagged: filterResult.flagged,
      flagReason: filterResult.flagReason,
      shouldHide: filterResult.shouldHide,
      // Replace text if should hide
      text: filterResult.shouldHide ? '[Message Hidden]' : message.text,
    };
  });
}

// ============================================
// EXAMPLE 7: Get filtered content statistics
// ============================================

export function getFilterStatistics(): {
  totalFlagged: number;
  byCategory: Record<string, number>;
  recentFlags: any[];
} {
  try {
    const logs = localStorage.getItem('flagged_content_logs');
    if (!logs) {
      return { totalFlagged: 0, byCategory: {}, recentFlags: [] };
    }

    const parsedLogs = JSON.parse(logs);
    
    const byCategory: Record<string, number> = {};
    parsedLogs.forEach((log: any) => {
      const category = log.filterResult.category || 'unknown';
      byCategory[category] = (byCategory[category] || 0) + 1;
    });

    return {
      totalFlagged: parsedLogs.length,
      byCategory,
      recentFlags: parsedLogs.slice(-10),
    };
  } catch (e) {
    return { totalFlagged: 0, byCategory: {}, recentFlags: [] };
  }
}
