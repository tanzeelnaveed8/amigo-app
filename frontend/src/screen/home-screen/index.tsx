import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import HomeScreenComponent from '../../component/home-component';
import Context from '../../context';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { _isEmpty } from '../../utils/helper';
import socketServics from '../../utils/socket';
import { getAllContact } from '../../apis/contacts';
import { FAKE_CONTACTS_0320 } from '../../constants/fakeContacts';
// import TrackPlayer from 'react-native-track-player';
import moment from 'moment';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import useBackHandler from '../../hooks/use-back-handler';
import useNavigationHook from '../../hooks/use_navigation';
import { ActivityIndicator, View } from 'react-native';
import colors from '../../constants/color';

const HomeScreen = () => {
  const navigation = useNavigationHook();
  const route = useRoute<any>().params;
  const userData: any = useSelector((state: any) => state.loginData);
  const { setConatctList, localConversations } = useContext(Context);
  const [data, setData] = useState<any>([]);
  const [onlineUserIds, setOnlineUserIds] = useState<any>([]);
  const [loader, setLoader] = useState<boolean | any>(true);
  const loaderTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  useBackHandler(navigation);

  const clearLoaderTimeout = useCallback(() => {
    if (loaderTimeoutRef.current) {
      clearTimeout(loaderTimeoutRef.current);
      loaderTimeoutRef.current = null;
    }
  }, []);

  const token = userData?.data?.token ?? userData?.token;

  const { refetch: getAllContac } = useQuery(
    ['get-allcontact', token],
    () => getAllContact(token),
    {
    onSuccess: response => {
      const arr: any[] = [];
      for (
        let index = 0;
        index < response?.data?.contactDetails?.length;
        index++
      ) {
        const obj = {
          name: response.data.contactDetails[index].firstName,
          desc: response.data.contactDetails[index].firstName,
          image: response.data.contactDetails[index].userProfile,
          id: response.data.contactDetails[index]._id,
          isOnline: onlineUserIds?.includes(
            response.data.contactDetails[index]._id,
          )
            ? true
            : false,
        };
        arr.push(obj);
      }
      const fakeMapped = FAKE_CONTACTS_0320.map((c) => ({
        name: c.displayName ?? c.name,
        desc: c.desc ?? c.name,
        image: c.profileImage,
        id: c.id,
        isOnline: false,
      }));
      setConatctList([...fakeMapped, ...arr]);
      setLoader(false);
    },
    onError: err => {
      setLoader(false);
    },
    enabled: !!token,
  });

  const BIKE_DEFAULT = 'motorcycle-bike-detailed-silhouette';
  const isDefaultImg = (url?: string) => !url || url.includes(BIKE_DEFAULT);

  const getConversationData = useCallback(() => {
    // Set listener first, then request sidebar so response is not missed
    socketServics.removeListener('conversation');
    socketServics.on('conversation', (data: any) => {
      clearLoaderTimeout();
      setLoader(false);
      const ConversationArr: any[] = [];
      for (let index = 0; index < data.length; index++) {
        if (data[index].group) {
          ConversationArr.push(data[index].group);
          socketServics.emit('joinGroup', { groupId: data[index].group._id });
        } else if (data[index].chanel) {
          ConversationArr.push(data[index].chanel);
          socketServics.emit('joinChanel', { groupId: data[index].chanel._id });
        } else if (_isEmpty(data[index].chanel || data[index].group)) {
          ConversationArr.push(data[index].userData[0] ?? userData?.data);
          socketServics.emit('joinDm', { groupId: userData?.data?._id });
        }
      }
      const subArr: any[] = [];
      const arr = [{ title: 'All Message', data: subArr }];
      for (let index = 0; index < ConversationArr.length; index++) {
        const lastMsg = data[index]?.lastMsg;
        subArr.push({
          ...ConversationArr[index],
          id: ConversationArr[index]?._id,
          name: ConversationArr[index]?.title ?? ConversationArr[index]?.userName,
          time: lastMsg?.createdAt
            ? moment.utc(lastMsg.createdAt).local().format('hh:mm A')
            : 'No messages',
          lastmsg: lastMsg?.replyMessage
            ? 'replied message'
            : lastMsg?.audioUrl
              ? 'sent a audio'
              : lastMsg?.docUrl
                ? 'sent a document'
                : lastMsg?.videoUrl
                  ? 'sent a video'
                  : lastMsg?.imageUrl
                    ? 'sent a image'
                    : lastMsg?.text ?? 'Tap to chat',
          profileImage:
            (!isDefaultImg(ConversationArr[index]?.groupProfile) ? ConversationArr[index]?.groupProfile : '') ||
            (!isDefaultImg(ConversationArr[index]?.chanelProfile) ? ConversationArr[index]?.chanelProfile : '') ||
            ConversationArr[index]?.userProfile || '',
          msgSeen: lastMsg?.seen ?? false,
          unseenMsg: data[index]?.unseenMsg ?? 0,
          sender: lastMsg?.msgByUserId == userData?.data?._id ? true : false,
          conversationId: data[index]?._id,
          type: ConversationArr[index]?.groupAdmin
            ? 'group'
            : ConversationArr[index]?.chanelAdmin
              ? 'chanel'
              : 'dm',
          blockUser: data[index]?.blockUser ?? [],
          bannedUsers: data[index]?.bannedUsers || ConversationArr[index]?.bannedUsers || [],
        });
      }
      setData(_isEmpty(arr[0].data) ? [] : arr);
    });
    setLoader(true);
    loaderTimeoutRef.current = setTimeout(() => {
      setLoader(false);
      loaderTimeoutRef.current = null;
    }, 2500);
    socketServics.onConnect(() => {
      setTimeout(() => {
        socketServics.emit('sidebar', userData?.data?._id);
      }, 300);
    });
  }, [userData?.data?._id, userData?.data, clearLoaderTimeout]);

  const mergedData = useMemo(() => {
    const serverList = data?.[0]?.data ?? [];
    const local = localConversations ?? [];
    const combined = [...local, ...serverList];
    return [{ title: 'All Message', data: combined }];
  }, [data, localConversations]);

  useEffect(() => {
    // Only initialize socket if user data is available and socket is not already connected
    if (userData?.token && userData?.data?._id && !socketServics.getConnectionStatus()) {
      socketServics.intializeSocket(userData.token, userData.data._id);
    }
  }, [userData?.token, userData?.data?._id]);

  useFocusEffect(
    useCallback(() => {

      socketServics.on('onlineUser', (data: any) => {
        setOnlineUserIds(data);
        getAllContac();
      });

      // Pehle listener, phir sidebar - isi order me
      getConversationData();

      return () => {
        socketServics.removeListener('onlineUser');
        if (loaderTimeoutRef.current) {
          clearTimeout(loaderTimeoutRef.current);
          loaderTimeoutRef.current = null;
        }
        // Keep 'conversation' listener so we get list updates when sending from chat screen
      };
    }, [getConversationData, getAllContac]),
  );

  return (
        <HomeScreenComponent
          Data={mergedData}
          isLoading={loader}
          refetch={() => {
            if (userData?.data?._id) socketServics.emit('sidebar', userData.data._id);
          }}
          listEmptyComponent={null}
          onTextValue={e => console.log(e)}
          onClickItem={() => {
            for (let index = 0; index < mergedData?.[0]?.data?.length; index++) {
              if (mergedData?.[0]?.data[index].type == 'group') {
                socketServics.emit('leaveGroup', {
                  groupId: mergedData?.[0]?.data[index].id,
                });
              } else if (mergedData?.[0]?.data[index].type == 'chanel') {
                socketServics.emit('leaveChanel', {
                  groupId: mergedData?.[0]?.data[index].id,
                });
              } else if (mergedData?.[0]?.data[index].type == 'dm') {
                socketServics.emit('leaveDm', { groupId: userData?.data?._id });
              }
            }
          }}
          onLablePress={() => { }}
        />
  );
};

export default HomeScreen;
