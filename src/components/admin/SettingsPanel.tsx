'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Save } from 'lucide-react'
import { getSettings, getSetting, updateSetting, hashPassword } from '@/lib/storage'
import { verifyAdmin } from '@/lib/storage'

export default function SettingsPanel() {
  const [settings, setSettings] = useState(() => getSettings())
  const [saving, setSaving] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const [adminEmail, setAdminEmail] = useState(() => getSetting('admin_email') || 'admin@toolbox.com')

  const handleSettingChange = (key: string, value: string) => {
    updateSetting(key, value)
    setSettings(getSettings())
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
      const hash = await hashPassword(newPassword)
      updateSetting('admin_password_hash', hash)
      setPasswordMsg('تم تغيير كلمة المرور بنجاح')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      setPasswordMsg('حدث خطأ')
    } finally {
      setSaving(false)
    }
  }

  const getCurrentSetting = (key: string): string => {
    return settings.find(s => s.key === key)?.value || ''
  }

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
              value={getCurrentSetting('app_name')}
              onChange={(e) => handleSettingChange('app_name', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>وصف التطبيق</Label>
            <Input
              value={getCurrentSetting('app_description')}
              onChange={(e) => handleSettingChange('app_description', e.target.value)}
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
              checked={getCurrentSetting('ads_enabled') === 'true'}
              onCheckedChange={(v) => handleSettingChange('ads_enabled', String(v))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>تحليلات الاستخدام</Label>
              <p className="text-xs text-muted-foreground">تتبع استخدام الأدوات والمشاهدات</p>
            </div>
            <Switch
              checked={getCurrentSetting('analytics_enabled') === 'true'}
              onCheckedChange={(v) => handleSettingChange('analytics_enabled', String(v))}
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
            <Label>كلمة المرور الحالية</Label>
            <Input
              id="current-password"
              type="password"
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-2">
            <Label>كلمة المرور الجديدة</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-2">
            <Label>تأكيد كلمة المرور</Label>
            <Input
              id="confirm-password"
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
