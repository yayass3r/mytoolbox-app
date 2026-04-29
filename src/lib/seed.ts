import { db } from '@/lib/db'
import { hashSync } from 'bcryptjs'

async function main() {
  // Create admin user
  const existingAdmin = await db.user.findUnique({ where: { email: 'admin@toolbox.com' } })
  if (!existingAdmin) {
    await db.user.create({
      data: {
        email: 'admin@toolbox.com',
        name: 'المدير',
        password: hashSync('admin123', 10),
        role: 'admin',
      },
    })
    console.log('✅ Admin user created')
  }

  // Create tools
  const tools = [
    { name: 'Password Generator', nameAr: 'مولد كلمات المرور', description: 'Generate secure passwords', descriptionAr: 'إنشاء كلمات مرور آمنة', icon: 'KeyRound', slug: 'password-generator', category: 'الأدوات الأساسية' },
    { name: 'Color Converter', nameAr: 'محول الألوان', description: 'Convert between color formats', descriptionAr: 'تحويل بين صيغ الألوان', icon: 'Palette', slug: 'color-converter', category: 'أدوات التصميم' },
    { name: 'Unit Converter', nameAr: 'محول الوحدات', description: 'Convert between units', descriptionAr: 'تحويل بين الوحدات المختلفة', icon: 'Ruler', slug: 'unit-converter', category: 'الأدوات الأساسية' },
    { name: 'Word Counter', nameAr: 'عداد الكلمات', description: 'Count words and characters', descriptionAr: 'عد الكلمات والأحرف', icon: 'FileText', slug: 'word-counter', category: 'أدوات النصوص' },
    { name: 'JSON Formatter', nameAr: 'منسق JSON', description: 'Format and validate JSON', descriptionAr: 'تنسيق والتحقق من JSON', icon: 'Braces', slug: 'json-formatter', category: 'أدوات النصوص' },
    { name: 'Base64 Encoder/Decoder', nameAr: 'تشفير Base64', description: 'Encode and decode Base64', descriptionAr: 'ترميز وفك ترميز Base64', icon: 'Lock', slug: 'base64-tool', category: 'الأدوات الأساسية' },
    { name: 'Advanced Calculator', nameAr: 'حاسبة متقدمة', description: 'Scientific calculator', descriptionAr: 'حاسبة علمية متقدمة', icon: 'Calculator', slug: 'calculator', category: 'أدوات الرياضيات' },
    { name: 'Stopwatch & Timer', nameAr: 'مؤقت وموقف', description: 'Stopwatch and countdown timer', descriptionAr: 'ساعة إيقاف ومؤقت عد تنازلي', icon: 'Timer', slug: 'stopwatch', category: 'الأدوات الأساسية' },
    { name: 'Text Case Converter', nameAr: 'محول حالة النص', description: 'Convert text case', descriptionAr: 'تحويل حالة النص', icon: 'CaseSensitive', slug: 'text-case-converter', category: 'أدوات النصوص' },
    { name: 'QR Code Generator', nameAr: 'مولد QR Code', description: 'Generate QR codes', descriptionAr: 'إنشاء رموز QR', icon: 'QrCode', slug: 'qr-code-generator', category: 'أدوات التصميم' },
  ]

  for (const tool of tools) {
    const existing = await db.tool.findUnique({ where: { slug: tool.slug } })
    if (!existing) {
      await db.tool.create({ data: tool })
    }
  }
  console.log('✅ Tools created')

  // Create default ads (inactive)
  const ads = [
    { name: 'إعلان جوجل أدسنس - أعلى', adNetwork: 'google', adCode: '<div>Google AdSense - Top Banner</div>', position: 'top', isActive: false, priority: 1 },
    { name: 'إعلان جوجل أدسنس - أسفل', adNetwork: 'google', adCode: '<div>Google AdSense - Bottom Banner</div>', position: 'bottom', isActive: false, priority: 1 },
    { name: 'إعلان تابولا', adNetwork: 'taboola', adCode: '<div>Taboola Widget</div>', position: 'bottom', isActive: false, priority: 2 },
    { name: 'إعلان أوتبرين', adNetwork: 'outbrain', adCode: '<div>Outbrain Widget</div>', position: 'bottom', isActive: false, priority: 3 },
    { name: 'إعلان بروبيلر أدز', adNetwork: 'propellerads', adCode: '<div>PropellerAds Banner</div>', position: 'top', isActive: false, priority: 4 },
    { name: 'إعلان ميديا نت', adNetwork: 'media.net', adCode: '<div>Media.net Ad</div>', position: 'between', isActive: false, priority: 5 },
  ]

  for (const ad of ads) {
    const existing = await db.adConfig.findFirst({ where: { name: ad.name } })
    if (!existing) {
      await db.adConfig.create({ data: ad })
    }
  }
  console.log('✅ Ads created')

  // Create default settings
  const settings = [
    { key: 'app_name', value: 'مجموعة أدواتي', type: 'string' },
    { key: 'app_description', value: 'مجموعة أدوات مجانية للجميع', type: 'string' },
    { key: 'ads_enabled', value: 'true', type: 'boolean' },
    { key: 'analytics_enabled', value: 'true', type: 'boolean' },
  ]

  for (const setting of settings) {
    const existing = await db.appSettings.findUnique({ where: { key: setting.key } })
    if (!existing) {
      await db.appSettings.create({ data: setting })
    }
  }
  console.log('✅ Settings created')

  // Create some sample analytics
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    for (let j = 0; j < Math.floor(Math.random() * 20) + 5; j++) {
      const eventDate = new Date(date)
      eventDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60))
      await db.analytics.create({
        data: {
          eventType: 'page_view',
          toolName: null,
          createdAt: eventDate,
        },
      })
    }

    const toolSlugs = ['password-generator', 'color-converter', 'unit-converter', 'word-counter', 'json-formatter', 'base64-tool', 'calculator', 'stopwatch', 'text-case-converter', 'qr-code-generator']
    for (const slug of toolSlugs) {
      if (Math.random() > 0.3) {
        const toolDate = new Date(date)
        toolDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60))
        await db.analytics.create({
          data: {
            eventType: 'tool_used',
            toolName: slug,
            createdAt: toolDate,
          },
        })
      }
    }
  }
  console.log('✅ Sample analytics created')

  console.log('\n🎉 Database seeded successfully!')
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
