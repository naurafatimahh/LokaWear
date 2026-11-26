import { useEffect, useState } from 'react'
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { api } from '../lib/api'
import { BG, DESIGN_WIDTH, ORANGE, imgSource, rupiah, shadow, shortMonth } from '../lib/ui'

// "Ends in 2 days" untuk label di kartu Closing Soon
const endsIn = (end) => {
  const days = Math.ceil((new Date(end) - Date.now()) / 86400000)
  return days <= 1 ? 'Ends today' : `Ends in ${days} days`
}

export default function UserHome({ user, onLogout }) {
  const { width } = useWindowDimensions()
  const s = width / DESIGN_WIDTH
  const insets = useSafeAreaInsets()

  const [products, setProducts] = useState([])
  const [brands, setBrands] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([api('/api/products'), api('/api/brands')])
      .then(([p, b]) => {
        setProducts(p.data)
        setBrands(b.data)
      })
      .catch((e) => setError(e.message))
  }, [])

  // Backend belum punya endpoint rekomendasi/stok, jadi pengelompokan dilakukan di sini dari data produk.
  const now = Date.now()
  const upcoming = products
    .filter((p) => p.po_start && new Date(p.po_start) > now)
    .sort((a, b) => new Date(a.po_start) - new Date(b.po_start))
    .slice(0, 3)
  const closingSoon = products
    .filter((p) => p.po_end && new Date(p.po_end) > now && !(p.po_start && new Date(p.po_start) > now))
    .sort((a, b) => new Date(a.po_end) - new Date(b.po_end))
    .slice(0, 3)
  const recommended = products.slice(0, 2)
  const backInStock = products.filter((p) => imgSource(p.image) && !recommended.includes(p)).slice(0, 2)

  const Title = ({ children }) => (
    <Text style={[styles.sectionTitle, { fontSize: 10 * s, marginTop: 14 * s, marginBottom: 8 * s }]}>{children}</Text>
  )

  const Photo = ({ product, height = 77, bottomShade = 0, restock = false }) => {
    const src = imgSource(product.image)
    return (
      <View style={{ flex: 1, height: height * s, borderRadius: 8 * s, overflow: 'hidden', backgroundColor: '#D9D9D9' }}>
        {src && <Image source={src} style={StyleSheet.absoluteFill} resizeMode="cover" />}
        {bottomShade > 0 && (
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.5)']}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: bottomShade * s }}
          />
        )}
        {restock && (
          <View style={[styles.restockRow, { left: 6 * s, right: 6 * s, bottom: 4 * s }]}>
            <Text numberOfLines={1} style={[styles.restockBrand, { fontSize: 5 * s }]}>{product.brand_name}</Text>
            <View style={[styles.restockPill, { height: 6 * s * 1.6, borderRadius: 12 * s, paddingHorizontal: 5 * s }]}>
              <Text style={[styles.restockText, { fontSize: 5 * s }]}>Restock</Text>
            </View>
          </View>
        )}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20 * s, paddingTop: insets.top + 8 * s, paddingBottom: 70 * s }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.brand, { fontSize: 12 * s }]}>LokaWear</Text>
          <Pressable onPress={onLogout} hitSlop={8}>
            <Text style={[styles.logout, { fontSize: 7 * s }]}>Logout</Text>
          </Pressable>
        </View>
        <Text style={[styles.sectionTitle, { fontSize: 10 * s, marginTop: 4 * s }]}>Halo, {user.name}</Text>

        <View style={[styles.search, { height: 22 * s, borderRadius: 10 * s, marginTop: 16 * s, paddingHorizontal: 10 * s }]}>
          <Text style={[styles.searchText, { fontSize: 7 * s }]}>Cari brand atau produk</Text>
        </View>

        {/* Banner statis; foto di-crop sesuai offset di Figma */}
        <View style={{ height: 74 * s, borderRadius: 10 * s, marginTop: 12 * s, overflow: 'hidden' }}>
          <Image
            source={require('../assets/hero-banner.png')}
            style={{ position: 'absolute', width: '100%', height: '312.5%', left: '0.06%', top: '-156.28%' }}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.52)']}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 15 * s }}
          />
        </View>

        {error && <Text style={[styles.errorText, { fontSize: 8 * s }]}>{error}</Text>}

        {recommended.length > 0 && (
          <>
            <Title>Recommended for You</Title>
            <View style={{ flexDirection: 'row', gap: 6 * s }}>
              {recommended.map((p) => <Photo key={p.product_id} product={p} />)}
            </View>
          </>
        )}

        {closingSoon.length > 0 && (
          <>
            <Title>Closing Soon</Title>
            {closingSoon.map((p) => {
              const src = imgSource(p.image)
              return (
                <View key={p.product_id} style={[styles.card, { height: 56 * s, borderRadius: 6 * s, marginBottom: 14 * s, paddingHorizontal: 12 * s }]}>
                  <View style={[styles.thumb, { width: 41 * s, height: 41 * s, borderRadius: 10 * s }]}>
                    {src && <Image source={src} style={StyleSheet.absoluteFill} resizeMode="cover" />}
                  </View>
                  <View style={{ marginLeft: 10 * s, flex: 1, alignSelf: 'stretch', paddingVertical: 8 * s, justifyContent: 'space-between' }}>
                    <View>
                      <Text numberOfLines={1} style={[styles.cardTitle, { fontSize: 8 * s }]}>{p.product_name}</Text>
                      <Text numberOfLines={1} style={[styles.light, { fontSize: 6 * s }]}>{p.brand_name}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={[styles.priceBold, { fontSize: 6 * s }]}>{rupiah(p.price)}</Text>
                      <View style={[styles.endsPill, { height: 10 * s, borderRadius: 12 * s, paddingHorizontal: 6 * s }]}>
                        <Text style={[styles.endsText, { fontSize: 5 * s }]}>{endsIn(p.po_end)}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )
            })}
          </>
        )}

        {brands.length > 0 && (
          <>
            <Title>New Collections</Title>
            {brands.slice(0, 2).map((b) => (
              <View key={b.brand_id} style={[styles.collection, { height: 74 * s, borderRadius: 9 * s, marginBottom: 7 * s, padding: 10 * s }]}>
                <Text style={[styles.heroTitle, { fontSize: 10 * s }]}>{b.brand_name}</Text>
              </View>
            ))}
          </>
        )}

        {backInStock.length > 0 && (
          <>
            <Title>Back in Stock</Title>
            <View style={{ flexDirection: 'row', gap: 7 * s }}>
              {backInStock.map((p) => <Photo key={p.product_id} product={p} bottomShade={22} restock />)}
            </View>
          </>
        )}

        {upcoming.length > 0 && (
          <>
            <Title>Upcoming Pre-Orders</Title>
            {upcoming.map((p) => (
              <View key={p.product_id} style={[styles.row, { height: 25 * s, borderRadius: 10 * s, marginBottom: 12 * s, paddingHorizontal: 10 * s }]}>
                <Text style={[styles.light, { fontSize: 5 * s, width: 20 * s }]}>{shortMonth(p.po_start)}</Text>
                <Text numberOfLines={1} style={[styles.light, { fontSize: 6 * s, flex: 1 }]}>{p.brand_name}</Text>
                <Pressable
                  onPress={() => Alert.alert('Remind me', 'Fitur pengingat belum tersedia.')}
                  style={[styles.pill, { height: 13 * s, width: 47 * s, borderRadius: 12 * s }]}
                >
                  <Text style={[styles.pillText, { fontSize: 7 * s }]}>Remind me</Text>
                </Pressable>
              </View>
            ))}
          </>
        )}

        {!error && products.length === 0 && (
          <Text style={[styles.empty, { fontSize: 8 * s, marginTop: 24 * s }]}>Belum ada produk.</Text>
        )}
      </ScrollView>

      {/* Navbar: desain ikon belum ditentukan di Figma */}
      <View style={[styles.navbar, { left: 20 * s, right: 20 * s, height: 28 * s, bottom: 16 * s }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontWeight: '700', color: '#000' },
  logout: { color: 'rgba(0,0,0,0.5)', fontWeight: '300' },
  sectionTitle: { fontWeight: '600', color: '#000' },
  search: { backgroundColor: '#F7F7F7', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.17, shadowRadius: 4, elevation: 3 },
  searchText: { color: 'rgba(0,0,0,0.35)' },
  hero: { backgroundColor: '#9B340A', justifyContent: 'flex-end' },
  collection: { backgroundColor: '#9B340A', justifyContent: 'flex-end' },
  heroTitle: { color: '#fff', fontWeight: '600' },
  priceBold: { fontWeight: '700', color: '#000' },
  endsPill: { backgroundColor: '#FDE6D8', alignItems: 'center', justifyContent: 'center' },
  endsText: { fontWeight: '500', color: ORANGE },
  restockRow: { position: 'absolute', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  restockBrand: { color: '#fff', fontWeight: '300', flex: 1 },
  restockPill: { backgroundColor: '#85DE98', alignItems: 'center', justifyContent: 'center' },
  restockText: { color: '#145522', fontWeight: '500' },
  card: { backgroundColor: '#F7F7F7', flexDirection: 'row', alignItems: 'center', ...shadow },
  thumb: { backgroundColor: '#FDE6D8', overflow: 'hidden', ...shadow },
  cardTitle: { fontWeight: '600', color: '#000' },
  light: { color: '#000', fontWeight: '300' },
  price: { color: '#000', marginTop: 2 },
  row: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', ...shadow },
  pill: { backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center' },
  pillText: { color: '#fff', fontWeight: '600' },
  navbar: { position: 'absolute', backgroundColor: ORANGE },
  errorText: { color: '#B91C1C', marginTop: 12, textAlign: 'center' },
  empty: { textAlign: 'center', color: 'rgba(0,0,0,0.5)' },
})
