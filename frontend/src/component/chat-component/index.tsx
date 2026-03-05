import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import BackgroundContainer from '../atoms/bg-container';
import ChatHeader from '../atoms/chatheader';
import {
  ChanelUserChatSettingData,
  DmChatSettingData,
  DmChatSettingDataUnblock,
  MessageChatSettingData,
  MessageChatSettingDataReciver,
  props as ChatComponentProps,
} from './data';
import ChatSetting from '../atoms/chat-setting-modal';
import useNavigationHook from '../../hooks/use_navigation';
import { BlurView } from 'expo-blur';
import DocPickModal from '../atoms/doc-pick-modal';
import MessagePreview from './message-preview';
import { useSelector } from 'react-redux';
import RNText from '../atoms/text';
import * as Clipboard from 'expo-clipboard';
import Context from '../../context';
import fontSize from '../../constants/font-size';
import fontWeight from '../../constants/font-weight';
import useMergedStyle, { UISAMPLE_INCHAT } from './styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ModalContentForChanel } from './chanelmessageaction';
import moment from 'moment';
import AudioRecorderPlayer from '../../utils/audioRecorderCompat';
import EmojiPicker from 'rn-emoji-keyboard';
import { useMutation } from 'react-query';
import { AddLikeDislike, AddReaction, GetLikeDislikeStatus, GetReaction } from '../../apis/chat';
import MessageAction from './messageAction';
import RecordingBar from './recording-bar';
import ChatList from './chat-list';
import { Alert } from 'react-native';
import { Search, X, Send, Mic } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { _isEmpty } from '../../utils/helper';
import Forwardicon from '../../assets/svg/forward.icon';
import PlusIcon from '../../assets/svg/plus.icon';
import EmojiIcon from '../../assets/svg/emoji.icon';
import socketServics from '../../utils/socket';

const audioRecorderPlayer = new AudioRecorderPlayer();

const ChatComponent = (props: ChatComponentProps) => {
  const {
    onBanUser,
    onReaction,
    onRecording,
    onReplayMsg,
    settingData,
    onEditMsg,
    onUnBlockUser,
    onBlockUser,
    onDeleteMsg,
    shareMsgdata,
    isDm,
    onMediaSelect,
    isDmMessage,
    itemData,
    onExiteGroup,
    onExiteChanel,
    onSendMsg,
    chatData = [],
    onClearChat,
    isLoading,
    isChanel,
    isGroup,
    isMediaUploading,
  } = props;

  const navigation = useNavigationHook();
  const { setToastMsg, setShareMsg, colors } = useContext(Context);
  const userData: any = useSelector((state: any) => state.loginData);
  const styles = useMergedStyle(colors);
  const { top } = useSafeAreaInsets();
  const accent = colors?.accentColor ?? '#9B7BFF';
  const accentLight = colors?.accentLight ?? '#B88DFF';

  const [msg, setMsg] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [isSetting, setIsSetting] = useState(false);
  const [showsearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDocPick, setShowDocPick] = useState(false);
  const [onMessage, setOnMessage] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isReplay, setIsReplay] = useState(false);
  const [timeWithin, setTimewithin] = useState(false);
  const [mediaItem, setMediaItem] = useState<any>();
  const [selecteditem, setSelectedItem] = useState<any>();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isvisible, setisVisible] = useState(false);
  const [recording, setRecording] = useState(false);
  const [emojiPick, setEmojiPick] = useState(false);
  const [dropdownTop, setDropdownTop] = useState(0);
  const [socketStatus, setSocketStatus] = useState({ isConnected: false, queueLength: 0 });
  const [typingUsers, setTypingUsers] = useState<{ userId: string; userName: string }[]>([]);
  const [showBanModal, setShowBanModal] = useState(false);
  const [isBanned, setIsBanned] = useState(false);

  const [localBlockStatus, setLocalBlockStatus] = useState({
    isBlockedByOther: false,
    isBlockedByYou: false,
  });

  const isUploading = isMediaUploading ?? false;
  const chatRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const hasMounted = useRef(false);
  const previousDataLength = useRef(0);

  const isBlockedUser = localBlockStatus.isBlockedByOther ? 0 : -1;
  const BlockbyYou = localBlockStatus.isBlockedByYou ? 0 : -1;
  const DmChatSetting = BlockbyYou === 0 ? DmChatSettingDataUnblock : DmChatSettingData;
  const MessageActionData =
    selecteditem?.person === 'sender' && !_isEmpty(selecteditem?.message)
      ? MessageChatSettingData
      : MessageChatSettingDataReciver;

  const handleUnblock = () => {
    setLocalBlockStatus((prev) => ({ ...prev, isBlockedByYou: false }));
    onUnBlockUser?.();
  };
  const handleBlock = () => {
    setLocalBlockStatus((prev) => ({ ...prev, isBlockedByYou: true }));
    onBlockUser?.();
  };

  useEffect(() => {
    setData(chatData);
  }, [chatData]);

  const filteredData =
    searchQuery.trim()
      ? data.filter((item: any) =>
          item.message?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : data;

  useEffect(() => {
    if (!isDm) return;
    const handleBlockedUser = (data: any) => {
      if (data?._id === itemData?.conversationId || data?.conversationId === itemData?.conversationId) {
        const currentUserId = userData?.data?._id;
        const blockUserList = data?.blockUser || [];
        const isCurrentUserBlocked = blockUserList.some(
          (id: any) => id?.toString() === currentUserId || id === currentUserId
        );
        const otherUserId = itemData?._id ?? itemData?.id;
        const isOtherUserBlocked = blockUserList.some(
          (id: any) => id?.toString() === otherUserId || id === otherUserId
        );
        setLocalBlockStatus({ isBlockedByOther: isCurrentUserBlocked, isBlockedByYou: isOtherUserBlocked });
      }
    };
    const handleUnblockedUser = (data: any) => {
      if (data?._id === itemData?.conversationId || data?.conversationId === itemData?.conversationId) {
        const currentUserId = userData?.data?._id;
        const blockUserList = data?.blockUser || [];
        const otherUserId = itemData?._id ?? itemData?.id;
        setLocalBlockStatus({
          isBlockedByOther: blockUserList.some((id: any) => id?.toString() === currentUserId || id === currentUserId),
          isBlockedByYou: blockUserList.some((id: any) => id?.toString() === otherUserId || id === otherUserId),
        });
      }
    };
    socketServics.on('blocked-user', handleBlockedUser);
    socketServics.on('unblocked-user', handleUnblockedUser);
    return () => {
      socketServics.removeListener('blocked-user');
      socketServics.removeListener('unblocked-user');
    };
  }, [isDm, itemData?.conversationId, itemData?._id, itemData?.id, userData?.data?._id]);

  useEffect(() => {
    if (!isGroup && !isChanel) return;
    const handleBanned = (data: any) => {
      if (data.bannedUserId === userData?.data?._id) {
        setIsBanned(true);
        setToastMsg('You have been banned from this chat');
      }
    };
    const handleYouAreBanned = (data: any) => {
      if ((isGroup && data.groupId === itemData?._id) || (isChanel && data.chanelId === itemData?._id)) {
        setIsBanned(true);
        setToastMsg('You have been banned');
      }
    };
    socketServics.on('user-banned', handleBanned);
    socketServics.on('you-are-banned', handleYouAreBanned);
    if (itemData?.bannedUsers?.includes(userData?.data?._id)) setIsBanned(true);
    return () => {
      socketServics.removeListener('user-banned');
      socketServics.removeListener('you-are-banned');
    };
  }, [isGroup, isChanel, itemData?._id, userData?.data?._id]);

  useEffect(() => {
    const check = () => {
      const status = socketServics.getQueueStatus?.() ?? { isConnected: true, queueLength: 0 };
      setSocketStatus((prev) =>
        prev.isConnected !== status.isConnected || prev.queueLength !== status.queueLength
          ? { isConnected: status.isConnected, queueLength: status.queueLength }
          : prev
      );
    };
    check();
    const interval = setInterval(check, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleTyping = (typingData: any) => {
      if (typingData.userId === userData?.data?._id) return;
      if (typingData.isTyping) {
        setTypingUsers((prev) => {
          if (prev.find((u) => u.userId === typingData.userId)) return prev;
          return [...prev, { userId: typingData.userId, userName: typingData.userName }];
        });
      } else {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== typingData.userId));
      }
    };
    socketServics.on('typing', handleTyping);
    return () => socketServics.removeListener('typing');
  }, [userData?.data?._id]);

  const lastTypingEmit = useRef(0);
  const handleTextChange = useCallback(
    (text: string) => {
      setMsg(text);
      const roomId = itemData?.conversationId || itemData?._id || itemData?.id;
      if (roomId && Date.now() - lastTypingEmit.current > 2000) {
        lastTypingEmit.current = Date.now();
        socketServics.emitTyping?.(
          roomId,
          userData?.data?._id,
          userData?.data?.firstName || userData?.data?.userName || '',
          true
        );
        setTimeout(() => {
          socketServics.emitTyping?.(roomId, userData?.data?._id, '', false);
        }, 3000);
      }
    },
    [itemData, userData?.data]
  );

  const { mutate: getReaction } = useMutation(GetReaction, {
    onSuccess: (res: any) => {
      setData((arr) =>
        arr.map((x) => (res.messageId === x.id ? { ...x, reaction: res.reactions } : x))
      );
    },
  });
  const { mutate: addReaction } = useMutation(AddReaction, {
    onSuccess: (_: any, variables: any) => getReaction(variables.messageId),
  });
  const { mutate: addLikeDislike } = useMutation(AddLikeDislike, {
    onSuccess: (_: any, variables: any) => getLikestatus(variables.messageId),
  });
  const { mutate: getLikestatus } = useMutation(GetLikeDislikeStatus, {
    onSuccess: (res: any) => {
      setData((arr) =>
        arr.map((x) => (res.messageId === x.id ? { ...x, likesDislikes: res.likesDislikes } : x))
      );
    },
  });

  const handleItemPress = useCallback(
    (item: any, pageY: number, locationY: number) => {
      setDropdownTop(pageY - locationY - top);
      if (isChanel) {
        if (isAdmin) {
          setSelectedItem(item);
          setOnMessage(true);
        } else {
          setSelectedItem(item);
          setisVisible(true);
        }
      } else {
        setSelectedItem(item);
        setOnMessage(true);
      }
    },
    [isChanel, isAdmin, top]
  );

  const handleRecordingComplete = useCallback(
    (result: any) => {
      setRecording(false);
      onRecording?.(result);
    },
    [onRecording]
  );

  const isWithinLastHour = (timeString: string) => {
    const givenTime = moment(timeString, 'hh:mm A');
    const now = moment();
    const diff = now.diff(givenTime, 'minutes');
    setTimewithin(diff <= 60 && diff >= 0);
  };

  const onEditMessage = (sel: any, text: string) => {
    setMsg('');
    setOnMessage(false);
    setIsEdit(false);
    onEditMsg?.(sel, text);
  };
  const onReplayMessage = (sel: any, text: string) => {
    setMsg('');
    setOnMessage(false);
    setIsReplay(false);
    setSelectedItem(undefined);
    onReplayMsg?.(sel, text);
  };

  const onSend = () => {
    const messageToSend = msg;
    const mediaToSend = mediaItem;
    const shareMsgToSend = shareMsgdata;
    setMsg('');
    setMediaItem(undefined);
    setShareMsg?.({});
    setData((arr) => [
      ...arr,
      {
        id: `opt-${Date.now()}`,
        message: messageToSend,
        person: 'sender',
        type: mediaToSend?.[1] ?? 'text',
        image: shareMsgToSend?.image || mediaToSend?.[0]?.uri,
        video: mediaToSend?.[0]?.uri,
        isdeleted: '0',
        dateKey: moment().format('YYYY-MM-DD'),
        time: moment().format('hh:mm A'),
      },
    ]);
    onSendMsg?.(messageToSend, (shareMsgToSend?.type || mediaToSend?.[1]) ?? 'text');
  };

  const MessageChatSetting = (value: any) => {
    switch (String(value)) {
      case '0':
        isWithinLastHour(selecteditem.time);
        if (timeWithin) {
          setIsEdit(true);
          setMsg(selecteditem.message);
        } else {
          setOnMessage(false);
          setSelectedItem(undefined);
          setToastMsg('You can only edit this message within 1 hour');
        }
        break;
      case '2':
        Clipboard.setStringAsync(selecteditem.message);
        setToastMsg('Copied to clipboard!');
        setOnMessage(false);
        setSelectedItem(undefined);
        break;
      case '3':
        setIsReplay(true);
        setOnMessage(false);
        setTimeout(() => inputRef.current?.focus(), 100);
        break;
      case '4':
        setShareMsg?.(selecteditem);
        navigation.navigate('MyDrawer');
        setOnMessage(false);
        break;
    }
  };

  const DmMessageChatSetting = (value: any) => {
    switch (String(value)) {
      case '0':
        navigation.navigate('DmProfileScreen', { itemData });
        break;
      case '1':
        setShowSearch((e) => {
          if (e) setSearchQuery('');
          return !e;
        });
        break;
      case '2':
        onClearChat?.();
        break;
      case '3':
        BlockbyYou === 0 ? handleUnblock() : handleBlock();
        break;
    }
  };

  const MessageActions = (value: any) => {
    switch (String(value)) {
      case '0':
        isWithinLastHour(selecteditem.time);
        if (timeWithin) {
          setIsEdit(true);
          setMsg(selecteditem.message);
        } else {
          setOnMessage(false);
          setSelectedItem(undefined);
          setToastMsg('You can only edit this message within 1 hour');
        }
        break;
      case '1':
        Clipboard.setStringAsync(selecteditem.message);
        setToastMsg('Copied to clipboard!');
        setOnMessage(false);
        setSelectedItem(undefined);
        break;
      case '2':
        isWithinLastHour(selecteditem.time);
        if (timeWithin) {
          onDeleteMsg?.(selecteditem);
          setData((arr) => arr.filter((r: any) => r.id !== selecteditem.id));
          setOnMessage(false);
          setSelectedItem(undefined);
        } else {
          setOnMessage(false);
          setToastMsg('You can only delete this message within 1 hour');
        }
        break;
      case '3':
        setIsReplay(true);
        setOnMessage(false);
        setTimeout(() => inputRef.current?.focus(), 100);
        break;
      case '4':
        setShareMsg?.(selecteditem);
        navigation.navigate('MyDrawer');
        setOnMessage(false);
        break;
    }
  };

  const handleBanUser = (userId: string, userName: string) => {
    Alert.alert('Ban User', `Are you sure you want to ban ${userName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Ban',
        style: 'destructive',
        onPress: () => {
          onBanUser?.(userId);
          setShowBanModal(false);
          setToastMsg(`${userName} has been banned`);
        },
      },
    ]);
  };

  const onClickSetting = (value: any) => {
    switch (String(value)) {
      case '0':
        isDmMessage
          ? navigation.navigate('DmProfileScreen', { itemData })
          : !_isEmpty(itemData?.groupAdmin)
            ? navigation.navigate('ProfileScreen', { itemData })
            : navigation.navigate('ChanelProfileScreen', { itemData });
        break;
      case '1':
        navigation.navigate('ShareItScreen', { isMedia: true, itemData });
        break;
      case '2':
        setShowSearch((e) => {
          if (e) setSearchQuery('');
          return !e;
        });
        break;
      case '3':
        if (isAdmin) setShowBanModal(true);
        else setToastMsg('Only admins can ban users');
        break;
      case '5':
        !_isEmpty(itemData?.groupAdmin) ? onExiteGroup?.() : onExiteChanel?.();
        break;
      case '6':
        onClearChat?.();
        break;
    }
  };

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      if (!_isEmpty(chatData)) {
        setTimeout(() => chatRef.current?.scrollToEnd({ animated: false }), 300);
      }
      const adminList = isChanel ? itemData?.chanelAdmin : isGroup ? itemData?.groupAdmin : [];
      const findIndex =
        adminList?.findIndex?.((res: any) => {
          const id = typeof res === 'object' ? res._id : res;
          return id == userData?.data?._id;
        }) ?? -1;
      if (findIndex >= 0) setIsAdmin(true);
    }
  }, []);

  useEffect(() => {
    if (shareMsgdata?.message) setMsg(shareMsgdata.message);
  }, [shareMsgdata]);

  useEffect(() => {
    if (hasMounted.current && chatData.length > previousDataLength.current && chatData.length > 0) {
      setTimeout(() => chatRef.current?.scrollToEnd({ animated: true }), 100);
    }
    previousDataLength.current = chatData.length;
  }, [chatData.length]);

  const profileImage = itemData?.profileImage ?? itemData?.image;
  const displayName = itemData?.name ?? itemData?.firstName ?? 'Chat';

  return (
    <BackgroundContainer
      Whitebgwidth="100%"
      mainchildren={
        <ChatHeader
          name={displayName}
          image={profileImage}
          onPressBack={() => navigation.goBack()}
          onMsgMoreOption={() => setIsSetting((e) => !e)}
          onProfilePress={() => {
            isDmMessage
              ? navigation.navigate('DmProfileScreen', { itemData })
              : !_isEmpty(itemData?.groupAdmin)
                ? navigation.navigate('ProfileScreen', { itemData })
                : navigation.navigate('ChanelProfileScreen', { itemData });
          }}
          onCallPress={() => navigation.navigate('ComingSoonScreen')}
          onVideoPress={() => navigation.navigate('ComingSoonScreen')}
        />
      }
      paddingVertical={0}
      children={
        <View style={styles.secondmain}>
          <KeyboardAvoidingView
            behavior="padding"
            keyboardVerticalOffset={Platform.select({ ios: 90, android: 60 })}
            style={{ flex: 1 }}
            enabled
          >
            {showsearch && (
              <View style={styles.searchBarWrap}>
                <Search size={20} color={colors?.secondaryText ?? '#8B8CAD'} strokeWidth={2} />
                <TextInput
                  style={styles.searchBarInput}
                  placeholder="Search in chat..."
                  placeholderTextColor={colors?.secondaryText ?? '#5E607E'}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                  returnKeyType="search"
                />
                <TouchableOpacity
                  style={styles.searchBarClose}
                  onPress={() => { setShowSearch(false); setSearchQuery(''); }}
                  hitSlop={8}
                >
                  <X size={20} color={colors?.secondaryText ?? '#8B8CAD'} strokeWidth={2} />
                </TouchableOpacity>
              </View>
            )}
            <ChatList
              ref={chatRef}
              data={filteredData}
              isLoading={isLoading}
              isChanel={!!isChanel}
              isAdmin={isAdmin}
              onItemPress={handleItemPress}
            />
            {typingUsers.length > 0 && (
              <View style={styles.typingWrap}>
                <View style={styles.typingAvatar}>
                  <RNText
                    label={(typingUsers[0]?.userName?.[0] || '?').toUpperCase()}
                    fontSize={fontSize._12}
                    fontWeight={fontWeight._700}
                    color="#FFFFFF"
                  />
                </View>
                <View style={styles.typingDots}>
                  <View style={[styles.typingDot, { backgroundColor: accent }]} />
                  <View style={[styles.typingDot, { backgroundColor: accent, marginLeft: 4 }]} />
                  <View style={[styles.typingDot, { backgroundColor: accent, marginLeft: 4 }]} />
                </View>
                <RNText
                  label={
                    typingUsers.length === 1
                      ? `${typingUsers[0].userName} is typing...`
                      : `${typingUsers.map((u) => u.userName).join(', ')} are typing...`
                  }
                  fontSize={fontSize._12}
                  fontWeight={fontWeight._500}
                  color={colors.grey ?? '#8B8CAD'}
                  style={styles.typingText}
                />
              </View>
            )}
            {socketStatus.queueLength > 0 && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  alignSelf: 'center',
                  backgroundColor: colors.primary,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 15,
                  marginVertical: 5,
                }}
              >
                <RNText
                  label={`${socketStatus.queueLength} message(s) queued`}
                  fontSize={fontSize._12}
                  fontWeight={fontWeight._600}
                  color={colors.white}
                />
              </View>
            )}
            {(!_isEmpty(mediaItem?.[0]) || !_isEmpty(shareMsgdata?.message) || isReplay || isUploading) && (
              <MessagePreview
                message={isReplay ? selecteditem?.message : msg}
                audio={mediaItem?.[1] ?? shareMsgdata?.type}
                image={
                  mediaItem?.[0]?.uri || shareMsgdata?.video || shareMsgdata?.doc || shareMsgdata?.image
                }
                isReplay={!!isReplay}
                isUploading={!!isUploading}
                onPressCancel={() => {
                  setShareMsg?.({});
                  setMediaItem(undefined);
                  setIsReplay(false);
                }}
              />
            )}
            {isBanned ? (
              <View style={styles.adminpopup}>
                <RNText
                  label="You are banned from this chat"
                  fontSize={fontSize._16}
                  fontWeight={fontWeight._700}
                  color={colors.red}
                />
              </View>
            ) : isBlockedUser === 0 || BlockbyYou === 0 ? (
              <View style={styles.adminpopup}>
                <RNText
                  label={
                    BlockbyYou === 0
                      ? `You have blocked ${displayName}`
                      : `You are blocked by ${displayName}`
                  }
                  fontSize={fontSize._16}
                  fontWeight={fontWeight._700}
                  color={colors.red}
                />
              </View>
            ) : (isChanel && isAdmin) || isGroup || isDm ? (
              <View style={styles.inputContainer}>
                {/* Uisample: Reply context bar above input */}
                {isReplay && selecteditem && (
                  <View style={styles.replyBarWrap}>
                    <View style={styles.replyBarInner}>
                      <View style={styles.replyBarLeft}>
                        <RNText
                          label={`Replying to ${selecteditem.person === 'sender' ? 'Yourself' : displayName}`}
                          fontSize={fontSize._12}
                          fontWeight={fontWeight._700}
                          color={accent}
                        />
                        <RNText
                          numberOfLines={1}
                          label={selecteditem.message || 'Media'}
                          fontSize={fontSize._12}
                          fontWeight={fontWeight._400}
                          color={colors.secondaryText ?? '#8B8CAD'}
                        />
                      </View>
                      <TouchableOpacity
                        onPress={() => { setIsReplay(false); setSelectedItem(undefined); }}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        style={styles.replyBarClose}
                      >
                        <RNText label="✕" fontSize={fontSize._14} fontWeight={fontWeight._700} color={colors.grey} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                {recording ? (
                  <RecordingBar
                    audioRecorderPlayer={audioRecorderPlayer}
                    onRecordingComplete={handleRecordingComplete}
                    onRecordingCancel={() => setRecording(false)}
                    setToastMsg={setToastMsg}
                  />
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={() => !isUploading && setShowDocPick(true)}
                      disabled={!!isUploading}
                      style={[styles.plusBtn, { opacity: isUploading ? 0.5 : 1 }]}
                      activeOpacity={0.8}
                    >
                      <PlusIcon size={22} color={colors?.secondaryText ?? '#8B8CAD'} />
                    </TouchableOpacity>
                    <View
                      style={[
                        styles.inputContainerView,
                        {
                          backgroundColor: colors?.cardBg ?? colors?.inputBGColor ?? '#141422',
                          borderRadius: UISAMPLE_INCHAT?.input?.borderRadius ?? 24,
                          minHeight: UISAMPLE_INCHAT?.input?.minHeight ?? 50,
                          borderColor: UISAMPLE_INCHAT?.input?.borderColor ?? 'rgba(255,255,255,0.12)',
                        },
                      ]}
                    >
                      <TextInput
                        ref={inputRef}
                        value={msg}
                        onChangeText={handleTextChange}
                        placeholder="Message..."
                        placeholderTextColor={UISAMPLE_INCHAT?.input?.placeholderColor ?? '#5E607E'}
                        style={styles.inputStyle}
                        multiline
                        textAlignVertical="center"
                      />
                      <TouchableOpacity
                        onPress={() => setEmojiPick((e) => !e)}
                        style={[styles.emojiicon, { opacity: isUploading ? 0.5 : 1 }]}
                        disabled={!!isUploading}
                      >
                        <EmojiIcon color={colors?.secondaryText ?? '#8B8CAD'} size={22} />
                        <EmojiPicker
                          enableRecentlyUsed
                          onEmojiSelected={({ emoji }: any) => setMsg((e) => e + emoji)}
                          open={emojiPick}
                          onClose={() => setEmojiPick(false)}
                        />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      disabled={!!isUploading}
                      onPress={() => {
                        if (
                          !_isEmpty(mediaItem?.[0]) ||
                          !_isEmpty(msg?.trim()) ||
                          !_isEmpty(shareMsgdata?.message)
                        ) {
                          isEdit
                            ? onEditMessage(selecteditem, msg)
                            : isReplay
                              ? onReplayMessage(selecteditem, msg)
                              : onSend();
                        } else {
                          setRecording(true);
                        }
                      }}
                      activeOpacity={0.9}
                      style={styles.sendMicBtn}
                    >
                      {isUploading ? (
                        <View
                          style={[
                            styles.sendMicBtn,
                            styles.sendMicBtnEmpty,
                            { backgroundColor: colors?.cardBg ?? '#25263A' },
                          ]}
                        >
                          <RNText
                            label="..."
                            fontSize={fontSize._16}
                            fontWeight={fontWeight._700}
                            color={colors?.secondaryText}
                          />
                        </View>
                      ) : _isEmpty(mediaItem?.[0]) &&
                        _isEmpty(msg?.trim()) &&
                        _isEmpty(shareMsgdata?.message) ? (
                        <View style={[styles.sendMicBtn, styles.sendMicBtnEmpty]}>
                          <Mic size={22} color={colors?.secondaryText ?? '#8B8CAD'} strokeWidth={2} />
                        </View>
                      ) : (
                        <LinearGradient
                          colors={[accent, accentLight]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.sendMicBtn}
                        >
                          <Send size={22} color="#FFFFFF" strokeWidth={2} />
                        </LinearGradient>
                      )}
                    </TouchableOpacity>
                  </>
                )}
              </View>
            ) : (
              <View style={styles.adminpopup}>
                <RNText label="Only admin can message...." />
              </View>
            )}
            {isSetting && (
              <BlurView style={styles.absolute} intensity={40} tint="dark" pointerEvents="none" />
            )}
            {(isSetting || isvisible) && (
              <Pressable
                style={[styles.absolute, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                onPress={() => {
                  setIsSetting(false);
                  setisVisible(false);
                  setOnMessage(false);
                  setSelectedItem(undefined);
                }}
              />
            )}
            <ChatSetting
              data={
                isDm
                  ? DmChatSetting
                  : isChanel && !isAdmin
                    ? ChanelUserChatSettingData
                    : (settingData as any) ?? ChanelUserChatSettingData
              }
              isvisible={isSetting}
              top={8}
              right={16}
              onClickItem={(value) => {
                setIsSetting(false);
                isDm
                  ? DmMessageChatSetting(value)
                  : onClickSetting(value);
              }}
            />
          </KeyboardAvoidingView>
          <DocPickModal
            onPressItem={(value: any, type: string) => {
              onMediaSelect?.([...value, type]);
              if (type !== 'contact') setMediaItem([...value, type]);
            }}
            visible={showDocPick}
            onPressOut={() => setShowDocPick(false)}
          />
          <ModalContentForChanel
            dropdown={dropdownTop}
            isvisible={isvisible}
            item={selecteditem}
            onEmojiPress={(e: string) => {
              if (e === '🤔') {
                addReaction({
                  messageId: selecteditem?.id,
                  emoji: e,
                  userId: userData?.data?._id,
                });
                onReaction?.();
              } else {
                addLikeDislike({
                  messageId: selecteditem?.id,
                  action: e === '👍' ? 'like' : 'dislike',
                });
                onReaction?.();
              }
              setisVisible(false);
            }}
            onClose={() => {
              setisVisible(false);
              setSelectedItem(undefined);
            }}
          />
          <MessageAction
            dropdown={dropdownTop}
            item={selecteditem}
            isvisible={onMessage}
            onClickItem={(e) => {
              MessageActions(e);
              setOnMessage(false);
            }}
            onClose={() => {
              setOnMessage(false);
              setSelectedItem(undefined);
            }}
          />
          <Modal
            visible={showBanModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowBanModal(false)}
          >
            <Pressable
              style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
              onPress={() => setShowBanModal(false)}
            >
              <Pressable
                style={{
                  backgroundColor: colors.cardBg || colors.inputBGColor,
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  maxHeight: '60%',
                  paddingBottom: 30,
                }}
                onPress={() => {}}
              >
                <View
                  style={{
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.borderColor,
                  }}
                >
                  <RNText
                    label="Select member to ban"
                    fontSize={fontSize._18}
                    fontWeight={fontWeight._700}
                    color={colors.textColor}
                  />
                </View>
                <FlatList
                  data={(itemData?.participants || []).filter((p: any) => {
                    const pid = typeof p === 'object' ? p._id : p;
                    const adminList = itemData?.groupAdmin || itemData?.chanelAdmin || [];
                    const isAdm = adminList.some(
                      (a: any) => (typeof a === 'object' ? a._id : a) === pid
                    );
                    return pid !== userData?.data?._id && !isAdm;
                  })}
                  keyExtractor={(item: any, index: number) =>
                    (typeof item === 'object' ? item._id : item) || String(index)
                  }
                  ListEmptyComponent={
                    <View style={{ padding: 20, alignItems: 'center' }}>
                      <RNText
                        label="No members to ban"
                        fontSize={fontSize._14}
                        fontWeight={fontWeight._400}
                        color={colors.grey}
                      />
                    </View>
                  }
                  renderItem={({ item }: any) => {
                    const isObj = typeof item === 'object';
                    const userId = isObj ? item._id : item;
                    const userName = isObj ? item.firstName || item.userName || 'User' : 'User';
                    return (
                      <TouchableOpacity
                        onPress={() => handleBanUser(userId, userName)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 14,
                          paddingHorizontal: 20,
                          borderBottomWidth: 0.5,
                          borderBottomColor: colors.borderColor,
                        }}
                      >
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: accent,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                          }}
                        >
                          <RNText
                            label={(userName?.[0] || 'U').toUpperCase()}
                            fontSize={fontSize._16}
                            fontWeight={fontWeight._700}
                            color="#fff"
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <RNText
                            label={userName}
                            fontSize={fontSize._16}
                            fontWeight={fontWeight._600}
                            color={colors.textColor}
                          />
                        </View>
                        <RNText
                          label="Ban"
                          fontSize={fontSize._14}
                          fontWeight={fontWeight._600}
                          color={colors.red}
                        />
                      </TouchableOpacity>
                    );
                  }}
                />
              </Pressable>
            </Pressable>
          </Modal>
        </View>
      }
    />
  );
};

export default ChatComponent;
