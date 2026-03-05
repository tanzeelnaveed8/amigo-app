import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const requestNotificationPermission = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const {status} = await Notifications.requestPermissionsAsync();
  if (status === 'granted') {
    console.log('Authorization status: granted');
  }
};
