import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  ActivityIndicator,
  Share,
  Dimensions,
} from 'react-native';
import { Image as FastImage } from 'expo-image';
import { X, ScanLine, Share2, Download } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { getQrPayload, joinByQr } from '../apis/qr';
import { launchImageLibrary } from '../utils/imagePickerCompat';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIEWFINDER_SIZE = Math.min(260, SCREEN_WIDTH - 48);
const CORNER_SIZE = 32;

interface ScanQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  themeColor: string;
  userData: { _id?: string; firstName?: string; lastName?: string; userName?: string; userProfile?: string } | null;
  setToastMsg?: (msg: string) => void;
}

export const ScanQRModal = ({
  isOpen,
  onClose,
  isDarkMode,
  themeColor,
  userData,
  setToastMsg,
}: ScanQRModalProps) => {
  const [showMyQR, setShowMyQR] = useState(false);
  const [payload, setPayload] = useState<string | null>(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const isProcessingRef = useRef(false);

  const userId = userData?._id ?? '';
  const displayName = [userData?.firstName, userData?.lastName].filter(Boolean).join(' ') || 'User';
  const userName = userData?.userName ? `@${userData.userName}` : '@user';

  useEffect(() => {
    if (isOpen && !showMyQR && permission?.granted === false && permission?.canAskAgain) {
      requestPermission();
    }
  }, [isOpen, showMyQR, permission?.granted, permission?.canAskAgain]);

  useEffect(() => {
    if (!isOpen) {
      setShowMyQR(false);
      return;
    }
    scanLineAnim.setValue(0);
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 1250,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 1250,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [isOpen]);

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [VIEWFINDER_SIZE * 0.08, VIEWFINDER_SIZE * 0.88],
  });

  const onMyQRPress = async () => {
    if (!userId) {
      setToastMsg?.('User not found');
      return;
    }
    setShowMyQR(true);
    setLoadingQR(true);
    setPayload(null);
    try {
      const res = await getQrPayload('dm', userId);
      if (res?.success && res?.data) {
        setPayload(res.data.payload);
      } else {
        setToastMsg?.('Failed to load QR');
      }
    } catch (e) {
      setToastMsg?.('Failed to load QR');
    } finally {
      setLoadingQR(false);
    }
  };

  const onCloseMyQR = () => {
    setShowMyQR(false);
    setPayload(null);
  };

  const onShare = async () => {
    if (!payload || !userName) return;
    try {
      await Share.share({
        message: `Add me on Amigo: ${userName}`,
        title: 'Add me on Amigo',
      });
    } catch (_) {}
  };

  const onSaveQR = async () => {
    if (!payload) return;
    setToastMsg?.('Use Share or take a screenshot to save');
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (isProcessingRef.current || isProcessing || !data?.trim()) return;
    isProcessingRef.current = true;
    setIsProcessing(true);
    joinByQr({ payload: data.trim() })
      .then((res) => {
        if (res?.success && res?.data) {
          setToastMsg?.('Added!');
          onClose();
        } else {
          setToastMsg?.(res?.message || 'Invalid QR code');
        }
      })
      .catch((e: any) => {
        setToastMsg?.(e?.response?.data?.message || e?.message || 'Invalid or expired QR code');
      })
      .finally(() => {
        setIsProcessing(false);
        isProcessingRef.current = false;
      });
  };

  const handleUploadImage = () => {
    if (isProcessing) return;
    launchImageLibrary({ mediaType: 'photo', includeBase64: true }, async (response: any) => {
      if (response.didCancel || response.error) return;
      const asset = response.assets?.[0];
      const uri = asset?.uri;
      const base64 = asset?.base64;
      if (!uri && !base64) {
        setToastMsg?.('Could not get image');
        return;
      }
      setIsProcessing(true);
      try {
        const RNQRGenerator = require('rn-qr-generator').default;
        const result = await RNQRGenerator.detect(base64 ? { base64 } : { uri });
        const values = result?.values;
        if (values?.length > 0 && values[0]) {
          handleBarcodeScanned({ data: values[0] });
        } else {
          setToastMsg?.('No QR code found in image');
          setIsProcessing(false);
          isProcessingRef.current = false;
        }
      } catch (e: any) {
        const msg = e?.message || '';
        setToastMsg?.(msg.includes('rn-qr-generator') || msg.includes('Cannot find module')
          ? 'Upload QR: run npm install rn-qr-generator and rebuild app'
          : (msg || 'Could not read QR from image'));
        setIsProcessing(false);
        isProcessingRef.current = false;
      }
    });
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.8)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    card: {
      width: '100%',
      maxWidth: 340,
      alignItems: 'center',
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 32,
    },
    headerText: {},
    title: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
    subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
    closeBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.1)',
    },
    viewfinder: {
      width: VIEWFINDER_SIZE,
      height: VIEWFINDER_SIZE,
      borderRadius: 28,
      overflow: 'hidden',
      backgroundColor: isDarkMode ? '#1A1A2E' : '#1F2937',
    },
    corner: {
      position: 'absolute',
      width: CORNER_SIZE,
      height: CORNER_SIZE,
      borderColor: themeColor,
    },
    cornerTL: { top: 12, left: 12, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 12 },
    cornerTR: { top: 12, right: 12, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 12 },
    cornerBL: { bottom: 12, left: 12, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 12 },
    cornerBR: { bottom: 12, right: 12, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 12 },
    helperText: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 24, textAlign: 'center' },
    btnRow: { flexDirection: 'row', gap: 16, marginTop: 32 },
    btnPrimary: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: themeColor,
    },
    btnSecondary: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.1)',
    },
    btnTextPrimary: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
    btnTextSecondary: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  });

  if (!isOpen) return null;

  return (
    <>
      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
        <Pressable style={styles.overlay} onPress={onClose}>
          <View style={styles.card} onStartShouldSetResponder={() => true}>
            <View style={styles.headerRow}>
              <View style={styles.headerText}>
                <Text style={styles.title}>Scan QR Code</Text>
                <Text style={styles.subtitle}>Point camera at a QR code to connect</Text>
              </View>
              <Pressable onPress={onClose} style={styles.closeBtn}>
                <X size={20} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.viewfinder}>
              {permission?.granted ? (
                <>
                  <CameraView
                    style={StyleSheet.absoluteFill}
                    facing="back"
                    barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                    onBarcodeScanned={isProcessing ? undefined : handleBarcodeScanned}
                  />
                  <Animated.View
                    style={[
                      {
                        position: 'absolute',
                        left: 16,
                        right: 16,
                        height: 2,
                        borderRadius: 1,
                        backgroundColor: themeColor,
                        zIndex: 1,
                      },
                      { transform: [{ translateY: scanLineTranslateY }] },
                    ]}
                  />
                  <View style={[styles.corner, styles.cornerTL]} />
                  <View style={[styles.corner, styles.cornerTR]} />
                  <View style={[styles.corner, styles.cornerBL]} />
                  <View style={[styles.corner, styles.cornerBR]} />
                </>
              ) : (
                <>
                  <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
                    <ScanLine size={48} color={themeColor} style={{ opacity: 0.3 }} />
                  </View>
                  <View style={[styles.corner, styles.cornerTL]} />
                  <View style={[styles.corner, styles.cornerTR]} />
                  <View style={[styles.corner, styles.cornerBL]} />
                  <View style={[styles.corner, styles.cornerBR]} />
                  <View style={{ position: 'absolute', bottom: 12, left: 16, right: 16, alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>
                      {permission == null ? 'Requesting camera...' : 'Camera access needed to scan'}
                    </Text>
                    {permission?.canAskAgain === true && (
                      <Pressable onPress={() => requestPermission()} style={{ marginTop: 8, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: themeColor, borderRadius: 12 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#FFF' }}>Allow camera</Text>
                      </Pressable>
                    )}
                  </View>
                </>
              )}
            </View>

            <Text style={styles.helperText}>
              {isProcessing ? 'Processing...' : 'Scanning for QR codes...'}
            </Text>

            <View style={styles.btnRow}>
              <Pressable onPress={onMyQRPress} style={styles.btnPrimary}>
                <Text style={styles.btnTextPrimary}>My QR Code</Text>
              </Pressable>
              <Pressable onPress={handleUploadImage} style={styles.btnSecondary}>
                <Text style={styles.btnTextSecondary}>Upload Image</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* My QR Modal - uisample style */}
      <Modal
        visible={showMyQR}
        transparent
        animationType="slide"
        onRequestClose={onCloseMyQR}
        statusBarTranslucent
      >
        <View style={[styles.overlay, { justifyContent: 'center' }]}>
          <View
            style={{
              width: '100%',
              maxWidth: 340,
              borderRadius: 32,
              overflow: 'hidden',
              backgroundColor: isDarkMode ? '#141422' : '#FFFFFF',
              shadowColor: themeColor,
              shadowOffset: { width: 0, height: 20 },
              shadowOpacity: 0.25,
              shadowRadius: 60,
              elevation: 16,
            }}
          >
            {/* Gradient header with avatar - uisample */}
            <View
              style={{
                height: 128,
                backgroundColor: themeColor,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Pressable
                onPress={onCloseMyQR}
                style={{ position: 'absolute', top: 16, right: 16, padding: 8, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.2)' }}
              >
                <X size={20} color="#FFFFFF" />
              </Pressable>
              <View style={{ marginTop: 48 }}>
                {userData?.userProfile ? (
                  <FastImage
                    source={{ uri: userData.userProfile }}
                    style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: '#FFF' }}
                  />
                ) : (
                  <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 36, fontWeight: '700', color: themeColor }}>
                      {displayName.slice(0, 2).toUpperCase() || 'U'}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={{ paddingTop: 56, paddingBottom: 32, paddingHorizontal: 24, alignItems: 'center' }}>
              <Text style={{ fontSize: 22, fontWeight: '700', color: isDarkMode ? '#FFFFFF' : '#111827', marginBottom: 4 }}>
                {displayName}
              </Text>
              <Text style={{ fontSize: 14, fontWeight: '500', color: isDarkMode ? '#8B8CAD' : '#6B7280', marginBottom: 24 }}>
                {userName}
              </Text>

              <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 2, color: themeColor, marginBottom: 16 }}>
                SCAN TO ADD ME ON AMIGO
              </Text>

              {loadingQR ? (
                <ActivityIndicator size="large" color={themeColor} style={{ marginVertical: 24 }} />
              ) : payload ? (
                <View
                  style={{
                    borderRadius: 24,
                    padding: 16,
                    backgroundColor: isDarkMode ? '#0A0A14' : '#F3F4F6',
                    marginBottom: 32,
                  }}
                >
                  <QRCode value={payload} size={200} />
                </View>
              ) : (
                <View style={{ height: 232, marginBottom: 32, justifyContent: 'center' }}>
                  <Text style={{ fontSize: 14, color: isDarkMode ? '#8B8CAD' : '#6B7280' }}>No QR available</Text>
                </View>
              )}

              <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                <Pressable
                  onPress={onShare}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    backgroundColor: isDarkMode ? '#2A2A3E' : '#F3F4F6',
                  }}
                >
                  <Share2 size={18} color={isDarkMode ? '#FFF' : '#111827'} />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: isDarkMode ? '#FFFFFF' : '#111827' }}>Share</Text>
                </Pressable>
                <Pressable
                  onPress={onSaveQR}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    backgroundColor: isDarkMode ? '#2A2A3E' : '#F3F4F6',
                  }}
                >
                  <Download size={18} color={isDarkMode ? '#FFF' : '#111827'} />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: isDarkMode ? '#FFFFFF' : '#111827' }}>Save QR</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};
