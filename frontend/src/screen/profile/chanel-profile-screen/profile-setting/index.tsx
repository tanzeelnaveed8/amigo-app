import React, { useContext, useEffect, useRef, useState } from 'react'
import {
    Animated,
    Modal,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    Share,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { useMutation } from 'react-query'
import { useRoute } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker'
import { Image as FastImage } from 'expo-image'
import QRCode from 'react-native-qrcode-svg'
import {
    ArrowLeft,
    Camera,
    ChevronRight,
    Edit2,
    Link,
    Megaphone,
    QrCode,
    Save,
    Share2,
    Trash2,
    Users,
    X,
} from 'lucide-react-native'
import Context from '../../../../context'
import RNText from '../../../../component/atoms/text'
import useNavigationHook from '../../../../hooks/use_navigation'
import fontSize from '../../../../constants/font-size'
import fontWeight from '../../../../constants/font-weight'
import { DeleteChanel, UpdateChanel, UpdateChanelProfilepic } from '../../../../apis/channel'
import { getQrPayload } from '../../../../apis/qr'

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

// Pulsing glow for QR center icon
const QrGlow = ({ color }: { color: string }) => {
    const anim = useRef(new Animated.Value(0)).current
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(anim, { toValue: 1, duration: 1200, useNativeDriver: true }),
                Animated.timing(anim, { toValue: 0, duration: 1200, useNativeDriver: true }),
            ])
        ).start()
    }, [])
    const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] })
    const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.6] })
    return (
        <Animated.View style={{
            position: 'absolute', width: 56, height: 56, borderRadius: 28,
            backgroundColor: color, opacity, transform: [{ scale }],
        }} />
    )
}

const ChanelProfileSettingScreen = () => {
    const navigation = useNavigationHook()
    const route = useRoute<any>().params
    const profileData = route?.profileData ?? {}
    const { colors, setToastMsg, setLoader } = useContext(Context)
    const accent = colors.accentColor ?? '#3B82F6'

    // Signal info state
    const [signalName, setSignalName] = useState<string>(profileData?.title ?? '')
    const [signalDesc, setSignalDesc] = useState<string>(profileData?.bio ?? '')
    const [websiteLink, setWebsiteLink] = useState<string>(profileData?.website ?? '')
    const [isEditingName, setIsEditingName] = useState(false)
    const [isEditingDesc, setIsEditingDesc] = useState(false)
    const [isEditingLink, setIsEditingLink] = useState(false)

    // Avatar
    const rawAvatar = profileData?.chanelProfile
    const hasValidAvatar = rawAvatar && !String(rawAvatar).includes('motorcycle-bike')
    const [avatarUri, setAvatarUri] = useState<string | null>(hasValidAvatar ? rawAvatar : null)
    const initials = (signalName?.charAt(0) ?? 'S').toUpperCase()

    // Subscriber count
    const subscriberCount = Array.isArray(profileData?.participants) ? profileData.participants.length : 0

    // Modals
    const [showQrModal, setShowQrModal] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    // QR payload
    const [qrPayload, setQrPayload] = useState<string | null>(null)
    const [qrLoading, setQrLoading] = useState(false)

    const s = getStyles(colors, accent)

    // APIs
    const { mutate: updateChanel } = useMutation(UpdateChanel, {
        onSuccess: (res: any) => { setToastMsg(res?.message ?? 'Updated'); setLoader(false) },
        onError: () => setLoader(false),
    })

    const { mutate: updateAvatar } = useMutation(UpdateChanelProfilepic, {
        onSuccess: (res: any) => { setToastMsg(res?.message ?? 'Avatar updated'); setLoader(false) },
        onError: () => setLoader(false),
    })

    const { mutate: deleteChanel } = useMutation(() => DeleteChanel(profileData?._id ?? profileData?.id), {
        onSuccess: (res: any) => {
            setToastMsg(res?.message ?? 'Signal deleted')
            setLoader(false)
            navigation.navigate('MyDrawer' as never)
        },
        onError: () => setLoader(false),
    })

    const handlePickAvatar = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        })
        if (!result.canceled && result.assets?.[0]?.uri) {
            const uri = result.assets[0].uri
            setAvatarUri(uri)
            setLoader(true)
            const form = new FormData()
            form.append('chanelProfile', { uri, name: 'avatar.jpg', type: 'image/jpeg' } as any)
            form.append('chanelId', profileData?._id ?? profileData?.id)
            updateAvatar(form)
        }
    }

    const handleSaveName = () => {
        setLoader(true)
        updateChanel({ chanelId: profileData?._id ?? profileData?.id, title: signalName })
        setIsEditingName(false)
    }

    const handleSaveDesc = () => {
        setLoader(true)
        updateChanel({ chanelId: profileData?._id ?? profileData?.id, bio: signalDesc })
        setIsEditingDesc(false)
    }

    const handleSaveLink = () => {
        setLoader(true)
        updateChanel({ chanelId: profileData?._id ?? profileData?.id, website: websiteLink })
        setIsEditingLink(false)
    }

    const handleOpenQr = async () => {
        setShowQrModal(true)
        if (!qrPayload) {
            setQrLoading(true)
            try {
                const id = profileData?._id ?? profileData?.id
                const res = await getQrPayload('channel', id)
                if (res.success && res.data?.payload) setQrPayload(res.data.payload)
            } catch { }
            setQrLoading(false)
        }
    }

    const handleShareQr = async () => {
        if (!qrPayload) return
        try {
            await Share.share({
                message: `Join "${signalName}" on Amigo: ${qrPayload}`,
                title: `Join "${signalName}" on Amigo`,
            })
        } catch { }
    }

    return (
        <View style={[s.root, { backgroundColor: colors.primary }]}>
            {/* ── Header ── */}
            <SafeAreaView>
                <View style={[s.header, { marginTop: Platform.OS === 'android' ? 10 : 0 }]}>
                    <TouchableOpacity
                        onPress={navigation.goBack}
                        style={[s.backBtn, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}
                        activeOpacity={0.85}
                    >
                        <ArrowLeft size={22} color={colors.secondaryText} />
                    </TouchableOpacity>
                    <RNText label="Signal Settings" fontSize={fontSize._18} fontWeight={fontWeight._700} color={colors.textColor} />
                    <View style={{ width: 36 }} />
                </View>
            </SafeAreaView>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

                {/* ── Avatar Section ── */}
                <View style={s.avatarSection}>
                    <View style={s.avatarOuter}>
                        {avatarUri ? (
                            <FastImage source={{ uri: avatarUri }} style={s.avatar} />
                        ) : (
                            <View style={[s.avatar, s.avatarInitials, { backgroundColor: `${accent}22` }]}>
                                <RNText label={initials} fontSize={fontSize._34} fontWeight={fontWeight._700} color={accent} />
                            </View>
                        )}
                        <TouchableOpacity
                            onPress={handlePickAvatar}
                            style={[s.cameraBtn, { backgroundColor: colors.cardBg, borderColor: colors.primary }]}
                            activeOpacity={0.85}
                        >
                            <Camera size={18} color={colors.textColor} />
                        </TouchableOpacity>
                    </View>
                    <RNText
                        label="Tap to change signal icon"
                        fontSize={fontSize._12}
                        fontWeight={fontWeight._500}
                        color={colors.secondaryText}
                        style={{ opacity: 0.6, marginTop: 10 }}
                    />
                </View>

                {/* ── GENERAL section label ── */}
                <RNText
                    label="GENERAL"
                    fontSize={fontSize._11}
                    fontWeight={fontWeight._700}
                    color={colors.secondaryText}
                    style={s.sectionLabel}
                />

                {/* ── General Card ── */}
                <View style={[s.card, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>

                    {/* Signal Name */}
                    <View style={s.fieldWrap}>
                        <View style={s.fieldHeader}>
                            <RNText label="Signal Name" fontSize={fontSize._14} fontWeight={fontWeight._500} color={colors.textColor} style={{ opacity: 0.7 }} />
                            {!isEditingName ? (
                                <TouchableOpacity onPress={() => setIsEditingName(true)} style={[s.editBtn, { backgroundColor: `${accent}15` }]} activeOpacity={0.8}>
                                    <Edit2 size={14} color={accent} />
                                </TouchableOpacity>
                            ) : (
                                <View style={s.editActions}>
                                    <TouchableOpacity onPress={() => setIsEditingName(false)} style={[s.editBtn, { backgroundColor: 'rgba(239,68,68,0.12)' }]} activeOpacity={0.8}>
                                        <X size={14} color="#EF4444" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleSaveName} style={[s.editBtn, { backgroundColor: 'rgba(34,197,94,0.12)' }]} activeOpacity={0.8}>
                                        <Save size={14} color="#22C55E" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                        {isEditingName ? (
                            <TextInput
                                value={signalName}
                                onChangeText={setSignalName}
                                autoFocus
                                style={[s.textInput, { backgroundColor: colors.inputBGColor, borderColor: colors.borderColor, color: colors.textColor }]}
                            />
                        ) : (
                            <RNText label={signalName || 'No name'} fontSize={fontSize._20} fontWeight={fontWeight._700} color={colors.textColor} />
                        )}
                    </View>

                    <View style={[s.divider, { backgroundColor: colors.borderColor }]} />

                    {/* Description */}
                    <View style={s.fieldWrap}>
                        <View style={s.fieldHeader}>
                            <RNText label="Description" fontSize={fontSize._14} fontWeight={fontWeight._500} color={colors.textColor} style={{ opacity: 0.7 }} />
                            {!isEditingDesc ? (
                                <TouchableOpacity onPress={() => setIsEditingDesc(true)} style={[s.editBtn, { backgroundColor: `${accent}15` }]} activeOpacity={0.8}>
                                    <Edit2 size={14} color={accent} />
                                </TouchableOpacity>
                            ) : (
                                <View style={s.editActions}>
                                    <TouchableOpacity onPress={() => setIsEditingDesc(false)} style={[s.editBtn, { backgroundColor: 'rgba(239,68,68,0.12)' }]} activeOpacity={0.8}>
                                        <X size={14} color="#EF4444" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleSaveDesc} style={[s.editBtn, { backgroundColor: 'rgba(34,197,94,0.12)' }]} activeOpacity={0.8}>
                                        <Save size={14} color="#22C55E" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                        {isEditingDesc ? (
                            <TextInput
                                value={signalDesc}
                                onChangeText={setSignalDesc}
                                autoFocus
                                multiline
                                numberOfLines={3}
                                style={[s.textInput, s.textAreaInput, { backgroundColor: colors.inputBGColor, borderColor: colors.borderColor, color: colors.textColor }]}
                            />
                        ) : (
                            <RNText label={signalDesc || 'No description'} fontSize={fontSize._14} fontWeight={fontWeight._500} color={colors.secondaryText} style={{ lineHeight: 22 }} />
                        )}
                    </View>

                    <View style={[s.divider, { backgroundColor: colors.borderColor }]} />

                    {/* Website */}
                    <View style={s.fieldWrap}>
                        <View style={s.fieldHeader}>
                            <RNText label="Website" fontSize={fontSize._14} fontWeight={fontWeight._500} color={colors.textColor} style={{ opacity: 0.7 }} />
                            {!isEditingLink ? (
                                <TouchableOpacity onPress={() => setIsEditingLink(true)} style={[s.editBtn, { backgroundColor: `${accent}15` }]} activeOpacity={0.8}>
                                    <Edit2 size={14} color={accent} />
                                </TouchableOpacity>
                            ) : (
                                <View style={s.editActions}>
                                    <TouchableOpacity onPress={() => setIsEditingLink(false)} style={[s.editBtn, { backgroundColor: 'rgba(239,68,68,0.12)' }]} activeOpacity={0.8}>
                                        <X size={14} color="#EF4444" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleSaveLink} style={[s.editBtn, { backgroundColor: 'rgba(34,197,94,0.12)' }]} activeOpacity={0.8}>
                                        <Save size={14} color="#22C55E" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                        {isEditingLink ? (
                            <View style={s.linkInputWrap}>
                                <Link size={16} color={colors.secondaryText} style={{ opacity: 0.5 }} />
                                <TextInput
                                    value={websiteLink}
                                    onChangeText={setWebsiteLink}
                                    autoFocus
                                    placeholder="https://example.com"
                                    placeholderTextColor={colors.secondaryText}
                                    style={[s.linkInput, { backgroundColor: colors.inputBGColor, borderColor: colors.borderColor, color: colors.textColor }]}
                                />
                            </View>
                        ) : (
                            <View style={s.linkDisplay}>
                                <Link size={14} color={colors.secondaryText} />
                                <RNText label={websiteLink || 'No website'} fontSize={fontSize._14} fontWeight={fontWeight._500} color={websiteLink ? accent : colors.secondaryText} style={{ marginLeft: 6 }} />
                            </View>
                        )}
                    </View>
                </View>

                {/* ── Signal QR Code Button ── */}
                <TouchableOpacity
                    onPress={handleOpenQr}
                    style={[s.qrBtn, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}
                    activeOpacity={0.9}
                >
                    <View style={s.qrBtnLeft}>
                        <View style={[s.qrIconWrap, { backgroundColor: `${accent}1A` }]}>
                            <QrCode size={20} color={accent} />
                        </View>
                        <View>
                            <RNText label="Signal QR Code" fontSize={fontSize._14} fontWeight={fontWeight._600} color={colors.textColor} />
                            <RNText label="Scan to subscribe" fontSize={fontSize._12} fontWeight={fontWeight._400} color={colors.secondaryText} style={{ opacity: 0.6 }} />
                        </View>
                    </View>
                    <ChevronRight size={18} color={colors.secondaryText} />
                </TouchableOpacity>

                {/* ── COMMUNITY section ── */}
                <RNText
                    label="COMMUNITY"
                    fontSize={fontSize._11}
                    fontWeight={fontWeight._700}
                    color={colors.secondaryText}
                    style={s.sectionLabel}
                />
                <View style={[s.card, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
                    <View style={s.communityRow}>
                        <View style={s.communityLeft}>
                            <View style={[s.communityIconWrap, { backgroundColor: `${colors.secondaryText}15` }]}>
                                <Users size={20} color={colors.textColor} />
                            </View>
                            <RNText label="Total Subscribers" fontSize={fontSize._15} fontWeight={fontWeight._500} color={colors.textColor} />
                        </View>
                        <RNText label={subscriberCount.toLocaleString()} fontSize={fontSize._18} fontWeight={fontWeight._700} color={colors.textColor} />
                    </View>
                </View>

                {/* ── DANGER ZONE ── */}
                <RNText
                    label="DANGER ZONE"
                    fontSize={fontSize._11}
                    fontWeight={fontWeight._700}
                    color="#EF4444"
                    style={s.sectionLabel}
                />
                <View style={[s.dangerCard, { backgroundColor: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.2)' }]}>
                    <TouchableOpacity
                        onPress={() => setShowDeleteDialog(true)}
                        style={s.deleteBtn}
                        activeOpacity={0.85}
                    >
                        <Trash2 size={20} color="#EF4444" />
                        <RNText label="Delete Signal" fontSize={fontSize._15} fontWeight={fontWeight._500} color="#EF4444" style={{ marginLeft: 10 }} />
                    </TouchableOpacity>
                </View>
                <RNText
                    label="Deleting a signal is permanent and cannot be undone. All messages and media will be lost."
                    fontSize={fontSize._12}
                    fontWeight={fontWeight._400}
                    color={colors.secondaryText}
                    style={{ opacity: 0.5, marginTop: 6, marginBottom: 32 }}
                />

            </ScrollView>

            {/* ── QR Code Modal ── */}
            <Modal visible={showQrModal} transparent animationType="fade" onRequestClose={() => setShowQrModal(false)}>
                <Pressable style={s.backdrop} onPress={() => setShowQrModal(false)}>
                    <Pressable onPress={() => {}}>
                        <View style={[s.qrCard, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
                            {/* Close */}
                            <TouchableOpacity onPress={() => setShowQrModal(false)} style={[s.qrCloseBtn, { backgroundColor: `${colors.secondaryText}20` }]} activeOpacity={0.8}>
                                <X size={18} color={colors.secondaryText} />
                            </TouchableOpacity>

                            <RNText label="Scan to Subscribe" fontSize={fontSize._22} fontWeight={fontWeight._700} color={colors.textColor} textAlign="center" />
                            <RNText label={signalName} fontSize={fontSize._14} fontWeight={fontWeight._400} color={colors.secondaryText} textAlign="center" style={{ marginTop: 4, marginBottom: 24 }} />

                            {/* QR outer glow + card */}
                            <View style={s.qrOuter}>
                                <View style={[s.qrGlow, { backgroundColor: `${accent}28` }]} />
                                <View style={[s.qrInner, { backgroundColor: colors.primary, borderColor: colors.borderColor }]}>
                                    <View style={[s.qrInnerTint, { backgroundColor: `${accent}0C` }]} />
                                    <View style={[s.qrWrap, { backgroundColor: colors.primary }]}>
                                        {qrLoading ? (
                                            <View style={{ width: 200, height: 200, alignItems: 'center', justifyContent: 'center' }}>
                                                <RNText label="Loading..." fontSize={fontSize._14} color={colors.secondaryText} />
                                            </View>
                                        ) : qrPayload ? (
                                            <QRCode value={qrPayload} size={200} color={accent} backgroundColor="transparent" />
                                        ) : (
                                            <View style={{ width: 200, height: 200, alignItems: 'center', justifyContent: 'center' }}>
                                                <RNText label="Unavailable" fontSize={fontSize._14} color={colors.secondaryText} />
                                            </View>
                                        )}

                                        {/* Center Megaphone icon */}
                                        <View style={s.centerIconOverlay}>
                                            <View style={s.centerIconRelative}>
                                                <QrGlow color={accent} />
                                                <View style={[s.centerIconBox, { borderColor: accent, backgroundColor: colors.primary }]}>
                                                    <Megaphone size={22} color={accent} strokeWidth={2.5} />
                                                </View>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Corner decorations */}
                                    <View style={[s.cornerTL, { borderColor: `${accent}66` }]} />
                                    <View style={[s.cornerTR, { borderColor: `${accent}66` }]} />
                                    <View style={[s.cornerBL, { borderColor: `${accent}66` }]} />
                                    <View style={[s.cornerBR, { borderColor: `${accent}66` }]} />
                                </View>
                            </View>

                            <RNText
                                label="Share this QR code with others so they can join this signal instantly."
                                fontSize={fontSize._12}
                                fontWeight={fontWeight._400}
                                color={colors.secondaryText}
                                textAlign="center"
                                style={{ opacity: 0.65, maxWidth: 240, marginTop: 16, marginBottom: 20 }}
                            />

                            {/* Buttons */}
                            <View style={s.qrBtnRow}>
                                <TouchableOpacity onPress={handleShareQr} style={[s.qrActionBtn, { backgroundColor: colors.inputBGColor, borderColor: colors.borderColor, borderWidth: 1 }]} activeOpacity={0.85}>
                                    <Share2 size={18} color={colors.textColor} />
                                    <RNText label="Share" fontSize={fontSize._15} fontWeight={fontWeight._600} color={colors.textColor} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleShareQr} style={[s.qrActionBtn, { backgroundColor: accent }]} activeOpacity={0.85}>
                                    <Share2 size={18} color="#FFFFFF" />
                                    <RNText label="Invite" fontSize={fontSize._15} fontWeight={fontWeight._600} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* ── Delete Signal Dialog ── */}
            <Modal visible={showDeleteDialog} transparent animationType="fade" onRequestClose={() => setShowDeleteDialog(false)}>
                <Pressable style={s.backdrop} onPress={() => setShowDeleteDialog(false)}>
                    <Pressable onPress={() => {}}>
                        <View style={[s.dialogCard, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
                            <View style={s.dialogIconWrap}>
                                <PulsingCircle color="#FF6363" />
                                <View style={[s.dialogIconBox, { backgroundColor: 'rgba(255,99,99,0.2)', borderColor: 'rgba(255,99,99,0.3)' }]}>
                                    <Trash2 size={32} color="#FF6363" strokeWidth={2} />
                                </View>
                            </View>
                            <RNText label="Delete Signal?" fontSize={fontSize._20} fontWeight={fontWeight._700} color={colors.textColor} textAlign="center" style={{ marginTop: 16, marginBottom: 8 }} />
                            <RNText label="This action cannot be undone. This will permanently delete the signal and all its data." fontSize={fontSize._14} fontWeight={fontWeight._400} color={colors.secondaryText} textAlign="center" style={{ marginBottom: 24 }} />
                            <View style={s.dialogBtnRow}>
                                <TouchableOpacity onPress={() => setShowDeleteDialog(false)} style={[s.dialogBtn, s.dialogBtnCancel, { backgroundColor: colors.inputBGColor, borderColor: colors.borderColor }]} activeOpacity={0.85}>
                                    <RNText label="Cancel" fontSize={fontSize._15} fontWeight={fontWeight._600} color={colors.textColor} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { setShowDeleteDialog(false); setLoader(true); deleteChanel() }} style={[s.dialogBtn, { backgroundColor: '#FF6363' }]} activeOpacity={0.85}>
                                    <RNText label="Delete Signal" fontSize={fontSize._15} fontWeight={fontWeight._600} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    )
}

export default ChanelProfileSettingScreen

const CORNER = 28
const CORNER_OFF = 12

const getStyles = (colors: any, accent: string) =>
    StyleSheet.create({
        root: { flex: 1 },

        // Header
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            marginBottom: 8,
        },
        backBtn: {
            width: 36,
            height: 36,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
        },

        // Scroll
        scroll: {
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 40,
        },

        // Avatar
        avatarSection: {
            alignItems: 'center',
            marginBottom: 28,
        },
        avatarOuter: {
            position: 'relative',
        },
        avatar: {
            width: 112,
            height: 112,
            borderRadius: 56,
            borderWidth: 4,
            borderColor: 'rgba(255,255,255,0.1)',
        },
        avatarInitials: {
            alignItems: 'center',
            justifyContent: 'center',
        },
        cameraBtn: {
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
        },

        // Section label
        sectionLabel: {
            letterSpacing: 1.1,
            opacity: 0.6,
            marginBottom: 10,
            marginLeft: 4,
        },

        // Card
        card: {
            borderRadius: 20,
            borderWidth: 1,
            padding: 16,
            marginBottom: 12,
        },

        // Field (inside card)
        fieldWrap: {
            paddingVertical: 4,
        },
        fieldHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 6,
        },
        editBtn: {
            width: 30,
            height: 30,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
        },
        editActions: {
            flexDirection: 'row',
            gap: 6,
        },
        textInput: {
            borderWidth: 1,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 16,
            fontWeight: '600',
        },
        textAreaInput: {
            minHeight: 80,
            textAlignVertical: 'top',
            fontWeight: '500',
            fontSize: 14,
        },
        linkInputWrap: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        linkInput: {
            flex: 1,
            borderWidth: 1,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 14,
            fontWeight: '500',
        },
        linkDisplay: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        divider: {
            height: 1,
            marginVertical: 12,
        },

        // QR code row button
        qrBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            borderRadius: 20,
            borderWidth: 1,
            marginBottom: 20,
        },
        qrBtnLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        qrIconWrap: {
            width: 44,
            height: 44,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
        },

        // Community
        communityRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        communityLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        communityIconWrap: {
            width: 40,
            height: 40,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
        },

        // Danger zone
        dangerCard: {
            borderRadius: 20,
            borderWidth: 1,
            overflow: 'hidden',
        },
        deleteBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
        },

        // Backdrop
        backdrop: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.7)',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24,
        },

        // QR Modal card
        qrCard: {
            width: '100%',
            borderRadius: 28,
            borderWidth: 1,
            padding: 24,
            alignItems: 'center',
            position: 'relative',
        },
        qrCloseBtn: {
            position: 'absolute',
            top: 16,
            right: 16,
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
        },
        qrOuter: {
            position: 'relative',
            alignItems: 'center',
            justifyContent: 'center',
        },
        qrGlow: {
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: 150,
        },
        qrInner: {
            position: 'relative',
            borderRadius: 24,
            borderWidth: 1,
            padding: 16,
            overflow: 'hidden',
        },
        qrInnerTint: {
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            borderRadius: 24,
        },
        qrWrap: {
            position: 'relative',
            borderRadius: 16,
            padding: 12,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
        },
        centerIconOverlay: {
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
        },
        centerIconRelative: {
            alignItems: 'center',
            justifyContent: 'center',
        },
        centerIconBox: {
            width: 44,
            height: 44,
            borderRadius: 22,
            borderWidth: 2,
            alignItems: 'center',
            justifyContent: 'center',
        },
        cornerTL: { position: 'absolute', top: CORNER_OFF, left: CORNER_OFF, width: CORNER, height: CORNER, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 8 },
        cornerTR: { position: 'absolute', top: CORNER_OFF, right: CORNER_OFF, width: CORNER, height: CORNER, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 8 },
        cornerBL: { position: 'absolute', bottom: CORNER_OFF, left: CORNER_OFF, width: CORNER, height: CORNER, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 8 },
        cornerBR: { position: 'absolute', bottom: CORNER_OFF, right: CORNER_OFF, width: CORNER, height: CORNER, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 8 },
        qrBtnRow: {
            flexDirection: 'row',
            gap: 12,
            width: '100%',
        },
        qrActionBtn: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 14,
            borderRadius: 16,
        },

        // Delete dialog
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
