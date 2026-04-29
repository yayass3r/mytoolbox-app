'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, ImageIcon, Wrench, Settings, LogOut, TrendingUp, Eye, Zap } from 'lucide-react'
import AdManager from './AdManager'
import ToolManager from './ToolManager'
import AnalyticsDashboard from './AnalyticsDashboard'
import SettingsPanel from './SettingsPanel'
import { getAds, getToolsState, getAnalytics } from '@/lib/storage'

interface AdminPanelProps {
  onLogout: () => void
}

export default function AdminPanel({ onLogout }: AdminPanelProps) {
  useEffect(() => {
    // Load data from localStorage
    const ads = getAds()
    const tools = getToolsState()
    const analytics = getAnalytics()
    // Data is now available in localStorage
    void ads
    void tools
    void analytics
  }, [])

  return (
    <AdminPanelContent onLogout={onLogout} />
  )
}

function AdminPanelContent({ onLogout }: { onLogout: () => void }) {
  const [stats, setStats] = useState(() => {
    const tools = getToolsState()
    const ads = getAds()
    const analytics = getAnalytics()
    return {
      totalTools: tools.length || 10,
      totalUsage: tools.reduce((acc, t) => acc + (t.usageCount || 0), 0),
      activeAds: ads.filter(a => a.isActive).length,
      pageViews: analytics.dailyViews.reduce((acc, d) => acc + d.count, 0),
    }
  })
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    const interval = setInterval(() => {
      const tools = getToolsState()
      const ads = getAds()
      const analytics = getAnalytics()
      setStats({
        totalTools: tools.length || 10,
        totalUsage: tools.reduce((acc, t) => acc + (t.usageCount || 0), 0),
        activeAds: ads.filter(a => a.isActive).length,
        pageViews: analytics.dailyViews.reduce((acc, d) => acc + d.count, 0),
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">لوحة التحكم</h1>
          <p className="text-sm text-muted-foreground">إدارة التطبيق والإعلانات</p>
        </div>
        <Button variant="outline" size="sm" onClick={onLogout}>
          <LogOut className="w-4 h-4 ml-1" />
          خروج
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-5 overflow-x-auto">
          <TabsTrigger value="dashboard" className="text-xs gap-1">
            <BarChart3 className="w-3 h-3" />
            الرئيسية
          </TabsTrigger>
          <TabsTrigger value="ads" className="text-xs gap-1">
            <ImageIcon className="w-3 h-3" />
            الإعلانات
          </TabsTrigger>
          <TabsTrigger value="tools" className="text-xs gap-1">
            <Wrench className="w-3 h-3" />
            الأدوات
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs gap-1">
            <TrendingUp className="w-3 h-3" />
            التحليلات
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs gap-1">
            <Settings className="w-3 h-3" />
            الإعدادات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4 space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalTools}</p>
                    <p className="text-xs text-muted-foreground">إجمالي الأدوات</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalUsage}</p>
                    <p className="text-xs text-muted-foreground">استخدام الأدوات</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.activeAds}</p>
                    <p className="text-xs text-muted-foreground">إعلانات نشطة</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.pageViews}</p>
                    <p className="text-xs text-muted-foreground">مشاهدات الصفحة</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => setActiveTab('ads')}>
                <ImageIcon className="w-5 h-5" />
                <span className="text-xs">إدارة الإعلانات</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => setActiveTab('tools')}>
                <Wrench className="w-5 h-5" />
                <span className="text-xs">إدارة الأدوات</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => setActiveTab('analytics')}>
                <TrendingUp className="w-5 h-5" />
                <span className="text-xs">عرض التحليلات</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => setActiveTab('settings')}>
                <Settings className="w-5 h-5" />
                <span className="text-xs">الإعدادات</span>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ads" className="mt-4">
          <AdManager />
        </TabsContent>

        <TabsContent value="tools" className="mt-4">
          <ToolManager />
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <SettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}

import { useState } from 'react'
