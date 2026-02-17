import { View, Text, StyleSheet, Pressable, ScrollView, Linking } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export default function HelpScreen() {
    const handleEmergencyCall = (number: string) => {
        Linking.openURL(`tel:${number}`)
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Ionicons name="help-circle" size={60} color="#9333EA" />
                    <Text style={styles.title}>Help & Resources</Text>
                    <Text style={styles.subtitle}>Safety information and support</Text>
                </View>

                {/* Emergency Contacts */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Emergency Hotlines</Text>

                    <Pressable
                        style={styles.hotlineCard}
                        onPress={() => handleEmergencyCall('112')}
                    >
                        <View style={styles.hotlineIcon}>
                            <Ionicons name="call" size={28} color="#fff" />
                        </View>
                        <View style={styles.hotlineInfo}>
                            <Text style={styles.hotlineName}>Emergency Services</Text>
                            <Text style={styles.hotlineNumber}>112</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
                    </Pressable>

                    <Pressable
                        style={styles.hotlineCard}
                        onPress={() => handleEmergencyCall('100')}
                    >
                        <View style={[styles.hotlineIcon, { backgroundColor: '#3B82F6' }]}>
                            <Ionicons name="shield" size={28} color="#fff" />
                        </View>
                        <View style={styles.hotlineInfo}>
                            <Text style={styles.hotlineName}>Police</Text>
                            <Text style={styles.hotlineNumber}>100</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
                    </Pressable>

                    <Pressable
                        style={styles.hotlineCard}
                        onPress={() => handleEmergencyCall('1091')}
                    >
                        <View style={[styles.hotlineIcon, { backgroundColor: '#EC4899' }]}>
                            <Ionicons name="woman" size={28} color="#fff" />
                        </View>
                        <View style={styles.hotlineInfo}>
                            <Text style={styles.hotlineName}>Women Helpline</Text>
                            <Text style={styles.hotlineNumber}>1091</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
                    </Pressable>
                </View>

                {/* Safety Tips */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Safety Tips</Text>

                    <View style={styles.tipCard}>
                        <Ionicons name="location" size={24} color="#9333EA" />
                        <View style={styles.tipContent}>
                            <Text style={styles.tipTitle}>Share Your Location</Text>
                            <Text style={styles.tipText}>
                                Always share your location with trusted contacts when traveling alone
                            </Text>
                        </View>
                    </View>

                    <View style={styles.tipCard}>
                        <Ionicons name="people" size={24} color="#9333EA" />
                        <View style={styles.tipContent}>
                            <Text style={styles.tipTitle}>Stay Connected</Text>
                            <Text style={styles.tipText}>
                                Keep your phone charged and maintain regular contact with friends/family
                            </Text>
                        </View>
                    </View>

                    <View style={styles.tipCard}>
                        <Ionicons name="eye" size={24} color="#9333EA" />
                        <View style={styles.tipContent}>
                            <Text style={styles.tipTitle}>Trust Your Instincts</Text>
                            <Text style={styles.tipText}>
                                If something feels wrong, remove yourself from the situation immediately
                            </Text>
                        </View>
                    </View>
                </View>

                {/* App Features */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>App Features</Text>

                    <View style={styles.featureCard}>
                        <Ionicons name="warning" size={20} color="#9333EA" />
                        <Text style={styles.featureText}>SOS Alert - Send emergency alerts instantly</Text>
                    </View>

                    <View style={styles.featureCard}>
                        <Ionicons name="mic" size={20} color="#9333EA" />
                        <Text style={styles.featureText}>Audio Recording - Record evidence discreetly</Text>
                    </View>

                    <View style={styles.featureCard}>
                        <Ionicons name="call" size={20} color="#9333EA" />
                        <Text style={styles.featureText}>Fake Call - Exit uncomfortable situations</Text>
                    </View>

                    <View style={styles.featureCard}>
                        <Ionicons name="navigate" size={20} color="#9333EA" />
                        <Text style={styles.featureText}>Route Tracking - Share your journey in real-time</Text>
                    </View>
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
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1E293B',
        marginTop: 16,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748B',
        marginTop: 8,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 16,
    },
    hotlineCard: {
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
    hotlineIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    hotlineInfo: {
        flex: 1,
    },
    hotlineName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
    },
    hotlineNumber: {
        fontSize: 20,
        fontWeight: '700',
        color: '#9333EA',
        marginTop: 2,
    },
    tipCard: {
        flexDirection: 'row',
        backgroundColor: '#F5F3FF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        gap: 12,
    },
    tipContent: {
        flex: 1,
    },
    tipTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 4,
    },
    tipText: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
    },
    featureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: 14,
        borderRadius: 10,
        marginBottom: 10,
        gap: 12,
    },
    featureText: {
        fontSize: 15,
        color: '#1E293B',
        flex: 1,
    },
})
