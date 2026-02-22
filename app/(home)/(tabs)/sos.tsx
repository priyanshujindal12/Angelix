import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useEffect, useRef, useState } from 'react'
import * as Location from 'expo-location'
import { useAuth } from '@clerk/clerk-expo'

const API_URL = 'https://angelix-backend.onrender.com'

export default function SOSScreen() {
  const { getToken } = useAuth()

  const [isSOSActive, setIsSOSActive] = useState(false)
  const [loading, setLoading] = useState(false)

  const locationWatcherRef = useRef<Location.LocationSubscription | null>(null)

  /* ───────────────── PERMISSIONS ───────────────── */
  useEffect(() => {
    Location.requestForegroundPermissionsAsync()
  }, [])

  /* ───────────────── LIVE TRACKING ───────────────── */
  const startLiveTracking = async () => {
    locationWatcherRef.current =
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 15000,
          distanceInterval: 10,
        },
        async (location) => {
          try {
            const token = await getToken()

            await fetch(`${API_URL}/api/sos/update-location`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }),
            })
          } catch {
            console.log('Live tracking failed')
          }
        }
      )
  }

  const stopLiveTracking = () => {
    locationWatcherRef.current?.remove()
    locationWatcherRef.current = null
  }

  /* ───────────────── START SOS ───────────────── */
  const startSOS = async () => {
    try {
      setLoading(true)

      const token = await getToken()

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      })

      const res = await fetch(`${API_URL}/api/sos/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message)

      setIsSOSActive(true)

      await startLiveTracking()

      Alert.alert('🚨 SOS Activated', 'Emergency contacts notified.')
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to start SOS')
    } finally {
      setLoading(false)
    }
  }

  /* ───────────────── STOP SOS ───────────────── */
  const stopSOS = async () => {
    try {
      setLoading(true)

      const token = await getToken()

      const res = await fetch(`${API_URL}/api/sos/stop`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message)

      stopLiveTracking()
      setIsSOSActive(false)

      Alert.alert('✅ SOS Stopped', 'You are marked safe.')
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to stop SOS')
    } finally {
      setLoading(false)
    }
  }

  /* ───────────────── BUTTON HANDLER ───────────────── */
  const handleEmergencySOS = () => {
    if (loading) return

    if (isSOSActive) {
      Alert.alert(
        'Stop SOS?',
        'Are you safe now?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Stop SOS', onPress: stopSOS },
        ]
      )
    } else {
      Alert.alert(
        '🚨 Emergency SOS',
        'This will alert contacts and share your live location.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Send SOS', style: 'destructive', onPress: startSOS },
        ]
      )
    }
  }

  /* ───────────────── UI ───────────────── */
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Emergency SOS</Text>
          <Text style={styles.subtitle}>
            Quick access in dangerous situations
          </Text>
        </View>

        {/* SOS BUTTON */}
        <View style={styles.sosContainer}>
          <Pressable onPress={handleEmergencySOS} disabled={loading}>
            <LinearGradient
              colors={
                isSOSActive
                  ? ['#10B981', '#059669']
                  : ['#EF4444', '#DC2626', '#B91C1C']
              }
              style={styles.sosButton}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="large" />
              ) : (
                <>
                  <Ionicons name="warning" size={80} color="#fff" />
                  <Text style={styles.sosText}>
                    {isSOSActive ? 'STOP' : 'SOS'}
                  </Text>
                  <Text style={styles.sosSubtext}>
                    {isSOSActive ? 'Tap to end alert' : 'Tap to alert'}
                  </Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </View>

        {/* INFO SECTION */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>
            What happens when you tap SOS?
          </Text>

          <InfoItem
            icon="location"
            title="Live Location Sharing"
            text="Your real-time location is continuously shared."
          />

          <InfoItem
            icon="people"
            title="Alert Contacts"
            text="Emergency contacts receive repeated alerts."
          />

          <InfoItem
            icon="videocam"
            title="Evidence Shared"
            text="Your latest recording is attached automatically."
          />
        </View>
      </ScrollView>
    </View>
  )
}

/* ───────────────── SMALL COMPONENT ───────────────── */
const InfoItem = ({ icon, title, text }: any) => (
  <View style={styles.infoItem}>
    <View style={styles.iconCircle}>
      <Ionicons name={icon} size={24} color="#9333EA" />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.infoItemTitle}>{title}</Text>
      <Text style={styles.infoItemText}>{text}</Text>
    </View>
  </View>
)

/* ───────────────── STYLES ───────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEFEFE' },
  content: { padding: 24 },

  header: { alignItems: 'center', marginTop: 20, marginBottom: 32 },

  title: { fontSize: 32, fontWeight: '700', color: '#1E293B' },

  subtitle: { fontSize: 16, color: '#64748B', marginTop: 8 },

  sosContainer: { alignItems: 'center', marginVertical: 32 },

  sosButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
  },

  sosText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    marginTop: 8,
  },

  sosSubtext: { fontSize: 14, color: '#fff', opacity: 0.9 },

  infoSection: { marginTop: 24 },

  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },

  infoItem: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },

  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  infoItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },

  infoItemText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
})
