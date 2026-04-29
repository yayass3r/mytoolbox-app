export interface ToolDef {
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  icon: string
  slug: string
  category: string
  color: string
  bgGradient: string
}

export const categories = [
  { id: 'all', name: 'جميع الأدوات', icon: 'Grid3X3' },
  { id: 'الأدوات الأساسية', name: 'الأدوات الأساسية', icon: 'Wrench' },
  { id: 'أدوات النصوص', name: 'أدوات النصوص', icon: 'Type' },
  { id: 'أدوات التصميم', name: 'أدوات التصميم', icon: 'Paintbrush' },
  { id: 'أدوات الرياضيات', name: 'أدوات الرياضيات', icon: 'Sigma' },
]

export const toolsData: ToolDef[] = [
  {
    name: 'Password Generator',
    nameAr: 'مولد كلمات المرور',
    description: 'Generate secure passwords',
    descriptionAr: 'إنشاء كلمات مرور آمنة',
    icon: 'KeyRound',
    slug: 'password-generator',
    category: 'الأدوات الأساسية',
    color: 'text-teal-600',
    bgGradient: 'from-teal-500 to-emerald-600',
  },
  {
    name: 'Color Converter',
    nameAr: 'محول الألوان',
    description: 'Convert between color formats',
    descriptionAr: 'تحويل بين صيغ الألوان',
    icon: 'Palette',
    slug: 'color-converter',
    category: 'أدوات التصميم',
    color: 'text-pink-600',
    bgGradient: 'from-pink-500 to-rose-600',
  },
  {
    name: 'Unit Converter',
    nameAr: 'محول الوحدات',
    description: 'Convert between units',
    descriptionAr: 'تحويل بين الوحدات المختلفة',
    icon: 'Ruler',
    slug: 'unit-converter',
    category: 'الأدوات الأساسية',
    color: 'text-amber-600',
    bgGradient: 'from-amber-500 to-orange-600',
  },
  {
    name: 'Word Counter',
    nameAr: 'عداد الكلمات',
    description: 'Count words and characters',
    descriptionAr: 'عد الكلمات والأحرف',
    icon: 'FileText',
    slug: 'word-counter',
    category: 'أدوات النصوص',
    color: 'text-sky-600',
    bgGradient: 'from-sky-500 to-blue-600',
  },
  {
    name: 'JSON Formatter',
    nameAr: 'منسق JSON',
    description: 'Format and validate JSON',
    descriptionAr: 'تنسيق والتحقق من JSON',
    icon: 'Braces',
    slug: 'json-formatter',
    category: 'أدوات النصوص',
    color: 'text-violet-600',
    bgGradient: 'from-violet-500 to-purple-600',
  },
  {
    name: 'Base64 Encoder/Decoder',
    nameAr: 'تشفير Base64',
    description: 'Encode and decode Base64',
    descriptionAr: 'ترميز وفك ترميز Base64',
    icon: 'Lock',
    slug: 'base64-tool',
    category: 'الأدوات الأساسية',
    color: 'text-emerald-600',
    bgGradient: 'from-emerald-500 to-teal-600',
  },
  {
    name: 'Advanced Calculator',
    nameAr: 'حاسبة متقدمة',
    description: 'Scientific calculator',
    descriptionAr: 'حاسبة علمية متقدمة',
    icon: 'Calculator',
    slug: 'calculator',
    category: 'أدوات الرياضيات',
    color: 'text-orange-600',
    bgGradient: 'from-orange-500 to-red-600',
  },
  {
    name: 'Stopwatch & Timer',
    nameAr: 'مؤقت وموقف',
    description: 'Stopwatch and countdown timer',
    descriptionAr: 'ساعة إيقاف ومؤقت عد تنازلي',
    icon: 'Timer',
    slug: 'stopwatch',
    category: 'الأدوات الأساسية',
    color: 'text-cyan-600',
    bgGradient: 'from-cyan-500 to-sky-600',
  },
  {
    name: 'Text Case Converter',
    nameAr: 'محول حالة النص',
    description: 'Convert text case',
    descriptionAr: 'تحويل حالة النص',
    icon: 'CaseSensitive',
    slug: 'text-case-converter',
    category: 'أدوات النصوص',
    color: 'text-indigo-600',
    bgGradient: 'from-indigo-500 to-violet-600',
  },
  {
    name: 'QR Code Generator',
    nameAr: 'مولد QR Code',
    description: 'Generate QR codes',
    descriptionAr: 'إنشاء رموز QR',
    icon: 'QrCode',
    slug: 'qr-code-generator',
    category: 'أدوات التصميم',
    color: 'text-fuchsia-600',
    bgGradient: 'from-fuchsia-500 to-pink-600',
  },
]

export const adNetworks = [
  { id: 'google', name: 'Google AdSense' },
  { id: 'taboola', name: 'Taboola' },
  { id: 'outbrain', name: 'Outbrain' },
  { id: 'propellerads', name: 'PropellerAds' },
  { id: 'media.net', name: 'Media.net' },
]

export const adPositions = [
  { id: 'top', name: 'أعلى الصفحة' },
  { id: 'bottom', name: 'أسفل الصفحة' },
  { id: 'between', name: 'بين الأدوات' },
]
