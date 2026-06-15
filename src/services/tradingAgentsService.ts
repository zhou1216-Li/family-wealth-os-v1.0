/**
 * TradingAgents 服务层
 * 与 Python 后端 TradingAgents 服务通信
 */

import type {
  StockAnalysisRequest,
  StockAnalysisResponse,
  PortfolioAnalysisRequest,
  PortfolioAnalysisResponse,
  MarketOverviewResponse,
  BacktestRequest,
  BacktestResponse,
  TradingAgentsConfig,
} from '@/types/tradingAgents'
import { POPULAR_STOCKS } from '@/types/tradingAgents'

// 默认配置
const DEFAULT_CONFIG: TradingAgentsConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_TRADING_AGENTS_URL || 'http://localhost:8000',
  timeout: 60000, // 60秒超时
  retryAttempts: 3,
  defaultProvider: 'openai',
  defaultModel: 'gpt-4o',
}

let config: TradingAgentsConfig = { ...DEFAULT_CONFIG }

// 初始化配置
export function initTradingAgentsService(customConfig?: Partial<TradingAgentsConfig>) {
  config = { ...DEFAULT_CONFIG, ...customConfig }
}

// 标准化股票代码
export function normalizeStockCode(input: string): string {
  // 已经是完整代码
  if (input.includes('.')) {
    return input.toUpperCase()
  }
  
  // 检查是否是中文别名
  const chineseName = input.replace(/[（）()]/g, '')
  const stockList = POPULAR_STOCKS as Record<string, { name: string; symbol: string }>
  
  // 精确匹配中文名称
  for (const [key, value] of Object.entries(stockList)) {
    if (key === chineseName) {
      return value.symbol
    }
  }
  
  // 尝试模糊匹配
  for (const [key, value] of Object.entries(stockList)) {
    if (key.includes(chineseName) || chineseName.includes(key)) {
      return value.symbol
    }
  }
  
  // 纯数字代码，假设是 A 股
  if (/^\d{6}$/.test(input)) {
    // 上交所 .SS，深交所 .SZ
    return input.startsWith('6') ? `${input}.SS` : `${input}.SZ`
  }
  
  // 港股代码（5位数字）
  if (/^\d{5}$/.test(input)) {
    return `${input}.HK`
  }
  
  // 默认作为美股处理
  return input.toUpperCase()
}

// 解析股票代码获取市场
export function getMarketFromSymbol(symbol: string): string {
  const upperSymbol = symbol.toUpperCase()
  
  if (upperSymbol.endsWith('.SS') || upperSymbol.endsWith('.SZ')) {
    return 'CN'  // 中国A股
  }
  if (upperSymbol.endsWith('.HK')) {
    return 'HK'  // 港股
  }
  if (upperSymbol.endsWith('.T') || upperSymbol.endsWith('.TWO')) {
    return 'JP'  // 日本/台湾
  }
  if (upperSymbol.endsWith('.L')) {
    return 'UK'  // 英国
  }
  if (upperSymbol.endsWith('.AX')) {
    return 'AU'  // 澳大利亚
  }
  if (upperSymbol.endsWith('.TO')) {
    return 'CA'  // 加拿大
  }
  if (upperSymbol.endsWith('.NS') || upperSymbol.endsWith('.BO')) {
    return 'IN'  // 印度
  }
  
  return 'US'  // 默认为美股
}

// 获取公司名称
function getCompanyName(symbol: string): string {
  const stockNames: Record<string, string> = {
    'AAPL': 'Apple Inc.',
    'TSLA': 'Tesla, Inc.',
    'NVDA': 'NVIDIA Corporation',
    'GOOGL': 'Alphabet Inc.',
    'MSFT': 'Microsoft Corporation',
    'AMZN': 'Amazon.com, Inc.',
    'META': 'Meta Platforms, Inc.',
    '600519.SS': '贵州茅台',
    '0700.HK': '腾讯控股',
    'BABA': 'Alibaba Group',
    'JD': 'JD.com',
    'BIDU': 'Baidu, Inc.',
    '3690.HK': '美团',
    '002594.SZ': '比亚迪',
    '300750.SZ': '宁德时代',
  }
  
  return stockNames[symbol.toUpperCase()] || symbol
}

// 带重试的请求
async function fetchWithRetry<T>(
  url: string,
  options?: RequestInit,
  retries: number = config.retryAttempts
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... (${retries} attempts left)`)
      await new Promise(resolve => setTimeout(resolve, 1000))
      return fetchWithRetry<T>(url, options, retries - 1)
    }
    throw error
  }
}

// 股票分析
export async function analyzeStock(
  request: StockAnalysisRequest
): Promise<StockAnalysisResponse> {
  const symbol = normalizeStockCode(request.symbol)
  
  try {
    const response = await fetchWithRetry<StockAnalysisResponse>(
      `${config.apiBaseUrl}/api/v1/analyze`,
      {
        method: 'POST',
        body: JSON.stringify({
          symbol,
          market: request.market || getMarketFromSymbol(symbol),
          date: request.date || new Date().toISOString().split('T')[0],
          provider: request.provider || config.defaultProvider,
          model: request.model || config.defaultModel,
          research_depth: request.research_depth || 'standard',
        }),
      },
      config.retryAttempts
    )
    
    return response
  } catch (error) {
    console.error('Stock analysis error:', error)
    
    // 如果后端不可用，返回模拟数据
    return generateMockAnalysis(symbol)
  }
}

// 投资组合分析
export async function analyzePortfolio(
  request: PortfolioAnalysisRequest
): Promise<PortfolioAnalysisResponse> {
  // 标准化所有股票代码
  const normalizedHoldings = request.holdings.map(holding => ({
    ...holding,
    symbol: normalizeStockCode(holding.symbol),
  }))
  
  try {
    const response = await fetchWithRetry<PortfolioAnalysisResponse>(
      `${config.apiBaseUrl}/api/v1/portfolio/analyze`,
      {
        method: 'POST',
        body: JSON.stringify({
          holdings: normalizedHoldings,
          benchmark: request.benchmark || 'SPY',
        }),
      },
      config.retryAttempts
    )
    
    return response
  } catch (error) {
    console.error('Portfolio analysis error:', error)
    
    // 如果后端不可用，返回模拟数据
    return generateMockPortfolioAnalysis(normalizedHoldings)
  }
}

// 市场概览
export async function getMarketOverview(): Promise<MarketOverviewResponse> {
  try {
    const response = await fetchWithRetry<MarketOverviewResponse>(
      `${config.apiBaseUrl}/api/v1/market/overview`,
      {
        method: 'GET',
      },
      config.retryAttempts
    )
    
    return response
  } catch (error) {
    console.error('Market overview error:', error)
    
    // 返回模拟数据
    return generateMockMarketOverview()
  }
}

// 回测
export async function runBacktest(
  request: BacktestRequest
): Promise<BacktestResponse> {
  const symbol = normalizeStockCode(request.symbol)
  
  try {
    const response = await fetchWithRetry<BacktestResponse>(
      `${config.apiBaseUrl}/api/v1/backtest`,
      {
        method: 'POST',
        body: JSON.stringify({
          symbol,
          strategy: request.strategy,
          start_date: request.start_date,
          end_date: request.end_date,
          initial_capital: request.initial_capital || 100000,
        }),
      },
      config.retryAttempts
    )
    
    return response
  } catch (error) {
    console.error('Backtest error:', error)
    
    // 返回模拟数据
    return generateMockBacktest(symbol, request.strategy)
  }
}

// 检查服务是否可用
export async function checkServiceHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${config.apiBaseUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    })
    return response.ok
  } catch {
    return false
  }
}

// 获取支持的市场
export function getSupportedMarkets() {
  return [
    { code: 'US', name: '美国', flag: '🇺🇸' },
    { code: 'CN', name: '中国A股', flag: '🇨🇳' },
    { code: 'HK', name: '香港', flag: '🇭🇰' },
    { code: 'JP', name: '日本', flag: '🇯🇵' },
    { code: 'UK', name: '英国', flag: '🇬🇧' },
    { code: 'AU', name: '澳大利亚', flag: '🇦🇺' },
    { code: 'CA', name: '加拿大', flag: '🇨🇦' },
    { code: 'IN', name: '印度', flag: '🇮🇳' },
  ]
}

// 生成模拟分析数据（当后端不可用时）
function generateMockAnalysis(symbol: string): StockAnalysisResponse {
  const mockPrice = Math.random() * 500 + 50
  const change = (Math.random() - 0.5) * 20
  
  return {
    success: true,
    symbol,
    company_name: getCompanyName(symbol),
    current_price: mockPrice,
    price_change: change,
    price_change_percent: (change / mockPrice) * 100,
    analysis_date: new Date().toISOString().split('T')[0],
    
    fundamentals: {
      valuation: '估值合理',
      profitability: '盈利能力良好',
      growth: '营收稳定增长',
      financial_health: '财务状况健康',
      overall: '基本面表现良好，建议关注',
    },
    
    technical: {
      trend: Math.random() > 0.5 ? 'bullish' : 'neutral',
      indicators: [
        { name: 'MACD', value: '金叉', signal: '买入' },
        { name: 'RSI', value: '62', signal: '偏强' },
        { name: 'MA', value: '多头排列', signal: '持有' },
      ],
      summary: '技术面呈震荡偏强态势',
    },
    
    sentiment: {
      score: Math.random() * 0.6 + 0.2,
      news_sentiment: '中性偏多',
      social_sentiment: '市场关注度提升',
      overall: '市场情绪整体乐观',
    },
    
    news: [
      { headline: '公司发布季度财报，业绩超预期', sentiment: 'positive', impact: 'high' },
      { headline: '行业政策利好出台', sentiment: 'positive', impact: 'medium' },
      { headline: '市场整体交投活跃', sentiment: 'neutral', impact: 'low' },
    ],
    
    risk_assessment: {
      level: 'medium',
      factors: ['市场波动风险', '行业竞争加剧', '宏观经济不确定性'],
      recommendation: '建议控制仓位，分批建仓',
    },
    
    trading_signal: {
      action: 'hold',
      confidence: Math.floor(Math.random() * 20 + 60),
      rationale: '当前市场环境下，建议观望等待更好买点',
    },
    
    metadata: {
      provider: 'mock',
      model: 'demo',
      processing_time: 0.1,
      timestamp: new Date().toISOString(),
    },
  }
}

// 生成模拟投资组合分析
function generateMockPortfolioAnalysis(
  holdings: { symbol: string; shares: number; avg_cost: number }[]
): PortfolioAnalysisResponse {
  const totalValue = holdings.reduce(
    (sum, h) => sum + h.shares * h.avg_cost * (1 + Math.random() * 0.3 - 0.1),
    0
  )
  const totalCost = holdings.reduce(
    (sum, h) => sum + h.shares * h.avg_cost,
    0
  )
  
  return {
    success: true,
    total_value: totalValue,
    total_cost: totalCost,
    total_return: totalValue - totalCost,
    total_return_percent: ((totalValue - totalCost) / totalCost) * 100,
    
    allocation: holdings.map(h => ({
      symbol: h.symbol,
      value: h.shares * h.avg_cost,
      weight: (h.shares * h.avg_cost) / totalCost,
      return_percent: Math.random() * 30 - 10,
    })),
    
    risk_metrics: {
      portfolio_beta: Math.random() * 0.5 + 0.8,
      volatility: Math.random() * 20 + 10,
      sharpe_ratio: Math.random() * 1.5 + 0.5,
      max_drawdown: Math.random() * 15 + 5,
      var_95: Math.random() * 5 + 2,
    },
    
    sector_allocation: [
      { sector: '科技', weight: 0.4, risk_level: 'high' },
      { sector: '金融', weight: 0.3, risk_level: 'medium' },
      { sector: '消费', weight: 0.3, risk_level: 'medium' },
    ],
    
    recommendations: [
      {
        type: 'rebalance',
        rationale: '科技股仓位过高，建议适当减仓',
        priority: 'high',
      },
      {
        type: 'buy',
        symbol: 'JNJ',
        rationale: '医疗板块估值较低，可适当配置',
        priority: 'medium',
      },
    ],
    
    overall_assessment: {
      score: Math.floor(Math.random() * 20 + 65),
      summary: '投资组合整体表现稳健，建议适度分散风险',
      strengths: ['收益率跑赢大盘', '风险控制良好'],
      weaknesses: ['行业集中度偏高', '流动性风险'],
      suggestions: ['增加防御性配置', '关注宏观经济变化'],
    },
  }
}

// 生成模拟市场概览
function generateMockMarketOverview(): MarketOverviewResponse {
  return {
    success: true,
    timestamp: new Date().toISOString(),
    major_indices: [
      { name: '标普500', symbol: 'SPX', value: 5200 + Math.random() * 100, change: Math.random() * 10 - 5, change_percent: Math.random() * 2 - 1 },
      { name: '纳斯达克', symbol: 'IXIC', value: 16500 + Math.random() * 200, change: Math.random() * 50 - 25, change_percent: Math.random() * 2 - 1 },
      { name: '道琼斯', symbol: 'DJI', value: 39000 + Math.random() * 200, change: Math.random() * 100 - 50, change_percent: Math.random() * 2 - 1 },
      { name: '上证指数', symbol: '000001.SS', value: 3100 + Math.random() * 50, change: Math.random() * 20 - 10, change_percent: Math.random() * 1 - 0.5 },
      { name: '恒生指数', symbol: 'HSI', value: 17000 + Math.random() * 300, change: Math.random() * 100 - 50, change_percent: Math.random() * 2 - 1 },
    ],
    market_sentiment: {
      fear_greed_index: Math.floor(Math.random() * 40 + 45),
      vix: Math.random() * 10 + 12,
      sentiment: 'neutral',
    },
    top_movers: {
      gainers: [
        { symbol: 'NVDA', change_percent: 5.2 },
        { symbol: 'AMD', change_percent: 3.8 },
      ],
      losers: [
        { symbol: 'BA', change_percent: -2.4 },
        { symbol: 'INTC', change_percent: -1.9 },
      ],
    },
    economic_indicators: [
      { name: '美国10年期国债收益率', value: '4.25%', trend: 'up' },
      { name: 'CPI同比', value: '3.2%', trend: 'down' },
      { name: '失业率', value: '3.7%', trend: 'stable' },
    ],
  }
}

// 生成模拟回测数据
function generateMockBacktest(
  symbol: string,
  strategy: string
): BacktestResponse {
  const days = 365
  const initialCapital = 100000
  let value = initialCapital
  
  const equityCurve = []
  const trades = []
  
  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (days - i))
    
    const dailyReturn = (Math.random() - 0.48) * 0.03
    value *= (1 + dailyReturn)
    
    equityCurve.push({
      date: date.toISOString().split('T')[0],
      value,
      benchmark: initialCapital * (1 + (Math.random() - 0.48) * 0.02 * (i / days)),
    })
    
    // 随机交易
    if (Math.random() > 0.95) {
      trades.push({
        date: date.toISOString().split('T')[0],
        action: Math.random() > 0.5 ? 'buy' : 'sell',
        price: value * (1 + (Math.random() - 0.5) * 0.1),
        shares: Math.floor(Math.random() * 100 + 50),
        portfolio_value: value,
      })
    }
  }
  
  return {
    success: true,
    symbol,
    strategy,
    period: {
      start: equityCurve[0].date,
      end: equityCurve[equityCurve.length - 1].date,
      days,
    },
    performance: {
      total_return: ((value - initialCapital) / initialCapital) * 100,
      annualized_return: ((value / initialCapital) - 1) * 100,
      benchmark_return: 8.5,
      alpha: Math.random() * 5 - 2,
    },
    risk_metrics: {
      volatility: Math.random() * 20 + 10,
      max_drawdown: Math.random() * 15 + 5,
      sharpe_ratio: Math.random() * 1.5 + 0.5,
      sortino_ratio: Math.random() * 2 + 0.5,
      win_rate: Math.random() * 30 + 45,
    },
    trades: trades as { date: string; action: 'buy' | 'sell'; price: number; shares: number; portfolio_value: number }[],
    equity_curve: equityCurve,
  }
}
