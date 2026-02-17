import { useEffect, useState } from 'react'
import { Redirect } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { View, ActivityIndicator } from 'react-native'
export default function Index() {
  const { isSignedIn, isLoaded } = useAuth()
  const [onboardingSeen, setOnboardingSeen] = useState<boolean | null>(null)
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem('onboardingSeen')
        setOnboardingSeen(value === 'true')
      } catch (error) {
        console.log('Error checking onboarding status:', error)
        setOnboardingSeen(false)
      }
    }
    checkOnboarding()
  }, [])
  if (!isLoaded || onboardingSeen === null) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
        }}
      >
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    )
  }
  if (!onboardingSeen) {
    return <Redirect href="/onBoarding" />
  }

  // 🔐 Returning user
  return isSignedIn ? (
    <Redirect href="/(home)/(tabs)" />
  ) : (
    <Redirect href="/landing" />
  )
}
