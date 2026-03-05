import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import { FontFamily } from '../../../GlobalStyles';
import BanSvg from '../../assets/svg/BanSVG';
import WarningIcon from '../../assets/svg/WarningIcon';
import CrossIcon from '../../assets/svg/CrossIcon';

const ACCENT = '#FF6363';

const BlockUserModal = ({ visible, userName, onClose, onConfirm }) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.backdrop} />
          
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* Top Glow Background Effect */}
              {/* <View style={styles.glowEffect} /> */}

              <View style={styles.content}>
                {/* Header with close */}
                <View style={styles.header}>
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <CrossIcon width={20} height={20} strokeColor="#8B8CAD" />
                  </TouchableOpacity>
                </View>

                {/* Ban Icon section */}
                <View style={styles.iconSection}>
                  <View style={styles.iconGlowContainer}>
                      <View style={[styles.iconInnerGlow, { opacity: 0.2 }]} />
                      <View style={styles.iconCircle}>
                        <BanSvg width={24} height={24} strokeColor={ACCENT} />
                      </View>
                  </View>
                </View>

                <Text style={styles.title}>Block User</Text>
                <Text style={styles.subtitle}>
                  Hide all messages from <Text style={styles.subtitleAccent}>{userName || 'this user'}</Text>?
                </Text>

                {/* Warning box */}
                <View style={styles.warningBox}>
                  <View style={styles.warningIconContainer}>
                    <WarningIcon width={18} height={18} strokeColor={ACCENT} />
                  </View>
                  <View style={styles.bulletList}>
                    <Text style={styles.bulletItem}>• Their messages will be hidden from your view only</Text>
                    <Text style={styles.bulletItem}>• Other users can still see their messages</Text>
                    <Text style={styles.bulletItem}>• They won't know you blocked them</Text>
                  </View>
                </View>

                {/* Action buttons */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={onClose}
                    activeOpacity={0.8}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.confirmButtonContainer}
                    onPress={handleConfirm}
                    activeOpacity={0.8}>
                    <LinearGradient
                      colors={[ACCENT, '#FF4F4F']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.confirmButtonGradient}>
                      <Text style={styles.confirmButtonText}>Block User</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default BlockUserModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#0A0A14',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 99, 99, 0.4)',
    overflow: 'hidden',
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  glowEffect: {
    position: 'absolute',
    top: -100,
    left: '50%',
    marginLeft: -96,
    width: 192,
    height: 192,
    backgroundColor: ACCENT,
    borderRadius: 96,
    opacity: 0.2,
  },
  content: {
    padding: 24,
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
    position: "absolute",
    top: 10,
    right: 10,
  },
  closeButton: {
    padding: 6,
    borderRadius: 20,
  },
  iconSection: {
    alignItems: 'center',
    marginVertical: 8,
  },
  iconGlowContainer: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInnerGlow: {
      position: 'absolute',
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: ACCENT,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#141422',
    borderWidth: 1,
    borderColor: 'rgba(255, 99, 99, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  title: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 22,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 14,
    color: '#C5C6E3',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  subtitleAccent: {
    color: ACCENT,
    fontWeight: '600',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 99, 99, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 99, 99, 0.3)',
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  warningIconContainer: {
      marginTop: 2,
  },
  bulletList: {
    flex: 1,
  },
  bulletItem: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 13,
    color: '#C5C6E3',
    lineHeight: 20,
    marginBottom: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 16,
    color: '#FFFFFF',
  },
  confirmButtonContainer: {
      flex: 1,
      height: 48,
  },
  confirmButtonGradient: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  confirmButtonText: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
