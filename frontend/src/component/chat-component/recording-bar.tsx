import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Animated, Easing, PermissionsAndroid, Platform, TouchableOpacity, View } from 'react-native'
import { Pause, Play, Send, Trash2 } from 'lucide-react-native'
import RNText from '../atoms/text'
import Context from '../../context'
import fontSize from '../../constants/font-size'
import fontWeight from '../../constants/font-weight'

interface RecordingBarProps {
    audioRecorderPlayer: any
    onRecordingComplete: (result: any) => void
    onRecordingCancel: () => void
    setToastMsg: (msg: string) => void
}

const RecordingBar = React.memo(({ audioRecorderPlayer, onRecordingComplete, onRecordingCancel, setToastMsg }: RecordingBarProps) => {
    const { colors } = useContext(Context)
    const [rectime, setRectime] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const pulseAnim = useRef(new Animated.Value(1)).current
    const barAnims = useRef([...Array(16)].map(() => new Animated.Value(6))).current
    const isActiveRef = useRef(true)
    const barsLoopRef = useRef<Animated.CompositeAnimation | null>(null)

    const startBarsAnimation = useCallback(() => {
        barsLoopRef.current?.stop()
        const barLoops = barAnims.map((bar, idx) =>
            Animated.loop(
                Animated.sequence([
                    Animated.timing(bar, {
                        toValue: 10 + (idx % 5) * 2,
                        duration: 260 + idx * 20,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: false,
                    }),
                    Animated.timing(bar, {
                        toValue: 6,
                        duration: 260 + idx * 20,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: false,
                    }),
                ])
            )
        )
        barsLoopRef.current = Animated.parallel(barLoops)
        barsLoopRef.current.start()
    }, [barAnims])

    const stopPulse = useCallback(() => {
        pulseAnim.stopAnimation()
        pulseAnim.setValue(0.35)
    }, [pulseAnim])

    useEffect(() => {
        isActiveRef.current = true

        const startAsync = async () => {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO)
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    onRecordingCancel()
                    return
                }
            }

            try {
                await audioRecorderPlayer.stopRecorder()
            } catch (_) {}

            try {
                audioRecorderPlayer.addRecordBackListener((e: any) => {
                    if (isActiveRef.current) {
                        setRectime(e.currentPosition / 1000)
                    }
                })
                await audioRecorderPlayer.startRecorder()
            } catch (error: any) {
                setToastMsg(error.message)
                onRecordingCancel()
            }
        }

        startAsync()

        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 0.3, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ])
        )
        loop.start()
        startBarsAnimation()

        return () => {
            isActiveRef.current = false
            loop.stop()
            barsLoopRef.current?.stop()
        }
    }, [startBarsAnimation])

    const formatTime = useCallback((seconds: number) => {
        const m = String(Math.floor(seconds / 60)).padStart(2, '0')
        const s = String(Math.floor(seconds % 60)).padStart(2, '0')
        return `${m}:${s}`
    }, [])

    const handleCancel = useCallback(async () => {
        isActiveRef.current = false
        barsLoopRef.current?.stop()
        stopPulse()
        try {
            await audioRecorderPlayer.stopRecorder()
            audioRecorderPlayer.removeRecordBackListener()
        } catch (_) {}
        onRecordingCancel()
    }, [audioRecorderPlayer, onRecordingCancel, stopPulse])

    const handleSend = useCallback(async () => {
        isActiveRef.current = false
        barsLoopRef.current?.stop()
        stopPulse()
        try {
            const result = await audioRecorderPlayer.stopRecorder()
            audioRecorderPlayer.removeRecordBackListener()
            if (result) {
                onRecordingComplete(result)
            }
        } catch (error: any) {
            console.log('Stop recording error:', error.message)
        }
    }, [audioRecorderPlayer, onRecordingComplete, stopPulse])

    const handlePauseResume = useCallback(async () => {
        try {
            if (isPaused) {
                await audioRecorderPlayer.resumeRecorder?.()
                setIsPaused(false)
                pulseAnim.setValue(1)
                startBarsAnimation()
            } else {
                await audioRecorderPlayer.pauseRecorder?.()
                setIsPaused(true)
                barsLoopRef.current?.stop()
                stopPulse()
            }
        } catch (error: any) {
            setToastMsg(error?.message || 'Unable to update recording state')
        }
    }, [audioRecorderPlayer, isPaused, pulseAnim, setToastMsg, startBarsAnimation, stopPulse])

    return (
        <>
            <TouchableOpacity
                onPress={handleCancel}
                activeOpacity={0.7}
                style={{
                    width: 44, height: 44, borderRadius: 22,
                    backgroundColor: 'rgba(255,77,77,0.12)',
                    alignItems: 'center', justifyContent: 'center',
                }}
            >
                <Trash2 size={20} color="#FF4D4D" strokeWidth={2} />
            </TouchableOpacity>
            <View style={{
                flex: 1, flexDirection: 'row', alignItems: 'center',
                marginHorizontal: 10, paddingHorizontal: 15,
                backgroundColor: colors.inputBGColor,
                borderRadius: 20, height: 48, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
            }}>
                <Animated.View style={{
                    width: 10, height: 10, borderRadius: 5,
                    backgroundColor: '#FF4D4D', marginRight: 10,
                    opacity: pulseAnim,
                }} />
                <RNText label={formatTime(rectime)} fontSize={fontSize._16} fontWeight={fontWeight._700} color={colors.textColor} />
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 }}>
                    {barAnims.map((bar, i) => (
                        <Animated.View
                            key={`bar-${i}`}
                            style={{
                                width: 3,
                                marginRight: i === barAnims.length - 1 ? 0 : 2,
                                borderRadius: 2,
                                backgroundColor: colors.textColor,
                                opacity: isPaused ? 0.3 : 0.7,
                                height: bar,
                            }}
                        />
                    ))}
                </View>
                <TouchableOpacity
                    onPress={handlePauseResume}
                    style={{
                        width: 34,
                        height: 34,
                        borderRadius: 17,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 8,
                        backgroundColor: 'rgba(255,255,255,0.08)',
                    }}
                    activeOpacity={0.8}
                >
                    {isPaused ? <Play size={18} color={colors.textColor} /> : <Pause size={18} color={colors.textColor} />}
                </TouchableOpacity>
            </View>
            <TouchableOpacity
                onPress={handleSend}
                activeOpacity={0.8}
                style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.accentColor ?? '#9B7BFF',
                }}
            >
                <Send size={18} color="#FFFFFF" />
            </TouchableOpacity>
        </>
    )
})

export default RecordingBar
