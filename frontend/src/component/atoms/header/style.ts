import { Platform, StyleSheet } from 'react-native';
import { HeaderPropType } from '.';
import fontSize from '../../../constants/font-size';
import colors from '../../../constants/color';

export const useMergedStyle = (props: HeaderPropType) => {
  const { color, fontFamily, paddingHorizontal, backgroundColor } = props;
  const styles = StyleSheet.create({
    container: {
      // height: 50,
      marginTop: 10,
      width: '100%',
      resizeMode: 'contain',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: backgroundColor ?? colors.transparent,
      paddingHorizontal: paddingHorizontal, bottom: Platform.OS === 'ios' ? 10 : 0,
    },
    title: {
      color: color ?? colors.white,
      fontSize: fontSize._20,
      fontWeight: 'bold', maxWidth: 200
    },
    image: { height: 30, width: 30, marginRight: 5, borderRadius: 25 },
    hitSlop: {
      top: 15,
      bottom: 15,
      left: 15,
      right: 15,
    },
    hitSlop1: {
      top: 10,
      bottom: 10,
      left: 10,
      right: 10,
    },
    userImage: {
      flexDirection: 'row',
      alignSelf: 'center',
      position: 'absolute',
      justifyContent: 'center',
      width: '100%',
      left: paddingHorizontal,
      zIndex: -1,
    },
  });
  return { styles };
};
