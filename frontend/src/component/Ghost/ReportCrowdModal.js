import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  TextInput,
  Platform,
  Dimensions,
} from 'react-native';
import { FontFamily } from '../../../GlobalStyles';
import { getCrowdDisplayName } from '../../utils/helper';
import FlagIcon from '../../assets/svg/FlagIcon';
import WarningIcon from '../../assets/svg/WarningIcon';
import InfoIcon from '../../assets/svg/InfoIcon';
import AdminShieldIcon from '../../assets/svg/AdminShieldIcon';
import CopyIcon from '../../assets/svg/CopyIcon';
import CrossIcon from '../../assets/svg/CrossIcon';

const ACCENT = '#FF6363';
const REASONS = [
  { key: 'spam_scam', title: 'Spam / Scam', subtitle: 'This crowd is used for spam or scams', Icon: FlagIcon },
  { key: 'harassment_abuse', title: 'Harassment / Abuse', subtitle: 'Bullying or abusive behavior in this crowd', Icon: WarningIcon },
  { key: 'hate_violence', title: 'Hate / Violence', subtitle: 'Hateful or violent content in this crowd', Icon: WarningIcon },
  { key: 'sexual_content', title: 'Sexual Content', subtitle: 'Inappropriate sexual material', Icon: InfoIcon },
  { key: 'other', title: 'Other', subtitle: 'Something else that violates guidelines', Icon: CopyIcon },
];

const ReportCrowdModal = ({ visible, variant = 'crowd', crowdName, targetName, messageText, onClose, onSubmit }) => {
  const [selectedReasonKey, setSelectedReasonKey] = useState('spam_scam');
  const [detailsText, setDetailsText] = useState('');

  const handleSubmit = () => {
    onSubmit(selectedReasonKey, detailsText.trim());
  };

  const isMessage = variant === 'message';
  const displayName = isMessage
    ? (targetName || 'this message')
    : (getCrowdDisplayName(crowdName) || 'this crowd');
  const showMessagePreview = isMessage && (messageText != null && messageText !== '');

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

              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
                keyboardShouldPersistTaps="handled">
                {/* Top icon */}
                <View style={styles.iconCircle}>
                  <FlagIcon width={24} height={24} strokeColor={ACCENT} />
                </View>

                <Text style={styles.title}>{isMessage ? 'Report Message' : 'Report Crowd'}</Text>
                <Text style={styles.subtitle}>
                  {isMessage
                    ? 'Help us keep this crowd safe'
                    : null}
                  {!isMessage && 'Report '}
                  {!isMessage && <Text style={styles.subtitleAccent}>{displayName}</Text>}
                  {!isMessage && ' for policy violations'}
                </Text>

                {/* Message preview - only when reporting a message */}
                {showMessagePreview && (
                  <View style={styles.messagePreviewBox}>
                    <Text style={styles.messagePreviewText} numberOfLines={6}>
                      {messageText}
                    </Text>
                  </View>
                )}

                {/* Anonymous info box */}
                <View style={styles.infoBox}>
                  <AdminShieldIcon width={20} height={20} strokeColor={ACCENT} />
                  <Text style={styles.infoText}>Reports are anonymous and help keep our community safe</Text>
                </View>

                {/* Reason options */}
                <View style={styles.reasonsContainer}>
                  {REASONS.map(({ key, title, subtitle, Icon }) => {
                    const selected = selectedReasonKey === key;
                    return (
                      <TouchableOpacity
                        key={key}
                        style={[styles.reasonRow, selected && styles.reasonRowSelected]}
                        onPress={() => setSelectedReasonKey(key)}
                        activeOpacity={0.7}>
                        <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
                          {selected && <View style={styles.radioInner} />}
                        </View>
                        <View style={[styles.reasonIconWrap, selected && styles.reasonIconWrapSelected]}>
                          <Icon
                            width={20}
                            height={20}
                            strokeColor={selected ? ACCENT : '#8B8CAD'}
                          />
                        </View>
                        <View style={styles.reasonTextWrap}>
                          <Text style={styles.reasonTitle}>{title}</Text>
                          <Text style={styles.reasonSubtitle}>{subtitle}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Additional details */}
                <TextInput
                  style={styles.detailsInput}
                  placeholder="Add additional details (optional)..."
                  placeholderTextColor="#5E607E"
                  value={detailsText}
                  onChangeText={setDetailsText}
                  multiline
                  maxLength={500}
                />
                <View style={styles.detailsFooter}>
                  <Text style={styles.detailsHint}>Optional but helpful for our review</Text>
                  <Text style={styles.detailsCount}>{detailsText.length}/500</Text>
                </View>

                {/* Submit button */}
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                  activeOpacity={0.8}>
                  <Text style={styles.submitButtonText}>Submit Report</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ReportCrowdModal;

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
    minHeight: Dimensions.get('window').height * 0.8,
    maxHeight: Dimensions.get('window').height * 0.9,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 8,
    alignItems: 'stretch',
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
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  subtitleAccent: {
    color: ACCENT,
    fontWeight: '600',
  },
  messagePreviewBox: {
    backgroundColor: '#181830',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  messagePreviewText: {
    fontFamily: FontFamily.robotoRegular,
    fontSize: 15,
    color: '#E0E0E8',
    lineHeight: 22,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ACCENT,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  reasonsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181830',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  reasonRowSelected: {
    borderColor: ACCENT,
    backgroundColor: 'rgba(255, 99, 99, 0.06)',
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
  reasonIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reasonIconWrapSelected: {
    backgroundColor: 'rgba(255, 99, 99, 0.15)',
  },
  reasonTextWrap: {
    flex: 1,
  },
  reasonTitle: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  reasonSubtitle: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 13,
    color: '#8B8CAD',
    lineHeight: 18,
  },
  detailsInput: {
    width: '100%',
    minHeight: 88,
    maxHeight: 120,
    borderRadius: 12,
    backgroundColor: '#181830',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: FontFamily.robotoRegular,
    fontSize: 15,
    color: '#FFFFFF',
    textAlignVertical: 'top',
    marginBottom: 6,
  },
  detailsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailsHint: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 12,
    color: '#5E607E',
  },
  detailsCount: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 12,
    color: '#5E607E',
  },
  submitButton: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
