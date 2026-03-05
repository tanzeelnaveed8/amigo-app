import { Platform, Pressable, StyleSheet, Text, View, Dimensions } from 'react-native'
import React, { useContext } from 'react'
import useMergedStyle from './styles'
import Context from '../../context'
import ChatContainer from '../atoms/chat-container'
import { BlurView } from 'expo-blur'
import ChatSettingModal from '../atoms/chat-setting-modal'
import { getWidthInPercentage } from '../../utils/dimensions'
import { Pencil, Copy, Trash2, Reply, Share2 } from 'lucide-react-native'
import type { SettingItem } from './data'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

export interface props2 {
    isvisible?: boolean
    item?: any
    dropdown?: any
    onClose?: () => void
    onClickItem: (e: any) => void
}

export const userAction: SettingItem[] = [
    { name: 'Edit', Icon: Pencil },
    { name: 'Copy', Icon: Copy },
    { name: 'Delete', Icon: Trash2, destructive: true },
    { name: 'Reply', Icon: Reply },
    { name: 'Forward', Icon: Share2 },
]


const MessageAction = (props: props2) => {
    const { onClickItem, onClose, dropdown, isvisible, item } = props
    const { colors } = useContext(Context)
    const styles = useMergedStyle(colors)

    // Calculate if message is near bottom of screen
    // If there's not enough space below (less than 300px), position actions above the message
    const ACTION_MENU_HEIGHT = 250 // Approximate height of message + action buttons
    const isNearBottom = dropdown + ACTION_MENU_HEIGHT > SCREEN_HEIGHT

    // Calculate top position based on screen position
    let topPosition
    if (isNearBottom) {
        // Position above the message when near bottom
        topPosition = dropdown - (Platform.OS === 'ios' ? 280 : 300)
    } else {
        // Normal position below/at message
        topPosition = Platform.OS === 'ios' ? dropdown - 75 : dropdown - 90
    }

    return (
        <>
            {isvisible && <BlurView
                style={styles.absolute}
                intensity={40}
                tint="dark"
                pointerEvents="none"
            />}
            {isvisible &&
                <Pressable
                    style={[styles.absolute, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                    onPress={onClose}
                />}
            {isvisible &&
                <View style={{ position: 'absolute', top: topPosition, left: item.person !== 'sender' ? 20 : 0, right: item.person == 'sender' ? 20 : 0, zIndex: 10, elevation: 10 }}>
                    <ChatContainer
                        message={item.message}
                        person={item.person}
                        type={item.type}
                        image={item.image}
                        isdeleted={item.isdeleted}
                        Doc={item.doc}
                        replay={item.replay}
                        audio={item.audio}
                        video={item.video}
                        time={item.time ?? '10:00 am'}
                        senderProfile={item.senderProfile}
                        receiverProfile={item.receiverProfile}
                        onMessagePress={() => { }}
                    />
                    <View>
                        <ChatSettingModal
                            top={0}
                            left={item.person == 'sender' ? getWidthInPercentage(50) : getWidthInPercentage(2)}
                            alignItems='center'
                            width={'30%'}
                            data={userAction}
                            isvisible={isvisible}
                            onClickItem={(value) => {
                                onClickItem(value);
                            }}
                        />
                    </View>
                </View>
            }
        </>
    )
}

export default MessageAction

