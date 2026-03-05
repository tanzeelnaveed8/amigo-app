import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView,
  BackHandler,
  KeyboardAvoidingView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {LinearGradient} from 'expo-linear-gradient';
import BackButtonIcon from '../../assets/svg/BackButtonIcon';
import RandomIcon from '../../assets/svg/RandomIcon';
import { FontFamily } from '../../../GlobalStyles';
import { saveGhostLogin } from '../../utils/ghostStorage';

// Random color generator for avatar
const generateRandomColor = () => {
  const colors = [
    '#155DFC', '#9B7BFF', '#FF6B6B', '#4ECDC4', '#45B7D1',
    '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    '#F8B739', '#E74C3C', '#3498DB', '#2ECC71', '#F39C12',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Generate initials from name
const getInitials = (name) => {
  if (!name || name.trim().length === 0) return 'G';
  
  const words = name.trim().split(/\s+/).filter(word => word.length > 0);
  
  if (words.length === 0) return 'G';
  if (words.length === 1) {
    const firstChar = words[0][0].toUpperCase();
    return firstChar.length > 0 ? firstChar : 'G';
  }
  
  // Get first letter of first word and first letter of last word
  const firstInitial = words[0][0].toUpperCase();
  const lastInitial = words[words.length - 1][0].toUpperCase();
  return `${firstInitial}${lastInitial}`;
};

// Generate random ghost name
const generateRandomGhostName = () => {
  const adjectives = [
    'Silent', 'Shadow', 'Mystic', 'Phantom', 'Ethereal', 'Whisper',
    'Dark', 'Hidden', 'Secret', 'Ghostly', 'Invisible', 'Unknown',
    'Stealth', 'Quiet', 'Elusive', 'Veiled', 'Cryptic', 'Enigmatic'
  ];
  
  const nouns = [
    'Ghost', 'Spirit', 'Shadow', 'Phantom', 'Specter', 'Wraith',
    'Soul', 'Entity', 'Presence', 'Being', 'Wanderer', 'Traveler',
    'Seeker', 'Watcher', 'Guardian', 'Keeper', 'Walker', 'Hunter'
  ];
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  // Calculate available space for number (format: "adjective noun number")
  // Total length = adjective.length + 1 (space) + noun.length + 1 (space) + number.length
  const baseLength = adjective.length + 1 + noun.length + 1; // spaces included
  const availableLength = 20 - baseLength; // max 20 chars total
  
  // Generate number that fits within available space
  let number;
  if (availableLength >= 3) {
    // Can fit up to 3-digit number (1-999)
    number = Math.floor(Math.random() * 999) + 1;
  } else if (availableLength === 2) {
    // Can fit up to 2-digit number (1-99)
    number = Math.floor(Math.random() * 99) + 1;
  } else {
    // Can only fit 1-digit number (1-9)
    number = Math.floor(Math.random() * 9) + 1;
  }
  
  const name = `${adjective} ${noun} ${number}`;
  
  // Final safety check - ensure name is ≤ 20 characters
  if (name.length > 20) {
    // Fallback: use shorter words if needed
    const shortAdjectives = ['Dark', 'Silent', 'Ghost', 'Shadow'];
    const shortNouns = ['Ghost', 'Soul', 'Spirit', 'Shadow'];
    const fallbackAdj = shortAdjectives[Math.floor(Math.random() * shortAdjectives.length)];
    const fallbackNoun = shortNouns[Math.floor(Math.random() * shortNouns.length)];
    const fallbackBase = fallbackAdj.length + 1 + fallbackNoun.length + 1;
    const fallbackMaxNum = Math.pow(10, Math.max(1, 20 - fallbackBase)) - 1;
    number = Math.min(999, fallbackMaxNum);
    return `${fallbackAdj} ${fallbackNoun} ${number}`;
  }
  
  return name;
};

// Validate ghost name
const isValidGhostName = (name) => {
  if (!name || name.trim().length === 0) return false;
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 20) return false;
  // Allow letters, numbers, spaces, hyphens, and underscores
  const validPattern = /^[a-zA-Z0-9\s\-_]+$/;
  return validPattern.test(trimmed);
};

const ChooseGhostNameScreen = ({ navigation }) => {
  const [ghostName, setGhostName] = useState('');
  const [avatarBgColor, setAvatarBgColor] = useState('#155DFC');
  const scrollViewRef = useRef(null);
  const inputRef = useRef(null);
  const inputLayoutRef = useRef({ y: 0 });

  // Generate a random color once when component mounts
  useEffect(() => {
    const colors = [
      '#155DFC', '#9B7BFF', '#FF6B6B', '#4ECDC4', '#45B7D1',
      '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
      '#F8B739', '#E74C3C', '#3498DB', '#2ECC71', '#F39C12',
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setAvatarBgColor(randomColor);
  }, []); // Only run once on mount

  // Generate a new random color whenever the name changes
  useEffect(() => {
    if (ghostName && ghostName.trim().length > 0) {
      const colors = [
        '#155DFC', '#9B7BFF', '#FF6B6B', '#4ECDC4', '#45B7D1',
        '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
        '#F8B739', '#E74C3C', '#3498DB', '#2ECC71', '#F39C12',
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      setAvatarBgColor(randomColor);
    }
  }, [ghostName]); // Run whenever ghostName changes

  const initials = useMemo(() => getInitials(ghostName), [ghostName]);
  const isValid = useMemo(() => isValidGhostName(ghostName), [ghostName]);

  const handleRandomName = () => {
    const randomName = generateRandomGhostName();
    setGhostName(randomName);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleContinue = async () => {
    if (!isValid || isSaving) return;

    setIsSaving(true);
    try {
      await saveGhostLogin(ghostName.trim(), avatarBgColor);
      navigation.replace('GhostModeHomeScreen', {
        ghostName: ghostName.trim(),
        avatarBgColor: avatarBgColor,
      });
    } catch (error) {
      console.error('Error saving ghost login:', error);
      navigation.replace('GhostModeHomeScreen', {
        ghostName: ghostName.trim(),
        avatarBgColor: avatarBgColor,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    navigation.replace('WelcomeToGhostMode');
  };

  const handleInputFocus = () => {
    // Scroll to input when it's focused to keep it visible above keyboard
    setTimeout(() => {
      if (scrollViewRef.current && inputLayoutRef.current.y > 0) {
        scrollViewRef.current.scrollTo({
          y: inputLayoutRef.current.y - 150, // Offset to show input above keyboard
          animated: true,
        });
      }
    }, 300);
  };

  const handleInputLayout = (event) => {
    const { y } = event.nativeEvent.layout;
    inputLayoutRef.current.y = y;
  };

  // Handle Android back button
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleBack();
        return true; // Prevent default back behavior
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 10}>
        <View style={styles.container}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <BackButtonIcon />
          </TouchableOpacity>

          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag">
          {/* Title */}
          <Text style={styles.title}>Choose Your Ghost Name</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            This is how others will see you in crowds. You can change it anytime.
          </Text>

          {/* Avatar Circle */}
          <View style={styles.avatarContainer}>
            <View style={[styles.avatarCircle, { backgroundColor: avatarBgColor }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>

          {/* Input Field */}
          <View 
            style={styles.inputContainer}
            onLayout={handleInputLayout}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Enter ghost name"
              placeholderTextColor="#5E607E"
              value={ghostName}
              onChangeText={setGhostName}
              onFocus={handleInputFocus}
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={20}
            />
          </View>

          {/* Random Name Option */}
          <TouchableOpacity
            style={styles.randomNameContainer}
            onPress={handleRandomName}
            activeOpacity={0.7}>
            <RandomIcon />
            <Text style={styles.randomNameText}>Random Name</Text>
          </TouchableOpacity>

          {/* Guidelines */}
          <Text style={styles.guidelines}>
            Ghost names can be 2-20 characters. Use letters, numbers, spaces, - or _.
          </Text>
        </ScrollView>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.buttonTouchable}
            onPress={handleContinue}
            disabled={!isValid || isSaving}
            activeOpacity={0.8}>
            <LinearGradient
              colors={['#9B7BFF', '#B88DFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[styles.gradientButton, (!isValid || isSaving) && styles.disabledGradientButton]}>
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Continue</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChooseGhostNameScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    zIndex: 10,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Platform.OS === 'ios' ? 140 : 220,
    paddingBottom: 120, // Increased padding to accommodate keyboard
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 42,
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    color: '#C5C6E3',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#155DFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 32,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    backgroundColor: '#181830',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 20,
    fontFamily: FontFamily.robotoRegular,
    fontSize: 22,
    color: '#FFFFFF',
  },
  randomNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  randomNameText: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 14,
    color: '#9B7BFF',
    marginLeft: 8,
  },
  guidelines: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    color: '#8B8CAD',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    paddingTop: 24,
    paddingHorizontal: 20,
    backgroundColor: '#000000',
  },
  buttonTouchable: {
    width: '100%',
  },
  gradientButton: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9B7BFF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  disabledGradientButton: {
    opacity: 0.5,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  buttonText: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

