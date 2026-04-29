'use client'

import { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Delete } from 'lucide-react'

export default function Calculator() {
  const [display, setDisplay] = useState('0')
  const [prev, setPrev] = useState<number | null>(null)
  const [op, setOp] = useState<string | null>(null)
  const [newNumber, setNewNumber] = useState(true)
  const [history, setHistory] = useState<string[]>([])
  const [showHistory, setShowHistory] = useState(false)

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num === '.' ? '0.' : num)
      setNewNumber(false)
    } else {
      if (num === '.' && display.includes('.')) return
      setDisplay(display + num)
    }
  }

  const handleOperator = (operator: string) => {
    const current = parseFloat(display)
    if (prev !== null && op && !newNumber) {
      const result = calculate(prev, current, op)
      setDisplay(String(result))
      setPrev(result)
      setHistory(h => [`${prev} ${op} ${current} = ${result}`, ...h].slice(0, 20))
    } else {
      setPrev(current)
    }
    setOp(operator)
    setNewNumber(true)
  }

  const calculate = (a: number, b: number, operator: string): number => {
    switch (operator) {
      case '+': return a + b
      case '-': return a - b
      case '×': return a * b
      case '÷': return b !== 0 ? a / b : 0
      default: return b
    }
  }

  const handleEquals = () => {
    if (prev !== null && op) {
      const current = parseFloat(display)
      const result = calculate(prev, current, op)
      setDisplay(String(result))
      setHistory(h => [`${prev} ${op} ${current} = ${result}`, ...h].slice(0, 20))
      setPrev(null)
      setOp(null)
      setNewNumber(true)
    }
  }

  const handleClear = () => {
    setDisplay('0')
    setPrev(null)
    setOp(null)
    setNewNumber(true)
  }

  const handlePercent = () => {
    setDisplay(String(parseFloat(display) / 100))
  }

  const handleToggleSign = () => {
    setDisplay(String(-parseFloat(display)))
  }

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1))
    } else {
      setDisplay('0')
      setNewNumber(true)
    }
  }

  const handleScientific = (func: string) => {
    const val = parseFloat(display)
    let result: number
    switch (func) {
      case 'sin': result = Math.sin(val * Math.PI / 180); break
      case 'cos': result = Math.cos(val * Math.PI / 180); break
      case 'tan': result = Math.tan(val * Math.PI / 180); break
      case 'log': result = Math.log10(val); break
      case 'ln': result = Math.log(val); break
      case 'sqrt': result = Math.sqrt(val); break
      case 'x²': result = val * val; break
      case 'π': result = Math.PI; break
      case 'e': result = Math.E; break
      default: return
    }
    setDisplay(String(result))
    setNewNumber(true)
  }

  const buttons = [
    ['sin', 'cos', 'tan', 'π'],
    ['log', 'ln', '√', 'e'],
    ['x²', '%', 'CE', 'C'],
    ['7', '8', '9', '÷'],
    ['4', '5', '6', '×'],
    ['1', '2', '3', '-'],
    ['0', '.', '±', '+'],
  ]

  const sciButtons = ['sin', 'cos', 'tan', 'log', 'ln', '√', 'x²', 'π', 'e']

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white">
          <h2 className="text-xl font-bold mb-1">حاسبة متقدمة</h2>
          <p className="text-white/80 text-sm">حاسبة علمية متقدمة</p>
        </div>
        <CardContent className="p-4 space-y-4">
          {/* Display */}
          <div className="bg-muted rounded-xl p-4">
            {prev !== null && op && (
              <div className="text-xs text-muted-foreground mb-1" dir="ltr">{prev} {op}</div>
            )}
            <div className="text-3xl font-bold font-mono text-left truncate" dir="ltr">
              {display}
            </div>
          </div>

          {/* History toggle */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? 'إخفاء السجل' : 'عرض السجل'}
            </Button>
          </div>

          {showHistory && history.length > 0 && (
            <div className="bg-muted rounded-xl p-3 max-h-32 overflow-y-auto scrollbar-thin">
              {history.map((h, i) => (
                <p key={i} className="text-xs font-mono py-1 border-b border-border last:border-0" dir="ltr">{h}</p>
              ))}
            </div>
          )}

          {/* Scientific buttons */}
          <div className="grid grid-cols-4 gap-2">
            {['sin', 'cos', 'tan', 'log', 'ln', '√', 'x²', 'π', 'e'].map((func) => (
              <Button
                key={func}
                variant="outline"
                className="h-12 text-sm font-mono bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800"
                onClick={() => handleScientific(func)}
              >
                {func}
              </Button>
            ))}
          </div>

          {/* Main buttons */}
          <div className="grid grid-cols-4 gap-2">
            {buttons.flat().map((btn) => {
              if (btn === 'C') {
                return (
                  <Button key={btn} variant="destructive" className="h-14 text-lg font-bold" onClick={handleClear}>
                    {btn}
                  </Button>
                )
              }
              if (btn === 'CE') {
                return (
                  <Button key={btn} variant="outline" className="h-14 text-lg" onClick={handleBackspace}>
                    <Delete className="w-5 h-5 mx-auto" />
                  </Button>
                )
              }
              if (['÷', '×', '-', '+'].includes(btn)) {
                return (
                  <Button
                    key={btn}
                    className="h-14 text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white"
                    onClick={() => handleOperator(btn)}
                  >
                    {btn}
                  </Button>
                )
              }
              if (btn === '%') {
                return (
                  <Button key={btn} variant="outline" className="h-14 text-lg" onClick={handlePercent}>
                    {btn}
                  </Button>
                )
              }
              if (btn === '±') {
                return (
                  <Button key={btn} variant="outline" className="h-14 text-lg" onClick={handleToggleSign}>
                    ±
                  </Button>
                )
              }
              return (
                <Button
                  key={btn}
                  variant="outline"
                  className="h-14 text-xl font-medium"
                  onClick={() => handleNumber(btn)}
                >
                  {btn}
                </Button>
              )
            })}
          </div>

          {/* Equals */}
          <Button
            className="w-full h-14 text-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
            onClick={handleEquals}
          >
            =
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
