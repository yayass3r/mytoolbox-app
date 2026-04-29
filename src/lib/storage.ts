// Local storage utility for static site data persistence

const STORAGE_KEYS = {
  ADMIN_TOKEN: 'toolbox_admin_token',
  USERS_DB: 'toolbox_users_db',
  CURRENT_USER: 'toolbox_current_user',
  ADS: 'toolbox_ads',
  TOOLS: 'toolbox_tools_state',
  ANALYTICS: 'toolbox_analytics',
  SETTINGS: 'toolbox_settings',
  FAVORITES: 'toolbox_favorites',
  USER_FAVORITES_PREFIX: 'toolbox_user_favs_',
  USER_HISTORY_PREFIX: 'toolbox_user_hist_',
} as const

// Default admin credentials
const DEFAULT_ADMIN = {
  email: 'admin@toolbox.com',
  passwordHash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', // sha256 of 'admin123'
}

// Simple SHA-256 hash using Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ==================== USER MANAGEMENT ====================

export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  avatar: string
  joinDate: string
  lastLogin: string
  isPremium: boolean
  usageCount: number
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 8)
}

const AVATARS = ['😊', '😎', '🤓', '🧑‍💻', '👩‍💻', '🦊', '🐱', '🦁', '🐼', '🦄', '🌟', '⭐', '🔥', '💎', '🎯', '🎨']

export function getRandomAvatar(): string {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)]
}

export function getUsersDB(): User[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS_DB) || '[]')
  } catch {
    return []
  }
}

function saveUsersDB(users: User[]): void {
  localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users))
}

export async function registerUser(name: string, email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
  if (!name.trim()) return { success: false, error: 'الاسم مطلوب' }
  if (!email.includes('@')) return { success: false, error: 'بريد إلكتروني غير صالح' }
  if (password.length < 6) return { success: false, error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }

  const users = getUsersDB()
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, error: 'هذا البريد الإلكتروني مسجل مسبقاً' }
  }

  const passwordHash = await hashPassword(password)
  const newUser: User = {
    id: generateId(),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    avatar: getRandomAvatar(),
    joinDate: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    isPremium: false,
    usageCount: 0,
  }

  users.push(newUser)
  saveUsersDB(users)

  // Save session
  const session = { userId: newUser.id, token: generateId(), expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(session))

  return { success: true, user: newUser }
}

export async function loginUser(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
  const users = getUsersDB()
  const user = users.find(u => u.email === email.toLowerCase().trim())
  if (!user) return { success: false, error: 'بريد إلكتروني أو كلمة مرور غير صحيحة' }

  const hash = await hashPassword(password)
  if (hash !== user.passwordHash) return { success: false, error: 'بريد إلكتروني أو كلمة مرور غير صحيحة' }

  // Update last login
  user.lastLogin = new Date().toISOString()
  saveUsersDB(users)

  // Save session
  const session = { userId: user.id, token: generateId(), expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(session))

  return { success: true, user }
}

export function getCurrentUser(): User | null {
  try {
    const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || 'null')
    if (!session) return null
    if (new Date(session.expires) < new Date()) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
      return null
    }
    const users = getUsersDB()
    return users.find(u => u.id === session.userId) || null
  } catch {
    return null
  }
}

export function logoutUser(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
}

export function updateUserProfile(userId: string, updates: Partial<User>): void {
  const users = getUsersDB().map(u => u.id === userId ? { ...u, ...updates } : u)
  saveUsersDB(users)
}

export function incrementUserUsage(userId: string): void {
  const users = getUsersDB().map(u => u.id === userId ? { ...u, usageCount: (u.usageCount || 0) + 1 } : u)
  saveUsersDB(users)
}

// User Favorites (per-user)
export function getUserFavorites(userId: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_FAVORITES_PREFIX + userId) || '[]')
  } catch {
    return []
  }
}

export function setUserFavorites(userId: string, favorites: string[]): void {
  localStorage.setItem(STORAGE_KEYS.USER_FAVORITES_PREFIX + userId, JSON.stringify(favorites))
}

// User History
export interface HistoryEntry {
  toolSlug: string
  toolNameAr: string
  timestamp: string
}

export function getUserHistory(userId: string): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_HISTORY_PREFIX + userId) || '[]')
  } catch {
    return []
  }
}

export function addUserHistoryEntry(userId: string, entry: HistoryEntry): void {
  const history = getUserHistory(userId)
  // Add to beginning, remove duplicates, keep last 50
  const filtered = history.filter(h => h.toolSlug !== entry.toolSlug)
  filtered.unshift(entry)
  if (filtered.length > 50) filtered.length = 50
  localStorage.setItem(STORAGE_KEYS.USER_HISTORY_PREFIX + userId, JSON.stringify(filtered))
}

// ==================== ADMIN AUTHENTICATION ====================

export async function verifyAdmin(email: string, password: string): Promise<boolean> {
  const hash = await hashPassword(password)
  return email === DEFAULT_ADMIN.email && hash === DEFAULT_ADMIN.passwordHash
}

export function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function saveAdminToken(token: string): void {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, JSON.stringify({ token, expires }))
}

export function validateAdminToken(token: string): boolean {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN) || '{}')
    if (data.token !== token) return false
    return new Date(data.expires) > new Date()
  } catch {
    return false
  }
}

export function clearAdminToken(): void {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN)
}

// ==================== ADS MANAGEMENT ====================

export interface AdItem {
  id: string
  name: string
  adNetwork: string
  adCode: string
  position: string
  isActive: boolean
  priority: number
  createdAt: string
}

export function getAds(): AdItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ADS) || '[]')
  } catch {
    return []
  }
}

export function saveAd(ad: Omit<AdItem, 'id' | 'createdAt'>): AdItem {
  const ads = getAds()
  const newAd: AdItem = {
    ...ad,
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    createdAt: new Date().toISOString(),
  }
  ads.push(newAd)
  localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(ads))
  return newAd
}

export function updateAd(id: string, updates: Partial<AdItem>): void {
  const ads = getAds().map(ad => ad.id === id ? { ...ad, ...updates } : ad)
  localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(ads))
}

export function deleteAd(id: string): void {
  const ads = getAds().filter(ad => ad.id !== id)
  localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(ads))
}

export function getAdsByPosition(position: string): AdItem[] {
  return getAds().filter(ad => ad.isActive && ad.position === position && ad.adCode)
    .sort((a, b) => b.priority - a.priority)
}

// ==================== TOOLS STATE ====================

export interface ToolState {
  slug: string
  isActive: boolean
  usageCount: number
}

export function getToolsState(): ToolState[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TOOLS) || '[]')
  } catch {
    return []
  }
}

export function updateToolState(slug: string, updates: Partial<ToolState>): void {
  const states = getToolsState()
  const existing = states.findIndex(t => t.slug === slug)
  if (existing >= 0) {
    states[existing] = { ...states[existing], ...updates }
  } else {
    states.push({ slug, isActive: true, usageCount: 0, ...updates })
  }
  localStorage.setItem(STORAGE_KEYS.TOOLS, JSON.stringify(states))
}

export function incrementToolUsage(slug: string): void {
  const states = getToolsState()
  const existing = states.findIndex(t => t.slug === slug)
  if (existing >= 0) {
    states[existing].usageCount = (states[existing].usageCount || 0) + 1
  } else {
    states.push({ slug, isActive: true, usageCount: 1 })
  }
  localStorage.setItem(STORAGE_KEYS.TOOLS, JSON.stringify(states))
}

export function isToolActive(slug: string): boolean {
  const state = getToolsState().find(t => t.slug === slug)
  return state ? state.isActive : true
}

// ==================== ANALYTICS ====================

export interface DailyView {
  date: string
  count: number
}

export interface ToolUsageEntry {
  toolName: string
  count: number
}

export function recordPageView(): void {
  const today = new Date().toISOString().split('T')[0]
  const analytics = getAnalytics()
  const existing = analytics.dailyViews.find(d => d.date === today)
  if (existing) {
    existing.count++
  } else {
    analytics.dailyViews.push({ date: today, count: 1 })
    if (analytics.dailyViews.length > 30) {
      analytics.dailyViews = analytics.dailyViews.slice(-30)
    }
  }
  localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(analytics))
}

export function getAnalytics(): { dailyViews: DailyView[]; toolUsage: ToolUsageEntry[] } {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANALYTICS) || '{}')
    return {
      dailyViews: data.dailyViews || [],
      toolUsage: data.toolUsage || [],
    }
  } catch {
    return { dailyViews: [], toolUsage: [] }
  }
}

export function recordToolUsageAnalytics(toolName: string): void {
  const analytics = getAnalytics()
  const existing = analytics.toolUsage.find(t => t.toolName === toolName)
  if (existing) {
    existing.count++
  } else {
    analytics.toolUsage.push({ toolName, count: 1 })
  }
  localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(analytics))
}

// ==================== SETTINGS ====================

export interface SettingItem {
  key: string
  value: string
}

export function getSettings(): SettingItem[] {
  const defaults: SettingItem[] = [
    { key: 'app_name', value: 'مجموعة أدواتي' },
    { key: 'app_description', value: 'أدوات مجانية للجميع' },
    { key: 'ads_enabled', value: 'true' },
    { key: 'analytics_enabled', value: 'true' },
    { key: 'admin_password_hash', value: '' },
  ]

  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '[]')
    return defaults.map(d => {
      const found = stored.find((s: SettingItem) => s.key === d.key)
      return found || d
    })
  } catch {
    return defaults
  }
}

export function getSetting(key: string): string {
  return getSettings().find(s => s.key === key)?.value || ''
}

export function updateSetting(key: string, value: string): void {
  const settings = getSettings().map(s => s.key === key ? { ...s, value } : s)
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
}
