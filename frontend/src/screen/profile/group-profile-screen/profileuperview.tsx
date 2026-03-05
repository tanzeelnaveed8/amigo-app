import {
    Animated,
    Modal,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import useNavigationHook from '../../../hooks/use_navigation'
import RNText from '../../../component/atoms/text'
import fontSize from '../../../constants/font-size'
import fontWeight from '../../../constants/font-weight'
import { BlurView } from 'expo-blur'
import ContactContainer from '../../../component/atoms/contact-container'
import { props, props2 } from './data'
import Context from '../../../context'
import { Image as FastImage } from 'expo-image'
import { AlertCircle, Calendar, ChevronLeft, ChevronRight, Flag, Image, LogOut, MessageCircle, Settings, Users } from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'

// Pulsing glow for dialogs
const PulsingCircle = ({ color }: { color: string }) => {
    const anim = useRef(new Animated.Value(0)).current
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(anim, { toValue: 1, duration: 1000, useNativeDriver: true }),
                Animated.timing(anim, { toValue: 0, duration: 1000, useNativeDriver: true }),
            ])
        ).start()
    }, [])
    const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] })
    const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.1] })
    return (
        <Animated.View style={{
            position: 'absolute', width: 88, height: 88, borderRadius: 44,
            backgroundColor: color, opacity, transform: [{ scale }],
        }} />
    )
}

const MEDIA_PREVIEW: string[] = []

export const ProfileUperView = (p: props) => {
    const navigation = useNavigationHook()
    const {
        onProfileIcon,
        isSettingshow,
        data,
        onSettingIconPress,
        omHeaderRightIcon,
        onImageIconPress,
        onShareIconPress,
    } = p
    const { colors } = useContext(Context)
    const accent = colors.accentColor ?? '#3B82F6'
    const local = getStyles(colors, accent)

    const [showLeaveDialog, setShowLeaveDialog] = useState(false)
    const [showReportDialog, setShowReportDialog] = useState(false)

    const title = data?.title ?? 'Room'
    const bio = data?.bio ?? ''
    const participantsCount = Array.isArray(data?.participants) ? data.participants.length : 0
    const memberPreview = Array.isArray(data?.participants) ? data.participants.slice(0, 4) : []

    const avatarUri =
        data?.groupProfile && !String(data.groupProfile).includes('motorcycle-bike')
            ? data.groupProfile
            : null
    const initials = (title?.charAt(0) ?? 'R').toUpperCase()

    const openMembers = () => navigation.navigate('RoomMembersScreen' as any, { itemData: data, title })

    return (
        <View style={local.root}>

            {/* ── Header ── */}
            <SafeAreaView>
                <View style={local.topRow}>
                    <TouchableOpacity onPress={navigation.goBack} activeOpacity={0.8} style={local.topIconBtn}>
                        <ChevronLeft size={24} color={colors.secondaryText} />
                    </TouchableOpacity>
                    {isSettingshow ? (
                        <TouchableOpacity onPress={omHeaderRightIcon} activeOpacity={0.8} style={local.topIconBtn}>
                            <Settings size={20} color={colors.textColor} />
                        </TouchableOpacity>
                    ) : (
                        <View style={local.topIconPlaceholder} />
                    )}
                </View>
            </SafeAreaView>

            {/* ── Profile Row ── */}
            <View style={local.profileRow}>
                <View style={local.titleBlock}>
                    <RNText label="Room" fontSize={34} fontWeight={fontWeight._700} color={colors.textColor} style={local.roomWord} />
                    <RNText label={title} fontSize={34} fontWeight={fontWeight._700} color={accent} style={local.nameLine} />
                </View>
                <TouchableOpacity onPress={isSettingshow ? onProfileIcon : () => {}} activeOpacity={0.85} style={local.avatarWrap}>
                    <View style={local.avatarGlowBg} />
                    {avatarUri ? (
                        <FastImage source={{ uri: avatarUri }} style={local.avatar} />
                    ) : (
                        <View style={[local.avatar, local.avatarInitials, { backgroundColor: `${accent}22` }]}>
                            <Text style={{ fontSize: 28, fontWeight: '700', color: accent }}>{initials}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* ── Bio ── */}
            {!!bio && (
                <View style={[local.bioWrap, { borderLeftColor: accent }]}>
                    <RNText label={`"${bio}"`} fontSize={fontSize._15} fontWeight={fontWeight._400} color={colors.textColor} style={local.bioText} />
                </View>
            )}

            {/* ── Created Info Card ── */}
            <View style={local.infoCard}>
                <View style={local.infoLeft}>
                    <View style={[local.infoIconWrap, { backgroundColor: `${accent}22` }]}>
                        <Calendar size={16} color={accent} />
                    </View>
                    <View>
                        <RNText label="CREATED" fontSize={fontSize._11} fontWeight={fontWeight._700} color={colors.secondaryText} style={local.infoLabel} />
                        <RNText label={data?.createdAt ? new Date(data.createdAt).toDateString() : 'Unknown'} fontSize={fontSize._15} fontWeight={fontWeight._600} color={colors.textColor} />
                    </View>
                </View>
            </View>

            {/* ── Open Chat Button ── */}
            <TouchableOpacity activeOpacity={0.9} style={local.chatBtn} onPress={navigation.goBack}>
                <LinearGradient
                    colors={[accent, `${accent}CC`]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={local.chatBtnGradient}
                >
                    <MessageCircle size={18} color="#FFFFFF" />
                    <RNText label="Open Chat" fontSize={fontSize._16} fontWeight={fontWeight._700} color="#FFFFFF" />
                </LinearGradient>
            </TouchableOpacity>

            {/* ── Members Card ── */}
            <View style={local.membersCard}>
                <View style={local.membersHeader}>
                    <RNText label={`Members ${participantsCount}`} fontSize={fontSize._15} fontWeight={fontWeight._700} color={colors.textColor} />
                    <TouchableOpacity onPress={openMembers}>
                        <RNText label="VIEW ALL" fontSize={fontSize._11} fontWeight={fontWeight._700} color={colors.textColor} />
                    </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={local.membersScroller}>
                    {memberPreview.map((member: any, idx: number) => {
                        const fullName = `${member?.firstName ?? ''} ${member?.lastName ?? ''}`.trim() || member?.userName || 'Member'
                        const firstName = fullName.split(' ')[0]
                        const memberAvatarUri = member?.userProfile && !String(member.userProfile).includes('motorcycle-bike') ? member.userProfile : null
                        const memberInitial = firstName.charAt(0).toUpperCase()
                        return (
                            <TouchableOpacity key={`${member?._id ?? idx}`} onPress={openMembers} style={local.memberChip} activeOpacity={0.85}>
                                {memberAvatarUri ? (
                                    <FastImage source={{ uri: memberAvatarUri }} style={local.memberAvatar} />
                                ) : (
                                    <View style={[local.memberAvatar, local.memberAvatarInitials, { backgroundColor: `${accent}22` }]}>
                                        <Text style={{ fontSize: 18, fontWeight: '700', color: accent }}>{memberInitial}</Text>
                                    </View>
                                )}
                                <RNText label={firstName} fontSize={fontSize._11} fontWeight={fontWeight._500} color={colors.textColor} style={local.memberName} numberOfLines={1} />
                            </TouchableOpacity>
                        )
                    })}
                    <TouchableOpacity onPress={openMembers} style={local.memberMore} activeOpacity={0.85}>
                        <Users size={18} color={colors.secondaryText} />
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* ── Shared Media Card ── */}
            <View style={local.mediaCard}>
                <View style={local.mediaHeader}>
                    <RNText label="Shared Media" fontSize={fontSize._15} fontWeight={fontWeight._700} color={colors.textColor} />
                    <TouchableOpacity onPress={onImageIconPress}>
                        <RNText label="VIEW ALL" fontSize={fontSize._11} fontWeight={fontWeight._700} color={colors.textColor} />
                    </TouchableOpacity>
                </View>
                <View style={local.mediaRow}>
                    {MEDIA_PREVIEW.map((item) => (
                        <TouchableOpacity key={item} style={local.mediaThumb} onPress={onImageIconPress} activeOpacity={0.9}>
                            <FastImage source={{ uri: item }} style={StyleSheet.absoluteFill} />
                        </TouchableOpacity>
                    ))}
                    {MEDIA_PREVIEW.length === 0 && (
                        <RNText label="No shared media yet" fontSize={fontSize._12} fontWeight={fontWeight._500} color={colors.secondaryText} />
                    )}
                    <TouchableOpacity style={local.mediaPlaceholder} onPress={onImageIconPress}>
                        <Image size={18} color={colors.secondaryText} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* ── Settings / Report / Leave Card ── */}
            <View style={local.settingsCard}>

                {/* Room Settings */}
                <TouchableOpacity style={[local.settingsRow, local.settingsBorder]} onPress={onSettingIconPress} activeOpacity={0.85}>
                    <View style={local.settingsLeft}>
                        <View style={[local.settingsIconWrap, { backgroundColor: `${accent}22` }]}>
                            <Settings size={18} color={accent} />
                        </View>
                        <RNText label="Room Settings" fontSize={fontSize._15} fontWeight={fontWeight._500} color={colors.textColor} />
                    </View>
                    <ChevronRight size={16} color={colors.secondaryText} />
                </TouchableOpacity>

                {/* Report Room */}
                <TouchableOpacity style={[local.settingsRow, local.settingsBorder]} onPress={() => setShowReportDialog(true)} activeOpacity={0.85}>
                    <View style={local.settingsLeft}>
                        <View style={[local.settingsIconWrap, { backgroundColor: 'rgba(255,165,0,0.12)' }]}>
                            <AlertCircle size={18} color="#FFA500" />
                        </View>
                        <RNText label="Report Room" fontSize={fontSize._15} fontWeight={fontWeight._500} color={colors.textColor} />
                    </View>
                    <ChevronRight size={16} color={colors.secondaryText} />
                </TouchableOpacity>

                {/* Leave Room */}
                <TouchableOpacity style={local.settingsRow} onPress={() => setShowLeaveDialog(true)} activeOpacity={0.85}>
                    <View style={local.settingsLeft}>
                        <View style={[local.settingsIconWrap, { backgroundColor: 'rgba(255,99,99,0.12)' }]}>
                            <LogOut size={18} color="#FF6363" />
                        </View>
                        <RNText label="Leave Room" fontSize={fontSize._15} fontWeight={fontWeight._500} color="#FF6363" />
                    </View>
                    <ChevronRight size={16} color={colors.secondaryText} />
                </TouchableOpacity>
            </View>

            {/* ── Leave Room Dialog ── */}
            <Modal visible={showLeaveDialog} transparent animationType="fade" onRequestClose={() => setShowLeaveDialog(false)}>
                <Pressable style={local.backdrop} onPress={() => setShowLeaveDialog(false)}>
                    <Pressable onPress={() => {}}>
                        <View style={[local.dialogCard, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
                            <View style={local.dialogIconWrap}>
                                <PulsingCircle color="#FF6363" />
                                <View style={[local.dialogIconBox, { backgroundColor: 'rgba(255,99,99,0.2)', borderColor: 'rgba(255,99,99,0.3)' }]}>
                                    <LogOut size={32} color="#FF6363" strokeWidth={2} />
                                </View>
                            </View>
                            <RNText label={`Leave ${title}?`} fontSize={fontSize._20} fontWeight={fontWeight._700} color={colors.textColor} textAlign="center" style={{ marginTop: 16, marginBottom: 8 }} />
                            <RNText label="You will no longer have access to this room's messages and media. An admin can invite you back if needed." fontSize={fontSize._14} fontWeight={fontWeight._400} color={colors.secondaryText} textAlign="center" style={{ marginBottom: 24 }} />
                            <View style={local.dialogBtnRow}>
                                <TouchableOpacity onPress={() => setShowLeaveDialog(false)} style={[local.dialogBtn, local.dialogBtnCancel, { backgroundColor: colors.inputBGColor, borderColor: colors.borderColor }]} activeOpacity={0.85}>
                                    <RNText label="Cancel" fontSize={fontSize._15} fontWeight={fontWeight._600} color={colors.textColor} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { setShowLeaveDialog(false); navigation.goBack() }} style={[local.dialogBtn, { backgroundColor: '#FF6363' }]} activeOpacity={0.85}>
                                    <RNText label="Leave Room" fontSize={fontSize._15} fontWeight={fontWeight._600} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* ── Report Room Dialog ── */}
            <Modal visible={showReportDialog} transparent animationType="fade" onRequestClose={() => setShowReportDialog(false)}>
                <Pressable style={local.backdrop} onPress={() => setShowReportDialog(false)}>
                    <Pressable onPress={() => {}}>
                        <View style={[local.dialogCard, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
                            <View style={local.dialogIconWrap}>
                                <PulsingCircle color="#FFA500" />
                                <View style={[local.dialogIconBox, { backgroundColor: 'rgba(255,165,0,0.2)', borderColor: 'rgba(255,165,0,0.3)' }]}>
                                    <AlertCircle size={32} color="#FFA500" strokeWidth={2} />
                                </View>
                            </View>
                            <RNText label="Report Room?" fontSize={fontSize._20} fontWeight={fontWeight._700} color={colors.textColor} textAlign="center" style={{ marginTop: 16, marginBottom: 8 }} />
                            <RNText label="Report this room for spam or inappropriate content. Recent messages will be forwarded to our moderation team for review." fontSize={fontSize._14} fontWeight={fontWeight._400} color={colors.secondaryText} textAlign="center" style={{ marginBottom: 24 }} />
                            <View style={local.dialogBtnRow}>
                                <TouchableOpacity onPress={() => setShowReportDialog(false)} style={[local.dialogBtn, local.dialogBtnCancel, { backgroundColor: colors.inputBGColor, borderColor: colors.borderColor }]} activeOpacity={0.85}>
                                    <RNText label="Cancel" fontSize={fontSize._15} fontWeight={fontWeight._600} color={colors.textColor} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setShowReportDialog(false)} style={[local.dialogBtn, { backgroundColor: '#FFA500' }]} activeOpacity={0.85}>
                                    <RNText label="Report Room" fontSize={fontSize._15} fontWeight={fontWeight._600} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    )
}

export const ModalContent = (p: props2) => {
    const { dropdown, isvisible, item } = p
    const { colors } = useContext(Context)

    return (
        <>
            {isvisible && <BlurView
                style={localAbsolute.absolute}
                blurType="light"
                blurAmount={10}
                reducedTransparencyFallbackColor={colors.transparent}
            />}
            {isvisible && <View style={{ position: 'absolute', top: Platform.OS === 'ios' ? dropdown + 30 : dropdown - 15, left: 20 }}>
                <ContactContainer
                    name={item.firstName + ' ' + item.lastName}
                    desc={item.userName}
                    image={item.userProfile}
                    desccolor={colors.secondaryText}
                    namecolor={colors.textColor}
                    textpaddingHorizontal={15}
                />
            </View>}
        </>
    )
}

const getStyles = (colors: any, accent: string) =>
    StyleSheet.create({
        root: { paddingBottom: 8 },

        // Header
        topRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: Platform.OS === 'android' ? 8 : 0,
            marginBottom: 8,
            paddingHorizontal: 20,
        },
        topIconBtn: {
            width: 36,
            height: 36,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.cardBg,
            borderWidth: 1,
            borderColor: colors.borderColor,
        },
        topIconPlaceholder: { width: 36, height: 36 },

        // Profile row
        profileRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginTop: 2,
            marginBottom: 22,
            paddingHorizontal: 20,
        },
        titleBlock: { flex: 1, paddingRight: 12 },
        roomWord: { marginTop: 2, lineHeight: 36 },
        nameLine: { marginTop: 0, lineHeight: 37 },
        avatarWrap: { position: 'relative' },
        avatarGlowBg: {
            position: 'absolute',
            width: 100,
            height: 100,
            borderRadius: 50,
            top: -6,
            left: -6,
            backgroundColor: accent,
            opacity: 0.25,
        },
        avatar: {
            width: 88,
            height: 88,
            borderRadius: 44,
            borderWidth: 3,
            borderColor: `${accent}50`,
        },
        avatarInitials: {
            alignItems: 'center',
            justifyContent: 'center',
        },

        // Bio
        bioWrap: {
            paddingLeft: 18,
            borderLeftWidth: 3,
            paddingVertical: 6,
            marginBottom: 16,
            marginHorizontal: 20,
        },
        bioText: { fontStyle: 'italic', opacity: 0.92, lineHeight: 22 },

        // Info card
        infoCard: {
            padding: 16,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.borderColor,
            backgroundColor: colors.cardBg,
            marginBottom: 14,
            marginHorizontal: 20,
        },
        infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
        infoIconWrap: {
            width: 34,
            height: 34,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
        },
        infoLabel: { letterSpacing: 1.1, opacity: 0.8, marginBottom: 2 },

        // Chat button
        chatBtn: { marginBottom: 14, marginHorizontal: 20 },
        chatBtnGradient: {
            borderRadius: 20,
            paddingVertical: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
        },

        // Members
        membersCard: {
            paddingVertical: 14,
            paddingHorizontal: 14,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.borderColor,
            backgroundColor: colors.cardBg,
            marginBottom: 14,
            marginHorizontal: 20,
        },
        membersHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
        },
        membersScroller: { paddingRight: 6, gap: 12 },
        memberChip: { width: 62, alignItems: 'center' },
        memberAvatar: {
            width: 58,
            height: 58,
            borderRadius: 29,
            borderWidth: 2,
            borderColor: colors.borderColor,
        },
        memberAvatarInitials: {
            alignItems: 'center',
            justifyContent: 'center',
        },
        memberName: { marginTop: 6, textAlign: 'center' },
        memberMore: {
            width: 58,
            height: 58,
            borderRadius: 29,
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: colors.borderColor,
            alignItems: 'center',
            justifyContent: 'center',
        },

        // Media
        mediaCard: {
            padding: 16,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.borderColor,
            backgroundColor: colors.cardBg,
            marginBottom: 14,
            marginHorizontal: 20,
        },
        mediaHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
        },
        mediaRow: { flexDirection: 'row', gap: 8 },
        mediaThumb: {
            width: 58,
            height: 80,
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: '#1F2937',
        },
        mediaPlaceholder: {
            width: 58,
            height: 80,
            borderRadius: 12,
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: colors.borderColor,
            alignItems: 'center',
            justifyContent: 'center',
        },

        // Settings card
        settingsCard: {
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.borderColor,
            backgroundColor: colors.cardBg,
            overflow: 'hidden',
            marginBottom: 14,
            marginHorizontal: 20,
        },
        settingsRow: {
            minHeight: 52,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 14,
        },
        settingsBorder: {
            borderBottomWidth: 1,
            borderBottomColor: colors.borderColor,
        },
        settingsLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
        settingsIconWrap: {
            width: 32,
            height: 32,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
        },

        // Dialogs
        backdrop: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.7)',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24,
        },
        dialogCard: {
            width: '100%',
            borderRadius: 24,
            borderWidth: 1,
            padding: 24,
            alignItems: 'center',
        },
        dialogIconWrap: {
            width: 88,
            height: 88,
            alignItems: 'center',
            justifyContent: 'center',
        },
        dialogIconBox: {
            width: 72,
            height: 72,
            borderRadius: 36,
            borderWidth: 2,
            alignItems: 'center',
            justifyContent: 'center',
        },
        dialogBtnRow: { flexDirection: 'row', gap: 12, width: '100%' },
        dialogBtn: {
            flex: 1,
            height: 48,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
        },
        dialogBtnCancel: { borderWidth: 1 },
    })

const localAbsolute = StyleSheet.create({
    absolute: { position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 },
})
