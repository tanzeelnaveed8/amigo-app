import React, { useContext, useState } from 'react';
import UserDetailComponent from '../../../component/userdetail-component';
import useNavigationHook from '../../../hooks/use_navigation';
import { useMutation } from 'react-query';
import { CreateUser } from '../../../apis/auth';
import Context from '../../../context';
import { useDispatch, useSelector } from 'react-redux';
import { _isEmpty } from '../../../utils/helper';
import { loginAction } from '../../../redux/actions';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserDetailScreen = () => {
  const navigation = useNavigationHook();
  const route = useRoute()
  const {userData } = route?.params || {}
  const [image, setImage] = useState<any>('');
  // const route = useRoute<any>();
  // const {Data} = route.params;
  const { setLoader, setToastMsg } = useContext(Context);
  const dispatch = useDispatch();
  // const userData: any = useSelector((state: any) => state.loginData);
  console.log(userData)
  const { mutate } = useMutation(CreateUser, {
    onSuccess: async res => {
      console.log('CREATE_USER_SUCCESS:', res);
      setLoader(false);

      // Check for successful creation (status 201)
      if (res.status === 201) {
        try {
          if (res?.refreshToken) {
            await AsyncStorage.setItem('refreshToken', res.refreshToken);
          }
        } catch {}
        dispatch(loginAction({ ...res }));
        navigation.navigate('AccountTypeScreen');
      } else {
        // Handle other status codes as errors
        setToastMsg(res.message || 'User creation failed');
      }
    },
    onError: (error: any) => {
      console.log('CREATE_USER_ERROR:', error);
      setLoader(false);

      // Handle different error types
      if (error?.response?.status === 409) {
        // Conflict error - user already exists or username taken
        const errorMessage = error?.response?.data?.message || 'User already exists or username is taken. Please try a different username.';
        setToastMsg(errorMessage);
      } else if (error?.response?.status === 400) {
        // Bad request - validation error
        const errorMessage = error?.response?.data?.message || 'Please check your information and try again.';
        setToastMsg(errorMessage);
      } else if (error?.response?.status === 500) {
        // Server error
        setToastMsg('Server error. Please try again later.');
      } else if (error?.code === 'NETWORK_ERROR' || !error?.response) {
        // Network error
        setToastMsg('Network error. Please check your internet connection.');
      } else {
        // Generic error
        const errorMessage = error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.';
        setToastMsg(errorMessage);
      }
    },
  });
  // console.log('DataData', Data);
  return (
    <UserDetailComponent
      onPress={async (val: any) => {
        let fcmToken = await AsyncStorage.getItem('FCMToken');

        const formData = new FormData();
        formData.append('firstName', val.firstname.trim());
        formData.append('lastName', val.lastname.trim());
        formData.append('bio', val.bio.trim());
        formData.append('userName', val.username.trim());
        formData.append('password', val.password.trim());
        formData.append('fcmToken', fcmToken);
        formData.append('otpToken', userData?.data?.token);
        formData.append('email', val.email.trim());
        formData.append('phone', userData?.data?.phone);

        if (!_isEmpty(image.path)) {
          formData.append('images', {
            uri: image.path,
            type: image.mime,
            name: 'userImage.jpg',
          } as any);
        }

        setLoader(true);

        // ✅ log values safely
        if (image.path !== undefined) {
          mutate(formData);
        } else {
          setToastMsg('please choose your profile photo');
          setLoader(false);
        }
      }}

      onImage={value => setImage(value)}
    />
  );
};

export default UserDetailScreen;
