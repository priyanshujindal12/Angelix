import { SignedIn, SignedOut, useUser, } from '@clerk/clerk-expo'
import { Link } from 'expo-router'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  Image,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useEffect, useRef } from 'react'

export default function Home() {
  // Clerk
  const { user } = useUser()

  // Avatar
  const avatarUri =
    user?.imageUrl ||
    'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current
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

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FEFEFE', '#F5F3FF', '#FEFEFE']}
        style={styles.gradient}
      >
        {/* ---------------- SIGNED OUT ---------------- */}
        <SignedOut>
          <Animated.View
            style={[
              styles.signedOutContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={styles.brandName}>Angelix</Text>
            <Text style={styles.tagline}>Your personal safety companion</Text>

            <View style={styles.buttonContainer}>
              <Link href="/landing" asChild>
                <Pressable style={styles.primaryButton}>
                  <LinearGradient
                    colors={['#9333EA', '#7C3AED']}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.primaryButtonText}>Sign in</Text>
                  </LinearGradient>
                </Pressable>
              </Link>

              <Link href="/(auth)/sign-up" asChild>
                <Pressable style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Sign up</Text>
                </Pressable>
              </Link>
            </View>
          </Animated.View>
        </SignedOut>

        {/* ---------------- SIGNED IN ---------------- */}
        <SignedIn>
          <ScrollView
            contentContainerStyle={styles.signedInContainer}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
            >
              {/* Header */}
              <View style={styles.header}>
                <View>
                  <Text style={styles.greeting}>Welcome back,</Text>
                  <Text style={styles.userName}>
                    {user?.firstName ||
                      user?.emailAddresses[0].emailAddress?.split('@')[0]}
                  </Text>
                </View>

                {/* Avatar */}
                <View style={styles.avatarContainer}>
                  <LinearGradient
                    colors={['#9333EA', '#C084FC']}
                    style={styles.avatarBorder}
                  >
                    <Image source={{ uri: avatarUri }} style={styles.avatar} />
                  </LinearGradient>
                </View>
              </View>

              {/* Status Card */}
              <View style={styles.statusCard}>
                <LinearGradient
                  colors={['#9333EA', '#7C3AED']}
                  style={styles.statusGradient}
                >
                  <Text style={styles.statusTitle}>You're Protected 🛡️</Text>
                  <Text style={styles.statusDescription}>
                    Your safety network is active
                  </Text>
                </LinearGradient>
              </View>
            </Animated.View>
          </ScrollView>
        </SignedIn>
      </LinearGradient>
    </View>
  )
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },

  // Signed Out
  signedOutContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  brandName: {
    fontSize: 42,
    fontWeight: '700',
    color: '#9333EA',
  },
  tagline: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 40,
  },
  buttonContainer: { width: '100%', gap: 16 },
  primaryButton: { borderRadius: 12, overflow: 'hidden' },
  buttonGradient: { paddingVertical: 18, alignItems: 'center' },
  primaryButtonText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: '#9333EA',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#9333EA',
    fontSize: 17,
    fontWeight: '600',
  },

  // Signed In
  signedInContainer: { padding: 24, paddingTop: 60 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: { fontSize: 16, color: '#64748B' },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#9333EA',
  },

  avatarContainer: { width: 56, height: 56 },
  avatarBorder: {
    flex: 1,
    borderRadius: 28,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F4F4F5',
  },

  statusCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 20,
  },
  statusGradient: { padding: 24, alignItems: 'center' },
  statusTitle: { color: '#FFF', fontSize: 22, fontWeight: '700' },
  statusDescription: { color: '#E9D5FF', marginTop: 8 },

  syncButton: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#4C1D95',
    borderRadius: 10,
  },
  syncButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
})
