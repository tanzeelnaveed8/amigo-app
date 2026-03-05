import React, { useState, useMemo, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import CrossIcon from '../../assets/svg/CrossIcon';
import AddUserIcon from '../../assets/svg/AddUserIcon';
import RemoveUserIcon from '../../assets/svg/RemoveUserIcon';
import AdminShieldIcon from '../../assets/svg/AdminShieldIcon';
import ConfirmationModal from '../../component/Ghost/ConfirmationModal';
import { FontFamily } from '../../../GlobalStyles';
import { getCrowdMembers, updateAdminStatus, removeMember } from '../../apis/ghost';
import { getGhostDeviceId } from '../../utils/ghostDeviceId';
import {
  onMemberJoined,
  onMemberLeft,
  onMemberRemoved,
  onAdminUpdated,
  removeAllGhostListeners,
} from '../../utils/ghostSocket';
import Context from '../../context';

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

// Format date and time in human-readable format (date + time without seconds)
const formatJoinTime = (date) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const joinDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  // Format time without seconds
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const timeString = `${displayHours}:${formattedMinutes} ${ampm}`;
  
  // Determine date string
  let dateString;
  if (joinDate.getTime() === today.getTime()) {
    dateString = 'Today';
  } else if (joinDate.getTime() === yesterday.getTime()) {
    dateString = 'Yesterday';
  } else {
    // Format as "Mon DD, YYYY" (e.g., "Jan 15, 2024")
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    dateString = `${month} ${day}, ${year}`;
  }
  
  return `${dateString} at ${timeString}`;
};

const CrowdMembersScreen = ({ navigation }) => {
  const route = useRoute();
  const { crowdId, crowdName, ghostName, avatarBgColor, isCreator } = route.params || {};
  const { setLoader, setToastMsg } = useContext(Context);

  const currentUserGhostName = ghostName || 'Ghost';
  const currentUserAvatarColor = avatarBgColor || '#155DFC';
  const [currentUserIsAdmin, setCurrentUserIsAdmin] = useState(false);
  const [currentUserIsCreator, setCurrentUserIsCreator] = useState(false);

  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceId, setDeviceId] = useState(null);

  // Load members from API
  useEffect(() => {
    const loadMembers = async () => {
      if (!crowdId) {
        setToastMsg('Crowd ID is missing');
        navigation.goBack();
        return;
      }

      try {
        const id = await getGhostDeviceId();
        setDeviceId(id);

        const response = await getCrowdMembers(crowdId, id);
        
        if (response.status === 200 && response.data) {
          // Map API response to local format
          const formattedMembers = response.data.map(member => ({
            memberId: member.memberId,
            ghostName: member.ghostName,
            avatarBgColor: member.avatarBgColor,
            isAdmin: member.isAdmin,
            isCreator: member.isCreator,
            joinedAt: new Date(member.joinedAt),
            deviceId: member.deviceId || null, // Store deviceId if available
            isCurrentUser: false, // Will be set below
          }));

          // Mark current user by deviceId (more reliable than ghostName)
          const updatedMembers = formattedMembers.map(m => {
            const isCurrentUser = m.deviceId === id;
            // Update admin and creator status if current user
            if (isCurrentUser) {
              setCurrentUserIsAdmin(m.isAdmin);
              setCurrentUserIsCreator(m.isCreator);
            }
            return {
              ...m,
              isCurrentUser, // Use deviceId for identification
            };
          });

          setMembers(updatedMembers);
        }

        // Set up socket listeners for real-time updates after deviceId is available
        // Use closure variable 'id' for accurate deviceId comparison
        onMemberJoined((data) => {
          if (data.crowdId === crowdId && data.member) {
            const isCurrentUser = data.member.deviceId === id; // Use closure variable
            
            // Update creator status if current user joined
            if (isCurrentUser) {
              setCurrentUserIsCreator(data.member.isCreator);
            }
            
            setMembers(prev => {
              // Check if member already exists by deviceId
              const exists = prev.some(m => m.deviceId === data.member.deviceId);
              if (exists) return prev;
              
              return [...prev, {
                memberId: data.member.memberId,
                deviceId: data.member.deviceId,
                ghostName: data.member.ghostName,
                avatarBgColor: data.member.avatarBgColor,
                isAdmin: data.member.isAdmin,
                isCreator: data.member.isCreator,
                joinedAt: new Date(),
                isCurrentUser, // Use closure variable
              }];
            });
          }
        });

        onMemberLeft((data) => {
          if (data.crowdId === crowdId && data.deviceId) {
            setMembers(prev => prev.filter(m => m.deviceId !== data.deviceId));
          }
        });

        onMemberRemoved((data) => {
          if (data.crowdId === crowdId && data.deviceId) {
            setMembers(prev => prev.filter(m => m.deviceId !== data.deviceId));
          }
        });

        onAdminUpdated((data) => {
          if (data.crowdId === crowdId && data.deviceId) {
            const isCurrentUserUpdate = data.deviceId === id; // Use closure variable
            
            // Update current user's admin status OUTSIDE of setMembers to avoid React anti-pattern
            if (isCurrentUserUpdate) {
              setCurrentUserIsAdmin(data.isAdmin);
            }
            
            // Update the member's admin status in the members array
            setMembers(prev => {
              return prev.map(m => {
                if (m.deviceId === data.deviceId) {
                  return { ...m, isAdmin: data.isAdmin };
                }
                return m;
              });
            });
          }
        });
      } catch (error) {
        console.error('Error loading members:', error);
        setToastMsg('Failed to load members');
      } finally {
        setIsLoading(false);
      }
    };

    loadMembers();

    // Cleanup - remove listeners when component unmounts
    return () => {
      // Note: We don't remove all listeners here as other screens might need them
      // The socket utility should handle cleanup properly
    };
  }, [crowdId, deviceId, navigation, setToastMsg]);

  const memberCount = members.length;

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    confirmText: '',
    color: '#9B7BFF',
    onConfirm: null,
    icon: null,
  });

  // Check if current user is admin (for showing action icons)
  // Compute from both state and members array to ensure accuracy
  const isCurrentUserAdmin = useMemo(() => {
    if (currentUserIsAdmin) return true;
    // Also check members array for current user's admin status
    const currentUserMember = members.find(m => m.isCurrentUser);
    return currentUserMember ? currentUserMember.isAdmin : currentUserIsAdmin;
  }, [currentUserIsAdmin, members]);

  // Check if current user is creator (for showing action icons)
  const isCurrentUserCreator = useMemo(() => {
    if (currentUserIsCreator) return true;
    // Also check members array for current user's creator status
    const currentUserMember = members.find(m => m.isCurrentUser);
    return currentUserMember ? currentUserMember.isCreator : currentUserIsCreator;
  }, [currentUserIsCreator, members]);

  const handleClose = () => {
    navigation.goBack();
  };

  const handleMakeAdmin = (member) => {
    if (!crowdId || !deviceId) return;

    // Prevent promoting creator (they're already admin by default)
    if (member.isCreator) {
      Alert.alert('Error', 'Creator is already an admin');
      return;
    }

    setModalConfig({
      title: 'Promote Member',
      message: `Are you sure you want to promote ${member.ghostName} to admin?`,
      confirmText: 'Promote',
      onConfirm: async () => {
        setShowModal(false);
        setLoader(true);

        try {
          const response = await updateAdminStatus({
            crowdId,
            memberDeviceId: member.deviceId,
            adminDeviceId: deviceId,
            isAdmin: true,
          });

          if (response.status === 200) {
            setToastMsg(`${member.ghostName} promoted to admin`);
            // Socket event will update the UI automatically
          } else {
            throw new Error(response.message || 'Failed to promote member');
          }
        } catch (error) {
          const errorMessage = error?.response?.data?.message || error?.message || 'Failed to promote member';
          setToastMsg(errorMessage);
          Alert.alert('Error', errorMessage);
        } finally {
          setLoader(false);
        }
      },
      icon: AddUserIcon,
    });
    setShowModal(true);
  };

  const handleDemoteAdmin = (member) => {
    if (!crowdId || !deviceId) return;

    // Prevent demoting yourself
    if (member.isCurrentUser) {
      Alert.alert('Error', 'Cannot demote yourself');
      return;
    }

    // Prevent demoting creator (only creator can demote themselves, but they shouldn't)
    if (member.isCreator) {
      Alert.alert('Error', 'Cannot demote the crowd creator');
      return;
    }

    setModalConfig({
      title: 'Demote Admin',
      message: `Are you sure you want to demote ${member.ghostName} from admin?`,
      confirmText: 'Demote',
      color: '#FFA500',
      onConfirm: async () => {
        setShowModal(false);
        setLoader(true);

        try {
          const response = await updateAdminStatus({
            crowdId,
            memberDeviceId: member.deviceId,
            adminDeviceId: deviceId,
            isAdmin: false,
          });

          if (response.status === 200) {
            setToastMsg(`${member.ghostName} demoted from admin`);
            // Socket event will update the UI automatically
          } else {
            throw new Error(response.message || 'Failed to demote admin');
          }
        } catch (error) {
          const errorMessage = error?.response?.data?.message || error?.message || 'Failed to demote admin';
          setToastMsg(errorMessage);
          Alert.alert('Error', errorMessage);
        } finally {
          setLoader(false);
        }
      },
      icon: AdminShieldIcon,
    });
    setShowModal(true);
  };

  const handleRemoveMember = (member) => {
    if (!crowdId || !deviceId) return;

    // Prevent removing yourself
    if (member.isCurrentUser) {
      Alert.alert('Error', 'Cannot remove yourself');
      return;
    }

    // Prevent removing creator (only creator can remove themselves, but they shouldn't via this action)
    if (member.isCreator) {
      Alert.alert('Error', 'Cannot remove the crowd creator');
      return;
    }

    setModalConfig({
      title: 'Remove Member',
      message: `Are you sure you want to remove ${member.ghostName} from the crowd?`,
      confirmText: 'Remove',
      color: '#FF6363',
      onConfirm: async () => {
        setShowModal(false);
        setLoader(true);

        try {
          const response = await removeMember({
            crowdId,
            memberDeviceId: member.deviceId,
            adminDeviceId: deviceId,
          });

          if (response.status === 200) {
            setToastMsg(`${member.ghostName} removed from crowd`);
            // Socket event will update the UI automatically
          } else {
            throw new Error(response.message || 'Failed to remove member');
          }
        } catch (error) {
          const errorMessage = error?.response?.data?.message || error?.message || 'Failed to remove member';
          setToastMsg(errorMessage);
          Alert.alert('Error', errorMessage);
        } finally {
          setLoader(false);
        }
      },
      icon: RemoveUserIcon,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleConfirm = () => {
    if (modalConfig.onConfirm) {
      modalConfig.onConfirm();
    }
  };

  const renderMember = (member) => {
    const avatarColor = member.isCurrentUser 
      ? currentUserAvatarColor
      : (member.avatarBgColor || generateAvatarColor(member.ghostName));
    const initials = getInitials(member.ghostName);
    const joinTime = formatJoinTime(member.joinedAt);
    
    // Determine if current user is admin or creator
    const currentUserMember = members.find(m => m.isCurrentUser);
    const userIsAdmin = isCurrentUserAdmin || (currentUserMember && currentUserMember.isAdmin);
    const userIsCreator = isCurrentUserCreator || (currentUserMember && currentUserMember.isCreator);
    
    // Show actions based on permissions:
    // - Creator can do actions on everyone except themselves
    // - Admin (not creator) can do actions on non-creators only
    // - Never show actions for creator unless current user is the creator themselves
    const showActions = !member.isCurrentUser && (
      (userIsCreator) || // Creator can do anything to everyone
      (userIsAdmin && !member.isCreator) // Admin can only do actions on non-creators
    );

    return (
      <View key={member.memberId} style={styles.memberTile}>
        <View style={[styles.avatarCircle, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.memberInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.memberName}>{member.ghostName}</Text>
            {member.isCreator && (
              <View style={styles.creatorPill}>
                <Text style={styles.creatorText}>CREATOR</Text>
              </View>
            )}
            {member.isAdmin && !member.isCreator && (
              <View style={styles.adminPill}>
                <Text style={styles.adminText}>ADMIN</Text>
              </View>
            )}
            {member.isCurrentUser && (
              <View style={styles.youPill}>
                <Text style={styles.youText}>YOU</Text>
              </View>
            )}
          </View>
          <Text style={styles.joinTime}>Joined {joinTime}</Text>
        </View>
        {showActions && (
          <View style={styles.actionIcons}>
            {member.isCreator ? (
              // Creator cannot have actions shown on them (only creator can see actions, but can't act on themselves)
              // This case shouldn't happen due to showActions logic, but keeping for safety
              null
            ) : member.isAdmin ? (
              // For admins (not creator): show Demote Admin and Remove Member
              // Creator can demote/remove admins, admins can demote/remove other admins
              <>
                <TouchableOpacity
                  style={[styles.actionIcon, { marginRight: 12 }]}
                  onPress={() => handleDemoteAdmin(member)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}>
                  <AdminShieldIcon width={18} height={18} strokeColor="#FFA500" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionIcon}
                  onPress={() => handleRemoveMember(member)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}>
                  <RemoveUserIcon width={16} height={16} />
                </TouchableOpacity>
              </>
            ) : (
              // For non-admins: show Make Admin and Remove Member
              // Creator and admins can promote/remove regular members
              <>
                <TouchableOpacity
                  style={[styles.actionIcon, { marginRight: 12 }]}
                  onPress={() => handleMakeAdmin(member)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}>
                  <AddUserIcon width={18} height={18} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionIcon}
                  onPress={() => handleRemoveMember(member)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}>
                  <RemoveUserIcon width={16} height={16} />
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Crowd Members</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <CrossIcon width={16} height={16} />
          </TouchableOpacity>
        </View>

        {/* Member Count */}
        <Text style={styles.memberCount}>
          {memberCount} {memberCount === 1 ? 'ghost' : 'ghosts'} in this crowd
        </Text>

        {/* Members List */}
        <ScrollView
          style={styles.membersList}
          contentContainerStyle={styles.membersContent}
          showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#9B7BFF" />
              <Text style={styles.loadingText}>Loading members...</Text>
            </View>
          ) : members.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No members found</Text>
            </View>
          ) : (
            members.map(renderMember)
          )}
        </ScrollView>
      </View>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showModal}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        color={modalConfig.color}
        icon={modalConfig.icon}
        onConfirm={handleConfirm}
        onCancel={handleCloseModal}
      />
    </SafeAreaView>
  );
};

export default CrowdMembersScreen;

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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 16,
  },
  title: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '600',
    fontSize: 20,
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  memberCount: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 14,
    color: '#8B8CAD',
    paddingHorizontal: 20,
    marginTop: 8,
  },
  membersList: {
    flex: 1,
    marginTop: 40,
  },
  membersContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  memberTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141422',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 12,
    color: '#FFFFFF',
  },
  memberInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  memberName: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 16,
    color: '#FFFFFF',
    marginRight: 8,
  },
  creatorPill: {
    height: 18.98,
    borderRadius: 9.49,
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  creatorText: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 10,
    color: '#FFA500',
  },
  adminPill: {
    width: 49.68,
    height: 18.98,
    borderRadius: 9.49,
    backgroundColor: 'rgba(155, 123, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  adminText: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 10,
    color: '#B88DFF',
  },
  youPill: {
    height: 18.98,
    borderRadius: 9.49,
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  youText: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 10,
    color: '#4ADE80',
  },
  joinTime: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 12,
    color: '#8B8CAD',
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionIcon: {
    padding: 4,
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: FontFamily.robotoRegular,
    fontSize: 14,
    color: '#8B8CAD',
  },
});

