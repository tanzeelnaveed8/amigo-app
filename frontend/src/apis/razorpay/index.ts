import axios from 'axios';
import { BASE_URL } from '../base_url';

const RAZORPAY_BASE = '/razorpay';

export const createRazorpayOrder = async (data: {
  amount: number;
  currency?: string;
  phoneNumber: string;
}) => {
  const url = BASE_URL + RAZORPAY_BASE + '/create-order';
  try {
    const response = await axios.post(url, {
      amount: data.amount * 100,
      currency: data.currency || 'INR',
      phoneNumber: data.phoneNumber,
    }, { timeout: 15000 });
    return response.data;
  } catch (error: any) {
    console.log('CreateOrder API Error:', error?.response?.data || error?.message);
    throw error;
  }
};

export const verifyRazorpayPayment = async (data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => {
  const url = BASE_URL + RAZORPAY_BASE + '/verify-payment';
  try {
    const response = await axios.post(url, data, { timeout: 15000 });
    return response.data;
  } catch (error: any) {
    console.log('VerifyPayment API Error:', error?.response?.data || error?.message);
    throw error;
  }
};
