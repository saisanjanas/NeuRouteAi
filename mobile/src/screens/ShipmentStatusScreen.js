import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';

import { getShipmentStatus } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function ShipmentStatusScreen({ navigation }) {
  const { t } = useLanguage();

  const [shipmentId, setShipmentId] = useState('');
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLookup = async () => {
    if (loading) return;

    if (!shipmentId.trim()) {
      setError('Please enter a shipment ID.');
      setStatus(null);
      return;
    }

    setError(null);
    setStatus(null);
    setLoading(true);

    try {
      const data = await getShipmentStatus(shipmentId.trim());
      setStatus(data);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
        'Could not fetch shipment status.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = () => {
    if (!status) return styles.statusNeutral;

    switch (status.status) {
      case 'Delivered':
        return styles.statusDelivered;

      case 'Delayed':
        return styles.statusDelayed;

      case 'In Transit':
        return styles.statusTransit;

      default:
        return styles.statusPending;
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
                Shipment Status
              </Text>

              <Text style={styles.subtitle}>
                Track your delivery in real time
              </Text>
            </View>
          </View>

          {/* SEARCH CARD */}
          <View style={styles.searchCard}>
            <View style={styles.searchIcon}>
              <Text style={styles.searchIconText}>
                #
              </Text>
            </View>

            <Text style={styles.cardTitle}>
              Find Shipment
            </Text>

            <Text style={styles.cardSubtitle}>
              Enter the shipment ID to view its latest status.
            </Text>

            <Text style={styles.label}>
              SHIPMENT ID
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Example: 1"
              placeholderTextColor="#94A3B8"
              value={shipmentId}
              onChangeText={(value) => {
                setShipmentId(value);
                setError(null);
              }}
              keyboardType="numeric"
              editable={!loading}
              onSubmitEditing={handleLookup}
            />

            <TouchableOpacity
              style={[
                styles.lookupButton,
                loading && styles.lookupButtonDisabled,
              ]}
              onPress={handleLookup}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.lookupText}>
                  Check Shipment
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* ERROR */}
          {error && (
            <View style={styles.errorCard}>
              <View style={styles.errorIcon}>
                <Text style={styles.errorIconText}>
                  !
                </Text>
              </View>

              <View style={styles.errorContent}>
                <Text style={styles.errorTitle}>
                  Shipment Not Found
                </Text>

                <Text style={styles.errorText}>
                  {error}
                </Text>
              </View>
            </View>
          )}

          {/* RESULT */}
          {status && (
            <View style={styles.resultCard}>

              <View style={styles.resultHeader}>
                <View>
                  <Text style={styles.resultLabel}>
                    SHIPMENT
                  </Text>

                  <Text style={styles.shipmentNumber}>
                    #{status.shipment_id}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    getStatusStyle(),
                  ]}
                >
                  <View style={styles.statusDot} />

                  <Text style={styles.statusText}>
                    {status.status}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Text style={styles.detailIconText}>
                    ●
                  </Text>
                </View>

                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>
                    CURRENT STATUS
                  </Text>

                  <Text style={styles.detailValue}>
                    {status.status}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailIconBlue}>
                  <Text style={styles.detailIconBlueText}>
                    ◷
                  </Text>
                </View>

                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>
                    ESTIMATED ARRIVAL
                  </Text>

                  <Text style={styles.detailValue}>
                    {status.eta
                      ? new Date(status.eta).toLocaleString()
                      : 'ETA not available'}
                  </Text>
                </View>
              </View>

              {status.message && (
                <View style={styles.messageBox}>
                  <Text style={styles.messageText}>
                    {status.message}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* EMPTY STATE */}
          {!status && !error && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Text style={styles.emptyIconText}>
                  ✓
                </Text>
              </View>

              <Text style={styles.emptyTitle}>
                Shipment tracking
              </Text>

              <Text style={styles.emptyText}>
                Enter a shipment ID above to see its current delivery status and ETA.
              </Text>
            </View>
          )}

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

  /* SEARCH */

  searchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 23,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    marginBottom: 18,
  },

  searchIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  searchIconText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1D4ED8',
  },

  cardTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0F172A',
  },

  cardSubtitle: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 17,
    color: '#64748B',
    marginBottom: 20,
  },

  label: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: '#64748B',
    marginBottom: 7,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 15,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },

  lookupButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  lookupButtonDisabled: {
    opacity: 0.7,
  },

  lookupText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  /* ERROR */

  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 18,
    padding: 14,
    marginBottom: 18,
  },

  errorIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  errorIconText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#DC2626',
  },

  errorContent: {
    flex: 1,
  },

  errorTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#991B1B',
  },

  errorText: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 15,
    color: '#B91C1C',
  },

  /* RESULT */

  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 23,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  resultLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#94A3B8',
  },

  shipmentNumber: {
    marginTop: 4,
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 18,
  },

  statusDelivered: {
    backgroundColor: '#ECFDF5',
  },

  statusTransit: {
    backgroundColor: '#EFF6FF',
  },

  statusDelayed: {
    backgroundColor: '#FEF2F2',
  },

  statusPending: {
    backgroundColor: '#FFFBEB',
  },

  statusNeutral: {
    backgroundColor: '#F1F5F9',
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginRight: 6,
  },

  statusText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#1D4ED8',
  },

  divider: {
    height: 1,
    backgroundColor: '#E8EEF5',
    marginVertical: 18,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 17,
  },

  detailIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  detailIconText: {
    fontSize: 17,
    color: '#16A34A',
  },

  detailIconBlue: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  detailIconBlueText: {
    fontSize: 21,
    color: '#2563EB',
    fontWeight: '900',
  },

  detailContent: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: '#94A3B8',
  },

  detailValue: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
  },

  messageBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 13,
    padding: 11,
    marginTop: 3,
  },

  messageText: {
    fontSize: 10,
    lineHeight: 15,
    color: '#64748B',
  },

  /* EMPTY */

  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 30,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  emptyIconText: {
    fontSize: 25,
    fontWeight: '900',
    color: '#2563EB',
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#334155',
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 5,
    fontSize: 11,
    lineHeight: 17,
    color: '#94A3B8',
  },
});