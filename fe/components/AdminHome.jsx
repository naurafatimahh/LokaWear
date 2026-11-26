import { useCallback, useEffect, useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { api } from '../lib/api'
import { BG, DESIGN_WIDTH, ORANGE } from '../lib/ui'

const PEACH = '#FDE6D8'
const BORDER = 'rgba(194,65,12,0.2)'

// Home untuk role "admin". Desain: Figma frame "HomePage" (dashboard admin).
export default function AdminHome({ user, token, onLogout }) {
  const { width } = useWindowDimensions()
  const s = width / DESIGN_WIDTH
  const insets = useSafeAreaInsets()

  const [stats, setStats] = useState({})
  const [pending, setPending] = useState([])
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const [users, brands, products, pend] = await Promise.all([
        api('/api/users', { token }),
        api('/api/brands'),
        api('/api/products'),
        api('/api/brands/pending', { token }),
      ])
      const now = Date.now()
      setStats({
        users: users.length,
        brands: brands.data.length,
        // Backend belum membedakan produk aktif/nonaktif: semua produk dihitung aktif.
        products: products.data.length,
        // PO dibuka: sudah mulai (atau tanpa tanggal mulai) dan belum berakhir
        openPo: products.data.filter(
          (p) => p.po_end && new Date(p.po_end) >= now && (!p.po_start || new Date(p.po_start) <= now)
        ).length,
      })
      setPending(pend.data)
    } catch (e) {
      setError(e.message)
    }
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  const verify = (brand) =>
    Alert.alert('Verifikasi brand', `Verifikasi "${brand.brand_name}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Verifikasi',
        onPress: async () => {
          try {
            await api(`/api/brands/${brand.brand_id}/verify`, { method: 'PATCH', token, body: { status: 'verified' } })
            setPending((list) => list.filter((b) => b.brand_id !== brand.brand_id))
          } catch (e) {
            Alert.alert('Gagal', e.message)
          }
        },
      },
    ])

  const comingSoon = (name) => Alert.alert(name, 'Fitur ini belum tersedia.')

  const Stat = ({ label, value }) => (
    <View style={[styles.statCard, { height: 45 * s, borderRadius: 4 * s, paddingHorizontal: 7 * s, paddingTop: 7 * s }]}>
      <Text style={[styles.statLabel, { fontSize: 7 * s }]}>{label}</Text>
      <Text style={[styles.statValue, { fontSize: 14 * s }]}>{value ?? '-'}</Text>
    </View>
  )

  const Action = ({ label }) => (
    <Pressable
      onPress={() => comingSoon(label)}
      style={[styles.action, { height: 24 * s, borderRadius: 5 * s }]}
    >
      <Text style={[styles.actionText, { fontSize: 8 * s }]}>{label}</Text>
    </Pressable>
  )

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20 * s, paddingTop: insets.top + 8 * s, paddingBottom: 70 * s }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.brandName, { fontSize: 12 * s }]}>LokaWear</Text>
          <Pressable onPress={onLogout} hitSlop={8}>
            <Text style={[styles.logout, { fontSize: 7 * s }]}>Logout</Text>
          </Pressable>
        </View>
        <Text style={[styles.title, { fontSize: 10 * s, marginTop: 4 * s }]}>Halo, {user.name}</Text>

        {error && <Text style={[styles.error, { fontSize: 8 * s }]}>{error}</Text>}

        <View style={[styles.grid, { gap: 3 * s, marginTop: 14 * s }]}>
          <View style={{ width: '49%' }}><Stat label="Total User" value={stats.users} /></View>
          <View style={{ width: '49%' }}><Stat label="Brand" value={stats.brands} /></View>
        </View>
        <View style={[styles.grid, { gap: 3 * s, marginTop: 12 * s }]}>
          <View style={{ width: '49%' }}><Stat label="Produk Aktif" value={stats.products} /></View>
          <View style={{ width: '49%' }}><Stat label="PO Dibuka" value={stats.openPo} /></View>
        </View>

        <View style={[styles.grid, { gap: 3 * s, marginTop: 16 * s }]}>
          <View style={{ width: '49%' }}><Action label="Kelola PO" /></View>
          <View style={{ width: '49%' }}><Action label="Laporan" /></View>
        </View>

        <Text style={[styles.title, { fontSize: 8 * s, marginTop: 14 * s, marginBottom: 8 * s }]}>Menunggu verifikasi</Text>
        {pending.length === 0 && !error && (
          <Text style={[styles.empty, { fontSize: 8 * s }]}>Tidak ada brand yang menunggu verifikasi.</Text>
        )}
        {pending.map((b) => (
          <View key={b.brand_id} style={[styles.pendingCard, { borderRadius: 4 * s, padding: 8 * s, marginBottom: 12 * s }]}>
            <View style={styles.pendingTop}>
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={[styles.title, { fontSize: 8 * s }]}>{b.brand_name}</Text>
                <Text style={[styles.city, { fontSize: 6 * s }]}>{b.city ?? '-'}</Text>
              </View>
              <View style={[styles.badge, { height: 12 * s, borderRadius: 6 * s, paddingHorizontal: 8 * s }]}>
                <Text style={[styles.badgeText, { fontSize: 6 * s }]}>Menunggu</Text>
              </View>
            </View>
            <Pressable
              onPress={() => verify(b)}
              style={[styles.verifyBtn, { height: 25 * s, width: 51 * s, borderRadius: 5 * s, marginTop: 6 * s }]}
            >
              <Text style={[styles.verifyText, { fontSize: 8 * s }]}>Verifikasi</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>

      {/* Navbar: desain ikon belum ditentukan di Figma */}
      <View style={[styles.navbar, { left: 20 * s, right: 20 * s, height: 28 * s, bottom: 16 * s }]} />
    </View>
  )
}

const cardShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.17,
  shadowRadius: 4,
  elevation: 3,
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandName: { fontWeight: '700', color: '#000' },
  logout: { color: 'rgba(0,0,0,0.5)', fontWeight: '300' },
  title: { fontWeight: '600', color: '#000' },
  grid: { flexDirection: 'row', justifyContent: 'space-between' },
  statCard: { backgroundColor: '#F7F7F7', borderWidth: 1, borderColor: BORDER, ...cardShadow },
  statLabel: { fontWeight: '600', color: 'rgba(0,0,0,0.4)' },
  statValue: { fontWeight: '700', color: ORANGE, marginTop: 2 },
  action: { backgroundColor: PEACH, alignItems: 'center', justifyContent: 'center' },
  actionText: { fontWeight: '600', color: ORANGE },
  pendingCard: { backgroundColor: '#F7F7F7', borderWidth: 1, borderColor: BORDER, ...cardShadow },
  pendingTop: { flexDirection: 'row', alignItems: 'flex-start' },
  city: { fontWeight: '600', color: 'rgba(0,0,0,0.4)' },
  badge: { backgroundColor: PEACH, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontWeight: '600', color: ORANGE },
  verifyBtn: { backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center' },
  verifyText: { fontWeight: '600', color: '#fff' },
  navbar: { position: 'absolute', backgroundColor: ORANGE },
  error: { color: '#B91C1C', marginTop: 12, textAlign: 'center' },
  empty: { textAlign: 'center', color: 'rgba(0,0,0,0.5)' },
})
