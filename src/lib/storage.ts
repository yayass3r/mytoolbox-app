// Local storage utility for static site data persistence

const STORAGE_KEYS = {
  ADMIN_CREDENTIALS: 'toolbox_admin_creds',
  ADMIN_TOKEN: 'toolbox_admin_token',
  ADS: 'toolbox_ads',
  TOOLS: 'toolbox_tools_state',
  ANALYTICS: 'toolbox_analytics',
  SETTINGS: 'toolbox_settings',
  FAVORITES: 'toolbox_favorites',
} as const

// Default admin credentials ( hashed with simple algorithm)
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

// Admin authentication
export async function verifyAdmin(email: string, password: string): Promise<boolean> {
  const hash = await hashPassword(password)
  return email === DEFAULT_ADMIN.email && hash === DEFAULT_ADMIN.passwordHash
}

// Token management
export function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function saveToken(token: string): void {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, JSON.stringify({ token, expires }))
}

export function validateToken(token: string): boolean {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN) || '{}')
    if (data.token !== token) return false
    return new Date(data.expires) > new Date()
  } catch {
    return false
  }
}

export function clearToken(): void {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN)
}

// Ads management
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

// Tools state management
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

// Analytics
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
    // Keep only last 30 days
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

// Settings
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
    { key: 'admin_password', value: '' },
  ]

  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '[]')
    // Merge with defaults
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
