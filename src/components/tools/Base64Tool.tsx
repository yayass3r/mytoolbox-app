'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Check } from 'lucide-react'

export default function Base64Tool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const encode = () => {
    try {
      const result = btoa(unescape(encodeURIComponent(input)))
      setOutput(result)
    } catch {
      setOutput('خطأ في الترميز')
    }
  }

  const decode = () => {
    try {
      const result = decodeURIComponent(escape(atob(input)))
      setOutput(result)
    } catch {
      setOutput('خطأ: النص ليس بصيغة Base64 صالحة')
    }
  }

  const process = (mode: 'encode' | 'decode') => {
    if (mode === 'encode') encode()
    else decode()
  }

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
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
          <h2 className="text-xl font-bold mb-1">تشفير Base64</h2>
          <p className="text-white/80 text-sm">ترميز وفك ترميز Base64</p>
        </div>
        <CardContent className="p-6 space-y-4">
          <Tabs defaultValue="encode">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="encode">ترميز</TabsTrigger>
              <TabsTrigger value="decode">فك الترميز</TabsTrigger>
            </TabsList>
            <TabsContent value="encode" className="mt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">النص الأصلي</label>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="أدخل النص المراد ترميزه..."
                  className="min-h-[120px] font-mono text-sm resize-none"
                />
              </div>
              <Button onClick={() => process('encode')} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                ترميز Base64
              </Button>
            </TabsContent>
            <TabsContent value="decode" className="mt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">نص Base64</label>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="أدخل نص Base64 المراد فك ترميزه..."
                  className="min-h-[120px] font-mono text-sm resize-none"
                  dir="ltr"
                />
              </div>
              <Button onClick={() => process('decode')} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                فك ترميز Base64
              </Button>
            </TabsContent>
          </Tabs>

          {output && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">النتيجة</label>
                <Button variant="ghost" size="sm" onClick={copyOutput}>
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <pre
                className="bg-muted rounded-xl p-4 overflow-auto max-h-[200px] text-sm font-mono whitespace-pre-wrap break-all scrollbar-thin"
                dir="ltr"
              >
                {output}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
