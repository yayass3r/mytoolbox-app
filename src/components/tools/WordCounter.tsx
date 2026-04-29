'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { FileText, Type, AlignLeft, Hash, Clock, BookOpen } from 'lucide-react'

export default function WordCounter() {
  const [text, setText] = useState('')

  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const characters = text.length
    const charactersNoSpaces = text.replace(/\s/g, '').length
    const sentences = text.trim() ? text.split(/[.!?؟。]+/).filter(s => s.trim()).length : 0
    const paragraphs = text.trim() ? text.split(/\n\n+/).filter(p => p.trim()).length : 0
    const readingTimeMinutes = Math.ceil(words / 200)
    const readingTimeSeconds = Math.ceil((words / 200) * 60)

    return {
      words,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      readingTimeMinutes,
      readingTimeSeconds,
    }
  }, [text])

  const statItems = [
    { icon: Type, label: 'الكلمات', value: stats.words, color: 'text-sky-500' },
    { icon: Hash, label: 'الأحرف', value: stats.characters, color: 'text-violet-500' },
    { icon: Hash, label: 'بدون مسافات', value: stats.charactersNoSpaces, color: 'text-pink-500' },
    { icon: AlignLeft, label: 'الجمل', value: stats.sentences, color: 'text-amber-500' },
    { icon: FileText, label: 'الفقرات', value: stats.paragraphs, color: 'text-emerald-500' },
    { icon: Clock, label: 'وقت القراءة', value: `${stats.readingTimeMinutes} دقيقة`, color: 'text-orange-500' },
  ]

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-6 text-white">
          <h2 className="text-xl font-bold mb-1">عداد الكلمات</h2>
          <p className="text-white/80 text-sm">عد الكلمات والأحرف والجمل في النص</p>
        </div>
        <CardContent className="p-6 space-y-6">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="اكتب أو الصق النص هنا..."
            className="min-h-[200px] text-base resize-none"
            dir="rtl"
          />

          <div className="grid grid-cols-2 gap-3">
            {statItems.map((item) => (
              <div key={item.label} className="bg-muted rounded-xl p-4 flex items-center gap-3">
                <div className={`${item.color}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-xl font-bold">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-muted rounded-xl p-4 flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-teal-500" />
            <div>
              <p className="text-xs text-muted-foreground">تقدير وقت القراءة</p>
              <p className="text-lg font-bold">
                حوالي {stats.readingTimeMinutes} دقيقة و{stats.readingTimeSeconds % 60} ثانية
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
