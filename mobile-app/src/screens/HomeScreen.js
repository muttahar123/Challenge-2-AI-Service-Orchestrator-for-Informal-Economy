import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import axios from 'axios';
import AgentTrace from '../components/AgentTrace';

// Change this to your local IP or backend URL
const BACKEND_URL = 'http://localhost:3000/api/request'; 

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
    backgroundColor: '#1A1A1D',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#C3073F',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#950740',
    textAlign: 'center',
  },
  inputContainer: {
    backgroundColor: '#26262B',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  label: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 10,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#1A1A1D',
    color: '#FFF',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#4E4E50',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#C3073F',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#6F2232',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff4444',
    marginBottom: 15,
    textAlign: 'center',
  },
  loadingTraceContainer: {
    marginTop: 30,
  },
  loadingText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  }
});
