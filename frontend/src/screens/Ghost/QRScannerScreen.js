import React, { useEffect, useRef, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Animated,
  Alert,
  ActivityIndicator,
  Dimensions,
  BackHandler,
} from 'react-native';
import { useRoute, useFocusEffect, useIsFocused } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { launchImageLibrary } from '../../utils/imagePickerCompat';
import CrossIcon from '../../assets/svg/CrossIcon';
import InstantIcon from '../../assets/svg/InstantIcon';
import InfoIcon from '../../assets/svg/InfoIcon';
import ShareImageIcon from '../../assets/svg/shareimage.icon';
import { FontFamily } from '../../../GlobalStyles';
import { joinCrowd } from '../../apis/ghost';
import { getGhostDeviceId } from '../../utils/ghostDeviceId';
import Context from '../../context';

const { width, height } = Dimensions.get('window');

const QRScannerScreen = ({ navigation }) => {
  const route = useRoute();
  const { ghostName, avatarBgColor } = route.params || {};
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const isProcessingRef = useRef(false);
  const { setLoader, setToastMsg } = useContext(Context);
  const isFocused = useIsFocused();

  const handleClose = () => {
    navigation.navigate('GhostModeHomeScreen', {
      ghostName: ghostName,
      avatarBgColor: avatarBgColor,
    });
  };

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    startAnimation();
  }, []);

  const parseQRCode = (qrData) => {
    const match = qrData.match(/^amigo:\/\/crowd\/join\/(.+)$/);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  };

  const handleQRCodeScanned = async (qrData) => {
    if (isProcessingRef.current || isProcessing || isJoining) return;
    isProcessingRef.current = true;
    setIsProcessing(true);

    const crowdName = parseQRCode(qrData);

    if (!crowdName) {
      isProcessingRef.current = false;
      setIsProcessing(false);
      Alert.alert(
        'Invalid QR Code',
        'This QR code is not a valid Ghost Mode crowd QR code.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsJoining(true);
    setLoader(true);

    try {
      const deviceId = await getGhostDeviceId();
      const response = await joinCrowd({
        crowdName: crowdName,
        deviceId,
        ghostName,
        avatarBgColor,
      });

      if (response.status === 201 && response.data) {
        setLoader(false);
        setIsJoining(false);
        setIsProcessing(false);
        isProcessingRef.current = false;

        navigation.reset({
          index: 1,
          routes: [
            {
              name: 'GhostModeHomeScreen',
              params: {
                ghostName: ghostName,
                avatarBgColor: avatarBgColor,
              },
            },
            {
              name: 'CrowdChatScreen',
              params: {
                crowdId: response.data.crowdId,
                crowdName: response.data.crowdName,
                ghostName: ghostName,
                avatarBgColor: avatarBgColor,
                isCreator: response.data.isCreator || false,
                duration: response.data.duration,
                expiresAt: response.data.expiresAt,
              },
            },
          ],
        });
      } else {
        throw new Error(response.message || 'Failed to join crowd');
      }
    } catch (error) {
      setLoader(false);
      setIsJoining(false);
      setIsProcessing(false);
      isProcessingRef.current = false;

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to join crowd. Please try again.';
      setToastMsg(errorMessage);
      Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
    }
  };

  const handleBarcodeScanned = ({ data }) => {
    if (data && !isProcessingRef.current) {
      handleQRCodeScanned(data);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleClose();
        return true;
      };
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );
      return () => {
        subscription.remove();
        setIsFlashOn(false);
      };
    }, [ghostName, avatarBgColor])
  );

  const handleFlashToggle = () => {
    setIsFlashOn((prev) => !prev);
  };

  const handleSelectFromGallery = async () => {
    if (isProcessing || isJoining || isProcessingRef.current) return;

    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 1,
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        return;
      }
      if (response.error) {
        Alert.alert(
          'Error',
          'Failed to select image. Please try again.',
          [{ text: 'OK' }]
        );
        return;
      }
      if (response.assets && response.assets.length > 0) {
        Alert.alert(
          'QR from Gallery',
          'Please use the camera to scan QR codes directly for best results.',
          [{ text: 'OK' }]
        );
      }
    });
  };

  const scanLineStyle = {
    transform: [
      {
        translateY: scanLineAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 276],
        }),
      },
    ],
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9B7BFF" />
            <Text style={styles.loadingText}>
              Requesting camera permission...
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.errorText}>Camera permission required</Text>
            <TouchableOpacity
              style={[styles.retryButton, { marginTop: 16 }]}
              onPress={handleClose}>
              <Text style={styles.retryButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {isFocused && (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            enableTorch={isFlashOn}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
            onBarcodeScanned={!isProcessing ? handleBarcodeScanned : undefined}
          />
        )}

        <View style={styles.overlay}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <CrossIcon width={16} height={16} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleFlashToggle}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <View
                style={[
                  styles.flashIconContainer,
                  isFlashOn && styles.flashIconContainerActive,
                ]}>
                <InstantIcon
                  width={20}
                  height={20}
                  strokeColor="#FFFFFF"
                  fill={isFlashOn ? '#FFFFFF' : 'none'}
                />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.scanContainer}>
            <View style={styles.qrFrame}>
              <Animated.View style={[styles.scanLine, scanLineStyle]} />
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>

          <Text style={styles.instructionText}>
            Position QR code within frame
          </Text>

          <TouchableOpacity
            style={styles.selectGalleryButton}
            onPress={handleSelectFromGallery}
            activeOpacity={0.8}
            disabled={isProcessing || isJoining}>
            <ShareImageIcon width={20} height={20} />
            <Text style={styles.selectGalleryButtonText}>
              Select from Gallery
            </Text>
          </TouchableOpacity>

          <View style={styles.infoBar}>
            <InfoIcon width={16} height={16} />
            <Text style={styles.infoText}>
              Scan a Ghost Mode crowd QR code to join.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default QRScannerScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    fontFamily: FontFamily.robotoRegular,
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 16,
  },
  errorText: {
    fontFamily: FontFamily.robotoRegular,
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(155, 123, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(155, 123, 255, 0.5)',
  },
  retryButtonText: {
    fontFamily: FontFamily.robotoRegular,
    fontSize: 14,
    color: '#9B7BFF',
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
  flashIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashIconContainerActive: {
    backgroundColor: '#9B7BFF',
  },
  scanContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  qrFrame: {
    width: 280,
    height: 280,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#9B7BFF',
    borderWidth: 3,
    zIndex: 2,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  scanLine: {
    position: 'absolute',
    width: 275,
    height: 2,
    backgroundColor: '#9B7BFF',
    left: 2,
    top: 1,
    zIndex: 1,
  },
  instructionText: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: Platform.OS === 'ios' ? 20 : 16,
  },
  infoText: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 12,
    flex: 1,
  },
  selectGalleryButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: '#181830',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 16,
    alignSelf: 'stretch',
  },
  selectGalleryButtonText: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
