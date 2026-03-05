import React, {useState} from 'react';
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {FontFamily} from '../../../GlobalStyles';
import {getActiveCrowds, getCrowdInfo} from '../../apis/ghost';
import AnonymousPersonIcon from '../../assets/svg/AnonymousPersonIcon';
import ClockIcon from '../../assets/svg/ClockIcon';
import GhostIcon from '../../assets/svg/GhostIcon';
import InstantIcon from '../../assets/svg/InstantIcon';
import BackArrow from '../../assets/svg/backArrow';
import {getGhostDeviceId} from '../../utils/ghostDeviceId';
import {getGhostLogin, saveGhostLogin} from '../../utils/ghostStorage';

const WelcomeToGhostMode = ({navigation}) => {
  const [isChecking, setIsChecking] = useState(false);

  const handleContinue = async () => {
    setIsChecking(true);
    try {
      // First, check local storage for ghost login data
      const ghostData = await getGhostLogin();

      if (
        ghostData.isLoggedIn &&
        ghostData.ghostName &&
        ghostData.avatarBgColor
      ) {
        // User has local ghost account data, navigate to home
        navigation.replace('GhostModeHomeScreen', {
          ghostName: ghostData.ghostName,
          avatarBgColor: ghostData.avatarBgColor,
        });
        return;
      }

      // If no local data, check if deviceId has any active crowds (ghost account exists on backend)
      const deviceId = await getGhostDeviceId();
      const response = await getActiveCrowds(deviceId);

      if (
        response.status === 200 &&
        response.data &&
        response.data.length > 0
      ) {
        // Device has active crowds, meaning there's a ghost account on the backend
        // Fetch the ghost name and avatar from the first active crowd
        const firstCrowd = response.data[0];
        try {
          const crowdInfoResponse = await getCrowdInfo(
            firstCrowd.crowdId,
            deviceId,
          );
          if (crowdInfoResponse.status === 200 && crowdInfoResponse.data) {
            // Find the current user in the members list
            const currentMember = crowdInfoResponse.data.members?.find(
              m => m.deviceId === deviceId,
            );

            if (
              currentMember &&
              currentMember.ghostName &&
              currentMember.avatarBgColor
            ) {
              // Restore ghost identity from backend and save to local storage
              await saveGhostLogin(
                currentMember.ghostName,
                currentMember.avatarBgColor,
              );

              // Navigate to home screen with restored identity
              navigation.replace('GhostModeHomeScreen', {
                ghostName: currentMember.ghostName,
                avatarBgColor: currentMember.avatarBgColor,
              });
              return;
            }
          }
        } catch (error) {
          console.error('Error fetching crowd info:', error);
        }

        // If we couldn't fetch identity, navigate to home screen anyway
        // It will handle the missing identity
        navigation.replace('GhostModeHomeScreen');
      } else {
        // No ghost account exists (no local data and no active crowds), go to choose name screen
        navigation.replace('ChooseGhostNameScreen');
      }
    } catch (error) {
      console.error('Error checking ghost account:', error);
      // On error, default to choose name screen
      navigation.replace('ChooseGhostNameScreen');
    } finally {
      setIsChecking(false);
    }
  };

  const handleBack = () => {
    navigation.replace('ChooseModeScreen');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Back Arrow */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <BackArrow />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Ghost Icon */}
          <View style={styles.iconContainer}>
            <GhostIcon width={120} height={120} />
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Welcome to Ghost Mode</Text>
            <Text style={styles.emoji}>👻</Text>
          </View>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Join or create temporary crowds without login.
          </Text>

          {/* Feature List */}
          <View style={styles.featuresContainer}>
            {/* Feature 1: Fully Anonymous */}
            <View style={styles.featureItem}>
              <View style={styles.iconCircle}>
                <AnonymousPersonIcon />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Fully Anonymous</Text>
                <Text style={styles.featureDescription}>
                  No phone numbers, no emails. Just a ghost name.
                </Text>
              </View>
            </View>

            {/* Feature 2: Temporary Crowds */}
            <View style={styles.featureItem}>
              <View style={styles.iconCircle}>
                <ClockIcon />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Temporary Crowds</Text>
                <Text style={styles.featureDescription}>
                  Crowds expire automatically. No history saved.
                </Text>
              </View>
            </View>

            {/* Feature 3: Instant Access */}
            <View style={styles.featureItem}>
              <View style={styles.iconCircle}>
                <InstantIcon />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Instant Access</Text>
                <Text style={styles.featureDescription}>
                  Create or join crowds with a simple QR scan.
                </Text>
              </View>
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={handleContinue}
            disabled={isChecking}
            activeOpacity={0.8}>
            <LinearGradient
              colors={['#9B7BFF', '#B88DFF']}
              start={{x: 0, y: 0}}
              end={{x: 0, y: 1}}
              style={[
                styles.gradientButton,
                isChecking && styles.buttonDisabled,
              ]}>
              {isChecking ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Continue in Ghost Mode</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Disclaimer */}
          <Text style={styles.disclaimer}>
            By continuing, you agree that your identity remains anonymous and
            crowds are temporary.
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default WelcomeToGhostMode;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    zIndex: 10,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: 20,
    marginBottom: 32,
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: 0.2,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  emoji: {
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
    marginTop: 4,
    color: '#FFFFFF',
  },
  subtitle: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0.15,
    textAlign: 'center',
    color: '#C5C6E3',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 32,
    width: '100%',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(155, 123, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 24,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: '#C5C6E3',
    opacity: 0.8,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 16,
    alignItems: 'center',
  },
  gradientButton: {
    width: 363.78,
    maxWidth: '100%',
    height: 43.98,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9B7BFF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  buttonText: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  disclaimer: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 19.5,
    letterSpacing: 0.2,
    textAlign: 'center',
    color: '#8B8CAD',
    opacity: 0.7,
    paddingHorizontal: 20,
  },
});
