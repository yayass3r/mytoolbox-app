'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight } from 'lucide-react'
import { loginUser, type User } from '@/lib/storage'

interface UserLoginFormProps {
  onLogin: (user: User) => void
  onSwitchToRegister: () => void
  onBack: () => void
}

export default function UserLoginForm({ onLogin, onSwitchToRegister, onBack }: UserLoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await loginUser(email, password)
      if (result.success && result.user) {
        onLogin(result.user)
      } else {
        setError(result.error || 'فشل تسجيل الدخول')
      }
    } catch {
      setError('حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[75vh] flex flex-col">
      <div className="gradient-header text-white px-4 pt-12 pb-4">
        <div className="max-w-lg mx-auto">
          <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-2">
            <ArrowRight className="w-4 h-4" />
            <span className="text-sm">العودة</span>
          </button>
          <h1 className="text-xl font-bold">تسجيل الدخول</h1>
          <p className="text-white/70 text-sm mt-1">ادخل إلى حسابك للاستمتاع بكل المميزات</p>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-6">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[
                { icon: '❤️', label: 'حفظ المفضلة' },
                { icon: '📊', label: 'سجل الاستخدام' },
                { icon: '🚫', label: 'بدون إعلانات' },
              ].map(b => (
                <div key={b.label} className="text-center p-2 bg-muted/50 rounded-xl">
                  <span className="text-lg">{b.icon}</span>
                  <p className="text-[10px] mt-0.5 text-muted-foreground">{b.label}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label>البريد الإلكتروني</Label>
                <div className="relative">
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" className="pl-10" dir="ltr" required />
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>كلمة المرور</Label>
                <div className="relative">
                  <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-10" required />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white h-11">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><LogIn className="w-4 h-4 ml-2" />تسجيل الدخول</>
                )}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                ليس لديك حساب؟{' '}
                <button onClick={onSwitchToRegister} className="text-teal-600 font-medium hover:underline">أنشئ حساباً مجاناً</button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
