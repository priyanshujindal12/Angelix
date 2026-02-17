import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AngelixHeader = () => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="shield-checkmark" size={28} color="#9333EA" />
      </View>
      <Text style={styles.headerTitle}>Angelix</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // Let React Navigation handle most padding/height — we just center content
    height: Platform.OS === 'ios' ? 44 : 56, // approximate default header heights
    minWidth: 140, // prevent squishing on small titles
  },
  iconContainer: {
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    padding: 6,
    marginRight: 10,
    // subtle shadow for depth
    ...Platform.select({
      ios: {
        shadowColor: '#9333EA',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: 22,           // slightly larger for better visibility
    color: '#9333EA',
    letterSpacing: 0.4,
    // Ensure text doesn't get cut off
    flexShrink: 1,
  },
});

export default AngelixHeader;