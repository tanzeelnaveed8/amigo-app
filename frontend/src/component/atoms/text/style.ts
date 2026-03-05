import { StyleSheet } from 'react-native';
import { textProps } from './index';
import colors from '../../../constants/color';

const useMergedStyle = (props: textProps) => {
  const {
    color,
    fontFamily,
    fontSize,
    paddingHorizontal,
    backgroundColor,
    textAlign,
    textDecorationLine,
    marginTop,
    width,
    opacity,
    maxWidth,
    fontWeight,
    marginVertical,
    lineHeight
  } = props;
  const styles = StyleSheet.create({
    text: {
      fontFamily: fontFamily,
      color: color ?? colors.black,
      fontSize: fontSize ?? 15,
      paddingHorizontal: paddingHorizontal,
      backgroundColor: backgroundColor ?? colors.transparent,
      textAlign: textAlign,
      textDecorationLine: textDecorationLine,
      marginTop: marginTop,
      width: width,
      opacity: opacity,
      maxWidth: maxWidth,
      fontWeight: fontWeight,
      marginVertical: marginVertical,
      lineHeight: lineHeight
    },
  });
  return { styles };
};

export default useMergedStyle;
