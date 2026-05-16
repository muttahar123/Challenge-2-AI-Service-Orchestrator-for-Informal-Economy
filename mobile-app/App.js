import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import ResultScreen from './src/screens/ResultScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [resultData, setResultData] = useState(null);

  const handleRequestProcessed = (data) => {
    setResultData(data);
    setCurrentScreen('Result');
  };

  const handleBackToHome = () => {
    setResultData(null);
    setCurrentScreen('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1D" />
      {currentScreen === 'Home' ? (
        <HomeScreen onRequestProcessed={handleRequestProcessed} />
      ) : (
        <ResultScreen resultData={resultData} onBack={handleBackToHome} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1D',
  },
});
