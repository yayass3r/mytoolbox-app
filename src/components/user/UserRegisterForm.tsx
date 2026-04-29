'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Mail, Lock, Eye, EyeOff, UserPlus, ArrowRight, RefreshCw } from 'lucide-react'
import { registerUser, getRandomAvatar, type User } from '@/lib/storage'

interface UserRegisterFormProps {
  onRegister: (user: User) => void
  onSwitchToLogin: () => void
  onBack: () => void
}

export default function UserRegisterForm({ onRegister, onSwitchToLogin, onBack }: UserRegisterFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [avatar, setAvatar] = useState(getRandomAvatar)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة')
      return
    }

    setLoading(true)
    try {
      const result = await registerUser(name, email, password)
      if (result.success && result.user) {
        onRegister(result.user)
      } else {
        setError(result.error || 'فشل التسجيل')
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
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-2"
          >
            <ArrowRight className="w-4 h-4" />
            <span className="text-sm">العودة</span>
          </button>
          <h1 className="text-xl font-bold">إنشاء حساب جديد</h1>
          <p className="text-white/70 text-sm mt-1">انضم إلينا مجاناً واحصل على مميزات حصرية</p>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-6">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="p-6">
            {/* Avatar Selection */}
            <div className="flex justify-center mb-6">
              <button
                onClick={() => setAvatar(getRandomAvatar())}
                className="relative group"
                title="اضغط لتغيير الصورة الرمزية"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-900/30 flex items-center justify-center text-4xl border-4 border-teal-200 dark:border-teal-800">
                  {avatar}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-white" />
                </div>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <Label>الاسم</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="أدخل اسمك"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label>البريد الإلكتروني</Label>
                <div className="relative">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="pl-10"
                    dir="ltr"
                    required
                  />
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-1">
                <Label>كلمة المرور</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="6 أحرف على الأقل"
                    className="pl-10"
                    required
                    minLength={6}
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <Label>تأكيد كلمة المرور</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="أعد كتابة كلمة المرور"
                    className="pl-10"
                    required
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white h-11 mt-4">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 ml-2" />
                    إنشاء الحساب
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                لديك حساب بالفعل؟{' '}
                <button onClick={onSwitchToLogin} className="text-teal-600 font-medium hover:underline">
                  سجل دخولك
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
