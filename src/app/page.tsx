'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Home,
  Heart,
  ArrowRight,
  Search,
  Wrench,
  User as UserIcon,
  LogIn,
  Grid3X3,
} from 'lucide-react'
import { toolsData, type ToolDef } from '@/lib/tools-data'
import AdBanner from '@/components/ui/AdBanner'
import {
  recordPageView, recordToolUsageAnalytics, isToolActive, getSetting,
  getCurrentUser, logoutUser, validateAdminToken, clearAdminToken,
  verifyAdmin, saveAdminToken, generateToken,
  getUserFavorites, setUserFavorites, addUserHistoryEntry,
  incrementUserUsage,
  type User,
} from '@/lib/storage'

// Tool components
import PasswordGenerator from '@/components/tools/PasswordGenerator'
import ColorConverter from '@/components/tools/ColorConverter'
import UnitConverter from '@/components/tools/UnitConverter'
import WordCounter from '@/components/tools/WordCounter'
import JsonFormatter from '@/components/tools/JsonFormatter'
import Base64Tool from '@/components/tools/Base64Tool'
import Calculator from '@/components/tools/Calculator'
import Stopwatch from '@/components/tools/Stopwatch'
import TextCaseConverter from '@/components/tools/TextCaseConverter'
import QrCodeGenerator from '@/components/tools/QrCodeGenerator'
import ImageToPdf from '@/components/tools/ImageToPdf'
import ImageResizer from '@/components/tools/ImageResizer'
import ImageConverter from '@/components/tools/ImageConverter'
import ImageCompressor from '@/components/tools/ImageCompressor'

// Admin components
import AdminLogin from '@/components/admin/AdminLogin'
import AdminPanel from '@/components/admin/AdminPanel'

// User components
import UserLoginForm from '@/components/user/UserLoginForm'
import UserRegisterForm from '@/components/user/UserRegisterForm'
import UserProfile from '@/components/user/UserProfile'

// Promo & Share
import PromoSection from '@/components/PromoSection'
import ShareSheet from '@/components/ShareSheet'

type View = 'home' | 'tool' | 'auth' | 'register' | 'profile' | 'admin'

const toolComponents: Record<string, React.ComponentType> = {
  'password-generator': PasswordGenerator,
  'color-converter': ColorConverter,
  'unit-converter': UnitConverter,
  'word-counter': WordCounter,
  'json-formatter': JsonFormatter,
  'base64-tool': Base64Tool,
  'calculator': Calculator,
  'stopwatch': Stopwatch,
  'text-case-converter': TextCaseConverter,
  'qr-code-generator': QrCodeGenerator,
  'image-to-pdf': ImageToPdf,
  'image-resizer': ImageResizer,
  'image-converter': ImageConverter,
  'image-compressor': ImageCompressor,
}

export default function ToolboxApp() {
  const [currentView, setCurrentView] = useState<View>('home')
  const [activeTool, setActiveTool] = useState<ToolDef | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [adminToken, setAdminToken] = useState<string | null>(null)
  const [appName, setAppName] = useState('مجموعة أدواتي')

  // Load user and settings on mount
  useEffect(() => {
    const user = getCurrentUser()
    if (user) setCurrentUser(user)

    // Check admin session
    const adminSession = localStorage.getItem('toolbox_admin_token')
    if (adminSession) {
      try {
        const parsed = JSON.parse(adminSession)
        if (validateAdminToken(parsed.token)) setAdminToken(parsed.token)
      } catch { /* ignore */ }
    }

    if (getSetting('analytics_enabled') !== 'false') {
      recordPageView()
    }
    setAppName(getSetting('app_name') || 'مجموعة أدواتي')
  }, [])

  // Sync favorites with user account
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    return JSON.parse(localStorage.getItem('toolbox_favorites') || '[]')
  })

  // When user logs in, sync their cloud favorites
  useEffect(() => {
    if (currentUser) {
      const userFavs = getUserFavorites(currentUser.id)
      if (userFavs.length > 0) {
        setFavorites(userFavs)
        localStorage.setItem('toolbox_favorites', JSON.stringify(userFavs))
      }
    }
  }, [currentUser?.id])

  const toggleFavorite = useCallback((slug: string) => {
    setFavorites(prev => {
      const updated = prev.includes(slug)
        ? prev.filter(f => f !== slug)
        : [...prev, slug]
      localStorage.setItem('toolbox_favorites', JSON.stringify(updated))
      // Save to user account if logged in
      if (currentUser) {
        setUserFavorites(currentUser.id, updated)
      }
      return updated
    })
  }, [currentUser])

  const openTool = useCallback((tool: ToolDef) => {
    setActiveTool(tool)
    setCurrentView('tool')

    if (getSetting('analytics_enabled') !== 'false') {
      recordToolUsageAnalytics(tool.slug)
    }

    // Record in user history
    if (currentUser) {
      addUserHistoryEntry(currentUser.id, {
        toolSlug: tool.slug,
        toolNameAr: tool.nameAr,
        timestamp: new Date().toISOString(),
      })
      incrementUserUsage(currentUser.id)
    }
  }, [currentUser])

  const handleUserLogin = (user: User) => {
    setCurrentUser(user)
    setCurrentView('profile')
  }

  const handleUserLogout = () => {
    logoutUser()
    setCurrentUser(null)
    setCurrentView('home')
  }

  const handleAdminLogin = async (email: string, password: string) => {
    const valid = await verifyAdmin(email, password)
    if (valid) {
      const token = generateToken()
      saveAdminToken(token)
      setAdminToken(token)
    }
  }

  const handleAdminLogout = () => {
    setAdminToken(null)
    clearAdminToken()
    setCurrentView('home')
  }

  // Filter tools
  const filteredTools = toolsData.filter(tool => {
    if (!isToolActive(tool.slug)) return false
    const matchesSearch = searchQuery === '' ||
      tool.nameAr.includes(searchQuery) ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.descriptionAr.includes(searchQuery)
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const activeCategories = ['all', ...new Set(toolsData.filter(t => isToolActive(t.slug)).map(t => t.category))]

  const handleOpenToolFromProfile = (slug: string) => {
    const tool = toolsData.find(t => t.slug === slug)
    if (tool) openTool(tool)
  }

  const renderBottomNav = () => (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16">
        <button
          onClick={() => { setCurrentView('home'); setActiveTool(null) }}
          className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg transition-colors ${
            currentView === 'home' ? 'text-teal-600' : 'text-muted-foreground'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">الرئيسية</span>
        </button>
        <button
          onClick={() => { setCurrentView('home'); setActiveTool(null); setSelectedCategory('favorites') }}
          className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg transition-colors ${
            selectedCategory === 'favorites' && currentView === 'home' ? 'text-rose-500' : 'text-muted-foreground'
          }`}
        >
          <Heart className="w-5 h-5" />
          <span className="text-[10px]">المفضلة</span>
        </button>
        {currentUser ? (
          <button
            onClick={() => setCurrentView('profile')}
            className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg transition-colors ${
              currentView === 'profile' ? 'text-teal-600' : 'text-muted-foreground'
            }`}
          >
            <div className="w-5 h-5 text-lg flex items-center justify-center">{currentUser.avatar}</div>
            <span className="text-[10px]">حسابي</span>
          </button>
        ) : (
          <button
            onClick={() => setCurrentView('auth')}
            className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg transition-colors ${
              currentView === 'auth' || currentView === 'register' ? 'text-teal-600' : 'text-muted-foreground'
            }`}
          >
            <LogIn className="w-5 h-5" />
            <span className="text-[10px]">دخول</span>
          </button>
        )}
      </div>
    </nav>
  )

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AnimatePresence mode="wait">
        {/* HOME VIEW */}
        {currentView === 'home' && (
          <motion.main
            key="home"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex-1 pb-20"
          >
            {/* Header */}
            <div className="gradient-header text-white px-4 pt-12 pb-8">
              <div className="max-w-lg mx-auto">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Grid3X3 className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold">{appName}</h1>
                    <p className="text-white/70 text-sm">أدوات مجانية للجميع</p>
                  </div>
                  {/* Share button in header */}
                  <ShareSheet />
                  {/* User avatar in header */}
                  {currentUser && (
                    <button
                      onClick={() => setCurrentView('profile')}
                      className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm text-lg"
                    >
                      {currentUser.avatar}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="max-w-lg mx-auto px-4 -mt-4">
              <AdBanner position="top" />

              {/* Search */}
              <div className="relative mb-4 mt-4">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن أداة..."
                  className="pr-10 pl-4 h-12 rounded-2xl bg-card shadow-md border-0 text-base"
                />
              </div>

              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin mb-4 -mx-4 px-4">
                {activeCategories.map(cat => {
                  if (cat === 'favorites') return null
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedCategory === cat
                          ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md'
                          : 'bg-muted text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      {cat === 'all' ? 'الكل' : cat}
                    </button>
                  )
                })}
              </div>

              {/* Tools Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {(selectedCategory === 'favorites'
                  ? filteredTools.filter(t => favorites.includes(t.slug))
                  : filteredTools
                ).map((tool) => (
                  <motion.button
                    key={tool.slug}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openTool(tool)}
                    className="relative"
                  >
                    <Card className="border-0 shadow-sm hover:shadow-md transition-all overflow-hidden h-full">
                      <CardContent className="p-3 flex flex-col items-center text-center gap-2">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.bgGradient} flex items-center justify-center`}>
                          {renderToolIcon(tool.icon)}
                        </div>
                        <span className="text-xs font-medium leading-tight line-clamp-2">{tool.nameAr}</span>
                      </CardContent>
                    </Card>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(tool.slug) }}
                      className="absolute top-1 left-1 p-1 rounded-full bg-card/80 backdrop-blur-sm"
                    >
                      <Heart className={`w-3.5 h-3.5 ${favorites.includes(tool.slug) ? 'text-rose-500 fill-rose-500' : 'text-muted-foreground'}`} />
                    </button>
                  </motion.button>
                ))}
              </div>

              {filteredTools.length === 0 && selectedCategory !== 'favorites' && (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg mb-1">لا توجد نتائج</p>
                  <p className="text-sm">جرب البحث بكلمات أخرى</p>
                </div>
              )}

              {selectedCategory === 'favorites' && filteredTools.filter(t => favorites.includes(t.slug)).length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Heart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-lg mb-1">لا توجد أدوات مفضلة</p>
                  <p className="text-sm">اضغط على ❤️ بجانب أي أداة لإضافتها للمفضلة</p>
                  {!currentUser && (
                    <Button variant="outline" className="mt-3 text-sm" onClick={() => setCurrentView('auth')}>
                      <LogIn className="w-4 h-4 ml-1" />
                      سجل دخولك لحفظ المفضلة
                    </Button>
                  )}
                </div>
              )}

              {/* Promo Section */}
              <div className="mt-6">
                <PromoSection />
              </div>

              <AdBanner position="between" />
              <div className="mt-4">
                <AdBanner position="bottom" />
              </div>
            </div>
          </motion.main>
        )}

        {/* TOOL VIEW */}
        {currentView === 'tool' && activeTool && (
          <motion.main
            key="tool"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex-1 pb-20"
          >
            <div className={`bg-gradient-to-r ${activeTool.bgGradient} text-white px-4 pt-12 pb-4`}>
              <div className="max-w-lg mx-auto flex items-center gap-3">
                <button
                  onClick={() => setCurrentView('home')}
                  className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-bold truncate">{activeTool.nameAr}</h1>
                  <p className="text-white/70 text-xs">{activeTool.descriptionAr}</p>
                </div>
                <ShareSheet toolSlug={activeTool.slug} toolName={activeTool.nameAr} />
                <button
                  onClick={() => toggleFavorite(activeTool.slug)}
                  className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm"
                >
                  <Heart className={`w-5 h-5 ${favorites.includes(activeTool.slug) ? 'fill-white' : ''}`} />
                </button>
              </div>
            </div>
            <div className="max-w-lg mx-auto px-4 py-4">
              <AdBanner position="top" />
              <div className="mt-4">
                {(() => {
                  const ToolComponent = toolComponents[activeTool.slug]
                  return ToolComponent ? <ToolComponent /> : null
                })()}
              </div>
              <div className="mt-4">
                <AdBanner position="bottom" />
              </div>
            </div>
          </motion.main>
        )}

        {/* LOGIN VIEW */}
        {currentView === 'auth' && (
          <motion.main key="auth" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="flex-1 pb-20">
            <UserLoginForm
              onLogin={handleUserLogin}
              onSwitchToRegister={() => setCurrentView('register')}
              onBack={() => setCurrentView('home')}
            />
          </motion.main>
        )}

        {/* REGISTER VIEW */}
        {currentView === 'register' && (
          <motion.main key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="flex-1 pb-20">
            <UserRegisterForm
              onRegister={handleUserLogin}
              onSwitchToLogin={() => setCurrentView('auth')}
              onBack={() => setCurrentView('home')}
            />
          </motion.main>
        )}

        {/* PROFILE VIEW */}
        {currentView === 'profile' && currentUser && (
          <motion.main key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="flex-1 pb-20">
            <UserProfile
              user={currentUser}
              onLogout={handleUserLogout}
              onToggleFavorite={toggleFavorite}
              favorites={favorites}
              onAdminAccess={() => setCurrentView('admin')}
              isAdminLoggedIn={!!adminToken}
              onOpenTool={handleOpenToolFromProfile}
            />
          </motion.main>
        )}

        {/* ADMIN VIEW (hidden from nav) */}
        {currentView === 'admin' && (
          <motion.main key="admin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="flex-1 pb-20">
            <div className="gradient-header text-white px-4 pt-12 pb-4">
              <div className="max-w-lg mx-auto">
                <button
                  onClick={() => setCurrentView(currentUser ? 'profile' : 'home')}
                  className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span className="text-sm">العودة</span>
                </button>
                <h1 className="text-xl font-bold">لوحة التحكم</h1>
              </div>
            </div>
            <div className="max-w-lg mx-auto px-4 py-4">
              {adminToken ? (
                <AdminPanel onLogout={handleAdminLogout} />
              ) : (
                <AdminLogin onLogin={(token) => { setAdminToken(token); saveAdminToken(token) }} />
              )}
            </div>
          </motion.main>
        )}
      </AnimatePresence>

      {renderBottomNav()}
    </div>
  )
}

function renderToolIcon(iconName: string) {
  const iconMap: Record<string, React.ReactNode> = {
    KeyRound: <span className="text-white text-lg">🔑</span>,
    Palette: <span className="text-white text-lg">🎨</span>,
    Ruler: <span className="text-white text-lg">📏</span>,
    FileText: <span className="text-white text-lg">📄</span>,
    Braces: <span className="text-white text-lg">{"{}"}</span>,
    Lock: <span className="text-white text-lg">🔒</span>,
    Calculator: <span className="text-white text-lg">🧮</span>,
    Timer: <span className="text-white text-lg">⏱️</span>,
    CaseSensitive: <span className="text-white text-lg">Aa</span>,
    QrCode: <span className="text-white text-lg">📱</span>,
    Maximize2: <span className="text-white text-lg">↔️</span>,
    RefreshCw: <span className="text-white text-lg">🔄</span>,
    Gauge: <span className="text-white text-lg">💾</span>,
  }
  return iconMap[iconName] || <Wrench className="w-6 h-6 text-white" />
}
