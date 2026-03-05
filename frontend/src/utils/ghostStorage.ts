import AsyncStorage from '@react-native-async-storage/async-storage';

const GHOST_NAME_KEY = '@ghost_name';
const GHOST_AVATAR_COLOR_KEY = '@ghost_avatar_color';
const GHOST_LOGGED_IN_KEY = '@ghost_logged_in';

/**
 * Save ghost mode login data
 */
export const saveGhostLogin = async (ghostName: string, avatarBgColor: string) => {
  try {
    await AsyncStorage.multiSet([
      [GHOST_NAME_KEY, ghostName],
      [GHOST_AVATAR_COLOR_KEY, avatarBgColor],
      [GHOST_LOGGED_IN_KEY, 'true'],
    ]);
  } catch (error) {
    console.error('Error saving ghost login:', error);
  }
};

/**
 * Get ghost mode login data
 */
export const getGhostLogin = async (): Promise<{
  ghostName: string | null;
  avatarBgColor: string | null;
  isLoggedIn: boolean;
}> => {
  try {
    const [ghostName, avatarBgColor, isLoggedIn] = await AsyncStorage.multiGet([
      GHOST_NAME_KEY,
      GHOST_AVATAR_COLOR_KEY,
      GHOST_LOGGED_IN_KEY,
    ]);

    return {
      ghostName: ghostName[1],
      avatarBgColor: avatarBgColor[1],
      isLoggedIn: isLoggedIn[1] === 'true',
    };
  } catch (error) {
    console.error('Error getting ghost login:', error);
    return {
      ghostName: null,
      avatarBgColor: null,
      isLoggedIn: false,
    };
  }
};

/**
 * Clear ghost mode login data (logout)
 */
export const clearGhostLogin = async () => {
  try {
    await AsyncStorage.multiRemove([
      GHOST_NAME_KEY,
      GHOST_AVATAR_COLOR_KEY,
      GHOST_LOGGED_IN_KEY,
    ]);
  } catch (error) {
    console.error('Error clearing ghost login:', error);
  }
};





