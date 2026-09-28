import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';

import Geolocation from 'react-native-geolocation-service';
import { submitHazardReport } from '../services/api';
import { enqueue } from '../services/offlineQueue';
import { useLanguage } from '../context/LanguageContext';

const HAZARD_TYPES = [
  'landslide',
  'flooding',
  'road_damage',
  'fallen_tree',
  'other',
];

const HAZARD_LABELS = {
  landslide: 'Landslide',
  flooding: 'Flooding',
  road_damage: 'Road Damage',
  fallen_tree: 'Fallen Tree',
  other: 'Other',
};

export default function HazardReportScreen({ navigation }) {
  const { t } = useLanguage();

  const [hazardType, setHazardType] = useState(HAZARD_TYPES[0]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getPosition = () =>
    new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });

  const handleSubmit = async () => {
    if (submitting) return;

    setSubmitting(true);

    try {
      const position = await getPosition();

      const payload = {
        hazard_type: hazardType,
        description: description.trim(),
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      try {
        await submitHazardReport(payload);

        Alert.alert(
          'Report Submitted',
          'Your hazard report was successfully submitted.'
        );
      } catch (apiErr) {
        await enqueue('report', payload);

        Alert.alert(
          'Saved Offline',
          'No connection was available. Your report has been saved and will be uploaded automatically.'
        );
      }

      setDescription('');
    } catch (locErr) {
      Alert.alert(
        'Location Required',
        'Could not get your GPS location. Please enable location services and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F5F8FC"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
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
                Report Hazard
              </Text>

              <Text style={styles.subtitle}>
                Help keep roads and drivers safe
              </Text>
            </View>
          </View>

          {/* INFO CARD */}
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Text style={styles.infoIconText}>!</Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                Safety Report
              </Text>

              <Text style={styles.infoText}>
                Your current GPS location will be attached to this report.
              </Text>
            </View>
          </View>

          {/* HAZARD TYPE */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Hazard Type
            </Text>

            <Text style={styles.sectionHint}>
              Select the issue you found
            </Text>

            <View style={styles.typeGrid}>
              {HAZARD_TYPES.map((type) => {
                const selected = hazardType === type;

                return (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeCard,
                      selected && styles.typeCardActive,
                    ]}
                    onPress={() => setHazardType(type)}
                    activeOpacity={0.85}
                  >
                    <View
                      style={[
                        styles.typeIndicator,
                        selected && styles.typeIndicatorActive,
                      ]}
                    >
                      {selected && (
                        <Text style={styles.checkMark}>
                          ✓
                        </Text>
                      )}
                    </View>

                    <Text
                      style={[
                        styles.typeText,
                        selected && styles.typeTextActive,
                      ]}
                    >
                      {HAZARD_LABELS[type]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* DESCRIPTION */}
          <View style={styles.section}>
            <View style={styles.descriptionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  Description
                </Text>

                <Text style={styles.sectionHint}>
                  Add useful details about the hazard
                </Text>
              </View>

              <Text style={styles.optional}>
                OPTIONAL
              </Text>
            </View>

            <TextInput
              style={styles.textArea}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              placeholder="Example: Large pothole blocking the left side of the road..."
              placeholderTextColor="#94A3B8"
              textAlignVertical="top"
              editable={!submitting}
              maxLength={500}
            />

            <Text style={styles.characterCount}>
              {description.length}/500
            </Text>
          </View>

          {/* LOCATION */}
          <View style={styles.locationCard}>
            <View style={styles.locationIcon}>
              <Text style={styles.locationIconText}>
                ●
              </Text>
            </View>

            <View style={styles.locationContent}>
              <Text style={styles.locationTitle}>
                GPS Location
              </Text>

              <Text style={styles.locationText}>
                Your current coordinates will be captured automatically.
              </Text>
            </View>

            <View style={styles.locationStatus}>
              <View style={styles.greenDot} />

              <Text style={styles.locationStatusText}>
                READY
              </Text>
            </View>
          </View>

          {/* SUBMIT */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              submitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.submitIcon}>
                  ↑
                </Text>

                <Text style={styles.submitText}>
                  Submit Hazard Report
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Reports can be saved offline when connectivity is unavailable.
          </Text>

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
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 20,
    padding: 15,
    marginBottom: 22,
  },

  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  infoIconText: {
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
    color: '#1E3A8A',
  },

  infoText: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: '#3B82F6',
  },

  /* SECTION */

  section: {
    marginBottom: 22,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },

  sectionHint: {
    marginTop: 4,
    fontSize: 11,
    color: '#64748B',
  },

  /* TYPES */

  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 13,
    gap: 9,
  },

  typeCard: {
    width: '48.5%',
    minHeight: 58,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  typeCardActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },

  typeIndicator: {
    width: 25,
    height: 25,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  typeIndicatorActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },

  checkMark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  typeText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },

  typeTextActive: {
    color: '#1D4ED8',
    fontWeight: '900',
  },

  /* DESCRIPTION */

  descriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  optional: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: '#94A3B8',
    marginTop: 4,
  },

  textArea: {
    minHeight: 135,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingTop: 14,
    paddingBottom: 30,
    marginTop: 13,
    fontSize: 13,
    lineHeight: 20,
    color: '#0F172A',
  },

  characterCount: {
    alignSelf: 'flex-end',
    marginTop: -24,
    marginRight: 12,
    fontSize: 9,
    color: '#94A3B8',
  },

  /* LOCATION */

  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 18,
  },

  locationIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  locationIconText: {
    fontSize: 17,
    color: '#16A34A',
  },

  locationContent: {
    flex: 1,
    paddingRight: 8,
  },

  locationTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
  },

  locationText: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 15,
    color: '#64748B',
  },

  locationStatus: {
    alignItems: 'center',
  },

  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginBottom: 4,
  },

  locationStatusText: {
    fontSize: 7,
    fontWeight: '900',
    color: '#15803D',
    letterSpacing: 0.7,
  },

  /* BUTTON */

  submitButton: {
    height: 56,
    borderRadius: 17,
    backgroundColor: '#1D4ED8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#1D4ED8',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  submitButtonDisabled: {
    opacity: 0.7,
  },

  submitIcon: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
    marginRight: 9,
  },

  submitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  footerText: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 9,
    lineHeight: 14,
    color: '#94A3B8',
  },
});