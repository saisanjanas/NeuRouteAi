import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';

import { login } from '../services/api';
import { saveSession } from '../services/authStorage';
import { useLanguage } from '../context/LanguageContext';

export default function LoginScreen({ navigation }) {
  const { t } = useLanguage();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;

    setError(null);

    if (!username.trim() || !password) {
      setError('Please enter your username and password.');
      return;
    }

    setLoading(true);

    try {
      const { token, user } = await login(username.trim(), password);

      await saveSession(token, user);
      navigation.replace('Home');
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          t('auth.login_failed')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>

          {/* Logo */}
          <View style={styles.brandSection}>
            <Image
              source={require('../../assets/neu-route-ai-logo.jpeg')}
              style={styles.brandLogo}
              resizeMode="contain"
            />

            <Text style={styles.tagline}>
              Smarter routes. Safer journeys.
            </Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>

            <Text style={styles.title}>
              Welcome back
            </Text>

            <Text style={styles.subtitle}>
              Sign in to continue to your driver dashboard.
            </Text>

            {/* Username */}
            <Text style={styles.label}>
              Username
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>
                @
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                placeholderTextColor="#9CA3AF"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                returnKeyType="next"
              />
            </View>

            {/* Password */}
            <Text style={styles.label}>
              Password
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>
                ••
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
            </View>

            {/* Error */}
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorIcon}>
                  !
                </Text>

                <Text style={styles.errorText}>
                  {error}
                </Text>
              </View>
            )}

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                loading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerDot} />

            <Text style={styles.footerText}>
              Secure driver access
            </Text>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  keyboard: {
    flex: 1,
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  brandSection: {
    alignItems: 'center',
    marginBottom: 22,
  },

  brandLogo: {
    width: 310,
    height: 155,
    marginBottom: 0,
  },

  tagline: {
    marginTop: -4,
    fontSize: 13,
    color: '#64748B',
    letterSpacing: 0.2,
  },

  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 4,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },

  subtitle: {
    marginTop: 7,
    marginBottom: 24,
    fontSize: 13,
    lineHeight: 19,
    color: '#64748B',
  },

  label: {
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    marginBottom: 17,
    paddingHorizontal: 14,
  },

  inputIcon: {
    width: 25,
    fontSize: 16,
    fontWeight: '800',
    color: '#1D4ED8',
  },

  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#0F172A',
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 11,
    marginBottom: 16,
  },

  errorIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    textAlign: 'center',
    lineHeight: 22,
    backgroundColor: '#DC2626',
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    marginRight: 9,
  },

  errorText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: '#B91C1C',
  },

  loginButton: {
    height: 54,
    borderRadius: 15,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#1D4ED8',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  loginButtonDisabled: {
    opacity: 0.7,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },

  footerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 7,
  },

  footerText: {
    fontSize: 11,
    color: '#94A3B8',
  },

});