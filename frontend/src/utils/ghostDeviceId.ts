import * as Application from 'expo-application';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const DEVICE_ID_KEY = '@ghost_device_id';

export const getGhostDeviceId = async (): Promise<string> => {
  try {
    const storedId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (storedId) {
      return storedId;
    }

    let deviceId: string;
    try {
      const installId = Platform.OS === 'android'
        ? Application.getAndroidId()
        : await Application.getIosIdForVendorAsync();
      deviceId = `ghost_${installId || Date.now()}`;
    } catch (error) {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      deviceId = `ghost_${timestamp}_${random}`;
    }

    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    return deviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    return `ghost_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
};
