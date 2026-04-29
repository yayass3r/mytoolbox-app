'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { RefreshCw, Zap } from 'lucide-react'

interface Tool {
  id: string
  name: string
  nameAr: string
  slug: string
  category: string
  isActive: boolean
  usageCount: number
}

export default function ToolManager() {
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTools = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/tools')
      const data = await res.json()
      setTools(data || [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTools()
  }, [])

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await fetch('/api/admin/tools', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !isActive }),
      })
      fetchTools()
    } catch {
      // silently fail
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">إدارة الأدوات</h3>
        <Button variant="outline" size="sm" onClick={fetchTools}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3 max-h-[60vh] overflow-y-auto scrollbar-thin">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
        ) : (
          tools.map((tool) => (
            <Card key={tool.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{tool.nameAr}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{tool.category}</span>
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{tool.usageCount} استخدام</span>
                      </div>
                    </div>
                  </div>
                  <Switch checked={tool.isActive} onCheckedChange={() => handleToggle(tool.id, tool.isActive)} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

function Button({ variant, size, className, onClick, children }: { variant?: string; size?: string; className?: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button className={`inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all h-9 px-3 ${className || ''}`} onClick={onClick}>
      {children}
    </button>
  )
}
