import { Drawer } from 'expo-router/drawer'
import { useAuth } from '@clerk/clerk-expo'
import { Redirect, useRouter } from 'expo-router'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { DrawerToggleButton } from '@react-navigation/drawer'
import { Ionicons } from '@expo/vector-icons'
import CustomDrawerContent from './CustomDrawerContent'

function CustomHeader() {
  return (
    <View style={styles.headerContainer}>
      <DrawerToggleButton tintColor="#9333EA" />
      <Text style={styles.headerTitle}>Angelix</Text>
      <View style={{ width: 40 }} />
    </View>
  )
}

function BackButton() {
  const router = useRouter()
  return (
    <Pressable
      onPress={() => router.back()}
      style={{ paddingLeft: 16, paddingRight: 8 }}
    >
      <Ionicons name="arrow-back" size={24} color="#9333EA" />
    </Pressable>
  )
}

export default function AppLayout() {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) return null
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#9333EA',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 20,
          color: '#9333EA',
        },
        drawerActiveTintColor: '#9333EA',
        drawerInactiveTintColor: '#64748B',
      }}
    >
      {/* Tabs inside drawer */}
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: 'Angelix',
          header: () => <CustomHeader />,
        }}
      />

      {/* Profile Drawer */}
      <Drawer.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerLeft: () => <BackButton />,
        }}
      />

      <Drawer.Screen
        name="phone"
        options={{
          title: 'Phone Number',
          drawerItemStyle: { display: 'none' },
          headerLeft: () => <BackButton />,
        }}
      />

      <Drawer.Screen
        name="emergency"
        options={{
          title: 'Emergency Contact',
          drawerItemStyle: { display: 'none' },
          headerLeft: () => <BackButton />,
        }}
      />

      <Drawer.Screen
        name="signout"
        options={{
          title: 'Sign Out',
          headerLeft: () => <BackButton />,
        }}
      />
    </Drawer>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#9333EA',
  },
})
