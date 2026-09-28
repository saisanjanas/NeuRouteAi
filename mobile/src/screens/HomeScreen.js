import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ScrollView,
} from 'react-native';

import { getUser } from '../services/authStorage';
import {
  startTracking,
  stopTracking,
  isTracking,
} from '../services/gpsTracker';
import { queueLength } from '../services/offlineQueue';

export default function HomeScreen({ navigation }) {
  const [tracking, setTracking] = useState(isTracking());
  const [pending, setPending] = useState(0);
  const [vehicleId, setVehicleId] = useState(null);
  const [vehicleName, setVehicleName] = useState('NEU-001');

  useEffect(() => {
    getUser().then((user) => {
      setVehicleId(user?.vehicle_id ?? null);
      setVehicleName(user?.vehicle_registration ?? 'NEU-001');
    });

    const updateQueue = () => {
      queueLength().then(setPending);
    };

    updateQueue();

    const interval = setInterval(updateQueue, 3000);

    return () => clearInterval(interval);
  }, []);

  const toggleTracking = () => {
    if (tracking) {
      stopTracking();
      setTracking(false);
      return;
    }

    if (vehicleId) {
      startTracking(vehicleId, {
        onError: () => {
          setTracking(false);
        },
      });

      setTracking(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F7F9FC"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.container}>

          {/* TOP BAR */}
          <View style={styles.topBar}>
            <View>
              <Text style={styles.brand}>NEU ROUTE AI</Text>
              <Text style={styles.welcome}>Driver Dashboard</Text>
              <Text style={styles.subtitle}>
                Safety & logistics control center
              </Text>
            </View>

            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>ONLINE</Text>
            </View>
          </View>

          {/* VEHICLE / GPS CARD */}
          <View style={styles.vehicleCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.smallLabel}>ACTIVE VEHICLE</Text>
                <Text style={styles.vehicleNumber}>
                  {vehicleName}
                </Text>
              </View>

              <View
                style={[
                  styles.gpsBadge,
                  tracking
                    ? styles.gpsBadgeActive
                    : styles.gpsBadgeInactive,
                ]}
              >
                <View
                  style={[
                    styles.gpsDot,
                    tracking
                      ? styles.gpsDotActive
                      : styles.gpsDotInactive,
                  ]}
                />

                <Text
                  style={[
                    styles.gpsText,
                    tracking
                      ? styles.gpsTextActive
                      : styles.gpsTextInactive,
                  ]}
                >
                  {tracking ? 'GPS ACTIVE' : 'GPS OFF'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.locationRow}>
              <View style={styles.locationTextContainer}>
                <Text style={styles.smallLabel}>LIVE LOCATION</Text>

                <Text style={styles.locationText}>
                  {tracking
                    ? 'Your vehicle location is being shared'
                    : 'Location tracking is currently off'}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.trackingButton,
                  tracking && styles.stopButton,
                ]}
                onPress={toggleTracking}
                activeOpacity={0.85}
              >
                <Text style={styles.trackingButtonText}>
                  {tracking ? 'STOP' : 'START'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* PENDING SYNC */}
          {pending > 0 && (
            <View style={styles.pendingCard}>
              <View style={styles.pendingIcon}>
                <Text style={styles.pendingIconText}>↻</Text>
              </View>

              <View style={styles.pendingContent}>
                <Text style={styles.pendingTitle}>
                  {pending} pending sync{pending !== 1 ? 's' : ''}
                </Text>

                <Text style={styles.pendingSubtitle}>
                  Data will be uploaded when connection is available.
                </Text>
              </View>
            </View>
          )}

          {/* QUICK ACTIONS */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <Text style={styles.sectionSubtitle}>
                Driver tools
              </Text>
            </View>
          </View>

          <View style={styles.actionsRow}>

            {/* HAZARD REPORT */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('HazardReport')}
              activeOpacity={0.88}
            >
              <View style={styles.hazardIcon}>
                <Text style={styles.hazardIconText}>!</Text>
              </View>

              <Text style={styles.actionTitle}>
                Report Hazard
              </Text>

              <Text style={styles.actionDescription}>
                Report a road or safety issue
              </Text>

              <View style={styles.actionArrow}>
                <Text style={styles.arrowText}>→</Text>
              </View>
            </TouchableOpacity>

            {/* SHIPMENT */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('ShipmentStatus')}
              activeOpacity={0.88}
            >
              <View style={styles.shipmentIcon}>
                <Text style={styles.shipmentIconText}>▣</Text>
              </View>

              <Text style={styles.actionTitle}>
                Shipment
              </Text>

              <Text style={styles.actionDescription}>
                Check delivery status
              </Text>

              <View style={styles.actionArrow}>
                <Text style={styles.arrowText}>→</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* LANGUAGE */}
          <TouchableOpacity
            style={styles.languageCard}
            onPress={() => navigation.navigate('LanguageSelect')}
            activeOpacity={0.88}
          >
            <View style={styles.languageIcon}>
              <Text style={styles.languageIconText}>文</Text>
            </View>

            <View style={styles.languageContent}>
              <Text style={styles.languageTitle}>
                Language
              </Text>

              <Text style={styles.languageDescription}>
                Change application language
              </Text>
            </View>

            <Text style={styles.languageArrow}>›</Text>
          </TouchableOpacity>

          {/* FOOTER */}
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
    backgroundColor: '#F7F9FC',
  },

  scrollContent: {
    paddingBottom: 30,
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },

  /* TOP BAR */

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 22,
  },

  brand: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2.2,
    color: '#2563EB',
    marginBottom: 5,
  },

  welcome: {
    fontSize: 27,
    fontWeight: '900',
    color: '#0F172A',
  },

  subtitle: {
    marginTop: 5,
    fontSize: 12,
    color: '#64748B',
  },

  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },

  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },

  onlineText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#15803D',
    letterSpacing: 0.7,
  },

  /* VEHICLE CARD */

  vehicleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5EAF1',
    elevation: 3,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  smallLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#94A3B8',
    marginBottom: 5,
  },

  vehicleNumber: {
    fontSize: 25,
    fontWeight: '900',
    color: '#0F172A',
  },

  gpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 18,
  },

  gpsBadgeActive: {
    backgroundColor: '#ECFDF5',
  },

  gpsBadgeInactive: {
    backgroundColor: '#F1F5F9',
  },

  gpsDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  gpsDotActive: {
    backgroundColor: '#22C55E',
  },

  gpsDotInactive: {
    backgroundColor: '#94A3B8',
  },

  gpsText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  gpsTextActive: {
    color: '#15803D',
  },

  gpsTextInactive: {
    color: '#64748B',
  },

  divider: {
    height: 1,
    backgroundColor: '#EEF2F7',
    marginVertical: 18,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationTextContainer: {
    flex: 1,
    paddingRight: 12,
  },

  locationText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    color: '#334155',
  },

  trackingButton: {
    minWidth: 78,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  stopButton: {
    backgroundColor: '#DC2626',
  },

  trackingButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
  },

  /* PENDING SYNC */

  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },

  pendingIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  pendingIconText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#B45309',
  },

  pendingContent: {
    flex: 1,
  },

  pendingTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#78350F',
  },

  pendingSubtitle: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: '#92400E',
  },

  /* SECTION */

  sectionHeader: {
    marginTop: 25,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: '#94A3B8',
  },

  /* ACTION CARDS */

  actionsRow: {
    flexDirection: 'row',
  },

  actionCard: {
    flex: 1,
    minHeight: 175,
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    padding: 17,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E5EAF1',
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  actionCardLast: {
    marginRight: 0,
  },

  hazardIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  hazardIconText: {
    fontSize: 23,
    fontWeight: '900',
    color: '#DC2626',
  },

  shipmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  shipmentIconText: {
    fontSize: 21,
    fontWeight: '900',
    color: '#2563EB',
  },

  actionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },

  actionDescription: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 16,
    color: '#64748B',
    paddingRight: 5,
  },

  actionArrow: {
    position: 'absolute',
    right: 13,
    bottom: 13,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  arrowText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#475569',
  },

  /* LANGUAGE */

  languageCard: {
    marginTop: 12,
    minHeight: 72,
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5EAF1',
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  languageIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  languageIconText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2563EB',
  },

  languageContent: {
    flex: 1,
    marginLeft: 13,
  },

  languageTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },

  languageDescription: {
    marginTop: 3,
    fontSize: 11,
    color: '#64748B',
  },

  languageArrow: {
    fontSize: 29,
    color: '#94A3B8',
    marginRight: 4,
  },

  /* FOOTER */

  footer: {
    alignItems: 'center',
    marginTop: 26,
    paddingBottom: 5,
  },

  footerLine: {
    width: 32,
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