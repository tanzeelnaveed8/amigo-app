import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  InteractionManager,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { FontFamily } from '../../../GlobalStyles';

const ConfirmationModal = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  icon: Icon,
  onConfirm,
  onCancel,
  color = '#9B7BFF', // Default purple color
  showConfirmButton = true, // Show confirm button by default
  delayed = false,
}) => {
  // Animation for bouncing icon
  const scale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Wait for modal to be fully rendered before starting animation
      // This ensures the animation shows completely even on slower devices
      const interactionHandle = InteractionManager.runAfterInteractions(() => {
        // Add a small additional delay to ensure modal is fully visible
        setTimeout(() => {
          // Trigger bouncing animation when modal is ready
          scale.value = withSequence(
            withSpring(1.2, {
              damping: 8,
              stiffness: 200,
            }),
            withSpring(1.0, {
              damping: 10,
              stiffness: 300,
            })
          );
        }, delayed ? 500 : 50); // Small delay to ensure modal is fully visible
      });

      return () => {
        interactionHandle.cancel();
      };
    } else {
      // Reset scale when modal closes
      scale.value = 0;
    }
  }, [visible]);

  // Animated style for icon bounce
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Convert hex color to rgba for icon background and border
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  
  const iconBgColor = hexToRgba(color, 0.2);
  const iconBorderColor = hexToRgba(color, 0.3);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}>
                {/* Icon Circle */}
                {Icon && (
                  <Animated.View style={[
                    styles.iconCircle,
                    {
                      backgroundColor: iconBgColor,
                      borderColor: iconBorderColor,
                    },
                    animatedStyle,
                  ]}>
                    {React.createElement(Icon, { 
                      width: 24, 
                      height: 24,
                      strokeColor: color,
                    })}
                  </Animated.View>
                )}

                {/* Title */}
                <Text style={styles.modalTitle}>{title}</Text>

                {/* Message */}
                <Text style={styles.modalMessage}>{message}</Text>
              </ScrollView>

              {/* Buttons Container - Fixed at bottom */}
              <View style={styles.buttonsContainer}>
                {/* Confirm Button */}
                {showConfirmButton && (
                  <TouchableOpacity
                    style={[
                      styles.modalConfirmButton,
                      { backgroundColor: color }
                    ]}
                    onPress={onConfirm}
                    activeOpacity={0.8}>
                    <Text style={styles.modalConfirmButtonText}>
                      {confirmText}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Cancel Button */}
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={onCancel}
                  activeOpacity={0.8}>
                  <Text style={styles.modalCancelButtonText}>{cancelText}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ConfirmationModal;

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
    maxHeight: '80%',
    minHeight: 345,
    backgroundColor: '#0A0A14',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    // paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
    flexDirection: 'column',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 8,
    paddingTop: 24,
  },
  buttonsContainer: {
    width: '100%',
    marginTop: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 14,
    color: '#8B8CAD',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
    lineHeight: 20,
  },
  modalConfirmButton: {
    width: '100%',
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalConfirmButtonText: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 14,
    color: '#FFFFFF',
  },
  modalCancelButton: {
    width: '100%',
    height: 36,
    backgroundColor: '#000000',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButtonText: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 14,
    color: '#FFFFFF',
  },
});

