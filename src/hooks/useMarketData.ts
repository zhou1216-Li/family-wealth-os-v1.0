'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { StockPrice, FundPrice, GoldPrice } from '@/services/marketDataService'
import type { AssetWithValue } from '@/services/marketDataService'

export type { AssetWithValue } from '@/services/marketDataService'

// ─── 类型定义 ────────────────────────────────────────────────────────────────

interface UseMarketDataOptions {
  autoRefresh?: boolean
  refreshInterval?: number // 毫秒
}

interface MarketDataState<T> {
  data: T | null
  loading: boolean
  error: string | null
  lastUpdated: number | null
}

// ─── 股票数据 Hook ────────────────────────────────────────────────────────────────

export function useStockPrice(
  code: string | null,
  options: UseMarketDataOptions = {}
) {
  const { autoRefresh = false, refreshInterval = 30000 } = options

  const [state, setState] = useState<MarketDataState<StockPrice>>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null,
  })

  const fetchData = useCallback(async () => {
    if (!code) return

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch(`/api/market/stock?code=${encodeURIComponent(code)}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '获取股票数据失败')
      }

      setState({
        data: result,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '获取股票数据失败',
      }))
    }
  }, [code])

  useEffect(() => {
    if (code) {
      fetchData()
    }
  }, [code, fetchData])

  useEffect(() => {
    if (!autoRefresh || !code) return

    const interval = setInterval(fetchData, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchData, code])

  return {
    ...state,
    refresh: fetchData,
  }
}

// ─── 基金数据 Hook ────────────────────────────────────────────────────────────────

export function useFundPrice(
  code: string | null,
  options: UseMarketDataOptions = {}
) {
  const { autoRefresh = false, refreshInterval = 60000 } = options

  const [state, setState] = useState<MarketDataState<FundPrice>>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null,
  })

  const fetchData = useCallback(async () => {
    if (!code) return

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch(`/api/market/fund?code=${encodeURIComponent(code)}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '获取基金数据失败')
      }

      setState({
        data: result,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '获取基金数据失败',
      }))
    }
  }, [code])

  useEffect(() => {
    if (code) {
      fetchData()
    }
  }, [code, fetchData])

  useEffect(() => {
    if (!autoRefresh || !code) return

    const interval = setInterval(fetchData, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchData, code])

  return {
    ...state,
    refresh: fetchData,
  }
}

// ─── 黄金价格 Hook ────────────────────────────────────────────────────────────────

export function useGoldPrice(options: UseMarketDataOptions = {}) {
  const { autoRefresh = false, refreshInterval = 60000 } = options

  const [state, setState] = useState<MarketDataState<GoldPrice>>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null,
  })

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/api/market/gold')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '获取黄金价格失败')
      }

      setState({
        data: result,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '获取黄金价格失败',
      }))
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchData, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchData])

  return {
    ...state,
    refresh: fetchData,
  }
}

// ─── 批量刷新资产价值 Hook ─────────────────────────────────────────────────────────

interface RefreshResult {
  results: AssetWithValue[]
  loading: boolean
  error: string | null
}

export function useRefreshAssetValues() {
  const [state, setState] = useState<RefreshResult>({
    results: [],
    loading: false,
    error: null,
  })

  const refresh = useCallback(async (
    assets: Array<{ id: string; type: string; name: string; value: number; code?: string }>
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const results: AssetWithValue[] = []

      for (const asset of assets) {
        const result: AssetWithValue = {
          id: asset.id,
          type: asset.type,
          name: asset.name,
          currentValue: asset.value,
          newValue: null,
          change: null,
          changePercent: null,
        }

        try {
          if (asset.type === '股票' && asset.code) {
            const response = await fetch(`/api/market/stock?code=${encodeURIComponent(asset.code)}`)
            const data = await response.json()
            if (response.ok && data.price) {
              result.newValue = data.price
              result.change = data.price - asset.value
              result.changePercent = asset.value > 0 ? (result.change / asset.value) * 100 : 0
            } else {
              result.error = '无法获取股票数据'
            }
          } else if (asset.type === '基金' && asset.code) {
            const response = await fetch(`/api/market/fund?code=${encodeURIComponent(asset.code)}`)
            const data = await response.json()
            if (response.ok && (data.expectedValue || data.netValue)) {
              const newValue = data.expectedValue || data.netValue
              result.newValue = newValue
              result.change = newValue - asset.value
              result.changePercent = asset.value > 0 ? ((newValue - asset.value) / asset.value) * 100 : 0
            } else {
              result.error = '无法获取基金数据'
            }
          } else if (asset.type === '黄金') {
            const response = await fetch('/api/market/gold')
            const data = await response.json()
            if (response.ok && data.price) {
              // 假设资产价值是克数 * 当前金价
              const grams = asset.value / 480
              result.newValue = grams * data.price
              result.change = result.newValue - asset.value
              result.changePercent = asset.value > 0 ? (result.change / asset.value) * 100 : 0
            } else {
              result.error = '无法获取黄金价格'
            }
          } else {
            result.error = '该资产类型不支持自动刷新'
          }
        } catch {
          result.error = '获取数据失败'
        }

        results.push(result)
      }

      setState({
        results,
        loading: false,
        error: null,
      })

      return results
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '刷新失败'
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }))
      return []
    }
  }, [])

  return {
    ...state,
    refresh,
  }
}

// ─── 缓存管理 Hook ────────────────────────────────────────────────────────────────

export function useMarketDataCache() {
  const clearCache = useCallback(async () => {
    // 通过调用API来清除服务端缓存
    try {
      await Promise.all([
        fetch('/api/market/stock?clear=1', { method: 'GET' }).catch(() => {}),
        fetch('/api/market/fund?clear=1', { method: 'GET' }).catch(() => {}),
        fetch('/api/market/gold', { method: 'GET' }).catch(() => {}),
      ])
    } catch {
      // 忽略错误
    }
  }, [])

  return { clearCache }
}
