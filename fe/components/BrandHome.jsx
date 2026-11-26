import { useEffect, useState } from 'react'
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { api } from '../lib/api'
import { BG, DESIGN_WIDTH, ORANGE, imgSource, rupiah, shadow, shortDate } from '../lib/ui'

// Home untuk role "brand" (Toko). Desain: Figma frame "HomePage" di bagian TOKO.
export default function BrandHome({ user, token, onLogout }) {
  const { width } = useWindowDimensions()
  const s = width / DESIGN_WIDTH
  const insets = useSafeAreaInsets()

  const [dash, setDash] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api('/api/brands/mine', { token })
      .then((r) => setDash(r.data))
      .catch((e) => setError(e.message))
  }, [token])

  // Satu akun bisa punya lebih dari satu brand; tampilan memakai brand pertama.
  const brand = dash?.brands[0]
  const stats = dash?.stats
  const igHandle = brand?.instagram_url?.replace(/\/+$/, '').split('/').pop()

  const Stat = ({ label, value, style }) => (
    <View style={[styles.statCard, { borderRadius: 10 * s, padding: 10 * s, minHeight: 45 * s }, style]}>
      <Text style={[styles.light, { fontSize: 8 * s }]}>{label}</Text>
      <Text style={[styles.statValue, { fontSize: 16 * s }]}>{value ?? '-'}</Text>
    </View>
  )

  const Social = ({ name, handle, connected }) => (
    <View style={[styles.card, { borderRadius: 6 * s, padding: 10 * s, marginBottom: 8 * s, flexDirection: 'row', alignItems: 'center' }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { fontSize: 8 * s }]}>{name}</Text>
        {handle && <Text style={[styles.light, { fontSize: 6 * s }]}>{handle}</Text>}
      </View>
      <Pressable
        disabled={connected}
        onPress={() => Alert.alert(name, 'Fitur menghubungkan akun belum tersedia.')}
        style={[styles.pill, { borderRadius: 12 * s, paddingHorizontal: 8 * s, paddingVertical: 3 * s }, connected ? styles.pillOn : styles.pillOff]}
      >
        <Text style={[styles.pillText, { fontSize: 6 * s }, connected ? styles.pillTextOn : styles.pillTextOff]}>
          {connected ? 'Terhubung' : 'Hubungkan'}
        </Text>
      </Pressable>
    </View>
  )

  const SectionTitle = ({ children }) => (
    <Text style={[styles.title, { fontSize: 10 * s, marginTop: 14 * s, marginBottom: 8 * s }]}>{children}</Text>
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
        <Text style={[styles.title, { fontSize: 12 * s, marginTop: 4 * s }]}>Halo, {brand?.brand_name ?? user.name}</Text>

        {error && <Text style={[styles.error, { fontSize: 8 * s }]}>{error}</Text>}

        <Stat label="Peminat wishlist" value={stats?.wishlist_count} style={{ marginTop: 16 * s, minHeight: 55 * s }} />
        <View style={{ flexDirection: 'row', gap: 8 * s, marginTop: 8 * s }}>
          <Stat label="Total Produk" value={stats?.product_count} style={{ flex: 1 }} />
          <Stat label="PO aktif" value={stats?.active_po_count} style={{ flex: 1 }} />
        </View>

        <SectionTitle>Pre Order yang sedang berjalan</SectionTitle>
        {dash?.activeProducts.length === 0 && (
          <Text style={[styles.light, { fontSize: 8 * s, textAlign: 'center' }]}>Belum ada PO yang sedang berjalan.</Text>
        )}
        {dash?.activeProducts.map((p) => {
          const src = imgSource(p.image)
          return (
            <View key={p.product_id} style={[styles.card, { borderRadius: 6 * s, padding: 10 * s, marginBottom: 10 * s, flexDirection: 'row', alignItems: 'center' }]}>
              <View style={[styles.thumb, { width: 41 * s, height: 41 * s, borderRadius: 10 * s }]}>
                {src && <Image source={src} style={StyleSheet.absoluteFill} resizeMode="cover" />}
              </View>
              <View style={{ marginLeft: 10 * s, flex: 1 }}>
                <Text numberOfLines={1} style={[styles.title, { fontSize: 10 * s }]}>{p.product_name}</Text>
                <Text style={[styles.light, { fontSize: 6 * s }]}>until {shortDate(p.po_end)}</Text>
                <Text style={[styles.light, { fontSize: 8 * s, marginTop: 2 }]}>{rupiah(p.price)}</Text>
              </View>
            </View>
          )
        })}

        <SectionTitle>Media sosial toko</SectionTitle>
        <Social name="Instagram" handle={igHandle ? `@${igHandle}` : '[akun toko]'} connected={!!igHandle} />
        {/* Backend belum punya kolom TikTok */}
        <Social name="TikTok" connected={false} />
      </ScrollView>

      {/* Navbar: desain ikon belum ditentukan di Figma */}
      <View style={[styles.navbar, { left: 20 * s, right: 20 * s, height: 28 * s, bottom: 16 * s }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandName: { fontWeight: '700', color: '#000' },
  logout: { color: 'rgba(0,0,0,0.5)', fontWeight: '300' },
  title: { fontWeight: '600', color: '#000' },
  light: { color: '#000', fontWeight: '300' },
  statCard: { backgroundColor: '#F7F7F7', ...shadow },
  statValue: { fontWeight: '700', color: '#000', marginTop: 4 },
  card: { backgroundColor: '#F7F7F7', ...shadow },
  thumb: { backgroundColor: '#FDE6D8', overflow: 'hidden', ...shadow },
  pill: { borderWidth: 1 },
  pillOn: { backgroundColor: '#86EFAC', borderColor: '#4ADE80' },
  pillOff: { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' },
  pillText: { fontWeight: '500' },
  pillTextOn: { color: '#14532D' },
  pillTextOff: { color: '#991B1B' },
  navbar: { position: 'absolute', backgroundColor: ORANGE },
  error: { color: '#B91C1C', marginTop: 12, textAlign: 'center' },
})
