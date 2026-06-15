/**
 * TradingAgents API 类型定义
 * 用于与 Python 后端 TradingAgents 服务通信
 */

export interface StockAnalysisRequest {
  symbol: string           // 股票代码，如 'AAPL', '600519.SS'
  market?: string          // 市场：'US', 'HK', 'CN', 'JP', 'UK'
  date?: string            // 分析日期，格式 YYYY-MM-DD
  provider?: string        // LLM 提供商：'openai', 'anthropic', 'google', 'deepseek'
  model?: string           // 模型名称
  research_depth?: 'quick' | 'standard' | 'deep'  // 研究深度
}

export interface StockAnalysisResponse {
  success: boolean
  symbol: string
  company_name: string
  current_price: number
  price_change: number
  price_change_percent: number
  analysis_date: string
  
  // 分析报告
  fundamentals: {
    valuation: string
    profitability: string
    growth: string
    financial_health: string
    overall: string
  }
  
  technical: {
    trend: 'bullish' | 'bearish' | 'neutral'
    indicators: {
      name: string
      value: string
      signal: string
    }[]
    summary: string
  }
  
  sentiment: {
    score: number           // -1 to 1
    news_sentiment: string
    social_sentiment: string
    overall: string
  }
  
  news: {
    headline: string
    sentiment: string
    impact: 'high' | 'medium' | 'low'
  }[]
  
  risk_assessment: {
    level: 'low' | 'medium' | 'high' | 'very_high'
    factors: string[]
    recommendation: string
  }
  
  trading_signal: {
    action: 'buy' | 'sell' | 'hold'
    confidence: number      // 0-100
    target_price?: number
    stop_loss?: number
    rationale: string
  }
  
  metadata: {
    provider: string
    model: string
    processing_time: number // 秒
    timestamp: string
  }
}

export interface PortfolioAnalysisRequest {
  holdings: {
    symbol: string
    shares: number
    avg_cost: number
  }[]
  benchmark?: string       // 基准指数，如 'SPY'
}

export interface PortfolioAnalysisResponse {
  success: boolean
  total_value: number
  total_cost: number
  total_return: number
  total_return_percent: number
  
  allocation: {
    symbol: string
    value: number
    weight: number
    return_percent: number
  }[]
  
  risk_metrics: {
    portfolio_beta: number
    volatility: number
    sharpe_ratio: number
    max_drawdown: number
    var_95: number          // 95% VaR
  }
  
  sector_allocation: {
    sector: string
    weight: number
    risk_level: string
  }[]
  
  recommendations: {
    type: 'buy' | 'sell' | 'hold' | 'rebalance'
    symbol?: string
    rationale: string
    priority: 'high' | 'medium' | 'low'
  }[]
  
  overall_assessment: {
    score: number          // 0-100
    summary: string
    strengths: string[]
    weaknesses: string[]
    suggestions: string[]
  }
}

export interface MarketOverviewResponse {
  success: boolean
  timestamp: string
  major_indices: {
    name: string
    symbol: string
    value: number
    change: number
    change_percent: number
  }[]
  market_sentiment: {
    fear_greed_index: number
    vix: number
    sentiment: 'very_bearish' | 'bearish' | 'neutral' | 'bullish' | 'very_bullish'
  }
  top_movers: {
    gainers: { symbol: string; change_percent: number }[]
    losers: { symbol: string; change_percent: number }[]
  }
  economic_indicators: {
    name: string
    value: string
    trend: 'up' | 'down' | 'stable'
  }[]
}

export interface BacktestRequest {
  symbol: string
  strategy: 'buy_and_hold' | 'moving_average' | 'rsi' | 'macd'
  start_date: string
  end_date: string
  initial_capital?: number
}

export interface BacktestResponse {
  success: boolean
  symbol: string
  strategy: string
  period: {
    start: string
    end: string
    days: number
  }
  
  performance: {
    total_return: number
    annualized_return: number
    benchmark_return: number
    alpha: number
  }
  
  risk_metrics: {
    volatility: number
    max_drawdown: number
    sharpe_ratio: number
    sortino_ratio: number
    win_rate: number
  }
  
  trades: {
    date: string
    action: 'buy' | 'sell'
    price: number
    shares: number
    portfolio_value: number
  }[]
  
  equity_curve: {
    date: string
    value: number
    benchmark: number
  }[]
}

export interface TradingAgentsConfig {
  apiBaseUrl: string      // TradingAgents 服务地址
  timeout: number         // 请求超时时间（毫秒）
  retryAttempts: number    // 重试次数
  defaultProvider: string   // 默认 LLM 提供商
  defaultModel: string     // 默认模型
}

// 股票代码转换映射
export const STOCK_CODE_MAPPINGS = {
  // A股市场
  'shanghai': '.SS',
  'sh': '.SS',
  'szse': '.SZ',
  'sz': '.SZ',
  
  // 港股市场
  'hkex': '.HK',
  'hk': '.HK',
  
  // 台股市场
  'tpex': '.TWO',
  'tw': '.TWO',
  
  // 日本市场
  'jpx': '.T',
  'jp': '.T',
  
  // 英国市场
  'lse': '.L',
  'uk': '.L',
}

// 常用股票代码别名（中文）
export const POPULAR_STOCKS: Record<string, { name: string; symbol: string }> = {
  // 美国科技股
  '苹果': { name: 'Apple Inc.', symbol: 'AAPL' },
  '特斯拉': { name: 'Tesla, Inc.', symbol: 'TSLA' },
  '英伟达': { name: 'NVIDIA Corporation', symbol: 'NVDA' },
  '谷歌': { name: 'Alphabet Inc.', symbol: 'GOOGL' },
  '微软': { name: 'Microsoft Corporation', symbol: 'MSFT' },
  '亚马逊': { name: 'Amazon.com, Inc.', symbol: 'AMZN' },
  'Meta': { name: 'Meta Platforms, Inc.', symbol: 'META' },
  '脸书': { name: 'Meta Platforms, Inc.', symbol: 'META' },
  
  // 中国A股
  '茅台': { name: '贵州茅台', symbol: '600519.SS' },
  '腾讯': { name: '腾讯控股', symbol: '0700.HK' },
  '阿里巴巴': { name: 'Alibaba Group', symbol: 'BABA' },
  '京东': { name: 'JD.com', symbol: 'JD' },
  '百度': { name: 'Baidu, Inc.', symbol: 'BIDU' },
  '美团': { name: '美团', symbol: '3690.HK' },
  '比亚迪': { name: '比亚迪', symbol: '002594.SZ' },
  '宁德时代': { name: '宁德时代', symbol: '300750.SZ' },
  '中国平安': { name: '中国平安', symbol: '601318.SS' },
  '工商银行': { name: '中国工商银行', symbol: '601398.SS' },
  
  // 指数基金
  '沪深300': { name: '沪深300指数', symbol: '000300.SS' },
  '上证指数': { name: '上证指数', symbol: '000001.SS' },
  '深证成指': { name: '深证成指', symbol: '399001.SZ' },
  '创业板': { name: '创业板指', symbol: '399006.SZ' },
  
  // ETF
  '纳指ETF': { name: '纳指ETF (QQQ)', symbol: 'QQQ' },
  '标普ETF': { name: '标普500ETF (SPY)', symbol: 'SPY' },
  '沪深300ETF': { name: '沪深300ETF', symbol: '510300.SS' },
}
