import { io, Socket } from 'socket.io-client';
import { BASE_URL } from '../apis/base_url';

let ghostSocket: Socket | null = null;
let isConnected = false;

/**
 * Initialize Ghost Mode Socket Connection
 * Connects to /ghost namespace (no auth required)
 */
export const initializeGhostSocket = (): Socket => {
  // If socket exists and is connected, return it
  if (ghostSocket && ghostSocket.connected) {
    return ghostSocket;
  }

  // If socket exists but not connected, reconnect it
  if (ghostSocket && !ghostSocket.connected) {
    ghostSocket.connect();
    return ghostSocket;
  }

  // Create new socket connection — use regex to strip only the trailing /api
  const socketUrl = BASE_URL.replace(/\/api$/, '');
  ghostSocket = io(`${socketUrl}/ghost`, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 5000,
  });

  ghostSocket.on('connect', () => {
    console.log('Ghost socket connected:', ghostSocket?.id);
    isConnected = true;
  });

  ghostSocket.on('disconnect', (reason) => {
    console.log('Ghost socket disconnected:', reason);
    isConnected = false;
  });

  ghostSocket.on('connect_error', (error) => {
    console.error('Ghost socket connection error:', error);
    isConnected = false;
  });

  return ghostSocket;
};

/**
 * Get Ghost Socket Instance (returns null if not yet initialized)
 */
export const getGhostSocket = (): Socket | null => {
  if (!ghostSocket) {
    return null;
  }
  if (!ghostSocket.connected && !ghostSocket.connecting) {
    console.log('Ghost socket not connected, attempting to reconnect...');
    ghostSocket.connect();
  }
  return ghostSocket;
};

/**
 * Get or create Ghost Socket Instance (use this when entering ghost mode)
 */
export const getOrCreateGhostSocket = (): Socket => {
  if (!ghostSocket) {
    return initializeGhostSocket();
  }
  if (!ghostSocket.connected && !ghostSocket.connecting) {
    ghostSocket.connect();
  }
  return ghostSocket;
};

/**
 * Join a crowd room
 * Ensures socket is connected before joining
 */
export const joinCrowdRoom = (crowdId: string, deviceId: string) => {
  const socket = getGhostSocket();
  if (!socket) {
    console.error('Socket not available');
    return;
  }

  // If socket is already connected, join immediately
  if (socket.connected) {
    socket.emit('joinCrowd', { crowdId, deviceId });
    return;
  }

  // Wait for connection before joining
  socket.once('connect', () => {
    console.log('Socket connected, joining crowd room:', crowdId);
    socket.emit('joinCrowd', { crowdId, deviceId });
  });

  // If socket is connecting, it will join when connected
  // If socket is disconnected, try to connect
  if (!socket.connected && !socket.connecting) {
    socket.connect();
  }
};

/**
 * Leave a crowd room
 */
export const leaveCrowdRoom = (crowdId: string, deviceId: string) => {
  const socket = getGhostSocket();
  if (socket) {
    socket.emit('leaveCrowd', { crowdId, deviceId });
  }
};

/**
 * Send a ghost message via socket
 */
export const sendGhostMessage = (data: {
  crowdId: string;
  deviceId: string;
  ghostName: string;
  text: string;
  media?: string;
}) => {
  const socket = getGhostSocket();
  if (socket) {
    socket.emit('sendGhostMessage', data);
  }
};

/**
 * Listen to ghost messages
 */
export const onGhostMessage = (callback: (message: any) => void) => {
  const socket = getGhostSocket();
  if (socket) {
    socket.on('ghostMessage', callback);
  }
};

/**
 * Listen to member joined event
 */
export const onMemberJoined = (callback: (data: any) => void) => {
  const socket = getGhostSocket();
  if (socket) {
    socket.on('memberJoined', callback);
  }
};

/**
 * Listen to member left event
 */
export const onMemberLeft = (callback: (data: any) => void) => {
  const socket = getGhostSocket();
  if (socket) {
    socket.on('memberLeft', callback);
  }
};

/**
 * Listen to member removed event
 */
export const onMemberRemoved = (callback: (data: any) => void) => {
  const socket = getGhostSocket();
  if (socket) {
    socket.on('memberRemoved', callback);
  }
};

/**
 * Listen to admin updated event
 */
export const onAdminUpdated = (callback: (data: any) => void) => {
  const socket = getGhostSocket();
  if (socket) {
    socket.on('adminUpdated', callback);
  }
};

/**
 * Listen to crowd deleted event
 */
export const onCrowdDeleted = (callback: (data: any) => void) => {
  const socket = getGhostSocket();
  if (socket) {
    socket.on('crowdDeleted', callback);
  }
};

/**
 * Listen to chat lock updated event
 */
export const onChatLockUpdated = (callback: (data: any) => void) => {
  const socket = getGhostSocket();
  if (socket) {
    socket.on('chatLockUpdated', callback);
  }
};

/**
 * Listen to message pinned event
 */
export const onMessagePinned = (callback: (data: any) => void) => {
  const socket = getGhostSocket();
  if (socket) {
    socket.on('messagePinned', callback);
  }
};

/**
 * Listen to message unpinned event
 */
export const onMessageUnpinned = (callback: (data: any) => void) => {
  const socket = getGhostSocket();
  if (socket) {
    socket.on('messageUnpinned', callback);
  }
};

/**
 * Listen to mute updated event (member muted or unmuted)
 */
export const onMuteUpdated = (callback: (data: { crowdId: string; memberDeviceId: string; mutedUntil: string | null }) => void) => {
  const socket = getGhostSocket();
  if (socket) {
    socket.on('muteUpdated', callback);
  }
};

/**
 * Emit typing start event
 */
export const emitTypingStart = (crowdId: string, deviceId: string, ghostName: string) => {
  const socket = getGhostSocket();
  if (socket) {
    socket.emit('typingStart', { crowdId, deviceId, ghostName });
  }
};

/**
 * Emit typing stop event
 */
export const emitTypingStop = (crowdId: string, deviceId: string) => {
  const socket = getGhostSocket();
  if (socket) {
    socket.emit('typingStop', { crowdId, deviceId });
  }
};

/**
 * Listen to user typing event
 */
export const onUserTyping = (callback: (data: any) => void) => {
  const socket = getGhostSocket();
  if (socket) {
    socket.on('userTyping', callback);
  }
};

/**
 * Remove all listeners
 */
export const removeAllGhostListeners = () => {
  const socket = getGhostSocket();
  if (socket) {
    socket.removeAllListeners();
  }
};

/**
 * Disconnect ghost socket
 */
export const disconnectGhostSocket = () => {
  if (ghostSocket) {
    ghostSocket.disconnect();
    ghostSocket = null;
    isConnected = false;
  }
};

