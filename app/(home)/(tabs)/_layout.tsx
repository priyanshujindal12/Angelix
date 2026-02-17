import { Tabs, Redirect } from 'expo-router'
import { useAuth, useUser } from '@clerk/clerk-expo'
import { useEffect, useRef } from 'react'
import { syncUserWithBackend } from '@/lib/syncUser'
import { Ionicons } from '@expo/vector-icons'
export default function AppLayout() {
  const { isSignedIn, isLoaded, getToken } = useAuth()
  const { user } = useUser()
  const syncedRef = useRef(false)

  /* ---------------- CLERK SYNC (UNCHANGED) ---------------- */
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || syncedRef.current) return
    syncedRef.current = true
    syncUserWithBackend(getToken)
  }, [isLoaded, isSignedIn, user])

  if (!isLoaded) return null

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />
  }

  /* ---------------- TABS ---------------- */

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#9333EA',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      {/* FAKE CALL */}
      <Tabs.Screen
        name="fake-call"
        options={{
          title: 'Fake Call',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="call" size={size} color={color} />
          ),
        }}
      />

      {/* ⭐ CENTER SOS BUTTON */}
      <Tabs.Screen
        name="sos"
        options={{
          title: 'SOS',
          tabBarIcon: ({ size }) => (
            <Ionicons name="warning" size={size + 6} color="#fff" />
          ),
          tabBarItemStyle: {
            backgroundColor: '#EF4444',
            borderRadius: 40,
            marginTop: -15,
            height: 60,
          },
          tabBarLabelStyle: {
            color: '#EF4444',
            fontWeight: '700',
          },
        }}
      />

      {/* RECORD */}
      <Tabs.Screen
        name="record"
        options={{
          title: 'Record',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="mic" size={size} color={color} />
          ),
        }}
      />

      {/* HELP */}
      <Tabs.Screen
        name="help"
        options={{
          title: 'Help',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="help-circle" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
