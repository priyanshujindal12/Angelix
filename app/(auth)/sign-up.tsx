import { useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import * as React from 'react'
import { Pressable, StyleSheet, Text, TextInput, View, Animated } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '@clerk/clerk-expo'
import { syncUserWithBackend } from '@/lib/syncUser'
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry'
export default function Page() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter();
 
const [error, setError] = React.useState<string | null>(null)

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [code, setCode] = React.useState('')

  const fadeAnim = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()
  }, [])

  const onSignUpPress = async () => {
  if (!isLoaded) return

  try {
    setError(null)

    await signUp.create({
      emailAddress,
      password,
    })

    await signUp.prepareEmailAddressVerification({
      strategy: 'email_code',
    })

    setPendingVerification(true)
  } catch (err: any) {
    const message =
      err?.errors?.[0]?.message ||
      'Something went wrong. Please try again.'

    setError(message)
  }
}


 const onVerifyPress = async () => {
  if (!isLoaded) return

  try {
    setError(null)

    const signUpAttempt = await signUp.attemptEmailAddressVerification({
      code,
    })

    if (signUpAttempt.status === 'complete') {
      await setActive({
        session: signUpAttempt.createdSessionId,
      })
      router.replace('/')
    }
  } catch (err: any) {
    const message =
      err?.errors?.[0]?.message ||
      'Invalid verification code. Please try again.'

    setError(message)
  }
}


  if (pendingVerification) {
    return (
      <LinearGradient
        colors={['#FEFEFE', '#F5F3FF', '#FEFEFE']}
        style={styles.gradient}
      >
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoOuter}>
              <LinearGradient
                colors={['#9333EA', '#C084FC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoGradient}
              >
                <View style={styles.logoInner}>
                  <View style={styles.logoDot} />
                </View>
              </LinearGradient>
            </View>
          </View>

          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.description}>
            A verification code has been sent to your email.
          </Text>
            {error && <Text style={styles.errorText}>{error}</Text>}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Verification Code</Text>
            <TextInput
              style={styles.input}
              value={code}
              placeholder="Enter your verification code"
              placeholderTextColor="#A1A1AA"
              onChangeText={setCode}
              keyboardType="numeric"
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed
            ]}
            onPress={onVerifyPress}
          >
            <LinearGradient
              colors={['#9333EA', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Verify</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient
      colors={['#FEFEFE', '#F5F3FF', '#FEFEFE']}
      style={styles.gradient}
    >
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoOuter}>
            <LinearGradient
              colors={['#9333EA', '#C084FC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoGradient}
            >
              <View style={styles.logoInner}>
                <View style={styles.logoDot} />
              </View>
            </LinearGradient>
          </View>
        </View>

        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Join Angelix for safer journeys</Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              value={emailAddress}
              placeholder="Enter email"
              placeholderTextColor="#A1A1AA"
              onChangeText={setEmailAddress}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              placeholder="Enter password"
              placeholderTextColor="#A1A1AA"
              secureTextEntry
              onChangeText={setPassword}
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              (!emailAddress || !password) && styles.buttonDisabled,
              pressed && styles.buttonPressed
            ]}
            onPress={onSignUpPress}
            disabled={!emailAddress || !password}
          >
            <LinearGradient
              colors={['#9333EA', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>Have an account? </Text>
          <Link href="/sign-in" asChild>
            <Pressable>
              <Text style={styles.link}>Sign in</Text>
            </Pressable>
          </Link>
        </View>

        {/* Trust Badge */}
        <View style={styles.trustBadge}>
          <View style={styles.trustDot} />
          <Text style={styles.trustText}>Your data is encrypted and secure</Text>
        </View>
      </Animated.View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
  },

  // Logo
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    padding: 2,
    backgroundColor: 'rgba(147, 51, 234, 0.08)',
  },
  logoGradient: {
    flex: 1,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  logoInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEFEFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#9333EA',
    opacity: 0.9,
  },

  // Typography
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#9333EA',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 40,
  },
  description: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },

  // Form
  formContainer: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
    color: '#52525B',
    marginLeft: 4,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E4E4E7',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#18181B',
  },

  // Button
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  buttonDisabled: {
    opacity: 0.4,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  // Links
  linkContainer: {
    flexDirection: 'row',
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    fontSize: 14,
    color: '#64748B',
  },
  link: {
    color: '#9333EA',
    fontWeight: '700',
    fontSize: 14,
  },

  // Trust Badge
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(147, 51, 234, 0.04)',
    borderRadius: 24,
    alignSelf: 'center',
  },
  trustDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9333EA',
  },
  trustText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
})