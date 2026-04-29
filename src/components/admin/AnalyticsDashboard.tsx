'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

interface DailyView {
  date: string
  count: number
}

interface ToolUsage {
  toolName: string
  count: number
}

interface AnalyticsData {
  dailyViews: DailyView[]
  toolUsage: ToolUsage[]
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData>({ dailyViews: [], toolUsage: [] })
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/analytics')
      const json = await res.json()
      setData({
        dailyViews: json.dailyViews || [],
        toolUsage: json.toolUsage || [],
      })
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const toolNameMap: Record<string, string> = {
    'password-generator': 'مولد كلمات المرور',
    'color-converter': 'محول الألوان',
    'unit-converter': 'محول الوحدات',
    'word-counter': 'عداد الكلمات',
    'json-formatter': 'منسق JSON',
    'base64-tool': 'تشفير Base64',
    'calculator': 'حاسبة متقدمة',
    'stopwatch': 'مؤقت وموقف',
    'text-case-converter': 'محول حالة النص',
    'qr-code-generator': 'مولد QR Code',
  }

  const chartToolUsage = data.toolUsage.map(t => ({
    name: toolNameMap[t.toolName] || t.toolName,
    count: t.count,
  }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">التحليلات</h3>
        <button onClick={fetchData} className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all h-9 px-3 hover:bg-accent">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">جاري تحميل البيانات...</div>
      ) : (
        <>
          {/* Daily Page Views */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">مشاهدات الصفحة اليومية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.dailyViews}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="date" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      formatter={(value: number) => [value, 'مشاهدات']}
                    />
                    <Line type="monotone" dataKey="count" stroke="#0d9488" strokeWidth={2} dot={{ fill: '#0d9488', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Tool Usage */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">استخدام الأدوات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartToolUsage} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis type="number" fontSize={10} />
                    <YAxis type="category" dataKey="name" fontSize={10} width={100} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      formatter={(value: number) => [value, 'استخدام']}
                    />
                    <Bar dataKey="count" fill="#0d9488" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">ملخص</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">إجمالي المشاهدات (7 أيام)</span>
                  <span className="font-medium">{data.dailyViews.reduce((acc, d) => acc + d.count, 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">إجمالي استخدام الأدوات</span>
                  <span className="font-medium">{data.toolUsage.reduce((acc, t) => acc + t.count, 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الأكثر استخداماً</span>
                  <span className="font-medium">{chartToolUsage.length > 0 ? chartToolUsage.reduce((a, b) => a.count > b.count ? a : b).name : '-'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
