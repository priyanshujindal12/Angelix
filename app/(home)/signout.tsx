import { useClerk } from '@clerk/clerk-expo'
import { useEffect } from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'

export default function SignOut() {
  const { signOut } = useClerk()
  const router = useRouter()

  useEffect(() => {
    const logout = async () => {
      await signOut()
      router.replace('/(auth)/sign-in')
    }

    logout()
  }, [])

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 12 }}>Signing out...</Text>
    </View>
  )
}
