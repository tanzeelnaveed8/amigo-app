import React, { useState, useMemo, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import {LinearGradient} from 'expo-linear-gradient';
import BackButtonIcon from '../../assets/svg/BackButtonIcon';
import InfoIcon from '../../assets/svg/InfoIcon';
import RightArrowIcon from '../../assets/svg/RightArrowIcon';
import { FontFamily } from '../../../GlobalStyles';
import { createCrowd, getDailyCrowdCount } from '../../apis/ghost';
import { getGhostDeviceId } from '../../utils/ghostDeviceId';
import Context from '../../context';

const DURATION_OPTIONS = [1, 3, 7, 15, 31];

// Format date for display
const formatExpiryDate = (days) => {
  const now = new Date();
  const expiryDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const month = months[expiryDate.getMonth()];
  const day = expiryDate.getDate();
  const year = expiryDate.getFullYear();
  
  let hours = expiryDate.getHours();
  const minutes = expiryDate.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
  
  return `${month} ${day}, ${year} at ${hours}:${minutesStr} ${ampm}`;
};

const CreateCrowdScreen = ({ navigation }) => {
  const route = useRoute();
  const { ghostName, avatarBgColor } = route.params || {};
  const { setLoader, setToastMsg } = useContext(Context);
  const [crowdName, setCrowdName] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(31);
  const [isCreating, setIsCreating] = useState(false);
  const [dailyCrowdCount, setDailyCrowdCount] = useState(0);
  const [isCheckingLimit, setIsCheckingLimit] = useState(true);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);

  const isValid = useMemo(() => {
    const trimmed = crowdName.trim();
    // Check alphanumeric, spaces, hyphens, and underscores
    const validFormat = /^[a-zA-Z0-9\s\-_]+$/.test(trimmed);
    return trimmed.length >= 2 && trimmed.length <= 50 && validFormat;
  }, [crowdName]);

  const expiryText = useMemo(() => {
    return `Crowd will expire on ${formatExpiryDate(selectedDuration)}`;
  }, [selectedDuration]);

  // Check daily crowd creation limit on mount
  useEffect(() => {
    const checkDailyLimit = async () => {
      try {
        const deviceId = await getGhostDeviceId();
        const response = await getDailyCrowdCount(deviceId);
        
        if (response.status === 200 && response.data) {
          const count = response.data.count || 0;
          setDailyCrowdCount(count);
          setHasReachedLimit(count >= 3);
        }
      } catch (error) {
        console.error('Error checking daily crowd limit:', error);
        // Don't block creation if check fails
      } finally {
        setIsCheckingLimit(false);
      }
    };

    checkDailyLimit();
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCreate = async () => {
    if (!isValid || isCreating || hasReachedLimit) return;

    setIsCreating(true);
    setLoader(true);

    try {
      // Get device ID
      const deviceId = await getGhostDeviceId();

      // Preserve original crowd name for display (with spaces)
      const originalCrowdName = crowdName.trim();
      
      // Create crowd via API (convert spaces to hyphens for URL/backend)
      const response = await createCrowd({
        crowdName: originalCrowdName.toLowerCase().replace(/\s+/g, '-'),
        duration: selectedDuration,
        deviceId,
        ghostName,
        avatarBgColor,
      });

      if (response.status === 201 && response.data) {
        setLoader(false);
        setIsCreating(false);
        
        // Update daily count after successful creation
        setDailyCrowdCount(prev => {
          const newCount = prev + 1;
          setHasReachedLimit(newCount >= 3);
          return newCount;
        });
        
        // Navigate to success screen with crowd data
        // Use original crowd name (with spaces) for display instead of backend response
        navigation.navigate('CrowdCreatedScreen', {
          crowdId: response.data.crowdId,
          crowdName: originalCrowdName,
          duration: response.data.duration,
          qrCodeData: response.data.qrCodeData,
          expiresAt: response.data.expiresAt,
          ghostName: ghostName,
          avatarBgColor: avatarBgColor,
        });
      } else {
        throw new Error(response.message || 'Failed to create crowd');
      }
    } catch (error) {
      setLoader(false);
      setIsCreating(false);
      console.error('Error creating crowd:', error);
      
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create crowd. Please try again.';
      setToastMsg(errorMessage);
      
      Alert.alert(
        'Error',
        errorMessage,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <BackButtonIcon />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Create Crowd</Text>
          <View style={styles.topBarSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          
          {/* Crowd Name Section */}
          <View style={styles.section}>
            <Text style={styles.label}>Crowd Name</Text>
            <TextInput
              style={[styles.input, hasReachedLimit && styles.inputDisabled]}
              placeholder="Enter crowd name"
              placeholderTextColor="#5E607E"
              value={crowdName}
              onChangeText={(text) => {
                setCrowdName(text);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={50}
              editable={!hasReachedLimit}
            />
            {crowdName.length !== 0 && crowdName.length < 2 && !isValid && (
              <Text style={styles.errorText}>
                Crowd name is too short.
              </Text>
            )}
            {crowdName.length > 2 && !isValid && (
              <Text style={styles.errorText}>
                Use only letters, numbers, spaces, - or _.
              </Text>
            )}
            <Text style={styles.helperText}>
            This name will be visible to all crowd members.
            </Text>
          </View>

          {/* Duration Section */}
          <View style={styles.section}>
            <Text style={styles.label}>Duration</Text>
            <View style={styles.durationContainer}>
              {DURATION_OPTIONS.map((days) => (
                <TouchableOpacity
                  key={days}
                  style={[
                    styles.durationOption,
                    selectedDuration === days && styles.durationOptionSelected,
                    hasReachedLimit && styles.durationOptionDisabled,
                  ]}
                  onPress={() => !hasReachedLimit && setSelectedDuration(days)}
                  activeOpacity={0.7}
                  disabled={hasReachedLimit}>
                  <Text
                    style={[
                      styles.durationText,
                      selectedDuration === days && styles.durationTextSelected,
                      hasReachedLimit && styles.durationTextDisabled,
                    ]}>
                    {days} {days === 1 ? 'day' : 'days'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.expiryText}>{expiryText}</Text>
          </View>

          {/* About Crowds Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <InfoIcon width={16} height={16} />
              <Text style={styles.infoCardTitle}>About Crowds</Text>
            </View>
            <View style={styles.bulletPoints}>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>
                  Crowds are temporary and expire after the selected duration
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>
                  Share the QR code to invite members
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>
                  Only the creator can delete the crowd before expiry
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>
                  All data is deleted after expiry
                </Text>
              </View>
            </View>
          </View>

          {/* Create Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.buttonTouchable}
              onPress={handleCreate}
              disabled={!isValid || isCreating || hasReachedLimit}
              activeOpacity={0.8}>
              <LinearGradient
                colors={['#9B7BFF', '#B88DFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={[styles.gradientButton, (!isValid || isCreating || hasReachedLimit) && styles.disabledGradientButton]}>
                {isCreating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Create & Generate QR</Text>
                    <RightArrowIcon width={20} height={20} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
            {hasReachedLimit && (
              <Text style={styles.limitErrorText}>
                Daily crowd creation limit reached. You can create up to 3 crowds per day.
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default CreateCrowdScreen;

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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 4,
  },
  topBarTitle: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 18,
    color: '#FFFFFF',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  topBarSpacer: {
    width: 36, // Same width as back button to center title
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 14,
    color: '#8B8CAD',
    marginBottom: 12,
  },
  input: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    backgroundColor: '#181830',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 20,
    fontFamily: FontFamily.robotoRegular,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  helperText: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 12,
    color: '#5E607E',
    marginTop: 4,
  },
  errorText: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 12,
    color: '#FF6363',
    marginTop: 4,
  },
  durationContainer: {
    flexDirection: 'row',
    backgroundColor: '#0E0E18',
    borderRadius: 12,
    padding: 4,
    height: 40,
    alignItems: 'center',
    marginBottom: 16,
  },
  durationOption: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  durationOptionSelected: {
    backgroundColor: '#25263A',
  },
  durationText: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 12,
    color: '#C5C6E3',
  },
  durationTextSelected: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  expiryText: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 12,
    color: '#8B8CAD',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#141422',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoCardTitle: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  bulletPoints: {
    gap: 12,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    fontFamily: FontFamily.robotoRegular,
    fontSize: 14,
    color: '#C5C6E3',
    marginRight: 8,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: '#C5C6E3',
  },
  buttonContainer: {
    marginTop: 32,
    width: '100%',
  },
  buttonTouchable: {
    width: '100%',
  },
  gradientButton: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#9B7BFF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  disabledGradientButton: {
    opacity: 0.5,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  buttonText: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  inputDisabled: {
    opacity: 0.5,
    backgroundColor: '#0F0F1A',
  },
  durationOptionDisabled: {
    opacity: 0.5,
  },
  durationTextDisabled: {
    opacity: 0.5,
  },
  limitErrorText: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 14,
    color: '#FB2C36',
    textAlign: 'center',
    marginTop: 12,
  },
});

