import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useRouter } from 'expo-router'
import { api } from '../lib/api'
import { saveSession } from '../lib/auth'

// Desain Figma: frame 222x484. Ukuran diskalakan dari lebar layar.
const DESIGN_WIDTH = 222
const ORANGE = '#C2410C'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login() {
  const { width } = useWindowDimensions()
  const s = width / DESIGN_WIDTH
  const router = useRouter()

  const [mode, setMode] = useState('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const isSignIn = mode === 'signin'

  const submit = async () => {
    if (!EMAIL_RE.test(email) || !password || (!isSignIn && !name.trim())) {
      return Alert.alert('Data belum lengkap', 'Isi semua kolom dengan benar.')
    }
    if (!isSignIn && (password.length < 8 || password.length > 72)) {
      return Alert.alert('Password tidak valid', 'Password harus 8-72 karakter.')
    }

    setLoading(true)
    try {
      if (isSignIn) {
        const data = await api('/api/users/login', { method: 'POST', body: { email, password } })
        await saveSession({ token: data.token, user: data.user })
        router.replace('/home')
      } else {
        await api('/api/users/register', { method: 'POST', body: { name: name.trim(), email, password } })
        setMode('signin')
        setPassword('')
        Alert.alert('Akun dibuat', 'Silakan sign in.')
      }
    } catch (e) {
      Alert.alert('Gagal', e.message)
    } finally {
      setLoading(false)
    }
  }

  const field = (label, props) => (
    <View style={{ marginTop: 16 * s }}>
      <Text style={[styles.label, { fontSize: 8 * s, marginBottom: 6 * s }]}>{label}</Text>
      <TextInput
        style={[styles.input, { height: 26 * s, borderRadius: 15 * s, paddingHorizontal: 12 * s, fontSize: 8 * s }]}
        placeholderTextColor="rgba(0,0,0,0.35)"
        autoCapitalize="none"
        {...props}
      />
    </View>
  )

  const tab = (key, label) => (
    <Pressable
      onPress={() => setMode(key)}
      style={[styles.tab, { borderRadius: 7 * s }, mode === key && styles.tabActive]}
    >
      <Text style={[mode === key ? styles.tabTextActive : styles.tabText, { fontSize: 8 * s }]}>{label}</Text>
    </Pressable>
  )

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20 * s, paddingTop: 91 * s, paddingBottom: 40 * s }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { fontSize: 15 * s }]}>Welcome to LokaWear</Text>
        <Text style={[styles.subtitle, { fontSize: 6 * s, marginTop: 4 * s }]}>
          Sign in or create an account to see local brand pre-orders
        </Text>

        <View style={[styles.tabs, { height: 26 * s, borderRadius: 7 * s, padding: 3 * s, marginTop: 14 * s }]}>
          {tab('signin', 'Sign In')}
          {tab('signup', 'Sign Up')}
        </View>

        {!isSignIn && field('Name', { value: name, onChangeText: setName, placeholder: 'Nama lengkap', autoCapitalize: 'words' })}
        {field(isSignIn ? 'Email / Username' : 'Email', {
          value: email,
          onChangeText: setEmail,
          placeholder: 'nama@email.com',
          keyboardType: 'email-address',
        })}
        {field('Password', { value: password, onChangeText: setPassword, placeholder: '••••••••', secureTextEntry: true })}

        {isSignIn && <Text style={[styles.forgot, { fontSize: 6 * s, marginTop: 8 * s }]}>Forgot password?</Text>}

        <Pressable
          onPress={submit}
          disabled={loading}
          style={[styles.button, { height: 26 * s, borderRadius: 7 * s, marginTop: (isSignIn ? 12 : 24) * s }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.buttonText, { fontSize: 8 * s }]}>{isSignIn ? 'Sign In' : 'Sign Up'}</Text>
          )}
        </Pressable>

        <Pressable onPress={() => setMode(isSignIn ? 'signup' : 'signin')}>
          <Text style={[styles.switch, { fontSize: 7 * s, marginTop: 14 * s }]}>
            {isSignIn ? "Don't have an account? " : "Already have an account? "}
            <Text style={styles.switchHighlight}>
              {isSignIn ? "Sign up now" : "Sign in"}
            </Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBF9F5' },
  title: { fontWeight: '700', color: '#000', textAlign: 'center' },
  subtitle: { color: 'rgba(0,0,0,0.6)', textAlign: 'center' },
  tabs: { flexDirection: 'row', backgroundColor: 'rgba(194,65,12,0.17)' },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: '#fff' },
  tabText: { fontWeight: '300', color: 'rgba(0,0,0,0.39)' },
  tabTextActive: { fontWeight: '600', color: '#000' },
  label: { color: '#000', fontWeight: '500' },
  input: {
    backgroundColor: '#fff',
    color: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  forgot: { alignSelf: 'flex-end', fontWeight: '300', color: '#000' },
  button: { backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  switch: { textAlign: 'center', color: 'rgba(0,0,0,0.6)', fontWeight: '300' },
  switchHighlight: {
    fontWeight: "bold",
    color: "#C2410C",
  },
})
