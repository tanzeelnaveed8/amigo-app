import React, { useState } from 'react';
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
import LockIcon from '../../assets/svg/LockIcon';
import WarningIcon from '../../assets/svg/WarningIcon';
import CrossIcon from '../../assets/svg/CrossIcon';

const ACCENT = '#FFC107';

const DURATIONS = [
  { key: '1h', title: '1 Hour', subtitle: 'User can send messages after 1 hour.' },
  { key: '24h', title: '24 Hours', subtitle: 'User can send messages after 24 hours.' },
  { key: 'permanent', title: 'Permanent', subtitle: 'User cannot send messages until unmuted.' },
];

const MuteMemberModal = ({ visible, memberName, onClose, onConfirm }) => {
  const [selectedDuration, setSelectedDuration] = useState('1h');
  const displayName = memberName || 'this member';

  const handleConfirm = () => {
    onConfirm(selectedDuration);
  };

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

              {/* Mute icon */}
              <View style={styles.iconCircle}>
                <LockIcon width={28} height={28} strokeColor={ACCENT} />
              </View>

              <Text style={styles.title}>Mute Member</Text>
              <Text style={styles.subtitle}>
                Mute <Text style={styles.subtitleAccent}>{displayName}</Text> from sending messages
              </Text>

              {/* Duration options */}
              <View style={styles.durationsContainer}>
                {DURATIONS.map(({ key, title, subtitle }) => {
                  const selected = selectedDuration === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[styles.durationRow, selected && styles.durationRowSelected]}
                      onPress={() => setSelectedDuration(key)}
                      activeOpacity={0.7}>
                      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
                        {selected && <View style={styles.radioInner} />}
                      </View>
                      <View style={styles.durationTextWrap}>
                        <Text style={styles.durationTitle}>{title}</Text>
                        <Text style={styles.durationSubtitle}>{subtitle}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Warning box */}
              <View style={styles.warningBox}>
                <WarningIcon width={20} height={20} strokeColor={ACCENT} />
                <Text style={styles.warningText}>Muted members stay in the crowd but cannot send messages.</Text>
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
                  onPress={handleConfirm}
                  activeOpacity={0.8}>
                  <Text style={styles.confirmButtonText}>Mute Member</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default MuteMemberModal;

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
    minHeight: 380,
    backgroundColor: '#0A0A14',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
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
  durationsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181830',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  durationRowSelected: {
    borderColor: ACCENT,
    backgroundColor: 'rgba(255, 193, 7, 0.06)',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#5E607E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioOuterSelected: {
    borderColor: ACCENT,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ACCENT,
  },
  durationTextWrap: {
    flex: 1,
  },
  durationTitle: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  durationSubtitle: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 13,
    color: '#8B8CAD',
    lineHeight: 18,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.12)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.25)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 24,
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
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
    color: '#1A1A24',
  },
});
