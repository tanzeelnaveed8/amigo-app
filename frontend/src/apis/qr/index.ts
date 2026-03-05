import axios from 'axios';
import { BASE_URL, QR_BASE, QR_PAYLOAD, QR_JOIN } from '../base_url';

const qrUrl = (path: string) => BASE_URL + QR_BASE + path;

export interface QrPayloadData {
  type: string;
  id: string;
  name: string;
  payload: string;
  userName?: string;
  userProfile?: string;
  groupProfile?: string;
  chanelProfile?: string;
  bio?: string;
}

export const getQrPayload = async (
  type: 'dm' | 'group' | 'channel',
  id: string
): Promise<{ success: boolean; data: QrPayloadData }> => {
  const response = await axios.get(qrUrl(QR_PAYLOAD), { params: { type, id } });
  return response.data;
};

export interface JoinByQrData {
  type: 'dm' | 'group' | 'channel';
  conversationId?: string | null;
  itemData: any;
}

export const joinByQr = async (body: {
  type?: 'dm' | 'group' | 'channel';
  id?: string;
  payload?: string;
}): Promise<{ success: boolean; data: JoinByQrData }> => {
  const response = await axios.post(qrUrl(QR_JOIN), body);
  return response.data;
};
