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
    const tools = await db.tool.findMany({ orderBy: { createdAt: 'asc' } })
    return NextResponse.json(tools)
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

    const tool = await db.tool.update({ where: { id }, data })
    return NextResponse.json(tool)
  } catch {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
