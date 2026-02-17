import { View, Text, StyleSheet, Pressable, ScrollView, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'

export default function FakeCallScreen() {
    const [selectedDelay, setSelectedDelay] = useState(10)
    const [isScheduled, setIsScheduled] = useState(false)

    const delays = [
        { label: '10 sec', value: 10 },
        { label: '30 sec', value: 30 },
        { label: '1 min', value: 60 },
        { label: '2 min', value: 120 },
    ]

    const handleScheduleCall = () => {
        setIsScheduled(true)
        // TODO: Implement fake call scheduling logic
        setTimeout(() => {
            setIsScheduled(false)
            // TODO: Show fake call screen
            console.log('Showing fake call')
        }, selectedDelay * 1000)
    }

    const handleCancelCall = () => {
        setIsScheduled(false)
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Ionicons name="call" size={60} color="#9333EA" />
                    <Text style={styles.title}>Fake Call</Text>
                    <Text style={styles.subtitle}>Escape uncomfortable situations discreetly</Text>
                </View>

                {/* Delay Selection */}
                {!isScheduled && (
                    <>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Select Call Delay</Text>
                            <View style={styles.delayContainer}>
                                {delays.map((delay) => (
                                    <Pressable
                                        key={delay.value}
                                        style={[
                                            styles.delayButton,
                                            selectedDelay === delay.value && styles.delayButtonActive,
                                        ]}
                                        onPress={() => setSelectedDelay(delay.value)}
                                    >
                                        <Text
                                            style={[
                                                styles.delayText,
                                                selectedDelay === delay.value && styles.delayTextActive,
                                            ]}
                                        >
                                            {delay.label}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        {/* Schedule Button */}
                        <Pressable style={styles.scheduleButton} onPress={handleScheduleCall}>
                            <Ionicons name="call" size={24} color="#fff" />
                            <Text style={styles.scheduleButtonText}>Schedule Fake Call</Text>
                        </Pressable>
                    </>
                )}

                {/* Scheduled State */}
                {isScheduled && (
                    <View style={styles.scheduledContainer}>
                        <View style={styles.scheduledIcon}>
                            <Ionicons name="time" size={48} color="#9333EA" />
                        </View>
                        <Text style={styles.scheduledTitle}>Call Scheduled</Text>
                        <Text style={styles.scheduledText}>
                            You will receive a fake call in {selectedDelay} seconds
                        </Text>

                        <Pressable style={styles.cancelButton} onPress={handleCancelCall}>
                            <Text style={styles.cancelButtonText}>Cancel Call</Text>
                        </Pressable>
                    </View>
                )}

                {/* Info Section */}
                <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>How it works</Text>

                    <View style={styles.infoItem}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepText}>1</Text>
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoStepTitle}>Choose Delay</Text>
                            <Text style={styles.infoStepText}>
                                Select when you want to receive the fake call
                            </Text>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepText}>2</Text>
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoStepTitle}>Schedule Call</Text>
                            <Text style={styles.infoStepText}>
                                The app will simulate an incoming call at the specified time
                            </Text>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepText}>3</Text>
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoStepTitle}>Exit Situation</Text>
                            <Text style={styles.infoStepText}>
                                Use the fake call as an excuse to leave uncomfortable situations
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Customization Tip */}
                <View style={styles.tipCard}>
                    <Ionicons name="bulb" size={24} color="#F59E0B" />
                    <View style={styles.tipContent}>
                        <Text style={styles.tipTitle}>Pro Tip</Text>
                        <Text style={styles.tipText}>
                            Customize caller name and ringtone in settings to make it more convincing
                        </Text>
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
        textAlign: 'center',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 16,
    },
    delayContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    delayButton: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        borderWidth: 2,
        borderColor: '#E2E8F0',
        alignItems: 'center',
    },
    delayButtonActive: {
        backgroundColor: '#F5F3FF',
        borderColor: '#9333EA',
    },
    delayText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748B',
    },
    delayTextActive: {
        color: '#9333EA',
    },
    scheduleButton: {
        flexDirection: 'row',
        backgroundColor: '#9333EA',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 32,
        shadowColor: '#9333EA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    scheduleButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    scheduledContainer: {
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#F5F3FF',
        borderRadius: 16,
        marginBottom: 32,
    },
    scheduledIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    scheduledTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 8,
    },
    scheduledText: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 24,
    },
    cancelButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#EF4444',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#EF4444',
    },
    infoSection: {
        marginBottom: 24,
    },
    infoTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 20,
    },
    infoItem: {
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'flex-start',
    },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#9333EA',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    stepText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    infoContent: {
        flex: 1,
    },
    infoStepTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 4,
    },
    infoStepText: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
    },
    tipCard: {
        flexDirection: 'row',
        backgroundColor: '#FEF3C7',
        padding: 16,
        borderRadius: 12,
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
})
