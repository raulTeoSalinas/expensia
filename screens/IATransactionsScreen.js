import { useEffect, useRef, useState } from 'react'
import {
    Alert,
    Animated,
    Easing,
    Modal,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
    Image,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation, CommonActions } from '@react-navigation/native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import Text from '@components/Text'
import Colors from '@constants/colors'
import { closeFabContainerStyle, closeFabIconStyle } from '@utils/closeFabLayout'
import { useVoiceTransaction } from '@hooks/useVoiceTransaction'
import { useTranslation } from '@hooks/useTranslation'

// idle | recording | processing

export default function IATransactionsScreen() {
    const insets = useSafeAreaInsets()
    const navigation = useNavigation()
    const strings = useTranslation().iaTransactionsScreen
    const { isRecording, isLoading, meteringDb, startRecording, stopAndParse, cancelRecording } =
        useVoiceTransaction()

    const [isHelpModalVisible, setIsHelpModalVisible] = useState(false)

    // Derived UI state for this screen
    const screenState = isLoading
        ? 'processing'
        : isRecording
        ? 'recording'
        : 'idle'


    // ── Rotating loading copy while processing ─────────────────────────────────
    const randomIndex = (length, exclude) => {
        if (length <= 1) return 0
        let next = Math.floor(Math.random() * length)
        while (next === exclude) {
            next = Math.floor(Math.random() * length)
        }
        return next
    }

    const [loadingMsgIndex, setLoadingMsgIndex] = useState(() =>
        randomIndex(strings.loadingMsgs.length, -1)
    )
    const loadingMsgOpacity = useRef(new Animated.Value(1)).current
    const loadingMsgTranslateY = useRef(new Animated.Value(0)).current

    useEffect(() => {
        StatusBar.setBarStyle('light-content')
        return () => {
            StatusBar.setBarStyle('dark-content')
        }
    }, [])

    useEffect(() => {
        if (!isLoading) return
        const id = setInterval(() => {
            setLoadingMsgIndex((i) => randomIndex(strings.loadingMsgs.length, i))
        }, 2200)
        return () => clearInterval(id)
    }, [isLoading, strings.loadingMsgs.length])

    useEffect(() => {
        if (!isLoading) return
        loadingMsgOpacity.setValue(0)
        loadingMsgTranslateY.setValue(6)
        Animated.parallel([
            Animated.timing(loadingMsgOpacity, {
                toValue: 1,
                duration: 380,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.timing(loadingMsgTranslateY, {
                toValue: 0,
                duration: 380,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
        ]).start()
    }, [isLoading, loadingMsgIndex, loadingMsgOpacity, loadingMsgTranslateY])

    // ── Animations ───────────────────────────────────────────────────────────
    // Outer pulse rings
    const pulse1 = useRef(new Animated.Value(1)).current
    const pulse2 = useRef(new Animated.Value(1)).current
    const pulse1Opacity = useRef(new Animated.Value(0.6)).current
    const pulse2Opacity = useRef(new Animated.Value(0.4)).current

    // Outer glow
    const glowScale = useRef(new Animated.Value(1)).current
    const glowOpacity = useRef(new Animated.Value(0.2)).current

    // Main circle scale (reacts to input metering)
    const circleScale = useRef(new Animated.Value(1)).current

    // Inner pink ring driven by voice level
    const voiceRingScale = useRef(new Animated.Value(1)).current
    const voiceRingOpacity = useRef(new Animated.Value(0)).current

    // ── Wave loop ─────────────────────────────────────────────────────────
    useEffect(() => {
        const wave = (anim, opacityAnim, delay) =>
            Animated.loop(
                Animated.parallel([
                    Animated.sequence([
                        Animated.delay(delay),
                        Animated.timing(anim, {
                            toValue: 1.7,
                            duration: 1600,
                            easing: Easing.out(Easing.quad),
                            useNativeDriver: true,
                        }),
                        Animated.timing(anim, {
                            toValue: 1,
                            duration: 0,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.sequence([
                        Animated.delay(delay),
                        Animated.timing(opacityAnim, {
                            toValue: 0,
                            duration: 1600,
                            easing: Easing.out(Easing.quad),
                            useNativeDriver: true,
                        }),
                        Animated.timing(opacityAnim, {
                            toValue: isRecording ? 0.6 : 0,
                            duration: 0,
                            useNativeDriver: true,
                        }),
                    ]),
                ])
            )

        const a1 = wave(pulse1, pulse1Opacity, 0)
        const a2 = wave(pulse2, pulse2Opacity, 800)
        a1.start()
        a2.start()
        return () => {
            a1.stop()
            a2.stop()
        }
    }, [isRecording])

    // ── Pink glow loop while recording only ───────────────────────────────────────
    useEffect(() => {
        let glowLoop
        if (isRecording) {
            glowLoop = Animated.loop(
                Animated.sequence([
                    Animated.timing(glowScale, {
                        toValue: 1.25,
                        duration: 1200,
                        easing: Easing.inOut(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowScale, {
                        toValue: 1,
                        duration: 1200,
                        easing: Easing.inOut(Easing.quad),
                        useNativeDriver: true,
                    }),
                ])
            )
            Animated.timing(glowOpacity, {
                toValue: 0.45,
                duration: 400,
                useNativeDriver: true,
            }).start()
            glowLoop.start()
        } else {
            Animated.timing(glowOpacity, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }).start()
            glowScale.setValue(1)
        }
        return () => glowLoop?.stop()
    }, [isRecording])

    // ── "Thinking" glow while processing ────────────────────────────────────
    // Single Animated.Value oscillating 0→1→0 to avoid the one-frame glitch
    // from Animated.loop with nested sequence + parallel.
    // Initial value -1 = invisible (outside the useful inputRange)
    const processingBreath = useRef(new Animated.Value(-1)).current
    const processingLoopRef = useRef(null)
    const processingActiveRef = useRef(false)

    const runBreathCycle = () => {
        if (!processingActiveRef.current) return
        Animated.sequence([
            Animated.timing(processingBreath, {
                toValue: 1,
                duration: 850,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
            }),
            Animated.timing(processingBreath, {
                toValue: 0,
                duration: 850,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
            }),
        ]).start(({ finished }) => {
            if (finished) runBreathCycle()
        })
    }

    useEffect(() => {
        if (screenState === 'processing') {
            processingActiveRef.current = true
            processingBreath.setValue(0)
            runBreathCycle()
        } else {
            processingActiveRef.current = false
            processingBreath.stopAnimation()
            Animated.timing(processingBreath, {
                toValue: -1,
                duration: 600,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }).start()
        }
        return () => {
            processingActiveRef.current = false
            processingBreath.stopAnimation()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [screenState])

    // ── Main circle + voice ring react to the mic ───────────────
    useEffect(() => {
        if (!isRecording) {
            Animated.parallel([
                Animated.spring(circleScale, {
                    toValue: 1,
                    useNativeDriver: true,
                }),
                Animated.timing(voiceRingOpacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(voiceRingScale, {
                    toValue: 1,
                    useNativeDriver: true,
                }),
            ]).start()
            return
        }

        // meteringDb ranges from -160 (silence) to 0 (max)
        // Use a tighter band (-50 to 0) for a stronger visual response
        const normalized = Math.max(0, Math.min(1, (meteringDb + 50) / 50))

        // Main circle: subtle scale bump
        Animated.spring(circleScale, {
            toValue: 1 + normalized * 0.12,
            speed: 60,
            bounciness: 4,
            useNativeDriver: true,
        }).start()

        // Inner pink ring: stronger scale response
        Animated.spring(voiceRingScale, {
            toValue: 1 + normalized * 1.1,
            speed: 50,
            bounciness: 6,
            useNativeDriver: true,
        }).start()

        // Ring opacity: louder input → more visible
        Animated.timing(voiceRingOpacity, {
            toValue: 0.15 + normalized * 0.55,
            duration: 60,
            useNativeDriver: true,
        }).start()
    }, [meteringDb, isRecording])

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handlePress = async () => {
        if (screenState === 'processing') return

        if (screenState === 'idle') {
            try {
                await startRecording()
            } catch (e) {
                Alert.alert('Error', e.message ?? strings.errorStartRecording)
            }
            return
        }

        if (screenState === 'recording') {
            try {
                const result = await stopAndParse()
                console.log('[IATransactionsScreen] Backend response:', result)
                if (!result) {
                    Alert.alert(strings.errorProcessing, strings.alertNoResponse)
                    return
                }
                navigation.dispatch(state => {
                    const routes = [
                        ...state.routes.filter(
                            r => r.name !== 'TypeTransaction' && r.name !== 'IATransactions'
                        ),
                        {
                            name: 'Transaction',
                            params: {
                                typeTrans:               result.type,
                                prefillAmount:           result.amount != null ? String(result.amount) : undefined,
                                prefillAccountId:        result.idAccount ?? undefined,
                                prefillGlobalCategoryId: result.globalCategoryId ?? undefined,
                                prefillCustomCategoryId: result.customCategoryId ?? undefined,
                                prefillDescription:      result.description ?? undefined,
                                prefillDate:             result.date ?? undefined,
                                prefillTranscript:       result.transcript ?? undefined,
                            },
                        },
                    ]
                    return CommonActions.reset({ ...state, routes, index: routes.length - 1 })
                })
            } catch (e) {
                Alert.alert(strings.errorProcessing, e.message ?? strings.errorGeneric)
            }
        }
    }

    // ── Central circle label ────────────────────────────────────────────
    const circleLabel =
        screenState === 'idle'
            ? strings.hintIdle
            : screenState === 'recording'
            ? strings.hintRecording
            : ''

    return (
        <View style={[styles.root, { paddingBottom: insets.bottom }]}>
            <TouchableOpacity
                activeOpacity={0.75}
                style={[styles.helpFab, { top: insets.top + 15 }]}
                onPress={() => setIsHelpModalVisible(true)}
                hitSlop={12}
            >
                <Text style={styles.helpFabText}>{strings.helpBtn}</Text>
            </TouchableOpacity>

            {/* Close */}
            <TouchableOpacity
                activeOpacity={0.7}
                style={closeFabContainerStyle(insets)}
                onPress={() => navigation.goBack()}
                hitSlop={12}
            >
                <Image
                    style={closeFabIconStyle}
                    source={require('../assets/images/icon-close.png')}
                />
            </TouchableOpacity>

            {/* Title */}
            <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <Text style={styles.title}>{strings.title}</Text>
                <Text style={styles.subtitle}>
                    {screenState === 'idle'
                        ? strings.subtitleIdle
                        : screenState === 'recording'
                        ? strings.subtitleRecording
                        : strings.subtitleProcessing}
                </Text>
            </View>

            {/* Center area — animated rings */}
            <View style={styles.center}>
                {/* Outer soft glow */}
                <Animated.View
                    style={[
                        styles.glow,
                        {
                            opacity: glowOpacity,
                            transform: [{ scale: glowScale }],
                        },
                    ]}
                />
                <Animated.View
                    style={[
                        styles.processingGlow,
                        {
                            opacity: processingBreath.interpolate({
                                inputRange: [-1, 0, 1],
                                outputRange: [0, 0.55, 0.15],
                            }),
                            transform: [{
                                scale: processingBreath.interpolate({
                                    inputRange: [-1, 0, 1],
                                    outputRange: [1, 1, 1.22],
                                }),
                            }],
                        },
                    ]}
                />

                {/* Pink wave ring 1 */}
                <Animated.View
                    style={[
                        styles.pulseRing,
                        {
                            opacity: pulse1Opacity,
                            transform: [{ scale: pulse1 }],
                        },
                    ]}
                />

                {/* Pink wave ring 2 */}
                <Animated.View
                    style={[
                        styles.pulseRing,
                        {
                            opacity: pulse2Opacity,
                            transform: [{ scale: pulse2 }],
                        },
                    ]}
                />

                {/* Inner voice ring — reacts to volume */}
                <Animated.View
                    style={[
                        styles.voiceRing,
                        {
                            opacity: voiceRingOpacity,
                            transform: [{ scale: voiceRingScale }],
                        },
                    ]}
                    pointerEvents="none"
                />

                {/* Main tap target */}
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handlePress}
                    disabled={screenState === 'processing'}
                >
                    <Animated.View
                        style={[
                            styles.circle,
                            screenState === 'recording' && styles.circleRecording,
                            screenState === 'processing' && styles.circleProcessing,
                            { transform: [{ scale: circleScale }] },
                        ]}
                    >
                        <MaterialCommunityIcons
                            name={
                                screenState === 'recording'
                                    ? 'stop'
                                    : screenState === 'processing'
                                    ? 'dots-horizontal'
                                    : 'microphone'
                            }
                            size={48}
                            color={Colors.white}
                        />
                    </Animated.View>
                </TouchableOpacity>
            </View>

            {/* Footer: status / loading copy */}
            <View style={styles.footer}>
                {screenState === 'processing' ? (
                    <Animated.View
                        style={{
                            opacity: loadingMsgOpacity,
                            transform: [{ translateY: loadingMsgTranslateY }],
                        }}
                    >
                        <Text style={styles.loadingMsg}>
                            {strings.loadingMsgs[loadingMsgIndex]}
                        </Text>
                    </Animated.View>
                ) : (
                    <>
                        <Text style={styles.hintMsg}>{circleLabel}</Text>
                        {screenState === 'recording' && (
                            <TouchableOpacity
                                style={styles.retryBtn}
                                activeOpacity={0.7}
                                onPress={async () => {
                                    await cancelRecording()
                                    // Back to idle; user taps the circle to record again
                                }}
                            >
                                <Text style={styles.retryBtnText}>↺  {strings.retryBtn}</Text>
                            </TouchableOpacity>
                        )}
                    </>
                )}
            </View>

            <Modal
                visible={isHelpModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsHelpModalVisible(false)}
            >
                <View style={styles.helpOverlay}>
                    <View style={styles.helpCard}>
                        <Text weight="bold" size="l" style={styles.helpTitle}>{strings.helpTitle}</Text>
                        <Text weight="bold" style={styles.helpSectionTitle}>{strings.helpHowToUseTitle}</Text>
                        <Text style={styles.helpBody}>{strings.helpHowToUseBody}</Text>
                        <Text weight="bold" style={styles.helpSectionTitle}>{strings.helpLimitationsTitle}</Text>
                        <Text style={styles.helpBody}>{strings.helpLimitationsBody}</Text>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.helpCloseBtn}
                            onPress={() => setIsHelpModalVisible(false)}
                        >
                            <Text style={styles.helpCloseBtnText}>{strings.helpCloseBtn}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const CIRCLE_SIZE = 140
const PULSE_SIZE = CIRCLE_SIZE + 40
const GLOW_SIZE = CIRCLE_SIZE + 120

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    header: {
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    helpFab: {
        position: 'absolute',
        left: 12,
        width: 38,
        height: 38,
        borderRadius: 19,
        borderWidth: 1,
        borderColor: Colors.light + '66',
        backgroundColor: Colors.light + '12',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    helpFabText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: '700',
        lineHeight: 22,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.white,
        letterSpacing: 0.4,
    },
    subtitle: {
        marginTop: 6,
        fontSize: 14,
        color: Colors.light,
        opacity: 0.75,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    glow: {
        position: 'absolute',
        width: GLOW_SIZE,
        height: GLOW_SIZE,
        borderRadius: GLOW_SIZE / 2,
        backgroundColor: Colors.accent,
    },
    processingGlow: {
        position: 'absolute',
        width: CIRCLE_SIZE + 96,
        height: CIRCLE_SIZE + 96,
        borderRadius: (CIRCLE_SIZE + 96) / 2,
        backgroundColor: Colors.secondary,
    },
    voiceRing: {
        position: 'absolute',
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        backgroundColor: Colors.accent,
    },
    pulseRing: {
        position: 'absolute',
        width: PULSE_SIZE,
        height: PULSE_SIZE,
        borderRadius: PULSE_SIZE / 2,
        borderWidth: 2,
        borderColor: Colors.accent,
    },
    circle: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        backgroundColor: Colors.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.secondary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 24,
        elevation: 12,
    },
    circleRecording: {
        backgroundColor: Colors.accent,
        shadowColor: Colors.accent,
    },
    circleProcessing: {
        backgroundColor: Colors.primary,
        borderWidth: 2,
        borderColor: Colors.secondary,
        shadowColor: Colors.secondary,
    },
    footer: {
        paddingBottom: 40,
        paddingHorizontal: 32,
        alignItems: 'center',
        minHeight: 80,
        justifyContent: 'center',
    },
    loadingMsg: {
        color: Colors.light,
        fontSize: 15,
        textAlign: 'center',
        fontStyle: 'italic',
        opacity: 0.9,
    },
    hintMsg: {
        color: Colors.light,
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.6,
    },
    retryBtn: {
        marginTop: 16,
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.light + '55',
        backgroundColor: Colors.light + '12',
    },
    retryBtnText: {
        color: Colors.light,
        fontSize: 14,
        opacity: 0.85,
    },
    helpOverlay: {
        flex: 1,
        backgroundColor: Colors.overlay,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    helpCard: {
        width: '100%',
        maxWidth: 420,
        borderRadius: 20,
        padding: 20,
        backgroundColor: '#10123c',
        borderWidth: 1,
        borderColor: Colors.light + '22',
    },
    helpTitle: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 10,
    },
    helpBody: {
        color: Colors.light,
        fontSize: 14,
        lineHeight: 21,
        opacity: 0.9,
    },
    helpSectionTitle: {
        color: Colors.white,
        fontSize: 14,
        marginTop: 12,
        marginBottom: 6,
    },
    helpCloseBtn: {
        marginTop: 18,
        alignSelf: 'flex-end',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 14,
        backgroundColor: Colors.secondary,
    },
    helpCloseBtnText: {
        color: Colors.white,
        fontSize: 14,
        fontWeight: '600',
    },
})
