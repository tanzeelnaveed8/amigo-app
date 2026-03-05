import { DefaultEventsMap } from '@socket.io/component-emitter';
import { io, Socket } from 'socket.io-client';
import { ACCESS_TOKEN, PORT } from '../apis/base_url';
import { AppState, AppStateStatus } from 'react-native';

const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;
const HEARTBEAT_INTERVAL = 20000;
const MESSAGE_QUEUE_MAX_AGE = 60000;

const SocketServices = () => {
    let socket: Socket<DefaultEventsMap, DefaultEventsMap>;
    let isConnected = false;
    let connectionCallbacks: (() => void)[] = [];
    let currentUserToken: any = null;
    let currentUserId: string | null = null;
    let appStateSubscription: any = null;
    let isMediaOperation = false;
    let messageQueue: Array<{ event: string, data: any, timestamp: number }> = [];
    let isProcessingQueue = false;
    let lastAppState: AppStateStatus = 'active';
    let mediaOperationTimeout: NodeJS.Timeout | null = null;
    let reconnectAttempts = 0;
    let reconnectTimer: NodeJS.Timeout | null = null;
    let heartbeatInterval: NodeJS.Timeout | null = null;
    let lastDisconnectTime: number | null = null;
    const recentMessageIds = new Set<string>();
    const MESSAGE_ID_CACHE_SIZE = 500;

    const clearHeartbeat = () => {
        if (heartbeatInterval) {
            clearInterval(heartbeatInterval);
            heartbeatInterval = null;
        }
    };

    const startHeartbeat = () => {
        clearHeartbeat();
        heartbeatInterval = setInterval(() => {
            if (socket && isConnected) {
                socket.emit('heartbeat', (response: any) => {
                    if (!response) {
                        console.log('Heartbeat failed, connection may be stale');
                    }
                });
            }
        }, HEARTBEAT_INTERVAL);
    };

    const getReconnectDelay = (): number => {
        const delay = Math.min(
            BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts),
            MAX_RECONNECT_DELAY
        );
        const jitter = delay * 0.2 * Math.random();
        return delay + jitter;
    };

    const scheduleReconnect = () => {
        if (reconnectTimer) clearTimeout(reconnectTimer);
        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            console.log('Max reconnect attempts reached');
            return;
        }
        if (isMediaOperation) return;

        const delay = getReconnectDelay();
        console.log(`Scheduling reconnect attempt ${reconnectAttempts + 1} in ${Math.round(delay)}ms`);
        reconnectTimer = setTimeout(() => {
            reconnectAttempts++;
            if (!isConnected && currentUserToken && currentUserId) {
                service.intializeSocket(currentUserToken, currentUserId);
            }
        }, delay);
    };

    const trackMessageId = (id: string): boolean => {
        if (recentMessageIds.has(id)) return true;
        recentMessageIds.add(id);
        if (recentMessageIds.size > MESSAGE_ID_CACHE_SIZE) {
            const firstId = recentMessageIds.values().next().value;
            if (firstId) recentMessageIds.delete(firstId);
        }
        return false;
    };

    const service = {
        intializeSocket: (userToken?: any, id?: string) => {
            currentUserToken = userToken;
            currentUserId = id || null;

            if (socket) {
                socket.removeAllListeners();
                socket.disconnect();
            }
            clearHeartbeat();
            if (reconnectTimer) {
                clearTimeout(reconnectTimer);
                reconnectTimer = null;
            }

            if (appStateSubscription) {
                appStateSubscription.remove();
            }

            appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
                if (isMediaOperation) {
                    lastAppState = nextAppState;
                    return;
                }

                if (nextAppState === 'active' && lastAppState !== 'active') {
                    if (currentUserToken && currentUserId) {
                        if (!socket || !isConnected) {
                            reconnectAttempts = 0;
                            service.intializeSocket(currentUserToken, currentUserId);
                        } else {
                            startHeartbeat();
                        }
                    }
                } else if (nextAppState === 'background') {
                    clearHeartbeat();
                }
                lastAppState = nextAppState;
            });

            socket = io(`http://${ACCESS_TOKEN}:${PORT}`, {
                transports: ['polling', 'websocket'],
                reconnection: false,
                timeout: 20000,
                auth: {
                    token: userToken,
                    id: id
                }
            });

            socket.on('connect', () => {
                console.log('===socket connected===', socket.id);
                isConnected = true;
                reconnectAttempts = 0;

                connectionCallbacks.forEach(callback => callback());
                connectionCallbacks = [];

                service.clearOldMessages();
                service.processMessageQueue();
                startHeartbeat();

                if (lastDisconnectTime && currentUserId) {
                    socket.emit('sidebar', currentUserId);
                    lastDisconnectTime = null;
                }
            });

            socket.on('disconnect', (reason) => {
                console.log('===socket disconnected===', reason);
                isConnected = false;
                lastDisconnectTime = Date.now();
                clearHeartbeat();

                if (reason !== 'io client disconnect' && !isMediaOperation) {
                    scheduleReconnect();
                }
            });

            socket.on('connect_error', (err) => {
                console.log('===socket connect_error===', err.message);
                isConnected = false;
                if (!isMediaOperation) {
                    scheduleReconnect();
                }
            });

            socket.on('error', () => {
                console.log('===socket error===');
            });

            socket.on('leaveMessage', () => {
                console.log('===leave===');
            });
        },
        emit(event: any, data: any = {}) {
            if (socket && isConnected) {
                socket.emit(event, data);
            } else {
                console.log('Socket not connected, queuing message:', event);
                messageQueue.push({
                    event,
                    data,
                    timestamp: Date.now()
                });
                service.ensureConnection();
            }
        },
        retryEmit(event: any, data: any, retryCount: number = 0) {
            const maxRetries = 3;
            if (retryCount >= maxRetries) {
                console.log('Max retries reached for event:', event);
                return;
            }

            if (socket && !isConnected) {
                socket.connect();
            } else if (!socket && currentUserToken && currentUserId) {
                service.intializeSocket(currentUserToken, currentUserId);
            }

            setTimeout(() => {
                if (socket && isConnected) {
                    socket.emit(event, data);
                } else {
                    service.retryEmit(event, data, retryCount + 1);
                }
            }, 500 * Math.pow(2, retryCount));
        },
        processMessageQueue() {
            if (isProcessingQueue || messageQueue.length === 0) return;

            isProcessingQueue = true;

            const processNext = () => {
                if (messageQueue.length === 0) {
                    isProcessingQueue = false;
                    return;
                }

                const message = messageQueue.shift();
                if (message && socket && isConnected) {
                    socket.emit(message.event, message.data);
                    setTimeout(processNext, 50);
                } else {
                    if (message) messageQueue.unshift(message);
                    isProcessingQueue = false;
                }
            };

            processNext();
        },
        on(event: any, cb: any) {
            socket?.on(event, cb);
        },
        off(event: string, cb?: any) {
            if (!socket) return;
            if (cb) {
                socket.off(event, cb);
            } else {
                socket.off(event);
            }
        },
        removeListener(listnerName?: string) {
            if (!socket) return;
            try {
                socket.removeListener(listnerName);
            } catch (error) {
                console.log("socket.removeListener", error);
            }
        },
        removeAllListeners() {
            if (!socket) return;
            try {
                socket.removeAllListeners();
            } catch (error) {
                console.log("socket.removeAllListeners", error);
            }
        },
        disconnect() {
            if (!socket) {
                isConnected = false;
                return;
            }
            try {
                clearHeartbeat();
                if (reconnectTimer) {
                    clearTimeout(reconnectTimer);
                    reconnectTimer = null;
                }
                socket.disconnect();
                isConnected = false;
            } catch (error) {
                console.log("socket.disconnect", error);
            }
        },
        getConnectionStatus() {
            return isConnected;
        },
        onConnect(callback: () => void) {
            if (isConnected) {
                callback();
            } else {
                connectionCallbacks.push(callback);
            }
        },
        ensureConnection() {
            if (!socket || !isConnected) {
                if (currentUserToken && currentUserId) {
                    reconnectAttempts = 0;
                    service.intializeSocket(currentUserToken, currentUserId);
                } else if (socket) {
                    socket.connect();
                }
            }
        },
        waitForConnection(timeout: number = 5000): Promise<boolean> {
            return new Promise((resolve) => {
                if (isConnected) {
                    resolve(true);
                    return;
                }

                service.ensureConnection();

                const startTime = Date.now();
                const checkConnection = () => {
                    if (isConnected) {
                        resolve(true);
                    } else if (Date.now() - startTime > timeout) {
                        resolve(false);
                    } else {
                        setTimeout(checkConnection, 100);
                    }
                };

                checkConnection();
            });
        },
        startMediaOperation() {
            isMediaOperation = true;
            if (mediaOperationTimeout) {
                clearTimeout(mediaOperationTimeout);
                mediaOperationTimeout = null;
            }
            mediaOperationTimeout = setTimeout(() => {
                if (isMediaOperation) {
                    service.endMediaOperation();
                }
            }, 60000);
        },
        endMediaOperation() {
            if (mediaOperationTimeout) {
                clearTimeout(mediaOperationTimeout);
                mediaOperationTimeout = null;
            }
            isMediaOperation = false;
            if (socket && socket.connected) {
                isConnected = true;
            } else if (!isConnected && currentUserToken && currentUserId) {
                service.ensureConnection();
            }
        },
        isMediaOperationActive() {
            return isMediaOperation;
        },
        getQueueStatus() {
            return {
                queueLength: messageQueue.length,
                isProcessing: isProcessingQueue,
                isConnected: isConnected
            };
        },
        clearOldMessages(maxAge: number = MESSAGE_QUEUE_MAX_AGE) {
            const now = Date.now();
            messageQueue = messageQueue.filter(msg => (now - msg.timestamp) < maxAge);
        },
        clearQueue() {
            messageQueue = [];
        },
        isDuplicateMessage(messageId: string): boolean {
            return trackMessageId(messageId);
        },
        emitTyping(roomId: string, userId: string, userName: string, isTyping: boolean) {
            if (socket && isConnected) {
                socket.emit('typing', { roomId, userId, userName, isTyping });
            }
        },
        resetReconnection() {
            reconnectAttempts = 0;
            if (reconnectTimer) {
                clearTimeout(reconnectTimer);
                reconnectTimer = null;
            }
        },
        fullCleanup() {
            try {
                clearHeartbeat();
                if (reconnectTimer) {
                    clearTimeout(reconnectTimer);
                    reconnectTimer = null;
                }
                if (mediaOperationTimeout) {
                    clearTimeout(mediaOperationTimeout);
                    mediaOperationTimeout = null;
                }
                if (appStateSubscription) {
                    appStateSubscription.remove();
                    appStateSubscription = null;
                }
                currentUserToken = null;
                currentUserId = null;
                isMediaOperation = false;
                reconnectAttempts = MAX_RECONNECT_ATTEMPTS;
                messageQueue = [];
                isProcessingQueue = false;
                connectionCallbacks = [];
                recentMessageIds.clear();
                if (socket) {
                    socket.removeAllListeners();
                    socket.disconnect();
                }
                isConnected = false;
            } catch (error) {
                console.log('fullCleanup error:', error);
                isConnected = false;
            }
        }
    };

    return service;
};

const socketServics = SocketServices();

export default socketServics;
