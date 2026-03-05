import { Dimensions, PixelRatio, Platform, } from 'react-native';
const { width, height } = Dimensions.get('window');

const getHeightInPercentage = (value?: number) => {
  const isGalaxyS7 = Platform.OS === 'android' && height === 592;
  if (value) {
    if (isGalaxyS7) {
      const h = PixelRatio.roundToNearestPixel(height * value / 107);
      return h;
    }
    const h = PixelRatio.roundToNearestPixel(height * value / 100);
    return h;
  }
  return height;
};

const getWidthInPercentage = (value?: number) => {
  if (value) {
    const w = PixelRatio.roundToNearestPixel(width * value / 100);
    return w;
  }
  return width;
};
export { getHeightInPercentage, getWidthInPercentage };
