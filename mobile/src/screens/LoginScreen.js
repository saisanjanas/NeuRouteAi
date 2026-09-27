import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { login } from '../services/api';
import { saveSession } from '../services/authStorage';
import { useLanguage } from '../context/LanguageContext';

export default function LoginScreen({ navigation }) {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setError(null);
    try {
      const { token, user } = await login(username, password);
      await saveSession(token, user);
      navigation.replace('Home');
    } catch (err) {
      setError(t('auth.login_failed'));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('auth.login')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('auth.username')}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder={t('auth.password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>{t('auth.login')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 },
  button: { backgroundColor: '#1f6feb', borderRadius: 8, padding: 14, marginTop: 8 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  error: { color: '#d33', marginBottom: 12 },
});
