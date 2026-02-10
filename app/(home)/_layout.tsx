import { Tabs, Redirect } from 'expo-router'
import { useAuth, useUser } from '@clerk/clerk-expo'
import { useEffect, useRef } from 'react'
import { syncUserWithBackend } from '@/lib/syncUser'

export default function AppLayout() {
  const { isSignedIn, isLoaded, getToken } = useAuth()
  const { user } = useUser();
  const syncedRef = useRef(false)
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || syncedRef.current) return

    syncedRef.current = true
    syncUserWithBackend(getToken)
  }, [isLoaded, isSignedIn, user])

  if (!isLoaded) return null

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#9333EA',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />

      <Tabs.Screen
        name="signout"
        options={{
          title: 'Sign Out',
        }}
      />
    </Tabs>
  )
}
