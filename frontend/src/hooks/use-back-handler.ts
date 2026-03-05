import { NavigationProp } from '@react-navigation/native';
import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { RootStackParamList } from './use_navigation';

export default function useBackHandler(
  navigation: NavigationProp<RootStackParamList>,
  isDisable?: boolean,
) {
  useEffect(() => {
    const backAction = (e: any) => {
      if (isDisable) {
        return false;
      }
      if (navigation.isFocused()) {
        e.preventDefault();
        BackHandler.exitApp();
      }
      return true;
    };
    navigation.addListener('beforeRemove', backAction);
    return () => {
      navigation.removeListener('beforeRemove', backAction);
    };
  }, [navigation, isDisable]);
}
