'use client'

import { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, Download, ImagePlus, RotateCcw, Loader2 } from 'lucide-react'

const FORMATS = [
  { id: 'jpeg', name: 'JPEG', ext: 'jpg', mime: 'image/jpeg' },
  { id: 'png', name: 'PNG', ext: 'png', mime: 'image/png' },
  { id: 'webp', name: 'WEBP', ext: 'webp', mime: 'image/webp' },
  { id: 'bmp', name: 'BMP', ext: 'bmp', mime: 'image/bmp' },
  { id: 'gif', name: 'GIF', ext: 'gif', mime: 'image/gif' },
  { id: 'ico', name: 'ICO', ext: 'ico', mime: 'image/x-icon' },
]

export default function ImageConverter() {
  const [originalImage, setOriginalImage] = useState<{ url: string; width: number; height: number; name: string; file: File } | null>(null)
  const [targetFormat, setTargetFormat] = useState('webp')
  const [quality, setQuality] = useState(90)
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null)
  const [convertedSize, setConvertedSize] = useState(0)
  const [loading, setLoading] = useState(false)
  const [batchImages, setBatchImages] = useState<{ url: string; name: string; file: File; converted?: string }[]>([])
  const [batchMode, setBatchMode] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const batchFileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    const dims = await getImageDimensions(url)
    setOriginalImage({ url, width: dims.width, height: dims.height, name: file.name, file })
    setConvertedUrl(null)
  }

  const handleBatchFiles = async (files: FileList | null) => {
    if (!files) return
    const newImages: { url: string; name: string; file: File }[] = []
    for (let i = 0; i < files.length; i++) {
      if (!files[i].type.startsWith('image/')) continue
      newImages.push({
        url: URL.createObjectURL(files[i]),
        name: files[i].name,
        file: files[i],
      })
    }
    setBatchImages(prev => [...prev, ...newImages])
    setConvertedUrl(null)
  }

  const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.width, height: img.height })
      img.src = url
    })
  }

  const convertImage = (url: string, format: string, qualityVal: number): Promise<{ url: string; size: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('No ctx')); return }
        ctx.drawImage(img, 0, 0)

        const formatInfo = FORMATS.find(f => f.id === format) || FORMATS[0]
        const q = format === 'png' ? undefined : qualityVal / 100

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ url: URL.createObjectURL(blob), size: blob.size })
            } else {
              reject(new Error('Conversion failed'))
            }
          },
          formatInfo.mime,
          q
        )
      }
      img.onerror = reject
      img.src = url
    })
  }

  const handleConvert = async () => {
    if (!originalImage) return
    setLoading(true)
    try {
      const result = await convertImage(originalImage.url, targetFormat, quality)
      if (convertedUrl) URL.revokeObjectURL(convertedUrl)
      setConvertedUrl(result.url)
      setConvertedSize(result.size)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleBatchConvert = async () => {
    if (batchImages.length === 0) return
    setLoading(true)
    try {
      const results = await Promise.all(
        batchImages.map(async (img) => {
          const result = await convertImage(img.url, targetFormat, quality)
          return { ...img, converted: result.url }
        })
      )
      setBatchImages(results)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const downloadConverted = () => {
    if (!convertedUrl || !originalImage) return
    const formatInfo = FORMATS.find(f => f.id === targetFormat)
    const name = originalImage.name.replace(/\.[^.]+$/, '') + '.' + formatInfo!.ext
    const a = document.createElement('a')
    a.href = convertedUrl
    a.download = name
    a.click()
  }

  const downloadBatchItem = (url: string, name: string) => {
    const formatInfo = FORMATS.find(f => f.id === targetFormat)
    const newName = name.replace(/\.[^.]+$/, '') + '.' + formatInfo!.ext
    const a = document.createElement('a')
    a.href = url
    a.download = newName
    a.click()
  }

  const reset = () => {
    if (originalImage) URL.revokeObjectURL(originalImage.url)
    if (convertedUrl) URL.revokeObjectURL(convertedUrl)
    batchImages.forEach(img => { URL.revokeObjectURL(img.url); if (img.converted) URL.revokeObjectURL(img.converted) })
    setOriginalImage(null)
    setConvertedUrl(null)
    setBatchImages([])
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant={batchMode ? 'outline' : 'default'}
          size="sm"
          className={!batchMode ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white' : ''}
          onClick={() => { setBatchMode(false); reset() }}
        >
          صورة واحدة
        </Button>
        <Button
          variant={batchMode ? 'default' : 'outline'}
          size="sm"
          className={batchMode ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white' : ''}
          onClick={() => { setBatchMode(true); reset() }}
        >
          تحويل دفعة
        </Button>
      </div>

      {/* Format Selection */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <Label className="text-sm font-medium">الصيغة المطلوبة</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {FORMATS.map(fmt => (
              <button
                key={fmt.id}
                onClick={() => setTargetFormat(fmt.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  targetFormat === fmt.id
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md'
                    : 'bg-muted hover:bg-accent'
                }`}
              >
                .{fmt.ext}
              </button>
            ))}
          </div>
          {targetFormat !== 'png' && targetFormat !== 'bmp' && targetFormat !== 'gif' && (
            <div className="mt-3 space-y-1">
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
          )}
        </CardContent>
      </Card>

      {!batchMode ? (
        <>
          {/* Single Upload */}
          {!originalImage && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div
                  className="border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer border-muted hover:border-violet-300 hover:bg-muted/50"
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]) }}
                >
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ImagePlus className="w-8 h-8 text-violet-600" />
                  </div>
                  <p className="font-medium mb-1">اختر صورة لتحويلها</p>
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
                      <p className="text-xs text-muted-foreground">{formatSize(originalImage.file.size)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleConvert} disabled={loading} className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white h-11">
                {loading ? (
                  <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري التحويل...</>
                ) : (
                  <>تحويل إلى .{FORMATS.find(f => f.id === targetFormat)?.ext}</>
                )}
              </Button>
            </>
          )}

          {convertedUrl && originalImage && (
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <h3 className="font-medium text-sm mb-2 text-violet-600 dark:text-violet-400">تم التحويل بنجاح!</h3>
                <div className="flex items-center justify-between text-xs mb-3 p-2 bg-muted rounded-lg">
                  <span>الأصلي: {formatSize(originalImage.file.size)}</span>
                  <span>بعد التحويل: {formatSize(convertedSize)}</span>
                  <span className={convertedSize < originalImage.file.size ? 'text-emerald-500 font-medium' : 'text-amber-500'}>
                    {convertedSize < originalImage.file.size
                      ? `${Math.round((1 - convertedSize / originalImage.file.size) * 100)}% أصغر`
                      : `${Math.round((convertedSize / originalImage.file.size - 1) * 100)}% أكبر`
                    }
                  </span>
                </div>
                <div className="rounded-lg overflow-hidden bg-muted mb-3">
                  <img src={convertedUrl} alt="Converted" className="w-full max-h-48 object-contain" />
                </div>
                <Button onClick={downloadConverted} className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
                  <Download className="w-4 h-4 ml-2" />
                  تحميل
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <>
          {/* Batch Mode */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div
                className="border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer border-muted hover:border-violet-300 hover:bg-muted/50"
                onClick={() => batchFileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handleBatchFiles(e.dataTransfer.files) }}
              >
                <input ref={batchFileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleBatchFiles(e.target.files)} />
                <ImagePlus className="w-6 h-6 text-violet-600 mx-auto mb-2" />
                <p className="text-sm font-medium">اختر صور متعددة</p>
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
                    </div>
                    {img.converted && (
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => downloadBatchItem(img.converted!, img.name)}>
                        <Download className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button onClick={handleBatchConvert} disabled={loading} className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white h-11">
                {loading ? (
                  <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري التحويل...</>
                ) : (
                  <>تحويل الكل إلى .{FORMATS.find(f => f.id === targetFormat)?.ext}</>
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
