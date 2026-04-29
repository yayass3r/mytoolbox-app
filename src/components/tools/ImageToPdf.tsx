'use client'

import { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Download, Trash2, ImagePlus, FileText, Loader2 } from 'lucide-react'
import { jsPDF } from 'jspdf'

interface ImageFile {
  file: File
  url: string
  name: string
  width: number
  height: number
}

export default function ImageToPdf() {
  const [images, setImages] = useState<ImageFile[]>([])
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files) return
    const newImages: ImageFile[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) continue

      const url = URL.createObjectURL(file)
      const dims = await getImageDimensions(url)
      newImages.push({
        file,
        url,
        name: file.name,
        width: dims.width,
        height: dims.height,
      })
    }

    setImages(prev => [...prev, ...newImages])
  }

  const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.width, height: img.height })
      img.src = url
    })
  }

  const removeImage = (index: number) => {
    setImages(prev => {
      const updated = [...prev]
      URL.revokeObjectURL(updated[index].url)
      updated.splice(index, 1)
      return updated
    })
  }

  const moveImage = (index: number, direction: 'up' | 'down') => {
    setImages(prev => {
      const updated = [...prev]
      const newIndex = direction === 'up' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= updated.length) return prev
      ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
      return updated
    })
  }

  const generatePDF = async () => {
    if (images.length === 0) return
    setLoading(true)

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 10
      const maxImageWidth = pageWidth - 2 * margin
      const maxImageHeight = pageHeight - 2 * margin

      for (let i = 0; i < images.length; i++) {
        if (i > 0) pdf.addPage()

        const img = images[i]
        const canvas = await loadImageToCanvas(img.url)
        const imgWidth = canvas.width
        const imgHeight = canvas.height

        // Calculate dimensions to fit within page
        let width = maxImageWidth
        let height = (imgHeight / imgWidth) * width

        if (height > maxImageHeight) {
          height = maxImageHeight
          width = (imgWidth / imgHeight) * height
        }

        // Center on page
        const x = (pageWidth - width) / 2
        const y = (pageHeight - height) / 2

        const imgData = canvas.toDataURL('image/jpeg', 0.92)
        pdf.addImage(imgData, 'JPEG', x, y, width, height)
      }

      pdf.save('images-to-pdf.pdf')
    } catch (error) {
      console.error('PDF generation error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadImageToCanvas = (url: string): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0)
          resolve(canvas)
        } else {
          reject(new Error('Could not get canvas context'))
        }
      }
      img.onerror = reject
      img.src = url
    })
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              dragOver
                ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/20'
                : 'border-muted hover:border-teal-300 hover:bg-muted/50'
            }`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ImagePlus className="w-8 h-8 text-teal-600" />
            </div>
            <p className="font-medium mb-1">اسحب الصور هنا أو اضغط للرفع</p>
            <p className="text-sm text-muted-foreground">يدعم JPG, PNG, WEBP, GIF</p>
          </div>
        </CardContent>
      </Card>

      {/* Images List */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">{images.length} صورة</h3>
            <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={() => { images.forEach(img => URL.revokeObjectURL(img.url)); setImages([]) }}>
              مسح الكل
            </Button>
          </div>

          <div className="space-y-2 max-h-[40vh] overflow-y-auto scrollbar-thin">
            {images.map((img, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{img.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {img.width} × {img.height} · {formatSize(img.file.size)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7"
                        onClick={() => moveImage(index, 'up')}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7"
                        onClick={() => moveImage(index, 'down')}
                        disabled={index === images.length - 1}
                      >
                        ↓
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-destructive"
                        onClick={() => removeImage(index)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Convert Button */}
      {images.length > 0 && (
        <Button
          onClick={generatePDF}
          disabled={loading || images.length === 0}
          className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white h-12 text-base"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 ml-2 animate-spin" />
              جاري إنشاء PDF...
            </>
          ) : (
            <>
              <FileText className="w-5 h-5 ml-2" />
              تحويل {images.length} صورة إلى PDF
            </>
          )}
        </Button>
      )}

      {/* Tips */}
      {images.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <h4 className="font-medium text-sm mb-2">كيفية الاستخدام</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• اختر صوراً متعددة لتحويلها إلى ملف PDF واحد</li>
              <li>• رتّب الصور بالأسهم أعلاه</li>
              <li>• يتم ضبط حجم كل صورة تلقائياً لتناسب صفحة A4</li>
              <li>• يدعم جميع صيغ الصور الشائعة</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
