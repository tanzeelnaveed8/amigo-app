import { useCallback, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

type Options = {
  offsetY?: number;
  durationMs?: number;
  delayMs?: number;
};

export default function useTopEnterAnim(options: Options = {}) {
  const { offsetY = -40, durationMs = 520, delayMs = 80 } = options;
  const enterAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      enterAnim.setValue(0);
      const timer = setTimeout(() => {
        Animated.timing(enterAnim, {
          toValue: 1,
          duration: durationMs,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      }, Math.max(0, delayMs));
      return () => clearTimeout(timer);
    }, [delayMs, durationMs, enterAnim]),
  );

  return {
    opacity: enterAnim,
    transform: [
      {
        translateY: enterAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [offsetY, 0],
        }),
      },
    ],
  } as const;
}

