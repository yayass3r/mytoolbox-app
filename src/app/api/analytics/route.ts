import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventType, toolName } = body

    // Check if analytics is enabled
    const analyticsSetting = await db.appSettings.findUnique({ where: { key: 'analytics_enabled' } })
    if (analyticsSetting?.value === 'false') {
      return NextResponse.json({ success: true })
    }

    await db.analytics.create({
      data: {
        eventType: eventType || 'page_view',
        toolName: toolName || null,
        ipAddress: request.headers.get('x-forwarded-for') || null,
        userAgent: request.headers.get('user-agent') || null,
      },
    })

    // Update tool usage count
    if (eventType === 'tool_used' && toolName) {
      await db.tool.updateMany({
        where: { slug: toolName },
        data: { usageCount: { increment: 1 } },
      })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
