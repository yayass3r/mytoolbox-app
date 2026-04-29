'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RefreshCw, Copy, Check, Shield, ShieldCheck, ShieldAlert } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PasswordGenerator() {
  const [length, setLength] = useState(16)
  const [uppercase, setUppercase] = useState(true)
  const [lowercase, setLowercase] = useState(true)
  const [numbers, setNumbers] = useState(true)
  const [symbols, setSymbols] = useState(true)
  const [password, setPassword] = useState('')
  const [copied, setCopied] = useState(false)

  const generatePassword = useCallback(() => {
    let chars = ''
    if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (lowercase) chars += 'abcdefghijklmnopqrstuvwxyz'
    if (numbers) chars += '0123456789'
    if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'
    if (!chars) { setPassword(''); return }

    let result = ''
    const array = new Uint32Array(length)
    crypto.getRandomValues(array)
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length]
    }
    setPassword(result)
  }, [length, uppercase, lowercase, numbers, symbols])

  const copyPassword = () => {
    if (password) {
      navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getStrength = () => {
    if (!password) return { level: 0, label: '', color: '', icon: Shield }
    let score = 0
    if (length >= 8) score++
    if (length >= 12) score++
    if (length >= 20) score++
    if (uppercase && lowercase) score++
    if (numbers) score++
    if (symbols) score++

    if (score <= 2) return { level: 1, label: 'ضعيفة', color: 'bg-red-500', icon: ShieldAlert }
    if (score <= 4) return { level: 2, label: 'متوسطة', color: 'bg-yellow-500', icon: Shield }
    return { level: 3, label: 'قوية', color: 'bg-emerald-500', icon: ShieldCheck }
  }

  const strength = getStrength()

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-teal-500 to-emerald-600 p-6 text-white">
          <h2 className="text-xl font-bold mb-1">مولد كلمات المرور</h2>
          <p className="text-white/80 text-sm">إنشاء كلمات مرور آمنة وعشوائية</p>
        </div>
        <CardContent className="p-6 space-y-6">
          {/* Password Display */}
          <motion.div
            key={password}
            initial={{ scale: 0.98, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-muted rounded-xl p-4 text-center min-h-[64px] flex items-center justify-center gap-2"
          >
            <span className="font-mono text-lg break-all select-all">{password || 'اضغط إنشاء'}</span>
            {password && (
              <button onClick={copyPassword} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-background/50 transition-colors">
                {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 text-muted-foreground" />}
              </button>
            )}
          </motion.div>

          {/* Strength Indicator */}
          {password && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <strength.icon className={`w-4 h-4 ${strength.level === 3 ? 'text-emerald-500' : strength.level === 2 ? 'text-yellow-500' : 'text-red-500'}`} />
                  <span>قوة كلمة المرور:</span>
                </div>
                <span className={`font-medium ${strength.level === 3 ? 'text-emerald-500' : strength.level === 2 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {strength.label}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(strength.level / 3) * 100}%` }}
                  className={`h-full rounded-full ${strength.color}`}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}

          {/* Length Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>الطول</Label>
              <span className="text-sm font-mono bg-muted px-2 py-1 rounded-md">{length}</span>
            </div>
            <Slider
              value={[length]}
              onValueChange={(v) => setLength(v[0])}
              min={8}
              max={64}
              step={1}
            />
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Checkbox checked={uppercase} onCheckedChange={(v) => setUppercase(v === true)} />
              <Label className="text-sm">أحرف كبيرة (A-Z)</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={lowercase} onCheckedChange={(v) => setLowercase(v === true)} />
              <Label className="text-sm">أحرف صغيرة (a-z)</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={numbers} onCheckedChange={(v) => setNumbers(v === true)} />
              <Label className="text-sm">أرقام (0-9)</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={symbols} onCheckedChange={(v) => setSymbols(v === true)} />
              <Label className="text-sm">رموز (!@#$)</Label>
            </div>
          </div>

          {/* Generate Button */}
          <Button onClick={generatePassword} className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white h-12 text-base" size="lg">
            <RefreshCw className="w-5 h-5 ml-2" />
            إنشاء كلمة مرور
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
