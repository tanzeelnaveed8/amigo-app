import React, { useCallback, useContext, useEffect, useState, useRef } from 'react';
import ChatComponent from '../../../component/chat-component';
import { useRoute } from '@react-navigation/native';
import { useMutation } from 'react-query';
import Context from '../../../context';
import useNavigationHook from '../../../hooks/use_navigation';
import { ExiteChanel } from '../../../apis/channel';
import { useSelector } from 'react-redux';
import socketServics from '../../../utils/socket';
import { UploadImage } from '../../../apis/auth';
import moment from 'moment';
import { ChanelChatSettingData } from '../../../component/chat-component/data';

const ChanelChatScreen = () => {
  const navigation = useNavigationHook();
  const route = useRoute<any>().params;
  const userData: any = useSelector((state: any) => state.loginData);
  const { setLoader, shareMsg, setToastMsg } = useContext(Context);
  const [msgData, setMsgData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mediaItem, setMediaItem] = useState<any>([]);
  const [isUploading, setIsUploading] = useState(false);
  const pendingMessageRef = useRef<{ text: string; type: string; replayText?: string } | null>(null);

  const { mutate: exitChanel } = useMutation(ExiteChanel, {
    onSuccess: () => {
      setLoader(false);
      navigation.goBack();
    },
    onError: () => {
      setLoader(false);
    },
  });

  const { mutate: uploadImage } = useMutation(UploadImage, {
    onSuccess: (res) => {
      setIsUploading(false);
      setMediaItem(res.data);
      if (pendingMessageRef.current && res.data?.mediaurl) {
        const { text, type, replayText } = pendingMessageRef.current;
        sendMessageWithMedia(text, type, res.data.mediaurl, replayText);
        pendingMessageRef.current = null;
      }
    },
    onError: () => {
      setIsUploading(false);
      setToastMsg('Failed to upload media. Please try again.');
      pendingMessageRef.current = null;
    },
  });

  const sendMessageWithMedia = useCallback(
    (text: string, type: string, mediaUrl: string, replayText?: string) => {
      const participent = (route?.itemData?.participants || []).map((p: any) => (typeof p === 'object' ? p._id : p) ?? p);
      let chatData: any = {};
      switch (type) {
        case 'image':
          chatData = {
            imageUrl: mediaUrl,
            sender: userData?.data?._id,
            text,
            msgByUserId: userData?.data?._id,
            chanelId: route?.itemData._id,
            participent,
            conversationId: route?.itemData?.conversationId,
            replyMessage: replayText,
          };
          break;
        case 'doc':
          chatData = {
            sender: userData?.data?._id,
            text,
            docUrl: mediaUrl,
            msgByUserId: userData?.data?._id,
            chanelId: route?.itemData._id,
            conversationId: route?.itemData?.conversationId,
            replyMessage: replayText,
          };
          break;
        case 'audio':
          chatData = {
            sender: userData?.data?._id,
            text,
            audioUrl: mediaUrl,
            msgByUserId: userData?.data?._id,
            chanelId: route?.itemData._id,
            conversationId: route?.itemData?.conversationId,
            replyMessage: replayText,
          };
          break;
        case 'video':
          chatData = {
            sender: userData?.data?._id,
            text,
            videoUrl: mediaUrl,
            msgByUserId: userData?.data?._id,
            chanelId: route?.itemData._id,
            conversationId: route?.itemData?.conversationId,
            replyMessage: replayText,
          };
          break;
        default:
          return;
      }
      socketServics.emit('chanel-message', chatData);
    },
    [userData?.data?._id, route?.itemData]
  );

  const onSendMessage = (text: string, type: string, replayText?: string) => {
    if (type === 'text') {
      const participent = (route?.itemData?.participants || []).map((p: any) => (typeof p === 'object' ? p._id : p) ?? p);
      socketServics.emit('chanel-message', {
        sender: userData?.data?._id,
        text,
        msgByUserId: userData?.data?._id,
        chanelId: route?.itemData._id,
        participent,
        conversationId: route?.itemData?.conversationId,
        replyMessage: replayText,
      });
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
    const data = {
      userId: userData?.data?._id,
      sender: userData?.data?._id,
      chanelId: route?.itemData._id,
    };
    const SeenData = {
      conversationId: route?.itemData?.conversationId,
      msgByUserId: userData?.data?._id,
      chanelId: route?.itemData._id,
      userId: userData?.data?._id,
    };
    setIsLoading(true);
    socketServics.emit('chanel-message-page', data);
    socketServics.emit('joinChanel', { groupId: route?.itemData._id });
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
        const seenCount = Number(m?.seenByCount);
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
          seenBy: String(seenCount),
          replay: m?.replyMessage,
          reaction: m.reactions,
          likesDislikes: m.likesDislikes,
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
      socketServics.removeListener('chanel-message-page');
      socketServics.removeListener('seen');
    };
  }, []);

  return (
    <ChatComponent
      itemData={route?.itemData}
      chatData={msgData}
      isLoading={isLoading}
      shareMsgdata={shareMsg}
      settingData={ChanelChatSettingData}
      isChanel
      onExiteGroup={() => {}}
      onReplayMsg={(e, text) => onSendMessage(e.message, e.type, text)}
      onDeleteMsg={(e) => {
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
      onExiteChanel={() => {
        setLoader(true);
        exitChanel({ chanelId: route?.itemData._id });
      }}
      onClearChat={() => {
        setLoader(true);
        socketServics.emit('clear-conversation', route?.itemData?.conversationId);
        setTimeout(() => {
          setLoader(false);
          setMsgData([]);
        }, 2000);
      }}
      onSendMsg={(value, type) => onSendMessage(value, type)}
      onBlockUser={() => {}}
      onUnBlockUser={() => {}}
      onEditMsg={(e, text) => {
        socketServics.emit('edit-sms', { smsId: e.id, text });
        socketServics.emit('chanel-message-page', {
          userId: userData?.data?._id,
          sender: userData?.data?._id,
          chanelId: route?.itemData._id,
        });
      }}
      onRecording={(e) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('conversationId', route?.itemData?.conversationId);
        formData.append('mediaType', 'audio');
        formData.append('images', { uri: e, type: 'audio/mp4', name: 'recording.mp4' });
        uploadImage(formData);
      }}
      onReaction={() => {
        socketServics.emit('chanel-message-page', {
          userId: userData?.data?._id,
          sender: userData?.data?._id,
          chanelId: route?.itemData._id,
        });
      }}
      onBanUser={(userId) => {
        socketServics.emit('ban-chanel-user', {
          chanelId: route?.itemData._id,
          userId,
        });
      }}
    />
  );
};

export default ChanelChatScreen;
