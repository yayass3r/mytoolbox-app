'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Save } from 'lucide-react'

interface Setting {
  key: string
  value: string | null
  type: string
}

export default function SettingsPanel() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()
      setSettings(data || [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const getSetting = (key: string): string => {
    return settings.find(s => s.key === key)?.value || ''
  }

  const updateSetting = async (key: string, value: string) => {
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      })
      setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s))
    } catch {
      // silently fail
    }
  }

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordMsg('كلمات المرور غير متطابقة')
      return
    }
    if (newPassword.length < 6) {
      setPasswordMsg('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    setSaving(true)
    setPasswordMsg('')
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'admin_password', value: newPassword }),
      })
      if (res.ok) {
        setPasswordMsg('تم تغيير كلمة المرور بنجاح')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setPasswordMsg('فشل تغيير كلمة المرور')
      }
    } catch {
      setPasswordMsg('حدث خطأ')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">الإعدادات</h3>

      {/* App Info */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">معلومات التطبيق</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>اسم التطبيق</Label>
            <Input
              value={getSetting('app_name')}
              onChange={(e) => updateSetting('app_name', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>وصف التطبيق</Label>
            <Input
              value={getSetting('app_description')}
              onChange={(e) => updateSetting('app_description', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Global Settings */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">إعدادات عامة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>عرض الإعلانات</Label>
              <p className="text-xs text-muted-foreground">عرض الإعلانات في التطبيق</p>
            </div>
            <Switch
              checked={getSetting('ads_enabled') === 'true'}
              onCheckedChange={(v) => updateSetting('ads_enabled', String(v))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>تحليلات الاستخدام</Label>
              <p className="text-xs text-muted-foreground">تتبع استخدام الأدوات والمشاهدات</p>
            </div>
            <Switch
              checked={getSetting('analytics_enabled') === 'true'}
              onCheckedChange={(v) => updateSetting('analytics_enabled', String(v))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">تغيير كلمة المرور</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>كلمة المرور الجديدة</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-2">
            <Label>تأكيد كلمة المرور</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {passwordMsg && (
            <p className={`text-sm ${passwordMsg.includes('نجاح') ? 'text-emerald-500' : 'text-red-500'}`}>
              {passwordMsg}
            </p>
          )}
          <Button onClick={handlePasswordChange} disabled={saving} className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 ml-2" />
                حفظ كلمة المرور
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
