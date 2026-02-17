import { View, Text, StyleSheet, Pressable, Animated, Dimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { useEffect, useRef } from 'react'
import { Ionicons } from '@expo/vector-icons'

const { width, height } = Dimensions.get('window')

export default function Landing() {
  const router = useRouter()

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideUp = useRef(new Animated.Value(60)).current
  const logoScale = useRef(new Animated.Value(0.3)).current
  const logoOpacity = useRef(new Animated.Value(0)).current
  const ringPulse1 = useRef(new Animated.Value(0.8)).current
  const ringPulse2 = useRef(new Animated.Value(0.6)).current
  const ringOpacity1 = useRef(new Animated.Value(0.4)).current
  const ringOpacity2 = useRef(new Animated.Value(0.2)).current
  const featureSlide1 = useRef(new Animated.Value(40)).current
  const featureSlide2 = useRef(new Animated.Value(40)).current
  const featureSlide3 = useRef(new Animated.Value(40)).current
  const featureOp1 = useRef(new Animated.Value(0)).current
  const featureOp2 = useRef(new Animated.Value(0)).current
  const featureOp3 = useRef(new Animated.Value(0)).current
  const btnSlide = useRef(new Animated.Value(30)).current
  const btnOpacity = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    // Logo entrance
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start()

    // Ring pulse loops
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ringPulse1, { toValue: 1.4, duration: 2000, useNativeDriver: true }),
          Animated.timing(ringOpacity1, { toValue: 0, duration: 2000, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(ringPulse1, { toValue: 0.8, duration: 0, useNativeDriver: true }),
          Animated.timing(ringOpacity1, { toValue: 0.4, duration: 0, useNativeDriver: true }),
        ]),
      ])
    ).start()

    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(ringPulse2, { toValue: 1.6, duration: 2500, useNativeDriver: true }),
            Animated.timing(ringOpacity2, { toValue: 0, duration: 2500, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(ringPulse2, { toValue: 0.6, duration: 0, useNativeDriver: true }),
            Animated.timing(ringOpacity2, { toValue: 0.2, duration: 0, useNativeDriver: true }),
          ]),
        ])
      ).start()
    }, 600)

    // Content fade in + slide up
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(slideUp, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
    ]).start()

    // Staggered feature cards
    Animated.stagger(150, [
      Animated.parallel([
        Animated.timing(featureOp1, { toValue: 1, duration: 500, delay: 800, useNativeDriver: true }),
        Animated.timing(featureSlide1, { toValue: 0, duration: 500, delay: 800, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(featureOp2, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(featureSlide2, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(featureOp3, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(featureSlide3, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start()

    // CTA buttons
    Animated.parallel([
      Animated.timing(btnOpacity, { toValue: 1, duration: 600, delay: 1400, useNativeDriver: true }),
      Animated.timing(btnSlide, { toValue: 0, duration: 600, delay: 1400, useNativeDriver: true }),
    ]).start()

    // Gentle pulse on CTA
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  const features = [
    {
      icon: 'shield-checkmark' as const,
      title: 'SOS Alerts',
      desc: 'One-tap emergency alerts to your trusted circle',
      color: '#9333EA',
      bg: '#F3E8FF',
      slideAnim: featureSlide1,
      opAnim: featureOp1,
    },
    {
      icon: 'location' as const,
      title: 'Live Tracking',
      desc: 'Real-time location sharing with your guardians',
      color: '#2563EB',
      bg: '#DBEAFE',
      slideAnim: featureSlide2,
      opAnim: featureOp2,
    },
    {
      icon: 'call' as const,
      title: 'Fake Calls',
      desc: 'Instant escape from uncomfortable situations',
      color: '#059669',
      bg: '#D1FAE5',
      slideAnim: featureSlide3,
      opAnim: featureOp3,
    },
  ]

  return (
    <View style={styles.container}>
      {/* Background decorative circles */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />

      {/* Top section - Logo */}
      <View style={styles.topSection}>
        <Animated.View
          style={[
            styles.logoArea,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          {/* Pulsing rings */}
          <Animated.View
            style={[
              styles.ring,
              styles.ring1,
              { opacity: ringOpacity1, transform: [{ scale: ringPulse1 }] },
            ]}
          />
          <Animated.View
            style={[
              styles.ring,
              styles.ring2,
              { opacity: ringOpacity2, transform: [{ scale: ringPulse2 }] },
            ]}
          />
          {/* Core icon */}
          <View style={styles.logoBg}>
            <Ionicons name="shield-checkmark" size={44} color="#FFFFFF" />
          </View>
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideUp }],
          }}
        >
          <Text style={styles.brand}>Angelix</Text>
          <Text style={styles.tagline}>Your Guardian Angel in Your Pocket</Text>
        </Animated.View>
      </View>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        {features.map((f, i) => (
          <Animated.View
            key={i}
            style={[
              styles.featureCard,
              {
                opacity: f.opAnim,
                transform: [{ translateY: f.slideAnim }],
              },
            ]}
          >
            <View style={[styles.featureIcon, { backgroundColor: f.bg }]}>
              <Ionicons name={f.icon} size={22} color={f.color} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
          </Animated.View>
        ))}
      </View>

      {/* Bottom CTA */}
      <Animated.View
        style={[
          styles.bottomSection,
          {
            opacity: btnOpacity,
            transform: [{ translateY: btnSlide }],
          },
        ]}
      >
        <Animated.View style={{ transform: [{ scale: pulseAnim }], width: '100%' }}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
            ]}
            onPress={() => router.push('/(auth)/sign-in')}
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
            <View style={styles.btnArrow}>
              <Ionicons name="arrow-forward" size={18} color="#9333EA" />
            </View>
          </Pressable>
        </Animated.View>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryBtn,
            pressed && { opacity: 0.6 },
          ]}
          onPress={() => router.push('/(auth)/sign-in')}
        >
          <Text style={styles.secondaryBtnText}>
            Already have an account? <Text style={styles.loginLink}>Log in</Text>
          </Text>
        </Pressable>

        {/* Trust indicators */}
        <View style={styles.trustRow}>
          <View style={styles.trustItem}>
            <Ionicons name="lock-closed" size={14} color="#9333EA" />
            <Text style={styles.trustLabel}>Encrypted</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <Ionicons name="eye-off" size={14} color="#9333EA" />
            <Text style={styles.trustLabel}>Private</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <Ionicons name="flash" size={14} color="#9333EA" />
            <Text style={styles.trustLabel}>Instant</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFE',
    overflow: 'hidden',
  },

  // Background decorations
  bgCircle1: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(147, 51, 234, 0.04)',
  },
  bgCircle2: {
    position: 'absolute',
    bottom: 120,
    left: -80,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(37, 99, 235, 0.03)',
  },
  bgCircle3: {
    position: 'absolute',
    top: height * 0.35,
    right: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(5, 150, 105, 0.03)',
  },

  // Top section
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  logoArea: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
    height: 140,
    marginBottom: 28,
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#9333EA',
    borderRadius: 999,
  },
  ring1: {
    width: 120,
    height: 120,
  },
  ring2: {
    width: 140,
    height: 140,
  },
  logoBg: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: '#9333EA',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  brand: {
    fontSize: 42,
    fontWeight: '800',
    color: '#1E1B4B',
    letterSpacing: -1.5,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    fontWeight: '400',
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
    letterSpacing: 0.2,
  },

  // Features
  featuresSection: {
    paddingHorizontal: 24,
    gap: 10,
    paddingBottom: 16,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f0f5',
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },

  // Bottom CTA
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 8,
    alignItems: 'center',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9333EA',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  btnArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtn: {
    paddingVertical: 14,
  },
  secondaryBtnText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  loginLink: {
    color: '#9333EA',
    fontWeight: '700',
  },

  // Trust
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trustDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#E2E8F0',
  },
  trustLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
})