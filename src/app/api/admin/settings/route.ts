import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashSync } from 'bcryptjs'

function verifyAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return false
  const token = authHeader.slice(7)
  const session = db.adminSession.findFirst({ where: { token, expiresAt: { gt: new Date() } } })
  return !!session
}

export async function GET(request: NextRequest) {
  try {
    const settings = await db.appSettings.findMany()
    return NextResponse.json(settings)
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
    const { key, value } = body

    if (!key) {
      return NextResponse.json({ error: 'المفتاح مطلوب' }, { status: 400 })
    }

    // Handle password change
    if (key === 'admin_password') {
      if (!value || value.length < 6) {
        return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }, { status: 400 })
      }
      const hashedPassword = hashSync(value, 10)
      await db.user.updateMany({
        where: { role: 'admin' },
        data: { password: hashedPassword },
      })
      return NextResponse.json({ success: true })
    }

    const setting = await db.appSettings.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    })

    return NextResponse.json(setting)
  } catch {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
