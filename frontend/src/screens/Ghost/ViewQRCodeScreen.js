import React, { useMemo, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import { useRoute } from '@react-navigation/native';
import {LinearGradient} from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import RNFS from '../../utils/fsCompat';
import * as MediaLibrary from 'expo-media-library';
import ViewShot from 'react-native-view-shot';
import BackArrow from '../../assets/svg/backArrow';
import ClockIcon from '../../assets/svg/ClockIcon';
import InfoIcon from '../../assets/svg/InfoIcon';
import ShareIcon from '../../assets/svg/ShareIcon';
import SaveIcon from '../../assets/svg/SaveIcon';
import WhiteGhostIcon from '../../assets/svg/WhiteGhostIcon';
import { FontFamily } from '../../../GlobalStyles';
import QRCodeLogo from '../../assets/svg/QRCodeLogo';
import QRCodeIcon from '../../assets/qricon1.png';
import { getCrowdDisplayName } from '../../utils/helper';
import { getCrowdInfo } from '../../apis/ghost';
import { getGhostDeviceId } from '../../utils/ghostDeviceId';

const ViewQRCodeScreen = ({ navigation }) => {
  const route = useRoute();
  const { crowdId, crowdName, duration, qrCodeData, ghostName, avatarBgColor, isCreator, expiresAt: routeExpiresAt } = route.params || {};
  const qrCodeRef = useRef(null);
  const viewShotRef = useRef(null);
  const [expiresAt, setExpiresAt] = useState(routeExpiresAt || null);
  const [isViewShotReady, setIsViewShotReady] = useState(false);
  const [qrCodeBase64, setQrCodeBase64] = useState(null);
  const [qrCodeImageUri, setQrCodeImageUri] = useState(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isViewShotLaidOut, setIsViewShotLaidOut] = useState(false);
  const [useQRCodeComponent, setUseQRCodeComponent] = useState(false); // Fallback flag
  
  // Resolve the logo asset properly for react-native-qrcode-svg
  // Try using require directly as it's more reliable for react-native-qrcode-svg
  const logoSource = QRCodeIcon;
  
  // Fetch expiresAt if not provided in route params
  useEffect(() => {
    const fetchExpiresAt = async () => {
      if (!expiresAt && crowdId) {
        try {
          const deviceId = await getGhostDeviceId();
          const crowdInfoResponse = await getCrowdInfo(crowdId, deviceId);
          if (crowdInfoResponse.status === 200 && crowdInfoResponse.data?.expiresAt) {
            setExpiresAt(crowdInfoResponse.data.expiresAt);
          }
        } catch (error) {
          console.error('Error fetching crowd info for expiresAt:', error);
        }
      }
    };
    
    fetchExpiresAt();
  }, [crowdId, expiresAt]);
  
  // Convert QR code to base64 image for iOS compatibility
  useEffect(() => {
    // Only convert to base64 on iOS where ViewShot has issues with SVG
    if (Platform.OS === 'ios' && qrCodeRef.current && qrValue) {
      // Reset image loaded state when base64 changes
      setIsImageLoaded(false);
      
      // Wait for QR code to render, then convert to base64
      const timer = setTimeout(async () => {
        try {
          if (qrCodeRef.current && qrCodeRef.current.toDataURL) {
            qrCodeRef.current.toDataURL(async (dataURL) => {
              if (dataURL) {
                setQrCodeBase64(dataURL);
                console.log('QR code converted to base64 successfully');
                
                // Use base64 data URI directly - Image component handles this better on iOS
                // Also save to file as backup for sharing
                setQrCodeBase64(dataURL);
                setQrCodeImageUri(dataURL); // Use data URI directly
                console.log('QR code base64 URI set for ViewShot');
                
                // Also save to file for sharing functionality (if needed)
                try {
                  const base64Data = dataURL.includes(',') ? dataURL.split(',')[1] : dataURL;
                  const fileName = `qrcode_${Date.now()}.png`;
                  const filePath = `${RNFS.CachesDirectoryPath}/${fileName}`;
                  await RNFS.writeFile(filePath, base64Data, 'base64');
                  console.log('QR code also saved to file for sharing:', filePath);
                } catch (fileError) {
                  console.error('Error saving QR code to file (non-critical):', fileError);
                }
              }
            });
          }
        } catch (error) {
          console.error('Error converting QR code to base64:', error);
        }
      }, 800); // Wait for QR code to fully render

      return () => clearTimeout(timer);
    }
  }, [qrValue, qrCodeRef.current]);

  // Ensure ViewShot is ready before allowing captures
  useEffect(() => {
    // Wait for the view to be fully rendered before marking as ready
    // This is especially important on iOS
    const timer = setTimeout(() => {
      setIsViewShotReady(true);
    }, 1000); // Give enough time for the view and QR code to render

    return () => clearTimeout(timer);
  }, [qrCodeBase64]);

  // Debug: Log received params
  useEffect(() => {
    console.log('ViewQRCodeScreen received params:', {
      crowdId,
      crowdName,
      duration,
      qrCodeData,
      ghostName,
      avatarBgColor,
      isCreator,
      expiresAt,
    });
  }, [crowdId, crowdName, duration, qrCodeData, ghostName, avatarBgColor, isCreator, expiresAt]);

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
    return duration || 30;
  }, [expiresAt, duration]);

  // Generate QR code data - use provided data or generate a link
  const qrValue = useMemo(() => {
    let value;
    if (qrCodeData && typeof qrCodeData === 'string' && qrCodeData.trim().length > 0) {
      value = String(qrCodeData).trim();
    } else if (crowdName && typeof crowdName === 'string' && crowdName.trim().length > 0) {
      // Generate a link with crowd name
      value = `amigo://crowd/join/${crowdName.trim()}`;
    } else {
      // Fallback to a test value
      value = 'amigo://crowd/join/test';
    }
    
    // Ensure value is a valid non-empty string
    if (!value || typeof value !== 'string' || value.length === 0) {
      value = 'amigo://crowd/join/test';
    }
    
    console.log('QR Code Value:', value, 'Type:', typeof value, 'Length:', value.length);
    return value;
  }, [qrCodeData, crowdName]);

  const handleBack = () => {
    // Simply go back to the previous screen (CrowdChatScreen)
    // Since ViewQRCodeScreen was navigated to from CrowdChatScreen,
    // goBack() will naturally return to it with all the state intact
    navigation.goBack();
  };

  const handleShareQR = async () => {
    try {
      if (!viewShotRef.current || !isViewShotReady) {
        Alert.alert('Error', 'QR code not ready. Please try again.');
        return;
      }

      // Wait for ViewShot to be laid out (especially important on iOS)
      if (!isViewShotLaidOut) {
        let attempts = 0;
        while (!isViewShotLaidOut && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          attempts++;
        }
      }

      // Wait a bit to ensure the view is fully rendered before capturing
      // This is especially important on iOS where off-screen views might not be ready
      await new Promise(resolve => setTimeout(resolve, Platform.OS === 'ios' ? 800 : 300));

      // Capture the QR code image (same as save functionality)
      // On iOS, we need to ensure the view is fully laid out before capturing
      const imageUri = await viewShotRef.current.capture();
      
      console.log('Captured image URI for share:', imageUri);
      
      if (!imageUri) {
        Alert.alert('Error', 'Failed to capture QR code image. Please try again.');
        return;
      }
      
      // Verify the file exists (especially important on iOS)
      if (Platform.OS === 'ios') {
        const filePath = imageUri.startsWith('file://') ? imageUri.replace('file://', '') : imageUri;
        const fileExists = await RNFS.exists(filePath);
        if (!fileExists) {
          console.error('Captured file does not exist:', filePath);
          Alert.alert('Error', 'Failed to capture QR code image. Please try again.');
          return;
        }
      }
      
      // Prepare the share message
      const shareMessage = `Join my crowd "${getCrowdDisplayName(crowdName)}" on Amigo! Scan the QR code to join.`;
      
      // Share the image along with the text using react-native-share
      // iOS requires explicit file:// protocol, ensure proper formatting
      const filePath = Platform.OS === 'ios' 
        ? (imageUri.startsWith('file://') ? imageUri : `file://${imageUri}`)
        : (imageUri.startsWith('file://') ? imageUri : imageUri);
      
      console.log('Sharing image with URI:', filePath);
      
      const shareOptions = {
        title: 'Join Crowd',
        message: shareMessage,
        url: filePath,
        type: 'image/png',
      };

      await Sharing.shareAsync(shareOptions.url, {
        mimeType: shareOptions.type,
        dialogTitle: shareOptions.title,
      });
    } catch (error) {
      console.error('Error sharing QR code:', error);
      // If sharing fails, don't show alert if user cancelled
      if (error.message !== 'User did not share' && !error.message?.includes('User did not share')) {
        Alert.alert(
          'Error',
          'Failed to share QR code. Please try again.'
        );
      }
    }
  };

  const handleSaveQR = async () => {
    try {
      if (!viewShotRef.current || !isViewShotReady) {
        Alert.alert('Error', 'QR code not ready. Please try again.');
        return;
      }

      // Wait for ViewShot to be laid out (especially important on iOS)
      if (!isViewShotLaidOut) {
        let attempts = 0;
        while (!isViewShotLaidOut && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          attempts++;
        }
      }

      // Wait a bit to ensure the view is fully rendered before capturing
      // This is especially important on iOS where off-screen views might not be ready
      await new Promise(resolve => setTimeout(resolve, Platform.OS === 'ios' ? 800 : 300));

      // Capture the entire styled container as an image
      // On iOS, we need to ensure the view is fully laid out before capturing
      const uri = await viewShotRef.current.capture();
      
      console.log('Captured image URI:', uri);
      
      if (!uri) {
        Alert.alert('Error', 'Failed to capture QR code image. Please try again.');
        return;
      }
      
      // Verify the file exists (especially important on iOS)
      if (Platform.OS === 'ios') {
        const filePath = uri.startsWith('file://') ? uri.replace('file://', '') : uri;
        const fileExists = await RNFS.exists(filePath);
        if (!fileExists) {
          console.error('Captured file does not exist:', filePath);
          Alert.alert('Error', 'Failed to capture QR code image. Please try again.');
          return;
        }
      }
      
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
        {/* Top Bar with Back Arrow and Title */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              console.log('Back button pressed');
              handleBack();
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
            <BackArrow />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>QR Code</Text>
          <View style={styles.topBarSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          
          {/* Crowd Name */}
          <Text style={styles.crowdName}>{getCrowdDisplayName(crowdName) || 'Test Crowd 1'}</Text>

          {/* Original QR Code Container (for display) */}
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
            </View>
          </View>

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
              <View style={{backgroundColor: "#0A0A14", width: 281.98, height: 281.98, alignItems: 'center', justifyContent: 'center',borderRadius: 32,    marginBottom: 25,}}>
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
                
                {/* QR Code - Use QRCode component directly for better iOS compatibility with ViewShot */}
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
            </View>
          </ViewShot>

          {/* Expiry Pill */}
          <View style={styles.expiryPill}>
            <ClockIcon width={16} height={16} strokeColor="#FFFFFF" />
            <Text style={styles.expiryText}>
              Expires in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
            </Text>
          </View>

          {/* Info Section */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <InfoIcon width={16} height={16} />
              <Text style={styles.infoCardTitle}>Scan to Join</Text>
            </View>
            <Text style={styles.infoCardText}>
              Anyone with this QR code can join your crowd. The code expires when the crowd ends.
            </Text>
          </View>

          {/* Share QR Code Button */}
          <TouchableOpacity
            style={styles.shareButtonContainer}
            onPress={handleShareQR}
            activeOpacity={0.8}>
            <LinearGradient
              colors={['#9B7BFF', '#B88DFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.gradientButton}>
              <ShareIcon width={20} height={20} />
              <Text style={styles.shareButtonText}>Share QR Code</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Save QR Image Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveQR}
            activeOpacity={0.8}>
            <SaveIcon width={20} height={20} />
            <Text style={styles.saveButtonText}>Save QR Image</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ViewQRCodeScreen;

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
    zIndex: 10,
    elevation: 10, // For Android
  },
  headerTitle: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 17,
    color: '#FFFFFF',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    zIndex: 1, // Lower than back button
    pointerEvents: 'none', // Allow touches to pass through
  },
  topBarSpacer: {
    width: 36, // Same width as back button to center title
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  crowdName: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
    color: '#FFFFFF',
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
    top: '50%',
    left: '50%',
    marginTop: -38,
    marginLeft: -38,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostLogoBackground: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#0A0A14',
    alignItems: 'center',
    justifyContent: 'center',
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
  infoCard: {
    backgroundColor: '#141422',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    width: '100%',
    maxWidth: 365,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoCardTitle: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 16,
    color: '#9B7BFF',
    marginLeft: 8,
  },
  infoCardText: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: '#C5C6E3',
  },
  shareButtonContainer: {
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
  shareButtonText: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  saveButton: {
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
  saveButtonText: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  hiddenViewShotContainer: {
    position: 'absolute',
    left: -500, // Position far off-screen to the left but still in view hierarchy
    top: 0,
  },
  styledQRCard: {
    width: 364.38,
    maxWidth: '100%',
    backgroundColor: '#252340',
    borderRadius: 32,
    paddingTop: 25,
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
    borderTopLeftRadius: 40,
  },
  topRightBracket: {
    top: -8,
    right: -8,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 40,
  },
  bottomLeftBracket: {
    bottom: -8,
    left: -8,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 40,
  },
  bottomRightBracket: {
    bottom: -8,
    right: -8,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 40,
  },
});
