import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { Stack } from 'expo-router'
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native'
import { useColorScheme } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import AngelixHeader from './components/header'

export default function RootLayout() {
  const scheme = useColorScheme()

  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ClerkProvider
        publishableKey="pk_test_ZmlybS1nb2JsaW4tOTguY2xlcmsuYWNjb3VudHMuZGV2JA"
        tokenCache={tokenCache}>
        
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#FFFFFF',
              
            },
            headerShadowVisible: false,
            headerTintColor: '#9333EA',
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 20,
            },
         
            headerTitle: () => <AngelixHeader />,
          }} >
          < Stack.Screen name="onBoarding" options={{ headerShown: true }} />
          <Stack.Screen name="index" options={{ headerShown: true }} />
          <Stack.Screen name="landing" options={{ 
            headerBackVisible: false
           }} />
          <Stack.Screen name="(home)" options={{ headerShown: false , headerBackVisible: false}} />
          <Stack.Screen name="(auth)" options={{ headerShown: true ,
            headerBackVisible: false
          }} />
        </Stack>
        <StatusBar style="auto" />
      </ClerkProvider>
    </ThemeProvider>
  )
}
