import React, { memo, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, TouchableOpacity, View, useWindowDimensions } from 'react-native'
import { Audio } from 'expo-av'
import RNText from '../text'
import { Pause, Play } from 'lucide-react-native'
import fontSize from '../../../constants/font-size'
import fontWeight from '../../../constants/font-weight'

interface AudioPlayerProps {
    audioUri: string
    person?: string
    message?: string
    bubbleText?: string
    black?: string
}

const WAVE_BARS = [6, 10, 8, 14, 7, 12, 9, 16, 11, 8, 13, 7, 12, 9, 15, 6]

const AudioPlayer = memo(({ audioUri, person, message, bubbleText, black }: AudioPlayerProps) => {
    const { width: screenWidth } = useWindowDimensions()
    const [currentPosition, setCurrentPosition] = useState(0)
    const [trackDuration, setTrackDuration] = useState(0)
    const [playing, setPlaying] = useState(false)
    const soundRef = useRef<Audio.Sound | null>(null)
    const pulse = useRef(new Animated.Value(1)).current
    const waveAnims = useRef(WAVE_BARS.map(() => new Animated.Value(6))).current
    const waveLoopRef = useRef<Animated.CompositeAnimation | null>(null)

    const progress = useMemo(() => {
        if (!trackDuration) return 0
        return Math.max(0, Math.min(1, currentPosition / trackDuration))
    }, [currentPosition, trackDuration])

    useEffect(() => {
        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync().catch(() => {})
                soundRef.current = null
            }
        }
    }, [])

    const animateTap = () => {
        Animated.sequence([
            Animated.timing(pulse, { toValue: 0.92, duration: 90, useNativeDriver: true }),
            Animated.timing(pulse, { toValue: 1, duration: 120, useNativeDriver: true }),
        ]).start()
    }

    useEffect(() => {
        if (!playing) {
            waveLoopRef.current?.stop()
            waveAnims.forEach((v, i) => v.setValue(Math.max(6, WAVE_BARS[i] - 3)))
            return
        }
        const loops = waveAnims.map((v, i) =>
            Animated.loop(
                Animated.sequence([
                    Animated.timing(v, {
                        toValue: WAVE_BARS[i],
                        duration: 230 + i * 18,
                        useNativeDriver: false,
                    }),
                    Animated.timing(v, {
                        toValue: Math.max(6, WAVE_BARS[i] - 5),
                        duration: 230 + i * 18,
                        useNativeDriver: false,
                    }),
                ])
            )
        )
        waveLoopRef.current = Animated.parallel(loops)
        waveLoopRef.current.start()
        return () => waveLoopRef.current?.stop()
    }, [playing, waveAnims])

    const handlePlayback = async () => {
        animateTap()
        try {
            if (playing && soundRef.current) {
                await soundRef.current.pauseAsync()
                setPlaying(false)
                return
            }

            if (soundRef.current) {
                await soundRef.current.playAsync()
                setPlaying(true)
                return
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: true,
            })

            const { sound } = await Audio.Sound.createAsync(
                { uri: audioUri },
                { shouldPlay: true },
            )
            soundRef.current = sound
            setPlaying(true)

            sound.setOnPlaybackStatusUpdate((status: any) => {
                if (status.isLoaded) {
                    setCurrentPosition(status.positionMillis || 0)
                    setTrackDuration(status.durationMillis || 1)
                    if (status.didJustFinish) {
                        setPlaying(false)
                        setCurrentPosition(0)
                        soundRef.current?.unloadAsync().catch(() => {})
                        soundRef.current = null
                    }
                }
            })
        } catch (error: any) {
            console.log('Playback error:', error.message)
            setPlaying(false)
        }
    }

    const formatAudioTime = (ms: number) => {
        const totalSecs = Math.floor(ms / 1000)
        const m = Math.floor(totalSecs / 60)
        const s = totalSecs % 60
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }

    return (
        <>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '100%',
                    minWidth: Math.min(190, screenWidth * 0.56),
                }}
            >
                <Animated.View style={{ transform: [{ scale: pulse }] }}>
                    <TouchableOpacity
                        style={{
                            width: 38,
                            height: 38,
                            borderRadius: 19,
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onPress={handlePlayback}
                    >
                        {playing ? <Pause size={18} color="#FFFFFF" /> : <Play size={18} color="#FFFFFF" fill="#FFFFFF" />}
                    </TouchableOpacity>
                </Animated.View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', height: 18 }}>
                        {WAVE_BARS.map((_, i) => {
                            const barProgress = (i + 1) / WAVE_BARS.length
                            const active = progress >= barProgress
                            return (
                                <Animated.View
                                    key={`wave-${i}`}
                                    style={{
                                        width: 3,
                                        marginRight: i === WAVE_BARS.length - 1 ? 0 : 2,
                                        borderRadius: 2,
                                        height: waveAnims[i],
                                        backgroundColor: active ? '#FFFFFF' : 'rgba(255,255,255,0.45)',
                                    }}
                                />
                            )
                        })}
                    </View>
                </View>
                <RNText
                    label={trackDuration > 0 ? formatAudioTime(trackDuration) : '00:00'}
                    fontSize={fontSize._11}
                    fontWeight={fontWeight._700}
                    color="rgba(255,255,255,0.85)"
                    style={{ marginLeft: 8 }}
                />
            </View>
            {message ? (
                <RNText
                    alignSelf={person === 'sender' ? 'flex-end' : 'flex-start'}
                    fontSize={fontSize._15}
                    fontWeight={fontWeight._700}
                    label={message}
                    numberOfLines={2}
                    lineHeight={22}
                    marginTop={4}
                    color={bubbleText ?? black}
                />
            ) : null}
        </>
    )
})

export default AudioPlayer
