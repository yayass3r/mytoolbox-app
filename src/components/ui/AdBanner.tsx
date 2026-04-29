'use client'

import { useEffect, useState } from 'react'

interface Ad {
  id: string
  name: string
  adCode: string | null
  position: string
  adNetwork: string
  isActive: boolean
}

export default function AdBanner({ position }: { position: 'top' | 'bottom' | 'between' }) {
  const [ads, setAds] = useState<Ad[]>([])
  const [adsEnabled, setAdsEnabled] = useState(true)

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const [adsRes, settingsRes] = await Promise.all([
          fetch('/api/ads'),
          fetch('/api/admin/settings'),
        ])
        const adsData = await adsRes.json()
        const settingsData = await settingsRes.json()

        const adsEnabledSetting = settingsData?.find?.((s: { key: string; value: string }) => s.key === 'ads_enabled')
        setAdsEnabled(adsEnabledSetting?.value !== 'false')

        const filtered = (adsData || [])
          .filter((ad: Ad) => ad.isActive && ad.position === position && ad.adCode)
          .sort((a: Ad, b: Ad) => b.priority - a.priority)
        setAds(filtered)
      } catch {
        // silently fail
      }
    }
    fetchAds()
  }, [position])

  if (!adsEnabled || ads.length === 0) return null

  return (
    <div className="space-y-2">
      {ads.map((ad) => (
        <div key={ad.id} className="ad-container w-full">
          <div dangerouslySetInnerHTML={{ __html: ad.adCode || '' }} />
        </div>
      ))}
    </div>
  )
}
