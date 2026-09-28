	import axios from 'axios';
import { getToken } from './authStorage';

// API_BASE_URL should come from react-native-config or an equivalent env
// loader once the RN CLI project is generated. Hardcoded fallback for now
// so this file runs standalone during early development.
const API_BASE_URL = 'http://10.0.2.2:8000';

const client = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });

client.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Endpoints below match docs/API_CONTRACT.md exactly — do not rename paths
// or fields without updating that shared contract with the backend team.

export function login(username, password) {
  return client.post('/api/auth/login', { username, password }).then((r) => r.data);
}

export function submitVehicleLocation(vehicleId, { latitude, longitude, speed, heading }) {
  return client
    .post(`/vehicles/${vehicleId}/location`, { latitude, longitude, speed, heading })
    .then((r) => r.data);
}

export function submitHazardReport(report) {
  // report: { segment_id, hazard_type, description, latitude, longitude, photo_url }
  return client.post('/reports', report).then((r) => r.data);
}

export function getShipmentStatus(shipmentId) {
  return client.get(`/shipments/${shipmentId}/status`).then((r) => r.data);
}

export default client;


