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
    backgroundColor: '#1A1A1D',
    padding: 20,
  },
  header: {
    marginBottom: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#C3073F',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#26262B',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#C3073F',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  text: {
    color: '#DDD',
    fontSize: 15,
    marginBottom: 5,
    lineHeight: 22,
  },
  highlight: {
    color: '#950740',
    fontWeight: 'bold',
  },
  traceContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4E4E50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 40,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
