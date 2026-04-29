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
    const ads = await db.adConfig.findMany({ orderBy: { priority: 'desc' } })
    return NextResponse.json(ads)
  } catch {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }
    const body = await request.json()
    const { name, adNetwork, adCode, position, priority } = body

    if (!name || !adNetwork) {
      return NextResponse.json({ error: 'الاسم والشبكة مطلوبان' }, { status: 400 })
    }

    const ad = await db.adConfig.create({
      data: { name, adNetwork, adCode: adCode || null, position: position || 'bottom', priority: priority || 0 },
    })
    return NextResponse.json(ad)
  } catch {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 })
    }

    const ad = await db.adConfig.update({ where: { id }, data })
    return NextResponse.json(ad)
  } catch {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 })
    }

    await db.adConfig.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
