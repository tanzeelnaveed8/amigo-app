import { create } from 'zustand';
import { addDays, addHours } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { addBotsToNewCrowd } from '../lib/ghostBots';
import { useModerationStore } from './useModerationStore';

export interface Crowd {
  id: string;
  name: string;
  createdAt: Date;
  expiresAt: Date;
  createdByGhostName: string;
  createdByGhostSessionId: string;
  durationDays: number;
  qrJoinCode: string;
  secret: string;
  adminOnlyTalk: boolean;
  memberCount: number;
  members: CrowdMember[];
  isDeleted?: boolean;
  pinnedMessageId?: string;
}

export interface CrowdMember {
  ghostSessionId: string;
  ghostName: string;
  joinedAt: Date;
  isAdmin: boolean;
  isCreator?: boolean;
}

interface CrowdState {
  crowds: Record<string, Crowd>;
  activeCrowdId: string | null;
  createCrowd: (name: string, durationDays: number, creatorName: string, creatorSessionId: string) => string;
  joinCrowd: (crowdId: string, ghostName: string, ghostSessionId: string) => { success: boolean; adjustedName?: string; error?: string };
  leaveCrowd: (crowdId: string, ghostSessionId: string) => { canLeave: boolean; needsNewAdmin: boolean };
  deleteCrowd: (crowdId: string) => void;
  setActiveCrowd: (crowdId: string | null) => void;
  getCrowd: (crowdId: string) => Crowd | undefined;
  toggleAdminOnlyTalk: (crowdId: string) => void;
  kickMember: (crowdId: string, ghostSessionId: string) => void;
  promoteMember: (crowdId: string, ghostSessionId: string) => void;
  demoteMember: (crowdId: string, ghostSessionId: string) => void;
  isUserAdmin: (crowdId: string, ghostSessionId: string) => boolean;
  isUserCreator: (crowdId: string, ghostSessionId: string) => boolean;
  isCrowdExpired: (crowdId: string) => boolean;
  getAdminCount: (crowdId: string) => number;
  setPinnedMessage: (crowdId: string, messageId: string | undefined) => void;
}

// Initial Mock Data
const MOCK_CROWD_ID = 'crowd-1';
const initialCrowds: Record<string, Crowd> = {
  [MOCK_CROWD_ID]: {
    id: MOCK_CROWD_ID,
    name: 'Midnight Runners',
    createdAt: new Date(),
    expiresAt: addDays(new Date(), 3),
    createdByGhostName: 'Ghost_Runner',
    createdByGhostSessionId: 'host-1',
    durationDays: 3,
    qrJoinCode: 'mock-qr-code',
    secret: 'secret-1',
    adminOnlyTalk: false,
    memberCount: 3,
    members: [
      {
        ghostSessionId: 'host-1',
        ghostName: 'Ghost_Runner',
        joinedAt: new Date(Date.now() - 1000 * 60 * 70),
        isAdmin: true,
        isCreator: true
      },
      {
        ghostSessionId: 'other',
        ghostName: 'Anon_Owl',
        joinedAt: new Date(Date.now() - 1000 * 60 * 55),
        isAdmin: false
      },
      {
        ghostSessionId: 'member-3',
        ghostName: 'Shadow_Ninja',
        joinedAt: new Date(Date.now() - 1000 * 60 * 30),
        isAdmin: false
      }
    ]
  }
};

// Helper function to resolve name conflicts
function resolveNameConflict(desiredName: string, existingNames: string[]): { name: string; wasAdjusted: boolean } {
  if (!existingNames.includes(desiredName)) {
    return { name: desiredName, wasAdjusted: false };
  }
  
  let counter = 2;
  let adjustedName = `${desiredName}_${counter}`;
  
  while (existingNames.includes(adjustedName)) {
    counter++;
    adjustedName = `${desiredName}_${counter}`;
  }
  
  return { name: adjustedName, wasAdjusted: true };
}

export const useCrowdStore = create<CrowdState>((set, get) => ({
  crowds: initialCrowds,
  activeCrowdId: null,
  createCrowd: (name, durationDays, creatorName, creatorSessionId) => {
    const id = uuidv4();
    const secret = uuidv4();
    const now = new Date();
    const expiresAt = addDays(now, durationDays);
    
    // Generate secure payload for QR code
    const payload = {
      type: 'crowd_join',
      crowdId: id,
      secret: secret,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    };
    
    // Base64 encode the payload
    const qrJoinCode = btoa(JSON.stringify(payload));

    const newCrowd: Crowd = {
      id,
      name,
      createdAt: now,
      expiresAt,
      createdByGhostName: creatorName,
      createdByGhostSessionId: creatorSessionId,
      durationDays,
      qrJoinCode,
      secret,
      adminOnlyTalk: false,
      memberCount: 1,
      members: [{
        ghostName: creatorName,
        ghostSessionId: creatorSessionId,
        joinedAt: now,
        isAdmin: true,
        isCreator: true
      }]
    };
    
    set((state) => ({
      crowds: { ...state.crowds, [id]: newCrowd },
      activeCrowdId: id,
    }));
    
    // Add bots to the new crowd after a short delay
    setTimeout(() => {
      addBotsToNewCrowd(id);
    }, 1000);
    
    return id;
  },
  joinCrowd: (crowdId, ghostName, ghostSessionId) => {
    const crowd = get().crowds[crowdId];
    if (!crowd) return { success: false, error: 'Crowd not found' };
    
    // Check if user is banned
    const isBanned = useModerationStore.getState().isUserBanned(crowdId, ghostSessionId);
    if (isBanned) {
      return { success: false, error: 'You are banned from this crowd.' };
    }
    
    // Check if crowd is deleted or expired
    if (crowd.isDeleted) {
      return { success: false, error: 'This crowd has expired or been deleted.' };
    }
    
    if (new Date() > crowd.expiresAt) {
      return { success: false, error: 'This crowd has expired.' };
    }

    // Check if already member
    const isMember = crowd.members.some(m => m.ghostSessionId === ghostSessionId);
    if (isMember) {
      set({ activeCrowdId: crowdId });
      return { success: true };
    }

    // Resolve name conflicts
    const existingNames = crowd.members.map(m => m.ghostName);
    const { name: adjustedName, wasAdjusted } = resolveNameConflict(ghostName, existingNames);

    const updatedCrowd = {
      ...crowd,
      memberCount: crowd.memberCount + 1,
      members: [
        ...crowd.members,
        {
          ghostName: adjustedName,
          ghostSessionId,
          joinedAt: new Date(),
          isAdmin: false
        }
      ]
    };

    set({
      crowds: { ...get().crowds, [crowdId]: updatedCrowd },
      activeCrowdId: crowdId
    });
    
    return { 
      success: true, 
      adjustedName: wasAdjusted ? adjustedName : undefined 
    };
  },
  leaveCrowd: (crowdId, ghostSessionId) => {
    const crowd = get().crowds[crowdId];
    if (!crowd) return { canLeave: false, needsNewAdmin: false };
    
    const leavingMember = crowd.members.find(m => m.ghostSessionId === ghostSessionId);
    if (!leavingMember) return { canLeave: false, needsNewAdmin: false };
    
    // If user is admin and there are other members
    if (leavingMember.isAdmin && crowd.memberCount > 1) {
      const otherAdmins = crowd.members.filter(m => m.isAdmin && m.ghostSessionId !== ghostSessionId);
      
      // If this is the only admin, prevent leaving
      if (otherAdmins.length === 0) {
        return { canLeave: false, needsNewAdmin: true };
      }
    }
    
    // If admin is the only member, delete crowd
    if (leavingMember.isAdmin && crowd.memberCount === 1) {
      set((state) => ({
        crowds: {
          ...state.crowds,
          [crowdId]: { ...crowd, isDeleted: true, memberCount: 0, members: [] }
        },
        activeCrowdId: null
      }));
      return { canLeave: true, needsNewAdmin: false };
    }
    
    // Remove member (and remove creator flag if they were creator)
    // Creator flag is lost permanently when leaving
    const updatedCrowd = {
      ...crowd,
      memberCount: crowd.memberCount - 1,
      members: crowd.members.filter(m => m.ghostSessionId !== ghostSessionId)
    };
    
    set({
      crowds: { ...get().crowds, [crowdId]: updatedCrowd },
      activeCrowdId: null
    });
    
    return { canLeave: true, needsNewAdmin: false };
  },
  deleteCrowd: (crowdId) => {
    set((state) => {
      const crowd = state.crowds[crowdId];
      if (!crowd) return state;

      return {
        crowds: {
          ...state.crowds,
          [crowdId]: { ...crowd, isDeleted: true, memberCount: 0, members: [] }
        },
        activeCrowdId: state.activeCrowdId === crowdId ? null : state.activeCrowdId
      };
    });
  },
  setActiveCrowd: (id) => set({ activeCrowdId: id }),
  getCrowd: (id) => get().crowds[id],
  toggleAdminOnlyTalk: (crowdId) => {
    set((state) => {
      const crowd = state.crowds[crowdId];
      if (!crowd) return state;

      const updatedCrowd = {
        ...crowd,
        adminOnlyTalk: !crowd.adminOnlyTalk
      };

      return {
        crowds: { ...state.crowds, [crowdId]: updatedCrowd },
        activeCrowdId: crowdId
      };
    });
  },
  kickMember: (crowdId, ghostSessionId) => {
    set((state) => {
      const crowd = state.crowds[crowdId];
      if (!crowd) return state;

      const updatedCrowd = {
        ...crowd,
        memberCount: crowd.memberCount - 1,
        members: crowd.members.filter(m => m.ghostSessionId !== ghostSessionId)
      };

      return {
        crowds: { ...state.crowds, [crowdId]: updatedCrowd },
        activeCrowdId: crowdId
      };
    });
  },
  promoteMember: (crowdId, ghostSessionId) => {
    set((state) => {
      const crowd = state.crowds[crowdId];
      if (!crowd) return state;

      const updatedCrowd = {
        ...crowd,
        members: crowd.members.map(m => 
          m.ghostSessionId === ghostSessionId 
            ? { ...m, isAdmin: true }
            : m
        )
      };

      return {
        crowds: { ...state.crowds, [crowdId]: updatedCrowd }
      };
    });
  },
  demoteMember: (crowdId, ghostSessionId) => {
    set((state) => {
      const crowd = state.crowds[crowdId];
      if (!crowd) return state;

      const updatedCrowd = {
        ...crowd,
        members: crowd.members.map(m => 
          m.ghostSessionId === ghostSessionId 
            ? { ...m, isAdmin: false }
            : m
        )
      };

      return {
        crowds: { ...state.crowds, [crowdId]: updatedCrowd }
      };
    });
  },
  isUserAdmin: (crowdId, ghostSessionId) => {
    const crowd = get().crowds[crowdId];
    if (!crowd) return false;

    const member = crowd.members.find(m => m.ghostSessionId === ghostSessionId);
    return member ? member.isAdmin : false;
  },
  isUserCreator: (crowdId, ghostSessionId) => {
    const crowd = get().crowds[crowdId];
    if (!crowd) return false;

    const member = crowd.members.find(m => m.ghostSessionId === ghostSessionId);
    return member ? (member.isCreator || false) : false;
  },
  isCrowdExpired: (crowdId) => {
    const crowd = get().crowds[crowdId];
    if (!crowd) return true;
    if (crowd.isDeleted) return true;
    return new Date() > crowd.expiresAt;
  },
  getAdminCount: (crowdId) => {
    const crowd = get().crowds[crowdId];
    if (!crowd) return 0;
    return crowd.members.filter(m => m.isAdmin).length;
  },
  setPinnedMessage: (crowdId, messageId) => {
    set((state) => {
      const crowd = state.crowds[crowdId];
      if (!crowd) return state;

      return {
        crowds: {
          ...state.crowds,
          [crowdId]: { ...crowd, pinnedMessageId: messageId }
        }
      };
    });
  }
}));