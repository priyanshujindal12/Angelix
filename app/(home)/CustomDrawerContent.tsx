import { View, Text, Image, Pressable, StyleSheet, ScrollView } from 'react-native'
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer'
import { useUser, useAuth } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

export default function CustomDrawerContent(props: any) {
    const { user } = useUser()
    const { signOut } = useAuth()
    const router = useRouter()

    const avatarUri =
        user?.imageUrl ||
        'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'

    const userName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'User'
    const userPhone = user?.phoneNumbers?.length ? user.phoneNumbers[0].phoneNumber : 'Add phone number'

    const menuItems = [
        { icon: 'document-text-outline', label: 'SOS History', route: '/(home)/profile' },
        { icon: 'people-outline', label: 'Friends', route: '/(home)/profile' },
        { icon: 'document-outline', label: 'Legal', route: '/(home)/profile' },
        { icon: 'chatbox-outline', label: 'Feedback', route: '/(home)/profile' },
        { icon: 'help-circle-outline', label: 'Help', route: '/(home)/profile' },
        { icon: 'call-outline', label: 'Helpline', route: '/(home)/profile' },
        { icon: 'settings-outline', label: 'Settings', route: '/(home)/profile' },
        { icon: 'share-social-outline', label: 'Share App', route: '/(home)/profile' },
        { icon: 'information-circle-outline', label: 'Help Tour', route: '/(home)/profile' },
    ]

    const handleSignOut = async () => {
        try {
            await signOut()
            router.replace('/(auth)/sign-in')
        } catch (error) {
            console.error('Sign out error:', error)
        }
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>I'M SAFE</Text>
                <Pressable onPress={() => props.navigation.closeDrawer()}>
                    <Ionicons name="close-circle" size={32} color="#fff" />
                </Pressable>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* User Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <Image source={{ uri: avatarUri }} style={styles.avatar} />
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{userName}</Text>
                        <Text style={styles.userPhone}>{userPhone}</Text>
                    </View>
                    <Pressable onPress={() => router.push('/(home)/profile')}>
                        <Ionicons name="create-outline" size={24} color="#64748B" />
                    </Pressable>
                </View>

                {/* Menu Grid */}
                <View style={styles.menuGrid}>
                    {menuItems.map((item, index) => (
                        <Pressable
                            key={index}
                            style={styles.menuItem}
                            onPress={() => {
                                // TODO: Navigate to respective screens
                                console.log(`Navigate to ${item.label}`)
                            }}
                        >
                            <Ionicons name={item.icon as any} size={28} color="#9333EA" />
                            <Text style={styles.menuLabel}>{item.label}</Text>
                        </Pressable>
                    ))}
                </View>

                {/* Log Out Button */}
                <Pressable style={styles.logoutButton} onPress={handleSignOut}>
                    <Ionicons name="log-out-outline" size={24} color="#9333EA" />
                    <Text style={styles.logoutText}>Log Out</Text>
                </Pressable>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F3FF',
    },
    header: {
        backgroundColor: '#9333EA',
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 1,
    },
    content: {
        flex: 1,
    },
    profileCard: {
        backgroundColor: '#fff',
        margin: 16,
        padding: 16,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#9333EA',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    userInfo: {
        flex: 1,
        marginLeft: 12,
    },
    userName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
    },
    userPhone: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 2,
    },
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 12,
        gap: 12,
    },
    menuItem: {
        width: '30%',
        backgroundColor: '#fff',
        aspectRatio: 1,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    menuLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1E293B',
        marginTop: 8,
        textAlign: 'center',
    },
    logoutButton: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        margin: 16,
        marginTop: 20,
        padding: 16,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#9333EA',
    },
})
