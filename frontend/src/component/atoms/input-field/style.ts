import { StyleSheet } from 'react-native';
import { inputFieldProps } from '.';
import colors from '../../../constants/color';
import { getHeightInPercentage } from '../../../utils/dimensions';
const useMergedStyle = (props: inputFieldProps) => {
  const {
    marginTop,
    height,
    textAlignVertical,
    width,
    countryPicker,
    title,
    backgroundColor,
    borderColor,
    borderWidth, padding,
    borderRadius, color, borderBottomWidth, icon
  } = props;

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      marginTop: marginTop ?? 0,
    },
    contentText: {
      width: width ?? '85%',
      padding: 0,
      color: color ?? '#FFFFFF',
      fontSize: 16,
      height: '100%',
      textAlignVertical: textAlignVertical,
      paddingVertical: 0,
      fontWeight: '600',
      borderColor: colors.white,
      borderBottomWidth: borderBottomWidth, paddingHorizontal: icon ? 30 : 0,
    },
    innerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 15,
      borderWidth: borderWidth ?? 1.5,
      borderColor: borderColor ?? colors.inputBorderColor,
      borderRadius: borderRadius ?? 5,
      backgroundColor: backgroundColor ?? colors.grey,
      height: height ?? getHeightInPercentage(6.5) ?? 58,
      width: width ?? '100%',
      padding: padding,

    },
    body: {
      width: '100%',
      flexDirection: countryPicker ? 'row' : 'column',
      justifyContent: 'space-between',
      marginTop: title ? 10 : 0,
    },
    countryPicker: {
      width: 45,
      height: height,
      backgroundColor: colors.inputBGColor,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 5,
    },

  });
  return styles;
};
export default useMergedStyle;
