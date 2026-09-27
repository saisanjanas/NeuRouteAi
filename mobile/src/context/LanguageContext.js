import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translate } from '../i18n';

const LANGUAGE_STORAGE_KEY = '@neu_route_ai/language_preference';
const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [languageCode, setLanguageCode] = useState('en');

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((saved) => {
      if (saved) setLanguageCode(saved);
    });
  }, []);

  const changeLanguage = async (code) => {
    setLanguageCode(code);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    // TODO (integration point): also PATCH users.language_preference on the
    // backend so notification templates use the same preference server-side.
  };

  const t = (key) => translate(languageCode, key);

  return (
    <LanguageContext.Provider value={{ languageCode, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
