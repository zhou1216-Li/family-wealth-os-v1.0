'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface UseSessionTimeoutOptions {
  timeoutMinutes?: number
  warningMinutes?: number
  onTimeout: () => void
  onWarning?: (remainingSeconds: number) => void
  enabled?: boolean
}

export function useSessionTimeout({
  timeoutMinutes = 30,
  warningMinutes = 5,
  onTimeout,
  onWarning,
  enabled = true,
}: UseSessionTimeoutOptions) {
  const [remainingSeconds, setRemainingSeconds] = useState(timeoutMinutes * 60)
  const [showWarning, setShowWarning] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const resetTimer = useCallback(() => {
    setRemainingSeconds(timeoutMinutes * 60)
    setShowWarning(false)
  }, [timeoutMinutes])

  useEffect(() => {
    if (!enabled) {
      setRemainingSeconds(timeoutMinutes * 60)
      setShowWarning(false)
      return
    }

    const warningThreshold = warningMinutes * 60

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          onTimeout()
          return 0
        }

        const newRemaining = prev - 1

        if (newRemaining === warningThreshold) {
          setShowWarning(true)
          onWarning?.(newRemaining)
        }

        return newRemaining
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [enabled, timeoutMinutes, warningMinutes, onTimeout, onWarning])

  useEffect(() => {
    const handleActivity = () => {
      if (enabled) {
        resetTimer()
      }
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']
    
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
    }
  }, [enabled, resetTimer])

  const dismissWarning = useCallback(() => {
    setShowWarning(false)
    resetTimer()
  }, [resetTimer])

  return {
    remainingSeconds,
    showWarning,
    resetTimer,
    dismissWarning,
    minutesRemaining: Math.ceil(remainingSeconds / 60),
  }
}
