import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@rooms_created_today';
const MAX_ROOMS_PER_DAY = 3;

export type RoomsCreatedToday = { date: string; count: number };

export async function getRoomsCreatedToday(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return 0;
    const obj: RoomsCreatedToday = JSON.parse(raw);
    const today = new Date().toISOString().slice(0, 10);
    return obj.date === today ? obj.count : 0;
  } catch {
    return 0;
  }
}

export async function incrementRoomsCreatedToday(): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const current = await getRoomsCreatedToday();
  const raw = await AsyncStorage.getItem(KEY);
  let obj: RoomsCreatedToday = raw ? JSON.parse(raw) : { date: today, count: 0 };
  if (obj.date !== today) obj = { date: today, count: 0 };
  obj.count = obj.count + 1;
  await AsyncStorage.setItem(KEY, JSON.stringify(obj));
  return obj.count;
}

export function getRoomsLeftToday(count: number): number {
  return Math.max(0, MAX_ROOMS_PER_DAY - count);
}
