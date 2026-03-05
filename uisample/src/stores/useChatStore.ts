import { create } from 'zustand';
import { checkContentFilter, useModerationStore } from './useModerationStore';

export interface Message {
  id: string;
  crowdId: string;
  senderGhostName: string;
  senderGhostSessionId: string;
  text: string;
  createdAt: Date;
  isSystem: boolean;
  systemType?: 'join' | 'leave' | 'expiryWarning' | 'expired' | 'adminLock' | 'adminUnlock' | 'kick' | 'promote' | 'demote';
  // Media support
  mediaType?: 'image' | 'video' | 'file';
  mediaUrl?: string;
  mediaName?: string;
}

interface TypingUser {
  ghostName: string;
  ghostSessionId: string;
  crowdId: string;
  timestamp: number;
}

interface ChatState {
  messagesByCrowdId: Record<string, Message[]>;
  typingUsers: TypingUser[];
  sendMessage: (crowdId: string, text: string, senderName: string, senderId: string) => void;
  sendMediaMessage: (crowdId: string, mediaType: 'image' | 'video' | 'file', mediaUrl: string, mediaName: string, senderName: string, senderId: string, caption?: string) => void;
  addSystemMessage: (crowdId: string, text: string, type: Message['systemType']) => void;
  setTyping: (crowdId: string, ghostName: string, ghostSessionId: string, isTyping: boolean) => void;
  getTypingUsersForCrowd: (crowdId: string, excludeSessionId?: string) => string[];
}

const MOCK_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    crowdId: 'crowd-1',
    senderGhostName: 'Ghost_Runner',
    senderGhostSessionId: 'host-1',
    text: '🏃‍♂️ Welcome everyone to Midnight Runners! This crowd is for planning our weekly late-night runs.',
    createdAt: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    isSystem: false,
  },
  {
    id: 'msg-2',
    crowdId: 'crowd-1',
    senderGhostName: 'System',
    senderGhostSessionId: 'system',
    text: 'Anon_Owl joined the crowd.',
    createdAt: new Date(Date.now() - 1000 * 60 * 110),
    isSystem: true,
    systemType: 'join',
  },
  {
    id: 'msg-3',
    crowdId: 'crowd-1',
    senderGhostName: 'Anon_Owl',
    senderGhostSessionId: 'other',
    text: 'Hey! Excited to join. When is the next run?',
    createdAt: new Date(Date.now() - 1000 * 60 * 105),
    isSystem: false,
  },
  {
    id: 'msg-4',
    crowdId: 'crowd-1',
    senderGhostName: 'Ghost_Runner',
    senderGhostSessionId: 'host-1',
    text: 'This Friday at midnight! We meet at Central Park entrance.',
    createdAt: new Date(Date.now() - 1000 * 60 * 100),
    isSystem: false,
  },
  {
    id: 'msg-5',
    crowdId: 'crowd-1',
    senderGhostName: 'System',
    senderGhostSessionId: 'system',
    text: 'Shadow_Ninja joined the crowd.',
    createdAt: new Date(Date.now() - 1000 * 60 * 90),
    isSystem: true,
    systemType: 'join',
  },
  {
    id: 'msg-6',
    crowdId: 'crowd-1',
    senderGhostName: 'Shadow_Ninja',
    senderGhostSessionId: 'member-3',
    text: 'Count me in! What\'s the distance?',
    createdAt: new Date(Date.now() - 1000 * 60 * 85),
    isSystem: false,
  },
  {
    id: 'msg-7',
    crowdId: 'crowd-1',
    senderGhostName: 'Ghost_Runner',
    senderGhostSessionId: 'host-1',
    text: 'We usually do 5-10km depending on the group. All paces welcome! 🏃‍♀️',
    createdAt: new Date(Date.now() - 1000 * 60 * 80),
    isSystem: false,
  },
  {
    id: 'msg-8',
    crowdId: 'crowd-1',
    senderGhostName: 'Anon_Owl',
    senderGhostSessionId: 'other',
    text: 'Perfect! Should we bring anything?',
    createdAt: new Date(Date.now() - 1000 * 60 * 70),
    isSystem: false,
  },
  {
    id: 'msg-9',
    crowdId: 'crowd-1',
    senderGhostName: 'Ghost_Runner',
    senderGhostSessionId: 'host-1',
    text: 'Just water and good vibes! We might grab food after.',
    createdAt: new Date(Date.now() - 1000 * 60 * 65),
    isSystem: false,
  }
];

export const useChatStore = create<ChatState>((set, get) => ({
  messagesByCrowdId: {
    'crowd-1': MOCK_MESSAGES,
  },
  typingUsers: [],
  sendMessage: (crowdId, text, senderName, senderId) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      crowdId,
      senderGhostName: senderName,
      senderGhostSessionId: senderId,
      text,
      createdAt: new Date(),
      isSystem: false,
    };

    set((state) => ({
      messagesByCrowdId: {
        ...state.messagesByCrowdId,
        [crowdId]: [...(state.messagesByCrowdId[crowdId] || []), newMessage],
      },
    }));

    // Auto-flag message if it contains risky keywords
    const flaggedKeywords = checkContentFilter(text);
    if (flaggedKeywords.length > 0) {
      useModerationStore.getState().flagMessage(newMessage.id, crowdId, flaggedKeywords);
    }
  },
  sendMediaMessage: (crowdId, mediaType, mediaUrl, mediaName, senderName, senderId, caption) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      crowdId,
      senderGhostName: senderName,
      senderGhostSessionId: senderId,
      text: caption || '',
      createdAt: new Date(),
      isSystem: false,
      mediaType,
      mediaUrl,
      mediaName,
    };

    set((state) => ({
      messagesByCrowdId: {
        ...state.messagesByCrowdId,
        [crowdId]: [...(state.messagesByCrowdId[crowdId] || []), newMessage],
      },
    }));
  },
  addSystemMessage: (crowdId, text, type) => {
    const newMessage: Message = {
      id: `sys-${Date.now()}`,
      crowdId,
      senderGhostName: 'System',
      senderGhostSessionId: 'system',
      text,
      createdAt: new Date(),
      isSystem: true,
      systemType: type,
    };

    set((state) => ({
      messagesByCrowdId: {
        ...state.messagesByCrowdId,
        [crowdId]: [...(state.messagesByCrowdId[crowdId] || []), newMessage],
      },
    }));
  },
  setTyping: (crowdId, ghostName, ghostSessionId, isTyping) => {
    set((state) => {
      const filtered = state.typingUsers.filter(
        (u) => u.ghostSessionId !== ghostSessionId || u.crowdId !== crowdId
      );
      
      if (isTyping) {
        return {
          typingUsers: [
            ...filtered,
            { crowdId, ghostName, ghostSessionId, timestamp: Date.now() },
          ],
        };
      } else {
        return { typingUsers: filtered };
      }
    });
  },
  getTypingUsersForCrowd: (crowdId, excludeSessionId) => {
    const now = Date.now();
    const TYPING_TIMEOUT = 3000; // 3 seconds
    
    return get()
      .typingUsers.filter(
        (u) =>
          u.crowdId === crowdId &&
          u.ghostSessionId !== excludeSessionId &&
          now - u.timestamp < TYPING_TIMEOUT
      )
      .map((u) => u.ghostName);
  },
}));