import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_ID_KEY = "userId";
const USER_DATA_KEY = "userData";

export interface StoredUser {
  id: string;
  username: string;
  email: string;
  rating?: number;
}

export async function getStoredUserId(): Promise<string> {
  try {
    const userId = await AsyncStorage.getItem(USER_ID_KEY);
    return userId || "";
  } catch {
    return "";
  }
}

export async function setStoredUserId(id: string): Promise<void> {
  try {
    await AsyncStorage.setItem(USER_ID_KEY, id);
  } catch {}
}

export async function getStoredUser(): Promise<StoredUser | null> {
  try {
    const raw = await AsyncStorage.getItem(USER_DATA_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export async function setStoredUser(user: StoredUser): Promise<void> {
  try {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    await AsyncStorage.setItem(USER_ID_KEY, user.id);
  } catch {}
}

export async function clearStoredUser(): Promise<void> {
  try {
    await AsyncStorage.removeItem(USER_ID_KEY);
    await AsyncStorage.removeItem(USER_DATA_KEY);
  } catch {}
}
