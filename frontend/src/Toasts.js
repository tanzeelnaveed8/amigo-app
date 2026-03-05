import Toast from 'react-native-toast-message';
export const Toasts=(text)=>{
    Toast.show({
        type: 'success',
        text1: 'Text copied',
        text2: text
      });
}