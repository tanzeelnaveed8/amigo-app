import { DimensionValue, Text } from 'react-native';
import React from 'react';
import useMergedStyle from './style';

export interface textProps {
  label?: any;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  paddingHorizontal?: number;
  backgroundColor?: string;
  textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  textDecorationLine?:
  | 'none'
  | 'underline'
  | 'line-through'
  | 'underline line-through';
  marginTop?: number;
  width?: DimensionValue;
  maxWidth?: DimensionValue;
  opacity?: number;
  numberOfLines?: number;
  marginVertical?: any;
  fontWeight?: any;
  alignSelf?: any;
  lineHeight?: any;
  attachedItem?: React.ReactNode;
  onLongPress?: (e: any) => void;
  style?: any;
  adjustsFontSizeToFit?: boolean;
  minimumFontScale?: number;
}

const RNText = (props: textProps) => {
  const { onLongPress, label, numberOfLines, alignSelf, attachedItem, style, adjustsFontSizeToFit, minimumFontScale } = props;
  const { styles } = useMergedStyle(props);
  return (
    <Text onLongPress={onLongPress}
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
      minimumFontScale={minimumFontScale}
      style={[styles.text, { alignSelf: alignSelf }, style]}>
      {label}{attachedItem}
    </Text>
  );
};
export default RNText;
