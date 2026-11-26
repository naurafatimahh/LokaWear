import { useEffect } from 'react'
import { Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { useRouter } from 'expo-router'
import { getSession } from '../lib/auth'

const DESIGN_WIDTH = 222
const SPLASH_MS = 2500

export default function SplashScreen() {
  const { width } = useWindowDimensions()
  const s = width / DESIGN_WIDTH
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    Promise.all([getSession(), new Promise((r) => setTimeout(r, SPLASH_MS))]).then(([session]) => {
      if (!cancelled) router.replace(session ? '/home' : '/login')
    })
    return () => { cancelled = true }
  }, [router])

  return (
    <LinearGradient colors={['#C2410C', '#5C1F06']} style={styles.container}>
      <StatusBar style="light" />
      <View style={[styles.content, { paddingTop: '75%' }]}>
        <View style={{ width: 99 * s, height: 89 * s, borderRadius: 20 * s, overflow: 'hidden' }}>
          <Image
            source={require('../assets/logoPutihLokawear.png')}
            style={{
              position: 'absolute',
              width: '127.46%',
              height: '141.38%',
              left: '-14.34%',
              top: '-16.28%',
            }}
          />
        </View>
        <Text style={[styles.title, { fontSize: 20 * s, marginTop: 10 * s }]}>LokaWear</Text>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center' },
  title: { color: '#FFFFFF', fontWeight: '700' },
})
