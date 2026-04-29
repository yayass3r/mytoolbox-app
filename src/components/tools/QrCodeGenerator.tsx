'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Download } from 'lucide-react'

export default function QrCodeGenerator() {
  const [text, setText] = useState('https://example.com')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!text.trim()) {
      setReady(false)
      return
    }
    let cancelled = false
    import('qrcode').then(QRCode => {
      if (cancelled) return
      const canvas = canvasRef.current
      if (!canvas) return
      QRCode.toCanvas(canvas, text, {
        width: 280,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      }).then(() => {
        setReady(true)
      }).catch(() => {
        setReady(false)
      })
    })
    return () => { cancelled = true }
  }, [text])

  const downloadQR = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = 'qrcode.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-fuchsia-500 to-pink-600 p-6 text-white">
          <h2 className="text-xl font-bold mb-1">مولد QR Code</h2>
          <p className="text-white/80 text-sm">إنشاء رموز QR للنصوص والروابط</p>
        </div>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label>النص أو الرابط</Label>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="أدخل النص أو الرابط..."
              className="text-base"
              dir="ltr"
            />
          </div>

          {/* QR Code Display */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-2xl shadow-md">
              <canvas
                ref={canvasRef}
                className={`max-w-full ${ready ? '' : 'hidden'}`}
              />
              {!ready && (
                <div className="w-[280px] h-[280px] flex items-center justify-center text-muted-foreground">
                  أدخل نصاً أو رابطاً
                </div>
              )}
            </div>
          </div>

          {ready && (
            <div className="flex gap-2">
              <Button onClick={downloadQR} className="flex-1 bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white">
                <Download className="w-4 h-4 ml-2" />
                تحميل QR Code
              </Button>
            </div>
          )}

          <div className="bg-muted rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground">
              يمكنك استخدام هذا الرمز للروابط، النصوص، أرقام الهواتف، البريد الإلكتروني والمزيد
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
