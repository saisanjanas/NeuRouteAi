import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { submitHazardReport, submitVehicleLocation } from './api';

const QUEUE_KEY = '@neu_route_ai/offline_queue';

async function readQueue() {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function writeQueue(items) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(items));
}

export async function enqueue(type, payload) {
  const queue = await readQueue();

  queue.push({
    id: `${Date.now()}-${Math.random()}`,
    type,
    payload,
    createdAt: Date.now(),
  });

  await writeQueue(queue);
}

async function sendOne(item) {
  if (item.type === 'report') {
    return submitHazardReport(item.payload);
  }

  if (item.type === 'location') {
    const { vehicleId, ...rest } = item.payload;
    return submitVehicleLocation(vehicleId, rest);
  }

  throw new Error(`Unknown queued item type: ${item.type}`);
}

export async function flushQueue() {
  const queue = await readQueue();

  if (queue.length === 0) {
    return { sent: 0, remaining: 0 };
  }

  const remaining = [];
  let sent = 0;

  for (const item of queue) {
    try {
      await sendOne(item);
      sent += 1;
    } catch (err) {
      // Keep failed items for a later retry.
      remaining.push(item);
    }
  }

  await writeQueue(remaining);

  return {
    sent,
    remaining: remaining.length,
  };
}

export function startAutoSync() {
  const unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      flushQueue().catch(() => {});
    }
  });

  // Also try immediately when the app starts.
  flushQueue().catch(() => {});

  return unsubscribe;
}

export async function queueLength() {
  return (await readQueue()).length;
}