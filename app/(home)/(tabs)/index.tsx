import { updateUserLocation } from '@/lib/updateLocation'
import { SignedIn, useAuth, useUser } from '@clerk/clerk-expo'
import polyline from '@mapbox/polyline'
import { LinearGradient } from 'expo-linear-gradient'
import * as Location from 'expo-location'
import { useEffect, useRef, useState } from 'react'
import { useNavigation } from 'expo-router'

import {ActivityIndicator,
  Animated,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

let MapView: any = View
let Marker: any = View
let Polyline: any = View
try {
  const maps = require('react-native-maps')
  MapView = maps.default
  Marker = maps.Marker
  Polyline = maps.Polyline
} catch (e) {
  console.warn('react-native-maps failed to load:', e)
}
type TripState = 'idle' | 'loading' | 'route_shown' | 'active' | 'stopped'
export default function Home() {
  const navigation = useNavigation<any>();
  const { user } = useUser()
  const { getToken } = useAuth()
  const mapRef = useRef<typeof MapView | null>(null)
  const [destination, setDestination] = useState('')
  const [routeCoords, setRouteCoords] = useState<any[]>([])
  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null)

  const [routeInfo, setRouteInfo] = useState<{
    distance?: string
    duration?: string
    durationValue?: number // in seconds
  } | null>(null)

  const [tripState, setTripState] = useState<TripState>('idle')
  const [timeRemaining, setTimeRemaining] = useState(0) // in seconds
  const [startLocation, setStartLocation] =
    useState<Location.LocationObjectCoords | null>(null)
  const [mapError, setMapError] = useState(false)
  const [locationLoading, setLocationLoading] = useState(true)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current

  const avatarUri =
    user?.imageUrl ||
    'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
  const fetchRoute = async () => {
    if (!location || !destination) return

    setTripState('loading')

    try {
      const origin = `${location.latitude},${location.longitude}`

      const res = await fetch(
        'https://angelix-backend.onrender.com/api/maps/route',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ origin, destination }),
        }
      )

      const data = await res.json()

      if (!data.polyline) {
        setTripState('idle')
        return
      }

      const decoded = polyline.decode(data.polyline)

      const coords = decoded.map(([lat, lng]) => ({
        latitude: lat,
        longitude: lng,
      }))

      setRouteCoords(coords)

      // EXTRACT DURATION IN SECONDS
      const durationInSeconds =
        (data.durationInTraffic || data.duration)?.value ?? 0

      setRouteInfo({
        distance: data.distance?.text ?? '',
        duration: (data.durationInTraffic || data.duration)?.text ?? '',
        durationValue: durationInSeconds,
      })

      setTimeRemaining(durationInSeconds)

      // ZOOM OUT TO FIT ROUTE
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(coords, {
          edgePadding: {
            top: 120,
            right: 60,
            bottom: 120,
            left: 60,
          },
          animated: true,
        })
        setTripState('route_shown')
      }, 400)
    } catch (err) {
      console.log('Route fetch error', err)
      setTripState('idle')
    }
  }

  const handleStart = () => {
    if (!location) return

    setStartLocation(location)
    setTripState('active')

    // ZOOM IN TO USER
    setTimeout(() => {
      mapRef.current?.animateCamera(
        {
          center: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          pitch: 45,
          zoom: 18,
        },
        { duration: 1000 }
      )
    }, 100)
  }

  const handleStop = () => {
    setTripState('stopped')
  }

  const handleEnd = () => {
    // RESET EVERYTHING
    setTripState('idle')
    setRouteCoords([])
    setRouteInfo(null)
    setDestination('')
    setTimeRemaining(0)
    setStartLocation(null)

    // ZOOM OUT
    if (location) {
      mapRef.current?.animateCamera(
        {
          center: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          pitch: 0,
          zoom: 16,
        },
        { duration: 800 }
      )
    }
  }

  /* ------------------------------------------------ */
  /* CALCULATE DISTANCE BETWEEN TWO POINTS */
  /* ------------------------------------------------ */

  const getDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371e3 // meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // meters
  }
  useEffect(() => {
    let subscription: Location.LocationSubscription
    let interval: ReturnType<typeof setInterval>

    const startTracking = async () => {
      const { status } =
        await Location.requestForegroundPermissionsAsync()

      if (status !== 'granted') {
        setLocationLoading(false)
        return
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 3,
        },
        (loc) => {
          setLocation(loc.coords)
          setLocationLoading(false)

          if (tripState === 'active') {
            mapRef.current?.animateCamera(
              {
                center: {
                  latitude: loc.coords.latitude,
                  longitude: loc.coords.longitude,
                },
                pitch: 45,
                zoom: 18,
              },
              { duration: 900 }
            )
          }
        }
      )
      interval = setInterval(async () => {
        if (!location) return

        await updateUserLocation(
          getToken,
          location.latitude,
          location.longitude
        )
      }, 5 * 60 * 1000)
    }

    startTracking()

    return () => {
      subscription?.remove()
      clearInterval(interval)
    }
  }, [tripState])

  /* ------------------------------------------------ */
  /* TIMER DECREASE AS USER MOVES */
  /* ------------------------------------------------ */

  useEffect(() => {
    if (tripState !== 'active' || !startLocation || !location || !routeInfo)
      return

    const distanceTraveled = getDistance(
      startLocation.latitude,
      startLocation.longitude,
      location.latitude,
      location.longitude
    )

    // ESTIMATE: assume average speed, decrease time proportionally
    // Simple heuristic: for every 100m traveled, reduce time by ~10 seconds
    const secondsToReduce = Math.floor(distanceTraveled / 100) * 10

    const newTime = Math.max(
      0,
      (routeInfo.durationValue ?? 0) - secondsToReduce
    )

    setTimeRemaining(newTime)
  }, [location, tripState])

  /* ------------------------------------------------ */
  /* UI ANIMATION */
  /* ------------------------------------------------ */

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  /* ------------------------------------------------ */
  /* FORMAT TIME */
  /* ------------------------------------------------ */

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  /* ------------------------------------------------ */
  /* UI */
  /* ------------------------------------------------ */

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FEFEFE', '#F5F3FF', '#FEFEFE']}
        style={styles.gradient}
      >
        <SignedIn>
          <ScrollView contentContainerStyle={styles.signedInContainer}>
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              {/* DESTINATION INPUT (only when idle) */}
              {tripState === 'idle' && (
                <>
                  <TextInput
                    placeholder="Where do you want to go?"
                    value={destination}
                    onChangeText={setDestination}
                    style={styles.input}
                  />

                  <Pressable style={styles.routeBtn} onPress={fetchRoute}>
                    <Text style={{ color: '#fff', fontWeight: '700' }}>
                      Show Route
                    </Text>
                  </Pressable>
                </>
              )}

              {/* LOADING INDICATOR */}
              {tripState === 'loading' && (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color="#9333EA" />
                  <Text style={styles.loaderText}>
                    Fetching your route...
                  </Text>
                </View>
              )}

              {/* ROUTE INFO */}
              {(tripState === 'route_shown' ||
                tripState === 'active' ||
                tripState === 'stopped') &&
                routeInfo && (
                  <View style={styles.infoCard}>
                    <Text style={styles.infoText}>
                      Distance: {String(routeInfo.distance)}
                    </Text>
                    {tripState === 'active' ? (
                      <Text style={styles.infoText}>
                        Time Remaining: {formatTime(timeRemaining)}
                      </Text>
                    ) : (
                      <Text style={styles.infoText}>
                        ETA: {String(routeInfo.duration)}
                      </Text>
                    )}
                  </View>
                )}

              {/* TRIP CONTROLS */}
              {tripState === 'route_shown' && (
                <Pressable style={styles.startBtn} onPress={handleStart}>
                  <Text style={styles.btnText}>Start Trip</Text>
                </Pressable>
              )}

              {tripState === 'active' && (
                <View style={styles.controlRow}>
                  <Pressable style={styles.stopBtn} onPress={handleStop}>
                    <Text style={styles.btnText}>Stop</Text>
                  </Pressable>
                  <Pressable style={styles.endBtn} onPress={handleEnd}>
                    <Text style={styles.btnText}>End Trip</Text>
                  </Pressable>
                </View>
              )}

              {tripState === 'stopped' && (
                <View style={styles.controlRow}>
                  <Pressable style={styles.resumeBtn} onPress={handleStart}>
                    <Text style={styles.btnText}>Resume</Text>
                  </Pressable>
                  <Pressable style={styles.endBtn} onPress={handleEnd}>
                    <Text style={styles.btnText}>End Trip</Text>
                  </Pressable>
                </View>
              )}

              {/* MAP */}
              <View style={styles.mapContainer}>
                {locationLoading && (
                  <View style={styles.mapFallback}>
                    <ActivityIndicator size="large" color="#9333EA" />
                    <Text style={{ marginTop: 12, color: '#64748B' }}>Getting your location...</Text>
                  </View>
                )}
                {!locationLoading && mapError && (
                  <View style={styles.mapFallback}>
                    <Text style={{ color: '#EF4444', fontWeight: '600', fontSize: 16 }}>Map unavailable</Text>
                    <Text style={{ color: '#64748B', marginTop: 8, textAlign: 'center' }}>Please check your Google Maps configuration</Text>
                  </View>
                )}
                {!locationLoading && !mapError && location && (
                  <MapView
                    provider="google"
                    ref={mapRef}
                    style={{ flex: 1 }}
                    initialRegion={{
                      latitude: location.latitude,
                      longitude: location.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    showsUserLocation
                    showsMyLocationButton
                    onMapReady={() => console.log('Map ready')}
                  >
                    <Marker coordinate={location} title="You" />

                    {routeCoords.length > 0 && (
                      <>
                        <Polyline
                          coordinates={routeCoords}
                          strokeWidth={5}
                          strokeColor="#9333EA"
                        />

                        <Marker
                          coordinate={routeCoords[routeCoords.length - 1]}
                          title="Destination"
                          pinColor="green"
                        />
                      </>
                    )}
                  </MapView>
                )}
              </View>
            </Animated.View>
          </ScrollView>
        </SignedIn>
      </LinearGradient>
    </View>
  )
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  signedInContainer: { padding: 24, paddingTop: 20 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },

  greeting: { fontSize: 16, color: '#64748B' },

  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#9333EA',
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },

  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  routeBtn: {
    marginTop: 10,
    backgroundColor: '#9333EA',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  loaderContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 12,
  },

  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },

  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  infoText: {
    fontSize: 15,
    color: '#1E293B',
    marginBottom: 4,
  },

  startBtn: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 8,
  },

  controlRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 8,
  },

  stopBtn: {
    flex: 1,
    backgroundColor: '#F59E0B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  resumeBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  endBtn: {
    flex: 1,
    backgroundColor: '#EF4444',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  mapFallback: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: '#F5F3FF',
    borderRadius: 20,
  },
  mapContainer: {
    height: 400,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 12,
  },
})
