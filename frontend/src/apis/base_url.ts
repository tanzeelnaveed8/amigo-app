// export const ACCESS_TOKEN = '3.110.218.175'; // LIVE
export const ACCESS_TOKEN = '192.168.1.7'; // LOCAL
export const PORT = '9090';
// export const BASE_URL = `https://api.cryptogram.tech/api`;
export const BASE_URL = `http://${ACCESS_TOKEN}:${PORT}/api`;
// export const BASE_URL = `https://amigo-backend-tn0x.onrender.com/api`;
// export const BASE_URL = `https://overenvious-variable-archer.ngrok-free.dev/api`;
// export const BASE_URL = `https://r00vnhcq-9090.inc1.devtunnels.ms/api`;
// export const BASE_URL = `https://c50qlwx0-9090.asse.devtunnels.ms/api`
// export const BASE_URL = `http://${ACCESS_TOKEN}:${PORT}/api`;

// FOR AUTHENTICAION
export const AUTH_BASE = '/user-auth';
export const AUTH_BASE_USER = '/user';
export const SEND_OTP = '/send-otp';
export const VERIFY_OTP = '/verify-otp';
export const CREATE_USER = '/create-userinfo';
export const UPDATE_PROFILE = '/update-user-profile';
export const LOGIN = '/user-login';
export const IMAGE_UPLOAD = '/images-upload';
export const GET_MEDIA = '/get-media';
export const MEDIA_BASE = '/media';
export const DELETE_ACCOUNT = '/delete-acoount';
export const UPDATE_USER_PROFILE = '/updateUserProfile';
export const SEARCH_USER = '/search-user-name';
export const SEND_SMS_OTP = '/msg91/send-otp';
export const VERIFY_SMS_OTP = '/msg91/verify-otp';
export const CHECK_PHONE = '/check-phone';
export const VERIFY_INVITE_CODE = '/verify-invite-code';
export const GET_INVITE_CODE = '/get-invite-code';
export const SEND_EMAIL_OTP = '/send-email-otp';
export const VERIFY_EMAIL_OTP = '/verify-email-otp';

// RAZORPAY
export const RAZORPAY_KEY_ID = 'rzp_live_SIkMBHN5GpDuqd';

// FOR CONTACT
export const CONTACT_BASE = '/user';
export const CHECK = '/check-number-on-server';
export const RE_CHECK = '/re-check-number-on-server';
export const GET_ALL_CONTACT = '/get-user-list-of-user';

// FOR GROUP
export const GROUP_BASE = '/group';
export const CREATE_GROUP = '/create-group';
export const UPDATE_GROUP = '/update-group';
export const GET_GROUP = '/get-group-info';
export const GET_GROUP_BY_ID = '/get-group-id';
export const REMOVE_FROM_GROUP = '/remove-from-group';
export const ADD_MEMBERS_IN_GROUP = '/add-member-in-group';
export const ADD_GROUP_ADMIN = '/add-member-in-group-as-an-admin';
export const EXIT_GROUP = '/exist-from-group';
export const DELETE_GROUP = '/delete-group';
export const UPDATE_GROUP_PROFILE_PIC = '/updateGroupProfile';
export const BAN_USER_FROM_GROUP = '/ban-user-from-group';
export const UNBAN_USER_FROM_GROUP = '/unban-user-from-group';

// FOR CHANNEL
export const CHANEL_BASE = '/chanel';
export const CREATE_CHANEL = '/create-chanel';
export const UPDATE_CHANEL = '/update-chanel';
export const GET_CHANEL = '/get-chanel-info';
export const GET_CHANEL_BY_ID = '/get-chanel-id';
export const REMOVE_FROM_CHANEL = '/remove-from-chanel';
export const ADD_MEMBERS_IN_CHANEL = '/add-member-in-chanel';
export const ADD_CHANEL_ADMIN = '/add-member-in-chanel-as-an-admin';
export const EXIT_CHANEL = '/exist-from-chanel';
export const DELETE_CHANEL = '/delete-chanel';
export const UPDATE_CHANEL_PROFILE_PIC = '/updateChanelProfile';
export const BAN_USER_FROM_CHANEL = '/ban-user-from-chanel';
export const UNBAN_USER_FROM_CHANEL = '/unban-user-from-chanel';

// WALLET (Amigo Wallet - secure document storage)
export const WALLET_BASE = '/wallet';
export const WALLET_LIST = '/list';
export const WALLET_UPLOAD = '/upload';
export const WALLET_DELETE = '/item';
export const WALLET_DOWNLOAD = '/item';
export const WALLET_RENAME = '/item';

// QR JOIN (DM / Group / Channel)
export const QR_BASE = '/qr';
export const QR_PAYLOAD = '/payload';
export const QR_JOIN = '/join';

// FOR CHAT
export const CHAT_BASE = '/chat';
export const CLEAR_CHAT_HISTORY = '/clear-chat-history';
export const ADD_REACTION = '/addReaction';
export const GET_REACTION = '/getReactions';
export const ADD_LIKEDISLIKE = '/addLikeDislike';
export const GET_LIKESTATUS = '/getLikeDislikeStatus';
