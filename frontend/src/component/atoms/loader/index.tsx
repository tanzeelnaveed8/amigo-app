import { ActivityIndicator, Animated, StyleSheet, View } from 'react-native';
import React, { useContext, useEffect, useRef } from 'react';
import Context from '../../../context';

const Loader = () => {
  const { loader, colors } = useContext(Context);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (loader) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [loader]);

  return loader ? (
    <View style={[StyleSheet.absoluteFill, styles.overlay]}>
      <Animated.View
        style={[
          styles.loaderBox,
          { backgroundColor: colors.primary, transform: [{ scale: pulseAnim }] },
        ]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </Animated.View>
    </View>
  ) : null;
};

export default Loader;

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderBox: {
    width: 70,
    height: 70,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
});
