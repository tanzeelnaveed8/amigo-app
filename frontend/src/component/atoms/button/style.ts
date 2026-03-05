import { StyleSheet } from 'react-native';
import { ButtonPropsType } from "./index";
import colors from '../../../constants/color';
import { getWidthInPercentage } from '../../../utils/dimensions';

const useMergedStyle = (props: ButtonPropsType) => {
  const {
    width,
    height,
    backgroundColor = colors.white,
    borderWidth,
    borderColor,
    borderRadius,
    marginTop,
    alignSelf,
    marginBottom,
    borderRightWidth,
    borderLeftWidth, marginHorizontal
  } = props;
  const styles = StyleSheet.create({
    container: {
      width: width ?? '100%',
      height: height ?? 48,
      borderRadius: borderRadius ?? 5,
      backgroundColor: backgroundColor ?? colors.transparent,
      borderWidth: borderWidth ?? 1.5,
      borderColor: borderColor,
      alignSelf: alignSelf,
      marginTop: marginTop ?? 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: marginBottom,
      borderRightWidth: borderRightWidth,
      borderLeftWidth: borderLeftWidth,
      shadowOpacity: 0.3,
      shadowOffset: {
        height: 5,
        width: 5
      },
      marginHorizontal: marginHorizontal

    },
    image: {
      width: getWidthInPercentage(7),
      height: getWidthInPercentage(7),
      resizeMode: 'contain',
      marginRight: getWidthInPercentage(12),
      position: 'absolute',
      left: getWidthInPercentage(8),
    },
  });
  return { styles };
};
export default useMergedStyle;
