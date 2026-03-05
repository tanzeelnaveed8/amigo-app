import React, { useState, useRef, useEffect, useMemo, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Alert,
  ActivityIndicator,
  Image,
  Linking,
  BackHandler,
  Keyboard,
  Animated,
  InteractionManager,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { launchImageLibrary, launchCamera } from '../../utils/imagePickerCompat';
import DocumentPicker from '../../utils/documentPickerCompat';
import Hyperlink from 'react-native-hyperlink';
import LinkifyIt from 'linkify-it';
import BackButtonIcon from '../../assets/svg/BackButtonIcon';
import UserGroupIcon from '../../assets/svg/UserGroupIcon';
import MenuIcon from '../../assets/svg/MenuIcon';
import LockIcon from '../../assets/svg/LockIcon';
import SendIcon from '../../assets/svg/SendIcon';
import AdminShieldIcon from '../../assets/svg/AdminShieldIcon';
import UnlockIcon from '../../assets/svg/UnlockIcon';
import QRCodeIcon from '../../assets/svg/QRCodeIcon';
import RemoveUserIcon from '../../assets/svg/RemoveUserIcon';
import DeleteBinIcon from '../../assets/svg/DeleteBinIcon';
import LeaveDoorIcon from '../../assets/svg/LeaveDoorIcon';
import GhostIcon from '../../assets/svg/GhostIcon';
import WarningIcon from '../../assets/svg/WarningIcon';
import InfoIcon from '../../assets/svg/InfoIcon';
import AttachmentIcon from '../../assets/svg/AttachmentIcon';
import FlagIcon from '../../assets/svg/FlagIcon';
import CopyIcon from '../../assets/svg/CopyIcon';
import PinIcon from '../../assets/svg/PinIcon';
import CrossIcon from '../../assets/svg/CrossIcon';
import TickIcon from '../../assets/svg/TickIcon';
import ShareFileIcon from '../../assets/svg/sharefile.icon';
import ConfirmationModal from '../../component/Ghost/ConfirmationModal';
import ShareMediaModal from '../../component/Ghost/ShareMediaModal';
import ReportCrowdModal from '../../component/Ghost/ReportCrowdModal';
import BlockMemberModal from '../../component/Ghost/BlockMemberModal';
import BlockUserModal from '../../component/Ghost/BlockUserModal';
import MuteMemberModal from '../../component/Ghost/MuteMemberModal';
import { FontFamily } from '../../../GlobalStyles';
import { getCrowdMessages, sendMessage, deleteCrowd, leaveCrowd, getCrowdMembers, getCrowdInfo, toggleChatLock, uploadGhostMedia, pinMessage, unpinMessage, removeMember, muteMember, unmuteMember, reportCrowd, reportMessage, blockUser, getBlockedUsers } from '../../apis/ghost';
import { getGhostDeviceId } from '../../utils/ghostDeviceId';
import { getCrowdDisplayName } from '../../utils/helper';
import {
  joinCrowdRoom,
  leaveCrowdRoom,
  onGhostMessage,
  onMemberJoined,
  onMemberLeft,
  onMemberRemoved,
  onAdminUpdated,
  onCrowdDeleted,
  onChatLockUpdated,
  onMessagePinned,
  onMessageUnpinned,
  onMuteUpdated,
  removeAllGhostListeners,
  sendGhostMessage,
  initializeGhostSocket,
  emitTypingStart,
  emitTypingStop,
  onUserTyping,
} from '../../utils/ghostSocket';
import Context from '../../context';
import BanSvg from '../../assets/svg/BanSVG';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Initialize linkify for URL detection
const linkify = new LinkifyIt();

linkify.add('tel:', {
  validate: (text, pos, self) => {
    const tail = text.slice(pos);
    if (!self.re.phone) {
      // Use a more accurate regex for phone numbers
      self.re.phone = /(\+?\d{1,4}[\s-]?)?(\(?\d{1,4}?\)?[\s-]?)?[\d\s-]{3,15}/;
    }
    const match = self.re.phone.exec(tail);
    if (!match) {
      return 0;
    }
    const phone = match[0];
    return phone.length;
  },
});

// Generate initials from name
const getInitials = (name) => {
  if (!name || name.trim().length === 0) return 'G';
  
  const words = name.trim().split(/\s+/).filter(word => word.length > 0);
  
  if (words.length === 0) return 'G';
  if (words.length === 1) {
    const firstChar = words[0][0].toUpperCase();
    return firstChar.length > 0 ? firstChar : 'G';
  }
  
  // Get first letter of first word and first letter of last word
  const firstInitial = words[0][0].toUpperCase();
  const lastInitial = words[words.length - 1][0].toUpperCase();
  return `${firstInitial}${lastInitial}`;
};

// Format time to HH:MM
const formatTime = (date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Extract file name from URL
const extractFileName = (url, fileExtension = null) => {
  if (!url) return 'Document';
  try {
    // Extract from S3 URL format: uploads/timestamp-random-originalname
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    if (!fileName || fileName.trim().length === 0) {
      return fileExtension ? `Document.${fileExtension}` : 'Document';
    }
    
    // Remove the timestamp and random prefix if present
    // Format: timestamp-random-originalname
    const parts = fileName.split('-');
    if (parts.length > 2) {
      // Return the original filename (everything after the second dash)
      const originalName = parts.slice(2).join('-');
      if (originalName) {
        return originalName;
      }
    }
    
    // If we have file extension but no name, create a name with extension
    if (fileExtension && !fileName.includes('.')) {
      return `Document.${fileExtension}`;
    }
    
    // If no dashes, return the filename as is
    return fileName || (fileExtension ? `Document.${fileExtension}` : 'Document');
  } catch (error) {
    console.error('Error extracting filename:', error);
    return fileExtension ? `Document.${fileExtension}` : 'Document';
  }
};

// Handle file download
const handleFileDownload = async (url) => {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'Unable to open file');
    }
  } catch (error) {
    console.error('Error opening file:', error);
    Alert.alert('Error', 'Failed to open file');
  }
};

// Generate random color for avatar
const generateAvatarColor = (name) => {
  const colors = [
    '#155DFC', '#9B7BFF', '#FF6B6B', '#4ECDC4', '#45B7D1',
    '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    '#F8B739', '#E74C3C', '#3498DB', '#2ECC71', '#F39C12',
  ];
  // Use name to generate consistent color
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Animated Typing Dots Component
const TypingDots = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create smooth up and down animation for each dot with delays
    const createAnimation = (animValue, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Start animations with staggered delays for smooth wave effect
    const anim1 = createAnimation(dot1, 0);
    const anim2 = createAnimation(dot2, 150);
    const anim3 = createAnimation(dot3, 300);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, []);

  // Interpolate vertical position (up and down movement)
  const translateY1 = dot1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });
  const translateY2 = dot2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });
  const translateY3 = dot3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  return (
    <View style={styles.typingDotsContainer}>
      <Animated.View
        style={[
          styles.typingDot,
          {
            transform: [{ translateY: translateY1 }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.typingDot,
          {
            transform: [{ translateY: translateY2 }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.typingDot,
          {
            transform: [{ translateY: translateY3 }],
          },
        ]}
      />
    </View>
  );
};

const CrowdChatScreen = ({ navigation }) => {
  const route = useRoute();
  const { crowdId, crowdName, ghostName, avatarBgColor, isCreator, duration, qrCodeData } = route.params || {};
  const { setLoader, setToastMsg } = useContext(Context);
  const scrollViewRef = useRef(null);
  const menuButtonRef = useRef(null);
  const messagePositionsRef = useRef(new Map());
  const [messageText, setMessageText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLeaveWarningModal, setShowLeaveWarningModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReportMessageModal, setShowReportMessageModal] = useState(false);
  const [showBlockMemberModal, setShowBlockMemberModal] = useState(false);
  const [showBlockUserModal, setShowBlockUserModal] = useState(false);
  const [showMuteMemberModal, setShowMuteMemberModal] = useState(false);
  const [currentUserMutedUntil, setCurrentUserMutedUntil] = useState(null);
  const [mutedMembersMap, setMutedMembersMap] = useState({});
  const [showMessageMenu, setShowMessageMenu] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageMenuPosition, setMessageMenuPosition] = useState({ top: 0, left: 0 });
  const messageMenuRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [deviceId, setDeviceId] = useState(null);
  const [userIsCreator, setUserIsCreator] = useState(isCreator || false);
  const [userIsAdmin, setUserIsAdmin] = useState(isCreator || false);
  const [isChatLocked, setIsChatLocked] = useState(false);
  const [showShareMediaModal, setShowShareMediaModal] = useState(false);
  const [isPickerLaunching, setIsPickerLaunching] = useState(false); // For camera and document picker
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [pinnedMessage, setPinnedMessage] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewMediaType, setPreviewMediaType] = useState(null);
  const [previewFileExtension, setPreviewFileExtension] = useState(null);
  const [previewCaption, setPreviewCaption] = useState('');
  const [expiresAt, setExpiresAt] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]); // Track users who are typing
  const [blockedUserIds, setBlockedUserIds] = useState(new Set()); // Track blocked user device IDs
  const pendingMessagesRef = useRef(new Map()); // Track pending messages by temp ID
  const socketMessageExpectedRef = useRef(new Set()); // Track if socket message is expected for a temp message
  const isChatLockedRef = useRef(false); // Track chat lock status for socket handler
  const typingTimeoutRef = useRef(null); // Timer for debouncing typing stop
  const typingIntervalRef = useRef(null); // Interval for sending periodic typing events
  const isTypingRef = useRef(false); // Track if current user is typing
  const userDeletedCrowdRef = useRef(false); // Track if current user initiated the deletion
  const refreshCrowdMuteStateRef = useRef(null); // Always call latest refresh so socket handler sees current deviceId

  const currentUserGhostName = ghostName || 'Ghost';
  const currentUserAvatarColor = avatarBgColor || '#155DFC';
  const currentUserInitials = useMemo(() => getInitials(currentUserGhostName), [currentUserGhostName]);

  // Initialize device ID and load messages
  useEffect(() => {
    const initialize = async () => {
      if (!crowdId) {
        setToastMsg('Crowd ID is missing');
        navigation.goBack();
        return;
      }

      try {
        const id = await getGhostDeviceId();
        setDeviceId(id);

        // Get crowd info to determine if user is creator/admin and chat lock status
        const crowdInfoResponse = await getCrowdInfo(crowdId, id);
        if (crowdInfoResponse.status === 200 && crowdInfoResponse.data) {
          setUserIsCreator(crowdInfoResponse.data.isCreator || false);
          // User is admin if they are creator or if they are in the members list as admin
          const currentMember = crowdInfoResponse.data.members?.find(m => m.deviceId === id);
          setUserIsAdmin(currentMember?.isAdmin || crowdInfoResponse.data.isCreator || false);
          const lockStatus = crowdInfoResponse.data.isChatLocked || false;
          setIsChatLocked(lockStatus);
          isChatLockedRef.current = lockStatus;
          setCurrentUserMutedUntil(crowdInfoResponse.data.currentUserMutedUntil || null);
          const mutedMap = {};
          (crowdInfoResponse.data.members || []).forEach(m => {
            if (m.mutedUntil) mutedMap[m.deviceId] = m.mutedUntil;
          });
          setMutedMembersMap(mutedMap);
          // Store expiresAt for accurate expiry calculation
          if (crowdInfoResponse.data.expiresAt) {
            setExpiresAt(crowdInfoResponse.data.expiresAt);
          }
          
          // Load pinned message if exists
          if (crowdInfoResponse.data.pinnedMessage) {
            const pinnedMsg = crowdInfoResponse.data.pinnedMessage;
            // Extract file extension if media exists
            let fileExtension = null;
            if (pinnedMsg.media) {
              const urlParts = pinnedMsg.media.split('/');
              const fileName = urlParts[urlParts.length - 1];
              const parts = fileName.split('.');
              if (parts.length > 1) {
                const ext = parts[parts.length - 1].toLowerCase();
                if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
                  fileExtension = ext;
                }
              }
            }
            
            setPinnedMessage({
              messageId: pinnedMsg.messageId,
              senderDeviceId: pinnedMsg.senderDeviceId,
              senderName: pinnedMsg.senderGhostName,
              text: pinnedMsg.text,
              media: pinnedMsg.media || null,
              fileExtension: fileExtension,
              timestamp: new Date(pinnedMsg.createdAt),
              isCurrentUser: pinnedMsg.senderDeviceId === id,
            });
          }
        } else {
          // Fallback to route params if API fails
          setUserIsCreator(isCreator || false);
          setUserIsAdmin(isCreator || false);
          setIsChatLocked(false);
          isChatLockedRef.current = false;
          setCurrentUserMutedUntil(null);
          setMutedMembersMap({});
        }

        // Initialize socket and ensure it's connected before joining room
        const socket = initializeGhostSocket();
        
        // Wait for socket connection if not already connected
        if (!socket.connected) {
          await new Promise((resolve) => {
            if (socket.connected) {
              resolve();
            } else {
              const timeout = setTimeout(() => {
                console.warn('Socket connection timeout, proceeding anyway');
                socket.removeListener('connect', onConnect);
                resolve();
              }, 5000);
              
              const onConnect = () => {
                console.log('Socket connected, proceeding to join room');
                clearTimeout(timeout);
                resolve();
              };
              
              socket.once('connect', onConnect);
            }
          });
        }

        // Join socket room (now socket should be connected)
        joinCrowdRoom(crowdId, id);

        // Load messages
        await loadMessages();

        // Load blocked users list
        try {
          const blockedResponse = await getBlockedUsers(crowdId, id);
          if (blockedResponse.status === 200 && blockedResponse.data?.blockedDeviceIds) {
            setBlockedUserIds(new Set(blockedResponse.data.blockedDeviceIds));
          }
        } catch (error) {
          console.error('Error loading blocked users:', error);
          // Non-fatal, continue with empty blocked list
        }

        // Set up socket listeners
        onGhostMessage((message) => {
          // Skip messages from blocked users
          setBlockedUserIds(currentBlockedIds => {
            if (currentBlockedIds.has(message.senderDeviceId)) {
              return currentBlockedIds; // Don't add message, just return state unchanged
            }

            setMessages(prev => {
            // Check if message already exists by messageId
            const exists = prev.some(m => m.messageId === message.messageId);
            if (exists) return prev;
            
            // Extract file extension from media URL if not provided
            let fileExtension = message.fileExtension || null;
            if (!fileExtension && message.media) {
              const urlParts = message.media.split('/');
              const fileName = urlParts[urlParts.length - 1];
              const parts = fileName.split('.');
              if (parts.length > 1) {
                const ext = parts[parts.length - 1].toLowerCase();
                // Only set as file extension if it's not an image
                if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
                  fileExtension = ext;
                }
              }
            }
            
            // Determine if this is current user's message by comparing deviceId
            const isCurrentUserMessage = message.senderDeviceId === id;
            
            // If this is current user's message, check if we have a pending temp message
            if (isCurrentUserMessage) {
              // Find pending temp message that matches this message
              const pendingEntry = Array.from(pendingMessagesRef.current.entries()).find(
                ([tempId, pendingData]) => {
                  const textMatch = pendingData.text === message.text;
                  const mediaMatch = (pendingData.media || '') === (message.media || '');
                  const timeDiff = Math.abs(new Date(message.createdAt).getTime() - pendingData.timestamp.getTime());
                  // Match if text/media match and within 5 seconds (fileExtension may not match if backend doesn't send it)
                  return textMatch && mediaMatch && timeDiff < 5000;
                }
              );
              
              if (pendingEntry) {
                // Remove temp message and add real message in one operation to prevent glitch
                const [tempId, pendingData] = pendingEntry;
                pendingMessagesRef.current.delete(tempId);
                socketMessageExpectedRef.current.delete(tempId);
                
                // Use fileExtension from pending data if available (more reliable than extracting from URL)
                const finalFileExtension = pendingData.fileExtension || fileExtension;
                
                // Find the temp message to preserve fileName if it exists
                const tempMsg = prev.find(m => m.messageId === tempId);
                const fileName = tempMsg?.fileName || null;
                
                // Filter out temp message and add real message atomically
                // This ensures no intermediate state with both messages
                const filtered = prev.filter(msg => msg.messageId !== tempId);
                return [...filtered, {
                  messageId: message.messageId,
                  senderDeviceId: message.senderDeviceId,
                  senderName: message.senderGhostName,
                  text: message.text,
                  media: message.media || null,
                  fileExtension: finalFileExtension, // Use fileExtension from pending data
                  fileName: fileName, // Preserve fileName from temp message
                  timestamp: new Date(message.createdAt),
                  isCurrentUser: true,
                }];
              }
            }
            
            // Add new message (not from current user, or no matching pending message)
            return [...prev, {
              messageId: message.messageId,
              senderDeviceId: message.senderDeviceId,
              senderName: message.senderGhostName,
              text: message.text,
              media: message.media || null,
              fileExtension: fileExtension, // Use extracted file extension
              timestamp: new Date(message.createdAt),
              isCurrentUser: isCurrentUserMessage,
            }];
          });
          return currentBlockedIds; // Return unchanged blocked IDs
        });
        });

        onCrowdDeleted(() => {
          // Skip Alert if current user initiated the deletion (they already confirmed via modal)
          if (userDeletedCrowdRef.current) {
            userDeletedCrowdRef.current = false; // Reset flag
            return; // Don't show Alert, navigation already handled in handleDeleteCrowd
          }
          
          // Show Alert for other users (when someone else deletes the crowd)
          Alert.alert(
            'Crowd Deleted',
            'This crowd has been deleted by the creator.',
            [{ 
              text: 'OK', 
              onPress: () => {
                // Reset navigation stack to ensure we don't go back to deleted crowd
                navigation.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'GhostModeHomeScreen',
                      params: {
                        ghostName: currentUserGhostName,
                        avatarBgColor: currentUserAvatarColor,
                      },
                    },
                  ],
                });
              }
            }]
          );
        });

        onMemberLeft((data) => {
          // Add system message when member leaves
          if (String(data.crowdId) === String(crowdId) && data.ghostName) {
            const systemMessageText = `${data.ghostName} left the crowd.`;
            const tempSystemMessage = {
              messageId: `temp_system_${Date.now()}`,
              senderDeviceId: 'system',
              senderName: 'System',
              text: systemMessageText,
              timestamp: new Date(),
              isCurrentUser: false,
              isSystemMessage: true,
            };
            
            setMessages(prev => [...prev, tempSystemMessage]);
            
            // Scroll to bottom to show the new message
            setTimeout(() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
            
            // Reload messages after a delay to get the persisted system message from database
            setTimeout(() => {
              loadMessages(false);
            }, 500);
          }
        });

        onMemberJoined((data) => {
          // Add system message when member joins (unless they're blocked)
          if (String(data.crowdId) === String(crowdId) && data.member?.ghostName) {
            // Check if this user is blocked
            setBlockedUserIds(currentBlockedIds => {
              if (currentBlockedIds.has(data.member.deviceId)) {
                return currentBlockedIds; // Skip system message for blocked user
              }

              const systemMessageText = `${data.member.ghostName} joined the crowd.`;
            const tempSystemMessage = {
              messageId: `temp_system_${Date.now()}`,
              senderDeviceId: 'system',
              senderName: 'System',
              text: systemMessageText,
              timestamp: new Date(),
              isCurrentUser: false,
              isSystemMessage: true,
            };
            
            setMessages(prev => [...prev, tempSystemMessage]);
            
            // Scroll to bottom to show the new message
            setTimeout(() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
            
            // Reload messages after a delay to get the persisted system message from database
            setTimeout(() => {
              loadMessages(false);
            }, 500);

            return currentBlockedIds; // Return unchanged
          });
        }
        });

        onMemberRemoved((data) => {
          // Check if current user was removed (compare as strings to handle ObjectId/string differences)
          if (String(data.crowdId) === String(crowdId)) {
            if (data.deviceId === id) {
              // Current user was removed - show alert and navigate away
              Alert.alert(
                'Removed from Crowd',
                'You have been removed from this crowd by an admin.',
                [{ 
                  text: 'OK', 
                  onPress: () => {
                    // Navigate to home screen with ghost identity
                    navigation.replace('GhostModeHomeScreen', {
                      ghostName: currentUserGhostName,
                      avatarBgColor: currentUserAvatarColor,
                    });
                  }
                }]
              );
            } else if (data.ghostName) {
              // Another member was removed - add system message
              const systemMessageText = `${data.ghostName} was removed from the crowd by an admin.`;
              const tempSystemMessage = {
                messageId: `temp_system_${Date.now()}`,
                senderDeviceId: 'system',
                senderName: 'System',
                text: systemMessageText,
                timestamp: new Date(),
                isCurrentUser: false,
                isSystemMessage: true,
              };
              
              setMessages(prev => [...prev, tempSystemMessage]);
              
              // Scroll to bottom to show the new message
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 100);
              
              // Reload messages after a delay to get the persisted system message from database
              setTimeout(() => {
                loadMessages(false);
              }, 500);
            }
          }
        });

        // Listen for admin status updates in real-time
        onAdminUpdated((data) => {
          if (data.crowdId === crowdId && data.deviceId === id) {
            // This is the current user's admin status being updated
            setUserIsAdmin(data.isAdmin);
            setToastMsg(data.isAdmin ? 'You have been promoted to admin' : 'You have been demoted from admin');
          }
        });

        // Listen for chat lock updates in real-time
        const chatLockUpdatedHandler = (data) => {
          if (String(data.crowdId) === String(crowdId)) {
            console.log('Chat lock updated:', data.isChatLocked);
            const previousLockStatus = isChatLockedRef.current;
            setIsChatLocked(data.isChatLocked);
            isChatLockedRef.current = data.isChatLocked;
            
            // Add system message optimistically for immediate display
            if (previousLockStatus !== data.isChatLocked) {
              const systemMessageText = data.isChatLocked
                ? 'Chat locked. Only admins can send messages.'
                : 'Chat unlocked. All members can send messages.';
              
              const tempSystemMessage = {
                messageId: `temp_system_${Date.now()}`,
                senderDeviceId: 'system',
                senderName: 'System',
                text: systemMessageText,
                timestamp: new Date(),
                isCurrentUser: false,
                isSystemMessage: true,
              };
              
              setMessages(prev => [...prev, tempSystemMessage]);
              
              // Scroll to bottom to show the new message
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 100);
              
              // Reload messages after a delay to get the persisted system message from database
              // This replaces the temp message with the real one
              setTimeout(() => {
                loadMessages(false); // Don't show loading indicator for real-time updates
              }, 500); // Delay to ensure database write is complete
            }
          }
        };
        onChatLockUpdated(chatLockUpdatedHandler);

        // Listen for message pinned updates in real-time
        const messagePinnedHandler = (data) => {
          if (String(data.crowdId) === String(crowdId) && data.pinnedMessage) {
            const pinnedMsg = data.pinnedMessage;
            // Extract file extension if media exists
            let fileExtension = null;
            if (pinnedMsg.media) {
              const urlParts = pinnedMsg.media.split('/');
              const fileName = urlParts[urlParts.length - 1];
              const parts = fileName.split('.');
              if (parts.length > 1) {
                const ext = parts[parts.length - 1].toLowerCase();
                if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
                  fileExtension = ext;
                }
              }
            }
            
            setPinnedMessage({
              messageId: pinnedMsg.messageId,
              senderDeviceId: pinnedMsg.senderDeviceId,
              senderName: pinnedMsg.senderGhostName,
              text: pinnedMsg.text,
              media: pinnedMsg.media || null,
              fileExtension: fileExtension,
              timestamp: new Date(pinnedMsg.createdAt),
              isCurrentUser: pinnedMsg.senderDeviceId === id,
            });
          }
        };
        onMessagePinned(messagePinnedHandler);

        // Listen for message unpinned updates in real-time
        const messageUnpinnedHandler = (data) => {
          if (String(data.crowdId) === String(crowdId)) {
            setPinnedMessage(null);
          }
        };
        onMessageUnpinned(messageUnpinnedHandler);

        // Listen for mute/unmute updates in real-time (use ref so handler always has latest deviceId)
        const muteUpdatedHandler = (data) => {
          if (String(data.crowdId) === String(crowdId) && refreshCrowdMuteStateRef.current) {
            refreshCrowdMuteStateRef.current();
          }
        };
        onMuteUpdated(muteUpdatedHandler);

        // Listen for typing indicators
        const typingHandler = (data) => {
          if (String(data.crowdId) === String(crowdId) && data.deviceId !== id) {
            // Don't show typing indicator for current user or blocked users
            setBlockedUserIds(currentBlockedIds => {
              if (currentBlockedIds.has(data.deviceId)) {
                return currentBlockedIds; // Skip typing indicator for blocked user
              }

              if (data.isTyping) {
                setTypingUsers(prev => {
                  // Check if user is already in the list
                  const exists = prev.some(u => u.deviceId === data.deviceId);
                  if (exists) {
                    return prev.map(u => 
                      u.deviceId === data.deviceId 
                        ? { ...u, ghostName: data.ghostName, timestamp: Date.now() }
                        : u
                    );
                  }
                  return [...prev, { deviceId: data.deviceId, ghostName: data.ghostName, timestamp: Date.now() }];
                });
              } else {
                // Remove user from typing list
                setTypingUsers(prev => prev.filter(u => u.deviceId !== data.deviceId));
              }

              return currentBlockedIds; // Return unchanged
            });
          }
        };
        onUserTyping(typingHandler);
      } catch (error) {
        console.error('Error initializing chat:', error);
        setToastMsg('Failed to load chat');
      }
    };

    initialize();

    // Cleanup on unmount
    return () => {
      if (crowdId && deviceId) {
        leaveCrowdRoom(crowdId, deviceId);
        // Stop typing when leaving
        if (isTypingRef.current) {
          emitTypingStop(crowdId, deviceId);
        }
      }
      // Clear typing timeout and interval
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      removeAllGhostListeners();
      pendingMessagesRef.current.clear();
      socketMessageExpectedRef.current.clear();
    };
  }, [crowdId]);

  // Calculate days remaining for history expiration message
  const calculateDaysRemaining = useMemo(() => {
    if (expiresAt) {
      const now = new Date();
      const expiryDate = new Date(expiresAt);
      const diffTime = expiryDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    }
    // Fallback to duration if expiresAt is not available
    return duration || 31;
  }, [expiresAt, duration]);

  // Load messages from API
  const loadMessages = async (showLoading = true) => {
    if (!crowdId) return;

    try {
      if (showLoading) {
        setIsLoadingMessages(true);
      }
      // Pass deviceId to getCrowdMessages so backend can filter blocked users
      const currentDeviceId = deviceId || await getGhostDeviceId();
      const response = await getCrowdMessages(crowdId, 50, 0, currentDeviceId);
      
      if (response.status === 200 && response.data) {
        // Get deviceId for comparison
        const currentDeviceId = await getGhostDeviceId();
        
        const formattedMessages = response.data.map(msg => {
          // Extract file extension from media URL if available
          let fileExtension = null;
          if (msg.media) {
            const urlParts = msg.media.split('/');
            const fileName = urlParts[urlParts.length - 1];
            const parts = fileName.split('.');
            if (parts.length > 1) {
              const ext = parts[parts.length - 1].toLowerCase();
              // Only set as file extension if it's not an image
              if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
                fileExtension = ext;
              }
            }
          }
          
          return {
            messageId: msg.messageId,
            senderDeviceId: msg.senderDeviceId,
            senderName: msg.senderGhostName,
            text: msg.text,
            media: msg.media || null,
            fileExtension: fileExtension, // Store extracted file extension
            timestamp: new Date(msg.createdAt),
            // Use deviceId for identification (more reliable than ghostName)
            isCurrentUser: msg.senderDeviceId === currentDeviceId,
            // Mark system messages
            isSystemMessage: msg.senderDeviceId === 'system',
          };
        }).reverse(); // Reverse to show oldest first
        
        // Create history expiration system message (always at the top)
        const historyExpirationMessage = {
          messageId: 'history_expiration_system',
          senderDeviceId: 'system',
          senderName: 'System',
          text: `History disappears in ${calculateDaysRemaining} ${calculateDaysRemaining === 1 ? 'day' : 'days'}`,
          timestamp: new Date(0), // Very old timestamp to ensure it's at the top
          isCurrentUser: false,
          isSystemMessage: true,
        };
        
        // Remove temp system messages when loading from database
        // The real system messages from database will replace them
        setMessages(prev => {
          // Filter out temp system messages and old history expiration message
          const nonTempMessages = prev.filter(msg => 
            !msg.messageId.startsWith('temp_system_') && 
            msg.messageId !== 'history_expiration_system'
          );
          // Merge with new messages, avoiding duplicates
          const existingIds = new Set(nonTempMessages.map(m => m.messageId));
          const newMessages = formattedMessages.filter(m => !existingIds.has(m.messageId));
          // Add history expiration message at the beginning
          return [historyExpirationMessage, ...nonTempMessages, ...newMessages];
        });
        
        // Scroll to bottom after loading
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setToastMsg('Failed to load messages');
    } finally {
      if (showLoading) {
        setIsLoadingMessages(false);
      }
    }
  };

  // Deduplicate messages by messageId and filter out temp messages that have socket replacements expected
  const deduplicatedMessages = useMemo(() => {
    const seen = new Set();
    let historyExpirationMsg = null;
    
    const filtered = messages.filter(msg => {
      if (!msg.messageId) return true; // Keep messages without ID (shouldn't happen)
      
      // Extract history expiration message separately
      if (msg.messageId === 'history_expiration_system') {
        if (!historyExpirationMsg) {
          historyExpirationMsg = msg;
        }
        return false; // Filter it out from main list, we'll add it at the top
      }
      
      // Skip temp messages if socket replacement is expected (prevents glitch)
      // This filters them out immediately, preventing any visual flash
      // The socket message will arrive almost instantly and replace it seamlessly
      if (msg.messageId.startsWith('temp_') && socketMessageExpectedRef.current.has(msg.messageId)) {
        return false;
      }
      
      // Filter out uploading messages that have been replaced by real messages
      if (msg.isUploading || msg.messageId.startsWith('uploading_')) {
        // Check if we have a real message (from socket or API) that matches
        const hasRealMessage = messages.some(m => 
          !m.isUploading && 
          !m.messageId.startsWith('uploading_') &&
          m.fileExtension === msg.fileExtension &&
          m.fileName === msg.fileName &&
          Math.abs(m.timestamp.getTime() - msg.timestamp.getTime()) < 10000 // Within 10 seconds
        );
        if (hasRealMessage) {
          return false; // Remove uploading message if real one exists
        }
        // Otherwise keep the uploading message to show loading state
        return true;
      }
      
      // Filter out temp system messages when we have real system messages
      // Check if there's a real system message with the same text
      if (msg.messageId.startsWith('temp_system_')) {
        const hasRealSystemMessage = messages.some(m => 
          m.isSystemMessage && 
          !m.messageId.startsWith('temp_') && 
          m.text === msg.text &&
          Math.abs(m.timestamp.getTime() - msg.timestamp.getTime()) < 5000 // Within 5 seconds
        );
        if (hasRealSystemMessage) {
          return false; // Remove temp system message if real one exists
        }
      }
      
      // Also filter out temp system messages if we're loading from database
      // This prevents the flash of duplicate messages
      if (msg.messageId.startsWith('temp_system_')) {
        // If there are any non-temp system messages, remove all temp ones
        const hasAnyRealSystemMessage = messages.some(m => 
          m.isSystemMessage && !m.messageId.startsWith('temp_')
        );
        if (hasAnyRealSystemMessage) {
          return false;
        }
      }
      
      // Filter out old system messages with the old format
      const isOldSystemMessage = msg.isSystemMessage && 
        (msg.text?.includes("changed this group's settings") || 
         msg.text?.includes("This group's settings were changed"));
      if (isOldSystemMessage) {
        return false; // Remove old format system messages
      }
      
      if (seen.has(msg.messageId)) {
        return false; // Duplicate
      }
      seen.add(msg.messageId);
      return true;
    });
    
    // If we don't have a history expiration message yet, create one
    if (!historyExpirationMsg) {
      historyExpirationMsg = {
        messageId: 'history_expiration_system',
        senderDeviceId: 'system',
        senderName: 'System',
        text: `History disappears in ${calculateDaysRemaining} ${calculateDaysRemaining === 1 ? 'day' : 'days'}`,
        timestamp: new Date(0), // Very old timestamp to ensure it's at the top
        isCurrentUser: false,
        isSystemMessage: true,
      };
    }
    
    // Return with history expiration message at the top
    return [historyExpirationMsg, ...filtered];
  }, [messages, calculateDaysRemaining]);

  // Actual user messages only (excludes history expiration system message)
  const actualMessages = useMemo(
    () => deduplicatedMessages.filter(m => m.messageId !== 'history_expiration_system'),
    [deduplicatedMessages]
  );

  // Clear message positions only when switching to a different crowd.
  // Do not clear when new messages arrive (length change), so pinned-message
  // scroll still has valid positions after someone sends a message.
  useEffect(() => {
    messagePositionsRef.current.clear();
  }, [crowdId]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollViewRef.current && actualMessages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [deduplicatedMessages]);

  // WhatsApp-like keyboard handling - smooth scroll when keyboard appears
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        // Use keyboard animation duration for smooth scroll
        const duration = Platform.OS === 'ios' 
          ? (event.duration || 250) 
          : 100;
        
        // Scroll smoothly in sync with keyboard animation
        setTimeout(() => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
          }
        }, Platform.OS === 'ios' ? 50 : 0);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
    };
  }, []);

  // Cleanup stale typing indicators (remove users who haven't updated in 10 seconds)
  // This is a safety net for cases where typingStop event wasn't received
  useEffect(() => {
    if (typingUsers.length === 0) return;

    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => 
        prev.filter(user => {
          // Remove if last update was more than 10 seconds ago
          // This gives enough buffer for network delays while still cleaning up stale indicators
          return (now - user.timestamp) < 10000;
        })
      );
    }, 1000); // Check every second

    return () => clearInterval(cleanupInterval);
  }, [typingUsers]);


  const handleBack = () => {
    // Navigate back to GhostModeHomeScreen to ensure proper navigation stack
    navigation.navigate('GhostModeHomeScreen', {
      ghostName: currentUserGhostName,
      avatarBgColor: currentUserAvatarColor,
    });
  };

  // Handle Android back button
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleBack();
        return true; // Prevent default back behavior
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [currentUserGhostName, currentUserAvatarColor])
  );

  const handleGroupInfo = () => {
    navigation.navigate('CrowdMembersScreen', {
      crowdId: crowdId,
      crowdName: crowdName,
      ghostName: ghostName,
      avatarBgColor: avatarBgColor,
      isCreator: isCreator || false,
    });
  };

  const handleMenu = () => {
    if (menuButtonRef.current) {
      menuButtonRef.current.measure((x, y, width, height, pageX, pageY) => {
        const MENU_HEIGHT = 320; // Approximate height of the menu
        const MENU_WIDTH = 200;
        const headerHeight = Platform.OS === 'ios' ? 60 : 70;
        const menuTop = pageY + height + 8; // 8px gap below button
        const menuRight = 20; // Align to right edge with padding
        
        // Check if menu would overflow bottom of screen
        const availableSpaceBelow = SCREEN_HEIGHT - menuTop;
        let finalTop = menuTop;
        
        if (availableSpaceBelow < MENU_HEIGHT) {
          // Position above the button if not enough space below
          finalTop = pageY - MENU_HEIGHT - 8;
          // Ensure menu doesn't go above screen
          if (finalTop < headerHeight) {
            finalTop = headerHeight + 8;
          }
        }
        
        setMenuPosition({ top: finalTop, right: menuRight });
        setShowMenu(true);
      });
    }
  };

  const handleCloseMenu = () => {
    setShowMenu(false);
  };

  const handleMenuAction = (action) => {
    setShowMenu(false);
    // TODO: Implement menu actions
    console.log('Menu action:', action);
    switch (action) {
      case 'adminControls':
        // TODO: Navigate to admin controls or show admin options
        console.log('Admin Controls pressed');
        break;
      case 'toggleLock':
        // Toggle chat lock/unlock
        handleToggleChatLock();
        break;
      case 'viewQR':
        // Use duration and qrCodeData from route params, or generate placeholder
        const qrData = qrCodeData || `amigo://crowd/join/${crowdName || 'test'}`;
        navigation.navigate('ViewQRCodeScreen', {
          crowdId: crowdId,
          crowdName: crowdName,
          duration: duration, // Use duration from route params
          qrCodeData: qrData,
          ghostName: ghostName,
          avatarBgColor: avatarBgColor,
          isCreator: isCreator || false,
          expiresAt: expiresAt, // Pass expiresAt for accurate expiry calculation
        });
        break;
      case 'manageMembers':
        navigation.navigate('CrowdMembersScreen', {
          crowdId: crowdId,
          crowdName: crowdName,
          ghostName: ghostName,
          avatarBgColor: avatarBgColor,
          isCreator: userIsCreator,
        });
        break;
      case 'deleteCrowd':
        // Only creator can delete
        if (userIsCreator) {
          setShowDeleteModal(true);
        } else {
          setToastMsg('Only the creator can delete the crowd');
        }
        break;
      case 'reportCrowd':
        // Show report crowd confirmation modal
        setShowReportModal(true);
        break;
      case 'leaveCrowd':
        // Check if user is the only admin via API
        if (userIsAdmin && crowdId && deviceId) {
          getCrowdMembers(crowdId, deviceId)
            .then(response => {
              if (response.status === 200 && response.data) {
                const adminCount = response.data.filter(m => m.isAdmin).length;
                if (adminCount === 1) {
                  setShowLeaveWarningModal(true);
                } else {
                  setShowLeaveModal(true);
                }
              } else {
                setShowLeaveModal(true);
              }
            })
            .catch(() => {
              setShowLeaveModal(true);
            });
        } else {
          setShowLeaveModal(true);
        }
        break;
      default:
        break;
    }
  };

  const handleDeleteCrowd = async () => {
    if (!crowdId || !deviceId) return;

    setShowDeleteModal(false);
    setLoader(true);
    
    // Mark that current user initiated the deletion to skip Alert in socket listener
    userDeletedCrowdRef.current = true;

    try {
      const response = await deleteCrowd({ crowdId, deviceId });
      
      if (response.status === 200) {
        setLoader(false);
        setToastMsg('Crowd deleted successfully');
        // Reset navigation stack to ensure we don't go back to deleted crowd
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'GhostModeHomeScreen',
              params: {
                ghostName: currentUserGhostName,
                avatarBgColor: currentUserAvatarColor,
              },
            },
          ],
        });
      } else {
        userDeletedCrowdRef.current = false; // Reset flag on error
        throw new Error(response.message || 'Failed to delete crowd');
      }
    } catch (error) {
      userDeletedCrowdRef.current = false; // Reset flag on error
      setLoader(false);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete crowd';
      setToastMsg(errorMessage);
      Alert.alert('Error', errorMessage);
    }
  };

  const handleReportCrowd = async (reasonKey, details) => {
    if (!crowdId || !deviceId) return;

    setShowReportModal(false);
    setLoader(true);

    try {
      await reportCrowd({
        crowdId,
        deviceId,
        reasonKey,
        details: details || undefined,
      });
      setLoader(false);
      setToastMsg('Crowd reported successfully. Thank you for your feedback.');
    } catch (error) {
      setLoader(false);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to report crowd';
      setToastMsg(errorMessage);
      Alert.alert('Error', errorMessage);
    }
  };

  const handleMessageLongPress = (message, event) => {
    // Don't show menu for system messages
    if (message.isSystemMessage || message.senderDeviceId === 'system') {
      return;
    }

    const { pageX, pageY } = event.nativeEvent;
    const screenWidth = Dimensions.get('window').width;
    const menuWidth = 180;
    
    // Calculate menu position to prevent going off-screen
    let left = pageX;
    if (pageX + menuWidth > screenWidth) {
      left = screenWidth - menuWidth - 20; // Add some margin
    }
    if (left < 20) {
      left = 20; // Add margin from left edge
    }
    
    setSelectedMessage(message);
    setMessageMenuPosition({ top: pageY, left: left });
    setShowMessageMenu(true);
  };

  const handleCloseMessageMenu = () => {
    setShowMessageMenu(false);
    setSelectedMessage(null);
  };

  const handleCopyMessage = () => {
    if (!selectedMessage) return;
    
    // Copy message text, or indicate media if no text
    let textToCopy = '';
    if (selectedMessage.text && selectedMessage.text !== 'Media') {
      textToCopy = selectedMessage.text;
    } else if (selectedMessage.media) {
      // For media messages, copy the media URL or indicate it's a media message
      textToCopy = selectedMessage.media;
    } else {
      textToCopy = 'Media';
    }
    
    Clipboard.setStringAsync(textToCopy);
    setToastMsg('Message copied to clipboard');
    handleCloseMessageMenu();
  };

  const handlePinMessage = async () => {
    if (!selectedMessage || !userIsAdmin || !crowdId || !deviceId) return;
    
    handleCloseMessageMenu();
    setLoader(true);
    
    try {
      const response = await pinMessage({
        crowdId,
        messageId: selectedMessage.messageId,
        deviceId,
      });
      
      if (response.status === 200) {
        setPinnedMessage(selectedMessage);
        setToastMsg('Message pinned');
      } else {
        throw new Error(response.message || 'Failed to pin message');
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to pin message';
      setToastMsg(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoader(false);
    }
  };

  const handleReportMessage = async (reasonKey, details) => {
    if (!selectedMessage || !crowdId) return;
    const messageId = selectedMessage.messageId;
    const reportedUserDeviceId = selectedMessage.senderDeviceId;
    const reportedUserGhostName = selectedMessage.senderName || null;
    setShowReportMessageModal(false);
    setSelectedMessage(null);
    setLoader(true);
    try {
      await reportMessage({
        crowdId,
        deviceId,
        messageId,
        reasonKey,
        details: details || undefined,
        reportedUserDeviceId,
        reportedUserGhostName,
      });
      setLoader(false);
      setToastMsg('Message reported. Thank you for your feedback.');
    } catch (error) {
      setLoader(false);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to report message';
      setToastMsg(errorMessage);
      Alert.alert('Error', errorMessage);
    }
  };

  const handleBlockMember = async () => {
    if (!selectedMessage || !crowdId || !deviceId) return;
    const memberDeviceId = selectedMessage.senderDeviceId;
    setShowBlockMemberModal(false);
    setSelectedMessage(null);
    setLoader(true);
    try {
      await removeMember({
        crowdId,
        memberDeviceId,
        adminDeviceId: deviceId,
      });
      setLoader(false);
      setToastMsg('Member has been removed from the crowd.');
    } catch (error) {
      setLoader(false);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to remove member';
      setToastMsg(errorMessage);
      Alert.alert('Error', errorMessage);
    }
  };

  const refreshCrowdMuteState = async () => {
    if (!crowdId || !deviceId) return;
    try {
      const crowdInfoResponse = await getCrowdInfo(crowdId, deviceId);
      if (crowdInfoResponse.status === 200 && crowdInfoResponse.data) {
        setCurrentUserMutedUntil(crowdInfoResponse.data.currentUserMutedUntil || null);
        const mutedMap = {};
        (crowdInfoResponse.data.members || []).forEach(m => {
          if (m.mutedUntil) mutedMap[m.deviceId] = m.mutedUntil;
        });
        setMutedMembersMap(mutedMap);
      }
    } catch (e) {
      // Non-fatal; mute state may be stale
    }
  };
  refreshCrowdMuteStateRef.current = refreshCrowdMuteState;

  const handleMuteMember = async (duration) => {
    if (!selectedMessage || !crowdId || !deviceId) return;
    setShowMuteMemberModal(false);
    setLoader(true);
    try {
      await muteMember({
        crowdId,
        memberDeviceId: selectedMessage.senderDeviceId,
        adminDeviceId: deviceId,
        duration,
      });
      setLoader(false);
      setSelectedMessage(null);
      setToastMsg('Member muted.');
      await refreshCrowdMuteState();
    } catch (error) {
      setLoader(false);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to mute member';
      setToastMsg(errorMessage);
      Alert.alert('Error', errorMessage);
    }
  };

  const handleUnmuteMember = async () => {
    if (!selectedMessage || !crowdId || !deviceId) return;
    handleCloseMessageMenu();
    setLoader(true);
    try {
      await unmuteMember({
        crowdId,
        memberDeviceId: selectedMessage.senderDeviceId,
        adminDeviceId: deviceId,
      });
      setLoader(false);
      setSelectedMessage(null);
      setToastMsg('Member unmuted.');
      await refreshCrowdMuteState();
    } catch (error) {
      setLoader(false);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to unmute member';
      setToastMsg(errorMessage);
      Alert.alert('Error', errorMessage);
    }
  };

  const handleBlockUser = async () => {
    if (!selectedMessage || !crowdId || !deviceId) return;
    const blockedDeviceId = selectedMessage.senderDeviceId;
    setShowBlockUserModal(false);
    setSelectedMessage(null);
    setLoader(true);
    try {
      await blockUser({
        crowdId,
        blockerDeviceId: deviceId,
        blockedDeviceId,
      });
      
      // Add blocked user to state immediately
      setBlockedUserIds(prev => new Set(prev).add(blockedDeviceId));
      
      // Remove any typing indicators from this user
      setTypingUsers(prev => prev.filter(u => u.deviceId !== blockedDeviceId));
      
      // Filter out messages from blocked user in local state
      setMessages(prev => prev.filter(msg => msg.senderDeviceId !== blockedDeviceId));
      
      setLoader(false);
      setToastMsg('User blocked successfully. Their messages are now hidden.');
    } catch (error) {
      setLoader(false);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to block user';
      setToastMsg(errorMessage);
      Alert.alert('Error', errorMessage);
    }
  };

  const handleUnpinMessage = async () => {
    if (!userIsAdmin || !crowdId || !deviceId) return;
    
    setLoader(true);
    
    try {
      const response = await unpinMessage({
        crowdId,
        deviceId,
      });
      
      if (response.status === 200) {
        setPinnedMessage(null);
        setToastMsg('Message unpinned');
      } else {
        throw new Error(response.message || 'Failed to unpin message');
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to unpin message';
      setToastMsg(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoader(false);
    }
  };

  const scrollToPinnedMessage = (yPosition) => {
    if (scrollViewRef.current == null || yPosition == null) return;
    const offset = 24;
    const y = Math.max(0, yPosition - offset);
    scrollViewRef.current.scrollTo({ y, animated: true });
  };

  const handlePinnedMessagePress = () => {
    if (!pinnedMessage || !scrollViewRef.current) return;

    const messageIndex = deduplicatedMessages.findIndex(
      msg => msg.messageId != null && String(msg.messageId) === String(pinnedMessage.messageId)
    );
    const listMessage = messageIndex >= 0 ? deduplicatedMessages[messageIndex] : null;
    const positionKey = listMessage?.messageId ?? pinnedMessage.messageId;

    const tryScroll = () => {
      const position = messagePositionsRef.current.get(positionKey);
      if (position !== undefined) {
        scrollToPinnedMessage(position);
        return true;
      }
      return false;
    };

    if (tryScroll()) return;

    if (messageIndex === -1) {
      setToastMsg('Pinned message not found in current view');
      return;
    }

    const retryDelays = [100, 250, 500, 800];
    let attempt = 0;

    const scheduleRetry = () => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
      const delay = attempt < retryDelays.length ? retryDelays[attempt] : 100;
      attempt += 1;
      setTimeout(() => {
        if (tryScroll()) return;
        if (attempt <= retryDelays.length) {
          scheduleRetry();
        } else {
          const position = messagePositionsRef.current.get(positionKey);
          if (position !== undefined) {
            scrollToPinnedMessage(position);
          } else {
            setToastMsg('Could not scroll to pinned message');
          }
        }
      }, delay);
    };

    scheduleRetry();
  };

  const handleLeaveCrowd = async () => {
    if (!crowdId || !deviceId) return;

    setShowLeaveModal(false);
    setLoader(true);

    try {
      const response = await leaveCrowd({ crowdId, deviceId });
      
      if (response.status === 200) {
        setLoader(false);
        setToastMsg('Left crowd successfully');
        // Navigate to GhostModeHomeScreen with ghost identity
        navigation.replace('GhostModeHomeScreen', {
          ghostName: currentUserGhostName,
          avatarBgColor: currentUserAvatarColor,
        });
      } else {
        throw new Error(response.message || 'Failed to leave crowd');
      }
    } catch (error) {
      setLoader(false);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to leave crowd';
      
      if (errorMessage.includes('only admin')) {
        setShowLeaveWarningModal(true);
      } else {
        setToastMsg(errorMessage);
        Alert.alert('Error', errorMessage);
      }
    }
  };

  const handleToggleChatLock = async () => {
    if (!crowdId || !deviceId) return;

    setLoader(true);
    setShowMenu(false); // Close menu so updated text is visible when reopened

    try {
      const response = await toggleChatLock({ crowdId, deviceId });
      
      if (response.status === 200) {
        setLoader(false);
        const newLockStatus = response.data?.isChatLocked ?? !isChatLocked;
        setIsChatLocked(newLockStatus);
        isChatLockedRef.current = newLockStatus;
        
        // Add system message optimistically for immediate display
        const systemMessageText = newLockStatus
          ? 'Chat locked. Only admins can send messages.'
          : 'Chat unlocked. All members can send messages.';
        
        const tempSystemMessage = {
          messageId: `temp_system_${Date.now()}`,
          senderDeviceId: 'system',
          senderName: 'System',
          text: systemMessageText,
          timestamp: new Date(),
          isCurrentUser: false,
          isSystemMessage: true,
        };
        
        setMessages(prev => [...prev, tempSystemMessage]);
        
        // Scroll to bottom to show the new message
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
        
        // Reload messages after a delay to get the persisted system message from database
        // This replaces the temp message with the real one
        setTimeout(() => {
          loadMessages(false);
        }, 500);
      } else {
        throw new Error(response.message || 'Failed to toggle chat lock');
      }
    } catch (error) {
      setLoader(false);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to toggle chat lock';
      setToastMsg(errorMessage);
      Alert.alert('Error', errorMessage);
    }
  };

  // Handle typing detection
  const handleTextChange = (text) => {
    setMessageText(text);

    // Only emit typing if chat is not locked or user is admin, and user is not muted
    if (isChatLocked && !userIsAdmin) {
      return;
    }
    if (currentUserMutedUntil && new Date(currentUserMutedUntil) > new Date()) {
      return;
    }

    if (!crowdId || !deviceId) {
      return;
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // If not already typing, emit typing start and set up periodic events
    if (!isTypingRef.current) {
      emitTypingStart(crowdId, deviceId, currentUserGhostName);
      isTypingRef.current = true;
      
      // Send periodic typing events every 2 seconds while user is actively typing
      // This ensures the typing indicator stays visible for other users
      typingIntervalRef.current = setInterval(() => {
        if (isTypingRef.current && crowdId && deviceId) {
          emitTypingStart(crowdId, deviceId, currentUserGhostName);
        } else {
          // Clear interval if user stopped typing
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
          }
        }
      }, 2000);
    }

    // Set timeout to stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current && crowdId && deviceId) {
        emitTypingStop(crowdId, deviceId);
        isTypingRef.current = false;
        // Clear the periodic typing interval
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
      }
      typingTimeoutRef.current = null;
    }, 3000);
  };

  const handleSend = async (mediaUrl = null, fileExtension = null, replaceUploadId = null, captionText = null) => {
    const textToSend = captionText !== null ? captionText.trim() : messageText.trim();
    if ((textToSend.length === 0 && !mediaUrl) || !crowdId || !deviceId) return;

    // Check if chat is locked and user is not admin
    if (isChatLocked && !userIsAdmin) {
      setToastMsg('Chat locked. Only admins can send messages.');
      return;
    }
    const isMuted = currentUserMutedUntil && new Date(currentUserMutedUntil) > new Date();
    if (isMuted) {
      setToastMsg("You are muted. You can't send messages until unmuted.");
      return;
    }

    // Stop typing indicator when sending message
    if (isTypingRef.current && crowdId && deviceId) {
      emitTypingStop(crowdId, deviceId);
      isTypingRef.current = false;
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    // Clear the periodic typing interval
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    if (captionText === null) {
      setMessageText('');
    }

    // Determine if media is image or file based on extension
    const isImageFile = mediaUrl && typeof mediaUrl === 'string' && !fileExtension && (
      mediaUrl.toLowerCase().includes('.jpg') || 
      mediaUrl.toLowerCase().includes('.jpeg') || 
      mediaUrl.toLowerCase().includes('.png') || 
      mediaUrl.toLowerCase().includes('.gif') || 
      mediaUrl.toLowerCase().includes('.webp')
    );
    const isFileType = fileExtension && typeof fileExtension === 'string' && !['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension.toLowerCase());

    // If we're replacing an uploading message, convert it to temp message
    let tempId;
    if (replaceUploadId) {
      // Find the uploading message to preserve fileName
      const uploadingMsg = messages.find(m => m.messageId === replaceUploadId);
      const fileName = uploadingMsg?.fileName || null;
      
      // Convert uploading message ID to temp message ID and update it
      tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      setMessages(prev => prev.map(msg => 
        msg.messageId === replaceUploadId
          ? {
              ...msg,
              messageId: tempId,
              media: mediaUrl,
              fileExtension: fileExtension || null,
              fileName: fileName, // Preserve fileName
              isUploading: false, // Remove uploading flag
              text: textToSend || (mediaUrl ? 'Media' : ''),
            }
          : msg
      ));
    } else {
      // Create new temp message
      tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      setMessages(prev => [...prev, {
        messageId: tempId,
        senderDeviceId: deviceId,
        senderName: currentUserGhostName,
        text: textToSend || (mediaUrl ? 'Media' : ''),
        media: mediaUrl || null,
        fileExtension: fileExtension || null,
        timestamp: new Date(),
        isCurrentUser: true,
      }]);
    }
    
    const tempMessage = {
      messageId: tempId,
      senderDeviceId: deviceId,
      senderName: currentUserGhostName,
      text: textToSend || (mediaUrl ? 'Media' : ''),
      media: mediaUrl || null,
      fileExtension: fileExtension || null,
      timestamp: new Date(),
      isCurrentUser: true,
    };

    // Track pending message for socket deduplication
    pendingMessagesRef.current.set(tempId, {
      text: textToSend || (mediaUrl ? 'Media' : ''),
      media: mediaUrl || null,
      fileExtension: fileExtension || null,
      timestamp: tempMessage.timestamp,
    });

    // Mark that we expect a socket message (will be used to filter temp message if socket arrives first)
    // This prevents the temp message from being rendered, eliminating the glitch
    socketMessageExpectedRef.current.add(tempId);
    
    // Clear the expected flag after 2 seconds as fallback (in case socket doesn't arrive)
    setTimeout(() => {
      socketMessageExpectedRef.current.delete(tempId);
    }, 2000);

    setMessages(prev => [...prev, tempMessage]);

    try {
      // Prepare clean, serializable data for API
      const messageData = {
        crowdId: String(crowdId),
        deviceId: String(deviceId),
        ghostName: String(currentUserGhostName),
        text: String(textToSend || (mediaUrl ? 'Media' : '')),
      };
      
      // Only add media if it exists and is a string
      if (mediaUrl && typeof mediaUrl === 'string' && mediaUrl.trim().length > 0) {
        messageData.media = String(mediaUrl);
      }

      const response = await sendMessage(messageData);

      if (response.status === 201 && response.data) {
        const realMessageId = response.data.messageId;
        
        // Check if socket already replaced this message
        setMessages(prev => {
          const hasRealMessage = prev.some(m => m.messageId === realMessageId);
          
          if (hasRealMessage) {
            // Socket already added it, just remove the temp message
            pendingMessagesRef.current.delete(tempId);
            socketMessageExpectedRef.current.delete(tempId);
            return prev.filter(msg => msg.messageId !== tempId);
          } else {
            // Replace temp message with real one
            // Find the temp message to preserve fileName
            const tempMsg = prev.find(m => m.messageId === tempId);
            const fileName = tempMsg?.fileName || null;
            
            pendingMessagesRef.current.delete(tempId);
            socketMessageExpectedRef.current.delete(tempId);
            return prev.map(msg => 
              msg.messageId === tempId
                ? {
                    messageId: realMessageId,
                    senderDeviceId: deviceId,
                    senderName: currentUserGhostName,
                    text: textToSend || (mediaUrl ? 'Media' : ''),
                    media: mediaUrl,
                    fileExtension: fileExtension || null, // Preserve file extension
                    fileName: fileName, // Preserve fileName from temp message
                    timestamp: new Date(),
                    isCurrentUser: true,
                  }
                : msg
            );
          }
        });
      } else {
        // Remove temp message on error
        pendingMessagesRef.current.delete(tempId);
        socketMessageExpectedRef.current.delete(tempId);
        setMessages(prev => prev.filter(msg => msg.messageId !== tempMessage.messageId));
        setMessageText(textToSend); // Restore text
        throw new Error(response.message || 'Failed to send message');
      }
    } catch (error) {
      // Remove temp message on error
      pendingMessagesRef.current.delete(tempId);
      socketMessageExpectedRef.current.delete(tempId);
      setMessages(prev => prev.filter(msg => msg.messageId !== tempMessage.messageId));
      setMessageText(textToSend); // Restore text
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to send message';
      setToastMsg(errorMessage);
    }
  };

  // Media selection handlers
  const handleOpenGallery = () => {
   
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
      },
      async (response) => {
        if (response.didCancel || response.errorCode) {
          return;
        }
        if (response.assets && response.assets[0]) {
          // Show preview instead of directly uploading
         
          setShowShareMediaModal(false);

         
          setTimeout(() => {
            const asset = response.assets[0];
            console.log('Selected image asset:', asset);
            setPreviewFile(asset);
            setPreviewMediaType('image');
            setPreviewFileExtension(null);
            setPreviewCaption('');
            setShowPreviewModal(true);
          }, 500);
        }
      }
    );
  };

  const handleOpenCamera = () => {
    // On iOS, we need to handle modal closing carefully to prevent camera from closing
    if (Platform.OS === 'ios') {
      // Set flag to prevent modal from closing
      setIsPickerLaunching(true);
      
      // Launch camera first without closing modal at all
      // The modal will stay open in the background but won't interfere
      try {
        launchCamera(
          {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 2000,
            maxWidth: 2000,
          },
          async (response) => {
            // Reset flag and close modal only after camera callback is triggered
            // This ensures camera stays open until user takes photo or cancels
            
            
            if (response.didCancel || response.errorCode) {
              console.log('Camera cancelled or error:', response.errorCode || 'User cancelled');
              return;
            }
            if (response.assets && response.assets[0]) {
              setIsPickerLaunching(false);
            setShowShareMediaModal(false);
              // Show preview instead of directly uploading
              const asset = response.assets[0];
              console.log('Camera image asset:', asset);
              setPreviewFile(asset);
              setPreviewMediaType('image');
              setPreviewFileExtension(null);
              setPreviewCaption('');
              setShowPreviewModal(true);
            }
          }
        );
      } catch (error) {
        // Reset flag on error
        console.error('Error launching camera:', error);
        setIsPickerLaunching(false);
        setShowShareMediaModal(false);
      }
      // Don't close modal here - let it stay open until camera callback
    } else {
      // On Android, close immediately as before
      setShowShareMediaModal(false);
      launchCamera(
        {
          mediaType: 'photo',
          includeBase64: false,
          maxHeight: 2000,
          maxWidth: 2000,
        },
        async (response) => {
          if (response.didCancel || response.errorCode) {
            return;
          }
          if (response.assets && response.assets[0]) {
            // Show preview instead of directly uploading
            const asset = response.assets[0];
            console.log('Camera image asset:', asset);
            setPreviewFile(asset);
            setPreviewMediaType('image');
            setPreviewFileExtension(null);
            setPreviewCaption('');
            setShowPreviewModal(true);
          }
        }
      );
    }
  };

  const handleOpenFiles = async () => {
    // On iOS, we need to handle modal closing carefully to prevent document picker from closing
    if (Platform.OS === 'ios') {
      // Set flag to prevent modal from closing
      setIsPickerLaunching(true);
      
      try {
        const response = await DocumentPicker.pick({
          presentationStyle: 'fullScreen',
          type: [DocumentPicker.types.allFiles],
        });
        
        // Reset flag and close modal after picker response
       
        
        if (response && response[0]) {
           setIsPickerLaunching(false);
        setShowShareMediaModal(false);
          // Extract file extension
          const fileName = response[0].name || response[0].fileName || '';
          const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
          // Show preview instead of directly uploading
          setPreviewFile(response[0]);
          setPreviewMediaType('file');
          setPreviewFileExtension(fileExtension);
          setPreviewCaption('');
          setShowPreviewModal(true);
        }
      } catch (err) {
        // Reset flag on error or cancel
        // setIsPickerLaunching(false);
        // setShowShareMediaModal(false);
        
        if (DocumentPicker.isCancel(err)) {
          // User cancelled
          return;
        }
        console.error('Document picker error:', err);
        setToastMsg('Failed to select file');
      }
    } else {
      // On Android, close immediately as before
      setShowShareMediaModal(false);
      try {
        const response = await DocumentPicker.pick({
          presentationStyle: 'fullScreen',
          type: [DocumentPicker.types.allFiles],
        });
        if (response && response[0]) {
          // Extract file extension
          const fileName = response[0].name || response[0].fileName || '';
          const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
          // Show preview instead of directly uploading
          setPreviewFile(response[0]);
          setPreviewMediaType('file');
          setPreviewFileExtension(fileExtension);
          setPreviewCaption('');
          setShowPreviewModal(true);
        }
      } catch (err) {
        if (DocumentPicker.isCancel(err)) {
          // User cancelled
          return;
        }
        console.error('Document picker error:', err);
        setToastMsg('Failed to select file');
      }
    }
  };

  const handlePreviewSend = async () => {
    if (!previewFile) return;
    setShowPreviewModal(false);
    await uploadAndSendMedia(previewFile, previewMediaType, previewFileExtension, previewCaption);
    // Reset preview state
    setPreviewFile(null);
    setPreviewMediaType(null);
    setPreviewFileExtension(null);
    setPreviewCaption('');
  };

  const handlePreviewCancel = () => {
    setShowPreviewModal(false);
    setPreviewFile(null);
    setPreviewMediaType(null);
    setPreviewFileExtension(null);
    setPreviewCaption('');
  };

  const uploadAndSendMedia = async (file, mediaType, fileExtension = '', caption = '') => {
    if (!file || !crowdId || !deviceId) return;

    // Check file size limit (100MB)
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes
    const fileSize = file.size || file.fileSize;
    
    if (fileSize && fileSize > MAX_FILE_SIZE) {
      setToastMsg('File size exceeds 100MB limit. Please select a smaller file.');
      return;
    }

    setIsUploadingMedia(true);
    setLoader(true);

    // Get file name for optimistic message
    const fileName = file.name || file.fileName || `Document.${fileExtension || 'pdf'}`;

    // Create optimistic loading message immediately
    const tempUploadId = `uploading_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const isFileType = mediaType === 'file' && fileExtension && !['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension.toLowerCase());
    
    if (isFileType) {
      // Create optimistic file message with loading state
      const optimisticMessage = {
        messageId: tempUploadId,
        senderDeviceId: deviceId,
        senderName: currentUserGhostName,
        text: 'Media',
        media: null, // Will be set after upload
        fileExtension: fileExtension,
        timestamp: new Date(),
        isCurrentUser: true,
        isUploading: true, // Mark as uploading
        fileName: fileName, // Store original filename
      };
      setMessages(prev => [...prev, optimisticMessage]);
      
      // Scroll to bottom to show loading message
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }

    try {
      const formData = new FormData();
      formData.append('deviceId', deviceId);
      formData.append('mediaType', mediaType);
      // Pass file extension to backend
      if (fileExtension) {
        formData.append('fileExtension', fileExtension);
      }
      formData.append('images', {
        uri: file.uri,
        type: file.type || (mediaType === 'image' ? 'image/jpeg' : 'application/octet-stream'),
        name: file.fileName || file.name || `file.${mediaType === 'image' ? 'jpg' : fileExtension || 'pdf'}`,
      });

      const uploadResponse = await uploadGhostMedia(formData);
      
      if (uploadResponse && uploadResponse.data && uploadResponse.data.mediaurl) {
        const mediaUrl = uploadResponse.data.mediaurl;
        
        // Send message with media and file type info
        // Pass the upload message ID so handleSend can update it instead of creating new
        await handleSend(mediaUrl, mediaType === 'file' ? fileExtension : null, isFileType ? tempUploadId : null, caption);
      } else {
        // Remove optimistic message on error
        if (isFileType) {
          setMessages(prev => prev.filter(msg => msg.messageId !== tempUploadId));
        }
        throw new Error('Failed to upload media');
      }
    } catch (error) {
      console.error('Upload error:', error);
      // Remove optimistic message on error
      if (isFileType) {
        setMessages(prev => prev.filter(msg => msg.messageId !== tempUploadId));
      }
      setToastMsg(error?.response?.data?.message || error?.message || 'Failed to upload media');
    } finally {
      setIsUploadingMedia(false);
      setLoader(false);
    }
  };

  // Helper function to add system message
  const addSystemMessage = (text) => {
    const systemMessage = {
      messageId: `system_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      senderDeviceId: 'system',
      senderName: 'System',
      text: text,
      timestamp: new Date(),
      isCurrentUser: false,
      isSystemMessage: true,
    };
    setMessages(prev => [...prev, systemMessage]);
    // Scroll to bottom after adding system message
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = (message, index) => {
    // Use messageId as key, but add index as fallback for uniqueness
    const uniqueKey = message.messageId || `msg_${index}_${message.timestamp?.getTime() || Date.now()}`;
    
    // Check if this is a system message
    const isSystemMessage = message.isSystemMessage || message.senderDeviceId === 'system';
    
    if (isSystemMessage) {
      // System message - centered, pill-style
      return (
        <View 
          key={uniqueKey} 
          style={styles.systemMessageContainer}
          onLayout={(event) => {
            const { y } = event.nativeEvent.layout;
            if (message.messageId) {
              messagePositionsRef.current.set(message.messageId, y);
            }
          }}>
          <View style={styles.systemMessageBubble}>
            <Text style={styles.systemMessageText}>{message.text}</Text>
          </View>
        </View>
      );
    }
    
    const avatarColor = message.isCurrentUser 
      ? currentUserAvatarColor 
      : generateAvatarColor(message.senderName);
    const initials = message.isCurrentUser 
      ? currentUserInitials 
      : getInitials(message.senderName);
    const time = formatTime(message.timestamp);
    const hasMedia = message.media && typeof message.media === 'string' && message.media.trim().length > 0;
    const isUploading = message.isUploading === true;
    
    // Determine if it's an image or file based on fileExtension or URL
    const hasFileExtension = message.fileExtension && message.fileExtension !== 'file';
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    // If uploading, it's a file (we know from the upload context)
    // Otherwise, check based on extension or URL
    const isImage = !isUploading && hasMedia && (
      (hasFileExtension && imageExtensions.includes(message.fileExtension.toLowerCase())) ||
      (!hasFileExtension && (
        message.media.toLowerCase().includes('.jpg') || 
        message.media.toLowerCase().includes('.jpeg') || 
        message.media.toLowerCase().includes('.png') || 
        message.media.toLowerCase().includes('.gif') || 
        message.media.toLowerCase().includes('.webp') ||
        message.media.toLowerCase().includes('image')
      ))
    );
    const isFile = (hasMedia && !isImage) || isUploading;
    const fileName = isFile || isUploading 
      ? (message.fileName || extractFileName(message.media, message.fileExtension) || 'Document')
      : null;
    
    if (message.isCurrentUser) {
      // Current user's message - right side
      return (
        <View 
          key={uniqueKey} 
          style={styles.messageContainerRight}
          onLayout={(event) => {
            const { y } = event.nativeEvent.layout;
            if (message.messageId) {
              messagePositionsRef.current.set(message.messageId, y);
            }
          }}>
          <TouchableOpacity
            style={styles.messageBubbleRight}
            onLongPress={(e) => handleMessageLongPress(message, e)}
            activeOpacity={0.9}>
            {hasMedia && isImage && (
              <TouchableOpacity
                onPress={() => setSelectedImageUri(message.media)}
                activeOpacity={0.9}>
                <Image
                  source={{ uri: message.media }}
                  style={styles.messageMedia}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
            {(isFile || isUploading) && (
              <TouchableOpacity
                style={styles.messageFileContainer}
                onPress={isUploading ? undefined : () => handleFileDownload(message.media)}
                activeOpacity={isUploading ? 1 : 0.7}
                disabled={isUploading}>
                <View style={styles.messageFileContent}>
                  <View style={styles.messageFileIconContainer}>
                    {isUploading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <ShareFileIcon width={24} height={24} color="#FFFFFF" />
                    )}
                  </View>
                  <View style={styles.messageFileTextContainer}>
                    <Text style={styles.messageFileName} numberOfLines={1}>
                      {fileName || 'Document'}
                    </Text>
                    <Text style={styles.messageFileDownloadText}>
                      {isUploading ? 'Uploading...' : 'Tap to download'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            {message.text && message.text !== 'Media' && (
              <Hyperlink
                onPress={(url, text) => {
                  if (url.startsWith('tel:')) {
                    Linking.openURL(url);
                  } else {
                    Linking.openURL(url);
                  }
                }}
                inkify={linkify}
                linkStyle={{ color: '#FFFFFF', textDecorationLine: 'underline', opacity: 0.8 }}>
                <Text style={styles.messageTextRight}>{message.text}</Text>
              </Hyperlink>
            )}
            <Text style={styles.messageTimeRight}>{time}</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      // Other users' messages - left side
      return (
        <View 
          key={uniqueKey} 
          style={styles.messageContainerLeft}
          onLayout={(event) => {
            const { y } = event.nativeEvent.layout;
            if (message.messageId) {
              messagePositionsRef.current.set(message.messageId, y);
            }
          }}>
          <View style={[styles.avatarCircle, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.messageContentLeft}>
            <TouchableOpacity
              style={styles.messageBubbleLeft}
              onLongPress={(e) => handleMessageLongPress(message, e)}
              activeOpacity={0.9}>
              <Text style={styles.senderName}>{message.senderName}</Text>
              {hasMedia && isImage && (
                <TouchableOpacity
                  onPress={() => setSelectedImageUri(message.media)}
                  activeOpacity={0.9}>
                  <Image
                    source={{ uri: message.media }}
                    style={styles.messageMedia}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
              {(isFile || isUploading) && (
                <TouchableOpacity
                  style={styles.messageFileContainerLeft}
                  onPress={isUploading ? undefined : () => handleFileDownload(message.media)}
                  activeOpacity={isUploading ? 1 : 0.7}
                  disabled={isUploading}>
                  <View style={styles.messageFileContent}>
                    <View style={styles.messageFileIconContainerLeft}>
                      {isUploading ? (
                        <ActivityIndicator size="small" color="#9B7BFF" />
                      ) : (
                        <ShareFileIcon width={24} height={24} />
                      )}
                    </View>
                    <View style={styles.messageFileTextContainer}>
                      <Text style={styles.messageFileNameLeft} numberOfLines={1}>
                        {fileName || 'Document'}
                      </Text>
                      <Text style={styles.messageFileDownloadTextLeft}>
                        {isUploading ? 'Uploading...' : 'Tap to download'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              {message.text && message.text !== 'Media' && (
                <Hyperlink
                  onPress={(url, text) => {
                    if (url.startsWith('tel:')) {
                      Linking.openURL(url);
                    } else {
                      Linking.openURL(url);
                    }
                  }}
                  inkify={linkify}
                  linkStyle={{ color: '#FFFFFF', textDecorationLine: 'underline', opacity: 0.8 }}>
                  <Text style={styles.messageTextLeft}>{message.text}</Text>
                </Hyperlink>
              )}
              <Text style={styles.messageTimeLeft}>{time}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        enabled>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <BackButtonIcon />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle} numberOfLines={1}>
            {getCrowdDisplayName(crowdName) || 'Crowd Name'}
          </Text>
          
          <View style={styles.headerRight}>
            {isChatLocked && (
              <View style={styles.headerIconButton}>
                <LockIcon width={16} height={16} stroke="#FFA500" />
              </View>
            )}
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={handleGroupInfo}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <UserGroupIcon width={20} height={20} />
            </TouchableOpacity>
            <TouchableOpacity
              ref={menuButtonRef}
              style={styles.headerIconButton}
              onPress={handleMenu}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MenuIcon />
            </TouchableOpacity>
          </View>
        </View>

        {/* Admin Controls Menu */}
        <Modal
          visible={showMenu}
          transparent
          animationType="fade"
          onRequestClose={handleCloseMenu}>
          <TouchableWithoutFeedback onPress={handleCloseMenu}>
            <View style={styles.menuOverlay}>
              <TouchableWithoutFeedback>
                <View
                  style={[
                    styles.menuContainer,
                    {
                      top: menuPosition.top,
                      right: menuPosition.right,
                    },
                  ]}>
                  {/* For non-admin users, show Report Crowd and Leave Crowd */}
                  {!userIsAdmin ? (
                    <>
                      {/* Report Crowd - Only for members */}
                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => handleMenuAction('reportCrowd')}
                        activeOpacity={0.7}>
                        <FlagIcon width={16} height={16} />
                        <Text style={[styles.menuItemText, { marginLeft: 12 }]}>Report Crowd</Text>
                      </TouchableOpacity>

                      <View style={styles.menuDivider} />

                      {/* Leave Crowd - Only option for non-admin users */}
                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => handleMenuAction('leaveCrowd')}
                        activeOpacity={0.7}>
                        <LeaveDoorIcon width={16} height={16} />
                        <Text style={[styles.menuItemText, { marginLeft: 12 }]}>Leave Crowd</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      {/* Admin Controls - Only show if user is admin */}
                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => handleMenuAction('adminControls')}
                        activeOpacity={0.7}>
                        <AdminShieldIcon width={16} height={16} />
                        <Text style={[styles.menuItemText, { marginLeft: 12 }]}>Admin Controls</Text>
                      </TouchableOpacity>

                      <View style={styles.menuDivider} />

                      {/* Lock/Unlock Chat - Only for admins */}
                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => handleMenuAction('toggleLock')}
                        activeOpacity={0.7}>
                        <UnlockIcon width={16} height={16} />
                        <Text style={[styles.menuItemText, { marginLeft: 12 }]}>
                          {isChatLocked ? 'Unlock Chat' : 'Lock Chat'}
                        </Text>
                      </TouchableOpacity>

                      {/* View QR Code - Only for admins */}
                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => handleMenuAction('viewQR')}
                        activeOpacity={0.7}>
                        <QRCodeIcon width={16} height={16} />
                        <Text style={[styles.menuItemText, { marginLeft: 12 }]}>View QR Code</Text>
                      </TouchableOpacity>

                      <View style={styles.menuDivider} />

                      {/* Manage Members - Only show if user is admin */}
                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => handleMenuAction('manageMembers')}
                        activeOpacity={0.7}>
                        <RemoveUserIcon width={16} height={16} />
                        <Text style={[styles.menuItemText, { marginLeft: 12 }]}>Manage Members</Text>
                      </TouchableOpacity>

                      {/* Delete Crowd - Only show if user is creator */}
                      {userIsCreator && (
                        <TouchableOpacity
                          style={styles.menuItem}
                          onPress={() => handleMenuAction('deleteCrowd')}
                          activeOpacity={0.7}>
                          <DeleteBinIcon width={16} height={16} />
                          <Text style={[styles.menuItemText, { marginLeft: 12 }]}>Delete Crowd</Text>
                        </TouchableOpacity>
                      )}

                      <View style={styles.menuDivider} />

                      {/* Leave Crowd - Also available for admins */}
                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => handleMenuAction('leaveCrowd')}
                        activeOpacity={0.7}>
                        <LeaveDoorIcon width={16} height={16} />
                        <Text style={[styles.menuItemText, { marginLeft: 12 }]}>Leave Crowd</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Message Action Menu */}
        <Modal
          visible={showMessageMenu}
          transparent
          animationType="fade"
          onRequestClose={handleCloseMessageMenu}>
          <TouchableWithoutFeedback onPress={handleCloseMessageMenu}>
            <View style={styles.menuOverlay}>
              <TouchableWithoutFeedback>
                <View
                  ref={messageMenuRef}
                  style={[
                    styles.messageMenuContainer,
                    {
                      top: messageMenuPosition.top,
                      left: messageMenuPosition.left,
                    },
                  ]}>
                  {/* Copy Message - Available to everyone */}
                  <TouchableOpacity
                    style={styles.messageMenuItem}
                    onPress={handleCopyMessage}
                    activeOpacity={0.7}>
                    <CopyIcon width={16} height={16} strokeColor="#9B7BFF" />
                    <Text style={[styles.messageMenuItemText, { marginLeft: 12 }]}>Copy Message</Text>
                  </TouchableOpacity>

                 { selectedMessage?.senderDeviceId !== deviceId &&<>
                  <View style={styles.menuDivider} />
                          <TouchableOpacity
                            style={styles.messageMenuItem}
                            onPress={() => {
                              setShowMessageMenu(false);
                              setShowReportMessageModal(true);
                            }}
                            activeOpacity={0.7}>
                            <FlagIcon width={16} height={16} strokeColor="#FFC107" />
                            <Text style={[styles.messageMenuItemText, { marginLeft: 12 }]}>Report Message</Text>
                          </TouchableOpacity>
                  </>}
                 { selectedMessage?.senderDeviceId !== deviceId && !userIsAdmin &&<>
                  <View style={styles.menuDivider} />
                          <TouchableOpacity
                            style={styles.messageMenuItem}
                            onPress={() => {
                              setShowMessageMenu(false);
                              setShowBlockUserModal(true);
                            }}
                            activeOpacity={0.7}>
                            <BanSvg width={16} height={16} />
                            <Text style={[styles.messageMenuItemText, { marginLeft: 12 }]}>Block User</Text>
                          </TouchableOpacity>
                  </>}
                 

                  {/* Admin-only: for own message only Pin Message; for others also Report, Mute, Block */}
                  {userIsAdmin && (
                    <>
                      <View style={styles.menuDivider} />
                      <TouchableOpacity
                        style={styles.messageMenuItem}
                        onPress={handlePinMessage}
                        activeOpacity={0.7}>
                        <PinIcon width={16} height={16} />
                        <Text style={[styles.messageMenuItemText, { marginLeft: 12 }]}>Pin Message</Text>
                      </TouchableOpacity>
                      {selectedMessage?.senderDeviceId !== deviceId && (
                        <>
                         
                          <View style={styles.menuDivider} />
                          {(() => {
                            const senderMutedUntil = selectedMessage?.senderDeviceId ? mutedMembersMap[selectedMessage.senderDeviceId] : null;
                            const isSelectedSenderMuted = senderMutedUntil && new Date(senderMutedUntil) > new Date();
                            return isSelectedSenderMuted ? (
                              <TouchableOpacity
                                style={styles.messageMenuItem}
                                onPress={handleUnmuteMember}
                                activeOpacity={0.7}>
                                <LockIcon width={16} height={16} strokeColor="#FFC107" />
                                <Text style={[styles.messageMenuItemText, { marginLeft: 12 }]}>Unmute</Text>
                              </TouchableOpacity>
                            ) : (
                              <TouchableOpacity
                                style={styles.messageMenuItem}
                                onPress={() => {
                                  setShowMessageMenu(false);
                                  setShowMuteMemberModal(true);
                                }}
                                activeOpacity={0.7}>
                                <LockIcon width={16} height={16} strokeColor="#FFC107" />
                                <Text style={[styles.messageMenuItemText, { marginLeft: 12 }]}>Mute Member</Text>
                              </TouchableOpacity>
                            );
                          })()}
                          <View style={styles.menuDivider} />
                          <TouchableOpacity
                            style={styles.messageMenuItem}
                            onPress={() => {
                              setShowMessageMenu(false);
                              setShowBlockMemberModal(true);
                            }}
                            activeOpacity={0.7}>
                            <RemoveUserIcon width={16} height={16} strokeColor="#FF6363" />
                            <Text style={[styles.messageMenuItemText, { marginLeft: 12 }]}>Block Member</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Pinned Message Banner - Sticky at top */}
        {pinnedMessage && (
          <View style={styles.pinnedMessageBanner}>
            <TouchableOpacity
              style={styles.pinnedMessageContent}
              onPress={handlePinnedMessagePress}
              activeOpacity={0.7}>
              <PinIcon width={16} height={16} />
              <View style={styles.pinnedMessageTextContainer}>
                <Text style={styles.pinnedMessageLabel}>Pinned Message</Text>
                <Text style={styles.pinnedMessagePreview} numberOfLines={1}>
                  {pinnedMessage.text || (pinnedMessage.media ? 'Media' : '')}
                </Text>
              </View>
            </TouchableOpacity>
            {userIsAdmin && (
              <TouchableOpacity
                style={styles.pinnedMessageClose}
                onPress={handleUnpinMessage}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <CrossIcon width={16} height={16} strokeColor="rgba(255, 255, 255, 0.6)" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Chat Lock Banner - Sticky at top */}
        {isChatLocked && (
          <View style={styles.lockedMessageBanner}>
            <View style={styles.lockedMessageContent}>
              <InfoIcon width={16} height={16} stroke="#FFC107" />
              <View style={styles.lockedMessageTextContainer}>
                <Text style={styles.lockedMessageText}>
                  Chat is locked by admins. Only admins can send messages.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Muted Banner - Current user is muted */}
        {currentUserMutedUntil && new Date(currentUserMutedUntil) > new Date() && (
          <View style={styles.lockedMessageBanner}>
            <View style={styles.lockedMessageContent}>
              <InfoIcon width={16} height={16} stroke="#FFC107" />
              <View style={styles.lockedMessageTextContainer}>
                <Text style={styles.lockedMessageText}>
                  You are muted. You can't send messages until unmuted.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Chat Messages Area */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => {
            // Auto-scroll to bottom when content size changes (new messages)
            // This provides WhatsApp-like smooth behavior
            if (scrollViewRef.current) {
              scrollViewRef.current.scrollToEnd({ animated: true });
            }
          }}>
          {isLoadingMessages ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#9B7BFF" />
              <Text style={styles.loadingText}>Loading messages...</Text>
            </View>
          ) : (
            <>
              {actualMessages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyHistoryPillWrapper}>
                <View style={styles.systemMessageContainer}>
                  <View style={styles.systemMessageBubble}>
                    <Text style={styles.systemMessageText}>
                      History disappears in {calculateDaysRemaining} {calculateDaysRemaining === 1 ? 'day' : 'days'}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.emptyContentCenter}>
                <GhostIcon width={80} height={80} strokeColor="#9B7BFF" />
                <Text style={styles.emptyText}>No messages yet</Text>
                <Text style={styles.emptySubtext}>Be the first to say something!</Text>
              </View>
            </View>
          ) : (
            deduplicatedMessages.map((message, index) => renderMessage(message, index))
              )}
            </>
          )}
        </ScrollView>

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <View style={styles.typingIndicatorContainer}>
              <TypingDots />
            <Text style={styles.typingIndicatorText}>
              {typingUsers.length === 1
                ? `${typingUsers[0].ghostName} is typing`
                : typingUsers.length === 2
                ? `${typingUsers[0].ghostName} and ${typingUsers[1].ghostName} are typing`
                : `${typingUsers[0].ghostName} and ${typingUsers.length - 1} others are typing`}
            </Text>
          </View>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          {userIsAdmin && (
            <TouchableOpacity
              style={styles.attachmentButton}
              onPress={() => setShowShareMediaModal(true)}
              activeOpacity={0.7}>
              <AttachmentIcon color="#9B7BFF" />
            </TouchableOpacity>
          )}
          <TextInput
            style={[
              styles.input,
              ((isChatLocked && !userIsAdmin) || (currentUserMutedUntil && new Date(currentUserMutedUntil) > new Date())) && styles.inputDisabled
            ]}
            placeholder={
              (currentUserMutedUntil && new Date(currentUserMutedUntil) > new Date())
                ? "You are muted. You can't send messages until unmuted."
                : (isChatLocked && !userIsAdmin)
                  ? "Only admins can send messages or media right now."
                  : "Message..."
            }
            placeholderTextColor="#5E607E"
            value={messageText}
            onChangeText={handleTextChange}
            multiline
            maxLength={500}
            editable={!((isChatLocked && !userIsAdmin) || (currentUserMutedUntil && new Date(currentUserMutedUntil) > new Date()))}
            onFocus={() => {
              // WhatsApp-like: smooth scroll when input is focused
              // Let KeyboardAvoidingView handle the smooth movement, just ensure we're at bottom
              setTimeout(() => {
                if (scrollViewRef.current) {
                  scrollViewRef.current.scrollToEnd({ animated: true });
                }
              }, Platform.OS === 'ios' ? 100 : 50);
            }}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (messageText.trim().length === 0 || (isChatLocked && !userIsAdmin) || (currentUserMutedUntil && new Date(currentUserMutedUntil) > new Date())) && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={messageText.trim().length === 0 || (isChatLocked && !userIsAdmin) || (currentUserMutedUntil && new Date(currentUserMutedUntil) > new Date())}
            activeOpacity={0.7}>
            <SendIcon />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Delete Crowd Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        title="Are you sure you want to delete this crowd?"
        message="This will permanently remove the crowd for all members."
        confirmText="Delete Crowd"
        cancelText="Cancel"
        color="#FF6363"
        icon={GhostIcon}
        onConfirm={handleDeleteCrowd}
        onCancel={() => setShowDeleteModal(false)}
        delayed
      />

      {/* Leave Crowd Warning Modal - Only Admin */}
      <ConfirmationModal
        visible={showLeaveWarningModal}
        title="Please assign another admin before leaving"
        message="You are the only admin in this crowd. Promote someone else to admin before you can leave."
        cancelText="OK"
        color="#FFA500"
        icon={WarningIcon}
        showConfirmButton={false}
        onCancel={() => setShowLeaveWarningModal(false)}
        delayed
      />

      {/* Leave Crowd Confirmation Modal */}
      <ConfirmationModal
        visible={showLeaveModal}
        title="Are you sure you want to leave this crowd?"
        message="This will remove you from the crowd."
        confirmText="Leave Crowd"
        cancelText="Cancel"
        color="#FF6363"
        icon={GhostIcon}
        onConfirm={handleLeaveCrowd}
        onCancel={() => setShowLeaveModal(false)}
        delayed
      />

      {/* Report Crowd Modal */}
      <ReportCrowdModal
        visible={showReportModal}
        crowdName={crowdName}
        onClose={() => setShowReportModal(false)}
        onSubmit={(reasonKey, details) => {
          setShowReportModal(false);
          handleReportCrowd(reasonKey, details);
        }}
      />

      {/* Report Message Modal */}
      <ReportCrowdModal
        visible={showReportMessageModal}
        variant="message"
        targetName={selectedMessage?.senderName}
        messageText={
          selectedMessage
            ? (selectedMessage.text && selectedMessage.text.trim()
                ? selectedMessage.text.trim()
                : selectedMessage.media
                  ? '[Attachment]'
                  : '')
            : ''
        }
        onClose={() => {
          setShowReportMessageModal(false);
          setSelectedMessage(null);
        }}
        onSubmit={(reasonKey, details) => {
          setShowReportMessageModal(false);
          handleReportMessage(reasonKey, details);
        }}
      />

      {/* Block Member Modal */}
      <BlockMemberModal
        visible={showBlockMemberModal}
        memberName={selectedMessage?.senderName}
        onClose={() => {
          setShowBlockMemberModal(false);
          setSelectedMessage(null);
        }}
        onConfirm={handleBlockMember}
      />

      {/* Block User Modal */}
      <BlockUserModal
        visible={showBlockUserModal}
        userName={selectedMessage?.senderName}
        onClose={() => {
          setShowBlockUserModal(false);
          setSelectedMessage(null);
        }}
        onConfirm={handleBlockUser}
      />

      {/* Mute Member Modal */}
      <MuteMemberModal
        visible={showMuteMemberModal}
        memberName={selectedMessage?.senderName}
        onClose={() => {
          setShowMuteMemberModal(false);
          setSelectedMessage(null);
        }}
        onConfirm={handleMuteMember}
      />

      {/* Share Media Modal */}
      <ShareMediaModal
        visible={showShareMediaModal}
        preventClose={Platform.OS === 'ios' && isPickerLaunching}
        onClose={() => setShowShareMediaModal(false)}
        onSelectGallery={handleOpenGallery}
        onSelectCamera={handleOpenCamera}
        onSelectFiles={handleOpenFiles}
      />

      {/* Preview & Send Modal */}
      <Modal
        visible={showPreviewModal}
        transparent
        animationType="slide"
        onRequestClose={handlePreviewCancel}>
        <View style={styles.previewModalOverlay}>
          <KeyboardAvoidingView
            style={styles.previewModalContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
            {/* Header */}
            <View style={styles.previewHeader}>
              <TouchableOpacity
                onPress={handlePreviewCancel}
                style={styles.previewBackButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <BackButtonIcon />
              </TouchableOpacity>
              <Text style={styles.previewHeaderTitle}>Preview & Send</Text>
              <TouchableOpacity
                onPress={handlePreviewCancel}
                style={styles.previewCloseButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <CrossIcon width={20} height={20} />
              </TouchableOpacity>
            </View>

            {/* Preview Content */}
            <ScrollView
              style={styles.previewContent}
              contentContainerStyle={styles.previewContentContainer}
              showsVerticalScrollIndicator={false}
              bounces={false}>
              {previewFile && (
                <>
                  {previewMediaType === 'image' ? (
                    <View style={styles.previewImageContainer}>
                      <Image
                        source={{ uri: previewFile.uri || previewFile.path || previewFile.assets?.[0]?.uri }}
                        style={styles.previewImage}
                        resizeMode="contain"
                        onError={(error) => {
                          console.error('Image load error:', error);
                          console.log('Preview file:', previewFile);
                          console.log('Image URI:', previewFile.uri || previewFile.path);
                        }}
                        onLoad={(event) => {
                          console.log('Image loaded successfully');
                          const { width, height } = event.nativeEvent.source;
                          console.log('Image dimensions:', width, height);
                        }}
                      />
                    </View>
                  ) : (
                    <View style={styles.previewFileContainer}>
                      <ShareFileIcon width={64} height={64} />
                      <Text style={styles.previewFileName} numberOfLines={2}>
                        {previewFile.name || previewFile.fileName || 'Document'}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </ScrollView>

            {/* Caption Input */}
            <View style={styles.previewInputContainer}>
              <TextInput
                style={styles.previewInput}
                placeholder="Add a caption (optional)..."
                placeholderTextColor="#5E607E"
                value={previewCaption}
                onChangeText={setPreviewCaption}
                multiline
                maxLength={500}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.previewActionsContainer}>
              <TouchableOpacity
                style={styles.previewCancelButton}
                onPress={handlePreviewCancel}
                activeOpacity={0.7}>
                <CrossIcon width={20} height={20} strokeColor="#FFFFFF" />
                <Text style={styles.previewCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.previewSendButton}
                onPress={handlePreviewSend}
                activeOpacity={0.7}>
                <TickIcon width={20} height={20} stroke="#FFFFFF" />
                <Text style={styles.previewSendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal
        visible={selectedImageUri !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImageUri(null)}>
        <TouchableWithoutFeedback onPress={() => setSelectedImageUri(null)}>
          <View style={styles.imageModalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.imageModalContainer}>
                {selectedImageUri && (
                  <Image
                    source={{ uri: selectedImageUri }}
                    style={styles.imageModalImage}
                    resizeMode="contain"
                  />
                )}
                <TouchableOpacity
                  style={styles.imageModalCloseButton}
                  onPress={() => setSelectedImageUri(null)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={styles.imageModalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

export default CrowdChatScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIconButton: {
    padding: 4,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  messageContainerLeft: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  messageContainerRight: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'flex-end',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 16,
    color: '#FFFFFF',
  },
  messageContentLeft: {
    flex: 1,
    maxWidth: '75%',
  },
  messageBubbleLeft: {
    backgroundColor: '#25263A',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: 4,
  },
  senderName: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 14,
    color: '#9B7BFF',
    marginBottom: 6,
  },
  messageBubbleRight: {
    backgroundColor: '#9B7BFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopRightRadius: 4,
    maxWidth: '75%',
  },
  messageTextLeft: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 4,
  },
  messageTextRight: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 4,
  },
  messageTimeLeft: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 12,
    color: '#8B8CAD',
    textAlign: 'right',
  },
  messageTimeRight: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  messageMedia: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  messageFileContainer: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    marginBottom: 8,
    minWidth: 200,
    alignSelf: 'flex-start',
    minHeight: 60,
  },
  messageFileContainerLeft: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginBottom: 8,
    minWidth: 200,
    alignSelf: 'flex-start',
    minHeight: 60,
  },
  messageFileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageFileIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  messageFileIconContainerLeft: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  messageFileTextContainer: {
    flex: 1,
    flexShrink: 1,
  },
  messageFileName: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  messageFileNameLeft: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  messageFileDownloadText: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  messageFileDownloadTextLeft: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 12,
    color: '#8B8CAD',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  attachmentButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderRadius: 22,
    backgroundColor: '#181830',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    ...(Platform.OS === 'ios' && {
      paddingTop: 14,
      paddingBottom: 18,
    }),
    fontFamily: FontFamily.robotoRegular,
    fontSize: 15,
    lineHeight: 20,
    color: '#FFFFFF',
    marginRight: 12,
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#9B7BFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#25263A',
    opacity: 0.5,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menuContainer: {
    position: 'absolute',
    width: 224,
    backgroundColor: '#25263A',
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  menuItemText: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 14,
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontFamily: FontFamily.robotoRegular,
    fontSize: 14,
    color: '#8B8CAD',
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    // paddingVertical: 40,
  },
  emptyHistoryPillWrapper: {
    marginBottom: 8,
  },
  emptyContentCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: FontFamily.robotoRegular,
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 16,
  },
  emptySubtext: {
    fontFamily: FontFamily.robotoRegular,
    fontSize: 14,
    color: '#8B8CAD',
    textAlign: 'center',
    marginTop: 8,
  },
  lockedMessageBanner: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 193, 7, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  lockedMessageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lockedMessageTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  lockedMessageText: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 14,
    color: '#FFC107',
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginBottom: 16,
    marginHorizontal: 20,
  },
  systemMessageBubble: {
    backgroundColor: '#141422',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '85%',
  },
  systemMessageText: {
    fontFamily: FontFamily.robotoRegular,
    fontSize: 12,
    color: '#5E607E',
    textAlign: 'center',
    lineHeight: 16,
  },
  inputDisabled: {
    opacity: 0.5,
    backgroundColor: '#0F0F1A',
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  imageModalImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  imageModalCloseButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  imageModalCloseText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '300',
    lineHeight: 24,
  },
  previewModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  previewModalContainer: {
    flex: 1,
    backgroundColor: '#0A0A14',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: '#0A0A14',
    zIndex: 10,
  },
  previewBackButton: {
    padding: 4,
  },
  previewHeaderTitle: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 18,
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  previewCloseButton: {
    padding: 4,
  },
  previewContent: {
    flex: 1,
  },
  previewContentContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  previewImageContainer: {
    width: Dimensions.get('window').width - 40,
    backgroundColor: '#000000',
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    maxHeight: Dimensions.get('window').height * 0.5,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewFileContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  previewFileName: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
    maxWidth: '80%',
  },
  previewInputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: '#0A0A14',
    zIndex: 10,
  },
  previewInput: {
    width: '100%',
    minHeight: 44,
    maxHeight: 100,
    borderRadius: 12,
    backgroundColor: '#181830',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: FontFamily.robotoRegular,
    fontSize: 15,
    color: '#FFFFFF',
  },
  previewActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
    backgroundColor: '#0A0A14',
    zIndex: 10,
  },
  previewCancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#141422',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  previewCancelButtonText: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 16,
    color: '#FFFFFF',
  },
  previewSendButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9B7BFF',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  previewSendButtonText: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 16,
    color: '#FFFFFF',
  },
  messageMenuContainer: {
    position: 'absolute',
    width: 180,
    backgroundColor: '#25263A',
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  messageMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageMenuItemText: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 14,
    color: '#FFFFFF',
  },
  pinnedMessageBanner: {
    backgroundColor: 'rgba(155, 123, 255, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(155, 123, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  pinnedMessageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  pinnedMessageTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  pinnedMessageLabel: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 12,
    color: '#9B7BFF',
    marginBottom: 2,
  },
  pinnedMessagePreview: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 14,
    color: '#FFFFFF',
  },
  pinnedMessageClose: {
    padding: 4,
  },
  typingIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  typingIndicatorText: {
    fontFamily: FontFamily.robotoRegular,
    fontSize: 13,
    color: '#8B8CAD',
    fontStyle: 'italic',
  },
  typingDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 8,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9B7BFF',
  },
});

