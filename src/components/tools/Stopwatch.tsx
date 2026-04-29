'use client'

import { useState, useRef, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Play, Pause, RotateCcw, Flag, Clock } from 'lucide-react'

function formatTime(ms: number): string {
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  const centiseconds = Math.floor((ms % 1000) / 10)
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`
}

export default function Stopwatch() {
  // Stopwatch state
  const [swRunning, setSwRunning] = useState(false)
  const [swTime, setSwTime] = useState(0)
  const [laps, setLaps] = useState<number[]>([])
  const swInterval = useRef<NodeJS.Timeout | null>(null)
  const swStartRef = useRef(0)

  const startStopwatch = useCallback(() => {
    swStartRef.current = Date.now() - swTime
    swInterval.current = setInterval(() => {
      setSwTime(Date.now() - swStartRef.current)
    }, 10)
    setSwRunning(true)
  }, [swTime])

  const stopStopwatch = useCallback(() => {
    if (swInterval.current) clearInterval(swInterval.current)
    setSwRunning(false)
  }, [])

  const resetStopwatch = () => {
    if (swInterval.current) clearInterval(swInterval.current)
    setSwRunning(false)
    setSwTime(0)
    setLaps([])
  }

  const addLap = () => {
    setLaps(prev => [swTime, ...prev])
  }

  // Timer state
  const [timerMinutes, setTimerMinutes] = useState(5)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerFinished, setTimerFinished] = useState(false)
  const [timerTime, setTimerTime] = useState(0)
  const timerInterval = useRef<NodeJS.Timeout | null>(null)
  const timerEndRef = useRef(0)

  const getInitialTimerTime = () => (timerMinutes * 60 + timerSeconds) * 1000

  const startTimer = () => {
    if (timerTime <= 0) {
      const totalMs = (timerMinutes * 60 + timerSeconds) * 1000
      if (totalMs <= 0) return
      setTimerTime(totalMs)
      timerEndRef.current = Date.now() + totalMs
    } else {
      timerEndRef.current = Date.now() + timerTime
    }
    timerInterval.current = setInterval(() => {
      const remaining = timerEndRef.current - Date.now()
      if (remaining <= 0) {
        setTimerTime(0)
        setTimerRunning(false)
        setTimerFinished(true)
        if (timerInterval.current) clearInterval(timerInterval.current)
      } else {
        setTimerTime(remaining)
      }
    }, 10)
    setTimerRunning(true)
    setTimerFinished(false)
  }

  const pauseTimer = () => {
    if (timerInterval.current) clearInterval(timerInterval.current)
    setTimerRunning(false)
  }

  const resetTimer = () => {
    if (timerInterval.current) clearInterval(timerInterval.current)
    setTimerRunning(false)
    setTimerTime(0)
    setTimerFinished(false)
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-cyan-500 to-sky-600 p-6 text-white">
          <h2 className="text-xl font-bold mb-1">مؤقت وموقف</h2>
          <p className="text-white/80 text-sm">ساعة إيقاف ومؤقت عد تنازلي</p>
        </div>
        <CardContent className="p-6">
          <Tabs defaultValue="stopwatch">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="stopwatch">
                <Clock className="w-4 h-4 ml-1" />
                ساعة إيقاف
              </TabsTrigger>
              <TabsTrigger value="timer">
                <Clock className="w-4 h-4 ml-1" />
                مؤقت
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stopwatch" className="mt-6 space-y-6">
              {/* Display */}
              <div className="text-center">
                <p className="text-5xl font-mono font-bold tracking-wider" dir="ltr">
                  {formatTime(swTime)}
                </p>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-3">
                {!swRunning ? (
                  <Button onClick={startStopwatch} className="w-24 h-24 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                    <Play className="w-8 h-8" />
                  </Button>
                ) : (
                  <Button onClick={stopStopwatch} className="w-24 h-24 rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white">
                    <Pause className="w-8 h-8" />
                  </Button>
                )}
                {swRunning && (
                  <Button onClick={addLap} variant="outline" className="w-24 h-24 rounded-full">
                    <Flag className="w-8 h-8" />
                  </Button>
                )}
                {!swRunning && swTime > 0 && (
                  <Button onClick={resetStopwatch} variant="outline" className="w-24 h-24 rounded-full">
                    <RotateCcw className="w-8 h-8" />
                  </Button>
                )}
              </div>

              {/* Laps */}
              {laps.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                  {laps.map((lap, i) => (
                    <div key={i} className="flex justify-between bg-muted rounded-lg p-3">
                      <span className="text-sm text-muted-foreground">لفة {laps.length - i}</span>
                      <span className="font-mono text-sm" dir="ltr">{formatTime(lap)}</span>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="timer" className="mt-6 space-y-6">
              {/* Display */}
              <div className="text-center">
                <p className={`text-5xl font-mono font-bold tracking-wider ${timerFinished ? 'text-red-500 animate-pulse-slow' : ''}`} dir="ltr">
                  {formatTime(timerTime || getInitialTimerTime())}
                </p>
                {timerFinished && (
                  <p className="text-red-500 mt-2 font-medium">انتهى الوقت!</p>
                )}
              </div>

              {/* Time Input */}
              {!timerRunning && !timerFinished && timerTime === 0 && (
                <div className="flex items-center justify-center gap-2">
                  <div className="text-center">
                    <Label className="text-xs text-muted-foreground">دقائق</Label>
                    <Input
                      type="number"
                      value={timerMinutes}
                      onChange={(e) => setTimerMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-20 text-center text-2xl font-mono"
                      min={0}
                      max={99}
                    />
                  </div>
                  <span className="text-3xl font-bold mt-5">:</span>
                  <div className="text-center">
                    <Label className="text-xs text-muted-foreground">ثواني</Label>
                    <Input
                      type="number"
                      value={timerSeconds}
                      onChange={(e) => setTimerSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                      className="w-20 text-center text-2xl font-mono"
                      min={0}
                      max={59}
                    />
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="flex justify-center gap-3">
                {!timerRunning && !timerFinished ? (
                  <Button onClick={startTimer} className="w-24 h-24 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                    <Play className="w-8 h-8" />
                  </Button>
                ) : timerRunning ? (
                  <Button onClick={pauseTimer} className="w-24 h-24 rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white">
                    <Pause className="w-8 h-8" />
                  </Button>
                ) : null}
                {(timerTime > 0 || timerFinished) && (
                  <Button onClick={resetTimer} variant="outline" className="w-24 h-24 rounded-full">
                    <RotateCcw className="w-8 h-8" />
                  </Button>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <label className={`block text-sm font-medium ${className || ''}`}>{children}</label>
}
