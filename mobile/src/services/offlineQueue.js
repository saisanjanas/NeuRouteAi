import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { submitHazardReport, submitVehicleLocation } from './api';

const QUEUE_KEY = '@neu_route_ai/offline_queue';

// Each queued item looks like: { id, type: 'report' | 'location', payload, createdAt }
// This satisfies the doc's "basic offline queue + sync" requirement for
// Member 5: reports/location pings made while disconnected are stored
// locally and flushed automatically once connectivity returns.

async function readQueue() {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function writeQueue(items) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(items));
}

export async function enqueue(type, payload) {
  const queue = await readQueue();
  queue.push({ id: `${Date.now()}-${Math.random()}`, type, payload, createdAt: Date.now() });
  await writeQueue(queue);
}

async function sendOne(item) {
  if (item.type === 'report') return submitHazardReport(item.payload);
  if (item.type === 'location') {
    const { vehicleId, ...rest } = item.payload;
    return submitVehicleLocation(vehicleId, rest);
  }
  throw new Error(`Unknown queued item type: ${item.type}`);
}

export async function flushQueue() {
  const queue = await readQueue();
  if (queue.length === 0) return { sent: 0, remaining: 0 };

  let sent = 0;
  let stoppedAt = queue.length; // index of first item we couldn't send
  for (let i = 0; i < queue.length; i += 1) {
    try {
      await sendOne(queue[i]);
      sent += 1;
    } catch (err) {
      // Keep this and everything after it queued — likely still offline
      // or the backend is down. Stop instead of reordering delivery.
      stoppedAt = i;
      break;
    }
  }
  const remaining = queue.slice(stoppedAt);
  await writeQueue(remaining);
  return { sent, remaining: remaining.length };
}

// Call this once near app startup (e.g. in App.js) to auto-flush whenever
// connectivity is restored.
export function startAutoSync() {
  return NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      flushQueue().catch(() => {});
    }
  });
}

export async function queueLength() {
  return (await readQueue()).length;
}
