'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowRight,
  LogOut,
  User as UserIcon,
  Heart,
  Clock,
  Star,
  Crown,
  Shield,
  RefreshCw,
  Save,
  TrendingUp,
  Edit3,
} from 'lucide-react'
import {
  getCurrentUser,
  logoutUser,
  updateUserProfile,
  getUserFavorites,
  getUserHistory,
  setUserFavorites,
  getRandomAvatar,
  type User,
  type HistoryEntry,
} from '@/lib/storage'
import { toolsData } from '@/lib/tools-data'

interface UserProfileProps {
  user: User
  onLogout: () => void
  onToggleFavorite: (slug: string) => void
  favorites: string[]
  onAdminAccess: () => void
  isAdminLoggedIn: boolean
  onOpenTool: (slug: string) => void
}

export default function UserProfile({ user, onLogout, favorites, onToggleFavorite, onAdminAccess, isAdminLoggedIn, onOpenTool }: UserProfileProps) {
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState(user.name)
  const [avatar, setAvatar] = useState(user.avatar)
  const [history, setHistory] = useState<HistoryEntry[]>(() => getUserHistory(user.id))
  const [hideAds, setHideAds] = useState(() => localStorage.getItem('toolbox_hide_ads') === 'true')

  const handleSaveName = () => {
    if (newName.trim()) {
      updateUserProfile(user.id, { name: newName.trim() })
      setEditingName(false)
    }
  }

  const handleSaveAvatar = () => {
    const newAvatar = getRandomAvatar()
    setAvatar(newAvatar)
    updateUserProfile(user.id, { avatar: newAvatar })
  }

  const handleHideAds = (value: boolean) => {
    setHideAds(value)
    localStorage.setItem('toolbox_hide_ads', String(value))
  }

  const handleClearHistory = () => {
    localStorage.removeItem('toolbox_user_hist_' + user.id)
    setHistory([])
  }

  const handleClearFavs = () => {
    setUserFavorites(user.id, [])
    window.location.reload()
  }

  const joinDate = new Date(user.joinDate)
  const daysSinceJoin = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24))

  const recentHistory = history.length > 0 ? history.slice(0, 10) : []
  const userFavs = getUserFavorites(user.id)

  return (
    <div className="min-h-[75vh] flex flex-col">
      <div className="gradient-header text-white px-4 pt-12 pb-6">
        <div className="max-w-lg mx-auto">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
          >
            <ArrowRight className="w-4 h-4" />
            <span className="text-sm">تسجيل الخروج</span>
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSaveAvatar}
              className="relative group shrink-0"
              title="تغيير الصورة الرمزية"
            >
              <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-4xl backdrop-blur-sm border-2 border-white/30">
                {avatar}
              </div>
              <div className="absolute inset-0 rounded-2xl bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-white" />
              </div>
            </button>
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-white/20 border-white/30 text-white h-9 text-lg"
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" className="shrink-0 text-white hover:bg-white/20" onClick={handleSaveName}>
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold truncate">{user.name}</h1>
                  <button onClick={() => setEditingName(true)} className="text-white/60 hover:text-white">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
              <p className="text-white/70 text-sm" dir="ltr">{user.email}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded-full">
                  عضو منذ {daysSinceJoin} يوم
                </span>
                <span className="text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded-full">
                  {user.usageCount} استخدام
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 max-w-lg mx-auto w-full">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="profile" className="text-xs gap-1">
              <UserIcon className="w-3 h-3" />
              حسابي
            </TabsTrigger>
            <TabsTrigger value="favorites" className="text-xs gap-1">
              <Heart className="w-3 h-3" />
              المفضلة
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs gap-1">
              <Clock className="w-3 h-3" />
              السجل
            </TabsTrigger>
            <TabsTrigger value="premium" className="text-xs gap-1">
              <Star className="w-3 h-3" />
              مميزات
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-4 space-y-3">
            <Card className="border-0 shadow-md">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">إخفاء الإعلانات</p>
                    <p className="text-xs text-muted-foreground">تصفح بدون إعلانات مزعجة</p>
                  </div>
                  <Switch checked={hideAds} onCheckedChange={handleHideAds} />
                </div>
              </CardContent>
            </Card>

            {/* Admin Access - only show if admin is logged in */}
            {isAdminLoggedIn && (
              <Card className="border-0 shadow-md border-teal-200">
                <CardContent className="p-4">
                  <button onClick={onAdminAccess} className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-teal-600" />
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">لوحة الإدارة</p>
                        <p className="text-xs text-muted-foreground">إدارة التطبيق</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground rotate-180" />
                  </button>
                </CardContent>
              </Card>
            )}

            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">البريد الإلكتروني</span>
                    <span dir="ltr" className="text-xs">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">تاريخ الانضمام</span>
                    <span className="text-xs">{joinDate.toLocaleDateString('ar')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">آخر تسجيل دخول</span>
                    <span className="text-xs">{new Date(user.lastLogin).toLocaleDateString('ar')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">إجمالي الاستخدامات</span>
                    <span className="font-medium">{user.usageCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm">{favorites.length} أداة مفضلة</h3>
              {favorites.length > 0 && (
                <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={handleClearFavs}>
                  مسح الكل
                </Button>
              )}
            </div>
            {favorites.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">لا توجد أدوات مفضلة</p>
                <p className="text-xs">اضغط على ❤️ بجانب أي أداة لإضافتها</p>
              </div>
            ) : (
              <div className="space-y-2">
                {favorites.map(slug => {
                  const tool = toolsData.find(t => t.slug === slug)
                  if (!tool) return null
                  return (
                    <button
                      key={slug}
                      onClick={() => onOpenTool(slug)}
                      className="w-full flex items-center gap-3 p-3 bg-card rounded-xl shadow-sm hover:shadow-md transition-all text-right"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.bgGradient} flex items-center justify-center shrink-0`}>
                        <span className="text-white">{tool.icon === 'KeyRound' ? '🔑' : tool.icon === 'Palette' ? '🎨' : tool.slug === 'image-to-pdf' ? '📄' : '🔧'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{tool.nameAr}</p>
                        <p className="text-xs text-muted-foreground">{tool.descriptionAr}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleFavorite(slug) }}
                        className="p-1"
                      >
                        <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                      </button>
                    </button>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm">سجل الاستخدام</h3>
              {history.length > 0 && (
                <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={handleClearHistory}>
                  مسح السجل
                </Button>
              )}
            </div>
            {recentHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">لا يوجد سجل بعد</p>
                <p className="text-xs">ستظهر هنا الأدوات التي تستخدمها</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentHistory.map((entry, i) => (
                  <div key={`${entry.toolSlug}-${i}`} className="flex items-center gap-3 p-3 bg-card rounded-xl shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{entry.toolNameAr}</p>
                      <p className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString('ar')}</p>
                    </div>
                    <button onClick={() => onOpenTool(entry.toolSlug)} className="text-xs text-teal-600 font-medium">
                      فتح
                    </button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Premium Tab */}
          <TabsContent value="premium" className="mt-4 space-y-3">
            <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">مميزاتك كعضو مسجل</h3>
                    <p className="text-xs text-muted-foreground">استمتع بهذه المميزات مجاناً</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { icon: '❤️', text: 'حفظ المفضلة في حسابك', done: true },
                    { icon: '📊', text: 'سجل كامل لاستخداماتك', done: true },
                    { icon: '🚫', text: 'إخفاء الإعلانات', done: hideAds },
                    { icon: '👤', text: 'صورة رمزية شخصية', done: true },
                    { icon: '📱', text: 'تصفح بدون قيود', done: true },
                    { icon: '☁️', text: 'مزامنة المفضلة عبر الأجهزة (قريباً)', done: false },
                    { icon: '🎨', text: 'تخصيص شكل التطبيق (قريباً)', done: false },
                  ].map(item => (
                    <div key={item.text} className="flex items-center gap-2 text-sm">
                      <span>{item.icon}</span>
                      <span className={item.done ? '' : 'text-muted-foreground'}>{item.text}</span>
                      {item.done && <span className="text-xs text-emerald-500 mr-auto">✓</span>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-teal-600" />
                  <div>
                    <p className="text-sm font-medium">إحصائياتك</p>
                    <p className="text-xs text-muted-foreground">{user.usageCount} استخدام · {favorites.length} مفضلة · {history.length} في السجل</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
