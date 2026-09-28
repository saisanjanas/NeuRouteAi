import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';

import { SUPPORTED_LANGUAGES } from '../i18n';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSelectScreen({ navigation }) {
  const {
    languageCode,
    changeLanguage,
    t,
  } = useLanguage();

  const handleSelect = async (code) => {
    await changeLanguage(code);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F5F8FC"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>

          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={styles.backArrow}>‹</Text>
            </TouchableOpacity>

            <View style={styles.headerText}>
              <Text style={styles.brand}>
                NEU ROUTE AI
              </Text>

              <Text style={styles.title}>
                Language
              </Text>

              <Text style={styles.subtitle}>
                Choose your preferred application language
              </Text>
            </View>
          </View>

          {/* LANGUAGE INFO */}
          <View style={styles.infoCard}>
            <View style={styles.languageIcon}>
              <Text style={styles.languageSymbol}>
                文
              </Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                Application Language
              </Text>

              <Text style={styles.infoText}>
                Your selection will be used throughout the driver application.
              </Text>
            </View>
          </View>

          {/* OPTIONS */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Available Languages
            </Text>

            <Text style={styles.sectionHint}>
              {SUPPORTED_LANGUAGES.length} options
            </Text>
          </View>

          <View style={styles.optionsCard}>
            {SUPPORTED_LANGUAGES.map((lang, index) => {
              const selected = languageCode === lang.code;

              return (
                <React.Fragment key={lang.code}>
                  <TouchableOpacity
                    style={[
                      styles.option,
                      selected && styles.optionActive,
                    ]}
                    onPress={() => handleSelect(lang.code)}
                    activeOpacity={0.85}
                  >
                    <View
                      style={[
                        styles.optionIcon,
                        selected && styles.optionIconActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionIconText,
                          selected && styles.optionIconTextActive,
                        ]}
                      >
                        {lang.label.charAt(0)}
                      </Text>
                    </View>

                    <View style={styles.optionContent}>
                      <Text
                        style={[
                          styles.optionText,
                          selected && styles.optionTextActive,
                        ]}
                      >
                        {lang.label}
                      </Text>

                      <Text style={styles.optionCode}>
                        {lang.code.toUpperCase()}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.radio,
                        selected && styles.radioActive,
                      ]}
                    >
                      {selected && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                  </TouchableOpacity>

                  {index < SUPPORTED_LANGUAGES.length - 1 && (
                    <View style={styles.optionDivider} />
                  )}
                </React.Fragment>
              );
            })}
          </View>

          {/* CURRENT */}
          <View style={styles.currentCard}>
            <View style={styles.currentDot} />

            <View style={styles.currentContent}>
              <Text style={styles.currentTitle}>
                Current language
              </Text>

              <Text style={styles.currentText}>
                {SUPPORTED_LANGUAGES.find(
                  (lang) => lang.code === languageCode
                )?.label || languageCode}
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerLine} />

            <Text style={styles.footerBrand}>
              NEU ROUTE AI
            </Text>

            <Text style={styles.footerText}>
              Driver Safety & Logistics
            </Text>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F8FC',
  },

  scrollContent: {
    flexGrow: 1,
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },

  /* HEADER */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  backArrow: {
    fontSize: 31,
    lineHeight: 34,
    color: '#0F172A',
    marginTop: -3,
  },

  headerText: {
    flex: 1,
  },

  brand: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#1D4ED8',
    marginBottom: 4,
  },

  title: {
    fontSize: 27,
    fontWeight: '900',
    color: '#0F172A',
  },

  subtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#64748B',
  },

  /* INFO */

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 15,
    marginBottom: 23,
  },

  languageIcon: {
    width: 47,
    height: 47,
    borderRadius: 15,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  languageSymbol: {
    fontSize: 21,
    fontWeight: '900',
    color: '#1D4ED8',
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
  },

  infoText: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 15,
    color: '#64748B',
  },

  /* SECTION */

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 11,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },

  sectionHint: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },

  /* OPTIONS */

  optionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    elevation: 3,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  option: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    paddingHorizontal: 7,
  },

  optionActive: {
    backgroundColor: '#EFF6FF',
  },

  optionIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  optionIconActive: {
    backgroundColor: '#DBEAFE',
  },

  optionIconText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#64748B',
  },

  optionIconTextActive: {
    color: '#1D4ED8',
  },

  optionContent: {
    flex: 1,
  },

  optionText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
  },

  optionTextActive: {
    color: '#1D4ED8',
    fontWeight: '900',
  },

  optionCode: {
    marginTop: 3,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#94A3B8',
  },

  optionDivider: {
    height: 1,
    backgroundColor: '#EEF2F6',
    marginHorizontal: 7,
  },

  radio: {
    width: 23,
    height: 23,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  radioActive: {
    borderColor: '#2563EB',
  },

  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#2563EB',
  },

  /* CURRENT */

  currentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 17,
    padding: 13,
    marginTop: 16,
  },

  currentDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    marginRight: 10,
  },

  currentContent: {
    flex: 1,
  },

  currentTitle: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.7,
    color: '#15803D',
  },

  currentText: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '800',
    color: '#166534',
  },

  /* FOOTER */

  footer: {
    alignItems: 'center',
    marginTop: 28,
  },

  footerLine: {
    width: 35,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginBottom: 8,
  },

  footerBrand: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#94A3B8',
  },

  footerText: {
    marginTop: 3,
    fontSize: 9,
    color: '#B0BAC8',
  },
});