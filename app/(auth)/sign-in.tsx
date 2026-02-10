import { useAuth, useSignIn, useSSO } from '@clerk/clerk-expo'
import type { EmailCodeFactor } from '@clerk/types'
import { Link, useRouter } from 'expo-router'
import * as React from 'react'
import { Pressable, StyleSheet, Text, TextInput, View, Animated } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import { LinearGradient } from 'expo-linear-gradient'
import { syncUserWithBackend } from '@/lib/syncUser'

WebBrowser.maybeCompleteAuthSession()

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const { startSSOFlow } = useSSO()
  const router = useRouter();

  const [error, setError] = React.useState<string | null>(null)
  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [code, setCode] = React.useState('')
  const [showEmailCode, setShowEmailCode] = React.useState(false)

  const fadeAnim = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()
  }, [])

  // ---------------- EMAIL + PASSWORD SIGN IN ----------------
  const onSignInPress = async () => {
  if (!isLoaded) return

  try {
    setError(null)

    const signInAttempt = await signIn.create({
      identifier: emailAddress,
      password,
    })

    if (signInAttempt.status === 'complete') {
      await setActive({ session: signInAttempt.createdSessionId })
      console.log('User signed in successfully')
      router.replace('/')
    } else if (signInAttempt.status === 'needs_second_factor') {
      const emailCodeFactor = signInAttempt.supportedSecondFactors?.find(
        (factor): factor is EmailCodeFactor =>
          factor.strategy === 'email_code',
      )

      if (emailCodeFactor) {
        await signIn.prepareSecondFactor({
          strategy: 'email_code',
          emailAddressId: emailCodeFactor.emailAddressId,
        })
        setShowEmailCode(true)
      }
    }
  } catch (err: any) {
    const message =
      err?.errors?.[0]?.message ||
      'Invalid email or password.'

    setError(message)
  }
}

 const onVerifyPress = async () => {
  if (!isLoaded) return

  try {
    setError(null)

    const signInAttempt = await signIn.attemptSecondFactor({
      strategy: 'email_code',
      code,
    })

    if (signInAttempt.status === 'complete') {
      await setActive({ session: signInAttempt.createdSessionId })

      router.replace('/')
    }
  } catch (err: any) {
    const message =
      err?.errors?.[0]?.message ||
      'Invalid verification code.'

    setError(message)
  }
}


  // ---------------- GOOGLE SIGN IN (NEW WAY) ----------------
 const onGooglePress = async () => {
  try {
    setError(null)

    const ssoResult = await startSSOFlow({
      strategy: 'oauth_google',
    })

    if (ssoResult.createdSessionId && ssoResult.setActive) {
      await ssoResult.setActive({
        session: ssoResult.createdSessionId,
      })
      router.replace('/')
    }
  } catch (err: any) {
    const message =
      err?.errors?.[0]?.message ||
      'Google sign-in was cancelled.'

    setError(message)
  }
}

  // ---------------- OTP SCREEN ----------------
  if (showEmailCode) {
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

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Verification Code</Text>
            <TextInput
              style={styles.input}
              value={code}
              placeholder="Enter verification code"
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

  // ---------------- MAIN SIGN IN SCREEN ----------------
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

        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

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
            onPress={onSignInPress}
            disabled={!emailAddress || !password}
          >
            <LinearGradient
              colors={['#9333EA', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Sign in</Text>
            </LinearGradient>
          </Pressable>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* GOOGLE LOGIN */}
          <Pressable
            style={({ pressed }) => [
              styles.googleButton,
              pressed && styles.buttonPressed
            ]}
            onPress={onGooglePress}
          >
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleText}>Continue with Google</Text>
          </Pressable>
        </View>

        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>Don't have an account? </Text>
          <Link href="/sign-up" asChild>
            <Pressable>
              <Text style={styles.link}>Sign up</Text>
            </Pressable>
          </Link>
        </View>
      </Animated.View>
    </LinearGradient>
  )
}

// ---------------- STYLES ----------------
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

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E4E4E7',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: '#A1A1AA',
    fontWeight: '500',
  },

  // Google Button
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E4E4E7',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#9333EA',
  },
  googleText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#52525B',
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
errorText: {
  color: '#DC2626',
  fontSize: 14,
  fontWeight: '600',
  textAlign: 'center',
  marginBottom: 16,
},
})