import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AgentTrace from '../components/AgentTrace';

export default function ResultScreen({ resultData, onBack }) {
  if (!resultData) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orchestration Complete</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Request Understood</Text>
        <Text style={styles.text}>Service: <Text style={styles.highlight}>{resultData.serviceRequest}</Text></Text>
        <Text style={styles.text}>Location: <Text style={styles.highlight}>{resultData.location}</Text></Text>
        <Text style={styles.text}>Time: <Text style={styles.highlight}>{resultData.time}</Text></Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Agent Decision</Text>
        <Text style={styles.text}>Recommended Provider: <Text style={styles.highlight}>{resultData.recommendedProvider}</Text></Text>
        <Text style={styles.text}>Reasoning: {resultData.reasoning}</Text>
      </View>

      {resultData.simulatedBooking && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Simulated Booking</Text>
          <Text style={styles.text}>Status: <Text style={{color: '#4caf50', fontWeight:'bold'}}>{resultData.simulatedBooking.status}</Text></Text>
          <Text style={styles.text}>Booking ID: {resultData.simulatedBooking.bookingId}</Text>
          <Text style={styles.text}>Message: {resultData.simulatedBooking.message}</Text>
        </View>
      )}

      {resultData.followUp && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Follow-up Automated</Text>
          <Text style={styles.text}>Mode: {resultData.followUp.statusUpdateMode}</Text>
          <Text style={styles.text}>Reminder: {resultData.followUp.reminderScheduled}</Text>
        </View>
      )}

      <View style={styles.traceContainer}>
        <Text style={styles.sectionTitle}>Agent Trace Logs</Text>
        <AgentTrace logs={resultData.traceLogs} />
      </View>

      <TouchableOpacity style={styles.button} onPress={onBack}>
        <Text style={styles.buttonText}>Start New Request</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 24,
  },
  header: {
    marginBottom: 24,
    marginTop: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#38BDF8',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0284C7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  text: {
    color: '#94A3B8',
    fontSize: 15,
    marginBottom: 6,
    lineHeight: 24,
  },
  highlight: {
    color: '#38BDF8',
    fontWeight: '600',
  },
  traceContainer: {
    marginTop: 16,
    marginBottom: 32,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  button: {
    backgroundColor: '#0284C7',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
