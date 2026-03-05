import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Platform,
  Linking,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useCameraPermissions } from 'expo-camera';
import { FontFamily } from '../../../GlobalStyles';
import CameraIcon from '../../assets/svg/CameraIcon';
import QRCodeIcon from '../../assets/svg/QRCodeIcon';

const InitializeCameraScreen = ({ navigation }) => {
  const route = useRoute();
  const { ghostName, avatarBgColor } = route.params || {};
  const [permission, requestPermission] = useCameraPermissions();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [hasRequestedOnce, setHasRequestedOnce] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (!permission) return;

    if (permission.granted) {
      navigation.replace('QRScannerScreen', { ghostName, avatarBgColor });
    }
  }, [permission]);

  const handleGoBack = () => {
    navigation.navigate('GhostModeHomeScreen', { ghostName, avatarBgColor });
  };

  const handleAllowCamera = async () => {
    if (hasRequestedOnce && permission && !permission.granted && !permission.canAskAgain) {
      Linking.openSettings();
      return;
    }
    setHasRequestedOnce(true);
    await requestPermission();
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <ActivityIndicator size="large" color="#9B7BFF" />
          <Text style={styles.statusText}>Initializing camera...</Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  if (permission.granted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#9B7BFF" />
          <Text style={styles.statusText}>Opening camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isPermanentlyDenied = hasRequestedOnce && !permission.canAskAgain;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.iconWrapper}>
          <View style={styles.iconCircle}>
            <CameraIcon width={40} height={40} />
          </View>
        </View>

        <Text style={styles.titleText}>Camera Access</Text>
        <Text style={styles.descriptionText}>
          Ghost Mode needs your camera to scan QR codes so you can join Crowds.
          {'\n\n'}
          Your camera is only used for scanning — no photos or videos are taken.
        </Text>

        <View style={styles.reasonRow}>
          <View style={styles.reasonIconCircle}>
            <QRCodeIcon width={18} height={18} />
          </View>
          <Text style={styles.reasonText}>Scan QR codes to join Crowds instantly</Text>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleAllowCamera}>
          <Text style={styles.primaryButtonText}>
            {isPermanentlyDenied ? 'Open Settings' : 'Allow Camera Access'}
          </Text>
        </TouchableOpacity>

        {isPermanentlyDenied && (
          <Text style={styles.settingsHintText}>
            Permission was denied. Please enable camera access from your device settings.
          </Text>
        )}

        <TouchableOpacity style={styles.secondaryButton} onPress={handleGoBack}>
          <Text style={styles.secondaryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

export default InitializeCameraScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconWrapper: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(155, 123, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  descriptionText: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 15,
    color: '#C5C6E3',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(155, 123, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 32,
    alignSelf: 'stretch',
  },
  reasonIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(155, 123, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reasonText: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  statusText: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 16,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    backgroundColor: '#9B7BFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 16,
    color: '#FFFFFF',
  },
  settingsHintText: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 13,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 18,
  },
  secondaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    backgroundColor: '#181830',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 16,
    color: '#9B7BFF',
  },
});
