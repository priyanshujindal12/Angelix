import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  Dimensions, 
  Animated, 
  SafeAreaView 
} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
const slides = [
  {
    title: 'Your Safety Circle',
    description: 'Connect with trusted contacts who care. Build your circle of protection with people who matter most.',
    illustration: 'circle',
  },
  {
    title: 'Emergency SOS',
    description: 'One tap sends your location and alert to your safety circle instantly when you need help.',
    illustration: 'sos',
  },
  {
    title: 'Smart Check-ins',
    description: 'Set timers for activities. Your circle gets notified if you don\'t check in on time.',
    illustration: 'checkin',
  },
  {
    title: 'Private. Trusted. Yours.',
    description: 'Your data stays encrypted and tamper-proof. We never sell your information. Ever.',
    illustration: 'secure',
  },
];

// Illustrations (unchanged)
const CircleIllustration = () => (
  <Svg width="280" height="280" viewBox="0 0 280 280">
    <Circle cx="140" cy="140" r="120" fill="#F3E8FF" opacity="0.5" />
    <Circle cx="140" cy="80" r="20" fill="#9333EA" />
    <Circle cx="200" cy="140" r="20" fill="#9333EA" opacity="0.7" />
    <Circle cx="140" cy="200" r="20" fill="#9333EA" opacity="0.7" />
    <Circle cx="80" cy="140" r="20" fill="#9333EA" opacity="0.7" />
    <Path d="M140 100 L140 120" stroke="#9333EA" strokeWidth="2" strokeDasharray="4,4" />
    <Path d="M180 140 L160 140" stroke="#9333EA" strokeWidth="2" strokeDasharray="4,4" />
    <Path d="M140 180 L140 160" stroke="#9333EA" strokeWidth="2" strokeDasharray="4,4" />
    <Path d="M100 140 L120 140" stroke="#9333EA" strokeWidth="2" strokeDasharray="4,4" />
    <Path d="M140 110 L160 120 L160 145 Q160 155 140 165 Q120 155 120 145 L120 120 Z" fill="#9333EA" />
    <Path d="M135 140 L142 147 L155 130" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
  </Svg>
);

const SOSIllustration = () => (
  <Svg width="280" height="280" viewBox="0 0 280 280">
    <Rect x="90" y="50" width="100" height="180" rx="15" fill="#1F2937" />
    <Rect x="95" y="60" width="90" height="160" rx="5" fill="white" />
    <Circle cx="140" cy="140" r="35" fill="#DC2626" />
    <Circle cx="140" cy="140" r="50" fill="none" stroke="#DC2626" strokeWidth="3" opacity="0.6" />
    <Circle cx="140" cy="140" r="65" fill="none" stroke="#DC2626" strokeWidth="2" opacity="0.3" />
    <Path d="M210 90 Q210 75 220 75 Q230 75 230 90 Q230 105 220 120 Q210 105 210 90" fill="#9333EA" />
    <Circle cx="220" cy="85" r="4" fill="white" />
  </Svg>
);

const CheckInIllustration = () => (
  <Svg width="280" height="280" viewBox="0 0 280 280">
    <Circle cx="140" cy="140" r="100" fill="#F3E8FF" />
    <Circle cx="140" cy="140" r="90" fill="white" stroke="#9333EA" strokeWidth="3" />
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
      const rad = (angle - 90) * Math.PI / 180;
      const x1 = 140 + 75 * Math.cos(rad);
      const y1 = 140 + 75 * Math.sin(rad);
      const x2 = 140 + 85 * Math.cos(rad);
      const y2 = 140 + 85 * Math.sin(rad);
      return <Path key={i} d={`M${x1} ${y1} L${x2} ${y2}`} stroke="#9333EA" strokeWidth="2" />;
    })}
    <Path d="M140 140 L140 90" stroke="#9333EA" strokeWidth="4" strokeLinecap="round" />
    <Path d="M140 140 L170 140" stroke="#9333EA" strokeWidth="3" strokeLinecap="round" />
    <Circle cx="140" cy="140" r="6" fill="#9333EA" />
    <Circle cx="200" cy="80" r="25" fill="#10B981" />
    <Path d="M190 80 L197 87 L210 70" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" />
  </Svg>
);

const SecureIllustration = () => (
  <Svg width="280" height="280" viewBox="0 0 280 280">
    <Path 
      d="M140 50 L200 80 L200 140 Q200 180 140 220 Q80 180 80 140 L80 80 Z" 
      fill="#9333EA" 
    />
    <Rect x="120" y="130" width="40" height="45" rx="5" fill="white" />
    <Path 
      d="M125 130 L125 115 Q125 105 140 105 Q155 105 155 115 L155 130" 
      fill="none" 
      stroke="white" 
      strokeWidth="4" 
      strokeLinecap="round"
    />
    <Circle cx="140" cy="150" r="5" fill="#9333EA" />
    <Circle cx="50" cy="100" r="15" fill="#F3E8FF" opacity="0.6" />
    <Circle cx="230" cy="180" r="20" fill="#F3E8FF" opacity="0.6" />
    <Circle cx="60" cy="220" r="10" fill="#F3E8FF" opacity="0.6" />
  </Svg>
);

export default function Onboarding() {
  const [index, setIndex] = useState(0);
  const router = useRouter();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 9, useNativeDriver: true }),
    ]).start();
  }, [index]);

  const next = async () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -60, duration: 250, useNativeDriver: true }),
    ]).start(async () => {
      if (index < slides.length - 1) {
        setIndex(index + 1);
        fadeAnim.setValue(0);
        slideAnim.setValue(60);
      } else {
        await AsyncStorage.setItem('onboardingSeen', 'true');
        router.replace('/landing');
      }
    });
  };

  const skip = async () => {
    await AsyncStorage.setItem('onboardingSeen', 'true');
    router.replace('/landing');
  };
  const currentSlide = slides[index];
  const renderIllustration = () => {
    switch (currentSlide.illustration) {
      case 'circle':   return <CircleIllustration />;
      case 'sos':      return <SOSIllustration />;
      case 'checkin':  return <CheckInIllustration />;
      case 'secure':   return <SecureIllustration />;
      default:         return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Main Content – now starts higher up */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.illustrationContainer}>
            {renderIllustration()}
          </View>

          <Text style={styles.title}>{currentSlide.title}</Text>
          <Text style={styles.description}>{currentSlide.description}</Text>
        </Animated.View>

        {/* Bottom section */}
        <View style={styles.bottom}>
          <View style={styles.pagination}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === index && styles.dotActive,
                ]}
              />
            ))}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={next}
          >
            <Text style={styles.buttonText}>
              {index === slides.length - 1 ? 'Get Started' : 'Continue'}
            </Text>
          </Pressable>

          {index === slides.length - 1 && (
            <Text style={styles.terms}>
              By continuing, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          )}

          {/* Optional: Keep Skip only on last screen if you want – or remove completely */}
          {index < slides.length - 1 && (
            <Pressable onPress={skip} style={styles.skipLink}>
              <Text style={styles.skipLinkText}>Skip</Text>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 40,          // increased a bit since no header
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationContainer: {
    marginBottom: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -0.4,
    lineHeight: 38,
  },
  description: {
    fontSize: 17,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 12,
    marginBottom: 40,
  },
  bottom: {
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  dotActive: {
    backgroundColor: '#7C3AED',
    width: 32,
  },
  button: {
    backgroundColor: '#7C3AED',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  buttonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.97 }],
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  terms: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 20,
  },
  termsLink: {
    color: '#7C3AED',
    fontWeight: '600',
  },
  skipLink: {
    marginTop: 20,
    padding: 12,
  },
  skipLinkText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
});