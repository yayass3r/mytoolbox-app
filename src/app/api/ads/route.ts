import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Check if ads are enabled globally
    const adsSetting = await db.appSettings.findUnique({ where: { key: 'ads_enabled' } })
    if (adsSetting?.value === 'false') {
      return NextResponse.json([])
    }

    const ads = await db.adConfig.findMany({
      where: { isActive: true },
      orderBy: { priority: 'desc' },
    })

    return NextResponse.json(ads)
  } catch {
    return NextResponse.json([])
  }
}
