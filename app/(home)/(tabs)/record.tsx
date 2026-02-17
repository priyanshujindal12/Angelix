import {View,Text,StyleSheet,Pressable,ScrollView,Alert,ActivityIndicator,Animated,Platform,} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Audio } from 'expo-av'
import { CameraView, useCameraPermissions } from 'expo-camera'
import * as Location from 'expo-location'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '@clerk/clerk-expo'
const API_URL = 'https://angelix-backend.onrender.com'
type Recording = {
    _id: string
    videoUrl: string
    audioUrl: string
    location?: { latitude: number; longitude: number }
    startedAt: string
    endedAt: string
    createdAt: string
}

/* ─────────── helpers ─────────── */
const pad = (n: number) => String(n).padStart(2, '0')
const fmtDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${pad(m)}:${pad(s)}`
}
const fmtDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export default function RecordScreen() {
    const { getToken } = useAuth();
    const videoPromiseRef = useRef<Promise<any> | null>(null)
    const [cameraPermission, requestCameraPermission] = useCameraPermissions()
    const [hasMicPermission, setHasMicPermission] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [elapsedSecs, setElapsedSecs] = useState(0)
    const [isUploading, setIsUploading] = useState(false)
    const audioRecordingRef = useRef<Audio.Recording | null>(null)
    const cameraRef = useRef<CameraView | null>(null)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const startTimeRef = useRef<Date | null>(null)
    const [recordings, setRecordings] = useState<Recording[]>([])
    const [loadingRecordings, setLoadingRecordings] = useState(true)
   const [cameraReady, setCameraReady] = useState(false)

    /* ── playback ── */
    const [playingId, setPlayingId] = useState<string | null>(null)
    const soundRef = useRef<Audio.Sound | null>(null)

    /* ── animation ── */
    const pulseAnim = useRef(new Animated.Value(1)).current
    const glowAnim = useRef(new Animated.Value(0)).current

    /* ─────────── PERMISSIONS ─────────── */
    useEffect(() => {
        ; (async () => {
            const { granted } = await Audio.requestPermissionsAsync()
            setHasMicPermission(granted)
            await requestCameraPermission()
            await Location.requestForegroundPermissionsAsync()
        })()
    }, [])

    /* ─────────── FETCH RECORDINGS ─────────── */
    const fetchRecordings = useCallback(async () => {
        try {
            const token = await getToken()
            const res = await fetch(`${API_URL}/api/recordings/my`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            if (data.success) setRecordings(data.recordings ?? [])
        } catch (e) {
            console.error('Fetch recordings error:', e)
        } finally {
            setLoadingRecordings(false)
        }
    }, [getToken])

    useEffect(() => {
        fetchRecordings()
    }, [fetchRecordings])
    useEffect(() => {
        if (isRecording) {
            const loop = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.15,
                        duration: 800,
                        useNativeDriver: false,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: false,
                    }),
                ])
            )
            const glowLoop = Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: false,
                    }),
                    Animated.timing(glowAnim, {
                        toValue: 0,
                        duration: 800,
                        useNativeDriver: false,
                    }),
                ])
            )
            loop.start()
            glowLoop.start()
            return () => {
                loop.stop()
                glowLoop.stop()
            }
        } else {
            pulseAnim.setValue(1)
            glowAnim.setValue(0)
        }
    }, [isRecording])

    /* ─────────── START RECORDING ─────────── */
    const startRecording = async () => {
        if (!hasMicPermission) {
            Alert.alert('Permission Required', 'Microphone permission is needed to record audio.')
            return
        }

        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            })

            const recording = new Audio.Recording()
            await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY)
            await recording.startAsync()
            audioRecordingRef.current = recording
// start video recording (DO NOT await)
if (
  Platform.OS !== 'web' &&
  cameraPermission?.granted &&
  cameraReady &&
  cameraRef.current
) {
  try {
    videoPromiseRef.current =
      cameraRef.current.recordAsync({
        maxDuration: 600,
      })
  } catch (e) {
    console.log('Video recording failed:', e)
  }
}


            startTimeRef.current = new Date()
            setElapsedSecs(0)
            setIsRecording(true)

            timerRef.current = setInterval(() => {
                setElapsedSecs((prev) => prev + 1)
            }, 1000)
        } catch (err) {
            console.error('Start recording error:', err)
            Alert.alert('Error', 'Could not start recording. Please try again.')
        }
    }

    /* ─────────── STOP RECORDING & UPLOAD ─────────── */
    const stopRecording = async () => {
        setIsRecording(false)
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }

        const endedAt = new Date()

        try {
            // Stop audio
            let audioUri: string | null = null
            if (audioRecordingRef.current) {
                await audioRecordingRef.current.stopAndUnloadAsync()
                audioUri = audioRecordingRef.current.getURI()
                audioRecordingRef.current = null
            }

            // Stop video
          // start video recording (real device only)
// Stop video and get URI
let videoUri: string | null = null

if (videoPromiseRef.current) {
  try {
    cameraRef.current?.stopRecording()

    const videoData = await videoPromiseRef.current
    videoUri = videoData?.uri

    videoPromiseRef.current = null
  } catch (e) {
    console.log('Video capture failed:', e)
  }
}



            await Audio.setAudioModeAsync({ allowsRecordingIOS: false,playsInSilentModeIOS: true,
  shouldDuckAndroid: true,
  staysActiveInBackground: true, })

            if (!audioUri) {
                Alert.alert('Error', 'No audio was recorded.')
                return
            }

            // Get location
            let latitude = 0
            let longitude = 0
            try {
                const loc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                })
                latitude = loc.coords.latitude
                longitude = loc.coords.longitude
            } catch { }

            // ── UPLOAD ──
            setIsUploading(true)

            const formData = new FormData()
            formData.append('audio', {
                uri: audioUri,
                name: 'audio.m4a',
                type: 'audio/m4a',
            } as any)

            if (videoUri) {
                formData.append('video', {
                    uri: videoUri,
                    name: 'video.mp4',
                    type: 'video/mp4',
                } as any)
            } else {
                // backend requires video — send audio as video placeholder
                formData.append('video', {
                    uri: audioUri,
                    name: 'video.m4a',
                    type: 'audio/m4a',
                } as any)
            }

            formData.append('latitude', String(latitude))
            formData.append('longitude', String(longitude))
            formData.append('startedAt', startTimeRef.current?.toISOString() ?? endedAt.toISOString())
            formData.append('endedAt', endedAt.toISOString())

            const token = await getToken()
            const res = await fetch(`${API_URL}/api/recordings/create`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    // Don't set Content-Type — fetch sets it with boundary for FormData
                },
                body: formData,
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Upload failed')
            }

            setElapsedSecs(0)
            await fetchRecordings()
            Alert.alert('✅ Saved', 'Your recording has been uploaded securely.')
        } catch (err: any) {
            console.error('Upload error:', err)
            Alert.alert('Upload Failed', err.message || 'Could not upload recording. Please try again.')
        } finally {
            setIsUploading(false)
        }
    }

    /* ─────────── TOGGLE ─────────── */
    const handleRecord = () => {
        if (isRecording) {
            stopRecording()
        } else {
            startRecording()
        }
    }

    /* ─────────── PLAYBACK ─────────── */
    const handlePlay = async (rec: Recording) => {
        try {
            // Stop any existing playback
            if (soundRef.current) {
                await soundRef.current.stopAsync()
                await soundRef.current.unloadAsync()
                soundRef.current = null
            }

            if (playingId === rec._id) {
                setPlayingId(null)
                return
            }

            const { sound } = await Audio.Sound.createAsync({ uri: rec.audioUrl })
            soundRef.current = sound
            setPlayingId(rec._id)

            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    setPlayingId(null)
                    sound.unloadAsync()
                    soundRef.current = null
                }
            })

            await sound.playAsync()
        } catch (err) {
            console.error('Playback error:', err)
            Alert.alert('Playback Error', 'Could not play recording.')
        }
    }

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync()
            }
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [])

    /* ─────────── ANIMATED GLOW ─────────── */
    const animatedShadowOpacity = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    })

    /* ═══════════════════════════════════════════════════════ */
    /*                        RENDER                          */
    /* ═══════════════════════════════════════════════════════ */
    return (
        <LinearGradient colors={['#FEFEFE', '#F5F3FF', '#FEFEFE']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* ── HEADER ── */}
                <View style={styles.header}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="mic" size={48} color="#9333EA" />
                    </View>
                    <Text style={styles.title}>Evidence Recorder</Text>
                    <Text style={styles.subtitle}>
                        Record audio & video evidence discreetly for your safety
                    </Text>
                </View>

                {/* ── HIDDEN CAMERA (1×1 pixel, off-screen) ── */}
                {cameraPermission?.granted && (
                    <View style={styles.hiddenCamera}>
                        <CameraView
  ref={cameraRef as any}
  style={{ width: 1, height: 1 }}
  facing="back"
  mode="video"
  onCameraReady={() => setCameraReady(true)}
/>

                    </View>
                )}

                {/* ── RECORD BUTTON ── */}
                <View style={styles.recordSection}>
                    <Animated.View
                        style={[
                            styles.recordButtonOuter,
                            isRecording && styles.recordButtonOuterActive,
                            {
                                transform: [{ scale: pulseAnim }],
                                shadowOpacity: isRecording ? (animatedShadowOpacity as any) : 0.3,
                            },
                        ]}
                    >
                        <Pressable onPress={handleRecord} disabled={isUploading} style={styles.recordButtonInner}>
                            <LinearGradient
                                colors={isRecording ? ['#EF4444', '#DC2626'] : ['#9333EA', '#7E22CE']}
                                style={styles.recordGradient}
                            >
                                <Ionicons
                                    name={isRecording ? 'stop' : 'mic'}
                                    size={44}
                                    color="#fff"
                                />
                            </LinearGradient>
                        </Pressable>
                    </Animated.View>

                    {/* Timer */}
                    <Text style={[styles.timer, isRecording && styles.timerActive]}>
                        {fmtDuration(elapsedSecs)}
                    </Text>

                    {/* Recording indicator */}
                    {isRecording && (
                        <View style={styles.recordingIndicator}>
                            <View style={styles.recordingDot} />
                            <Text style={styles.recordingText}>Recording…</Text>
                        </View>
                    )}

                    {/* Upload indicator */}
                    {isUploading && (
                        <View style={styles.uploadingContainer}>
                            <ActivityIndicator size="small" color="#9333EA" />
                            <Text style={styles.uploadingText}>Uploading securely…</Text>
                        </View>
                    )}

                    {/* Tap instruction */}
                    {!isRecording && !isUploading && (
                        <Text style={styles.tapHint}>Tap to start recording</Text>
                    )}
                </View>

                {/* ── INFO CARD ── */}
                <View style={styles.infoCard}>
                    <View style={styles.infoIconCircle}>
                        <Ionicons name="shield-checkmark" size={24} color="#9333EA" />
                    </View>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoTitle}>Secure & Private</Text>
                        <Text style={styles.infoText}>
                            Recordings are encrypted and stored in the cloud. They can be shared with emergency contacts or authorities if needed.
                        </Text>
                    </View>
                </View>

                {/* ── FEATURES CHIPS ── */}
                <View style={styles.featuresRow}>
                    <View style={styles.featureChip}>
                        <Ionicons name="mic-outline" size={16} color="#9333EA" />
                        <Text style={styles.featureChipText}>Audio</Text>
                    </View>
                    <View style={styles.featureChip}>
                        <Ionicons name="videocam-outline" size={16} color="#9333EA" />
                        <Text style={styles.featureChipText}>Video</Text>
                    </View>
                    <View style={styles.featureChip}>
                        <Ionicons name="location-outline" size={16} color="#9333EA" />
                        <Text style={styles.featureChipText}>Location</Text>
                    </View>
                    <View style={styles.featureChip}>
                        <Ionicons name="cloud-upload-outline" size={16} color="#9333EA" />
                        <Text style={styles.featureChipText}>Cloud</Text>
                    </View>
                </View>

                {/* ── RECORDINGS LIST ── */}
                <View style={styles.recordingsList}>
                    <Text style={styles.listTitle}>Recent Recordings</Text>

                    {loadingRecordings ? (
                        <View style={styles.loadingState}>
                            <ActivityIndicator size="large" color="#9333EA" />
                            <Text style={styles.loadingText}>Loading recordings…</Text>
                        </View>
                    ) : recordings.length === 0 ? (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconCircle}>
                                <Ionicons name="folder-open-outline" size={40} color="#C4B5FD" />
                            </View>
                            <Text style={styles.emptyTitle}>No recordings yet</Text>
                            <Text style={styles.emptyText}>
                                Your recordings will appear here after you record
                            </Text>
                        </View>
                    ) : (
                        recordings.map((rec) => {
                            const isPlaying = playingId === rec._id
                            const duration =
                                rec.startedAt && rec.endedAt
                                    ? Math.round(
                                        (new Date(rec.endedAt).getTime() - new Date(rec.startedAt).getTime()) / 1000
                                    )
                                    : 0

                            return (
                                <Pressable
                                    key={rec._id}
                                    style={[styles.recordingCard, isPlaying && styles.recordingCardPlaying]}
                                    onPress={() => handlePlay(rec)}
                                >
                                    <View style={[styles.playIconCircle, isPlaying && styles.playIconCircleActive]}>
                                        <Ionicons
                                            name={isPlaying ? 'pause' : 'play'}
                                            size={22}
                                            color={isPlaying ? '#fff' : '#9333EA'}
                                        />
                                    </View>
                                    <View style={styles.recordingInfo}>
                                        <Text style={styles.recordingDate}>{fmtDate(rec.createdAt)}</Text>
                                        <View style={styles.recordingMeta}>
                                            <Ionicons name="time-outline" size={13} color="#94A3B8" />
                                            <Text style={styles.recordingMetaText}>{fmtDuration(duration)}</Text>
                                            {rec.location?.latitude ? (
                                                <>
                                                    <Ionicons
                                                        name="location-outline"
                                                        size={13}
                                                        color="#94A3B8"
                                                        style={{ marginLeft: 8 }}
                                                    />
                                                    <Text style={styles.recordingMetaText}>
                                                        {rec.location.latitude.toFixed(3)}, {rec.location.longitude.toFixed(3)}
                                                    </Text>
                                                </>
                                            ) : null}
                                        </View>
                                    </View>
                                    <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                                </Pressable>
                            )
                        })
                    )}
                </View>
            </ScrollView>
        </LinearGradient>
    )
}

/* ═══════════════════════════════════════════════════════ */
/*                       STYLES                           */
/* ═══════════════════════════════════════════════════════ */
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 24,
        paddingBottom: 40,
    },

    /* Header */
    header: {
        alignItems: 'center',
        marginBottom: 8,
        marginTop: 20,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F5F3FF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#9333EA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1E293B',
        marginTop: 16,
    },
    subtitle: {
        fontSize: 15,
        color: '#64748B',
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 8,
    },

    /* Hidden camera */
    hiddenCamera: {
        width: 1,
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        opacity: 0,
    },

    /* Record Section */
    recordSection: {
        alignItems: 'center',
        marginVertical: 32,
    },
    recordButtonOuter: {
        width: 140,
        height: 140,
        borderRadius: 70,
        shadowColor: '#9333EA',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
    },
    recordButtonOuterActive: {
        shadowColor: '#EF4444',
    },
    recordButtonInner: {
        width: '100%',
        height: '100%',
        borderRadius: 70,
        overflow: 'hidden',
    },
    recordGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    timer: {
        fontSize: 40,
        fontWeight: '700',
        color: '#1E293B',
        marginTop: 20,
        fontVariant: ['tabular-nums'],
    },
    timerActive: {
        color: '#EF4444',
    },
    recordingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 8,
    },
    recordingDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#EF4444',
    },
    recordingText: {
        fontSize: 16,
        color: '#EF4444',
        fontWeight: '600',
    },
    uploadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 8,
        backgroundColor: '#F5F3FF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    uploadingText: {
        fontSize: 14,
        color: '#7E22CE',
        fontWeight: '600',
    },
    tapHint: {
        fontSize: 14,
        color: '#94A3B8',
        marginTop: 12,
    },

    /* Info Card */
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#F5F3FF',
        padding: 20,
        borderRadius: 16,
        gap: 14,
        marginBottom: 16,
    },
    infoIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#EDE9FE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContent: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 13,
        color: '#64748B',
        lineHeight: 19,
    },

    /* Feature Chips */
    featuresRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 28,
        flexWrap: 'wrap',
    },
    featureChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#fff',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    featureChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#7E22CE',
    },

    /* Recordings List */
    recordingsList: {
        marginTop: 4,
    },
    listTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 16,
    },

    /* Loading */
    loadingState: {
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 15,
        color: '#64748B',
    },

    /* Empty */
    emptyState: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    emptyIconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#F5F3FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    emptyTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 4,
    },
    emptyText: {
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'center',
    },

    /* Recording Card */
    recordingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    recordingCardPlaying: {
        borderColor: '#9333EA',
        backgroundColor: '#FDFBFF',
    },
    playIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F5F3FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    playIconCircleActive: {
        backgroundColor: '#9333EA',
    },
    recordingInfo: {
        flex: 1,
    },
    recordingDate: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 4,
    },
    recordingMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    recordingMetaText: {
        fontSize: 12,
        color: '#94A3B8',
    },
})
