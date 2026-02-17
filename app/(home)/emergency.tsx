import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '@clerk/clerk-expo'

const API_URL = 'https://angelix-backend.onrender.com'

type EmergencyContact = {
  _id: string
  user: {
    _id: string
    name: string
    email: string
    avatar?: string
    phoneNumber?: string
  }
  nickname: string
}

export default function EmergencyScreen() {
  const { getToken } = useAuth()

  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const [loading, setLoading] = useState(true)
  const [addingContact, setAddingContact] = useState(false)

  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')

  // Fetch contacts on mount
  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/emergency/list`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch contacts')
      }

      setContacts(data.contacts || [])
    } catch (error: any) {
      console.error('Fetch contacts error:', error)
      Alert.alert('Error', 'Failed to load emergency contacts')
    } finally {
      setLoading(false)
    }
  }

  const handleAddContact = async () => {
    if (!nickname.trim() || !email.trim()) {
      Alert.alert('Error', 'Please fill in both name and email')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address')
      return
    }

    setAddingContact(true)
    try {
      const token = await getToken()
      const response = await fetch(`${API_URL}/api/emergency/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          nickname: nickname.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add contact')
      }

      // Clear form
      setNickname('')
      setEmail('')

      // Refresh contacts list
      await fetchContacts()

      Alert.alert('Success', data.message || 'Emergency contact added successfully!')
    } catch (error: any) {
      console.error('Add contact error:', error)
      Alert.alert('Error', error.message || 'Failed to add contact. Please try again.')
    } finally {
      setAddingContact(false)
    }
  }

  const handleRemoveContact = (contactEmail: string, contactName: string) => {
    Alert.alert(
      'Remove Contact',
      `Are you sure you want to remove ${contactName} from your emergency contacts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken()
              const response = await fetch(`${API_URL}/api/emergency/delete`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ email: contactEmail }),
              })

              const data = await response.json()

              if (!response.ok) {
                throw new Error(data.message || 'Failed to remove contact')
              }

              // Refresh contacts list
              await fetchContacts()
              Alert.alert('Success', data.message || 'Contact removed successfully!')
            } catch (error: any) {
              console.error('Delete contact error:', error)
              Alert.alert('Error', error.message || 'Failed to remove contact. Please try again.')
            }
          },
        },
      ]
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9333EA" />
        <Text style={styles.loadingText}>Loading contacts...</Text>
      </View>
    )
  }

  return (
    <LinearGradient
      colors={['#FEFEFE', '#F5F3FF', '#FEFEFE']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="people" size={48} color="#9333EA" />
          </View>
        </View>

        <Text style={styles.title}>Emergency Contacts</Text>
        <Text style={styles.subtitle}>
          Add trusted contacts who will be notified in case of emergency
        </Text>

        {/* Existing Contacts */}
        {contacts.length > 0 && (
          <View style={styles.contactsSection}>
            <Text style={styles.sectionTitle}>Your Contacts ({contacts.length})</Text>
            {contacts.map((contact) => {
              const displayName = contact.nickname || contact.user.name || 'Unknown'
              const initial = displayName.charAt(0).toUpperCase()

              return (
                <View key={contact._id} style={styles.contactCard}>
                  <View style={styles.contactAvatar}>
                    <Text style={styles.contactInitial}>{initial}</Text>
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{displayName}</Text>
                    <Text style={styles.contactDetail}>{contact.user.email}</Text>
                    {contact.user.phoneNumber && (
                      <Text style={styles.contactDetail}>{contact.user.phoneNumber}</Text>
                    )}
                  </View>
                  <Pressable onPress={() => handleRemoveContact(contact.user.email, displayName)}>
                    <Ionicons name="trash-outline" size={24} color="#EF4444" />
                  </Pressable>
                </View>
              )
            })}
          </View>
        )}

        {/* Add New Contact Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Add New Contact</Text>

          {/* Name Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputIconWrapper}>
              <Ionicons name="person-outline" size={20} color="#9333EA" />
            </View>
            <TextInput
              placeholder="Contact Name / Nickname"
              value={nickname}
              onChangeText={setNickname}
              style={styles.input}
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputIconWrapper}>
              <Ionicons name="mail-outline" size={20} color="#9333EA" />
            </View>
            <TextInput
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Note */}
          <View style={styles.noteCard}>
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text style={styles.noteText}>
              Contact must have an Angelix account with this email to receive alerts
            </Text>
          </View>

          {/* Add Button */}
          <Pressable
            style={[styles.btn, addingContact && styles.btnDisabled]}
            onPress={handleAddContact}
            disabled={addingContact}
          >
            <LinearGradient
              colors={['#9333EA', '#7E22CE']}
              style={styles.btnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {addingContact ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="add-circle" size={24} color="#fff" />
                  <Text style={styles.btnText}>Add Emergency Contact</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </View>

        {/* Info Section */}
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={32} color="#9333EA" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>How it works</Text>
            <Text style={styles.infoText}>
              When you trigger an SOS alert, all your emergency contacts will receive your location and a notification to check on you immediately.
            </Text>
          </View>
        </View>
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
    backgroundColor: '#FEFEFE',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
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
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  contactsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#9333EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  contactDetail: {
    fontSize: 13,
    color: '#64748B',
  },
  formSection: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
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
  noteCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 10,
    alignItems: 'center',
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '500',
  },
  btn: {
    borderRadius: 12,
    overflow: 'hidden',
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
    gap: 10,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F5F3FF',
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
})
