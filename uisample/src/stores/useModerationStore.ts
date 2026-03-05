import { create } from 'zustand';

export interface MessageReport {
  id: string;
  messageId: string;
  crowdId: string;
  reportedBy: string; // ghostSessionId
  reportedByName: string; // ghostName
  reason: 'spam' | 'harassment' | 'hate' | 'sexual' | 'other';
  details?: string;
  timestamp: Date;
  status: 'pending' | 'reviewed' | 'ignored';
}

export interface CrowdReport {
  id: string;
  crowdId: string;
  reportedBy: string; // ghostSessionId
  reportedByName: string; // ghostName
  reason: 'spam' | 'harassment' | 'hate' | 'sexual' | 'other';
  details?: string;
  timestamp: Date;
  status: 'pending' | 'reviewed' | 'ignored';
}

export interface BannedUser {
  ghostSessionId: string;
  ghostName: string;
  crowdId: string;
  bannedBy: string; // ghostSessionId of admin
  bannedAt: Date;
  reason?: string;
}

export interface MutedUser {
  ghostSessionId: string;
  ghostName: string;
  crowdId: string;
  mutedBy: string; // ghostSessionId of admin
  mutedAt: Date;
  mutedUntil: Date | null; // null = permanent
  reason?: string;
}

export interface FlaggedMessage {
  messageId: string;
  crowdId: string;
  keywords: string[];
  flaggedAt: Date;
  reviewedBy?: string;
}

interface ModerationState {
  messageReports: MessageReport[];
  crowdReports: CrowdReport[];
  bannedUsers: BannedUser[];
  mutedUsers: MutedUser[];
  flaggedMessages: FlaggedMessage[];
  
  // Message Reporting
  reportMessage: (
    messageId: string,
    crowdId: string,
    reportedBy: string,
    reportedByName: string,
    reason: MessageReport['reason'],
    details?: string
  ) => void;
  
  // Crowd Reporting
  reportCrowd: (
    crowdId: string,
    reportedBy: string,
    reportedByName: string,
    reason: CrowdReport['reason'],
    details?: string
  ) => void;
  
  // Banning
  banUser: (
    crowdId: string,
    ghostSessionId: string,
    ghostName: string,
    bannedBy: string,
    reason?: string
  ) => void;
  unbanUser: (crowdId: string, ghostSessionId: string) => void;
  isUserBanned: (crowdId: string, ghostSessionId: string) => boolean;
  getBannedUsersForCrowd: (crowdId: string) => BannedUser[];
  
  // Muting
  muteUser: (
    crowdId: string,
    ghostSessionId: string,
    ghostName: string,
    mutedBy: string,
    duration: 'hour' | 'day' | 'permanent',
    reason?: string
  ) => void;
  unmuteUser: (crowdId: string, ghostSessionId: string) => void;
  isUserMuted: (crowdId: string, ghostSessionId: string) => boolean;
  getMutedUsersForCrowd: (crowdId: string) => MutedUser[];
  getMuteExpiry: (crowdId: string, ghostSessionId: string) => Date | null | undefined;
  
  // Content Filtering
  flagMessage: (messageId: string, crowdId: string, keywords: string[]) => void;
  isMessageFlagged: (messageId: string) => boolean;
  getFlaggedMessagesForCrowd: (crowdId: string) => FlaggedMessage[];
  
  // Admin Actions
  ignoreReport: (reportId: string, type: 'message' | 'crowd') => void;
  getReportsForCrowd: (crowdId: string) => { messages: MessageReport[]; crowds: CrowdReport[] };
}

// Content filter keywords
const SPAM_KEYWORDS = ['upi', 'free money', 'win prize', 'click here', 'limited offer', 'earn cash'];
const SEXUAL_KEYWORDS = ['sex', 'porn', 'nude', 'xxx'];
const HATE_KEYWORDS = ['kill', 'die', 'hate'];

export const checkContentFilter = (text: string): string[] => {
  const lowerText = text.toLowerCase();
  const flaggedKeywords: string[] = [];
  
  [...SPAM_KEYWORDS, ...SEXUAL_KEYWORDS, ...HATE_KEYWORDS].forEach(keyword => {
    if (lowerText.includes(keyword)) {
      flaggedKeywords.push(keyword);
    }
  });
  
  return flaggedKeywords;
};

export const useModerationStore = create<ModerationState>((set, get) => ({
  messageReports: [],
  crowdReports: [],
  bannedUsers: [],
  mutedUsers: [],
  flaggedMessages: [],
  
  reportMessage: (messageId, crowdId, reportedBy, reportedByName, reason, details) => {
    const newReport: MessageReport = {
      id: `report-${Date.now()}`,
      messageId,
      crowdId,
      reportedBy,
      reportedByName,
      reason,
      details,
      timestamp: new Date(),
      status: 'pending'
    };
    
    set(state => ({
      messageReports: [...state.messageReports, newReport]
    }));
  },
  
  reportCrowd: (crowdId, reportedBy, reportedByName, reason, details) => {
    const newReport: CrowdReport = {
      id: `crowd-report-${Date.now()}`,
      crowdId,
      reportedBy,
      reportedByName,
      reason,
      details,
      timestamp: new Date(),
      status: 'pending'
    };
    
    set(state => ({
      crowdReports: [...state.crowdReports, newReport]
    }));
  },
  
  banUser: (crowdId, ghostSessionId, ghostName, bannedBy, reason) => {
    const newBan: BannedUser = {
      ghostSessionId,
      ghostName,
      crowdId,
      bannedBy,
      bannedAt: new Date(),
      reason
    };
    
    set(state => ({
      bannedUsers: [...state.bannedUsers, newBan]
    }));
  },
  
  unbanUser: (crowdId, ghostSessionId) => {
    set(state => ({
      bannedUsers: state.bannedUsers.filter(
        b => !(b.crowdId === crowdId && b.ghostSessionId === ghostSessionId)
      )
    }));
  },
  
  isUserBanned: (crowdId, ghostSessionId) => {
    return get().bannedUsers.some(
      b => b.crowdId === crowdId && b.ghostSessionId === ghostSessionId
    );
  },
  
  getBannedUsersForCrowd: (crowdId) => {
    return get().bannedUsers.filter(b => b.crowdId === crowdId);
  },
  
  muteUser: (crowdId, ghostSessionId, ghostName, mutedBy, duration, reason) => {
    const now = new Date();
    let mutedUntil: Date | null;
    
    switch (duration) {
      case 'hour':
        mutedUntil = new Date(now.getTime() + 60 * 60 * 1000);
        break;
      case 'day':
        mutedUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'permanent':
        mutedUntil = null;
        break;
    }
    
    // Remove existing mute if any
    set(state => ({
      mutedUsers: state.mutedUsers.filter(
        m => !(m.crowdId === crowdId && m.ghostSessionId === ghostSessionId)
      )
    }));
    
    // Add new mute
    const newMute: MutedUser = {
      ghostSessionId,
      ghostName,
      crowdId,
      mutedBy,
      mutedAt: now,
      mutedUntil,
      reason
    };
    
    set(state => ({
      mutedUsers: [...state.mutedUsers, newMute]
    }));
  },
  
  unmuteUser: (crowdId, ghostSessionId) => {
    set(state => ({
      mutedUsers: state.mutedUsers.filter(
        m => !(m.crowdId === crowdId && m.ghostSessionId === ghostSessionId)
      )
    }));
  },
  
  isUserMuted: (crowdId, ghostSessionId) => {
    const mute = get().mutedUsers.find(
      m => m.crowdId === crowdId && m.ghostSessionId === ghostSessionId
    );
    
    if (!mute) return false;
    
    // If permanent mute
    if (mute.mutedUntil === null) return true;
    
    // Check if mute expired
    return new Date() < mute.mutedUntil;
  },
  
  getMutedUsersForCrowd: (crowdId) => {
    const now = new Date();
    return get().mutedUsers.filter(m => {
      if (m.crowdId !== crowdId) return false;
      if (m.mutedUntil === null) return true; // Permanent
      return now < m.mutedUntil; // Not expired
    });
  },
  
  getMuteExpiry: (crowdId, ghostSessionId) => {
    const mute = get().mutedUsers.find(
      m => m.crowdId === crowdId && m.ghostSessionId === ghostSessionId
    );
    return mute?.mutedUntil;
  },
  
  flagMessage: (messageId, crowdId, keywords) => {
    const existing = get().flaggedMessages.find(f => f.messageId === messageId);
    if (existing) return; // Already flagged
    
    const newFlag: FlaggedMessage = {
      messageId,
      crowdId,
      keywords,
      flaggedAt: new Date()
    };
    
    set(state => ({
      flaggedMessages: [...state.flaggedMessages, newFlag]
    }));
  },
  
  isMessageFlagged: (messageId) => {
    return get().flaggedMessages.some(f => f.messageId === messageId);
  },
  
  getFlaggedMessagesForCrowd: (crowdId) => {
    return get().flaggedMessages.filter(f => f.crowdId === crowdId);
  },
  
  ignoreReport: (reportId, type) => {
    if (type === 'message') {
      set(state => ({
        messageReports: state.messageReports.map(r =>
          r.id === reportId ? { ...r, status: 'ignored' as const } : r
        )
      }));
    } else {
      set(state => ({
        crowdReports: state.crowdReports.map(r =>
          r.id === reportId ? { ...r, status: 'ignored' as const } : r
        )
      }));
    }
  },
  
  getReportsForCrowd: (crowdId) => {
    const messages = get().messageReports.filter(r => r.crowdId === crowdId && r.status === 'pending');
    const crowds = get().crowdReports.filter(r => r.crowdId === crowdId && r.status === 'pending');
    return { messages, crowds };
  }
}));
