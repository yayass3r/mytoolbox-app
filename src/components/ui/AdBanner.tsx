'use client'

import { useState, useEffect } from 'react'
import { getAdsByPosition, getSetting } from '@/lib/storage'
import type { AdItem } from '@/lib/storage'

export default function AdBanner({ position }: { position: 'top' | 'bottom' | 'between' }) {
  const [ads, setAds] = useState<AdItem[]>([])
  const [adsEnabled, setAdsEnabled] = useState(true)

  useEffect(() => {
    const loadData = () => {
      setAdsEnabled(getSetting('ads_enabled') !== 'false')
      setAds(getAdsByPosition(position))
    }
    loadData()
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
