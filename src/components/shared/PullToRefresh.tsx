'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { RefreshCw, Loader2 } from 'lucide-react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  threshold?: number
  refreshing?: boolean
}

type State = 'idle' | 'pulling' | 'refreshing' | 'complete'

export function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
  refreshing: externalRefreshing,
}: PullToRefreshProps) {
  const [state, setState] = useState<State>('idle')
  const [distance, setDistance] = useState(0)
  const startY = useRef(0)
  const isTouching = useRef(false)

  const refreshing = externalRefreshing ?? state === 'refreshing'

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (refreshing || state === 'complete') return
    startY.current = e.touches[0].clientY
    isTouching.current = true
  }, [refreshing, state])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isTouching.current || refreshing) return

      const currentY = e.touches[0].clientY
      const diff = currentY - startY.current

      if (diff > 0) {
        setState('pulling')
        setDistance(Math.min(diff * 0.5, threshold * 1.5))
      }
    },
    [refreshing, threshold]
  )

  const handleTouchEnd = useCallback(async () => {
    if (!isTouching.current) return
    isTouching.current = false

    if (distance >= threshold && state === 'pulling') {
      setState('refreshing')
      setDistance(threshold)
      try {
        await onRefresh()
      } finally {
        setState('complete')
        setTimeout(() => {
          setState('idle')
          setDistance(0)
        }, 600)
      }
    } else {
      setState('idle')
      setDistance(0)
    }
  }, [distance, threshold, state, onRefresh])

  useEffect(() => {
    if (externalRefreshing) {
      setState('refreshing')
      setDistance(threshold)
    }
  }, [externalRefreshing, threshold])

  const progress = Math.min(distance / threshold, 1)
  const showIndicator = state !== 'idle' || externalRefreshing

  return (
    <div
      className="relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Refresh indicator */}
      {showIndicator && (
        <div
          className="flex flex-col items-center justify-center transition-all duration-200"
          style={{ height: `${distance}px` }}
        >
          <div className="relative">
            {state === 'refreshing' || externalRefreshing ? (
              <Loader2
                size={24}
                className="text-primary animate-spin"
              />
            ) : state === 'complete' ? (
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            ) : (
              <RefreshCw
                size={24}
                className="text-primary transition-transform duration-200"
                style={{ transform: `rotate(${progress * 180}deg)` }}
              />
            )}
          </div>
          <span className="text-xs text-muted-foreground mt-2">
            {state === 'refreshing' || externalRefreshing
              ? '刷新中...'
              : state === 'complete'
              ? '刷新完成'
              : distance >= threshold
              ? '松开刷新'
              : '下拉刷新'}
          </span>
        </div>
      )}

      {/* Content */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: state === 'idle' ? 'translateY(0)' : `translateY(${distance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  )
}

// 自动刷新 hook
export function useAutoRefresh(
  callback: () => Promise<void>,
  intervalMinutes: number = 5
) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refresh = useCallback(async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    try {
      await callback()
    } finally {
      setIsRefreshing(false)
    }
  }, [callback, isRefreshing])

  useEffect(() => {
    // 页面加载时刷新一次
    refresh()

    // 设置定时刷新
    const interval = setInterval(refresh, intervalMinutes * 60 * 1000)

    return () => clearInterval(interval)
  }, [refresh, intervalMinutes])

  return { refresh, isRefreshing }
}
