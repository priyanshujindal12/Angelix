import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '@clerk/clerk-expo'
import AsyncStorage from '@react-native-async-storage/async-storage'
const API_URL = 'https://angelix-backend.onrender.com'
export default function PhoneScreen() {
  const { getToken } = useAuth()
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [existingPhone, setExistingPhone] = useState<string | null>(null)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  // Load phone number from AsyncStorage on mount
  useEffect(() => {
    loadPhoneFromStorage()
  }, [])

  const loadPhoneFromStorage = async () => {
    try {
      const storedPhone = await AsyncStorage.getItem('userPhone')
      const storedVerified = await AsyncStorage.getItem('phoneVerified')

      if (storedPhone) {
        setExistingPhone(storedPhone)
        setPhone(storedPhone)
        setPhoneVerified(storedVerified === 'true')
      }
    } catch (error) {
      console.error('Failed to load phone from storage:', error)
    } finally {
      setInitialLoading(false)
    }
  }

  const savePhoneToStorage = async (phoneNumber: string, verified: boolean) => {
    try {
      await AsyncStorage.setItem('userPhone', phoneNumber)
      await AsyncStorage.setItem('phoneVerified', verified.toString())
    } catch (error) {
      console.error('Failed to save phone to storage:', error)
    }
  }

  // Auto-format phone: prepend +91 if user enters 10 digits without country code
  const formatPhone = (raw: string): string => {
    const cleaned = raw.trim().replace(/\s+/g, '')
    if (/^\d{10}$/.test(cleaned)) {
      return `+91${cleaned}`
    }
    return cleaned
  }

  const handleSendOtp = async () => {
    setErrorMsg('')
    const rawPhone = phone.trim()

    if (!rawPhone) {
      setErrorMsg('Please enter a phone number')
      return
    }

    const formattedPhone = formatPhone(rawPhone)

    // Client-side validation: must start with + and have at least 10 digits
    if (!/^\+\d{10,15}$/.test(formattedPhone)) {
      setErrorMsg('Enter a valid number with country code (e.g. +911234567890)')
      return
    }

    setSendingOtp(true)

    try {
      const token = await getToken()

      if (!token) {
        setErrorMsg('Unable to get authentication token. Please sign in again.')
        setSendingOtp(false)
        return
      }

      const response = await fetch(`${API_URL}/api/addnumber/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: formattedPhone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrorMsg(data.message || 'Failed to send OTP')
        setSendingOtp(false)
        return
      }

      setOtpSent(true)
      setErrorMsg('')
      Alert.alert('Success', data.message || 'OTP sent to your email. Please check your inbox.')
    } catch (error: any) {
      console.error('Send OTP error:', error)
      setErrorMsg('Network error. Please check your connection and try again.')
    } finally {
      setSendingOtp(false)
    }
  }

  const handleVerifyOtp = async () => {
    setErrorMsg('')
    if (!otp.trim()) {
      setErrorMsg('Please enter the OTP')
      return
    }

    setVerifyingOtp(true)
    try {
      const token = await getToken()
      const formattedPhone = formatPhone(phone.trim())
      const response = await fetch(`${API_URL}/api/addnumber/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: formattedPhone,
          otp: otp.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrorMsg(data.message || 'Failed to verify OTP')
        setVerifyingOtp(false)
        return
      }

      // Save phone to AsyncStorage after successful verification
      await savePhoneToStorage(formattedPhone, true)
      setExistingPhone(formattedPhone)
      setPhoneVerified(true)
      setErrorMsg('')

      Alert.alert('Success', data.message || 'Phone number verified successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setOtp('')
            setOtpSent(false)
          },
        },
      ])
    } catch (error: any) {
      console.error('Verify OTP error:', error)
      setErrorMsg('Network error. Please check your connection and try again.')
    } finally {
      setVerifyingOtp(false)
    }
  }

  const handleResendOtp = () => {
    setOtp('')
    setOtpSent(false)
  }

  return (
    <LinearGradient
      colors={['#FEFEFE', '#F5F3FF', '#FEFEFE']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {initialLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9333EA" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <>
            {/* Header Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="call" size={48} color="#9333EA" />
              </View>
            </View>

            <Text style={styles.title}>
              {existingPhone ? 'Edit Phone Number' : 'Add Phone Number'}
            </Text>
            <Text style={styles.subtitle}>
              {existingPhone
                ? `Current: ${existingPhone}${phoneVerified ? ' ✓ Verified' : ' (Unverified)'}`
                : 'Add your phone number for emergency verification'}
            </Text>

            {/* Phone Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIconWrapper}>
                <Ionicons name="call-outline" size={20} color="#9333EA" />
              </View>
              <TextInput
                placeholder="Enter phone number (e.g., 9876543210)"
                value={phone}
                onChangeText={(text) => { setPhone(text); setErrorMsg('') }}
                keyboardType="phone-pad"
                style={styles.input}
                placeholderTextColor="#94A3B8"
                editable={!otpSent}
              />
              {phoneVerified && !otpSent && (
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              )}
            </View>
            {errorMsg && !otpSent ? (
              <Text style={styles.errorText}>{errorMsg}</Text>
            ) : null}

            {/* OTP Input (if OTP sent) */}
            {otpSent && (
              <>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIconWrapper}>
                    <Ionicons name="shield-checkmark-outline" size={20} color="#9333EA" />
                  </View>
                  <TextInput
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChangeText={(text) => { setOtp(text); setErrorMsg('') }}
                    keyboardType="number-pad"
                    maxLength={6}
                    style={styles.input}
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                {errorMsg ? (
                  <Text style={styles.errorText}>{errorMsg}</Text>
                ) : null}

                <Pressable onPress={handleResendOtp}>
                  <Text style={styles.resendText}>Change phone number</Text>
                </Pressable>
              </>
            )}

            {/* Action Button */}
            <Pressable
              style={[styles.btn, (sendingOtp || verifyingOtp) && styles.btnDisabled]}
              onPress={otpSent ? handleVerifyOtp : handleSendOtp}
              disabled={sendingOtp || verifyingOtp}
            >
              <LinearGradient
                colors={['#9333EA', '#7E22CE']}
                style={styles.btnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {(sendingOtp || verifyingOtp) ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.btnText}>
                      {otpSent ? 'Verify OTP' : (existingPhone ? 'Update & Send OTP' : 'Send OTP')}
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </Pressable>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={24} color="#9333EA" />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>
                  {otpSent ? 'Check your email' : 'Why add a phone number?'}
                </Text>
                <Text style={styles.infoText}>
                  {otpSent
                    ? 'We sent a 6-digit OTP to your registered email. Enter it above to verify your phone number.'
                    : 'Your phone number helps emergency contacts reach you quickly and receive alerts. You can enter just your 10-digit number — we\'ll add +91 automatically.'}
                </Text>
              </View>
            </View>

            {/* Benefits */}
            {!otpSent && (
              <View style={styles.benefitsContainer}>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={styles.benefitText}>Quick emergency alerts</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={styles.benefitText}>SMS notifications</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={styles.benefitText}>Contact verification</Text>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  content: {
    padding: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIconWrapper: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '500',
    marginTop: -8,
    marginBottom: 12,
    marginLeft: 4,
  },
  resendText: {
    color: '#9333EA',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 20,
    marginTop: -8,
  },
  btn: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnGradient: {
    flexDirection: 'row',
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F5F3FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  benefitsContainer: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
  },
  benefitText: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },
})
