import Constants from 'expo-constants'

// Di Expo Go, backend dianggap berjalan di laptop yang sama (port 3000).
// Bisa diganti lewat EXPO_PUBLIC_API_URL.
const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost'
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? `http://${host}:3000`

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

export async function api(path, { method = 'GET', body, token } = {}) {
  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body && JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Tidak bisa terhubung ke server. Pastikan backend menyala dan HP satu jaringan dengan laptop.', 0)
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(data.message || 'Terjadi kesalahan', res.status)
  return data
}
