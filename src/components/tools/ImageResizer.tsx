'use client'

import { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, Download, ImagePlus, RotateCcw, Loader2 } from 'lucide-react'

export default function ImageResizer() {
  const [originalImage, setOriginalImage] = useState<{ url: string; width: number; height: number; name: string; file: File } | null>(null)
  const [resizedUrl, setResizedUrl] = useState<string | null>(null)
  const [newWidth, setNewWidth] = useState('')
  const [newHeight, setNewHeight] = useState('')
  const [lockAspect, setLockAspect] = useState(true)
  const [aspectRatio, setAspectRatio] = useState(1)
  const [loading, setLoading] = useState(false)
  const [quality, setQuality] = useState(92)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return

    const url = URL.createObjectURL(file)
    const dims = await getImageDimensions(url)

    setOriginalImage({ url, width: dims.width, height: dims.height, name: file.name, file })
    setNewWidth(String(dims.width))
    setNewHeight(String(dims.height))
    setAspectRatio(dims.width / dims.height)
    setResizedUrl(null)
  }

  const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.width, height: img.height })
      img.src = url
    })
  }

  const handleWidthChange = (value: string) => {
    setNewWidth(value)
    if (lockAspect && value) {
      setNewHeight(String(Math.round(parseInt(value) / aspectRatio)))
    }
  }

  const handleHeightChange = (value: string) => {
    setNewHeight(value)
    if (lockAspect && value) {
      setNewWidth(String(Math.round(parseInt(value) * aspectRatio)))
    }
  }

  const resizeImage = () => {
    if (!originalImage || !newWidth || !newHeight) return
    setLoading(true)

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const w = parseInt(newWidth)
      const h = parseInt(newHeight)
      canvas.width = w
      canvas.height = h

      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, w, h)

        const format = originalImage.file.type === 'image/png' ? 'image/png' : 'image/jpeg'
        canvas.toBlob(
          (blob) => {
            if (blob) {
              if (resizedUrl) URL.revokeObjectURL(resizedUrl)
              setResizedUrl(URL.createObjectURL(blob))
            }
            setLoading(false)
          },
          format,
          quality / 100
        )
      }
    }
    img.src = originalImage.url
  }

  const downloadResized = () => {
    if (!resizedUrl || !originalImage) return
    const ext = originalImage.file.type === 'image/png' ? 'png' : 'jpg'
    const name = originalImage.name.replace(/\.[^.]+$/, '') + `_resized.${ext}`
    const a = document.createElement('a')
    a.href = resizedUrl
    a.download = name
    a.click()
  }

  const setPreset = (percent: number) => {
    if (!originalImage) return
    setNewWidth(String(Math.round(originalImage.width * percent / 100)))
    setNewHeight(String(Math.round(originalImage.height * percent / 100)))
    setResizedUrl(null)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
  }

  const reset = () => {
    if (originalImage) URL.revokeObjectURL(originalImage.url)
    if (resizedUrl) URL.revokeObjectURL(resizedUrl)
    setOriginalImage(null)
    setResizedUrl(null)
    setNewWidth('')
    setNewHeight('')
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!originalImage && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div
              className="border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer border-muted hover:border-teal-300 hover:bg-muted/50"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]) }}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ImagePlus className="w-8 h-8 text-amber-600" />
              </div>
              <p className="font-medium mb-1">اختر صورة لتغيير حجمها</p>
              <p className="text-sm text-muted-foreground">اسحب الصورة هنا أو اضغط للرفع</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Info & Controls */}
      {originalImage && (
        <>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm">الصورة الأصلية</h3>
                <Button variant="ghost" size="sm" className="text-xs" onClick={reset}>
                  <RotateCcw className="w-3 h-3 ml-1" />
                  صورة جديدة
                </Button>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                  <img src={originalImage.url} alt={originalImage.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{originalImage.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {originalImage.width} × {originalImage.height} بكسل
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatSize(originalImage.file.size)}
                  </p>
                </div>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap gap-2 mb-4">
                {[25, 50, 75, 100, 150, 200].map(pct => (
                  <button
                    key={pct}
                    onClick={() => setPreset(pct)}
                    className="px-3 py-1.5 rounded-lg bg-muted text-xs font-medium hover:bg-accent transition-colors"
                  >
                    {pct}%
                  </button>
                ))}
              </div>

              {/* Dimensions */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">العرض (بكسل)</Label>
                    <Input
                      type="number"
                      value={newWidth}
                      onChange={(e) => handleWidthChange(e.target.value)}
                      className="text-sm"
                      dir="ltr"
                    />
                  </div>
                  <button
                    onClick={() => setLockAspect(!lockAspect)}
                    className={`mt-6 w-10 h-10 rounded-lg flex items-center justify-center border transition-colors ${
                      lockAspect ? 'border-teal-500 bg-teal-50 text-teal-600 dark:bg-teal-950/20' : 'border-muted'
                    }`}
                    title={lockAspect ? 'نسبة ثابتة' : 'نسبة حرة'}
                  >
                    {lockAspect ? '🔒' : '🔓'}
                  </button>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">الارتفاع (بكسل)</Label>
                    <Input
                      type="number"
                      value={newHeight}
                      onChange={(e) => handleHeightChange(e.target.value)}
                      className="text-sm"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">الجودة: {quality}%</Label>
                  <Input
                    type="range"
                    min={10}
                    max={100}
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resize Button */}
          <Button
            onClick={resizeImage}
            disabled={loading || !newWidth || !newHeight}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white h-11"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري تغيير الحجم...</>
            ) : (
              <>تغيير الحجم إلى {newWidth} × {newHeight}</>
            )}
          </Button>
        </>
      )}

      {/* Result */}
      {resizedUrl && (
        <Card className="border-0 shadow-md border-teal-200 dark:border-teal-800">
          <CardContent className="p-4">
            <h3 className="font-medium text-sm mb-3 text-teal-600 dark:text-teal-400">تم تغيير الحجم بنجاح!</h3>
            <div className="rounded-lg overflow-hidden bg-muted mb-3">
              <img src={resizedUrl} alt="Resized" className="w-full max-h-48 object-contain" />
            </div>
            <Button onClick={downloadResized} className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
              <Download className="w-4 h-4 ml-2" />
              تحميل الصورة
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
