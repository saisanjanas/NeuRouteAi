import Geolocation from 'react-native-geolocation-service';
import { submitVehicleLocation } from './api';
import { enqueue } from './offlineQueue';

let watchId = null;

// Sends a live position; if the request fails (most likely: no signal),
// it drops into the offline queue instead of being lost.
async function pushLocation(vehicleId, position) {
  const { latitude, longitude, speed, heading } = position.coords;
  try {
    await submitVehicleLocation(vehicleId, { latitude, longitude, speed, heading });
  } catch (err) {
    await enqueue('location', { vehicleId, latitude, longitude, speed, heading });
  }
}

export function startTracking(vehicleId, { onError } = {}) {
  if (watchId !== null) return; // already tracking

  watchId = Geolocation.watchPosition(
    (position) => pushLocation(vehicleId, position),
    (error) => onError && onError(error),
    {
      enableHighAccuracy: true,
      distanceFilter: 25, // meters between updates
      interval: 10000,
      fastestInterval: 5000,
    }
  );
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
