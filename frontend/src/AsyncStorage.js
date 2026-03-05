import AsyncStorage from '@react-native-async-storage/async-storage';

export const setAccessToken = async (value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem('token', jsonValue);
    } catch (e) {
      // saving error
      throw e
    }
  };

export const getAccessToken=async ()=>{
  try {
   let acesstoken= await AsyncStorage.getItem('token') 
   let token =JSON.parse(acesstoken)
   return token;
  } catch (error) {
    throw error
  }
}

export const removeAccessToken=async ()=>{
  try {
    await AsyncStorage.removeItem('token')
  } catch (error) {
    throw error
  }
}

