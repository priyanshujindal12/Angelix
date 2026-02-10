import { View, Text, StyleSheet, Pressable, Animated } from 'react-native'
import { useRouter } from 'expo-router'
import { useEffect, useRef } from 'react'
import { LinearGradient } from 'expo-linear-gradient'

export default function Landing() {
  const router = useRouter()
  
  const fadeAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const shieldAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start()

    // Shield glow animation
    Animated.timing(shieldAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start()

    // Pulse animation for CTA
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [])

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FEFEFE', '#F5F3FF', '#FEFEFE']}
        style={styles.gradient}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          
          {/* Shield Icon */}
          <View style={styles.iconSection}>
            <Animated.View
              style={[
                styles.shieldContainer,
                {
                  opacity: shieldAnim,
                  transform: [{
                    scale: shieldAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1]
                    })
                  }]
                }
              ]}
            >
              <View style={styles.shieldOuter}>
                <LinearGradient
                  colors={['#9333EA', '#C084FC']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.shieldGradient}
                >
                  <View style={styles.shieldInner}>
                    <View style={styles.halo} />
                  </View>
                </LinearGradient>
              </View>
            </Animated.View>
          </View>

          {/* Brand Name */}
          <Text style={styles.brandName}>Angelix</Text>

          {/* Tagline */}
          <Text style={styles.tagline}>Your personal safety companion</Text>

          {/* CTA Buttons */}
          <View style={styles.ctaSection}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.buttonPressed
                ]}
                onPress={() => router.push('/(auth)/sign-in')}
              >
                <LinearGradient
                  colors={['#9333EA', '#7C3AED']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.primaryButtonText}>Get Started</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>

            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.secondaryPressed
              ]}
              onPress={() => router.push('/(auth)/sign-in')}
            >
              <Text style={styles.secondaryButtonText}>Log in</Text>
            </Pressable>
          </View>

          {/* Trust Badge */}
          <View style={styles.trustBadge}>
            <View style={styles.trustDot} />
            <Text style={styles.trustText}>Trusted. Private. Always with you.</Text>
          </View>

        </Animated.View>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFEFE',
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  // Icon Section
  iconSection: {
    marginBottom: 48,
  },
  shieldContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 3,
    backgroundColor: 'rgba(147, 51, 234, 0.08)',
  },
  shieldGradient: {
    flex: 1,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  shieldInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FEFEFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  halo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#9333EA',
    opacity: 0.9,
  },

  // Typography
  brandName: {
    fontSize: 48,
    fontWeight: '700',
    color: '#9333EA',
    marginBottom: 16,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '400',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 56,
    lineHeight: 26,
  },

  // CTA Section
  ctaSection: {
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#9333EA',
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryPressed: {
    opacity: 0.6,
  },

  // Trust Badge
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(147, 51, 234, 0.04)',
    borderRadius: 24,
  },
  trustDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9333EA',
  },
  trustText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
})