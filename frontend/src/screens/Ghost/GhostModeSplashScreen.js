import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import GhostIcon from '../../assets/svg/GhostIcon';
import { FontFamily } from '../../../GlobalStyles';
import { getGhostLogin } from '../../utils/ghostStorage';

const GhostModeSplashScreen = ({ navigation }) => {
  // Floating animation for Ghost Icon
  const floatAnim = useRef(new Animated.Value(0)).current;
  
  // Fade-in animations for texts
  const primaryTextOpacity = useRef(new Animated.Value(0)).current;
  const secondaryTextOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create a smooth, slow oscillating animation
    const animate = () => {
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };
    animate();
  }, [floatAnim]);

  useEffect(() => {
    // Animate text fade-in: primary first, then secondary
    Animated.sequence([
      // Delay before primary text appears
      Animated.delay(300),
      // Fade in primary text
      Animated.timing(primaryTextOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // Delay before secondary text appears
      Animated.delay(200),
      // Fade in secondary text
      Animated.timing(secondaryTextOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [primaryTextOpacity, secondaryTextOpacity]);

  // Interpolate the animation value to create smooth vertical movement
  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-5, 5], // Moves 5px up and down
  });

  useEffect(() => {
    const checkGhostLogin = async () => {
      try {
        const ghostData = await getGhostLogin();
        
        // If user is already logged in to ghost mode, go directly to home
        if (ghostData.isLoggedIn && ghostData.ghostName && ghostData.avatarBgColor) {
          navigation.replace('GhostModeHomeScreen', {
            ghostName: ghostData.ghostName,
            avatarBgColor: ghostData.avatarBgColor,
          });
        } else {
          // Otherwise, go to welcome screen
          navigation.replace('WelcomeToGhostMode');
        }
      } catch (error) {
        console.error('Error checking ghost login:', error);
        // On error, go to welcome screen
        navigation.replace('WelcomeToGhostMode');
      }
    };

    // Check login status after a brief delay
    const timeout = setTimeout(() => {
      checkGhostLogin();
    }, 2000);

    return () => clearTimeout(timeout);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ translateY }],
            },
          ]}>
          <GhostIcon />
        </Animated.View>
        <Animated.Text style={[styles.primaryText, { opacity: primaryTextOpacity }]}>
          Ghost Mode
        </Animated.Text>
        <Animated.Text style={[styles.secondaryText, { opacity: secondaryTextOpacity }]}>
          Anonymous · Temporary · Free
        </Animated.Text>
      </View>
    </View>
  );
};

export default GhostModeSplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
  },
  primaryText: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.8,
    color: '#FFFFFF',
    marginTop: 24,
    textAlign: 'center',
  },
  secondaryText: {
    fontFamily: FontFamily.robotoMedium,
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
    color: '#808080',
    marginTop: 12,
    textAlign: 'center',
  },
});

