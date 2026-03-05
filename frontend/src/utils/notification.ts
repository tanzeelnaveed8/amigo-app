import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#397CEA',
    sound: 'default',
  });

  Notifications.setNotificationChannelAsync('messages', {
    name: 'Messages',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#397CEA',
    sound: 'default',
  });
}

export async function requestUserPermission() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus === 'granted') {
      console.log('Notification permission granted');
      await getToken();
    } else {
      console.log('Notification permission not granted');
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.log('Error requesting notification permission:', error);
    return false;
  }
}

const getToken = async () => {
  try {
    let token = await AsyncStorage.getItem('FCMToken');
    if (!token) {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        console.log(
          'Missing EAS projectId — push token cannot be generated. Run "eas project:init" or add extra.eas.projectId to app.json.',
        );
        return null;
      }
      const pushToken = await Notifications.getExpoPushTokenAsync({ projectId });
      if (pushToken?.data) {
        console.log('New push token generated:', pushToken.data);
        await AsyncStorage.setItem('FCMToken', pushToken.data);
        return pushToken.data;
      }
    } else {
      return token;
    }
  } catch (error) {
    console.log('Error while fetching/saving token:', error);
  }
  return null;
};

export const getFCMToken = async (): Promise<string | null> => {
  return getToken();
};

let notificationResponseSubscription: Notifications.Subscription | null = null;
let notificationReceivedSubscription: Notifications.Subscription | null = null;

export const NotificationListener = async (
  onNotificationTap?: (data: any) => void,
) => {
  // Clean up existing subscriptions
  if (notificationResponseSubscription) {
    notificationResponseSubscription.remove();
  }
  if (notificationReceivedSubscription) {
    notificationReceivedSubscription.remove();
  }

  // Handle notification taps (foreground + background + terminated)
  notificationResponseSubscription =
    Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      console.log('Notification tapped:', data);
      if (onNotificationTap) {
        onNotificationTap(data);
      }
    });

  // Handle foreground notifications
  notificationReceivedSubscription =
    Notifications.addNotificationReceivedListener((notification) => {
      console.log('Foreground notification:', notification.request.content);
    });

  // Check if app was opened from a notification (terminated state)
  const lastNotification = await Notifications.getLastNotificationResponseAsync();
  if (lastNotification) {
    const data = lastNotification.notification.request.content.data;
    console.log('App opened from notification (terminated):', data);
    if (onNotificationTap) {
      setTimeout(() => {
        onNotificationTap(data);
      }, 1000);
    }
  }
};

export const removeNotificationListeners = () => {
  if (notificationResponseSubscription) {
    notificationResponseSubscription.remove();
    notificationResponseSubscription = null;
  }
  if (notificationReceivedSubscription) {
    notificationReceivedSubscription.remove();
    notificationReceivedSubscription = null;
  }
};

export const setBadgeCount = async (count: number) => {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.log('Error setting badge count:', error);
  }
};

export const clearBadgeCount = async () => {
  await setBadgeCount(0);
};

export const scheduleLocalNotification = async (
  title: string,
  body: string,
  data?: any,
) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
      sound: 'default',
      ...(Platform.OS === 'android' && { channelId: 'messages' }),
    },
    trigger: null,
  });
};
