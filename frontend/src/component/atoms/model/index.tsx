import React from 'react';
import {
  TouchableWithoutFeedback,
  View,
  StyleSheet,
  Modal,
  DimensionValue,
} from 'react-native';
import colors from '../../../constants/color';

interface ModalPorpsType {
  visible: boolean;
  onPressOut?: () => void;
  children?: React.ReactNode;
  box?: boolean;
  backgroundOpacity?: number;
  animationType?: 'fade' | 'none' | 'slide';
  boxWidth?: DimensionValue;
  padding?: DimensionValue;
  paddingVertical?: DimensionValue;
  ref?: any;
  bgColor?: any;
  height?: any;
  overflow?: "visible" | "hidden" | "scroll";
  isCenter?: boolean;
}

const RNModal = (props: ModalPorpsType) => {
  const {
    onPressOut,
    visible,
    children,
    box,
    backgroundOpacity = 0.8,
    animationType = 'fade',
    boxWidth = '80%',
    padding,
    ref,
    bgColor,
    isCenter,
    paddingVertical,
    overflow,
    height
  } = props;

  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      ref={ref}>
      <View
        style={{
          flex: 1,
          justifyContent: isCenter ? 'flex-start' : 'center',
          alignItems: isCenter ? 'flex-start' : 'center',
        }}>
        <TouchableWithoutFeedback onPress={onPressOut}>
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: `rgba(0, 0, 0, ${backgroundOpacity})` },
            ]}
          />
        </TouchableWithoutFeedback>
        {box ? (
          <View
            style={{
              backgroundColor: bgColor ?? colors.white,
              width: boxWidth,
              borderRadius: 10,
              overflow: overflow,
              alignItems: 'center',
              paddingVertical: padding ? undefined : paddingVertical === undefined ? 20 : paddingVertical,
              padding: padding,
              height: height
            }}>
            {children}
          </View>
        ) : (
          children
        )}
      </View>
    </Modal>
  );
};

export default RNModal;
