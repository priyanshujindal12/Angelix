import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

export default function SOSScreen() {
    const handleEmergencySOS = () => {
        Alert.alert(
            '🚨 Emergency SOS',
            'This will alert your emergency contacts and share your location. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Send SOS',
                    style: 'destructive',
                    onPress: () => {
                        // TODO: Implement SOS alert logic
                        console.log('SOS activated')
                    }
                },
            ]
        )
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Emergency SOS</Text>
                    <Text style={styles.subtitle}>Quick access in dangerous situations</Text>
                </View>

                {/* Main SOS Button */}
                <View style={styles.sosContainer}>
                    <Pressable onPress={handleEmergencySOS}>
                        <LinearGradient
                            colors={['#EF4444', '#DC2626', '#B91C1C']}
                            style={styles.sosButton}
                        >
                            <Ionicons name="warning" size={80} color="#fff" />
                            <Text style={styles.sosText}>SOS</Text>
                            <Text style={styles.sosSubtext}>Tap to alert</Text>
                        </LinearGradient>
                    </Pressable>
                </View>

                {/* Info Section */}
                <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>What happens when you tap SOS?</Text>

                    <View style={styles.infoItem}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="location" size={24} color="#9333EA" />
                        </View>
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoItemTitle}>Location Sharing</Text>
                            <Text style={styles.infoItemText}>Your real-time location is shared with emergency contacts</Text>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="people" size={24} color="#9333EA" />
                        </View>
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoItemTitle}>Alert Contacts</Text>
                            <Text style={styles.infoItemText}>All emergency contacts receive immediate notification</Text>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="call" size={24} color="#9333EA" />
                        </View>
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoItemTitle}>Emergency Services</Text>
                            <Text style={styles.infoItemText}>Option to directly call local emergency number</Text>
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <Text style={styles.quickActionsTitle}>Quick Actions</Text>

                    <Pressable style={styles.actionButton}>
                        <Ionicons name="call-outline" size={24} color="#1E293B" />
                        <Text style={styles.actionText}>Call Emergency Services</Text>
                    </Pressable>

                    <Pressable style={styles.actionButton}>
                        <Ionicons name="people-outline" size={24} color="#1E293B" />
                        <Text style={styles.actionText}>View Emergency Contacts</Text>
                    </Pressable>

                    <Pressable style={styles.actionButton}>
                        <Ionicons name="share-outline" size={24} color="#1E293B" />
                        <Text style={styles.actionText}>Share Location</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FEFEFE',
    },
    content: {
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1E293B',
    },
    subtitle: {
        fontSize: 16,
        color: '#64748B',
        marginTop: 8,
    },
    sosContainer: {
        alignItems: 'center',
        marginVertical: 32,
    },
    sosButton: {
        width: 200,
        height: 200,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
    sosText: {
        fontSize: 36,
        fontWeight: '900',
        color: '#fff',
        marginTop: 8,
    },
    sosSubtext: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
    },
    infoSection: {
        marginTop: 24,
        marginBottom: 32,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 16,
    },
    infoItem: {
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'flex-start',
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F5F3FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoItemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 4,
    },
    infoItemText: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
    },
    quickActions: {
        marginTop: 16,
    },
    quickActionsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        gap: 12,
    },
    actionText: {
        fontSize: 16,
        color: '#1E293B',
        fontWeight: '500',
    },
})
