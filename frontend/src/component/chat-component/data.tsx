import {
  Search,
  Trash2,
  Ban,
  Eye,
  Share2,
  UserMinus,
  LogOut,
  Flag,
  Copy,
  Reply,
  Pencil,
} from 'lucide-react-native';

export type SettingItem = {
  name: string;
  Icon: React.ComponentType<any>;
  destructive?: boolean;
};

// DM chat header settings (blocked by you = show Unblock)
export const DmChatSettingData: SettingItem[] = [
  { name: 'View Profile', Icon: Eye },
  { name: 'Search', Icon: Search },
  { name: 'Clear Chat', Icon: Trash2, destructive: true },
  { name: 'Block User', Icon: Ban, destructive: true },
];

export const DmChatSettingDataUnblock: SettingItem[] = [
  { name: 'View Profile', Icon: Eye },
  { name: 'Search', Icon: Search },
  { name: 'Clear Chat', Icon: Trash2, destructive: true },
  { name: 'Unblock User', Icon: Ban },
];

// Channel chat header settings (admin)
export const ChanelChatSettingData: SettingItem[] = [
  { name: 'View Profile', Icon: Eye },
  { name: 'Share', Icon: Share2 },
  { name: 'Search', Icon: Search },
  { name: 'Ban User', Icon: Ban, destructive: true },
  { name: 'Members', Icon: UserMinus },
  { name: 'Exit Channel', Icon: LogOut, destructive: true },
  { name: 'Clear Chat', Icon: Trash2, destructive: true },
];

// Group chat header settings (admin)
export const GroupChatSettingData: SettingItem[] = [
  { name: 'View Profile', Icon: Eye },
  { name: 'Share', Icon: Share2 },
  { name: 'Search', Icon: Search },
  { name: 'Ban User', Icon: Ban, destructive: true },
  { name: 'Members', Icon: UserMinus },
  { name: 'Exit Group', Icon: LogOut, destructive: true },
  { name: 'Clear Chat', Icon: Trash2, destructive: true },
];

// Channel chat – non-admin user (view only)
export const ChanelUserChatSettingData: SettingItem[] = [
  { name: 'View Profile', Icon: Eye },
  { name: 'Search', Icon: Search },
];

// Message long-press: sender (own message)
export const MessageChatSettingData: SettingItem[] = [
  { name: 'Edit', Icon: Pencil },
  { name: 'Copy', Icon: Copy },
  { name: 'Delete', Icon: Trash2, destructive: true },
  { name: 'Reply', Icon: Reply },
  { name: 'Forward', Icon: Share2 },
];

// Message long-press: receiver (other's message)
export const MessageChatSettingDataReciver: SettingItem[] = [
  { name: 'Copy', Icon: Copy },
  { name: 'Reply', Icon: Reply },
  { name: 'Report', Icon: Flag, destructive: true },
  { name: 'Forward', Icon: Share2 },
];

export interface props {
  onBanUser?: (userId: string) => void;
  onReaction?: () => void;
  onRecording?: (result: any) => void;
  onReplayMsg?: (item: any, text?: string) => void;
  settingData?: typeof ChanelChatSettingData;
  onEditMsg?: (item: any, text: string) => void;
  onUnBlockUser?: () => void;
  onBlockUser?: () => void;
  onDeleteMsg?: (item: any) => void;
  shareMsgdata?: any;
  isDm?: boolean;
  onMediaSelect?: (e: any) => void;
  isDmMessage?: boolean;
  itemData?: any;
  onExiteGroup?: () => void;
  onExiteChanel?: () => void;
  onSendMsg?: (value: string, type: string) => void;
  chatData?: any[];
  onClearChat?: () => void;
  isLoading?: boolean;
  isChanel?: boolean;
  isGroup?: boolean;
  isMediaUploading?: boolean;
}
