import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import ChatComponent from '../../../component/chat-component';
import { useRoute } from '@react-navigation/native';
import Context from '../../../context';
import { useSelector } from 'react-redux';
import socketServics from '../../../utils/socket';
import { useMutation } from 'react-query';
import { UploadImage } from '../../../apis/auth';
import useNavigationHook from '../../../hooks/use_navigation';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_CHAT_PREFIX = 'local_chat_';
const isValidObjectId = (id: string) => /^[a-fA-F0-9]{24}$/.test(id || '');

const makeLocalMessage = (
  text: string,
  type: string,
  userData: any,
  itemData: any,
  opts?: { image?: string; doc?: string; audio?: string; video?: string; replayText?: string }
): any => {
  const id = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const now = moment();
  return {
    id,
    message: text,
    person: 'sender',
    type: opts?.replayText ? 'replay' : type,
    image: opts?.image ?? null,
    doc: opts?.doc ?? null,
    audio: opts?.audio ?? null,
    video: opts?.video ?? null,
    isdeleted: '0',
    time: now.format('hh:mm A'),
    dateKey: now.format('YYYY-MM-DD'),
    replay: opts?.replayText ?? null,
    senderProfile: userData?.data?.userProfile,
    receiverProfile: itemData?.profileImage ?? itemData?.image,
    senderName: [userData?.data?.firstName, userData?.data?.lastName].filter(Boolean).join(' ') || userData?.data?.userName,
  };
};

const DmChatScreen = () => {
  const route = useRoute<any>().params;
  const userData: any = useSelector((state: any) => state.loginData);
  const navigation = useNavigationHook();
  const {
    setLoader,
    shareMsg,
    setToastMsg,
    addOrUpdateLocalConversation,
    getLocalMessages,
    appendLocalMessage,
    setLocalMessagesForKey,
  } = useContext(Context);
  const contactId = route?.itemData?.id;
  const isFakeContact = !isValidObjectId(contactId);
  const localKey = contactId ? `${LOCAL_CHAT_PREFIX}${contactId}` : '';

  const [msgData, setMsgData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mediaItem, setMediaItem] = useState<any>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [record, setRecord] = useState(false);
  const pendingMessageRef = useRef<{ text: string; type: string; replayText?: string } | null>(null);

  const addToRecentIfFake = useCallback(
    (lastMsgText: string) => {
      const id = route?.itemData?.id;
      if (!id || isValidObjectId(id)) return;
      addOrUpdateLocalConversation?.({
        id,
        name: route?.itemData?.name ?? route?.itemData?.displayName ?? route?.itemData?.userName ?? 'Unknown',
        profileImage: route?.itemData?.profileImage ?? route?.itemData?.image,
        lastmsg: lastMsgText,
        time: moment().format('hh:mm A'),
        conversationId: route?.itemData?.conversationId || `local-${id}`,
        type: 'dm',
        unseenMsg: 0,
        sender: true,
        blockUser: [],
        bannedUsers: [],
      });
    },
    [route?.itemData, addOrUpdateLocalConversation]
  );

  const dmMessagedata = {
    userId: userData?.data?._id,
    sender: userData?.data?._id,
    reciever: route?.itemData?.id,
  };

  const { mutate: uploadImage } = useMutation(UploadImage, {
    onSuccess: (res) => {
      setIsUploading(false);
      setMediaItem(res.data);
      if (record && res.data?.mediaurl) {
        sendMessageWithMedia('', 'audio', res.data.mediaurl);
        setRecord(false);
        return;
      }
      if (pendingMessageRef.current && res.data?.mediaurl) {
        const { text, type, replayText } = pendingMessageRef.current;
        sendMessageWithMedia(text, type, res.data.mediaurl, replayText);
        pendingMessageRef.current = null;
      }
    },
    onError: () => {
      setIsUploading(false);
      setRecord(false);
      setToastMsg('Failed to upload media. Please try again.');
      pendingMessageRef.current = null;
    },
  });

  const sendMessageWithMedia = useCallback(
    (text: string, type: string, mediaUrl: string, replayText?: string) => {
      if (isFakeContact) {
        const opts: any = { replayText };
        if (type === 'image') opts.image = mediaUrl;
        else if (type === 'doc') opts.doc = mediaUrl;
        else if (type === 'audio') opts.audio = mediaUrl;
        else if (type === 'video') opts.video = mediaUrl;
        const msg = makeLocalMessage(text, type, userData, route?.itemData || {}, opts);
        appendLocalMessage?.(localKey, msg);
        setMsgData((prev) => {
          const next = [...prev, msg];
          AsyncStorage.setItem(localKey, JSON.stringify(next)).catch(() => {});
          return next;
        });
        const mediaLabel = type === 'image' ? 'sent a image' : type === 'doc' ? 'sent a document' : type === 'audio' ? 'sent a audio' : type === 'video' ? 'sent a video' : text || 'sent a file';
        addToRecentIfFake(mediaLabel);
        return;
      }
      let chatData: any = {};
      switch (type) {
        case 'image':
          chatData = {
            sender: userData?.data?._id,
            receiver: route?.itemData?.id,
            text,
            imageUrl: mediaUrl,
            msgByUserId: userData?.data?._id,
            replyMessage: replayText,
          };
          break;
        case 'doc':
          chatData = {
            sender: userData?.data?._id,
            receiver: route?.itemData?.id,
            text,
            docUrl: mediaUrl,
            msgByUserId: userData?.data?._id,
            replyMessage: replayText,
          };
          break;
        case 'audio':
          chatData = {
            sender: userData?.data?._id,
            receiver: route?.itemData?.id,
            text,
            audioUrl: mediaUrl,
            msgByUserId: userData?.data?._id,
            replyMessage: replayText,
          };
          break;
        case 'video':
          chatData = {
            sender: userData?.data?._id,
            receiver: route?.itemData?.id,
            text,
            videoUrl: mediaUrl,
            msgByUserId: userData?.data?._id,
            replyMessage: replayText,
          };
          break;
        default:
          return;
      }
      if (userData?.data?._id === route?.itemData?.id) {
        socketServics.emit('self-message', chatData);
      } else {
        socketServics.emit('dm-message', chatData);
      }
      const mediaLabel = type === 'image' ? 'sent a image' : type === 'doc' ? 'sent a document' : type === 'audio' ? 'sent a audio' : type === 'video' ? 'sent a video' : text || 'sent a file';
      addToRecentIfFake(mediaLabel);
    },
    [userData?.data?._id, route?.itemData?.id, addToRecentIfFake, isFakeContact, localKey, appendLocalMessage]
  );

  const handleBlockUser = () => {
    const data = {
      conversationId: route?.itemData?.conversationId,
      userId: route?.itemData?.id,
    };
    socketServics.ensureConnection?.();
    socketServics.emit('blocked-user', data);
    setTimeout(() => navigation.goBack(), 150);
  };

  const handleUnblockUser = () => {
    const data = {
      conversationId: route?.itemData?.conversationId,
      userId: route?.itemData?.id,
    };
    socketServics.ensureConnection?.();
    socketServics.emit('unblocked-user', data);
    setTimeout(() => navigation.goBack(), 150);
  };

  const onSendMessage = (text: string, type: string, replayText?: string) => {
    if (isFakeContact) {
      const msg = makeLocalMessage(text, type, userData, route?.itemData || {}, { replayText });
      appendLocalMessage?.(localKey, msg);
      setMsgData((prev) => {
        const next = [...prev, msg];
        AsyncStorage.setItem(localKey, JSON.stringify(next)).catch(() => {});
        return next;
      });
      addToRecentIfFake(replayText ? 'replied message' : text);
      return;
    }
    if (type === 'text') {
      const chatData = {
        sender: userData?.data?._id,
        receiver: route?.itemData?.id,
        text,
        msgByUserId: userData?.data?._id,
        replyMessage: replayText,
      };
      if (userData?.data?._id === route?.itemData?.id) {
        socketServics.emit('self-message', chatData);
      } else {
        socketServics.emit('dm-message', chatData);
      }
      addToRecentIfFake(replayText ? 'replied message' : text);
      return;
    }
    const sharedMediaUrl = shareMsg?.image || shareMsg?.doc || shareMsg?.audio || shareMsg?.video;
    if (sharedMediaUrl) {
      sendMessageWithMedia(text, type, sharedMediaUrl, replayText);
      return;
    }
    if (isUploading || !mediaItem?.mediaurl) {
      pendingMessageRef.current = { text, type, replayText };
      return;
    }
    sendMessageWithMedia(text, type, mediaItem.mediaurl, replayText);
  };

  useEffect(() => {
    if (isFakeContact && localKey) {
      setIsLoading(true);
      AsyncStorage.getItem(localKey)
        .then((stored) => {
          let list: any[] = [];
          if (stored) {
            try {
              list = JSON.parse(stored);
            } catch (_) {}
          }
          if (!list.length) {
            const fromCtx = getLocalMessages?.(localKey) ?? [];
            list = fromCtx.length ? fromCtx : list;
          }
          setLocalMessagesForKey?.(localKey, list);
          setMsgData(Array.isArray(list) ? list : []);
        })
        .catch(() => {
          setMsgData(getLocalMessages?.(localKey) ?? []);
        })
        .finally(() => setIsLoading(false));
      return () => {};
    }

    const SeenData = {
      conversationId: route?.itemData?.conversationId,
      msgByUserId: userData?.data?._id,
      userId: userData?.data?._id,
    };
    setIsLoading(true);
    if (userData?.data?._id === route?.itemData?.id) {
      socketServics.emit('themself-message-page', dmMessagedata);
    } else {
      socketServics.emit('dm-message-page', dmMessagedata);
    }
    socketServics.emit('joinDm', { groupId: userData?.data?._id });
    socketServics.on('message', (data: any) => {
      setTimeout(() => setIsLoading(false), 1000);
      const seen = new Set<string>();
      const arr: any[] = [];
      const sorted = [...(data || [])].sort(
        (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      for (let index = 0; index < sorted.length; index++) {
        const m = sorted[index];
        const msgId = m._id;
        if (seen.has(msgId)) continue;
        seen.add(msgId);
        arr.push({
          id: msgId,
          message: m.text,
          person: m.msgByUserId?._id === userData?.data?._id ? 'sender' : 'reciver',
          type: m?.replyMessage ? 'replay' : m.imageUrl ? 'image' : m.docUrl ? 'doc' : m.audioUrl ? 'audio' : m.videoUrl ? 'video' : 'text',
          image: m.imageUrl ?? null,
          doc: m.docUrl ?? null,
          audio: m.audioUrl ?? null,
          video: m.videoUrl ?? null,
          isdeleted: '0',
          time: moment.utc(m.createdAt).local().format('hh:mm A'),
          dateKey: moment.utc(m.createdAt).local().format('YYYY-MM-DD'),
          replay: m?.replyMessage,
          senderProfile: m.msgByUserId?.userProfile ?? userData?.data?.userProfile,
          receiverProfile: route?.itemData?.profileImage,
          senderName:
            m.msgByUserId?.firstName != null
              ? (m.msgByUserId?.firstName + (m.msgByUserId?.lastName ? ' ' + m.msgByUserId.lastName : '')).trim()
              : m.msgByUserId?.userName ?? undefined,
        });
      }
      setMsgData(arr);
    });
    if (Number(route?.itemData?.unseenMsg) > 0) {
      socketServics.emit('seen', SeenData);
    }
    return () => {
      socketServics.removeListener('themself-message-page');
      socketServics.removeListener('dm-message-page');
      socketServics.removeListener('seen');
    };
  }, []);

  return (
    <ChatComponent
      isDmMessage
      itemData={route?.itemData}
      isDm
      onBlockUser={handleBlockUser}
      onUnBlockUser={handleUnblockUser}
      chatData={msgData}
      shareMsgdata={shareMsg}
      isLoading={isLoading}
      onReplayMsg={(e, text) => onSendMessage(e.message, e.type, text)}
      onDeleteMsg={(e) => {
        if (isFakeContact && localKey) {
          const next = msgData.filter((m: any) => m.id !== e.id);
          setLocalMessagesForKey?.(localKey, next);
          setMsgData(next);
          AsyncStorage.setItem(localKey, JSON.stringify(next)).catch(() => {});
          return;
        }
        socketServics.emit('delete-sms', {
          smsId: e.id,
          conversationId: route?.itemData?.conversationId,
        });
      }}
      onMediaSelect={(e) => {
        if (e[1] === 'contact') {
          const c = e[0];
          const lines = [c?.name || 'Contact'];
          if (c?.phoneNumbers?.length) lines.push(...c.phoneNumbers);
          if (c?.emails?.length) lines.push(...c.emails);
          onSendMessage(lines.join('\n'), 'text');
          setMediaItem([]);
          return;
        }
        setIsUploading(true);
        setMediaItem([]);
        pendingMessageRef.current = null;
        const formData = new FormData();
        formData.append('conversationId', route?.itemData?.conversationId);
        formData.append('mediaType', e[1]);
        formData.append('images', {
          uri: e[0].uri,
          type: e[0].type,
          name: e[0].fileName || e[0].name,
        });
        uploadImage(formData);
      }}
      isMediaUploading={isUploading}
      onEditMsg={(e, text) => {
        if (isFakeContact && localKey) {
          const next = msgData.map((m: any) => (m.id === e.id ? { ...m, message: text } : m));
          setLocalMessagesForKey?.(localKey, next);
          setMsgData(next);
          AsyncStorage.setItem(localKey, JSON.stringify(next)).catch(() => {});
          return;
        }
        socketServics.emit('edit-sms', { smsId: e.id, text });
        socketServics.emit('dm-message-page', {
          userId: userData?.data?._id,
          sender: userData?.data?._id,
          reciever: route?.itemData?.id,
        });
      }}
      onExiteGroup={() => {}}
      onExiteChanel={() => {}}
      onClearChat={() => {
        if (isFakeContact && localKey) {
          setLoader(true);
          setLocalMessagesForKey?.(localKey, []);
          setMsgData([]);
          AsyncStorage.removeItem(localKey).catch(() => {});
          setLoader(false);
          return;
        }
        setLoader(true);
        socketServics.emit('clear-conversation', route?.itemData?.conversationId);
        setTimeout(() => {
          setLoader(false);
          setMsgData([]);
        }, 2000);
      }}
      onRecording={(e) => {
        setRecord(true);
        setIsUploading(true);
        const formData = new FormData();
        formData.append('conversationId', route?.itemData?.conversationId);
        formData.append('mediaType', 'audio');
        formData.append('images', { uri: e, type: 'audio/mp4', name: 'recording.mp4' });
        uploadImage(formData);
      }}
      onReaction={() => {}}
      onSendMsg={(value, type) => onSendMessage(value, type)}
    />
  );
};

export default DmChatScreen;
