'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Home,
  Heart,
  Shield,
  ArrowRight,
  Search,
  Wrench,
  Type,
  Paintbrush,
  Sigma,
  Grid3X3,
} from 'lucide-react'
import { toolsData, categories, type ToolDef } from '@/lib/tools-data'
import AdBanner from '@/components/ui/AdBanner'
import { recordPageView, recordToolUsageAnalytics, isToolActive, getSetting, validateToken } from '@/lib/storage'

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

// Admin components
import AdminLogin from '@/components/admin/AdminLogin'
import AdminPanel from '@/components/admin/AdminPanel'

type View = 'home' | 'tool' | 'admin'

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
}

export default function ToolboxApp() {
  const [currentView, setCurrentView] = useState<View>('home')
  const [activeTool, setActiveTool] = useState<ToolDef | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem('toolbox_favorites')
    if (saved) {
      try { return JSON.parse(saved) } catch { return [] }
    }
    return []
  })
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    const token = localStorage.getItem('toolbox_admin_token')
    if (token) {
      try {
        const parsed = JSON.parse(token)
        if (validateToken(parsed.token)) return parsed.token
      } catch { /* ignore */ }
    }
    return null
  })
  const [appName, setAppName] = useState('مجموعة أدواتي')

  // Record page view & load settings
  useEffect(() => {
    if (getSetting('analytics_enabled') !== 'false') {
      recordPageView()
    }
    setAppName(getSetting('app_name') || 'مجموعة أدواتي')
  }, [])

  const toggleFavorite = (slug: string) => {
    setFavorites(prev => {
      const updated = prev.includes(slug)
        ? prev.filter(f => f !== slug)
        : [...prev, slug]
      localStorage.setItem('toolbox_favorites', JSON.stringify(updated))
      return updated
    })
  }

  const openTool = useCallback((tool: ToolDef) => {
    setActiveTool(tool)
    setCurrentView('tool')

    // Record tool usage
    if (getSetting('analytics_enabled') !== 'false') {
      recordToolUsageAnalytics(tool.slug)
    }
  }, [])

  const handleAdminLogin = (token: string) => {
    setAdminToken(token)
    localStorage.setItem('toolbox_admin_token', JSON.stringify({ token, expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }))
  }

  const handleAdminLogout = () => {
    setAdminToken(null)
    localStorage.removeItem('toolbox_admin_token')
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

  // Get unique categories from tools
  const activeCategories = ['all', ...new Set(toolsData.filter(t => isToolActive(t.slug)).map(t => t.category))]

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
        <button
          onClick={() => setCurrentView('admin')}
          className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg transition-colors ${
            currentView === 'admin' ? 'text-teal-600' : 'text-muted-foreground'
          }`}
        >
          <Shield className="w-5 h-5" />
          <span className="text-[10px]">الإدارة</span>
        </button>
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
                  <div>
                    <h1 className="text-2xl font-bold">{appName}</h1>
                    <p className="text-white/70 text-sm">أدوات مجانية للجميع</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-lg mx-auto px-4 -mt-4">
              {/* Ad Banner Top */}
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
                  if (cat === 'favorites') {
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedCategory === cat
                            ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                            : 'bg-muted text-muted-foreground hover:bg-accent'
                        }`}
                      >
                        <Heart className={`w-4 h-4 inline-block ml-1 ${selectedCategory === cat ? '' : 'text-muted-foreground'}`} />
                        المفضلة
                      </button>
                    )
                  }
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
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(tool.slug) }}
                      className="absolute top-1 left-1 p-1 rounded-full bg-card/80 backdrop-blur-sm"
                    >
                      <Heart className={`w-3.5 h-3.5 ${favorites.includes(tool.slug) ? 'text-rose-500 fill-rose-500' : 'text-muted-foreground'}`} />
                    </button>
                  </motion.button>
                ))}
              </div>

              {filteredTools.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg mb-1">لا توجد نتائج</p>
                  <p className="text-sm">جرب البحث بكلمات أخرى</p>
                </div>
              )}

              {/* Between Ads */}
              <AdBanner position="between" />

              {/* Ad Banner Bottom */}
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
            {/* Tool Header */}
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

        {/* ADMIN VIEW */}
        {currentView === 'admin' && (
          <motion.main
            key="admin"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex-1 pb-20"
          >
            <div className="gradient-header text-white px-4 pt-12 pb-4">
              <div className="max-w-lg mx-auto">
                <button
                  onClick={() => setCurrentView('home')}
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
                <AdminLogin onLogin={handleAdminLogin} />
              )}
            </div>
          </motion.main>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      {renderBottomNav()}
    </div>
  )
}

function renderToolIcon(iconName: string) {
  const iconMap: Record<string, React.ReactNode> = {
    KeyRound: <span className="text-white text-lg">🔑</span>,
    Palette: <span className="text-white text-lg">🎨</span>,
    Ruler: <span className="text-white text-lg">📏</span>,
    FileText: <span className="text-white text-lg">📝</span>,
    Braces: <span className="text-white text-lg">{"{}"}</span>,
    Lock: <span className="text-white text-lg">🔒</span>,
    Calculator: <span className="text-white text-lg">🧮</span>,
    Timer: <span className="text-white text-lg">⏱️</span>,
    CaseSensitive: <span className="text-white text-lg">Aa</span>,
    QrCode: <span className="text-white text-lg">📱</span>,
  }
  return iconMap[iconName] || <Wrench className="w-6 h-6 text-white" />
}
