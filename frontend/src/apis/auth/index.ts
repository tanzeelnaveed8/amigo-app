import axios from 'axios';
import {
    AUTH_BASE,
    AUTH_BASE_USER,
    BASE_URL,
    CHECK_PHONE,
    CREATE_USER,
    DELETE_ACCOUNT,
    GET_INVITE_CODE,
    GET_MEDIA,
    IMAGE_UPLOAD,
    LOGIN,
    MEDIA_BASE,
    SEARCH_USER,
    SEND_EMAIL_OTP,
    SEND_SMS_OTP,
    UPDATE_PROFILE,
    UPDATE_USER_PROFILE,
    VERIFY_EMAIL_OTP,
    VERIFY_INVITE_CODE,
    VERIFY_OTP,
    VERIFY_SMS_OTP,
} from '../base_url';

export const RegisterPhone = async (data: any) => {
  const url = BASE_URL + AUTH_BASE + SEND_SMS_OTP;
  const response = await axios.post(url, data);
  return response.data;
};

export const Login = async (data: any) => {
  const url = BASE_URL + AUTH_BASE + LOGIN;

  try {
    const response = await axios.post(url, data);
    return response.data;
  } catch (error: any) {
    console.log('Login API Error Details:');
    throw error;
  }
};

export const VerifyOtp = async (data: any) => {
  const url = BASE_URL + AUTH_BASE + VERIFY_OTP;
  const response = await axios.post(url, data);
  return response.data;
};

export const CreateUser = async (data: any) => {
  const url = BASE_URL + AUTH_BASE + CREATE_USER;

  try {
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    console.log('CreateUser API Error Details:');
    console.log('Status:', error?.response?.status);
    console.log('Status Text:', error?.response?.statusText);
    console.log('Error Data:', error?.response?.data);
    console.log('Error Message:', error?.message);
    throw error;
  }
};

export const UpdateProfile = async (data: any) => {
  const url = BASE_URL + AUTH_BASE_USER + UPDATE_PROFILE;
  const response = await axios.patch(url, data);
  return response.data;
};

export const UploadImage = async (data: any) => {
  const url = BASE_URL + AUTH_BASE + IMAGE_UPLOAD;
  const response = await axios.post(url, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getUploadedImage = async (data: any) => {
  const url = BASE_URL + MEDIA_BASE + GET_MEDIA;
  const response = await axios.post(url, data);
  return response.data;
};

export const DeleteAccount = async (data: any) => {
  const url = BASE_URL + AUTH_BASE + DELETE_ACCOUNT;
  const response = await axios.post(url, data);
  return response.data;
};

export const UpdateUserPic = async (data: any) => {
  const url = BASE_URL + AUTH_BASE + UPDATE_USER_PROFILE;
  const response = await axios.post(url, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const Searchuser = async (data: any) => {
  const url = BASE_URL + AUTH_BASE_USER + SEARCH_USER;
  const response = await axios.post(url, data);
  return response.data;
};

export const SendMsg91Otp = async (data: any) => {
  const url = BASE_URL + AUTH_BASE + SEND_SMS_OTP;
  try {
    const response = await axios.post(url, data);
    return response.data;
  } catch (error: any) {
    console.log('SendMsg91Otp API Error Details:');
    console.log('Status:', error?.response?.status);
    console.log('Status Text:', error?.response?.statusText);
    console.log('Error Data:', error?.response?.data);
    console.log('Error Message:', error?.message);
    throw error;
  }
};

export const VerifyMsg91Otp = async (data: any) => {
  const url = BASE_URL + AUTH_BASE + VERIFY_SMS_OTP;
  try {
    const response = await axios.post(url, data);
    return response.data;
  } catch (error: any) {
    console.log('VerifyMsg91Otp API Error Details:');
    console.log('Status:', error?.response?.status);
    console.log('Status Text:', error?.response?.statusText);
    console.log('Error Data:', error?.response?.data);
    console.log('Error Message:', error?.message);
    throw error;
  }
};

export const CheckPhone = async (data: any) => {
  const url = BASE_URL + AUTH_BASE + CHECK_PHONE;
  try {
    const response = await axios.post(url, data);
    return response.data;
  } catch (error: any) {
    console.log('CheckPhone API Error Details:');
    console.log('Status:', error?.response?.status);
    console.log('Status Text:', error?.response?.statusText);
    console.log('Error Data:', error?.response?.data);
    console.log('Error Message:', error?.message);
    throw error;
  }
};

export const VerifyInviteCode = async (data: any) => {
  const url = BASE_URL + AUTH_BASE + VERIFY_INVITE_CODE;
  try {
    const response = await axios.post(url, data);
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const GetInviteCode = async () => {
  const url = BASE_URL + AUTH_BASE + GET_INVITE_CODE;
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error: any) {
    console.log('GetInviteCode API Error Details:');
    console.log('Status:', error?.response?.status);
    console.log('Status Text:', error?.response?.statusText);
    console.log('Error Data:', error?.response?.data);
    console.log('Error Message:', error?.message);
    throw error;
  }
};

export const GetAvailableInviteCode = async () => {
  const url = BASE_URL + AUTH_BASE + '/get-available-invite-code';
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error: any) {
    console.log('GetAvailableInviteCode Error:', error?.response?.data);
    throw error;
  }
};

export const GetInviteCodeByUserId = async (userId: string) => {
  const url = BASE_URL + AUTH_BASE + GET_INVITE_CODE + `/${userId}`;
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error: any) {
    console.log('GetInviteCodeByUserId API Error Details:');
    console.log('Status:', error?.response?.status);
    console.log('Error Data:', error?.response?.data);
    throw error;
  }
};

export const SendEmailOtp = async (data: any) => {
  const url = BASE_URL + AUTH_BASE + SEND_EMAIL_OTP;
  try {
    const response = await axios.post(url, data);
    return response.data;
  } catch (error: any) {
    console.log('SendEmailOtp API Error Details:');
    console.log('Status:', error?.response?.status);
    console.log('Status Text:', error?.response?.statusText);
    console.log('Error Data:', error?.response?.data);
    console.log('Error Message:', error?.message);
    throw error;
  }
};

export const VerifyEmailOtp = async (data: any) => {
  const url = BASE_URL + AUTH_BASE + VERIFY_EMAIL_OTP;
  try {
    const response = await axios.post(url, data);
    return response.data;
  } catch (error: any) {
    console.log('VerifyEmailOtp API Error Details:');
    console.log('Status:', error?.response?.status);
    console.log('Status Text:', error?.response?.statusText);
    console.log('Error Data:', error?.response?.data);
    console.log('Error Message:', error?.message);
    throw error;
  }
};
