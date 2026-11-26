import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import AdminHome from '../components/AdminHome'
import BrandHome from '../components/BrandHome'
import UserHome from '../components/UserHome'
import { api } from '../lib/api'
import { clearSession, getSession } from '../lib/auth'
import { BG, ORANGE } from '../lib/ui'

// Memeriksa sesi, lalu menampilkan Home sesuai role: admin, brand, atau user (default).
export default function Home() {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [error, setError] = useState(null)

  const logout = useCallback(async () => {
    await clearSession()
    router.replace('/login')
  }, [router])

  const load = useCallback(async () => {
    setError(null)
    const saved = await getSession()
    if (!saved) return router.replace('/login')
    try {
      // Pastikan token masih valid (server menolak token expired/palsu dengan 401)
      await api('/api/profile', { token: saved.token })
      setSession(saved)
    } catch (e) {
      if (e.status === 401) {
        await clearSession()
        return router.replace('/login')
      }
      setError(e.message)
    }
  }, [router])

  useEffect(() => {
    load()
  }, [load])

  if (!session) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={ORANGE} />
        {error && (
          <>
            <Text style={styles.error}>{error}</Text>
            <Pressable onPress={load}><Text style={styles.retry}>Coba lagi</Text></Pressable>
          </>
        )}
      </View>
    )
  }

  const props = { user: session.user, token: session.token, onLogout: logout }
  switch (session.user.role) {
    case 'admin':
      return <AdminHome {...props} />
    case 'brand':
      return <BrandHome {...props} />
    default:
      return <UserHome {...props} />
  }
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: BG, padding: 24 },
  error: { color: '#B91C1C', marginTop: 12, textAlign: 'center' },
  retry: { color: ORANGE, marginTop: 8, fontWeight: '600' },
})
