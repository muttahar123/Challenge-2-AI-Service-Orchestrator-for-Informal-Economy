import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import axios from 'axios';
import AgentTrace from '../components/AgentTrace';

// Get the correct localhost IP depending on the platform (Android Emulator uses 10.0.2.2)
const BACKEND_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000/api/request' : 'http://localhost:3000/api/request'; 

export default function HomeScreen({ onRequestProcessed }) {
  const [inputText, setInputText] = useState('Mujhe kal subah G-13 mein AC technician chahiye');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError('');

    try {
      // In a real device you would replace localhost with your machine's IP address
      const response = await axios.post(BACKEND_URL, { userInput: inputText });
      onRequestProcessed(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to process request. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Antigravity Service Orchestrator</Text>
          <Text style={styles.subtitle}>AI-Powered Informal Economy Matching</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Describe your need (Urdu/English):</Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={4}
            value={inputText}
            onChangeText={setInputText}
            placeholder="e.g. Plumber needed in F-8 today evening"
            placeholderTextColor="#888"
          />
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Find Provider</Text>
            )}
          </TouchableOpacity>
        </View>
        
        {loading && (
          <View style={styles.loadingTraceContainer}>
            <Text style={styles.loadingText}>Agents are reasoning...</Text>
            <AgentTrace logs={[{ step: 'START', details: 'Initializing agent workflow...' }]} />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Dark modern blue
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#38BDF8', // Light blue
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
  },
  inputContainer: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  label: {
    fontSize: 16,
    color: '#E2E8F0',
    marginBottom: 12,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#0284C7',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#475569',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingTraceContainer: {
    marginTop: 32,
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  loadingText: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  }
});
