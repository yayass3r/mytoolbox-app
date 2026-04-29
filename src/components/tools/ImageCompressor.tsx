'use client'

import { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, Download, ImagePlus, RotateCcw, Loader2, Gauge } from 'lucide-react'

export default function ImageCompressor() {
  const [originalImage, setOriginalImage] = useState<{ url: string; width: number; height: number; name: string; file: File } | null>(null)
  const [quality, setQuality] = useState(70)
  const [maxWidth, setMaxWidth] = useState(1920)
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null)
  const [compressedSize, setCompressedSize] = useState(0)
  const [loading, setLoading] = useState(false)
  const [batchImages, setBatchImages] = useState<{ url: string; name: string; file: File; compressed?: string; compressedSize?: number }[]>([])
  const [batchMode, setBatchMode] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const batchFileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    const dims = await getImageDimensions(url)
    setOriginalImage({ url, width: dims.width, height: dims.height, name: file.name, file })
    setCompressedUrl(null)
  }

  const handleBatchFiles = (files: FileList | null) => {
    if (!files) return
    const newImages: { url: string; name: string; file: File }[] = []
    for (let i = 0; i < files.length; i++) {
      if (!files[i].type.startsWith('image/')) continue
      newImages.push({ url: URL.createObjectURL(files[i]), name: files[i].name, file: files[i] })
    }
    setBatchImages(prev => [...prev, ...newImages])
    setCompressedUrl(null)
  }

  const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.width, height: img.height })
      img.src = url
    })
  }

  const compressImage = (url: string, qualityVal: number, maxW: number): Promise<{ url: string; size: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        let w = img.width
        let h = img.height

        // Scale down if exceeds maxWidth
        if (w > maxW) {
          h = Math.round(h * (maxW / w))
          w = maxW
        }

        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('No ctx')); return }

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'medium'
        ctx.drawImage(img, 0, 0, w, h)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ url: URL.createObjectURL(blob), size: blob.size })
            } else {
              reject(new Error('Compression failed'))
            }
          },
          'image/jpeg',
          qualityVal / 100
        )
      }
      img.onerror = reject
      img.src = url
    })
  }

  const handleCompress = async () => {
    if (!originalImage) return
    setLoading(true)
    try {
      const result = await compressImage(originalImage.url, quality, maxWidth)
      if (compressedUrl) URL.revokeObjectURL(compressedUrl)
      setCompressedUrl(result.url)
      setCompressedSize(result.size)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleBatchCompress = async () => {
    if (batchImages.length === 0) return
    setLoading(true)
    try {
      const results = await Promise.all(
        batchImages.map(async (img) => {
          const result = await compressImage(img.url, quality, maxWidth)
          return { ...img, compressed: result.url, compressedSize: result.size }
        })
      )
      setBatchImages(results)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const downloadCompressed = () => {
    if (!compressedUrl || !originalImage) return
    const name = originalImage.name.replace(/\.[^.]+$/, '') + '_compressed.jpg'
    const a = document.createElement('a')
    a.href = compressedUrl
    a.download = name
    a.click()
  }

  const downloadBatchItem = (url: string, name: string) => {
    const newName = name.replace(/\.[^.]+$/, '') + '_compressed.jpg'
    const a = document.createElement('a')
    a.href = url
    a.download = newName
    a.click()
  }

  const reset = () => {
    if (originalImage) URL.revokeObjectURL(originalImage.url)
    if (compressedUrl) URL.revokeObjectURL(compressedUrl)
    batchImages.forEach(img => { URL.revokeObjectURL(img.url); if (img.compressed) URL.revokeObjectURL(img.compressed) })
    setOriginalImage(null)
    setCompressedUrl(null)
    setBatchImages([])
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
  }

  const getSavedPercent = () => {
    if (!originalImage || !compressedSize) return 0
    return Math.round((1 - compressedSize / originalImage.file.size) * 100)
  }

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant={batchMode ? 'outline' : 'default'}
          size="sm"
          className={!batchMode ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white' : ''}
          onClick={() => { setBatchMode(false); reset() }}
        >
          صورة واحدة
        </Button>
        <Button
          variant={batchMode ? 'default' : 'outline'}
          size="sm"
          className={batchMode ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white' : ''}
          onClick={() => { setBatchMode(true); reset() }}
        >
          ضغط دفعة
        </Button>
      </div>

      {/* Compression Settings */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">جودة الضغط</Label>
              <span className="text-sm font-bold text-rose-500">{quality}%</span>
            </div>
            <Input
              type="range"
              min={5}
              max={100}
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>حجم صغير جداً</span>
              <span>أعلى جودة</span>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium">الحد الأقصى للعرض (بكسل)</Label>
            <div className="flex gap-2">
              {[800, 1280, 1920, 2560, 3840].map(w => (
                <button
                  key={w}
                  onClick={() => setMaxWidth(w)}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    maxWidth === w
                      ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-sm'
                      : 'bg-muted hover:bg-accent'
                  }`}
                >
                  {w >= 3840 ? '4K' : w >= 2560 ? '2K' : `${w}p`}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">إعدادات سريعة</Label>
            <div className="flex gap-2">
              <button onClick={() => { setQuality(30); setMaxWidth(800) }} className="flex-1 px-2 py-2 rounded-lg bg-muted text-xs hover:bg-accent transition-colors">
                <Gauge className="w-3 h-3 inline-block ml-1" />
                ويب (صغير جداً)
              </button>
              <button onClick={() => { setQuality(60); setMaxWidth(1280) }} className="flex-1 px-2 py-2 rounded-lg bg-muted text-xs hover:bg-accent transition-colors">
                <Gauge className="w-3 h-3 inline-block ml-1" />
                بريد إلكتروني
              </button>
              <button onClick={() => { setQuality(85); setMaxWidth(1920) }} className="flex-1 px-2 py-2 rounded-lg bg-muted text-xs hover:bg-accent transition-colors">
                <Gauge className="w-3 h-3 inline-block ml-1" />
                توازن
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {!batchMode ? (
        <>
          {!originalImage && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div
                  className="border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer border-muted hover:border-rose-300 hover:bg-muted/50"
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]) }}
                >
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                  <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ImagePlus className="w-8 h-8 text-rose-600" />
                  </div>
                  <p className="font-medium mb-1">اختر صورة لضغطها</p>
                  <p className="text-sm text-muted-foreground">اسحب الصورة هنا أو اضغط للرفع</p>
                </div>
              </CardContent>
            </Card>
          )}

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
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                      <img src={originalImage.url} alt={originalImage.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{originalImage.name}</p>
                      <p className="text-xs text-muted-foreground">{originalImage.width} × {originalImage.height}</p>
                      <p className="text-sm font-bold">{formatSize(originalImage.file.size)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleCompress} disabled={loading} className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white h-11">
                {loading ? (
                  <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري الضغط...</>
                ) : (
                  <><Gauge className="w-4 h-4 ml-2" /> ضغط الصورة</>
                )}
              </Button>
            </>
          )}

          {compressedUrl && originalImage && (
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <h3 className="font-medium text-sm mb-3 text-emerald-600 dark:text-emerald-400">تم الضغط بنجاح!</h3>
                <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                  <div className="p-2 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">الأصلي</p>
                    <p className="text-sm font-bold">{formatSize(originalImage.file.size)}</p>
                  </div>
                  <div className="p-2 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">بعد الضغط</p>
                    <p className="text-sm font-bold text-emerald-600">{formatSize(compressedSize)}</p>
                  </div>
                  <div className="p-2 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-lg">
                    <p className="text-xs text-muted-foreground">تم التوفير</p>
                    <p className="text-sm font-bold text-emerald-600">{getSavedPercent()}%</p>
                  </div>
                </div>
                <div className="rounded-lg overflow-hidden bg-muted mb-3">
                  <img src={compressedUrl} alt="Compressed" className="w-full max-h-48 object-contain" />
                </div>
                <Button onClick={downloadCompressed} className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
                  <Download className="w-4 h-4 ml-2" />
                  تحميل الصورة المضغوطة
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div
                className="border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer border-muted hover:border-rose-300 hover:bg-muted/50"
                onClick={() => batchFileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handleBatchFiles(e.dataTransfer.files) }}
              >
                <input ref={batchFileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleBatchFiles(e.target.files)} />
                <ImagePlus className="w-6 h-6 text-rose-600 mx-auto mb-2" />
                <p className="text-sm font-medium">اختر صور متعددة للضغط</p>
              </div>
            </CardContent>
          </Card>

          {batchImages.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">{batchImages.length} صورة</h3>
                <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={reset}>مسح الكل</Button>
              </div>
              <div className="space-y-2 max-h-[30vh] overflow-y-auto scrollbar-thin">
                {batchImages.map((img, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 rounded bg-muted overflow-hidden shrink-0">
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{img.name}</p>
                      <p className="text-xs text-muted-foreground">{formatSize(img.file.size)}</p>
                    </div>
                    {img.compressed && img.compressedSize && (
                      <div className="text-xs shrink-0">
                        <p className="font-medium text-emerald-600">{formatSize(img.compressedSize)}</p>
                        <p className="text-muted-foreground">-{Math.round((1 - img.compressedSize / img.file.size) * 100)}%</p>
                      </div>
                    )}
                    {img.compressed && (
                      <Button size="sm" variant="outline" className="h-7 text-xs shrink-0" onClick={() => downloadBatchItem(img.compressed!, img.name)}>
                        <Download className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button onClick={handleBatchCompress} disabled={loading} className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white h-11">
                {loading ? (
                  <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري الضغط...</>
                ) : (
                  <><Gauge className="w-4 h-4 ml-2" /> ضغط جميع الصور ({batchImages.length})</>
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
