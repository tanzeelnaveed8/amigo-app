import React, { useContext, useEffect, useRef, useState } from 'react'
import {
    ActivityIndicator,
    Animated,
    Platform,
    SafeAreaView,
    ScrollView,
    Share,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
import { useRoute } from '@react-navigation/native'
import QRCode from 'react-native-qrcode-svg'
import { ArrowLeft, Ghost, MessageSquare, Radio, Share2 } from 'lucide-react-native'
import Context from '../../context'
import RNText from '../../component/atoms/text'
import { getQrPayload } from '../../apis/qr'
import useNavigationHook from '../../hooks/use_navigation'
import fontSize from '../../constants/font-size'
import fontWeight from '../../constants/font-weight'

const ProfileQRScreen = () => {
    const navigation = useNavigationHook()
    const route = useRoute<any>()
    const { colors } = useContext(Context)

    const type = (route.params?.type as 'dm' | 'group' | 'channel') ?? 'group'
    const id = route.params?.id ?? ''
    const paramName = route.params?.name ?? ''

    const [payload, setPayload] = useState<string | null>(null)
    const [name, setName] = useState(paramName)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Pulsing glow animation for center icon
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

    useEffect(() => {
        let cancelled = false
        if (!id) {
            setError('Missing profile id')
            setLoading(false)
            return
        }
        getQrPayload(type, id)
            .then((res) => {
                if (cancelled) return
                if (res.success && res.data) {
                    setPayload(res.data.payload)
                    setName(res.data.name || paramName)
                } else {
                    setError('Failed to load QR code')
                }
            })
            .catch((e) => {
                if (!cancelled) setError(e?.response?.data?.message || 'Failed to load QR code')
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })
        return () => { cancelled = true }
    }, [type, id])

    const handleShare = async () => {
        if (!payload) return
        try {
            await Share.share({
                message: `Join "${name}" on Amigo: ${payload}`,
                title: `Join "${name}" on Amigo`,
            })
        } catch { }
    }

    const getSubtitle = () => {
        if (type === 'dm') return 'Scan to start chat'
        if (type === 'group') return 'Scan to join room'
        return 'Scan to subscribe to signal'
    }

    const CenterIcon = () => {
        const Icon = type === 'channel' ? Radio : type === 'dm' ? MessageSquare : Ghost
        return (
            <View style={styles.iconOverlay}>
                <View style={styles.iconRelative}>
                    {/* Pulsing glow */}
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
                    {/* Icon box */}
                    <View style={[styles.iconBox, { borderColor: colors.accentColor, backgroundColor: colors.primary }]}>
                        <Icon size={22} color={colors.accentColor} strokeWidth={2.5} />
                    </View>
                </View>
            </View>
        )
    }

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.primary }]}>

            {/* ── Header ── */}
            <View style={[styles.header, { marginTop: Platform.OS === 'android' ? 10 : 0 }]}>
                <TouchableOpacity
                    onPress={navigation.goBack}
                    style={[styles.backBtn, { borderColor: colors.borderColor, backgroundColor: colors.cardBg }]}
                    activeOpacity={0.85}
                >
                    <ArrowLeft size={22} color={colors.secondaryText} />
                </TouchableOpacity>
                <RNText label="Share QR Code" fontSize={fontSize._18} fontWeight={fontWeight._700} color={colors.textColor} />
                <View style={{ width: 36 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <ActivityIndicator size="large" color={colors.accentColor} style={{ marginTop: 80 }} />

                ) : error ? (
                    <RNText
                        label={error}
                        fontSize={fontSize._14}
                        color={colors.red}
                        textAlign="center"
                        marginTop={60}
                    />

                ) : payload ? (
                    <>
                        {/* ── Title ── */}
                        <RNText
                            label="Scan to Join"
                            fontSize={fontSize._22}
                            fontWeight={fontWeight._700}
                            color={colors.textColor}
                            textAlign="center"
                        />
                        <RNText
                            label={name}
                            fontSize={fontSize._14}
                            fontWeight={fontWeight._400}
                            color={colors.secondaryText}
                            textAlign="center"
                            marginTop={4}
                            style={{ marginBottom: 28 }}
                        />

                        {/* ── QR Card ── */}
                        <View style={styles.qrCardOuter}>
                            {/* Outer glow (soft halo) */}
                            <View
                                style={[
                                    styles.outerGlow,
                                    { backgroundColor: `${colors.accentColor}28` },
                                ]}
                            />

                            {/* Card */}
                            <View
                                style={[
                                    styles.qrCard,
                                    {
                                        backgroundColor: colors.cardBg,
                                        borderColor: colors.borderColor,
                                    },
                                ]}
                            >
                                {/* Inner accent tint */}
                                <View
                                    style={[
                                        styles.innerTint,
                                        { backgroundColor: `${colors.accentColor}0C` },
                                    ]}
                                />

                                {/* QR Wrapper */}
                                <View style={[styles.qrWrap, { backgroundColor: colors.primary }]}>
                                    <View
                                        style={[
                                            styles.qrInnerTint,
                                            { backgroundColor: `${colors.accentColor}07` },
                                        ]}
                                    />
                                    <QRCode
                                        value={payload}
                                        size={200}
                                        color={colors.accentColor}
                                        backgroundColor="transparent"
                                    />
                                    <CenterIcon />
                                </View>

                                {/* ── Corner Decorations ── */}
                                <View style={[styles.cornerTL, { borderColor: `${colors.accentColor}66` }]} />
                                <View style={[styles.cornerTR, { borderColor: `${colors.accentColor}66` }]} />
                                <View style={[styles.cornerBL, { borderColor: `${colors.accentColor}66` }]} />
                                <View style={[styles.cornerBR, { borderColor: `${colors.accentColor}66` }]} />
                            </View>
                        </View>

                        {/* ── Info Text ── */}
                        <RNText
                            label="Share this QR code with others so they can join this room instantly."
                            fontSize={fontSize._12}
                            fontWeight={fontWeight._400}
                            color={colors.secondaryText}
                            textAlign="center"
                            style={styles.infoText}
                        />

                        {/* ── Action Buttons ── */}
                        <View style={styles.btnRow}>
                            {/* Share (outlined) */}
                            <TouchableOpacity
                                onPress={handleShare}
                                style={[
                                    styles.btn,
                                    styles.btnOutlined,
                                    {
                                        backgroundColor: colors.cardBg,
                                        borderColor: colors.borderColor,
                                    },
                                ]}
                                activeOpacity={0.85}
                            >
                                <Share2 size={18} color={colors.textColor} />
                                <RNText
                                    label="Share"
                                    fontSize={fontSize._15}
                                    fontWeight={fontWeight._600}
                                    color={colors.textColor}
                                />
                            </TouchableOpacity>

                            {/* Save / Invite (filled) */}
                            <TouchableOpacity
                                onPress={handleShare}
                                style={[
                                    styles.btn,
                                    styles.btnFilled,
                                    { backgroundColor: colors.accentColor },
                                ]}
                                activeOpacity={0.85}
                            >
                                <Share2 size={18} color="#FFFFFF" />
                                <RNText
                                    label="Invite"
                                    fontSize={fontSize._15}
                                    fontWeight={fontWeight._600}
                                    color="#FFFFFF"
                                />
                            </TouchableOpacity>
                        </View>
                    </>
                ) : null}
            </ScrollView>
        </SafeAreaView>
    )
}

export default ProfileQRScreen

const CORNER_SIZE = 28
const CORNER_OFFSET = 12

const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },
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
    scroll: {
        flexGrow: 1,
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 12,
    },

    // ── QR Card outer
    qrCardOuter: {
        position: 'relative',
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    outerGlow: {
        position: 'absolute',
        width: 340,
        height: 340,
        borderRadius: 170,
    },
    qrCard: {
        position: 'relative',
        borderRadius: 28,
        borderWidth: 1,
        padding: 20,
        overflow: 'hidden',
    },
    innerTint: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 28,
    },

    // ── QR inner wrapper
    qrWrap: {
        position: 'relative',
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    qrInnerTint: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 20,
    },

    // ── Center icon overlay
    iconOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconRelative: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconGlow: {
        position: 'absolute',
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ── Corner decorations
    cornerTL: {
        position: 'absolute',
        top: CORNER_OFFSET,
        left: CORNER_OFFSET,
        width: CORNER_SIZE,
        height: CORNER_SIZE,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderTopLeftRadius: 8,
    },
    cornerTR: {
        position: 'absolute',
        top: CORNER_OFFSET,
        right: CORNER_OFFSET,
        width: CORNER_SIZE,
        height: CORNER_SIZE,
        borderTopWidth: 2,
        borderRightWidth: 2,
        borderTopRightRadius: 8,
    },
    cornerBL: {
        position: 'absolute',
        bottom: CORNER_OFFSET,
        left: CORNER_OFFSET,
        width: CORNER_SIZE,
        height: CORNER_SIZE,
        borderBottomWidth: 2,
        borderLeftWidth: 2,
        borderBottomLeftRadius: 8,
    },
    cornerBR: {
        position: 'absolute',
        bottom: CORNER_OFFSET,
        right: CORNER_OFFSET,
        width: CORNER_SIZE,
        height: CORNER_SIZE,
        borderBottomWidth: 2,
        borderRightWidth: 2,
        borderBottomRightRadius: 8,
    },

    // ── Buttons
    infoText: {
        opacity: 0.65,
        maxWidth: 240,
        marginBottom: 24,
    },
    btnRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    btn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 16,
    },
    btnOutlined: {
        borderWidth: 1,
    },
    btnFilled: {
        // shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
})
