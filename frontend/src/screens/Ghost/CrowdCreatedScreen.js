import React, { useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import {LinearGradient} from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import RNFS from '../../utils/fsCompat';
import * as MediaLibrary from 'expo-media-library';
import ViewShot from 'react-native-view-shot';
import CloseIcon from '../../assets/svg/CloseIcon';
import TickIcon from '../../assets/svg/TickIcon';
import ClockIcon from '../../assets/svg/ClockIcon';
import ChatCloudIcon from '../../assets/svg/ChatCloudIcon';
import SaveIcon from '../../assets/svg/SaveIcon';
import WhiteGhostIcon from '../../assets/svg/WhiteGhostIcon';
import { FontFamily } from '../../../GlobalStyles';
import QRCodeLogo from '../../assets/svg/QRCodeLogo';
import QRCodeIcon from '../../assets/qricon1.png';
import { getCrowdDisplayName } from '../../utils/helper';

const CrowdCreatedScreen = ({ navigation }) => {
  const route = useRoute();
  const { crowdId, crowdName, duration, qrCodeData, ghostName, avatarBgColor, expiresAt } = route.params || {};
  const qrCodeRef = useRef(null);
  const viewShotRef = useRef(null);
  
  // Resolve the logo asset properly for react-native-qrcode-svg
  const logoSource = QRCodeIcon;

  // Calculate days remaining from expiresAt timestamp
  const daysRemaining = useMemo(() => {
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

  // Generate QR code data - use provided data or generate a link
  const qrValue = useMemo(() => {
    if (qrCodeData) {
      return qrCodeData;
    }
    // Generate a placeholder link - replace with actual crowd ID when API is integrated
    return `amigo://crowd/join/${crowdName || 'test'}`;
  }, [qrCodeData, crowdName]);

  const handleClose = () => {
    navigation.replace('GhostModeHomeScreen', {
      ghostName: ghostName,
      avatarBgColor: avatarBgColor,
    });
  };

  const handleOpenChat = () => {
    if (!crowdId) {
      console.error('Crowd ID is missing');
      return;
    }
    
    navigation.navigate('CrowdChatScreen', {
      crowdId: crowdId, // Pass crowdId - this is required!
      crowdName: crowdName,
      ghostName: ghostName,
      avatarBgColor: avatarBgColor,
      isCreator: true, // User created the crowd, so they are the creator/admin
      duration: daysRemaining, // Pass duration to CrowdChatScreen
      qrCodeData: qrValue, // Pass QR code data as well
      expiresAt: expiresAt, // Pass expiry date
    });
  };

  const handleShareQR = async () => {
    try {
      if (!viewShotRef.current) {
        Alert.alert('Error', 'QR code not ready. Please try again.');
        return;
      }

      // Capture the entire styled container as an image
      const uri = await viewShotRef.current.capture();
      
      // Save to gallery using CameraRoll
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant media library permission to save images.');
        return;
      }
      await MediaLibrary.saveToLibraryAsync(uri);
      
      Alert.alert('Success', 'QR code image saved to gallery!');
    } catch (error) {
      console.error('Error saving QR code:', error);
      Alert.alert(
        'Error',
        'Failed to save QR code image. Please try again.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <CloseIcon />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          
          {/* Success Icon */}
          <View style={styles.successIconContainer}>
            <View style={styles.successIconCircle}>
              <TickIcon width={28} height={28} />
            </View>
          </View>

          {/* Crowd Created Text */}
          <Text style={styles.crowdCreatedText}>Crowd Created!</Text>

          {/* Crowd Name */}
          <Text style={styles.crowdName}>{getCrowdDisplayName(crowdName) || 'Test Crowd 1'}</Text>

          {/* QR Code Container */}
          <View style={styles.qrContainerWrapper}>
            <View style={styles.qrContainer}>
              <View style={styles.qrCodeWrapper}>
                <View style={styles.qrCodeContainer}>
                  <QRCode
                    getRef={(ref) => (qrCodeRef.current = ref)}
                    value={qrValue}
                    size={231.98}
                    color="#9B7BFF"
                    backgroundColor="#0A0A14"
                    logoSize={0}
                    logoMargin={0}
                    logoBackgroundColor="transparent"
                  />
                  {/* Ghost Logo Overlay */}
                  <View style={styles.ghostLogoOverlay}>
                    <View style={styles.ghostLogoBackground}>
                    <QRCodeLogo width={70} height={70} />
                    </View>
                  </View>
                </View>
              </View>
              <Text style={styles.scanToJoinText}>Scan to Join</Text>
            </View>
          </View>

          {/* Expiry Pill */}
          <View style={styles.expiryPill}>
            <ClockIcon width={16} height={16} strokeColor="#FFFFFF" />
            <Text style={styles.expiryText}>
              Expires in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
            </Text>
          </View>

          {/* Open Crowd Chat Button */}
          <TouchableOpacity
            style={styles.chatButtonContainer}
            onPress={handleOpenChat}
            activeOpacity={0.8}>
            <LinearGradient
              colors={['#9B7BFF', '#B88DFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.gradientButton}>
              <Text style={styles.buttonText}>Open Crowd Chat</Text>
              <ChatCloudIcon width={20} height={20} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Share QR Code Button */}
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShareQR}
            activeOpacity={0.8}>
            <SaveIcon width={20} height={20} />
            <Text style={styles.shareButtonText}>Save QR Image</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Hidden Styled QR Code Card Container for Download */}
        <ViewShot
          ref={viewShotRef}
          options={{ format: 'png', quality: 1.0 }}
          style={styles.hiddenViewShotContainer}>
          <View style={styles.styledQRCard}>
            {/* AMIGO Text */}
            <Text style={styles.amigoText}>AMIGO</Text>
            
            {/* Crowd Name */}
            <Text style={styles.styledCrowdName}>{getCrowdDisplayName(crowdName) || 'Test Crowd 1'}</Text>
            
            {/* Scan Instruction */}
            <Text style={styles.scanInstructionText}>SCAN TO JOIN THE CROWD</Text>
            
            {/* QR Code with Corner Brackets */}
            <View style={styles.qrCodeWithBrackets}>
              {/* Corner Brackets */}
              {/* Top Left */}
              <View style={[styles.cornerBracket, styles.topLeftBracket]} />
              {/* Top Right */}
              <View style={[styles.cornerBracket, styles.topRightBracket]} />
              {/* Bottom Left */}
              <View style={[styles.cornerBracket, styles.bottomLeftBracket]} />
              {/* Bottom Right */}
              <View style={[styles.cornerBracket, styles.bottomRightBracket]} />
              
              {/* QR Code */}
              <QRCode
                value={qrValue}
                size={231.98}
                color="#9B7BFF"
                backgroundColor="#0A0A14"
                logo={logoSource}
                logoSize={60}
                logoMargin={4}
                logoBackgroundColor="#0A0A14"
                logoBorderRadius={30}
                quietZone={20}
                ecl="H"
              />
            </View>
          </View>
        </ViewShot>
      </View>
    </SafeAreaView>
  );
};

export default CrowdCreatedScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    zIndex: 10,
    padding: 4,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(155, 123, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crowdCreatedText: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 42,
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  crowdName: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
    color: '#C5C6E3',
    marginBottom: 32,
  },
  qrContainerWrapper: {
    width: 364.38,
    maxWidth: '100%',
    marginBottom: 24,
  },
  qrContainer: {
    width: '100%',
    height: 353.29,
    backgroundColor: '#141422',
    borderRadius: 32,
    paddingTop: 45,
    paddingBottom: 35.99,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9B7BFF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 16,
    // Add border for uniform glow effect on all sides
    borderWidth: 2,
    borderColor: 'rgba(155, 123, 255, 0.2)',
  },
  qrCodeWrapper: {
    backgroundColor: '#0A0A14',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  qrCodeContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 231.98,
    height: 231.98,
  },
  ghostLogoOverlay: {
    position: 'absolute',
    top: 95.99,
    left: 82.99,
    zIndex: 10,
  },
  ghostLogoBackground: {
    // width: 56,
    // height: 56,
    // borderRadius: 28,
    // backgroundColor: '#0A0A14',
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  scanToJoinText: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  expiryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25263A',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 24,
  },
  expiryText: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  chatButtonContainer: {
    width: '100%',
    maxWidth: 365,
    marginBottom: 16,
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
  buttonText: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  shareButton: {
    width: '100%',
    maxWidth: 365,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#181830',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  shareButtonText: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  hiddenViewShotContainer: {
    position: 'absolute',
    left: -10000,
    top: -10000,
    width: 364.38,
    opacity: 0,
  },
  styledQRCard: {
    width: 364.38,
    maxWidth: '100%',
    backgroundColor: '#141422',
    borderRadius: 32,
    paddingTop: 45,
    paddingBottom: 35.99,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#9B7BFF',
    shadowColor: '#9B7BFF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
  },
  amigoText: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 20,
    color: '#9B7BFF',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  styledCrowdName: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 36,
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  scanInstructionText: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: '#C5C6E3',
    marginBottom: 32,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  qrCodeWithBrackets: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 231.98,
    height: 231.98,
  },
  cornerBracket: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#9B7BFF',
    borderWidth: 3,
    zIndex: 2,
  },
  topLeftBracket: {
    top: -8,
    left: -8,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 4,
  },
  topRightBracket: {
    top: -8,
    right: -8,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 4,
  },
  bottomLeftBracket: {
    bottom: -8,
    left: -8,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 4,
  },
  bottomRightBracket: {
    bottom: -8,
    right: -8,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 4,
  },
});

