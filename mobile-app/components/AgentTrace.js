import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

export default function AgentTrace({ logs }) {
  if (!logs || logs.length === 0) return null;

  return (
    <View style={styles.container}>
      {logs.map((log, index) => (
        <View key={index} style={styles.logItem}>
          <View style={styles.dotContainer}>
            <View style={styles.dot} />
            {index < logs.length - 1 && <View style={styles.line} />}
          </View>
          <View style={styles.content}>
            <Text style={styles.stepText}>{log.step}</Text>
            <Text style={styles.detailsText}>
              {typeof log.details === 'object' ? JSON.stringify(log.details, null, 2) : log.details}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: 4,
  },
  logItem: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  dotContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#0EA5E9',
    marginTop: 4,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#334155',
    marginTop: 4,
    marginBottom: -4, // Connects to the next dot
  },
  content: {
    flex: 1,
    paddingBottom: 24,
  },
  stepText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  detailsText: {
    color: '#94A3B8',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: '#0B1120',
    padding: 12,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E293B',
    lineHeight: 18,
  },
});
