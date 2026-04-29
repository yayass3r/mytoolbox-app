'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Copy, Check, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function JsonFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [copied, setCopied] = useState(false)

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed, null, 2))
      setError('')
      setIsValid(true)
    } catch (e) {
      setError((e as Error).message)
      setOutput('')
      setIsValid(false)
    }
  }

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed))
      setError('')
      setIsValid(true)
    } catch (e) {
      setError((e as Error).message)
      setOutput('')
      setIsValid(false)
    }
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
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-6 text-white">
          <h2 className="text-xl font-bold mb-1">منسق JSON</h2>
          <p className="text-white/80 text-sm">تنسيق والتحقق من صحة JSON</p>
        </div>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">المدخلات</label>
            <Textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                setIsValid(null)
                setError('')
              }}
              placeholder='{"key": "value"}'
              className="min-h-[150px] font-mono text-sm resize-none"
              dir="ltr"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={formatJson} className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white">
              تنسيق
            </Button>
            <Button onClick={minifyJson} variant="outline" className="flex-1">
              ضغط
            </Button>
            <Button onClick={copyOutput} variant="outline" disabled={!output}>
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400" dir="ltr">{error}</p>
            </div>
          )}

          {isValid === true && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <p className="text-sm text-emerald-600 dark:text-emerald-400">JSON صالح ✓</p>
            </div>
          )}

          {output && (
            <div className="space-y-2">
              <label className="text-sm font-medium">المخرجات</label>
              <pre
                className="bg-muted rounded-xl p-4 overflow-auto max-h-[300px] text-sm font-mono whitespace-pre-wrap scrollbar-thin"
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
