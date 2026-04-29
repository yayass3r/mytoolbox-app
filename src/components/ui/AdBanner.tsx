'use client'

import { useState, useEffect } from 'react'
import { getAdsByPosition, getSetting } from '@/lib/storage'
import type { AdItem } from '@/lib/storage'

export default function AdBanner({ position }: { position: 'top' | 'bottom' | 'between' }) {
  const [ads, setAds] = useState<AdItem[]>([])
  const [adsEnabled, setAdsEnabled] = useState(true)
  const [userHiddenAds, setUserHiddenAds] = useState(false)

  useEffect(() => {
    const loadData = () => {
      setAdsEnabled(getSetting('ads_enabled') !== 'false')
      setUserHiddenAds(localStorage.getItem('toolbox_hide_ads') === 'true')
      setAds(getAdsByPosition(position))
    }
    loadData()
  }, [position])

  // Don't show ads if: globally disabled, user chose to hide, or no ads
  if (!adsEnabled || userHiddenAds || ads.length === 0) return null

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
