import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { persist } from 'zustand/middleware';

export interface BlockedUser {
  id: string;
  name: string;
  avatar?: string;
  blockedAt: number;
}

interface SessionState {
  mode: 'ghost' | 'authenticated' | 'unauthenticated';
  ghostName: string | null;
  ghostSessionId: string | null;
  ghostNameCreatedAt: Date | null;
  lastUsedCrowdId: string | null;
  recentCrowds: string[];
  crowdsCreatedToday: number;
  lastCrowdCreationDate: string | null;
  blockedUsers: BlockedUser[];
  hasSeenWelcomeMessage: boolean;
  
  // Room and Signal tracking
  roomsCreatedToday: number;
  lastRoomCreationDate: string | null;
  hasSignal: boolean;
  
  enterGhostMode: (name: string) => void;
  exitGhostMode: () => void;
  setGhostName: (name: string) => void;
  setLastUsedCrowd: (crowdId: string) => void;
  incrementCrowdCreation: () => void;
  canCreateCrowd: () => boolean;
  blockUser: (sessionId: string, name?: string, avatar?: string) => void;
  unblockUser: (sessionId: string) => void;
  isUserBlocked: (sessionId: string) => boolean;
  markWelcomeMessageAsSeen: () => void;
  
  // Room and Signal methods
  incrementRoomCreation: () => void;
  canCreateRoom: () => boolean;
  getRoomsCreatedToday: () => number;
  createSignal: () => void;
  
  // Theme state
  amigoThemeMode: 'day' | 'night' | 'ghost';
  setAmigoThemeMode: (mode: 'day' | 'night' | 'ghost') => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  mode: 'unauthenticated',
  amigoThemeMode: 'night', // Default theme (dark blue to match login/signup)
  ghostName: null,
  ghostSessionId: null,
  ghostNameCreatedAt: null,
  lastUsedCrowdId: null,
  recentCrowds: [],
  crowdsCreatedToday: 0,
  lastCrowdCreationDate: null,
  blockedUsers: [],
  hasSeenWelcomeMessage: false,
  
  // Room and Signal tracking
  roomsCreatedToday: 0,
  lastRoomCreationDate: null,
  hasSignal: false,
  
  enterGhostMode: (name) => set({
    mode: 'ghost',
    ghostName: name,
    ghostSessionId: uuidv4(),
    ghostNameCreatedAt: new Date(),
    recentCrowds: [],
  }),
  exitGhostMode: () => set({
    mode: 'unauthenticated',
    ghostName: null,
    ghostSessionId: null,
    ghostNameCreatedAt: null,
    lastUsedCrowdId: null,
    recentCrowds: [],
    crowdsCreatedToday: 0,
    lastCrowdCreationDate: null,
    blockedUsers: [],
  }),
  setGhostName: (name) => set({
    ghostName: name,
    ghostNameCreatedAt: new Date(),
  }),
  setLastUsedCrowd: (crowdId) => set((state) => ({
    lastUsedCrowdId: crowdId,
    recentCrowds: state.recentCrowds.includes(crowdId) 
      ? state.recentCrowds 
      : [...state.recentCrowds, crowdId]
  })),
  incrementCrowdCreation: () => set((state) => {
    const today = new Date().toDateString();
    const isToday = state.lastCrowdCreationDate === today;
    
    return {
      crowdsCreatedToday: isToday ? state.crowdsCreatedToday + 1 : 1,
      lastCrowdCreationDate: today,
    };
  }),
  canCreateCrowd: () => {
    const state = get();
    const today = new Date().toDateString();
    const isToday = state.lastCrowdCreationDate === today;
    
    if (!isToday) return true;
    return state.crowdsCreatedToday < 3;
  },
  blockUser: (sessionId, name = 'Unknown User', avatar) => set((state) => {
    // Check if already blocked
    if (state.blockedUsers.some(u => u.id === sessionId)) return {};
    
    return {
      blockedUsers: [...state.blockedUsers, {
        id: sessionId,
        name,
        avatar,
        blockedAt: Date.now()
      }],
    };
  }),
  unblockUser: (sessionId) => set((state) => ({
    blockedUsers: state.blockedUsers.filter(u => u.id !== sessionId),
  })),
  isUserBlocked: (sessionId) => get().blockedUsers.some(u => u.id === sessionId),
  markWelcomeMessageAsSeen: () => set({ hasSeenWelcomeMessage: true }),
  
  // Room and Signal methods
  incrementRoomCreation: () => set((state) => {
    const today = new Date().toDateString();
    const isToday = state.lastRoomCreationDate === today;
    
    return {
      roomsCreatedToday: isToday ? state.roomsCreatedToday + 1 : 1,
      lastRoomCreationDate: today,
    };
  }),
  canCreateRoom: () => {
    const state = get();
    const today = new Date().toDateString();
    const isToday = state.lastRoomCreationDate === today;
    
    if (!isToday) return true;
    return state.roomsCreatedToday < 3;
  },
  getRoomsCreatedToday: () => get().roomsCreatedToday,
  createSignal: () => set({ hasSignal: true }),
  
  setAmigoThemeMode: (mode) => set({ amigoThemeMode: mode }),
}));

export const usePersistedSessionStore = persist(useSessionStore, {
  name: 'session-store',
});