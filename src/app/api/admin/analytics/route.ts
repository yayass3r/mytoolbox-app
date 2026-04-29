import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function verifyAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return false
  const token = authHeader.slice(7)
  const session = db.adminSession.findFirst({ where: { token, expiresAt: { gt: new Date() } } })
  return !!session
}

export async function GET(request: NextRequest) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Daily page views
    const dailyViews = await db.$queryRaw<Array<{ date: string; count: bigint }>>`
      SELECT DATE(createdAt) as date, COUNT(*) as count
      FROM Analytics
      WHERE eventType = 'page_view' AND createdAt >= ${sevenDaysAgo}
      GROUP BY DATE(createdAt)
      ORDER BY date
    `
    const formattedViews = dailyViews.map(v => ({ date: v.date, count: Number(v.count) }))

    // Tool usage
    const toolUsage = await db.$queryRaw<Array<{ toolName: string; count: bigint }>>`
      SELECT toolName, COUNT(*) as count
      FROM Analytics
      WHERE eventType = 'tool_used' AND toolName IS NOT NULL AND createdAt >= ${sevenDaysAgo}
      GROUP BY toolName
      ORDER BY count DESC
    `
    const formattedToolUsage = toolUsage.map(t => ({ toolName: t.toolName, count: Number(t.count) }))

    return NextResponse.json({ dailyViews: formattedViews, toolUsage: formattedToolUsage })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventType, toolName } = body

    await db.analytics.create({
      data: {
        eventType: eventType || 'page_view',
        toolName: toolName || null,
        ipAddress: request.headers.get('x-forwarded-for') || null,
        userAgent: request.headers.get('user-agent') || null,
      },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
