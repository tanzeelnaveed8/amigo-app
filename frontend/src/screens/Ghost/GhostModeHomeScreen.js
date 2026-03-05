import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Animated,
  BackHandler,
} from 'react-native';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import EnterIcon from '../../assets/svg/EnterIcon';
import AddIcon from '../../assets/svg/AddIcon';
import CameraIcon from '../../assets/svg/CameraIcon';
import UserGroupIcon from '../../assets/svg/UserGroupIcon';
import ClockIcon from '../../assets/svg/ClockIcon';
import GhostIcon from '../../assets/svg/GhostIcon';
import { FontFamily } from '../../../GlobalStyles';
import { getActiveCrowds, getCrowdInfo } from '../../apis/ghost';
import { getGhostDeviceId } from '../../utils/ghostDeviceId';
import { getGhostLogin, clearGhostLogin, saveGhostLogin } from '../../utils/ghostStorage';
import { onMemberRemoved, onCrowdDeleted, removeAllGhostListeners } from '../../utils/ghostSocket';
import ConfirmationModal from '../../component/Ghost/ConfirmationModal';
import Context from '../../context';
import { getCrowdDisplayName } from '../../utils/helper';
import SettingIcon from '../../assets/svg/SettingIcon';

// Generate initials from name (same logic as ChooseGhostNameScreen)
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

const GhostModeHomeScreen = ({ navigation }) => {
  const route = useRoute();
  const { ghostName: paramGhostName, avatarBgColor: paramAvatarBgColor } = route.params || {};
  const { setLoader, setToastMsg } = useContext(Context);
  
  const [ghostName, setGhostName] = useState(paramGhostName || null);
  const [avatarBgColor, setAvatarBgColor] = useState(paramAvatarBgColor || null);
  const [activeCrowds, setActiveCrowds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingGhostData, setIsLoadingGhostData] = useState(!paramGhostName);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Animated values for card interactions
  const createCardScale = useRef(new Animated.Value(1)).current;
  const createCardOverlay = useRef(new Animated.Value(0)).current;
  const joinCardScale = useRef(new Animated.Value(1)).current;
  const joinCardOverlay = useRef(new Animated.Value(0)).current;

  // Load ghost data from storage if not provided via params
  useEffect(() => {
    const loadGhostData = async () => {
      if (!paramGhostName) {
        try {
          const ghostData = await getGhostLogin();
          if (ghostData.isLoggedIn && ghostData.ghostName && ghostData.avatarBgColor) {
            setGhostName(ghostData.ghostName);
            setAvatarBgColor(ghostData.avatarBgColor);
          } else {
            // No local ghost data, but check if there are active crowds
            // If there are active crowds, try to restore identity from backend
            const deviceId = await getGhostDeviceId();
            const crowdsResponse = await getActiveCrowds(deviceId);
            
            if (crowdsResponse.status === 200 && crowdsResponse.data && crowdsResponse.data.length > 0) {
              // User has active crowds - try to restore identity from backend
              const firstCrowd = crowdsResponse.data[0];
              try {
                const crowdInfoResponse = await getCrowdInfo(firstCrowd.crowdId, deviceId);
                if (crowdInfoResponse.status === 200 && crowdInfoResponse.data) {
                  // Find the current user in the members list
                  const currentMember = crowdInfoResponse.data.members?.find(
                    m => m.deviceId === deviceId
                  );
                  
                  if (currentMember && currentMember.ghostName && currentMember.avatarBgColor) {
                    // Restore ghost identity from backend and save to local storage
                    await saveGhostLogin(currentMember.ghostName, currentMember.avatarBgColor);
                    
                    // Set the state with restored identity
                    setGhostName(currentMember.ghostName);
                    setAvatarBgColor(currentMember.avatarBgColor);
                    setIsLoadingGhostData(false);
                    return;
                  }
                }
              } catch (error) {
                console.error('Error fetching crowd info:', error);
              }
              
              // If we couldn't restore identity, redirect to choose name
              navigation.replace('ChooseGhostNameScreen');
            } else {
              // No active crowds and no identity - redirect to welcome
              navigation.replace('WelcomeToGhostMode');
            }
          }
        } catch (error) {
          console.error('Error loading ghost data:', error);
          navigation.replace('WelcomeToGhostMode');
        } finally {
          setIsLoadingGhostData(false);
        }
      } else {
        setIsLoadingGhostData(false);
      }
    };

    loadGhostData();
  }, [paramGhostName, navigation]);

  const initials = getInitials(ghostName || '');
  const displayName = ghostName || 'Ghost';
  const avatarColor = avatarBgColor || '#155DFC';

  // Load active crowds
  const loadActiveCrowds = async () => {
    try {
      const deviceId = await getGhostDeviceId();
      const response = await getActiveCrowds(deviceId);
      
      if (response.status === 200 && response.data) {
        setActiveCrowds(response.data);
      }
    } catch (error) {
      console.error('Error loading active crowds:', error);
      setToastMsg('Failed to load active crowds');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadActiveCrowds();
  }, []);

  // Listen for socket events to update active crowds in real-time
  useEffect(() => {
    let deviceId = null;
    
    // Get deviceId once
    getGhostDeviceId().then(id => {
      deviceId = id;
    });

    // Listen for member removed event
    const handleMemberRemoved = async (data) => {
      if (!deviceId) {
        deviceId = await getGhostDeviceId();
      }
      // If current user was removed from a crowd, refresh the list
      if (data.deviceId === deviceId && data.crowdId) {
        // Remove the crowd from the list immediately (compare as strings to handle ObjectId/string differences)
        setActiveCrowds(prev => prev.filter(crowd => String(crowd.crowdId) !== String(data.crowdId)));
        // Also refresh from API to ensure accuracy
        loadActiveCrowds();
      }
    };

    // Listen for crowd deleted event
    const handleCrowdDeleted = (data) => {
      if (data.crowdId) {
        // Remove the deleted crowd from the list (compare as strings to handle ObjectId/string differences)
        setActiveCrowds(prev => prev.filter(crowd => String(crowd.crowdId) !== String(data.crowdId)));
        // Also refresh from API to ensure accuracy
        loadActiveCrowds();
      }
    };

    // Set up listeners
    onMemberRemoved(handleMemberRemoved);
    onCrowdDeleted(handleCrowdDeleted);

    // Cleanup listeners on unmount
    return () => {
      // Note: We don't remove all listeners here as other screens might need them
      // The socket utility should handle cleanup properly
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadActiveCrowds();
  };

  const handleExit = () => {
    // Show confirmation modal
    setShowLogoutModal(true);
  };

  // Handle Android back button - prevent going back to deleted screens
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Check navigation state
        const state = navigation.getState();
        const routes = state?.routes || [];
        const currentRoute = routes[state?.index];
        
        // If we're on GhostModeHomeScreen and there are other routes in the stack,
        // reset the stack to prevent going back to potentially deleted screens
        if (currentRoute?.name === 'GhostModeHomeScreen' && routes.length > 1) {
          // Reset navigation stack to only have GhostModeHomeScreen
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'GhostModeHomeScreen',
                params: {
                  ghostName: ghostName,
                  avatarBgColor: avatarBgColor,
                },
              },
            ],
          });
          return true; // Prevent default back behavior
        }
        
        // If this is the only screen, allow default behavior (exit app or go to previous screen)
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [navigation, ghostName, avatarBgColor])
  );

  const handleConfirmLogout = async () => {
    // Close modal
    setShowLogoutModal(false);
    
    // Clear ghost login data
    await clearGhostLogin();
    
    // Navigate back to welcome screen
    navigation.replace('WelcomeToGhostMode');
  };

  const handleCancelLogout = () => {
    // Close modal
    setShowLogoutModal(false);
  };

  // Animation handlers for Create Crowd card
  const handleCreateCardPressIn = () => {
    Animated.parallel([
      Animated.spring(createCardScale, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 300,
        friction: 20,
      }),
      Animated.timing(createCardOverlay, {
        toValue: 0.1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCreateCardPressOut = () => {
    Animated.parallel([
      Animated.spring(createCardScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 20,
      }),
      Animated.timing(createCardOverlay, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const resetCreateCardAnimation = () => {
    Animated.parallel([
      Animated.timing(createCardScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(createCardOverlay, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Animation handlers for Join Crowd card
  const handleJoinCardPressIn = () => {
    Animated.parallel([
      Animated.spring(joinCardScale, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 300,
        friction: 20,
      }),
      Animated.timing(joinCardOverlay, {
        toValue: 0.3,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleJoinCardPressOut = () => {
    Animated.parallel([
      Animated.spring(joinCardScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 20,
      }),
      Animated.timing(joinCardOverlay, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const resetJoinCardAnimation = () => {
    Animated.parallel([
      Animated.timing(joinCardScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(joinCardOverlay, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCreateCrowd = () => {
    resetCreateCardAnimation();
    navigation.navigate('CreateCrowdScreen', {
      ghostName: displayName,
      avatarBgColor: avatarColor,
    });
  };

  const handleJoinCrowd = () => {
    resetJoinCardAnimation();
    navigation.navigate('QRScannerScreen', {
      ghostName: displayName,
      avatarBgColor: avatarColor,
    });
  };

  // Refresh crowds when screen comes into focus (e.g., when navigating back from chat)
  useFocusEffect(
    React.useCallback(() => {
      // Refresh active crowds when screen comes into focus
      loadActiveCrowds();
      // Reset card animations when screen comes into focus
      resetCreateCardAnimation();
      resetJoinCardAnimation();
    }, [])
  );

  const handleCrowdPress = (crowd) => {
    // Navigate to chat screen - need to get full crowd info first
    navigation.navigate('CrowdChatScreen', {
      crowdId: crowd.crowdId,
      crowdName: crowd.crowdName,
      ghostName: displayName,
      avatarBgColor: avatarColor,
      isCreator: false, // Will be updated when we get crowd info
      duration: crowd.duration,
    });
  };

  // Show loading while checking ghost login
  if (isLoadingGhostData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9B7BFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Icons */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('GhostSettingsScreen')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <SettingIcon width={24} height={24} strokeColor="#8B8CAD" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleExit}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <EnterIcon width={24} height={24} strokeColor="#8B8CAD" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#9B7BFF"
            />
          }>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={[styles.avatarCircle, { backgroundColor: avatarColor }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>

          {/* Welcome Message */}
          <Text style={styles.welcomeText}>
            Welcome, {displayName} 👻
          </Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Create or join a temporary crowd to start chatting.
          </Text>

          {/* Create Crowd Card */}
          <TouchableOpacity
            onPress={handleCreateCrowd}
            onPressIn={handleCreateCardPressIn}
            onPressOut={handleCreateCardPressOut}
            activeOpacity={1}>
            <Animated.View
              style={[
                styles.card,
                {
                  transform: [{ scale: createCardScale }],
                },
              ]}>
              <View style={styles.cardContent}>
                <View style={styles.iconTitleRow}>
                  <View style={styles.iconBox}>
                    <AddIcon width={28} height={28} />
                  </View>
                  <Text style={styles.cardTitle}>Create Crowd</Text>
                </View>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardDescription}>
                    Start a new temporary crowd and invite others
                  </Text>
                </View>
              </View>
              <Animated.View
                style={[
                  styles.cardOverlay,
                  {
                    opacity: createCardOverlay,
                  },
                ]}
                pointerEvents="none"
              />
            </Animated.View>
          </TouchableOpacity>

          {/* Join Crowd Card */}
          <TouchableOpacity
            onPress={handleJoinCrowd}
            onPressIn={handleJoinCardPressIn}
            onPressOut={handleJoinCardPressOut}
            activeOpacity={1}>
            <Animated.View
              style={[
                styles.card,
                {
                  transform: [{ scale: joinCardScale }],
                },
              ]}>
              <View style={styles.cardContent}>
                <View style={styles.iconTitleRow}>
                  <View style={styles.iconBox}>
                    <CameraIcon width={28} height={28} />
                  </View>
                  <Text style={styles.cardTitle}>Join Crowd</Text>
                </View>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardDescription}>
                    Scan a QR code to join an existing crowd
                  </Text>
                </View>
              </View>
              <Animated.View
                style={[
                  styles.cardOverlay,
                  {
                    opacity: joinCardOverlay,
                  },
                ]}
                pointerEvents="none"
              />
            </Animated.View>
          </TouchableOpacity>

          {/* Active Crowds Section */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#9B7BFF" />
              <Text style={styles.loadingText}>Loading crowds...</Text>
            </View>
          ) : activeCrowds.length > 0 ? (
            <View style={styles.activeCrowdsSection}>
              <Text style={styles.sectionTitle}>ACTIVE CROWDS</Text>
              {activeCrowds.map((crowd) => (
                <TouchableOpacity
                  key={crowd.crowdId}
                  style={styles.crowdTile}
                  onPress={() => handleCrowdPress(crowd)}
                  activeOpacity={0.7}>
                  <View style={styles.crowdInfo}>
                    <Text style={styles.crowdName}>{getCrowdDisplayName(crowd.crowdName)}</Text>
                    <View style={styles.crowdMeta}>
                      <View style={styles.metaItem}>
                        <UserGroupIcon width={16} height={16} />
                        <Text style={styles.metaText}>{crowd.memberCount}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <ClockIcon width={16} height={16} strokeColor="#8B8CAD" />
                        <Text style={styles.metaText}>
                          {crowd.expiresIn === 0 ? 'Expired' : `${crowd.expiresIn} day${crowd.expiresIn !== 1 ? 's' : ''}`}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.durationPill}>
                    <Text style={styles.durationText}>
                      {crowd.expiresIn === 0 ? 'Expired' : `in ${crowd.expiresIn} day${crowd.expiresIn !== 1 ? 's' : ''}`}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No active crowds</Text>
              <Text style={styles.emptySubtext}>Create or join a crowd to get started</Text>
            </View>
          )}
        </ScrollView>

        {/* Footer Disclaimer */}
        <View style={styles.footer}>
          <Text style={styles.disclaimer}>
            Remember: Crowds are temporary and fully anonymous.
          </Text>
        </View>
      </View>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        visible={showLogoutModal}
        title="Are you sure you want to log out from Ghost Mode?"
        message="Your ghost identity will be lost if there is no active crowd."
        confirmText="Logout"
        cancelText="Cancel"
        icon={GhostIcon}
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
        color="#9B7BFF"
        showConfirmButton={true}
      />
    </SafeAreaView>
  );
};

export default GhostModeHomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  iconButton: {
    padding: 4,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 100,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#155DFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 32,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  welcomeText: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: '#C5C6E3',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  card: {
    width: 365,
    maxWidth: '100%',
    height: 140,
    borderRadius: 16,
    backgroundColor: '#141422',
    paddingTop: 22.84,
    paddingBottom: 22.84,
    paddingLeft: 19.98,
    paddingRight: 19.98,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardContent: {
    height: '100%',
    justifyContent: 'space-between',
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#141422',
    borderRadius: 16,
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(155, 123, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardTextContainer: {
    marginTop: 8,
  },
  cardTitle: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 24,
    color: '#FFFFFF',
  },
  cardDescription: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: '#C5C6E3',
  },
  activeCrowdsSection: {
    width: 365,
    maxWidth: '100%',
    marginTop: 32,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 16,
    color: '#8B8CAD',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  crowdTile: {
    width: 365,
    maxWidth: '100%',
    height: 66.28,
    borderRadius: 12,
    backgroundColor: '#141422',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  crowdInfo: {
    flex: 1,
  },
  crowdName: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 22,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  crowdMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    color: '#8B8CAD',
    marginLeft: 6,
  },
  durationPill: {
    minWidth: 56.08,
    height: 22.98,
    borderRadius: 11.49,
    backgroundColor: '#25263A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  durationText: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 10,
    lineHeight: 14,
    color: '#C5C6E3',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    paddingTop: 16,
    paddingHorizontal: 20,
    backgroundColor: '#000000',
    alignItems: 'center',
  },
  disclaimer: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    color: '#5E607E',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: FontFamily.robotoRegular,
    fontSize: 14,
    color: '#8B8CAD',
    marginTop: 12,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: FontFamily.robotoRegular,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontFamily: FontFamily.robotoRegular,
    fontSize: 14,
    color: '#8B8CAD',
  },
});

