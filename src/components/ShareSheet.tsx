'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Share2,
  Copy,
  Check,
  Download,
  Smartphone,
  X,
  Star,
} from 'lucide-react'

const SITE_URL = 'https://personal-projects-toolbox-pro.appwrite.network'

interface ShareSheetProps {
  toolSlug?: string
  toolName?: string
}

export default function ShareSheet({ toolSlug, toolName }: ShareSheetProps) {
  const [copied, setCopied] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const shareUrl = toolSlug ? `${SITE_URL}/#tool-${toolSlug}` : SITE_URL
  const shareText = toolName
    ? `جرب ${toolName} مجاناً على مجموعة أدواتي! 14 أداة مجانية رائعة 🛠️`
    : `جرب مجموعة أدواتي! 14 أداة مجانية رائعة للمتصفح 🔧📱\n- مولد كلمات المرور\n- محول الصور إلى PDF\n- تغيير حجم الصور\n- مولد QR Code\n- وأكثر...\n\nاستخدمها مجاناً الآن!`

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const ta = document.createElement('textarea')
      ta.value = shareUrl
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [shareUrl])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: toolName || 'مجموعة أدواتي - أدوات مجانية',
          text: shareText,
          url: shareUrl,
        })
        return
      } catch {
        // User cancelled or error
      }
    }
  }

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const result = await deferredPrompt.userChoice
      if (result.outcome === 'accepted') {
        setShowInstall(false)
      }
      setDeferredPrompt(null)
    }
  }

  const shareLinks = [
    {
      name: 'واتساب',
      color: 'bg-green-500 hover:bg-green-600',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
      url: `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`,
    },
    {
      name: 'تيليجرام',
      color: 'bg-sky-500 hover:bg-sky-600',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" aria-hidden="true">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      ),
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'إكس / تويتر',
      color: 'bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'فيسبوك',
      color: 'bg-blue-600 hover:bg-blue-700',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'لينكد إن',
      color: 'bg-blue-700 hover:bg-blue-800',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
  ]

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white"
          >
            <Share2 className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh]">
          <SheetHeader className="text-right pb-2">
            <SheetTitle className="text-lg">مشاركة التطبيق</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 mt-2">
            {/* Install App */}
            {showInstall && (
              <button
                onClick={handleInstall}
                className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-2xl"
              >
                <Download className="w-6 h-6" />
                <div className="text-right flex-1">
                  <p className="font-bold text-base">تثبيت التطبيق</p>
                  <p className="text-white/80 text-xs">أضفه إلى شاشتك الرئيسية</p>
                </div>
                <Smartphone className="w-5 h-5 opacity-70" />
              </button>
            )}

            {/* Quick Share (mobile) */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleShare}
                className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl border shadow-sm"
              >
                <Share2 className="w-6 h-6 text-teal-600" />
                <div className="text-right flex-1">
                  <p className="font-bold text-base">مشاركة مباشرة</p>
                  <p className="text-muted-foreground text-xs">مشاركة عبر التطبيقات</p>
                </div>
              </button>
            )}

            {/* Social Links */}
            <div className="grid grid-cols-2 gap-3">
              {shareLinks.map(link => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${link.color} text-white rounded-2xl p-4 flex items-center gap-3 transition-all active:scale-95`}
                >
                  {link.icon}
                  <span className="font-medium text-sm">{link.name}</span>
                </a>
              ))}
            </div>

            {/* Copy Link */}
            <button
              onClick={copyLink}
              className="w-full flex items-center gap-3 p-4 bg-muted rounded-2xl transition-all active:scale-95"
            >
              {copied ? (
                <Check className="w-6 h-6 text-emerald-500" />
              ) : (
                <Copy className="w-6 h-6 text-muted-foreground" />
              )}
              <div className="text-right flex-1">
                <p className="font-medium text-sm">
                  {copied ? 'تم النسخ!' : 'نسخ الرابط'}
                </p>
                <p className="text-xs text-muted-foreground truncate" dir="ltr">{shareUrl}</p>
              </div>
            </button>

            {/* Rate & Review */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl p-4 text-center">
              <p className="text-sm font-medium mb-2">استمتع بالتطبيق؟</p>
              <div className="flex justify-center gap-1 mb-3">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">شاركه مع أصدقائك ليفيد الجميع</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
