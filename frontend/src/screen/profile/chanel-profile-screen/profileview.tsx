import {
    Animated,
    Dimensions,
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
import Context from '../../../context'
import { Image as FastImage } from 'expo-image'
import * as Clipboard from 'expo-clipboard'
import {
    ArrowLeft,
    AtSign,
    Check,
    ChevronRight,
    Copy,
    Flag,
    Ghost,
    Globe,
    LogOut,
    Megaphone,
    Search,
    Settings,
    Users,
} from 'lucide-react-native'
import { props, props2 } from './data'
import { BlurView } from 'expo-blur'
import ContactContainer from '../../../component/atoms/contact-container'

// Pulsing circle used inside Leave/Report dialogs
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
        <Animated.View
            style={{
                position: 'absolute', width: 88, height: 88, borderRadius: 44,
                backgroundColor: color, opacity, transform: [{ scale }],
            }}
        />
    )
}

const { height: SCREEN_H, width: SCREEN_W } = Dimensions.get('window')

const GHOST_CONFIG = [
    { top: SCREEN_H * 0.08, left: SCREEN_W * 0.08, right: undefined as number | undefined, size: 24 },
    { top: SCREEN_H * 0.28, left: undefined as number | undefined, right: SCREEN_W * 0.12, size: 32 },
    { top: SCREEN_H * 0.55, left: SCREEN_W * 0.18, right: undefined as number | undefined, size: 28 },
    { top: SCREEN_H * 0.72, left: undefined as number | undefined, right: SCREEN_W * 0.08, size: 20 },
    { top: SCREEN_H * 0.12, left: SCREEN_W * 0.38, right: undefined as number | undefined, size: 18 },
]

const DELAYS = [0, 600, 1200, 300, 900]

const FloatingGhost = ({ config, delay }: { config: typeof GHOST_CONFIG[0]; delay: number }) => {
    const translateY = useRef(new Animated.Value(0)).current

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(translateY, { toValue: -15, duration: 2000, delay, useNativeDriver: true }),
                Animated.timing(translateY, { toValue: 0, duration: 2000, useNativeDriver: true }),
            ])
        )
        loop.start()
        return () => loop.stop()
    }, [])

    const posStyle: any = { position: 'absolute', top: config.top, opacity: 0.07 }
    if (config.left !== undefined) posStyle.left = config.left
    if (config.right !== undefined) posStyle.right = config.right

    return (
        <Animated.View pointerEvents="none" style={[posStyle, { transform: [{ translateY }] }]}>
            <Ghost size={config.size} color="#9B7BFF" />
        </Animated.View>
    )
}

export const ProfileUperView = (p: props) => {
    const navigation = useNavigationHook()
    const {
        isSettingshow,
        onSettingIconPress,
        omHeaderRightIcon,
        data,
        setShowSearch,
        onCallIconPress,
        onImageIconPress,
        onShareIconPress,
        onVideoIconPress,
        onProfileIcon,
    } = p

    const ctx = useContext(Context)
    const colors = ctx?.colors ?? {}
    const themeMode = (ctx as any)?.themeMode ?? 'dark'

    const [copied, setCopied] = useState(false)
    const [showLeaveDialog, setShowLeaveDialog] = useState(false)
    const [showReportDialog, setShowReportDialog] = useState(false)
    const s = getStyles(colors)

    const accent = colors.accentColor ?? '#9B7BFF'
    const isGhostMode = themeMode === 'ghost'

    const title = data?.title ?? 'Signal'
    const bio = data?.bio ?? ''
    const username = data?.username ? `@${data.username}` : '@signal'
    const participantsCount = Array.isArray(data?.participants) ? data.participants.length : 0
    const chanelId = data?._id ?? data?.id ?? ''
    const avatarUri =
        data?.chanelProfile && !String(data.chanelProfile).includes('motorcycle-bike')
            ? data.chanelProfile
            : null
    const initials = (title?.charAt(0) ?? 'S').toUpperCase()

    const handleCopy = async () => {
        await Clipboard.setStringAsync(username.replace('@', ''))
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    const handleLeaveSignal = () => setShowLeaveDialog(true)
    const handleReportSignal = () => setShowReportDialog(true)

    return (
        <View style={[s.root, { backgroundColor: colors.primary }]}>

            {/* ── Ghost Background Pattern (ghost theme only) ── */}
            {isGhostMode && (
                <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                    {GHOST_CONFIG.map((cfg, i) => (
                        <FloatingGhost key={i} config={cfg} delay={DELAYS[i]} />
                    ))}
                </View>
            )}

            {/* ── Header ── */}
            <SafeAreaView>
                <View style={[s.header, { marginTop: Platform.OS === 'android' ? 8 : 0 }]}>
                    <TouchableOpacity
                        onPress={navigation.goBack}
                        activeOpacity={0.8}
                        style={[s.headerBtn, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}
                    >
                        <ArrowLeft size={24} color={colors.secondaryText} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={s.scrollContent}
            >
                {/* ── Profile Row ── */}
                <View style={s.profileRow}>
                    <View style={s.titleBlock}>
                        <RNText
                            label="Signal Profile"
                            fontSize={fontSize._15}
                            fontWeight={fontWeight._500}
                            color={colors.secondaryText}
                            style={{ marginBottom: 4 }}
                        />
                        <RNText
                            label={title}
                            fontSize={fontSize._32}
                            fontWeight={fontWeight._700}
                            color={accent}
                            style={{ lineHeight: 38 }}
                            numberOfLines={2}
                        />
                    </View>
                    <TouchableOpacity
                        onPress={isSettingshow ? onProfileIcon : () => {}}
                        activeOpacity={0.85}
                        style={s.avatarWrap}
                    >
                        <View style={[s.avatarGlow, { backgroundColor: accent }]} />
                        {avatarUri ? (
                            <FastImage source={{ uri: avatarUri }} style={[s.avatar, { borderColor: `${accent}50` }]} />
                        ) : (
                            <View style={[s.avatar, s.avatarInitials, { backgroundColor: `${accent}22`, borderColor: `${accent}50` }]}>
                                <Text style={{ fontSize: 22, fontWeight: '700', color: accent }}>{initials}</Text>
                            </View>
                        )}
                        <View style={[s.badge, { borderColor: colors.primary }]}>
                            <Megaphone size={10} color="#FFFFFF" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* ── Action Buttons ── */}
                <View style={s.actionRow}>
                    <TouchableOpacity
                        onPress={setShowSearch}
                        style={[s.searchBtn, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}
                        activeOpacity={0.9}
                    >
                        <Search size={18} color={colors.textColor} />
                        <RNText label="Search" fontSize={fontSize._15} fontWeight={fontWeight._600} color={colors.textColor} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={onShareIconPress}
                        style={[s.globeBtn, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}
                        activeOpacity={0.9}
                    >
                        <Globe size={20} color={colors.textColor} />
                    </TouchableOpacity>
                </View>

                {/* ── Username Pill ── */}
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={handleCopy}
                    style={[s.usernameCard, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}
                >
                    <View style={s.rowLeft}>
                        <View style={[s.usernameIconWrap, { backgroundColor: `${accent}22` }]}>
                            <AtSign size={16} color={accent} />
                        </View>
                        <View>
                            <RNText
                                label="USERNAME"
                                fontSize={fontSize._11}
                                fontWeight={fontWeight._700}
                                color={colors.secondaryText}
                                style={{ letterSpacing: 1.1, opacity: 0.7, marginBottom: 2 }}
                            />
                            <RNText
                                label={username}
                                fontSize={fontSize._15}
                                fontWeight={fontWeight._600}
                                color={colors.textColor}
                            />
                        </View>
                    </View>
                    {copied
                        ? <Check size={18} color="#22C55E" />
                        : <Copy size={18} color={colors.secondaryText} />
                    }
                </TouchableOpacity>

                {/* ── About / Info Card ── */}
                <View style={[s.card, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
                    <RNText
                        label="ABOUT"
                        fontSize={fontSize._11}
                        fontWeight={fontWeight._700}
                        color={colors.secondaryText}
                        style={{ letterSpacing: 1.1, opacity: 0.7, marginBottom: 8 }}
                    />
                    <RNText
                        label={bio || 'No signal description available.'}
                        fontSize={fontSize._15}
                        fontWeight={fontWeight._400}
                        color={colors.textColor}
                        style={{ lineHeight: 22 }}
                    />
                    <View style={s.subscriberRow}>
                        <Users size={15} color={colors.secondaryText} />
                        <RNText
                            label={`${participantsCount} Subscribers`}
                            fontSize={fontSize._14}
                            fontWeight={fontWeight._500}
                            color={colors.textColor}
                            style={{ marginLeft: 6 }}
                        />
                    </View>
                </View>

                {/* ── Signal Media Card ── */}
                <View style={[s.card, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
                    <View style={s.mediaHeader}>
                        <RNText
                            label="Signal Media"
                            fontSize={fontSize._17}
                            fontWeight={fontWeight._700}
                            color={colors.textColor}
                        />
                        <TouchableOpacity onPress={onImageIconPress} activeOpacity={0.8}>
                            <RNText
                                label="VIEW ALL"
                                fontSize={fontSize._11}
                                fontWeight={fontWeight._700}
                                color={accent}
                            />
                        </TouchableOpacity>
                    </View>
                    <RNText
                        label="No shared media yet"
                        fontSize={fontSize._12}
                        fontWeight={fontWeight._500}
                        color={colors.secondaryText}
                    />
                </View>

                {/* ── Settings / Leave / Report Card ── */}
                <View style={[s.settingsCard, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>

                    {/* Signal Settings */}
                    <TouchableOpacity
                        style={[s.settingsRow, s.rowBorder, { borderBottomColor: colors.borderColor }]}
                        onPress={onSettingIconPress}
                        activeOpacity={0.85}
                    >
                        <View style={s.rowLeft}>
                            <View style={[s.rowIconWrap, { backgroundColor: `${colors.secondaryText}22` }]}>
                                <Settings size={18} color={colors.textColor} />
                            </View>
                            <RNText
                                label="Signal Settings"
                                fontSize={fontSize._15}
                                fontWeight={fontWeight._500}
                                color={colors.textColor}
                            />
                        </View>
                        <ChevronRight size={16} color={colors.secondaryText} />
                    </TouchableOpacity>

                    {/* Leave Signal */}
                    <TouchableOpacity
                        style={[s.settingsRow, s.rowBorder, { borderBottomColor: colors.borderColor }]}
                        onPress={handleLeaveSignal}
                        activeOpacity={0.85}
                    >
                        <View style={s.rowLeft}>
                            <View style={[s.rowIconWrap, { backgroundColor: 'rgba(255,99,99,0.12)' }]}>
                                <LogOut size={18} color="#FF6363" />
                            </View>
                            <RNText
                                label="Leave Signal"
                                fontSize={fontSize._15}
                                fontWeight={fontWeight._500}
                                color="#FF6363"
                            />
                        </View>
                    </TouchableOpacity>

                    {/* Report Signal */}
                    <TouchableOpacity
                        style={s.settingsRow}
                        onPress={handleReportSignal}
                        activeOpacity={0.85}
                    >
                        <View style={s.rowLeft}>
                            <View style={[s.rowIconWrap, { backgroundColor: 'rgba(245,158,11,0.12)' }]}>
                                <Flag size={18} color="#F59E0B" />
                            </View>
                            <RNText
                                label="Report Signal"
                                fontSize={fontSize._15}
                                fontWeight={fontWeight._500}
                                color="#F59E0B"
                            />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* ── Manage Participants (admin only) ── */}
                {isSettingshow && (
                    <TouchableOpacity
                        onPress={onCallIconPress}
                        activeOpacity={0.9}
                        style={[s.manageBtn, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}
                    >
                        <RNText
                            label="Manage Participants"
                            fontSize={fontSize._14}
                            fontWeight={fontWeight._600}
                            color={colors.textColor}
                        />
                    </TouchableOpacity>
                )}

                {/* ── Signal ID Footer ── */}
                <View style={s.footer}>
                    <RNText
                        label={`Signal ID: ${chanelId} • Public Signal`}
                        fontSize={fontSize._11}
                        color={colors.secondaryText}
                        textAlign="center"
                        style={{ opacity: 0.6 }}
                    />
                </View>
            </ScrollView>

            {/* ── Leave Signal Dialog ── */}
            <Modal visible={showLeaveDialog} transparent animationType="fade" onRequestClose={() => setShowLeaveDialog(false)}>
                <Pressable style={s.backdrop} onPress={() => setShowLeaveDialog(false)}>
                    <Pressable onPress={() => {}}>
                        <View style={[s.dialogCard, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
                            <View style={s.dialogIconWrap}>
                                <PulsingCircle color="#FF6363" />
                                <View style={[s.dialogIconBox, { backgroundColor: 'rgba(255,99,99,0.2)', borderColor: 'rgba(255,99,99,0.3)' }]}>
                                    <LogOut size={32} color="#FF6363" strokeWidth={2} />
                                </View>
                            </View>
                            <RNText label="Leave Signal?" fontSize={fontSize._20} fontWeight={fontWeight._700} color={colors.textColor} textAlign="center" style={{ marginTop: 16, marginBottom: 8 }} />
                            <RNText label="You will no longer receive updates from this signal." fontSize={fontSize._14} fontWeight={fontWeight._400} color={colors.secondaryText} textAlign="center" style={{ marginBottom: 24 }} />
                            <View style={s.dialogBtnRow}>
                                <TouchableOpacity onPress={() => setShowLeaveDialog(false)} style={[s.dialogBtn, s.dialogBtnCancel, { backgroundColor: colors.inputBGColor, borderColor: colors.borderColor }]} activeOpacity={0.85}>
                                    <RNText label="Cancel" fontSize={fontSize._15} fontWeight={fontWeight._600} color={colors.textColor} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { setShowLeaveDialog(false); navigation.goBack() }} style={[s.dialogBtn, { backgroundColor: '#FF6363' }]} activeOpacity={0.85}>
                                    <RNText label="Leave Signal" fontSize={fontSize._15} fontWeight={fontWeight._600} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* ── Report Signal Dialog ── */}
            <Modal visible={showReportDialog} transparent animationType="fade" onRequestClose={() => setShowReportDialog(false)}>
                <Pressable style={s.backdrop} onPress={() => setShowReportDialog(false)}>
                    <Pressable onPress={() => {}}>
                        <View style={[s.dialogCard, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
                            <View style={s.dialogIconWrap}>
                                <PulsingCircle color="#F59E0B" />
                                <View style={[s.dialogIconBox, { backgroundColor: 'rgba(245,158,11,0.2)', borderColor: 'rgba(245,158,11,0.3)' }]}>
                                    <Flag size={32} color="#F59E0B" strokeWidth={2} />
                                </View>
                            </View>
                            <RNText label="Report Signal?" fontSize={fontSize._20} fontWeight={fontWeight._700} color={colors.textColor} textAlign="center" style={{ marginTop: 16, marginBottom: 8 }} />
                            <RNText label="Report this signal for inappropriate content. Our moderation team will review it." fontSize={fontSize._14} fontWeight={fontWeight._400} color={colors.secondaryText} textAlign="center" style={{ marginBottom: 24 }} />
                            <View style={s.dialogBtnRow}>
                                <TouchableOpacity onPress={() => setShowReportDialog(false)} style={[s.dialogBtn, s.dialogBtnCancel, { backgroundColor: colors.inputBGColor, borderColor: colors.borderColor }]} activeOpacity={0.85}>
                                    <RNText label="Cancel" fontSize={fontSize._15} fontWeight={fontWeight._600} color={colors.textColor} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setShowReportDialog(false)} style={[s.dialogBtn, { backgroundColor: '#F59E0B' }]} activeOpacity={0.85}>
                                    <RNText label="Report" fontSize={fontSize._15} fontWeight={fontWeight._600} color="#FFFFFF" />
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
    const ctx = useContext(Context)
    const colors = ctx?.colors ?? {}

    return (
        <>
            {isvisible && (
                <BlurView
                    style={absStyle.fill}
                    blurType="light"
                    blurAmount={10}
                    reducedTransparencyFallbackColor={colors.transparent}
                />
            )}
            {isvisible && item && (
                <View
                    style={{
                        position: 'absolute',
                        top: Platform.OS === 'ios' ? dropdown + 28 : dropdown - 18,
                        left: 20,
                    }}
                >
                    <ContactContainer
                        name={`${item.firstName} ${item.lastName}`}
                        desc={item.userName}
                        image={item.userProfile}
                        desccolor={colors.secondaryText}
                        namecolor={colors.textColor}
                        textpaddingHorizontal={15}
                    />
                </View>
            )}
        </>
    )
}

const absStyle = StyleSheet.create({
    fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
})

const getStyles = (colors: any) =>
    StyleSheet.create({
        root: { flex: 1 },

        // Header
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingBottom: 8,
        },
        headerBtn: {
            width: 36,
            height: 36,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
        },

        // Scroll
        scrollContent: {
            paddingHorizontal: 20,
            paddingBottom: 48,
        },

        // Profile row
        profileRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 20,
            marginTop: 4,
        },
        titleBlock: {
            flex: 1,
            paddingRight: 16,
        },
        avatarWrap: { position: 'relative' },
        avatarInitials: {
            alignItems: 'center',
            justifyContent: 'center',
        },
        avatarGlow: {
            position: 'absolute',
            width: 64,
            height: 64,
            borderRadius: 32,
            top: -4,
            left: -4,
            opacity: 0.25,
        },
        avatar: {
            width: 56,
            height: 56,
            borderRadius: 28,
            borderWidth: 2,
        },
        badge: {
            position: 'absolute',
            right: -2,
            bottom: -2,
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: '#10B981',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
        },

        // Action row
        actionRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            marginBottom: 12,
        },
        searchBtn: {
            flex: 1,
            minHeight: 48,
            borderRadius: 16,
            borderWidth: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
        },
        globeBtn: {
            width: 48,
            height: 48,
            borderRadius: 16,
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },

        // Username card
        usernameCard: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            borderRadius: 16,
            borderWidth: 1,
            marginBottom: 12,
        },
        usernameIconWrap: {
            width: 36,
            height: 36,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
        },

        // Generic card
        card: {
            padding: 16,
            borderRadius: 20,
            borderWidth: 1,
            marginBottom: 12,
        },
        subscriberRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 10,
        },
        mediaHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
        },

        // Settings card
        settingsCard: {
            borderRadius: 20,
            borderWidth: 1,
            overflow: 'hidden',
            marginBottom: 12,
        },
        settingsRow: {
            minHeight: 52,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
        },
        rowBorder: { borderBottomWidth: 1 },
        rowLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
        },
        rowIconWrap: {
            width: 32,
            height: 32,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
        },

        // Manage button
        manageBtn: {
            minHeight: 44,
            borderRadius: 14,
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
        },

        // Footer
        footer: {
            paddingVertical: 16,
            alignItems: 'center',
        },

        // Dialog / Modal
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
        dialogBtnRow: {
            flexDirection: 'row',
            gap: 12,
            width: '100%',
        },
        dialogBtn: {
            flex: 1,
            height: 48,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
        },
        dialogBtnCancel: {
            borderWidth: 1,
        },
    })
