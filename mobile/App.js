import React, { useEffect } from 'react';
import { LanguageProvider } from './src/context/LanguageContext';
import { startAutoSync } from './src/services/offlineQueue';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  useEffect(() => {
    // Whenever connectivity is restored, flush anything queued while offline.
    const unsubscribe = startAutoSync();
    return unsubscribe;
  }, []);

  return (
    <LanguageProvider>
      <AppNavigator />
    </LanguageProvider>
  );
}
