import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SUPPORTED_LANGUAGES } from '../i18n';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSelectScreen({ navigation }) {
  const { languageCode, changeLanguage, t } = useLanguage();

  const handleSelect = async (code) => {
    await changeLanguage(code);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('language.select')}</Text>
      {SUPPORTED_LANGUAGES.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          style={[styles.option, languageCode === lang.code && styles.optionActive]}
          onPress={() => handleSelect(lang.code)}
        >
          <Text style={styles.optionText}>{lang.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 48 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 20 },
  option: { padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', marginBottom: 10 },
  optionActive: { borderColor: '#1f6feb', backgroundColor: '#eaf1ff' },
  optionText: { fontSize: 16 },
});
