/**
 * TradingAgents React Hook
 * 用于在组件中使用 TradingAgents 分析功能
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  analyzeStock,
  analyzePortfolio,
  getMarketOverview,
  runBacktest,
  checkServiceHealth,
  normalizeStockCode,
  initTradingAgentsService,
} from '@/services/tradingAgentsService'
import type {
  StockAnalysisRequest,
  StockAnalysisResponse,
  PortfolioAnalysisRequest,
  PortfolioAnalysisResponse,
  MarketOverviewResponse,
  BacktestRequest,
  BacktestResponse,
} from '@/types/tradingAgents'

// 股票分析 Hook
export function useStockAnalysis() {
  const [analysis, setAnalysis] = useState<StockAnalysisResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isServiceAvailable, setIsServiceAvailable] = useState(false)

  // 检查服务状态
  useEffect(() => {
    checkServiceHealth().then(setIsServiceAvailable)
  }, [])

  const analyze = useCallback(async (request: StockAnalysisRequest) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await analyzeStock(request)
      setAnalysis(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '分析失败'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const clearAnalysis = useCallback(() => {
    setAnalysis(null)
    setError(null)
  }, [])

  return {
    analysis,
    loading,
    error,
    isServiceAvailable,
    analyze,
    clearAnalysis,
  }
}

// 投资组合分析 Hook
export function usePortfolioAnalysis() {
  const [analysis, setAnalysis] = useState<PortfolioAnalysisResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyze = useCallback(async (request: PortfolioAnalysisRequest) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await analyzePortfolio(request)
      setAnalysis(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '分析失败'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const clearAnalysis = useCallback(() => {
    setAnalysis(null)
    setError(null)
  }, [])

  return {
    analysis,
    loading,
    error,
    analyze,
    clearAnalysis,
  }
}

// 市场概览 Hook
export function useMarketOverview() {
  const [overview, setOverview] = useState<MarketOverviewResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await getMarketOverview()
      setOverview(result)
      setLastUpdated(new Date())
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取失败'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  // 自动刷新（每5分钟）
  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [refresh])

  return {
    overview,
    loading,
    error,
    lastUpdated,
    refresh,
  }
}

// 回测 Hook
export function useBacktest() {
  const [result, setResult] = useState<BacktestResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async (request: BacktestRequest) => {
    setLoading(true)
    setError(null)
    
    try {
      const backtestResult = await runBacktest(request)
      setResult(backtestResult)
      return backtestResult
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '回测失败'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const clearResult = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return {
    result,
    loading,
    error,
    run,
    clearResult,
  }
}

// 快速搜索股票代码 Hook
export function useStockSearch() {
  const [results, setResults] = useState<{ symbol: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)

  const search = useCallback((query: string) => {
    if (!query || query.length < 1) {
      setResults([])
      return
    }

    setLoading(true)
    
    // 导入中文股票映射
    import('@/types/tradingAgents').then(({ POPULAR_STOCKS }) => {
      const lowerQuery = query.toLowerCase()
      const matches: { symbol: string; name: string }[] = []
      
      // 搜索中文名称
      for (const [key, value] of Object.entries(POPULAR_STOCKS)) {
        if (key.includes(query) || value.name.includes(query)) {
          matches.push(value)
        }
      }
      
      // 如果输入是数字，尝试匹配代码
      if (/^\d+$/.test(query)) {
        for (const [key, value] of Object.entries(POPULAR_STOCKS)) {
          if (key.includes(query)) {
            matches.push(value)
          }
        }
      }
      
      // 添加标准化后的代码作为选项
      const normalized = normalizeStockCode(query)
      if (normalized !== query) {
        matches.push({ symbol: normalized, name: `${normalized} (自动识别)` })
      }
      
      setResults(matches.slice(0, 10))
      setLoading(false)
    })
  }, [])

  const clearResults = useCallback(() => {
    setResults([])
  }, [])

  return {
    results,
    loading,
    search,
    clearResults,
  }
}
