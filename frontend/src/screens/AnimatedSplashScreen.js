import React, { useState, useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { Ghost } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
const AnimatedSplashScreen = ({ navigation }) => {
  const [showSplash, setShowSplash] = useState(true);
  const userData = useSelector((state) => state.loginData);

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.1);
  const floatY = useSharedValue(0);

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(8, { duration: 1250, easing: Easing.inOut(Easing.ease) }),
        withTiming(-8, { duration: 1250, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    // Step 1: Smooth fade in with subtle scale
    opacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    scale.value = withDelay(300, withSpring(1, { damping: 20, stiffness: 300 }));

    const timeout = setTimeout(() => {
      setShowSplash(false);

      const hasUser = userData?.data?.userName || userData?.token;
      if (hasUser) {
        navigation.replace('MyDrawer');
      } else {
        navigation.replace('ChooseModeScreen');
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  if (!showSplash) return null;

  return (
    <LinearGradient
      colors={['#050509', '#141426']}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}>
      <Animated.View style={[styles.content, animatedStyle]}>
        <Animated.View style={[styles.iconWrap, floatStyle]}>
          <Ghost size={120} color="#9B7BFF" strokeWidth={1.5} fill="#9B7BFF" />
        </Animated.View>
        <Text style={styles.title}>Ghost Mode</Text>
        <Text style={styles.tagline}>Anonymous · Temporary · Free</Text>
      </Animated.View>
    </LinearGradient>
  );
};

export default AnimatedSplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
    letterSpacing: 0.3,
  },
  tagline: {
    fontSize: 14,
    color: '#8B8CAD',
    marginTop: 8,
    fontWeight: '500',
  },
});
