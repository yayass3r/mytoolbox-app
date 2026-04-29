'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeftRight } from 'lucide-react'

const conversions = {
  الطول: {
    meters: { name: 'متر', factor: 1 },
    kilometers: { name: 'كيلومتر', factor: 1000 },
    centimeters: { name: 'سنتيمتر', factor: 0.01 },
    millimeters: { name: 'مليمتر', factor: 0.001 },
    miles: { name: 'ميل', factor: 1609.344 },
    yards: { name: 'يارده', factor: 0.9144 },
    feet: { name: 'قدم', factor: 0.3048 },
    inches: { name: 'إنش', factor: 0.0254 },
  },
  الوزن: {
    kilograms: { name: 'كيلوجرام', factor: 1 },
    grams: { name: 'جرام', factor: 0.001 },
    milligrams: { name: 'مليجرام', factor: 0.000001 },
    pounds: { name: 'رطل', factor: 0.453592 },
    ounces: { name: 'أونصة', factor: 0.0283495 },
    tons: { name: 'طن', factor: 1000 },
  },
  درجة_الحرارة: {
    celsius: { name: 'سلسيوس' },
    fahrenheit: { name: 'فهرنهايت' },
    kelvin: { name: 'كلفن' },
  },
  السرعة: {
    'km/h': { name: 'كم/ساعة', factor: 1 },
    'm/s': { name: 'متر/ثانية', factor: 3.6 },
    'mph': { name: 'ميل/ساعة', factor: 1.60934 },
    'knots': { name: 'عقدة', factor: 1.852 },
  },
} as const

type Category = keyof typeof conversions
type UnitKey = string

function convertTemperature(value: number, from: string, to: string): number {
  if (from === to) return value
  let celsius = value
  if (from === 'fahrenheit') celsius = (value - 32) * 5 / 9
  else if (from === 'kelvin') celsius = value - 273.15
  if (to === 'fahrenheit') return celsius * 9 / 5 + 32
  if (to === 'kelvin') return celsius + 273.15
  return celsius
}

export default function UnitConverter() {
  const [category, setCategory] = useState<Category>('الطول')
  const [inputValue, setInputValue] = useState('1')
  const [fromUnit, setFromUnit] = useState('meters')
  const [toUnit, setToUnit] = useState('kilometers')

  const currentUnits = conversions[category]
  const unitKeys = Object.keys(currentUnits) as UnitKey[]

  const handleCategoryChange = (cat: string) => {
    const newCat = cat as Category
    setCategory(newCat)
    const keys = Object.keys(conversions[newCat])
    setFromUnit(keys[0])
    setToUnit(keys[1])
    setInputValue('1')
  }

  const convert = (): string => {
    const val = parseFloat(inputValue)
    if (isNaN(val)) return ''

    if (category === 'درجة_الحرارة') {
      return convertTemperature(val, fromUnit, toUnit).toFixed(4)
    }

    const units = conversions[category] as Record<string, { name: string; factor: number }>
    const fromFactor = units[fromUnit].factor
    const toFactor = units[toUnit].factor
    const result = (val * fromFactor) / toFactor
    return result % 1 === 0 ? result.toString() : result.toFixed(6).replace(/\.?0+$/, '')
  }

  const swapUnits = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white">
          <h2 className="text-xl font-bold mb-1">محول الوحدات</h2>
          <p className="text-white/80 text-sm">تحويل بين الوحدات المختلفة بسهولة</p>
        </div>
        <CardContent className="p-6 space-y-6">
          <Tabs value={category} onValueChange={handleCategoryChange}>
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="الطول" className="text-xs">الطول</TabsTrigger>
              <TabsTrigger value="الوزن" className="text-xs">الوزن</TabsTrigger>
              <TabsTrigger value="درجة_الحرارة" className="text-xs">الحرارة</TabsTrigger>
              <TabsTrigger value="السرعة" className="text-xs">السرعة</TabsTrigger>
            </TabsList>

            {Object.keys(conversions).map((cat) => (
              <TabsContent key={cat} value={cat} className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>من</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="flex-1 text-lg font-mono"
                        dir="ltr"
                      />
                      <select
                        value={fromUnit}
                        onChange={(e) => setFromUnit(e.target.value)}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm min-w-[120px]"
                      >
                        {unitKeys.map((key) => (
                          <option key={key} value={key}>{currentUnits[key as keyof typeof currentUnits].name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button variant="outline" size="icon" onClick={swapUnits} className="rounded-full">
                      <ArrowLeftRight className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>إلى</Label>
                    <div className="flex gap-2">
                      <Input
                        value={convert()}
                        readOnly
                        className="flex-1 text-lg font-mono bg-muted"
                        dir="ltr"
                      />
                      <select
                        value={toUnit}
                        onChange={(e) => setToUnit(e.target.value)}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm min-w-[120px]"
                      >
                        {unitKeys.map((key) => (
                          <option key={key} value={key}>{currentUnits[key as keyof typeof currentUnits].name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="bg-muted rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold font-mono" dir="ltr">
                      {inputValue || '0'} {currentUnits[fromUnit as keyof typeof currentUnits].name} = {convert() || '0'} {currentUnits[toUnit as keyof typeof currentUnits].name}
                    </p>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
