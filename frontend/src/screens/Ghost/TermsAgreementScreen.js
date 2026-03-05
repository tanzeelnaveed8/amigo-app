import React, { useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  Linking,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import BackArrow from '../../assets/svg/backArrow';
import { FontFamily } from '../../../GlobalStyles';
import FileTextIcon from '../../assets/svg/FileTextIcon';
import ShieldIcon from '../../assets/svg/ShieldIcon';
import AlertTriangleIcon from '../../assets/svg/AlertTriangleIcon';
import CheckIcon from '../../assets/svg/CheckIcon';
import CheckboxChecked from '../../assets/svg/CheckboxChecked';
import CheckboxUnchecked from '../../assets/svg/CheckboxUnchecked';
import { getGhostLogin, saveGhostLogin } from '../../utils/ghostStorage';
import { getGhostDeviceId } from '../../utils/ghostDeviceId';
import { getActiveCrowds, getCrowdInfo } from '../../apis/ghost';

const TermsAgreementScreen = ({ navigation, route }) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { ghostName, avatarBgColor } = route.params || {};

  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!termsAccepted || isLoading) return;

    setIsLoading(true);
    try {
      const ghostData = await getGhostLogin();

      if (ghostData.isLoggedIn && ghostData.ghostName && ghostData.avatarBgColor) {
        navigation.replace('GhostModeHomeScreen', {
          ghostName: ghostData.ghostName,
          avatarBgColor: ghostData.avatarBgColor,
        });
        return;
      }

      const deviceId = await getGhostDeviceId();

      try {
        const response = await getActiveCrowds(deviceId);

        if (response.status === 200 && response.data && response.data.length > 0) {
          const firstCrowd = response.data[0];
          try {
            const crowdInfoResponse = await getCrowdInfo(firstCrowd.crowdId, deviceId);
            if (crowdInfoResponse.status === 200 && crowdInfoResponse.data) {
              const currentMember = crowdInfoResponse.data.members?.find(
                m => m.deviceId === deviceId
              );

              if (currentMember && currentMember.ghostName && currentMember.avatarBgColor) {
                await saveGhostLogin(currentMember.ghostName, currentMember.avatarBgColor);
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
        }
      } catch (error) {
        console.error('Error checking active crowds:', error);
      }

      navigation.replace('ChooseGhostNameScreen');
    } catch (error) {
      console.error('Error in handleContinue:', error);
      navigation.replace('ChooseGhostNameScreen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const openEULA = () => {
    Linking.openURL('https://www.cryptogram.tech/eula').catch(err =>
      console.error('Failed to open EULA:', err)
    );
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://www.cryptogram.tech/privacy').catch(err =>
      console.error('Failed to open Privacy Policy:', err)
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Background gradient effect */}
        <View style={styles.backgroundGradient} />

        {/* Top Bar with Back Button */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <BackArrow />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconWrapper}>
                <LinearGradient
                  colors={['#9B7BFF', '#7B5BCF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconGradient}>
                  <FileTextIcon width={32} height={32} />
                </LinearGradient>
              </View>
              <Text style={styles.title}>Terms & Privacy</Text>
              <Text style={styles.subtitle}>
                Please review and accept our terms to continue
              </Text>
            </View>

            {/* Key Points Section */}
            <View style={styles.keyPointsContainer}>
              {/* Zero Tolerance Policy */}
              <View style={[styles.keyPointCard, styles.warningCard]}>
                <View style={styles.keyPointIconCircle}>
                  <ShieldIcon width={20} height={20} color="#FF6363" />
                </View>
                <View style={styles.keyPointContent}>
                  <Text style={styles.keyPointTitle}>Zero Tolerance Policy</Text>
                  <Text style={styles.keyPointDescription}>
                    We have <Text style={styles.highlightRed}>zero tolerance</Text> for
                    objectionable content, abusive behavior, harassment, hate speech, or
                    illegal activity. Violations result in{' '}
                    <Text style={styles.highlightRed}>immediate permanent bans</Text>.
                  </Text>
                </View>
              </View>

              {/* Anonymous & Temporary */}
              <View style={styles.keyPointCard}>
                <View style={styles.keyPointIconCircle}>
                  <AlertTriangleIcon width={20} height={20} color="#9B7BFF" />
                </View>
                <View style={styles.keyPointContent}>
                  <Text style={styles.keyPointTitle}>Anonymous & Temporary</Text>
                  <Text style={styles.keyPointDescription}>
                    Ghost Mode is completely anonymous and temporary.{' '}
                    <Text style={styles.highlightPurple}>
                      No personal information is collected
                    </Text>{' '}
                    and crowds are ephemeral chat spaces.
                  </Text>
                </View>
              </View>

              {/* Safety Features */}
              <View style={styles.keyPointCard}>
                <View style={[styles.keyPointIconCircle, {
                    backgroundColor: '#22c55e2a',
                }]}>
                  <CheckIcon width={20} height={20} color="#22C55E" />
                </View>
                <View style={styles.keyPointContent}>
                  <Text style={styles.keyPointTitle}>Safety & Moderation</Text>
                  <Text style={styles.keyPointDescription}>
                    User reporting tools, blocking features, and community moderation
                    keep Ghost Mode safe. Report any violations immediately.
                  </Text>
                </View>
              </View>
            </View>

            {/* Agreement Checkbox */}
            <View style={styles.agreementContainer}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setTermsAccepted(!termsAccepted)}
                activeOpacity={0.7}>
                <View style={styles.checkboxWrapper}>
                  {termsAccepted ? (
                    <CheckboxChecked width={20} height={20} />
                  ) : (
                    <CheckboxUnchecked width={20} height={20} />
                  )}
                </View>
                <Text style={styles.agreementText}>
                  I agree to the{' '}
                  <Text style={styles.link} onPress={openEULA}>
                    Terms of Service (EULA)
                  </Text>{' '}
                  and{' '}
                  <Text style={styles.link} onPress={openPrivacyPolicy}>
                    Privacy Policy
                  </Text>
                  , and understand the zero tolerance policy for objectionable content
                  and abusive behavior.
                </Text>
              </TouchableOpacity>
            </View>

            {/* Warning Message */}
            <View style={styles.warningMessage}>
              <Text style={styles.warningText}>
                <Text style={styles.warningImportant}>Important:</Text> By continuing,
                you acknowledge that any violation of our policies will result in
                permanent account termination without warning.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={!termsAccepted || isLoading}>
            <LinearGradient
              colors={
                termsAccepted && !isLoading
                  ? ['#9B7BFF', '#B88DFF']
                  : ['rgba(155, 123, 255, 0.3)', 'rgba(184, 141, 255, 0.3)']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.gradientButton}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text
                  style={[
                    styles.buttonText,
                    !termsAccepted && styles.buttonTextDisabled,
                  ]}>
                  Accept & Continue
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
          {!termsAccepted && (
            <Text style={styles.helperText}>
              Please accept both agreements to continue
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TermsAgreementScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050509',
  },
  container: {
    flex: 1,
    backgroundColor: '#050509',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#050509',
  },
  topBar: {
    paddingTop: Platform.OS === 'ios' ? 12 : 20,
    paddingHorizontal: 24,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconWrapper: {
    marginBottom: 16,
  },
  iconGradient: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9B7BFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 32,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: '#C5C6E3',
    textAlign: 'center',
  },
  keyPointsContainer: {
    marginBottom: 32,
  },
  keyPointCard: {
    backgroundColor: 'rgba(26, 26, 46, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(155, 123, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningCard: {
    backgroundColor: 'rgba(255, 99, 99, 0.15)',
    borderColor: 'rgba(255, 99, 99, 0.3)',
  },
  keyPointIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(155, 123, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  keyPointContent: {
    flex: 1,
  },
  keyPointTitle: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  keyPointDescription: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 18,
    color: '#C5C6E3',
  },
  highlightRed: {
    color: '#FF6363',
    fontWeight: '600',
  },
  highlightPurple: {
    color: '#9B7BFF',
    fontWeight: '600',
  },
  agreementContainer: {
    backgroundColor: '#141422',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxWrapper: {
    marginTop: 2,
    marginRight: 12,
  },
  agreementText: {
    flex: 1,
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 21,
    color: '#C5C6E3',
  },
  link: {
    color: '#9B7BFF',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  warningMessage: {
    backgroundColor: 'rgba(255, 99, 99, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 99, 99, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  warningText: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 18,
    color: '#C5C6E3',
    textAlign: 'center',
  },
  warningImportant: {
    color: '#FF6363',
    fontWeight: '600',
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 12,
  },
  gradientButton: {
    width: '100%',
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9B7BFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  buttonText: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 16,
    color: '#FFFFFF',
  },
  buttonTextDisabled: {
    opacity: 0.5,
  },
  helperText: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 18,
    color: '#8B8CAD',
    textAlign: 'center',
  },
});
