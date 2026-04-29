import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { compareSync, hashSync } from 'bcryptjs'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 })
    }

    const valid = compareSync(password, user.password || '')
    if (!valid) {
      return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 })
    }

    const token = randomUUID()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await db.adminSession.create({
      data: { token, userId: user.id, expiresAt },
    })

    return NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email } })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
