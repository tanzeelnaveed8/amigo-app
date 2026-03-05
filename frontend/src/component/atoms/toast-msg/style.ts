import { StyleSheet } from 'react-native';
import { getWidthInPercentage } from '../../../utils/dimensions';

export const styles = StyleSheet.create({
  toastContainer: {
    backgroundColor: '#292929',
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 15,
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    zIndex: 1,
    maxWidth: getWidthInPercentage(80),
  },
});
