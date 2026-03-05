import React, {useRef} from 'react';
import {
  Animated,
  DimensionValue,
  FlexAlignType,
  StyleProp,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import colors from '../../../constants/color';
import {getHeightInPercentage} from '../../../utils/dimensions';
import RNText from '../text/index';
import useMergedStyle from './style';

export interface ButtonPropsType {
  width?: DimensionValue;
  height?: DimensionValue;
  fontSize?: number;
  backgroundColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  marginTop?: number;
  borderColor?: string;
  alignSelf?: 'auto' | FlexAlignType;
  title: string;
  onPress?: () => void;
  onPress1?: () => void;
  disabled?: any;
  fontFamily?: string;
  color?: string;
  rightImage?: boolean;
  leftImage?: React.ReactNode;
  marginBottom?: number;
  borderRightWidth?: number;
  borderLeftWidth?: number;
  copiloatorder?: any;
  copiloatname?: any;
  copiloattext?: any;
  icon?: any;
  fontWeight?: any;
  textAlign?: any;
  redDot?: any;
  loader?: any;
  marginHorizontal?: any;
  style?: StyleProp<ViewStyle>;
}

const Button = (props: ButtonPropsType) => {
  const {
    title,
    onPress,
    fontSize,
    disabled,
    fontFamily,
    color,
    rightImage,
    leftImage,
    icon,
    style,
    fontWeight,
    textAlign,
    redDot,
    loader,
  } = props;
  const {styles} = useMergedStyle(props);
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.96,
      friction: 5,
      tension: 300,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}>
      <Animated.View style={[styles.container, style, {transform: [{scale: scaleValue}]}]}>
        {leftImage ? leftImage : null}
        {rightImage}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          {redDot ? (
            <View
              style={{
                height: 10,
                width: 10,
                borderRadius: 20,
                backgroundColor: colors.red,
                position: 'absolute',
                zIndex: 1,
              }}
            />
          ) : null}
          {loader ? (
            loader
          ) : (
            <RNText
              label={title}
              color={color ?? '#FFFFFF'}
              fontSize={fontSize ?? getHeightInPercentage(2.5)}
              fontFamily={fontFamily}
              fontWeight={fontWeight}
              textAlign={textAlign}
              paddingHorizontal={redDot ? 12 : 8}
            />
          )}
          {icon && <View style={{left: 0}}>{icon}</View>}
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

export default Button;
