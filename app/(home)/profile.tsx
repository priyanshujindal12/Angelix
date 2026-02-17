import { View, Text, Pressable, StyleSheet, ScrollView, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { useUser, useAuth } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from '@react-navigation/native'

const API_URL = 'https://angelix-backend.onrender.com'

export default function Profile() {
  const router = useRouter()
  const { user } = useUser()
  const { signOut, getToken } = useAuth()

  const [userPhone, setUserPhone] = useState<string | null>(null)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [contactCount, setContactCount] = useState(0)

  const avatarUri =
    user?.imageUrl ||
    'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'

  const userName = user?.firstName || user?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'User'
  const userEmail = user?.emailAddresses[0]?.emailAddress || 'email@example.com'

  // Load phone and contact count from local storage
  const loadPhoneFromStorage = useCallback(async () => {
    try {
      const phone = await AsyncStorage.getItem('userPhone')
      const verified = await AsyncStorage.getItem('phoneVerified')
      console.log('Phone:', phone)
      console.log('Phone Verified:', verified)

      if (phone) {
        setUserPhone(phone)
        setPhoneVerified(verified === 'true')
      }
    } catch (error) {
      console.error('Failed to load phone:', error)
    }
  }, [])

  // Fetch emergency contact count from backend
  const fetchContactCount = useCallback(async () => {
    try {
      const token = await getToken()
      const response = await fetch(`${API_URL}/api/emergency/list`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setContactCount(data.contacts?.length || 0)
      }
    } catch (error) {
      console.error('Failed to fetch contact count:', error)
      // Don't show error to user, just keep count at 0
    }
  }, [getToken])

  // Load on mount
  useEffect(() => {
    loadPhoneFromStorage()
    fetchContactCount()
  }, [loadPhoneFromStorage, fetchContactCount])

  // Refresh when screen comes into focus (when user navigates back)
  useFocusEffect(
    useCallback(() => {
      loadPhoneFromStorage()
      fetchContactCount()
    }, [loadPhoneFromStorage, fetchContactCount])
  )


  const handleSignOut = async () => {
    try {
      await signOut()
      router.replace('/(auth)/sign-in')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const menuItems = [
    {
      icon: 'call-outline',
      label: 'Phone Number',
      subtitle: userPhone
        ? `${userPhone}${phoneVerified ? ' ✓' : ' (Unverified)'}`
        : 'Add your phone number',
      route: '/(home)/phone',
      color: '#3B82F6',
    },
    {
      icon: 'people-outline',
      label: 'Emergency Contacts',
      subtitle: contactCount > 0
        ? `${contactCount} contact(s) added`
        : 'Manage your trusted contacts',
      route: '/(home)/emergency',
      color: '#EF4444',
    },
    {
      icon: 'shield-checkmark-outline',
      label: 'Privacy & Security',
      subtitle: 'Control your data and privacy',
      route: '/(home)/profile',
      color: '#10B981',
    },
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      subtitle: 'Manage alert preferences',
      route: '/(home)/profile',
      color: '#F59E0B',
    },
    {
      icon: 'location-outline',
      label: 'Location Settings',
      subtitle: 'Control location sharing',
      route: '/(home)/profile',
      color: '#8B5CF6',
    },
  ]

  return (
    <LinearGradient
      colors={['#FEFEFE', '#F5F3FF', '#FEFEFE']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
            <View style={styles.statusBadge}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            </View>
          </View>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>

          <Pressable style={styles.editProfileBtn}>
            <Ionicons name="create-outline" size={18} color="#9333EA" />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </Pressable>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <View style={[styles.statIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="shield-checkmark" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.statValue}>24/7</Text>
            <Text style={styles.statLabel}>Protected</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={[styles.statIconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="people" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>{contactCount}</Text>
            <Text style={styles.statLabel}>Contacts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={[styles.statIconCircle, phoneVerified ?
              { backgroundColor: '#DCFCE7' } : { backgroundColor: '#FEE2E2' }]}>
              <Ionicons
                name={phoneVerified ? "checkmark-circle" : "close-circle"}
                size={24}
                color={phoneVerified ? "#10B981" : "#EF4444"}
              />
            </View>
            <Text style={styles.statValue}>
              {phoneVerified ? '✓' : '✗'}
            </Text>
            <Text style={styles.statLabel}>Phone</Text>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          {menuItems.map((item, index) => (
            <Pressable
              key={index}
              style={styles.menuItem}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon as any} size={24} color={item.color} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </Pressable>
          ))}
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <Pressable style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: '#F5F3FF' }]}>
              <Ionicons name="information-circle-outline" size={24} color="#9333EA" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>About Angelix</Text>
              <Text style={styles.menuSubtitle}>Version 1.0.0</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </Pressable>

          <Pressable style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: '#F5F3FF' }]}>
              <Ionicons name="document-text-outline" size={24} color="#9333EA" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>Terms & Privacy</Text>
              <Text style={styles.menuSubtitle}>Legal information</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </Pressable>

          <Pressable style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: '#F5F3FF' }]}>
              <Ionicons name="help-circle-outline" size={24} color="#9333EA" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>Help & Support</Text>
              <Text style={styles.menuSubtitle}>Get assistance</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </Pressable>
        </View>

        {/* Sign Out Button */}
        <Pressable style={styles.signOutBtn} onPress={handleSignOut}>
          <LinearGradient
            colors={['#EF4444', '#DC2626']}
            style={styles.signOutGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="log-out-outline" size={24} color="#fff" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </LinearGradient>
        </Pressable>

        {/* Footer */}
        <Text style={styles.footer}>
          Made with 💜 for your safety
        </Text>
      </ScrollView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#9333EA',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9333EA',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    paddingLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  signOutBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  signOutGradient: {
    flexDirection: 'row',
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  signOutText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  footer: {
    textAlign: 'center',
    fontSize: 14,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
})
