import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { getShipmentStatus } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function ShipmentStatusScreen() {
  const { t } = useLanguage();
  const [shipmentId, setShipmentId] = useState('');
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const handleLookup = async () => {
    setError(null);
    setStatus(null);
    try {
      const data = await getShipmentStatus(shipmentId);
      setStatus(data);
    } catch (err) {
      setError('Could not fetch shipment status.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Shipment ID"
        value={shipmentId}
        onChangeText={setShipmentId}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.button} onPress={handleLookup}>
        <Text style={styles.buttonText}>Look up</Text>
      </TouchableOpacity>

      {error && <Text style={styles.error}>{error}</Text>}

      {status && (
        <View style={styles.card}>
          <Text>{t('shipment.status')}: {status.status}</Text>
          <Text>{t('shipment.eta')}: {status.eta}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 },
  button: { backgroundColor: '#1f6feb', borderRadius: 8, padding: 14 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  error: { color: '#d33', marginTop: 12 },
  card: { marginTop: 20, padding: 16, borderRadius: 8, backgroundColor: '#f5f5f5' },
});
