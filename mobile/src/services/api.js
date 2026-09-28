import axios from 'axios';
import { getToken } from './authStorage';

const API_BASE_URL = 'http://10.0.2.2:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

client.interceptors.request.use(async (config) => {
  const token = await getToken();

  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }

  return config;
});

export function login(username, password) {
  return client
    .post('/api/auth/login', { username, password })
    .then((response) => response.data);
}

export function submitVehicleLocation(
  vehicleId,
  { latitude, longitude, speed, heading }
) {
  return client
    .post(`/api/vehicles/${vehicleId}/location`, {
      latitude,
      longitude,
      speed,
      heading,
    })
    .then((response) => response.data);
}

export function submitHazardReport(report) {
  return client
    .post('/api/reports', report)
    .then((response) => response.data);
}

export function getShipmentStatus(shipmentId) {
  return client
    .get(`/api/shipments/${shipmentId}/status`)
    .then((response) => response.data);
}

export default client;