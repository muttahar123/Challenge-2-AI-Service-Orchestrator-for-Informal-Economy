import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

const renderDetails = (step, details) => {
  if (typeof details !== 'object' || details === null) {
    if (step === 'ERROR') {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {details}</Text>
        </View>
      );
    }
    if (step === 'EDGE_AI_FALLBACK') {
      return (
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackText}>{details}</Text>
        </View>
      );
    }
    return <Text style={styles.normalText}>{details}</Text>;
  }

  switch (step) {
    case 'INTENT_UNDERSTANDING':
      return (
        <View style={styles.detailsCard}>
          <Text style={styles.detailRow}>🛠️ <Text style={styles.boldLabel}>Service:</Text> {details.serviceType}</Text>
          <Text style={styles.detailRow}>📍 <Text style={styles.boldLabel}>Location:</Text> {details.location}</Text>
          <Text style={styles.detailRow}>⏰ <Text style={styles.boldLabel}>Time:</Text> {details.time}</Text>
        </View>
      );
    case 'PROVIDER_DISCOVERY':
      return (
        <View style={styles.detailsCard}>
          <Text style={styles.discoveryHeader}>
            🔍 Found <Text style={styles.highlightText}>{details.candidatesFound}</Text> eligible providers nearby:
          </Text>
          {details.candidates && details.candidates.map((c, i) => (
            <View key={i} style={styles.candidateRow}>
              <Text style={styles.candidateName}>👤 {c.name}</Text>
              <Text style={styles.candidateMeta}>
                ⭐ {c.rating}  •  📍 {c.location} ({c.distance_km} km away)  •  {c.available ? '🟢 Active' : '🔴 Busy'}
              </Text>
            </View>
          ))}
        </View>
      );
    case 'MATCHING_AND_RANKING':
      const p = details.recommendedProvider;
      return (
        <View style={styles.detailsCard}>
          <Text style={styles.decisionTitle}>🏆 Best Match Selected:</Text>
          {p && (
            <View style={styles.selectedProviderCard}>
              <Text style={styles.providerName}>{p.name}</Text>
              <Text style={styles.providerMeta}>⭐ {p.rating}  •  {p.distance_km} km away</Text>
            </View>
          )}
          <Text style={styles.reasoningText}>💡 {details.reasoning}</Text>
        </View>
      );
    case 'ACTION_SIMULATION':
      return (
        <View style={styles.detailsCard}>
          <View style={styles.bookingBadge}>
            <Text style={styles.bookingStatusText}>🟢 {details.status}</Text>
          </View>
          <Text style={styles.detailRow}>🔑 <Text style={styles.boldLabel}>Booking ID:</Text> {details.bookingId}</Text>
          <Text style={styles.detailRow}>👤 <Text style={styles.boldLabel}>Assigned:</Text> {details.providerAssigned}</Text>
          <Text style={styles.detailRow}>⏰ <Text style={styles.boldLabel}>Slot Time:</Text> {details.slotBooked || 'As scheduled'}</Text>
          <Text style={styles.detailRow}>💬 <Text style={styles.boldLabel}>Message:</Text> {details.message}</Text>
        </View>
      );
    case 'FOLLOW_UP_AUTOMATION':
      return (
        <View style={styles.detailsCard}>
          <Text style={styles.detailRow}>📱 <Text style={styles.boldLabel}>Update Channel:</Text> {details.statusUpdateMode}</Text>
          <Text style={styles.detailRow}>🔔 <Text style={styles.boldLabel}>Alert Scheduled:</Text> {details.reminderScheduled}</Text>
          {details.completionSurvey && (
            <Text style={styles.detailRow}>📋 <Text style={styles.boldLabel}>Follow-up:</Text> {details.completionSurvey}</Text>
          )}
        </View>
      );
    default:
      return <Text style={styles.detailsText}>{JSON.stringify(details, null, 2)}</Text>;
  }
};

export default function AgentTrace({ logs }) {
  if (!logs || logs.length === 0) return null;

  const getStepTitle = (step) => {
    switch (step) {
      case 'START': return '🚀 Request Received';
      case 'INTENT_UNDERSTANDING': return '🧠 Parsing User Intent';
      case 'PROVIDER_DISCOVERY': return '🔎 Service Provider Discovery';
      case 'MATCHING_AND_RANKING': return '🤖 Matchmaking & Ranking';
      case 'ACTION_SIMULATION': return '⚡ Booking Orchestration';
      case 'FOLLOW_UP_AUTOMATION': return '📨 Automated Workflows';
      case 'EDGE_AI_FALLBACK': return '🛡️ Edge-AI Backup Activated';
      case 'END': return '🏁 Session Complete';
      default: return step;
    }
  };

  return (
    <View style={styles.container}>
      {logs.map((log, index) => (
        <View key={index} style={styles.logItem}>
          <View style={styles.dotContainer}>
            <View style={[
              styles.dot, 
              log.step === 'ERROR' && styles.errorDot, 
              log.step === 'EDGE_AI_FALLBACK' && styles.fallbackDot, 
              log.step === 'END' && styles.endDot
            ]} />
            {index < logs.length - 1 && <View style={styles.line} />}
          </View>
          <View style={styles.content}>
            <Text style={[
              styles.stepText, 
              log.step === 'ERROR' && styles.errorStepText,
              log.step === 'EDGE_AI_FALLBACK' && styles.fallbackStepText
            ]}>
              {getStepTitle(log.step)}
            </Text>
            <View style={styles.detailsWrapper}>
              {renderDetails(log.step, log.details)}
            </View>
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
  errorDot: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  endDot: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
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
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  errorStepText: {
    color: '#F87171',
  },
  detailsWrapper: {
    marginTop: 4,
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
  errorContainer: {
    padding: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  errorText: {
    color: '#F87171',
    fontSize: 13,
    lineHeight: 18,
  },
  normalText: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 20,
    paddingLeft: 4,
  },
  detailsCard: {
    backgroundColor: '#0B1120',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  detailRow: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  boldLabel: {
    color: '#E2E8F0',
    fontWeight: '600',
  },
  discoveryHeader: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 20,
  },
  highlightText: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  candidateRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    marginBottom: 2,
  },
  candidateName: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  candidateMeta: {
    color: '#64748B',
    fontSize: 12,
  },
  decisionTitle: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  selectedProviderCard: {
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    marginBottom: 12,
  },
  providerName: {
    color: '#38BDF8',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  providerMeta: {
    color: '#94A3B8',
    fontSize: 12,
  },
  reasoningText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  bookingBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginBottom: 12,
  },
  bookingStatusText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '700',
  },
  fallbackDot: {
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
  },
  fallbackStepText: {
    color: '#F59E0B',
  },
  fallbackContainer: {
    padding: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  fallbackText: {
    color: '#F59E0B',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
});
