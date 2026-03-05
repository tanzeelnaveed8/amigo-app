import axios from 'axios';
import { BASE_URL, WALLET_BASE, WALLET_LIST, WALLET_UPLOAD } from '../base_url';

const walletUrl = (path: string) => BASE_URL + WALLET_BASE + path;

export interface WalletItem {
  id: string;
  name: string;
  type: 'image' | 'document';
  sizeBytes: number;
  size: string;
  createdAt: string;
  mimeType?: string;
}

export interface WalletListResponse {
  items: WalletItem[];
  totalSizeBytes: number;
  totalItems: number;
  maxItems: number;
  maxStorageBytes: number;
}

export const getWalletList = async (): Promise<{ success: boolean; data: WalletListResponse }> => {
  const response = await axios.get(walletUrl(WALLET_LIST));
  return response.data;
};

export const uploadWalletFile = async (file: { uri: string; name: string; type: string }, name?: string): Promise<{ success: boolean; data: WalletItem }> => {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name || 'document',
    type: file.type || 'application/octet-stream',
  } as any);
  if (name) formData.append('name', name);
  const response = await axios.post(walletUrl(WALLET_UPLOAD), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteWalletItem = async (itemId: string): Promise<{ success: boolean }> => {
  const response = await axios.delete(walletUrl(`/item/${itemId}`));
  return response.data;
};

export const getWalletItemDownloadUrl = async (itemId: string, expiresIn?: number): Promise<{ success: boolean; data: { downloadUrl: string; name: string; mimeType: string } }> => {
  const q = expiresIn != null ? `?expiresIn=${expiresIn}` : '';
  const response = await axios.get(walletUrl(`/item/${itemId}/download-url${q}`));
  return response.data;
};

export const getWalletItemDownload = (itemId: string): string => {
  return BASE_URL + WALLET_BASE + `/item/${itemId}/download`;
};

export const renameWalletItem = async (itemId: string, name: string): Promise<{ success: boolean; data: WalletItem }> => {
  const response = await axios.patch(walletUrl(`/item/${itemId}/rename`), { name });
  return response.data;
};
