import React, { useContext, useEffect, useState, useRef, useCallback } from 'react'
import ChatComponent from '../../../component/chat-component'
import { useRoute } from '@react-navigation/native'
import { useMutation } from 'react-query'
import { ExiteGroup } from '../../../apis/group'
import Context from '../../../context'
import useNavigationHook from '../../../hooks/use_navigation'
import { useSelector } from 'react-redux'
import socketServics from '../../../utils/socket'
import { UploadImage } from '../../../apis/auth'
import moment from 'moment'
import { GroupChatSettingData } from '../../../component/chat-component/data'

const ChatScreen = () => {
    const navigation = useNavigationHook()
    const route = useRoute<any>().params
    const userData: any = useSelector((state: any) => state.loginData);
    const { setLoader, shareMsg, setToastMsg } = useContext(Context)
    const [mediaItem, setMediaItem] = useState<any>([])
    const [msgData, setMsgData] = useState<any>([])
    const [isLoading, setIsLoading] = useState(false)
    const [record, setRecord] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    // Store pending message to send after upload completes
    const pendingMessageRef = useRef<{text: string; type: string; replayText?: string} | null>(null)
    const GroupPagedata = {
        userId: userData?.data?._id,
        sender: userData?.data?._id,
        groupId: route?.itemData._id,
    }

    const { mutate: exitGroup } = useMutation(ExiteGroup, {
        onSuccess: (res) => {
            setLoader(false)
            navigation.goBack()
        },
        onError: () => {
            setLoader(false)
            console.log('EXIT_GROUP_ERROR');
        },
    });

    const { mutate: uploadImage } = useMutation(UploadImage, {
        onSuccess: (res) => {
            setIsUploading(false)
            setMediaItem(res.data)

            // Handle audio recording auto-send
            if (record && res.data?.mediaurl) {
                sendMessageWithMedia('', 'audio', res.data.mediaurl)
                setRecord(false)
                return
            }

            // If there's a pending message, send it now with the uploaded media URL
            if (pendingMessageRef.current && res.data?.mediaurl) {
                const { text, type, replayText } = pendingMessageRef.current
                sendMessageWithMedia(text, type, res.data.mediaurl, replayText)
                pendingMessageRef.current = null
            }
        },
        onError: () => {
            setIsUploading(false)
            setToastMsg('Failed to upload media. Please try again.')
            pendingMessageRef.current = null
            console.log('UPLOAD_IMAGE_ERROR');
        },
    });

    // Helper function to send message with media URL
    const sendMessageWithMedia = useCallback((text: string, type: string, mediaUrl: string, replayText?: string) => {
        const participent = []
        for (let index = 0; index < route?.itemData?.participants.length; index++) {
            participent.push(route?.itemData?.participants[index])
        }
        let chatData = {}
        switch (type) {
            case 'image':
                chatData = {
                    sender: userData?.data?._id,
                    text: text,
                    imageUrl: mediaUrl,
                    msgByUserId: userData?.data?._id,
                    groupId: route?.itemData._id,
                    participent: participent,
                    conversationId: route?.itemData?.conversationId,
                    replyMessage: replayText
                }
                break;
            case 'doc':
                chatData = {
                    sender: userData?.data?._id,
                    text: text,
                    docUrl: mediaUrl,
                    msgByUserId: userData?.data?._id,
                    groupId: route?.itemData._id,
                    participent: participent,
                    conversationId: route?.itemData?.conversationId,
                    replyMessage: replayText
                }
                break;
            case 'audio':
                chatData = {
                    sender: userData?.data?._id,
                    text: text,
                    audioUrl: mediaUrl,
                    msgByUserId: userData?.data?._id,
                    groupId: route?.itemData._id,
                    participent: participent,
                    conversationId: route?.itemData?.conversationId,
                    replyMessage: replayText
                }
                break;
            case 'video':
                chatData = {
                    sender: userData?.data?._id,
                    text: text,
                    videoUrl: mediaUrl,
                    msgByUserId: userData?.data?._id,
                    groupId: route?.itemData._id,
                    participent: participent,
                    conversationId: route?.itemData?.conversationId,
                    replyMessage: replayText
                }
                break;
            default:
                return;
        }
        socketServics.emit('group-message', chatData)
    }, [userData?.data?._id, route?.itemData]);

    const onSendMessage = (text: string, type: string, replayText?: string) => {
        // For text messages, send immediately
        if (type === 'text') {
            const participent = []
            for (let index = 0; index < route?.itemData?.participants.length; index++) {
                participent.push(route?.itemData?.participants[index])
            }
            const chatData = {
                sender: userData?.data?._id,
                text: text,
                msgByUserId: userData?.data?._id,
                groupId: route?.itemData._id,
                participent: participent,
                conversationId: route?.itemData?.conversationId,
                replyMessage: replayText
            }
            socketServics.emit('group-message', chatData)
            return
        }

        // For media messages, check if we have the shareMsg URL first
        const sharedMediaUrl = shareMsg?.image || shareMsg?.doc || shareMsg?.audio || shareMsg?.video
        if (sharedMediaUrl) {
            sendMessageWithMedia(text, type, sharedMediaUrl, replayText)
            return
        }

        // Check if upload is still in progress
        if (isUploading || !mediaItem?.mediaurl) {
            // Store the message to send after upload completes
            pendingMessageRef.current = { text, type, replayText }
            console.log('Upload in progress, message will be sent after upload completes')
            return
        }

        // Upload is complete, send with the uploaded media URL
        sendMessageWithMedia(text, type, mediaItem.mediaurl, replayText)
    }

    useEffect(() => {
        const SeenData = {
            conversationId: route?.itemData?.conversationId,
            msgByUserId: userData?.data?._id,
            userId: userData?.data?._id
        }
        setIsLoading(true)
        socketServics.emit('group-message-page', GroupPagedata)
        socketServics.emit('joinGroup', { groupId: route?.itemData._id })
        socketServics.on('message', (data: any) => {
            setTimeout(() => {
                setIsLoading(false)
            }, 1000);
            const seen = new Set<string>();
            const arr: any[] = []
            const sorted = [...data].sort((a: any, b: any) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            for (let index = 0; index < sorted.length; index++) {
                const msgId = sorted[index]._id;
                if (seen.has(msgId)) continue;
                seen.add(msgId);
                const obj = {
                    id: msgId,
                    message: sorted[index].text,
                    person: sorted[index].msgByUserId._id == userData?.data?._id ? 'sender' : 'reciver',
                    type: sorted[index]?.replyMessage ? 'replay' : sorted[index].imageUrl ? 'image' : sorted[index].docUrl ? 'doc' : sorted[index].audioUrl ? 'audio' : sorted[index].videoUrl ? 'video' : 'text',
                    image: sorted[index].imageUrl ?? null,
                    doc: sorted[index].docUrl ?? null,
                    audio: sorted[index].audioUrl ?? null,
                    video: sorted[index].videoUrl ?? '',
                    isdeleted: '0',
                    time: moment.utc(sorted[index].createdAt).local().format('hh:mm A'),
                    replay: sorted[index]?.replyMessage,
                    senderProfile: sorted[index].msgByUserId?.userProfile ?? userData?.data?.userProfile,
                    receiverProfile: route?.itemData?.profileImage,
                    senderName: sorted[index].msgByUserId?.firstName != null
                        ? (sorted[index].msgByUserId?.firstName + (sorted[index].msgByUserId?.lastName ? ' ' + sorted[index].msgByUserId.lastName : '')).trim()
                        : sorted[index].msgByUserId?.userName ?? undefined,
                }
                arr.push(obj)
            }
            setMsgData(arr);
        })
        if (Number(route?.itemData?.unseenMsg) > 0) {
            socketServics.emit('seen', SeenData)
        }
        return () => {
            socketServics.removeListener('group-message-page')
            socketServics.removeListener('seen')
        }
    }, [])

    return (
        <ChatComponent
            onRecording={(e) => {
                setRecord(true)
                setIsUploading(true)
                const formData = new FormData()
                formData.append('conversationId', route?.itemData?.conversationId)
                formData.append('mediaType', 'audio')
                formData.append('images', {
                    uri: e,
                    type: "audio/mp4",
                    name: 'recording.mp4'
                })
                uploadImage(formData)
            }}
            itemData={route?.itemData}
            chatData={msgData}
            isLoading={isLoading}
            shareMsgdata={shareMsg}
            settingData={GroupChatSettingData}
            isChanel={false}
            isGroup
            onReplayMsg={(e, text) => {
                onSendMessage(e.message, e.type, text)
            }}
            onDeleteMsg={(e) => {
                const data = {
                    smsId: e.id,
                    conversationId: route?.itemData?.conversationId,
                }
                socketServics.emit('delete-sms', data)
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
                // Don't use full-screen loader - just track upload state
                setIsUploading(true)
                setMediaItem([])
                pendingMessageRef.current = null
                const formData = new FormData()
                formData.append('conversationId', route?.itemData?.conversationId)
                formData.append('mediaType', e[1])
                formData.append('images', {
                    uri: e[0].uri,
                    type: e[0].type,
                    name: e[0].fileName || e[0].name
                })
                uploadImage(formData)
            }}
            isMediaUploading={isUploading}
            onExiteGroup={() => {
                setLoader(true)
                exitGroup({ groupId: route?.itemData._id })
            }}
            onClearChat={() => {
                setLoader(true)
                socketServics.emit('clear-conversation', route?.itemData?.conversationId)
                setTimeout(() => {
                    setLoader(false)
                    setMsgData([])
                }, 2000)
            }}
            onEditMsg={(e, text) => {
                const data = {
                    smsId: e.id,
                    text: text,
                }
                const groupdata = {
                    userId: userData?.data?._id,
                    sender: userData?.data?._id,
                    groupId: route?.itemData._id,
                }
                socketServics.emit('edit-sms', data)
                socketServics.emit('group-message-page', groupdata)
            }}
            onSendMsg={(value, type) => onSendMessage(value, type)}
            onBlockUser={() => { }}
            onExiteChanel={() => { }}
            onUnBlockUser={() => { }}
            onReaction={() => { }}
            onBanUser={(userId) => {
                socketServics.emit('ban-group-user', {
                    groupId: route?.itemData._id,
                    userId: userId,
                });
            }} />
    )
}

export default ChatScreen
