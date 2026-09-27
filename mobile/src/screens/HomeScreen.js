import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getUser } from '../services/authStorage';
import { startTracking, stopTracking, isTracking } from '../services/gpsTracker';
import { queueLength } from '../services/offlineQueue';
import { useLanguage } from '../context/LanguageContext';

export default function HomeScreen({ navigation }) {
  const { t } = useLanguage();
  const [tracking, setTracking] = useState(isTracking());
  const [pending, setPending] = useState(0);
  const [vehicleId, setVehicleId] = useState(null);

  useEffect(() => {
    getUser().then((user) => setVehicleId(user?.vehicle_id ?? null));
    const interval = setInterval(() => queueLength().then(setPending), 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleTracking = () => {
    if (tracking) {
      stopTracking();
    } else if (vehicleId) {
      startTracking(vehicleId, { onError: () => {} });
    }
    setTracking(!tracking);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('home.title')}</Text>

      {pending > 0 && (
        <Text style={styles.badge}>{pending} pending sync</Text>
      )}

      <TouchableOpacity style={styles.button} onPress={toggleTracking}>
        <Text style={styles.buttonText}>
          {tracking ? t('home.stop_tracking') : t('home.start_tracking')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('HazardReport')}>
        <Text style={styles.buttonText}>{t('home.report_hazard')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ShipmentStatus')}>
        <Text style={styles.buttonText}>{t('home.shipment_status')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonSecondary} onPress={() => navigation.navigate('LanguageSelect')}>
        <Text style={styles.buttonSecondaryText}>{t('home.change_language')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 64 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 24 },
  badge: { backgroundColor: '#fff3cd', color: '#856404', padding: 8, borderRadius: 6, marginBottom: 16 },
  button: { backgroundColor: '#1f6feb', borderRadius: 8, padding: 14, marginBottom: 12 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  buttonSecondary: { padding: 14, marginTop: 8 },
  buttonSecondaryText: { color: '#1f6feb', textAlign: 'center', fontWeight: '600' },
});
