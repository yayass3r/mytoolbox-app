'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'

function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase())
}

function toSentenceCase(str: string): string {
  return str.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase())
}

function toCamelCase(str: string): string {
  return str.toLowerCase().replace(/[^a-zA-Z0-9\u0600-\u06FF]+(.)/g, (_, c) => c.toUpperCase())
}

function toSnakeCase(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9\u0600-\u06FF_]/g, '')
}

function toKebabCase(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\u0600-\u06FF-]/g, '')
}

function toAlternatingCase(str: string): string {
  return str.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('')
}

export default function TextCaseConverter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const conversions = [
    { label: 'أحرف كبيرة', fn: (s: string) => s.toUpperCase() },
    { label: 'أحرف صغيرة', fn: (s: string) => s.toLowerCase() },
    { label: 'Title Case', fn: toTitleCase },
    { label: 'Sentence case', fn: toSentenceCase },
    { label: 'camelCase', fn: toCamelCase },
    { label: 'snake_case', fn: toSnakeCase },
    { label: 'kebab-case', fn: toKebabCase },
    { label: 'aLtErNaTiNg', fn: toAlternatingCase },
  ]

  const copyOutput = () => {
    if (output) {
      navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-indigo-500 to-violet-600 p-6 text-white">
          <h2 className="text-xl font-bold mb-1">محول حالة النص</h2>
          <p className="text-white/80 text-sm">تحويل حالة النص بطرق مختلفة</p>
        </div>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">النص الأصلي</label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="أدخل النص هنا..."
              className="min-h-[120px] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {conversions.map((conv) => (
              <Button
                key={conv.label}
                variant="outline"
                size="sm"
                className="text-xs h-10"
                onClick={() => setOutput(conv.fn(input))}
                disabled={!input}
              >
                {conv.label}
              </Button>
            ))}
          </div>

          {output && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">النتيجة</label>
                <Button variant="ghost" size="sm" onClick={copyOutput}>
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <pre className="bg-muted rounded-xl p-4 overflow-auto max-h-[200px] text-sm whitespace-pre-wrap scrollbar-thin">
                {output}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
