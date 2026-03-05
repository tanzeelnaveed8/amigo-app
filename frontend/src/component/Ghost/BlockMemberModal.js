import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Platform,
  Dimensions,
} from 'react-native';
import { FontFamily } from '../../../GlobalStyles';
import RemoveUserIcon from '../../assets/svg/RemoveUserIcon';
import WarningIcon from '../../assets/svg/WarningIcon';
import CrossIcon from '../../assets/svg/CrossIcon';

const ACCENT = '#FF6363';

const BlockMemberModal = ({ visible, memberName, onClose, onConfirm }) => {
  const displayName = memberName || 'this member';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* Header with close */}
              <View style={styles.header}>
                <View style={styles.headerSpacer} />
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <CrossIcon width={20} height={20} />
                </TouchableOpacity>
              </View>

              {/* Block icon */}
              <View style={styles.iconCircle}>
                <RemoveUserIcon width={28} height={28} strokeColor={ACCENT} />
              </View>

              <Text style={styles.title}>Block Member</Text>
              <Text style={styles.subtitle}>
                Block <Text style={styles.subtitleAccent}>{displayName}</Text> permanently from this crowd?
              </Text>

              {/* Warning box */}
              <View style={styles.warningBox}>
                <WarningIcon width={20} height={20} strokeColor={ACCENT} />
                <View style={styles.bulletList}>
                  <Text style={styles.bulletItem}>• User will be kicked out instantly</Text>
                  <Text style={styles.bulletItem}>• They cannot rejoin even with QR code</Text>
                  <Text style={styles.bulletItem}>• This action is permanent</Text>
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
                  style={styles.confirmButton}
                  onPress={onConfirm}
                  activeOpacity={0.8}>
                  <Text style={styles.confirmButtonText}>Block User</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default BlockMemberModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    minHeight: 320,
    backgroundColor: '#0A0A14',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ACCENT,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 24 : 20,
    alignItems: 'stretch',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerSpacer: {
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 99, 99, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 99, 99, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
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
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  subtitleAccent: {
    color: ACCENT,
    fontWeight: '600',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 99, 99, 0.12)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 99, 99, 0.25)',
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 24,
    gap: 12,
  },
  bulletList: {
    flex: 1,
  },
  bulletItem: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1A1A24',
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
  confirmButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
