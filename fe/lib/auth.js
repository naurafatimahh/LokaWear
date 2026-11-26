import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

const KEY = 'session'

// SecureStore tidak tersedia di web; localStorage dipakai hanya untuk uji coba di browser.
const store =
  Platform.OS === 'web'
    ? {
        get: async () => localStorage.getItem(KEY),
        set: async (v) => localStorage.setItem(KEY, v),
        del: async () => localStorage.removeItem(KEY),
      }
    : {
        get: () => SecureStore.getItemAsync(KEY),
        set: (v) => SecureStore.setItemAsync(KEY, v),
        del: () => SecureStore.deleteItemAsync(KEY),
      }

// session = { token, user }
export const saveSession = (session) => store.set(JSON.stringify(session))
export const clearSession = () => store.del()

export async function getSession() {
  try {
    const raw = await store.get()
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
