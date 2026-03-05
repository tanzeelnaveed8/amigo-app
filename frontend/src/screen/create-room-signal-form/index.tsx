import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  SafeAreaView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { Image as FastImage } from 'expo-image';
import { ArrowLeft, Camera, Image as ImageIcon } from 'lucide-react-native';
import useNavigationHook from '../../hooks/use_navigation';
import Context from '../../context';
import * as ImagePicker from '../../utils/imagePickerCompat';
import { _isEmpty } from '../../utils/helper';
import useTopEnterAnim from '../../hooks/useTopEnterAnim';

const CreateRoomSignalFormScreen = () => {
  const navigation = useNavigationHook();
  const { colors, conversationType, setToastMsg } = useContext(Context);
  const isDark = colors?.bgColor === '#0A0A14' || (colors?.bgColor && String(colors.bgColor).includes('0A0A'));
  const accent = colors?.accentColor ?? '#9B7BFF';
  const enterStyle = useTopEnterAnim({ offsetY: -40 });

  const isRoom = conversationType === 'GROUP';
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [description, setDescription] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [imageAsset, setImageAsset] = useState<{ uri: string; type: string; name: string } | null>(null);

  const openGallery = () => {
    ImagePicker.launchImageLibrary({ mediaType: 'photo' }, (response: any) => {
      if (response?.didCancel || response?.error) return;
      const asset = response?.assets?.[0];
      if (!asset?.uri) return;
      setProfilePicture(asset.uri);
      setImageAsset({
        uri: asset.uri,
        type: asset.type ?? asset.mimeType ?? 'image/jpeg',
        name: asset.fileName ?? 'userImage.jpg',
      });
    });
  };

  const handleContinue = () => {
    if (_isEmpty(name?.trim())) {
      setToastMsg?.('Please enter a name');
      return;
    }
    if (!isRoom && _isEmpty(username?.trim())) {
      setToastMsg?.('Please enter a username for the Signal');
      return;
    }
    if (_isEmpty(description?.trim())) {
      setToastMsg?.('Please enter a description');
      return;
    }
    navigation.navigate('AddMemberScreen', {
      fromCreateFlow: true,
      createForm: {
        name: name.trim(),
        ...(isRoom ? {} : { username: username.trim().replace(/^@/, '') }),
        bio: description.trim(),
        imageAsset,
      },
    });
  };

  const bg = isDark ? '#0A0A14' : '#FAFAFA';
  const cardBg = isDark ? '#141422' : '#FFFFFF';
  const border = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const textPrimary = isDark ? '#FFFFFF' : '#111827';
  const textSecondary = isDark ? '#8B8CAD' : '#6B7280';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <Animated.View style={[styles.container, enterStyle]}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}>
            <ArrowLeft size={21} color={isDark ? '#FFFFFF' : '#111827'} />
          </Pressable>
          <Text style={[styles.titleLine, { color: textPrimary }]}>Create</Text>
          <Text style={[styles.titleAccent, { color: accent }]}>{isRoom ? 'Room' : 'Signal'}</Text>
          <Text style={[styles.subtitle, { color: textSecondary }]}>Set up your {isRoom ? 'room' : 'signal'} details</Text>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Picture upload - uisample style */}
          <View style={styles.pictureSection}>
            <Pressable onPress={openGallery} style={[styles.avatarWrap, { borderColor: profilePicture ? accent : border }]}>
              {profilePicture ? (
                <FastImage source={{ uri: profilePicture }} style={styles.avatarImg} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: cardBg }]}>
                  <ImageIcon size={28} color={textSecondary} />
                </View>
              )}
              <View style={[styles.cameraBadge, { backgroundColor: accent }]}>
                <Camera size={16} color="#FFFFFF" />
              </View>
            </Pressable>
            <Text style={[styles.uploadLabel, { color: textSecondary }]}>Upload {isRoom ? 'room' : 'signal'} picture</Text>
          </View>

          {/* Name */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: textPrimary }]}>
              {isRoom ? 'Room Name' : 'Display Name'} <Text style={{ color: accent }}>*</Text>
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={isRoom ? 'e.g., Team Project' : 'e.g., Tech Updates'}
              placeholderTextColor={textSecondary}
              style={[styles.input, { backgroundColor: cardBg, borderColor: border, color: textPrimary }]}
            />
          </View>

          {/* Username - Signal only */}
          {!isRoom && (
            <View style={styles.fieldWrap}>
              <Text style={[styles.label, { color: textPrimary }]}>
                Username <Text style={{ color: accent }}>*</Text>
              </Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="e.g., tech_updates"
                placeholderTextColor={textSecondary}
                style={[styles.input, { backgroundColor: cardBg, borderColor: border, color: textPrimary }]}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={[styles.uploadLabel, { color: textSecondary, marginTop: 4 }]}>
                Shown as @{username || 'username'}
              </Text>
            </View>
          )}

          {/* Description */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: textPrimary }]}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder={isRoom ? 'What is this room about?' : 'What will you share in this Signal?'}
              placeholderTextColor={textSecondary}
              style={[styles.input, styles.textArea, { backgroundColor: cardBg, borderColor: border, color: textPrimary }]}
              multiline
              numberOfLines={3}
            />
          </View>

          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => [styles.continueBtn, { backgroundColor: accent }, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
          </Pressable>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

export default CreateRoomSignalFormScreen;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 8 : 0 },
  header: { paddingBottom: 24 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -4,
    marginBottom: 20,
  },
  titleLine: { fontSize: 32, fontWeight: '700', marginBottom: 2 },
  titleAccent: { fontSize: 32, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 15, marginTop: 4 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 48 },
  pictureSection: { alignItems: 'center', marginBottom: 24 },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadLabel: { fontSize: 13, marginTop: 10 },
  fieldWrap: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  textArea: { minHeight: 88, textAlignVertical: 'top' },
  continueBtn: {
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  continueBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
