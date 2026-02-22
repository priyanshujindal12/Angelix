import { View, Text, StyleSheet, Pressable, ScrollView, Alert, ActivityIndicator, Animated, Platform, Modal, Dimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Audio, Video, ResizeMode } from 'expo-av'
import { CameraView, useCameraPermissions } from 'expo-camera'
import * as Location from 'expo-location'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '@clerk/clerk-expo'
import MapView, { Marker } from 'react-native-maps'
const API_URL = 'https://angelix-backend.onrender.com'
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')
const CARD_W = (SCREEN_W - 56) / 2
type Recording = {
  _id: string
  videoUrl: string
  audioUrl: string
  location?: { latitude: number; longitude: number }
  latitude: number
  longitude: number
  startedAt: string
  endedAt: string
  createdAt: string
}

const isRealVideoUrl = (url?: string) => {
  if (!url) return false
  const l = url.toLowerCase()
  return l.includes('/video/') || /\.(mp4|mov|avi|mkv|webm)/.test(l)
}

const pad = (n: number) => String(n).padStart(2, '0')
const fmtDuration = (s: number) => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`
const fmtDate = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function RecordScreen() {
  const { getToken } = useAuth()
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
  const [showRecordings, setShowRecordings] = useState(false)

  const [playingId, setPlayingId] = useState<string | null>(null)
  const soundRef = useRef<Audio.Sound | null>(null)

  const [videoModalVisible, setVideoModalVisible] = useState(false)
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null)
  const videoPlayerRef = useRef<Video | null>(null)

  const pulseAnim = useRef(new Animated.Value(1)).current
  const glowAnim = useRef(new Animated.Value(0)).current

  /* ── Permissions ── */
  useEffect(() => {
    ; (async () => {
      const { granted } = await Audio.requestPermissionsAsync()
      setHasMicPermission(granted)
      await requestCameraPermission()
      await Location.requestForegroundPermissionsAsync()
    })()
  }, [])

  /* ── Fetch recordings ── */
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

  useEffect(() => { fetchRecordings() }, [fetchRecordings])
  useEffect(() => {
    if (isRecording) {
      const loop = Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 700, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: false }),
      ]))
      const glow = Animated.loop(Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 700, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 700, useNativeDriver: false }),
      ]))
      loop.start(); glow.start()
      return () => { loop.stop(); glow.stop() }
    } else {
      pulseAnim.setValue(1); glowAnim.setValue(0)
    }
  }, [isRecording])

  /* ── Start recording ── */
  const startRecording = async () => {
    if (!hasMicPermission) {
      Alert.alert('Permission Required', 'Microphone permission is needed.')
      return
    }
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true })
      const recording = new Audio.Recording()
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY)
      await recording.startAsync()
      audioRecordingRef.current = recording

      if (Platform.OS !== 'web' && cameraPermission?.granted && cameraReady && cameraRef.current) {
        try {
          videoPromiseRef.current = cameraRef.current.recordAsync({ maxDuration: 600 })
        } catch (e) { console.log('Video recording failed:', e) }
      }

      startTimeRef.current = new Date()
      setElapsedSecs(0)
      setIsRecording(true)
      timerRef.current = setInterval(() => setElapsedSecs(p => p + 1), 1000)
    } catch (err) {
      console.error('Start recording error:', err)
      Alert.alert('Error', 'Could not start recording.')
    }
  }

  /* ── Stop recording & upload ── */
  const stopRecording = async () => {
    setIsRecording(false)
    setIsUploading(true)
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }

    const endedAt = new Date()
    try {
      let audioUri: string | null = null
      if (audioRecordingRef.current) {
        await audioRecordingRef.current.stopAndUnloadAsync()
        audioUri = audioRecordingRef.current.getURI()
        audioRecordingRef.current = null
      }

      let videoUri: string | null = null
      if (videoPromiseRef.current) {
        try {
          cameraRef.current?.stopRecording()
          const videoData = await videoPromiseRef.current
          videoUri = videoData?.uri
          videoPromiseRef.current = null
        } catch (e) { console.log('Video capture failed:', e) }
      }

      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true, shouldDuckAndroid: true, staysActiveInBackground: true })

      if (!audioUri) { Alert.alert('Error', 'No audio was recorded.'); return }

      let latitude = 0, longitude = 0
      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
        latitude = loc.coords.latitude
        longitude = loc.coords.longitude
      } catch { }

      const formData = new FormData()
      formData.append('audio', { uri: audioUri, name: 'audio.m4a', type: 'audio/m4a' } as any)
      if (videoUri) {
        formData.append('video', { uri: videoUri, name: 'video.mp4', type: 'video/mp4' } as any)
      }
      formData.append('latitude', String(latitude))
      formData.append('longitude', String(longitude))
      formData.append('startedAt', startTimeRef.current?.toISOString() ?? endedAt.toISOString())
      formData.append('endedAt', endedAt.toISOString())

      const token = await getToken()
      const res = await fetch(`${API_URL}/api/recordings/create`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Upload failed')

      setElapsedSecs(0)
      await fetchRecordings()
      Alert.alert('✅ Saved', 'Recording uploaded successfully.')
    } catch (err: any) {
      console.error('Upload error:', err)
      Alert.alert('Upload Failed', err.message || 'Could not upload recording.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRecord = () => { isRecording ? stopRecording() : startRecording() }

  /* ── Audio playback ── */
  const handlePlay = async (rec: Recording) => {
    try {
      if (soundRef.current) { await soundRef.current.stopAsync(); await soundRef.current.unloadAsync(); soundRef.current = null }
      if (playingId === rec._id) { setPlayingId(null); return }
      const { sound } = await Audio.Sound.createAsync({ uri: rec.audioUrl })
      soundRef.current = sound
      setPlayingId(rec._id)
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) { setPlayingId(null); sound.unloadAsync(); soundRef.current = null }
      })
      await sound.playAsync()
    } catch (err) {
      console.error('Playback error:', err)
      Alert.alert('Playback Error', 'Could not play recording.')
    }
  }

  /* ── Video playback ── */
  const handlePlayVideo = (rec: Recording) => {
    if (!isRealVideoUrl(rec.videoUrl)) { Alert.alert('No Video', 'This recording has no video.'); return }
    setSelectedVideoUrl(rec.videoUrl)
    setVideoModalVisible(true)
  }
  const closeVideoModal = async () => {
    if (videoPlayerRef.current) { try { await videoPlayerRef.current.stopAsync() } catch { } }
    setVideoModalVisible(false)
    setSelectedVideoUrl(null)
  }

  useEffect(() => {
    return () => {
      if (soundRef.current) soundRef.current.unloadAsync()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const animatedShadowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] })

  /* ══════════════ RENDER ══════════════ */
  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Hidden Camera */}
        {cameraPermission?.granted && (
          <View style={s.hiddenCam}>
            <CameraView ref={cameraRef as any} style={{ width: 1, height: 1 }} facing="back" mode="video" onCameraReady={() => setCameraReady(true)} />
          </View>
        )}

        {/* Header */}
        <Text style={s.title}>Evidence Recorder</Text>

        {/* Record Button */}
        <View style={s.recSection}>
          <Animated.View style={[s.recOuter, isRecording && s.recOuterActive, { transform: [{ scale: pulseAnim }], shadowOpacity: isRecording ? (animatedShadowOpacity as any) : 0.2 }]}>
            <Pressable onPress={handleRecord} disabled={isUploading} style={s.recInner}>
              <LinearGradient colors={isRecording ? ['#EF4444', '#DC2626'] : ['#9333EA', '#7E22CE']} style={s.recGrad}>
                <Ionicons name={isRecording ? 'stop' : 'radio'} size={40} color="#fff" />
              </LinearGradient>
            </Pressable>
          </Animated.View>

          <Text style={[s.timer, isRecording && s.timerActive]}>{fmtDuration(elapsedSecs)}</Text>

          {isRecording && (
            <View style={s.liveRow}>
              <View style={s.liveDot} />
              <Text style={s.liveText}>Recording…</Text>
            </View>
          )}

          {isUploading && (
            <View style={s.uploadRow}>
              <ActivityIndicator size="small" color="#9333EA" />
              <Text style={s.uploadText}>Uploading…</Text>
            </View>
          )}
        </View>

        {/* Previous Recordings Toggle */}
        <Pressable style={s.toggleBtn} onPress={() => setShowRecordings(!showRecordings)}>
          <Ionicons name={showRecordings ? 'chevron-up' : 'folder-open-outline'} size={18} color="#7E22CE" />
          <Text style={s.toggleText}>{showRecordings ? 'Hide Recordings' : 'Previous Recordings'}</Text>
          {recordings.length > 0 && <View style={s.badge}><Text style={s.badgeText}>{recordings.length}</Text></View>}
        </Pressable>

        {/* Recordings Grid */}
        {showRecordings && (
          <View style={s.gridSection}>
            {loadingRecordings ? (
              <View style={s.loadWrap}>
                <ActivityIndicator size="large" color="#9333EA" />
              </View>
            ) : recordings.length === 0 ? (
              <View style={s.emptyWrap}>
                <Ionicons name="folder-open-outline" size={36} color="#C4B5FD" />
                <Text style={s.emptyText}>No recordings yet</Text>
              </View>
            ) : (
              <View style={s.grid}>
                {recordings.map((rec) => {
                  const isPlaying = playingId === rec._id
                  const hasVideo = isRealVideoUrl(rec.videoUrl)
                  const duration = rec.startedAt && rec.endedAt
                    ? Math.round((new Date(rec.endedAt).getTime() - new Date(rec.startedAt).getTime()) / 1000)
                    : 0
                  const lat = rec.location?.latitude ?? rec.latitude ?? 0
                  const lng = rec.location?.longitude ?? rec.longitude ?? 0
                  const hasLocation = lat !== 0 && lng !== 0

                  return (
                    <View key={rec._id} style={s.card}>
                      {/* Mini Map */}
                      {hasLocation ? (
                        <View style={s.mapWrap}>
                          <MapView
                            style={s.miniMap}
                            scrollEnabled={false}
                            zoomEnabled={false}
                            rotateEnabled={false}
                            pitchEnabled={false}
                            liteMode={Platform.OS === 'android'}
                            mapType="standard"
                            initialRegion={{ latitude: lat, longitude: lng, latitudeDelta: 0.005, longitudeDelta: 0.005 }}
                          >
                            <Marker coordinate={{ latitude: lat, longitude: lng }}>
                              <View style={s.markerDot} />
                            </Marker>
                          </MapView>
                        </View>
                      ) : (
                        <View style={[s.mapWrap, s.noMapWrap]}>
                          <Ionicons name="location-outline" size={20} color="#CBD5E1" />
                          <Text style={s.noMapText}>No location</Text>
                        </View>
                      )}

                      {/* Date + Duration */}
                      <Text style={s.cardDate} numberOfLines={1}>{fmtDate(rec.createdAt)}</Text>
                      <Text style={s.cardDur}>{fmtDuration(duration)}</Text>

                      {/* Action row: Audio + Video */}
                      <View style={s.actRow}>
                        <Pressable onPress={() => handlePlay(rec)} style={[s.actBtn, isPlaying && s.actBtnActive]}>
                          <Ionicons name={isPlaying ? 'pause' : 'play'} size={16} color={isPlaying ? '#fff' : '#9333EA'} />
                          <Text style={[s.actLabel, isPlaying && s.actLabelActive]}>Audio</Text>
                        </Pressable>

                        {hasVideo && (
                          <Pressable onPress={() => handlePlayVideo(rec)} style={s.actBtn}>
                            <Ionicons name="videocam" size={16} color="#9333EA" />
                            <Text style={s.actLabel}>Video</Text>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  )
                })}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Video Modal */}
      <Modal visible={videoModalVisible} animationType="slide" presentationStyle="fullScreen" onRequestClose={closeVideoModal}>
        <View style={s.modalBg}>
          <View style={s.modalHeader}>
            <Pressable onPress={closeVideoModal} style={s.modalClose}>
              <Ionicons name="close" size={26} color="#fff" />
            </Pressable>
            <Text style={s.modalTitle}>Video Playback</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={s.modalBody}>
            {selectedVideoUrl ? (
              <Video
                ref={videoPlayerRef}
                source={{ uri: selectedVideoUrl }}
                style={s.videoPlayer}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay
                isLooping={false}
                onError={(e) => { console.error('Video error:', e); Alert.alert('Error', 'Could not play video.') }}
              />
            ) : (
              <ActivityIndicator size="large" color="#9333EA" />
            )}
          </View>
        </View>
      </Modal>
    </View>
  )
}

/* ══════════════ STYLES ══════════════ */
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  scroll: { padding: 20, paddingTop: Platform.OS === 'ios' ? 60 : 24, paddingBottom: 40 },

  hiddenCam: { width: 1, height: 1, overflow: 'hidden', position: 'absolute', opacity: 0 },

  title: { fontSize: 24, fontWeight: '700', color: '#1E293B', textAlign: 'center', marginBottom: 4 },
  recSection: { alignItems: 'center', marginVertical: 28 },
  recOuter: { width: 120, height: 120, borderRadius: 60, shadowColor: '#9333EA', shadowOffset: { width: 0, height: 4 }, shadowRadius: 14, elevation: 10 },
  recOuterActive: { shadowColor: '#EF4444' },
  recInner: { width: '100%', height: '100%', borderRadius: 60, overflow: 'hidden' },
  recGrad: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  timer: { fontSize: 36, fontWeight: '700', color: '#1E293B', marginTop: 14, fontVariant: ['tabular-nums'] as any },
  timerActive: { color: '#EF4444' },
  liveRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  liveText: { fontSize: 14, color: '#EF4444', fontWeight: '600' },
  uploadRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 8, backgroundColor: '#F5F3FF', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 },
  uploadText: { fontSize: 13, color: '#7E22CE', fontWeight: '600' },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#F5F3FF', paddingVertical: 12, borderRadius: 12, marginBottom: 16 },
  toggleText: { fontSize: 15, fontWeight: '600', color: '#7E22CE' },
  badge: { backgroundColor: '#9333EA', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },

  gridSection: { marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  loadWrap: { alignItems: 'center', padding: 40 },
  emptyWrap: { alignItems: 'center', padding: 32, gap: 8 },
  emptyText: { fontSize: 14, color: '#94A3B8' },
  card: { width: CARD_W, backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#F1F5F9' },
  mapWrap: { width: '100%', height: 100, backgroundColor: '#F1F5F9' },
  miniMap: { width: '100%', height: '100%' },
  noMapWrap: { justifyContent: 'center', alignItems: 'center', gap: 4 },
  noMapText: { fontSize: 11, color: '#CBD5E1' },
  markerDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#9333EA', borderWidth: 2, borderColor: '#fff' },
  cardDate: { fontSize: 12, fontWeight: '600', color: '#334155', marginTop: 8, marginHorizontal: 10 },
  cardDur: { fontSize: 11, color: '#94A3B8', marginHorizontal: 10, marginTop: 2 },
  actRow: { flexDirection: 'row', gap: 6, padding: 10, paddingTop: 8 },
  actBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F5F3FF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  actBtnActive: { backgroundColor: '#9333EA' },
  actLabel: { fontSize: 11, fontWeight: '600', color: '#7E22CE' },
  actLabelActive: { color: '#fff' },
  modalBg: { flex: 1, backgroundColor: '#000' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 56 : 16, paddingHorizontal: 16, paddingBottom: 10 },
  modalClose: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  modalBody: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  videoPlayer: { width: SCREEN_W, height: SCREEN_H * 0.7 },
})
