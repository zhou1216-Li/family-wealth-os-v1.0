import { describe, it, expect } from 'vitest'
import { normalizeStockCode, getMarketFromSymbol } from '@/services/tradingAgentsService'
import { calculatePortfolioRisk } from '@/services/quantitativeAnalysis'
import { fmtCurrency } from '@/lib/formatters'

// 股票代码标准化测试
describe('Stock Code Normalization', () => {
  it('should normalize A-share codes', () => {
    expect(normalizeStockCode('600519')).toBe('600519.SS')
    expect(normalizeStockCode('002594')).toBe('002594.SZ')
    expect(normalizeStockCode('300750')).toBe('300750.SZ')
  })

  it('should normalize existing full codes', () => {
    expect(normalizeStockCode('AAPL')).toBe('AAPL')
    expect(normalizeStockCode('600519.SS')).toBe('600519.SS')
    expect(normalizeStockCode('0700.HK')).toBe('0700.HK')
  })

  it('should recognize Chinese stock names', () => {
    expect(normalizeStockCode('茅台')).toBe('600519.SS')
    expect(normalizeStockCode('腾讯')).toBe('0700.HK')
    expect(normalizeStockCode('苹果')).toBe('AAPL')
  })

  it('should get market from symbol', () => {
    expect(getMarketFromSymbol('AAPL')).toBe('US')
    expect(getMarketFromSymbol('600519.SS')).toBe('CN')
    expect(getMarketFromSymbol('0700.HK')).toBe('HK')
    expect(getMarketFromSymbol('NVDA')).toBe('US')
  })
})

// 投资组合风险计算测试
describe('Portfolio Risk Calculation', () => {
  const mockAssets = [
    { id: '1', name: 'Stock', type: '股票', weight: 0.5, expectedReturn: 0.12, volatility: 0.25, color: '#ef4444' },
    { id: '2', name: 'Bond', type: '债券', weight: 0.3, expectedReturn: 0.04, volatility: 0.06, color: '#3b82f6' },
    { id: '3', name: 'Cash', type: '现金', weight: 0.2, expectedReturn: 0.02, volatility: 0.01, color: '#22c55e' },
  ]

  it('should calculate portfolio risk correctly', () => {
    const result = calculatePortfolioRisk(mockAssets)
    
    expect(result).toHaveProperty('standardDeviation')
    expect(result).toHaveProperty('sharpeRatio')
    expect(result).toHaveProperty('var')
    expect(result).toHaveProperty('cvar')
    expect(result).toHaveProperty('maxDrawdown')
    expect(result).toHaveProperty('beta')
    
    expect(result.standardDeviation).toBeGreaterThan(0)
    expect(result.standardDeviation).toBeLessThan(0.5)
    expect(result.sharpeRatio).toBeGreaterThan(0)
    expect(result.beta).toBeGreaterThan(0)
  })

  it('should handle single asset', () => {
    const singleAsset = [{ id: '1', name: 'Stock', type: '股票', weight: 1, expectedReturn: 0.1, volatility: 0.2, color: '#ef4444' }]
    const result = calculatePortfolioRisk(singleAsset)
    
    expect(result.standardDeviation).toBeCloseTo(0.2, 2)
  })

  it('should handle empty portfolio', () => {
    const result = calculatePortfolioRisk([])
    
    expect(result.standardDeviation).toBe(0)
    expect(result.sharpeRatio).toBeLessThanOrEqual(0)
  })
})

// 货币格式化测试
describe('Currency Formatting', () => {
  it('should format currency correctly', () => {
    expect(fmtCurrency(1234)).toBe('¥1,234')
    expect(fmtCurrency(1000000)).toBe('¥1,000,000')
    expect(fmtCurrency(0)).toBe('¥0')
    expect(fmtCurrency(-123)).toBe('-¥123')
  })

  it('should round to integer', () => {
    expect(fmtCurrency(1234.5678)).toBe('¥1,235')
    expect(fmtCurrency(1234.4)).toBe('¥1,234')
    expect(fmtCurrency(100.99)).toBe('¥101')
  })
})
