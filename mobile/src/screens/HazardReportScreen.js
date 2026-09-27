import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { submitHazardReport } from '../services/api';
import { enqueue } from '../services/offlineQueue';
import { useLanguage } from '../context/LanguageContext';

const HAZARD_TYPES = ['landslide', 'flooding', 'road_damage', 'fallen_tree', 'other'];

export default function HazardReportScreen() {
  const { t } = useLanguage();
  const [hazardType, setHazardType] = useState(HAZARD_TYPES[0]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getPosition = () =>
    new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 15000 });
    });

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const position = await getPosition();
      const payload = {
        hazard_type: hazardType,
        description,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      try {
        await submitHazardReport(payload);
        Alert.alert(t('hazard.submitted'));
      } catch (apiErr) {
        await enqueue('report', payload);
        Alert.alert(t('hazard.queued_offline'));
      }
      setDescription('');
    } catch (locErr) {
      Alert.alert('Could not get GPS location. Try again outdoors or with location enabled.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('hazard.title')}</Text>

      <Text style={styles.label}>{t('hazard.type')}</Text>
      <View style={styles.typeRow}>
        {HAZARD_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.typeChip, hazardType === type && styles.typeChipActive]}
            onPress={() => setHazardType(type)}
          >
            <Text style={hazardType === type ? styles.typeChipTextActive : styles.typeChipText}>
              {type.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>{t('hazard.description')}</Text>
      <TextInput
        style={styles.textArea}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.buttonText}>{submitting ? '...' : t('hazard.submit')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 20 },
  label: { fontWeight: '600', marginBottom: 8, marginTop: 12 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: { borderWidth: 1, borderColor: '#ccc', borderRadius: 16, paddingVertical: 6, paddingHorizontal: 12, marginRight: 8, marginBottom: 8 },
  typeChipActive: { backgroundColor: '#1f6feb', borderColor: '#1f6feb' },
  typeChipText: { color: '#333' },
  typeChipTextActive: { color: '#fff' },
  textArea: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, textAlignVertical: 'top' },
  button: { backgroundColor: '#1f6feb', borderRadius: 8, padding: 14, marginTop: 24 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
});
