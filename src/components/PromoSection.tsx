'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Share2, Download, Users, Wrench, Shield, Zap, Smartphone, Globe, Star } from 'lucide-react'
import ShareSheet from '@/components/ShareSheet'

const SITE_URL = 'https://personal-projects-toolbox-pro.appwrite.network'

export default function PromoSection() {
  return (
    <section className="px-4 pb-6 max-w-lg mx-auto">
      {/* App Install Banner */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-600 text-white overflow-hidden mb-4">
        <CardContent className="p-5 relative">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-amber-300" />
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">تطبيق ويب PWA</span>
            </div>
            <h3 className="text-lg font-bold mb-1">ثبّت التطبيق على جهازك</h3>
            <p className="text-white/80 text-sm mb-3">
              أضف مجموعة أدواتي إلى شاشتك الرئيسية واستخدم الأدوات بدون إنترنت في أي وقت!
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-xl text-xs">
                <Smartphone className="w-3.5 h-3.5" />
                <span>يعمل بدون إنترنت</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-xl text-xs">
                <Zap className="w-3.5 h-3.5" />
                <span>سريع وخفيف</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-xl text-xs">
                <Shield className="w-3.5 h-3.5" />
                <span>آمن 100%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Section */}
      <Card className="border-0 shadow-md mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm">شارك التطبيق مع أصدقائك</h3>
              <p className="text-xs text-muted-foreground">ساعدنا في الوصول لمزيد من المستخدمين</p>
            </div>
            <ShareSheet />
          </div>
          <div className="flex items-center gap-2">
            {['واتساب', 'تيليجرام', 'إكس', 'فيسبوك'].map(name => (
              <SocialMiniButton key={name} name={name} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Features/Trust Section */}
      <Card className="border-0 shadow-md mb-4">
        <CardContent className="p-4">
          <h3 className="font-bold text-sm mb-3">لماذا مجموعة أدواتي؟</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: <Wrench className="w-4 h-4 text-teal-600" />, label: '14 أداة متنوعة', desc: 'أدوات نصوص، صور، رياضيات وأكثر' },
              { icon: <Shield className="w-4 h-4 text-blue-600" />, label: 'خصوصية تامة', desc: 'بياناتك لا تغادر متصفحك' },
              { icon: <Zap className="w-4 h-4 text-amber-500" />, label: 'سريع جداً', desc: 'يعمل فوراً بدون انتظار' },
              { icon: <Globe className="w-4 h-4 text-emerald-600" />, label: 'يعمل بالعربي', desc: 'واجهة كاملة باللغة العربية' },
              { icon: <Smartphone className="w-4 h-4 text-purple-600" />, label: 'يعمل على الجوال', desc: 'متجاوب مع جميع الشاشات' },
              { icon: <Users className="w-4 h-4 text-rose-500" />, label: 'مجاني للجميع', desc: 'بدون اشتراكات أو رسوم' },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-2 p-2 bg-muted/50 rounded-xl">
                <div className="mt-0.5">{item.icon}</div>
                <div>
                  <p className="text-xs font-medium">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reviews/Rating Section */}
      <Card className="border-0 shadow-md mb-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
        <CardContent className="p-4 text-center">
          <div className="flex justify-center gap-0.5 mb-2">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <h3 className="font-bold text-base mb-1">قيّم التطبيق</h3>
          <p className="text-xs text-muted-foreground mb-3">
            رأيك يهمنا! شاركنا تجربتك مع مجموعة أدواتي
          </p>
          <div className="flex justify-center gap-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent('أنصح بمجموعة أدواتي! تطبيق رائع فيه 14 أداة مجانية 🛠️\n' + SITE_URL)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-medium hover:bg-green-600 transition-colors"
            >
              أوصي به
            </a>
            <button
              onClick={() => {
                if (typeof navigator !== 'undefined' && 'share' in navigator) {
                  navigator.share({
                    title: 'مجموعة أدواتي',
                    text: 'تطبيق رائع فيه 14 أداة مجانية!',
                    url: SITE_URL,
                  }).catch(() => {})
                }
              }}
              className="bg-teal-500 text-white px-4 py-2 rounded-xl text-xs font-medium hover:bg-teal-600 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 inline ml-1" />
              شارك
            </button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

function SocialMiniButton({ name }: { name: string }) {
  const colors: Record<string, string> = {
    'واتساب': 'bg-green-100 dark:bg-green-900/30 text-green-600',
    'تيليجرام': 'bg-sky-100 dark:bg-sky-900/30 text-sky-600',
    'إكس': 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    'فيسبوك': 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
  }

  const urls: Record<string, string> = {
    'واتساب': `https://wa.me/?text=${encodeURIComponent('جرب مجموعة أدواتي! 14 أداة مجانية رائعة 🛠️\n' + SITE_URL)}`,
    'تيليجرام': `https://t.me/share/url?url=${encodeURIComponent(SITE_URL)}&text=${encodeURIComponent('جرب مجموعة أدواتي! 14 أداة مجانية رائعة 🛠️')}`,
    'إكس': `https://twitter.com/intent/tweet?text=${encodeURIComponent('جرب مجموعة أدواتي! 14 أداة مجانية رائعة 🛠️')}&url=${encodeURIComponent(SITE_URL)}`,
    'فيسبوك': `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}`,
  }

  return (
    <a
      href={urls[name]}
      target="_blank"
      rel="noopener noreferrer"
      className={`${colors[name]} px-3 py-1.5 rounded-full text-[10px] font-medium hover:opacity-80 transition-opacity`}
    >
      {name}
    </a>
  )
}
