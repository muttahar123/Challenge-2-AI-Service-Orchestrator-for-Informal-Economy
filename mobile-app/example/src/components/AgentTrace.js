import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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
    paddingLeft: 10,
  },
  logItem: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  dotContainer: {
    alignItems: 'center',
    marginRight: 15,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#C3073F',
    marginTop: 4,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#4E4E50',
    marginTop: 4,
    marginBottom: -4, // Connects to the next dot
  },
  content: {
    flex: 1,
    paddingBottom: 20,
  },
  stepText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  detailsText: {
    color: '#AAA',
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#1E1E22',
    padding: 8,
    borderRadius: 5,
    overflow: 'hidden',
  },
});
