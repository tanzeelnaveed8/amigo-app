import { Platform, Pressable, TouchableOpacity, View, Dimensions } from 'react-native'
import React, { useContext, useState } from 'react'
import Context from '../../context'
import useMergedStyle from './styles'
import { BlurView } from 'expo-blur'
import ChatContainer from '../atoms/chat-container'
import LikeIcon from '../../assets/svg/like.icon'
import DisLikeIcon from '../../assets/svg/dislike.icon'
import Emoji1Icon from '../../assets/svg/emoji1.icon'
import EmojiPicker from 'rn-emoji-keyboard'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

export interface props2 {
    isvisible?: boolean
    item?: any
    dropdown?: any
    onClose?: () => void
    onEmojiPress: (e: any) => void
}

export const ModalContentForChanel = (props: props2) => {
    const { onEmojiPress, onClose, dropdown, isvisible, item } = props
    const { colors } = useContext(Context)
    const styles = useMergedStyle(colors)
    const [emojiPick, setEmojiPick] = useState(false);

    // Calculate if message is near bottom of screen
    const ACTION_MENU_HEIGHT = 180 // Approximate height for channel actions (smaller than regular actions)
    const isNearBottom = dropdown + ACTION_MENU_HEIGHT > SCREEN_HEIGHT

    // Calculate top position based on screen position
    let topPosition
    if (isNearBottom) {
        // Position above the message when near bottom
        topPosition = dropdown - (Platform.OS === 'ios' ? 250 : 270)
    } else {
        // Normal position below/at message
        topPosition = Platform.OS === 'ios' ? dropdown - 80 : dropdown - 95
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
                <View style={{ position: 'absolute', top: topPosition, left: 20, zIndex: 10, elevation: 10 }}>
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, alignSelf: 'flex-end', }}>
                        <TouchableOpacity onPress={() => onEmojiPress('🤔')}>
                            <Emoji1Icon size={22} />
                            <EmojiPicker enableRecentlyUsed onEmojiSelected={({ emoji }) => console.log(emoji)} open={emojiPick} onClose={() => setEmojiPick(false)} />
                        </TouchableOpacity>
                        <TouchableOpacity style={{ paddingHorizontal: 15 }} onPress={() => onEmojiPress('👍')}>
                            <LikeIcon size={22} />
                            <EmojiPicker onEmojiSelected={({ emoji }) => console.log(emoji)} open={emojiPick} onClose={() => setEmojiPick(false)} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onEmojiPress('👎')}>
                            <DisLikeIcon size={22} />
                            <EmojiPicker onEmojiSelected={({ emoji }) => console.log(emoji)} open={emojiPick} onClose={() => setEmojiPick(false)} />
                        </TouchableOpacity>
                    </View>
                </View>
            }
        </>
    )
}
