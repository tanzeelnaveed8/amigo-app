import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
    ActivityIndicator,
    Animated,
    Modal,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { useRoute } from '@react-navigation/native'
import { Image as FastImage } from 'expo-image'
import { useMutation } from 'react-query'
import QRCode from 'react-native-qrcode-svg'
import { Camera, ChevronLeft, Edit2, Ghost, QrCode, Save, Share2, Trash2, Users, X } from 'lucide-react-native'
import { DeleteGroup } from '../../../../apis/group'
import { getQrPayload } from '../../../../apis/qr'
import useNavigationHook from '../../../../hooks/use_navigation'
import Context from '../../../../context'
import RNText from '../../../../component/atoms/text'
import fontSize from '../../../../constants/font-size'
import fontWeight from '../../../../constants/font-weight'

const CORNER_SIZE = 26
const CORNER_OFFSET = 10

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

const ProfileSettingScreen = () => {
    const navigation = useNavigationHook()
    const route = useRoute<any>().params
    const profileData = route?.profileData ?? {}
    const { colors, setLoader, setToastMsg } = useContext(Context)
    const styles = useMemo(() => getStyles(colors), [colors])

    const groupId = profileData?._id ?? profileData?.id
    const participantsCount = Array.isArray(profileData?.participants) ? profileData.participants.length : 0
    const maxMembers = 200
    const fill = Math.min(1, participantsCount / maxMembers)

    // General edit states
    const [roomName, setRoomName] = useState(profileData?.title ?? '')
    const [isEditingName, setIsEditingName] = useState(false)
    const [roomBio, setRoomBio] = useState(profileData?.bio ?? '')
    const [isEditingBio, setIsEditingBio] = useState(false)

    // Dialog state
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    // QR modal states
    const [showQrModal, setShowQrModal] = useState(false)
    const [qrPayload, setQrPayload] = useState<string | null>(null)
    const [qrLoading, setQrLoading] = useState(false)
    const [qrError, setQrError] = useState<string | null>(null)

    // Pulsing animation for QR center icon
    const glowAnim = useRef(new Animated.Value(0.35)).current
    const scaleAnim = useRef(new Animated.Value(1)).current

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(glowAnim, { toValue: 0.65, duration: 1000, useNativeDriver: true }),
                    Animated.timing(scaleAnim, { toValue: 1.3, duration: 1000, useNativeDriver: true }),
                ]),
                Animated.parallel([
                    Animated.timing(glowAnim, { toValue: 0.35, duration: 1000, useNativeDriver: true }),
                    Animated.timing(scaleAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
                ]),
            ])
        )
        loop.start()
        return () => loop.stop()
    }, [])

    // Fetch QR payload when modal opens
    const openQrModal = () => {
        if (!groupId) return
        setShowQrModal(true)
        setQrPayload(null)
        setQrError(null)
        setQrLoading(true)
        getQrPayload('group', groupId)
            .then((res) => {
                if (res.success && res.data) {
                    setQrPayload(res.data.payload)
                } else {
                    setQrError('Failed to load QR code')
                }
            })
            .catch((e) => {
                setQrError(e?.response?.data?.message || 'Failed to load QR code')
            })
            .finally(() => setQrLoading(false))
    }

    const handleShareQr = async () => {
        if (!qrPayload) return
        try {
            await Share.share({
                message: `Join "${roomName}" on Amigo: ${qrPayload}`,
                title: `Join "${roomName}" on Amigo`,
            })
        } catch { }
    }

    const avatarUri =
        profileData?.groupProfile && !String(profileData.groupProfile).includes('motorcycle-bike')
            ? profileData.groupProfile
            : null
    const avatarInitials = (roomName?.charAt(0) ?? 'R').toUpperCase()

    const { mutate: deleteGroup } = useMutation(() => DeleteGroup(groupId), {
        onSuccess: () => {
            setLoader(false)
            setToastMsg('Room deleted successfully')
            navigation.navigate('MyDrawer')
        },
        onError: () => {
            setLoader(false)
            setToastMsg('Failed to delete room')
        },
    })

    const onDeleteRoom = () => setShowDeleteDialog(true)

    return (
        <View style={styles.container}>
            <SafeAreaView>
                <View style={styles.header}>
                    <TouchableOpacity onPress={navigation.goBack} activeOpacity={0.85} style={styles.backBtn}>
                        <ChevronLeft size={24} color={colors.secondaryText} />
                    </TouchableOpacity>
                    <RNText label="Room Settings" fontSize={fontSize._18} fontWeight={fontWeight._700} color={colors.textColor} />
                    <View style={{ width: 36 }} />
                </View>
            </SafeAreaView>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

                {/* ── Avatar Section ── */}
                <View style={styles.avatarSection}>
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => navigation.navigate('AddGroupDetailsScreen', { itemData: profileData, isEdit: true })}
                    >
                        <View>
                            {avatarUri ? (
                                <FastImage source={{ uri: avatarUri }} style={styles.avatar} />
                            ) : (
                                <View style={[styles.avatar, styles.avatarInitials, { backgroundColor: `${colors.accentColor}22` }]}>
                                    <Text style={{ fontSize: 28, fontWeight: '700', color: colors.accentColor }}>{avatarInitials}</Text>
                                </View>
                            )}
                            <View style={styles.avatarEdit}>
                                <Camera size={14} color={colors.textColor} />
                            </View>
                        </View>
                    </TouchableOpacity>
                    <RNText
                        label="Tap to change room icon"
                        marginTop={8}
                        fontSize={fontSize._11}
                        fontWeight={fontWeight._500}
                        color={colors.secondaryText}
                    />
                </View>

                {/* ── GENERAL Section ── */}
                <RNText label="GENERAL" fontSize={fontSize._10} fontWeight={fontWeight._700} color={colors.secondaryText} style={styles.sectionLabel} />
                <View style={styles.card}>

                    {/* Room Name */}
                    <View style={[styles.fieldRow, styles.rowBorder]}>
                        <View style={styles.fieldTop}>
                            <RNText label="Room Name" fontSize={fontSize._11} fontWeight={fontWeight._500} color={colors.secondaryText} />
                            {!isEditingName ? (
                                <TouchableOpacity onPress={() => setIsEditingName(true)} style={styles.iconBtn} activeOpacity={0.7}>
                                    <Edit2 size={14} color={colors.accentColor} />
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.editActions}>
                                    <TouchableOpacity onPress={() => setIsEditingName(false)} style={styles.iconBtn} activeOpacity={0.7}>
                                        <X size={14} color="#EF4444" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setIsEditingName(false)} style={styles.iconBtn} activeOpacity={0.7}>
                                        <Save size={14} color="#22C55E" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                        {isEditingName ? (
                            <TextInput
                                value={roomName}
                                onChangeText={setRoomName}
                                autoFocus
                                style={styles.nameInput}
                                placeholderTextColor={colors.secondaryText}
                            />
                        ) : (
                            <RNText label={roomName || 'Room'} fontSize={fontSize._20} fontWeight={fontWeight._700} color={colors.textColor} />
                        )}
                    </View>

                    {/* Description */}
                    <View style={styles.fieldRow}>
                        <View style={styles.fieldTop}>
                            <RNText label="Description" fontSize={fontSize._11} fontWeight={fontWeight._500} color={colors.secondaryText} />
                            {!isEditingBio ? (
                                <TouchableOpacity onPress={() => setIsEditingBio(true)} style={styles.iconBtn} activeOpacity={0.7}>
                                    <Edit2 size={14} color={colors.accentColor} />
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.editActions}>
                                    <TouchableOpacity onPress={() => setIsEditingBio(false)} style={styles.iconBtn} activeOpacity={0.7}>
                                        <X size={14} color="#EF4444" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setIsEditingBio(false)} style={styles.iconBtn} activeOpacity={0.7}>
                                        <Save size={14} color="#22C55E" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                        {isEditingBio ? (
                            <TextInput
                                value={roomBio}
                                onChangeText={setRoomBio}
                                autoFocus
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                                placeholder="Add room description"
                                style={styles.bioInput}
                                placeholderTextColor={colors.secondaryText}
                            />
                        ) : (
                            <RNText
                                label={roomBio || 'Add room description'}
                                fontSize={fontSize._13}
                                fontWeight={fontWeight._400}
                                color={colors.secondaryText}
                            />
                        )}
                    </View>
                </View>

                {/* ── Room QR Code Button ── */}
                <TouchableOpacity onPress={openQrModal} style={styles.qrBtn} activeOpacity={0.85}>
                    <View style={styles.qrLeft}>
                        <View style={styles.qrIconBox}>
                            <QrCode size={20} color={colors.accentColor} />
                        </View>
                        <View>
                            <RNText label="Room QR Code" fontSize={fontSize._14} fontWeight={fontWeight._600} color={colors.textColor} />
                            <RNText label="Scan to join room" fontSize={fontSize._11} fontWeight={fontWeight._400} color={colors.secondaryText} />
                        </View>
                    </View>
                    <View style={styles.qrChevron}>
                        <QrCode size={16} color={colors.secondaryText} />
                    </View>
                </TouchableOpacity>

                {/* ── ROOM CAPACITY Section ── */}
                <RNText label="ROOM CAPACITY" fontSize={fontSize._10} fontWeight={fontWeight._700} color={colors.secondaryText} style={styles.sectionLabel} />
                <View style={styles.capacityCard}>
                    <View style={styles.capacityTop}>
                        <RNText label="Active Members" fontSize={fontSize._14} fontWeight={fontWeight._500} color={colors.textColor} />
                        <View style={styles.countPill}>
                            <RNText label={`${participantsCount} / ${maxMembers}`} fontSize={fontSize._11} fontWeight={fontWeight._700} color={colors.textColor} />
                        </View>
                    </View>
                    <View style={styles.progressBg}>
                        <View style={[styles.progressFill, { width: `${fill * 100}%` as any }]} />
                    </View>
                    <View style={styles.capacityFooter}>
                        <Users size={14} color={colors.secondaryText} style={{ marginTop: 1, flexShrink: 0 }} />
                        <RNText
                            label={`Amigo rooms are exclusive spaces designed for close-knit communities. To maintain a high-quality experience, membership is capped at ${maxMembers} active members.`}
                            fontSize={fontSize._11}
                            fontWeight={fontWeight._400}
                            color={colors.secondaryText}
                            style={{ flex: 1 }}
                        />
                    </View>
                </View>

                {/* ── DANGER ZONE Section ── */}
                <RNText label="DANGER ZONE" fontSize={fontSize._10} fontWeight={fontWeight._700} color="#EF4444" style={styles.sectionLabel} />
                <View style={styles.dangerCard}>
                    <TouchableOpacity onPress={onDeleteRoom} style={styles.deleteRow} activeOpacity={0.85}>
                        <Trash2 size={20} color="#EF4444" />
                        <RNText label="Delete Room" fontSize={fontSize._15} fontWeight={fontWeight._500} color="#EF4444" />
                    </TouchableOpacity>
                </View>
                <RNText
                    label="Deleting a room is permanent and cannot be undone. All messages and media will be lost."
                    fontSize={fontSize._11}
                    fontWeight={fontWeight._400}
                    color={colors.secondaryText}
                    marginTop={6}
                    style={styles.dangerNote}
                />
            </ScrollView>

            {/* ════════════════════════════════
                QR CODE MODAL (popup)
            ════════════════════════════════ */}
            <Modal
                visible={showQrModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowQrModal(false)}
                statusBarTranslucent
            >
                {/* Backdrop */}
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={() => setShowQrModal(false)}
                >
                    {/* Card — stop touch propagation */}
                    <TouchableOpacity activeOpacity={1} style={[styles.modalCard, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>

                        {/* Close button */}
                        <TouchableOpacity
                            onPress={() => setShowQrModal(false)}
                            style={[styles.closeBtn, { backgroundColor: colors.inputBGColor ?? 'rgba(255,255,255,0.08)' }]}
                            activeOpacity={0.8}
                        >
                            <X size={18} color={colors.secondaryText} />
                        </TouchableOpacity>

                        {/* Title */}
                        <RNText
                            label="Scan to Join"
                            fontSize={fontSize._20}
                            fontWeight={fontWeight._700}
                            color={colors.textColor}
                            textAlign="center"
                        />
                        <RNText
                            label={roomName}
                            fontSize={fontSize._13}
                            fontWeight={fontWeight._400}
                            color={colors.secondaryText}
                            textAlign="center"
                            marginTop={4}
                            style={{ marginBottom: 20 }}
                        />

                        {qrLoading ? (
                            <ActivityIndicator size="large" color={colors.accentColor} style={{ marginVertical: 40 }} />
                        ) : qrError ? (
                            <RNText
                                label={qrError}
                                fontSize={fontSize._13}
                                color={colors.red}
                                textAlign="center"
                                style={{ marginVertical: 30 }}
                            />
                        ) : qrPayload ? (
                            <>
                                {/* ── QR Card ── */}
                                <View style={styles.qrCardOuter}>
                                    {/* Outer glow */}
                                    <View style={[styles.outerGlow, { backgroundColor: `${colors.accentColor}28` }]} />

                                    <View style={[styles.qrCard, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
                                        {/* Inner tint */}
                                        <View style={[styles.innerTint, { backgroundColor: `${colors.accentColor}0C` }]} />

                                        {/* QR Wrapper */}
                                        <View style={[styles.qrWrap, { backgroundColor: colors.primary }]}>
                                            <View style={[styles.qrInnerTint, { backgroundColor: `${colors.accentColor}07` }]} />
                                            <QRCode
                                                value={qrPayload}
                                                size={190}
                                                color={colors.accentColor}
                                                backgroundColor="transparent"
                                            />
                                            {/* Ghost icon in center */}
                                            <View style={styles.iconOverlay}>
                                                <View>
                                                    <Animated.View
                                                        style={[
                                                            styles.iconGlow,
                                                            {
                                                                backgroundColor: colors.accentColor,
                                                                opacity: glowAnim,
                                                                transform: [{ scale: scaleAnim }],
                                                            },
                                                        ]}
                                                    />
                                                    <View style={[styles.iconBox, { borderColor: colors.accentColor, backgroundColor: colors.primary }]}>
                                                        <Ghost size={20} color={colors.accentColor} strokeWidth={2.5} />
                                                    </View>
                                                </View>
                                            </View>
                                        </View>

                                        {/* Corner decorations */}
                                        <View style={[styles.cornerTL, { borderColor: `${colors.accentColor}66` }]} />
                                        <View style={[styles.cornerTR, { borderColor: `${colors.accentColor}66` }]} />
                                        <View style={[styles.cornerBL, { borderColor: `${colors.accentColor}66` }]} />
                                        <View style={[styles.cornerBR, { borderColor: `${colors.accentColor}66` }]} />
                                    </View>
                                </View>

                                {/* Info text */}
                                <RNText
                                    label="Share this QR code with others so they can join this room instantly."
                                    fontSize={fontSize._11}
                                    fontWeight={fontWeight._400}
                                    color={colors.secondaryText}
                                    textAlign="center"
                                    style={styles.infoText}
                                />

                                {/* Action buttons */}
                                <View style={styles.btnRow}>
                                    <TouchableOpacity
                                        onPress={handleShareQr}
                                        style={[styles.btn, styles.btnOutlined, { backgroundColor: colors.inputBGColor, borderColor: colors.borderColor }]}
                                        activeOpacity={0.85}
                                    >
                                        <Share2 size={16} color={colors.textColor} />
                                        <RNText label="Share" fontSize={fontSize._14} fontWeight={fontWeight._600} color={colors.textColor} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={handleShareQr}
                                        style={[styles.btn, { backgroundColor: colors.accentColor }]}
                                        activeOpacity={0.85}
                                    >
                                        <Share2 size={16} color="#FFFFFF" />
                                        <RNText label="Invite" fontSize={fontSize._14} fontWeight={fontWeight._600} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : null}
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* ── Delete Room Dialog ── */}
            <Modal visible={showDeleteDialog} transparent animationType="fade" onRequestClose={() => setShowDeleteDialog(false)}>
                <Pressable style={styles.dialogBackdrop} onPress={() => setShowDeleteDialog(false)}>
                    <Pressable onPress={() => {}}>
                        <View style={[styles.dialogCard, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
                            <View style={styles.dialogIconWrap}>
                                <PulsingCircle color="#FF6363" />
                                <View style={[styles.dialogIconBox, { backgroundColor: 'rgba(255,99,99,0.2)', borderColor: 'rgba(255,99,99,0.3)' }]}>
                                    <Trash2 size={32} color="#FF6363" strokeWidth={2} />
                                </View>
                            </View>
                            <RNText label="Delete Room?" fontSize={fontSize._20} fontWeight={fontWeight._700} color={colors.textColor} textAlign="center" style={{ marginTop: 16, marginBottom: 8 }} />
                            <RNText label={`This action cannot be undone. This will permanently delete "${roomName}" and all its data.`} fontSize={fontSize._14} fontWeight={fontWeight._400} color={colors.secondaryText} textAlign="center" style={{ marginBottom: 24 }} />
                            <View style={styles.dialogBtnRow}>
                                <TouchableOpacity onPress={() => setShowDeleteDialog(false)} style={[styles.dialogBtn, styles.dialogBtnCancel, { backgroundColor: colors.inputBGColor ?? colors.cardBg, borderColor: colors.borderColor }]} activeOpacity={0.85}>
                                    <RNText label="Cancel" fontSize={fontSize._15} fontWeight={fontWeight._600} color={colors.textColor} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { setShowDeleteDialog(false); setLoader(true); deleteGroup() }} style={[styles.dialogBtn, { backgroundColor: '#FF6363' }]} activeOpacity={0.85}>
                                    <RNText label="Delete Room" fontSize={fontSize._15} fontWeight={fontWeight._600} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    )
}

export default ProfileSettingScreen

const getStyles = (colors: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.primary,
            paddingHorizontal: 20,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: Platform.OS === 'android' ? 8 : 0,
            marginBottom: 10,
        },
        backBtn: {
            width: 36,
            height: 36,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.borderColor ?? 'rgba(255,255,255,0.08)',
            backgroundColor: colors.cardBg ?? colors.surfaceBg,
        },
        content: { paddingBottom: 32 },

        // ── Avatar
        avatarSection: { alignItems: 'center', marginTop: 8, marginBottom: 22 },
        avatar: {
            width: 96, height: 96, borderRadius: 48,
            borderWidth: 3,
            borderColor: colors.borderColor ?? 'rgba(255,255,255,0.1)',
        },
        avatarInitials: {
            alignItems: 'center',
            justifyContent: 'center',
        },
        avatarEdit: {
            position: 'absolute', right: -2, bottom: -2,
            width: 30, height: 30, borderRadius: 15,
            backgroundColor: colors.cardBg ?? colors.surfaceBg,
            borderWidth: 2, borderColor: colors.primary,
            alignItems: 'center', justifyContent: 'center',
        },

        // ── Section Label
        sectionLabel: { marginLeft: 2, marginBottom: 8, letterSpacing: 1.2, opacity: 0.8 },

        // ── General Card
        card: {
            borderRadius: 18, borderWidth: 1,
            borderColor: colors.borderColor ?? 'rgba(255,255,255,0.08)',
            backgroundColor: colors.cardBg ?? colors.surfaceBg,
            overflow: 'hidden', marginBottom: 16,
        },
        fieldRow: { paddingHorizontal: 14, paddingVertical: 12 },
        rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderColor ?? 'rgba(255,255,255,0.08)' },
        fieldTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
        iconBtn: { padding: 6, borderRadius: 8 },
        editActions: { flexDirection: 'row', gap: 4 },
        nameInput: {
            color: colors.textColor, fontSize: 20, fontWeight: '700',
            borderWidth: 1, borderColor: colors.borderColor ?? 'rgba(255,255,255,0.12)',
            borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8,
            backgroundColor: colors.inputBGColor ?? 'rgba(255,255,255,0.04)',
        },
        bioInput: {
            color: colors.textColor, fontSize: 13,
            borderWidth: 1, borderColor: colors.borderColor ?? 'rgba(255,255,255,0.12)',
            borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8,
            backgroundColor: colors.inputBGColor ?? 'rgba(255,255,255,0.04)',
            minHeight: 72,
        },

        // ── QR Button
        qrBtn: {
            minHeight: 58, paddingHorizontal: 14, paddingVertical: 10,
            borderRadius: 18, borderWidth: 1,
            borderColor: colors.borderColor ?? 'rgba(255,255,255,0.08)',
            backgroundColor: colors.cardBg ?? colors.surfaceBg,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 22,
        },
        qrLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
        qrIconBox: {
            width: 42, height: 42, borderRadius: 12,
            backgroundColor: `${colors.accentColor}22`,
            alignItems: 'center', justifyContent: 'center',
        },
        qrChevron: {
            width: 30, height: 30, borderRadius: 15,
            backgroundColor: colors.inputBGColor ?? 'rgba(255,255,255,0.05)',
            alignItems: 'center', justifyContent: 'center',
        },

        // ── Capacity
        capacityCard: {
            borderRadius: 18, borderWidth: 1,
            borderColor: colors.borderColor ?? 'rgba(255,255,255,0.08)',
            backgroundColor: colors.cardBg ?? colors.surfaceBg,
            padding: 16, marginBottom: 22,
        },
        capacityTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
        countPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: colors.inputBGColor ?? 'rgba(255,255,255,0.08)' },
        progressBg: { width: '100%', height: 8, borderRadius: 999, backgroundColor: colors.inputBGColor ?? 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 12 },
        progressFill: { height: 8, borderRadius: 999, backgroundColor: colors.accentColor },
        capacityFooter: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },

        // ── Danger Zone
        dangerCard: { borderRadius: 18, borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)', backgroundColor: 'rgba(239,68,68,0.06)', overflow: 'hidden' },
        deleteRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16 },
        dangerNote: { opacity: 0.55, marginLeft: 2 },

        // ══════════════════
        // QR Modal styles
        // ══════════════════
        backdrop: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.65)',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 20,
        },
        modalCard: {
            width: '100%',
            maxWidth: 380,
            borderRadius: 28,
            borderWidth: 1,
            padding: 24,
            alignItems: 'center',
        },
        closeBtn: {
            position: 'absolute',
            top: 16,
            right: 16,
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
        },

        // QR card outer
        qrCardOuter: { position: 'relative', marginBottom: 16, alignItems: 'center', justifyContent: 'center' },
        outerGlow: { position: 'absolute', width: 300, height: 300, borderRadius: 150 },
        qrCard: { position: 'relative', borderRadius: 26, borderWidth: 1, padding: 18, overflow: 'hidden' },
        innerTint: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 26 },

        // QR inner wrapper
        qrWrap: { position: 'relative', borderRadius: 18, padding: 14, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
        qrInnerTint: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 18 },

        // Center icon
        iconOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
        iconGlow: { position: 'absolute', width: 52, height: 52, borderRadius: 26 },
        iconBox: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },

        // Corner decorations
        cornerTL: { position: 'absolute', top: CORNER_OFFSET, left: CORNER_OFFSET, width: CORNER_SIZE, height: CORNER_SIZE, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 7 },
        cornerTR: { position: 'absolute', top: CORNER_OFFSET, right: CORNER_OFFSET, width: CORNER_SIZE, height: CORNER_SIZE, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 7 },
        cornerBL: { position: 'absolute', bottom: CORNER_OFFSET, left: CORNER_OFFSET, width: CORNER_SIZE, height: CORNER_SIZE, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 7 },
        cornerBR: { position: 'absolute', bottom: CORNER_OFFSET, right: CORNER_OFFSET, width: CORNER_SIZE, height: CORNER_SIZE, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 7 },

        // Buttons
        infoText: { opacity: 0.65, maxWidth: 220, marginBottom: 20, textAlign: 'center' },
        btnRow: { flexDirection: 'row', gap: 10, width: '100%' },
        btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 13, borderRadius: 14 },
        btnOutlined: { borderWidth: 1 },

        // ── Delete Dialog
        dialogBackdrop: {
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
