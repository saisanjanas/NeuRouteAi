import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { submitVehicleLocation } from './api';
import { enqueue } from './offlineQueue';

let watchId = null;

async function requestLocationPermission() {
  if (Platform.OS !== 'android') {
    return true;
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'NeuRoute AI Location Permission',
      message:
        'NeuRoute AI needs your location to track the vehicle and report its position.',
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    }
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

async function pushLocation(vehicleId, position) {
  const { latitude, longitude, speed, heading } = position.coords;

  try {
    await submitVehicleLocation(vehicleId, {
      latitude,
      longitude,
      speed,
      heading,
    });
  } catch (err) {
    await enqueue('location', {
      vehicleId,
      latitude,
      longitude,
      speed,
      heading,
    });
  }
}

export async function startTracking(vehicleId, { onError } = {}) {
  if (watchId !== null) {
    return true;
  }

  if (!vehicleId) {
    onError && onError(new Error('Vehicle ID is missing.'));
    return false;
  }

  const permissionGranted = await requestLocationPermission();

  if (!permissionGranted) {
    onError && onError(new Error('Location permission denied.'));
    return false;
  }

  watchId = Geolocation.watchPosition(
    (position) => {
      pushLocation(vehicleId, position);
    },
    (error) => {
      onError && onError(error);
    },
    {
      enableHighAccuracy: true,
      distanceFilter: 25,
      interval: 10000,
      fastestInterval: 5000,
      showLocationDialog: true,
      forceRequestLocation: true,
    }
  );

  return true;
}

export function stopTracking() {
  if (watchId !== null) {
    Geolocation.clearWatch(watchId);
    watchId = null;
  }
}

export function isTracking() {
  return watchId !== null;
}