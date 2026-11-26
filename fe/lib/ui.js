// Desain Figma: frame 222 lebar. Ukuran diskalakan dari lebar layar (s = lebar / DESIGN_WIDTH).
export const DESIGN_WIDTH = 222
export const ORANGE = '#C2410C'
export const BG = '#FAF7F2'

export const shadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 4,
}

export const rupiah = (n) => `Rp. ${String(Math.round(Number(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
export const shortMonth = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short' })
export const shortDate = (d) => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })

// Kolom image di backend bisa berisi nama file; hanya URL http(s) yang bisa ditampilkan.
export const imgSource = (uri) => (typeof uri === 'string' && /^https?:\/\//i.test(uri) ? { uri } : null)
