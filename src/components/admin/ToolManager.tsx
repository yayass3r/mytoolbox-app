'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { RefreshCw, Zap } from 'lucide-react'
import { toolsData } from '@/lib/tools-data'
import { getToolsState, updateToolState, type ToolState } from '@/lib/storage'

export default function ToolManager() {
  const [toolStates, setToolStates] = useState<ToolState[]>([])

  const fetchData = () => {
    setToolStates(getToolsState())
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleToggle = (slug: string, isActive: boolean) => {
    updateToolState(slug, { isActive: !isActive })
    fetchData()
  }

  const getToolInfo = (slug: string) => toolsData.find(t => t.slug === slug)
  const getState = (slug: string) => toolStates.find(t => t.slug === slug)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">إدارة الأدوات</h3>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3 max-h-[60vh] overflow-y-auto scrollbar-thin">
        {toolsData.map((tool) => {
          const state = getState(tool.slug)
          const isActive = state ? state.isActive : true
          const usageCount = state?.usageCount || 0

          return (
            <Card key={tool.slug} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${tool.bgGradient} flex items-center justify-center shrink-0`}>
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{tool.nameAr}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{tool.category}</span>
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{usageCount} استخدام</span>
                      </div>
                    </div>
                  </div>
                  <Switch checked={isActive} onCheckedChange={() => handleToggle(tool.slug, isActive)} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
