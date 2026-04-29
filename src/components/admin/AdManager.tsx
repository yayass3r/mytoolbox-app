'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Trash2, RefreshCw } from 'lucide-react'
import { adNetworks, adPositions } from '@/lib/tools-data'
import { getAds, saveAd, updateAd, deleteAd, type AdItem } from '@/lib/storage'

export default function AdManager() {
  const [ads, setAds] = useState<AdItem[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    adNetwork: 'google',
    adCode: '',
    position: 'bottom',
    priority: 0,
  })

  const fetchAds = () => {
    setAds(getAds())
  }

  useEffect(() => {
    fetchAds()
  }, [])

  const handleCreate = () => {
    saveAd(formData)
    setDialogOpen(false)
    setFormData({ name: '', adNetwork: 'google', adCode: '', position: 'bottom', priority: 0 })
    fetchAds()
  }

  const handleToggle = (id: string, isActive: boolean) => {
    updateAd(id, { isActive: !isActive })
    fetchAds()
  }

  const handleDelete = (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return
    deleteAd(id)
    fetchAds()
  }

  const getNetworkName = (id: string) => adNetworks.find(n => n.id === id)?.name || id
  const getPositionName = (id: string) => adPositions.find(p => p.id === id)?.name || id

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">إدارة الإعلانات</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchAds}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
                <Plus className="w-4 h-4 ml-1" />
                إضافة إعلان
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة إعلان جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>اسم الإعلان</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="مثال: إعلان بانر أعلى" />
                </div>
                <div className="space-y-2">
                  <Label>شبكة الإعلان</Label>
                  <select value={formData.adNetwork} onChange={(e) => setFormData({ ...formData, adNetwork: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {adNetworks.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>كود الإعلان</Label>
                  <Textarea value={formData.adCode} onChange={(e) => setFormData({ ...formData, adCode: e.target.value })} placeholder="الصق كود الإعلان هنا..." className="min-h-[100px] font-mono text-xs" dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label>الموقع</Label>
                  <select value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {adPositions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>الأولوية</Label>
                  <Input type="number" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })} min={0} />
                </div>
                <Button onClick={handleCreate} className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white">حفظ</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-3 max-h-[60vh] overflow-y-auto scrollbar-thin">
        {ads.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-base mb-1">لا توجد إعلانات</p>
            <p className="text-sm">اضغط &quot;إضافة إعلان&quot; لإنشاء إعلان جديد</p>
          </div>
        ) : (
          ads.map((ad) => (
            <Card key={ad.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{ad.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{getNetworkName(ad.adNetwork)}</span>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{getPositionName(ad.position)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={ad.isActive} onCheckedChange={() => handleToggle(ad.id, ad.isActive)} />
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(ad.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
