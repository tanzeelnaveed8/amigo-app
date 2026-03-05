import axios from 'axios';
import {BASE_URL} from '../base_url';

const GHOST_BASE = '/ghost-crowd';

// 1. Create Crowd
export const createCrowd = async (data: {
  crowdName: string;
  duration: number;
  deviceId: string;
  ghostName: string;
  avatarBgColor: string;
}) => {
  const url = BASE_URL + GHOST_BASE + '/create-crowd';
  const response = await axios.post(url, data);
  return response.data;
};

// 2. Join Crowd
export const joinCrowd = async (data: {
  crowdName: string;
  deviceId: string;
  ghostName: string;
  avatarBgColor: string;
}) => {
  const url = BASE_URL + GHOST_BASE + '/join-crowd';
  const response = await axios.post(url, data);
  return response.data;
};

// 3. Get Crowd Info
export const getCrowdInfo = async (crowdId: string, deviceId: string) => {
  const url =
    BASE_URL +
    GHOST_BASE +
    `/get-crowd-info?crowdId=${crowdId}&deviceId=${deviceId}`;
  const response = await axios.get(url);
  return response.data;
};

// 4. Get Active Crowds
export const getActiveCrowds = async (deviceId: string) => {
  try {
    const url =
      BASE_URL + GHOST_BASE + `/get-active-crowds?deviceId=${deviceId}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    }
    return {status: 500, data: [], message: 'Network error'};
  }
};

// 5. Get Crowd Members
export const getCrowdMembers = async (crowdId: string, deviceId?: string) => {
  const url =
    BASE_URL +
    GHOST_BASE +
    `/get-crowd-members?crowdId=${crowdId}${
      deviceId ? `&deviceId=${deviceId}` : ''
    }`;
  const response = await axios.get(url);
  return response.data;
};

// 6. Get Crowd Messages
export const getCrowdMessages = async (
  crowdId: string,
  limit: number = 50,
  offset: number = 0,
  deviceId?: string,
) => {
  const url =
    BASE_URL +
    GHOST_BASE +
    `/get-crowd-messages?crowdId=${crowdId}&limit=${limit}&offset=${offset}${
      deviceId ? `&deviceId=${deviceId}` : ''
    }`;
  const response = await axios.get(url);
  return response.data;
};

// 7. Send Message
export const sendMessage = async (data: {
  crowdId: string;
  deviceId: string;
  ghostName: string;
  text: string;
  media?: string;
}) => {
  const url = BASE_URL + GHOST_BASE + '/send-message';
  const response = await axios.post(url, data);
  return response.data;
};

// 8. Delete Crowd
export const deleteCrowd = async (data: {
  crowdId: string;
  deviceId: string;
}) => {
  const url = BASE_URL + GHOST_BASE + '/delete-crowd';
  const response = await axios.delete(url, {data});
  return response.data;
};

// 9. Leave Crowd
export const leaveCrowd = async (data: {crowdId: string; deviceId: string}) => {
  const url = BASE_URL + GHOST_BASE + '/leave-crowd';
  const response = await axios.post(url, data);
  return response.data;
};

// 10. Remove Member
export const removeMember = async (data: {
  crowdId: string;
  memberDeviceId: string;
  adminDeviceId: string;
}) => {
  const url = BASE_URL + GHOST_BASE + '/remove-member';
  const response = await axios.post(url, data);
  return response.data;
};

// 11. Update Admin Status
export const updateAdminStatus = async (data: {
  crowdId: string;
  memberDeviceId: string;
  adminDeviceId: string;
  isAdmin: boolean;
}) => {
  const url = BASE_URL + GHOST_BASE + '/update-admin-status';
  const response = await axios.post(url, data);
  return response.data;
};

// 12. Toggle Chat Lock
export const toggleChatLock = async (data: {
  crowdId: string;
  deviceId: string;
}) => {
  const url = BASE_URL + GHOST_BASE + '/toggle-chat-lock';
  const response = await axios.post(url, data);
  return response.data;
};

// 13. Upload Media (Ghost Mode)
export const uploadGhostMedia = async (formData: FormData) => {
  const url = BASE_URL + GHOST_BASE + '/upload-media';
  const response = await axios.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// 14. Get Daily Crowd Creation Count
export const getDailyCrowdCount = async (deviceId: string) => {
  const url =
    BASE_URL + GHOST_BASE + `/get-daily-crowd-count?deviceId=${deviceId}`;
  const response = await axios.get(url);
  return response.data;
};

// 15. Pin Message
export const pinMessage = async (data: {
  crowdId: string;
  messageId: string;
  deviceId: string;
}) => {
  const url = BASE_URL + GHOST_BASE + '/pin-message';
  const response = await axios.post(url, data);
  return response.data;
};

// 16. Unpin Message
export const unpinMessage = async (data: {
  crowdId: string;
  deviceId: string;
}) => {
  const url = BASE_URL + GHOST_BASE + '/unpin-message';
  const response = await axios.post(url, data);
  return response.data;
};

// 17. Mute Member
export const muteMember = async (data: {
  crowdId: string;
  memberDeviceId: string;
  adminDeviceId: string;
  duration: '1h' | '24h' | 'permanent';
}) => {
  const url = BASE_URL + GHOST_BASE + '/mute-member';
  const response = await axios.post(url, data);
  return response.data;
};

// 18. Unmute Member
export const unmuteMember = async (data: {
  crowdId: string;
  memberDeviceId: string;
  adminDeviceId: string;
}) => {
  const url = BASE_URL + GHOST_BASE + '/unmute-member';
  const response = await axios.post(url, data);
  return response.data;
};

// 19. Report Crowd
export const reportCrowd = async (data: {
  crowdId: string;
  deviceId?: string;
  reasonKey: string;
  details?: string;
}) => {
  const url = BASE_URL + GHOST_BASE + '/report-crowd';
  const response = await axios.post(url, data);
  return response.data;
};

// 20. Report Message
export const reportMessage = async (data: {
  crowdId: string;
  deviceId?: string;
  messageId: string;
  reasonKey: string;
  details?: string;
  reportedUserDeviceId?: string;
  reportedUserGhostName?: string;
}) => {
  const url = BASE_URL + GHOST_BASE + '/report-message';
  const response = await axios.post(url, data);
  return response.data;
};

// 21. Block User
export const blockUser = async (data: {
  crowdId: string;
  blockerDeviceId: string;
  blockedDeviceId: string;
}) => {
  const url = BASE_URL + GHOST_BASE + '/block-user';
  const response = await axios.post(url, data);
  return response.data;
};

// 22. Get Blocked Users
export const getBlockedUsers = async (crowdId: string, deviceId: string) => {
  const url =
    BASE_URL +
    GHOST_BASE +
    `/get-blocked-users?crowdId=${crowdId}&deviceId=${deviceId}`;
  const response = await axios.get(url);
  return response.data;
};
