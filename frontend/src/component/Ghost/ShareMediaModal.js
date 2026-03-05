import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { FontFamily } from '../../../GlobalStyles';
import ShareImageIcon from '../../assets/svg/shareimage.icon';
import CameraIcon from '../../assets/svg/CameraIcon';
import ShareFileIcon from '../../assets/svg/sharefile.icon';
import CrossIcon from '../../assets/svg/CrossIcon';

const ShareMediaModal = ({
  visible,
  onClose,
  onSelectGallery,
  onSelectCamera,
  onSelectFiles,
  preventClose = false, // Prevent modal from closing (e.g., when camera is launching)
}) => {
  const handleClose = () => {
    // if (preventClose) {
    //   return; // Don't close if prevented
    // }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={preventClose ? undefined : onClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Share Media</Text>
                <TouchableOpacity
                  onPress={handleClose}
                  style={styles.closeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <CrossIcon width={20} height={20} />
                </TouchableOpacity>
              </View>

              {/* Options */}
              <View style={styles.optionsContainer}>
                {/* Gallery / Photos */}
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={onSelectGallery}
                  activeOpacity={0.7}>
                  <View style={styles.optionIconContainer}>
                    <ShareImageIcon size={24} color="#9B7BFF" />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Gallery / Photos</Text>
                    <Text style={styles.optionSubtitle}>Choose from your photos</Text>
                  </View>
                </TouchableOpacity>

                {/* Camera */}
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={onSelectCamera}
                  activeOpacity={0.7}>
                  <View style={styles.optionIconContainer}>
                    <CameraIcon size={24} color="#9B7BFF" />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Camera</Text>
                    <Text style={styles.optionSubtitle}>Take a new photo</Text>
                  </View>
                </TouchableOpacity>

                {/* Files / Documents */}
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={onSelectFiles}
                  activeOpacity={0.7}>
                  <View style={styles.optionIconContainer}>
                    <ShareFileIcon size={24} color="#9B7BFF" />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Files / Documents</Text>
                    <Text style={styles.optionSubtitle}>Share documents and files</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ShareMediaModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#0A0A14',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingHorizontal: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 24,
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  optionsContainer: {
    gap: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A24',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  optionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(155, 123, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 14,
    color: '#8B8CAD',
  },
});


