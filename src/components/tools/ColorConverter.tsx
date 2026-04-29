'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

export default function ColorConverter() {
  const [color, setColor] = useState('#0d9488')
  const [copied, setCopied] = useState('')

  const palette = useMemo(() => {
    const rgb = hexToRgb(color)
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    const shades: string[] = []
    for (let i = -30; i <= 30; i += 10) {
      if (i === 0) continue
      const newL = Math.max(0, Math.min(100, hsl.l + i))
      shades.push(`hsl(${hsl.h}, ${hsl.s}%, ${newL}%)`)
    }
    return shades
  }, [color])

  const rgb = hexToRgb(color)
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-pink-500 to-rose-600 p-6 text-white">
          <h2 className="text-xl font-bold mb-1">محول الألوان</h2>
          <p className="text-white/80 text-sm">تحويل بين صيغ الألوان المختلفة</p>
        </div>
        <CardContent className="p-6 space-y-6">
          {/* Color Picker */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-20 h-20 rounded-xl cursor-pointer border-2 border-border"
              />
            </div>
            <div className="flex-1">
              <Label className="mb-2 block">اختر لون</Label>
              <Input
                value={color}
                onChange={(e) => {
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) setColor(e.target.value)
                }}
                className="font-mono text-lg"
                dir="ltr"
              />
            </div>
          </div>

          {/* Color Preview */}
          <div className="h-32 rounded-xl shadow-inner" style={{ backgroundColor: color }} />

          {/* Color Values */}
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-muted p-3 rounded-xl">
              <div>
                <span className="text-xs text-muted-foreground">HEX</span>
                <p className="font-mono font-medium" dir="ltr">{color.toUpperCase()}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => copy(color.toUpperCase(), 'hex')}>
                {copied === 'hex' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="flex items-center justify-between bg-muted p-3 rounded-xl">
              <div>
                <span className="text-xs text-muted-foreground">RGB</span>
                <p className="font-mono font-medium" dir="ltr">rgb({rgb.r}, {rgb.g}, {rgb.b})</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => copy(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, 'rgb')}>
                {copied === 'rgb' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="flex items-center justify-between bg-muted p-3 rounded-xl">
              <div>
                <span className="text-xs text-muted-foreground">HSL</span>
                <p className="font-mono font-medium" dir="ltr">hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => copy(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, 'hsl')}>
                {copied === 'hsl' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Palette */}
          <div>
            <Label className="mb-3 block">درجات اللون</Label>
            <div className="grid grid-cols-6 gap-2">
              {palette.map((shade, i) => (
                <button
                  key={i}
                  className="h-12 rounded-lg shadow-sm hover:scale-105 transition-transform"
                  style={{ backgroundColor: shade }}
                  onClick={() => {
                    const tmp = document.createElement('div')
                    tmp.style.backgroundColor = shade
                    document.body.appendChild(tmp)
                    const computed = getComputedStyle(tmp).backgroundColor
                    document.body.removeChild(tmp)
                    const match = computed.match(/(\d+)/g)
                    if (match) {
                      const [r, g, b] = match.map(Number)
                      setColor(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`)
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
