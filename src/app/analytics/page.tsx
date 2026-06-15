'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/shared/MainLayout'
import { StatCard } from '@/components/shared/StatCard'
import { PortfolioChart } from '@/components/analytics/PortfolioChart'
import { RiskMeter } from '@/components/analytics/RiskMeter'
import { PerformanceChart } from '@/components/analytics/PerformanceChart'
import { RecommendationPanel } from '@/components/analytics/RecommendationPanel'
import {
  calculatePortfolioRisk,
  backtestStrategy,
  generateReport,
  generateMockPriceData,
} from '@/services/quantitativeAnalysis'
import {
  useStockAnalysis,
  useMarketOverview,
  useStockSearch,
} from '@/hooks/useTradingAgents'
import { normalizeStockCode } from '@/services/tradingAgentsService'
import { POPULAR_STOCKS } from '@/types/tradingAgents'
import type { Portfolio, PortfolioAsset } from '@/types'
import { 
  Search, TrendingUp, TrendingDown, Brain, 
  Activity, PieChart, LineChart, Shield,
  ChevronRight, ChevronDown, ChevronUp, ExternalLink, RefreshCw,
  Zap, AlertTriangle, CheckCircle, XCircle, Loader2
} from 'lucide-react'

const mockPortfolioAssets: PortfolioAsset[] = [
  { id: '1', name: '股票', type: '股票', weight: 0.35, expectedReturn: 0.12, volatility: 0.25, color: '#ef4444' },
  { id: '2', name: '基金', type: '基金', weight: 0.25, expectedReturn: 0.08, volatility: 0.18, color: '#3b82f6' },
  { id: '3', name: '债券', type: '其他', weight: 0.20, expectedReturn: 0.04, volatility: 0.06, color: '#22c55e' },
  { id: '4', name: '黄金', type: '黄金', weight: 0.10, expectedReturn: 0.05, volatility: 0.12, color: '#f59e0b' },
  { id: '5', name: '现金', type: '现金', weight: 0.10, expectedReturn: 0.02, volatility: 0.01, color: '#8b5cf6' },
]

const mockPortfolio: Portfolio = {
  id: 'p1',
  name: '稳健型投资组合',
  assets: mockPortfolioAssets,
  totalValue: 500000,
  createdAt: '2024-01-01',
  updatedAt: '2024-12-20',
}

export default function AnalyticsPage() {
  const [riskMetrics, setRiskMetrics] = useState(calculatePortfolioRisk(mockPortfolioAssets))
  const [backtestResult, setBacktestResult] = useState<ReturnType<typeof backtestStrategy> | null>(null)
  const [report, setReport] = useState<ReturnType<typeof generateReport> | null>(null)
  
  // TradingAgents 集成
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSymbol, setSelectedSymbol] = useState('')
  const [showSymbolSearch, setShowSymbolSearch] = useState(false)
  
  const { analysis, loading: analysisLoading, error: analysisError, analyze, isServiceAvailable } = useStockAnalysis()
  const { overview: marketOverview, loading: marketLoading, refresh: refreshMarket } = useMarketOverview()
  const { results: searchResults, loading: searchLoading, search: searchStocks } = useStockSearch()

  useEffect(() => {
    const priceData = generateMockPriceData('2023-01-01', 365)
    const result = backtestStrategy(priceData, 'buy_and_hold')
    setBacktestResult(result)
    
    const analyticsReport = generateReport(mockPortfolio, result)
    setReport(analyticsReport)
  }, [])

  // 搜索股票
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.length >= 1) {
      searchStocks(query)
      setShowSymbolSearch(true)
    } else {
      setShowSymbolSearch(false)
    }
  }

  // 分析股票
  const handleAnalyze = async (symbol: string) => {
    setSelectedSymbol(symbol)
    setShowSymbolSearch(false)
    setSearchQuery(symbol)
    
    try {
      await analyze({ symbol })
    } catch (error) {
      console.error('Analysis failed:', error)
    }
  }

  // 快捷搜索
  const quickSearches = ['茅台', '苹果', '腾讯', '特斯拉', '英伟达', '谷歌']

  return (
    <MainLayout title="量化分析" subtitle="AI驱动的投资组合分析与风险管理">
      <div className="space-y-6">
        {/* 头部工具栏 */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">量化分析</h1>
            <p className="text-muted-foreground">AI驱动的投资组合分析与风险管理</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* AI 服务状态 */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              isServiceAvailable 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-amber-100 text-amber-700'
            }`}>
              {isServiceAvailable ? (
                <>
                  <CheckCircle size={14} />
                  AI服务在线
                </>
              ) : (
                <>
                  <AlertTriangle size={14} />
                  使用模拟数据
                </>
              )}
            </div>
            
            {/* 市场刷新按钮 */}
            <button
              onClick={refreshMarket}
              disabled={marketLoading}
              className="flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-sm transition-colors"
            >
              <RefreshCw size={14} className={marketLoading ? 'animate-spin' : ''} />
              刷新市场
            </button>
          </div>
        </div>

        {/* AI 股票分析搜索 */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="text-purple-500" size={20} />
            <h2 className="text-lg font-semibold">AI 智能股票分析</h2>
          </div>
          
          <div className="relative">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="输入股票代码或名称（支持中文：如'茅台'、'苹果'）"
                  className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                
                {/* 搜索结果下拉 */}
                {showSymbolSearch && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
                    {searchResults.map((result) => (
                      <button
                        key={result.symbol}
                        onClick={() => handleAnalyze(result.symbol)}
                        className="w-full px-4 py-3 text-left hover:bg-muted flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="font-medium text-sm">{result.symbol}</div>
                          <div className="text-xs text-muted-foreground">{result.name}</div>
                        </div>
                        <ChevronRight size={16} className="text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => handleAnalyze(searchQuery)}
                disabled={!searchQuery || analysisLoading}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {analysisLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    AI分析
                  </>
                )}
              </button>
            </div>
            
            {/* 快捷搜索 */}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs text-muted-foreground">快捷搜索：</span>
              {quickSearches.map((name) => (
                <button
                  key={name}
                  onClick={() => handleSearch(name)}
                  className="px-3 py-1 bg-muted hover:bg-muted/80 rounded-lg text-xs transition-colors"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI 分析结果 */}
        {analysis && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Brain className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{analysis.company_name}</h2>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-0.5 bg-muted rounded">{analysis.symbol}</span>
                    <span className={`font-semibold ${analysis.price_change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      ${analysis.current_price.toFixed(2)}
                    </span>
                    <span className={`flex items-center gap-1 ${analysis.price_change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {analysis.price_change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {analysis.price_change >= 0 ? '+' : ''}{analysis.price_change.toFixed(2)} ({analysis.price_change_percent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                analysis.trading_signal.action === 'buy' ? 'bg-emerald-100 text-emerald-700' :
                analysis.trading_signal.action === 'sell' ? 'bg-rose-100 text-rose-700' :
                'bg-muted text-muted-foreground'
              }`}>
                信号: {analysis.trading_signal.action === 'buy' ? '买入' : analysis.trading_signal.action === 'sell' ? '卖出' : '持有'}
                <span className="ml-1">({analysis.trading_signal.confidence}%置信度)</span>
              </div>
            </div>

            {/* 四象限分析 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 基本面 */}
              <div className="bg-muted/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <PieChart className="text-emerald-500" size={16} />
                  </div>
                  <span className="font-medium text-sm">基本面分析</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">估值</span>
                    <span className="font-medium">{analysis.fundamentals.valuation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">盈利</span>
                    <span className="font-medium">{analysis.fundamentals.profitability}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">成长</span>
                    <span className="font-medium">{analysis.fundamentals.growth}</span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{analysis.fundamentals.overall}</p>
              </div>

              {/* 技术面 */}
              <div className="bg-muted/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <LineChart className="text-blue-500" size={16} />
                  </div>
                  <span className="font-medium text-sm">技术分析</span>
                </div>
                <div className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${
                  analysis.technical.trend === 'bullish' ? 'bg-emerald-100 text-emerald-700' :
                  analysis.technical.trend === 'bearish' ? 'bg-rose-100 text-rose-700' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {analysis.technical.trend === 'bullish' ? '多头' : analysis.technical.trend === 'bearish' ? '空头' : '中性'}
                </div>
                <div className="space-y-1 text-xs">
                  {analysis.technical.indicators.map((ind, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-muted-foreground">{ind.name}</span>
                      <span>{ind.value}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{analysis.technical.summary}</p>
              </div>

              {/* 情绪面 */}
              <div className="bg-muted/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Activity className="text-purple-500" size={16} />
                  </div>
                  <span className="font-medium text-sm">市场情绪</span>
                </div>
                <div className="mb-2">
                  <div className="text-2xl font-bold">{Math.round(analysis.sentiment.score * 100)}</div>
                  <div className="text-xs text-muted-foreground">情绪得分 (-100 ~ +100)</div>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">新闻情绪</span>
                    <span>{analysis.sentiment.news_sentiment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">社交情绪</span>
                    <span>{analysis.sentiment.social_sentiment}</span>
                  </div>
                </div>
              </div>

              {/* 风险评估 */}
              <div className="bg-muted/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                    <Shield className="text-amber-500" size={16} />
                  </div>
                  <span className="font-medium text-sm">风险评估</span>
                </div>
                <div className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${
                  analysis.risk_assessment.level === 'low' ? 'bg-emerald-100 text-emerald-700' :
                  analysis.risk_assessment.level === 'medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-rose-100 text-rose-700'
                }`}>
                  {analysis.risk_assessment.level === 'low' ? '低风险' : 
                   analysis.risk_assessment.level === 'medium' ? '中风险' : '高风险'}
                </div>
                <div className="space-y-1 text-xs">
                  {analysis.risk_assessment.factors.slice(0, 2).map((factor, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <AlertTriangle size={10} className="text-amber-500" />
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{analysis.risk_assessment.recommendation}</p>
              </div>
            </div>

            {/* 最新新闻 */}
            {analysis.news.length > 0 && (
              <div>
                <h3 className="font-medium text-sm mb-3">最新相关新闻</h3>
                <div className="space-y-2">
                  {analysis.news.slice(0, 3).map((news, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
                      <div className={`w-2 h-2 mt-1.5 rounded-full ${
                        news.sentiment === 'positive' ? 'bg-emerald-500' :
                        news.sentiment === 'negative' ? 'bg-rose-500' : 'bg-gray-400'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm">{news.headline}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-1.5 py-0.5 rounded text-xs ${
                            news.impact === 'high' ? 'bg-rose-100 text-rose-700' :
                            news.impact === 'medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {news.impact === 'high' ? '高影响' : news.impact === 'medium' ? '中影响' : '低影响'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 交易建议 */}
            <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="text-primary" size={18} />
                <span className="font-semibold">AI 交易建议</span>
              </div>
              <p className="text-sm text-muted-foreground">{analysis.trading_signal.rationale}</p>
              {analysis.trading_signal.target_price && (
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">目标价：</span>
                    <span className="font-medium text-emerald-500">${analysis.trading_signal.target_price.toFixed(2)}</span>
                  </div>
                  {analysis.trading_signal.stop_loss && (
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">止损价：</span>
                      <span className="font-medium text-rose-500">${analysis.trading_signal.stop_loss.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 数据来源 */}
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <CheckCircle size={12} className="text-emerald-500" />
              分析时间: {analysis.metadata.timestamp}
              <span className="mx-1">|</span>
              提供商: {analysis.metadata.provider} / {analysis.metadata.model}
              <span className="mx-1">|</span>
              处理时间: {analysis.metadata.processing_time.toFixed(2)}s
            </div>
          </div>
        )}

        {/* 原有分析模块 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="夏普比率"
            value={riskMetrics.sharpeRatio.toFixed(2)}
            subtitle="风险调整后收益"
            trend={riskMetrics.sharpeRatio >= 1 ? 'up' : 'down'}
            icon="📊"
            color="#3b82f6"
          />
          <StatCard
            title="年化收益"
            value={`${(riskMetrics.standardDeviation * 30).toFixed(1)}%`}
            subtitle="预期年收益率"
            trend="up"
            icon="📈"
            color="#22c55e"
          />
          <StatCard
            title="波动率"
            value={`${(riskMetrics.standardDeviation * 100).toFixed(1)}%`}
            subtitle="投资组合风险"
            trend={riskMetrics.standardDeviation < 0.15 ? 'up' : 'down'}
            icon="📉"
            color="#f59e0b"
          />
          <StatCard
            title="最大回撤"
            value={`${(riskMetrics.maxDrawdown * 100).toFixed(1)}%`}
            subtitle="历史最大亏损"
            trend={riskMetrics.maxDrawdown < 0.2 ? 'up' : 'down'}
            icon="⚠️"
            color="#ef4444"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PortfolioChart assets={mockPortfolioAssets} />
          </div>
          <div>
            <RiskMeter riskMetrics={riskMetrics} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PerformanceChart backtestResult={backtestResult ?? undefined} />
          </div>
          <div>
            <RecommendationPanel
              recommendations={report?.recommendations || []}
              optimizationResult={report?.optimizationResult}
              assetNames={mockPortfolioAssets.map(a => a.name)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-lg font-semibold mb-4">风险指标详解</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-sm">标准差</span>
                </div>
                <span className="font-medium">{(riskMetrics.standardDeviation * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-sm">VaR (95%)</span>
                </div>
                <span className="font-medium">{(riskMetrics.var * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm">CVaR (95%)</span>
                </div>
                <span className="font-medium">{(riskMetrics.cvar * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-sm">Beta系数</span>
                </div>
                <span className="font-medium">{riskMetrics.beta.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-lg font-semibold mb-4">收益指标</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm">夏普比率</span>
                </div>
                <span className="font-medium">{riskMetrics.sharpeRatio.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm">年化收益</span>
                </div>
                <span className="font-medium">8.5%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-sm">最大回撤</span>
                </div>
                <span className="font-medium">{(riskMetrics.maxDrawdown * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  <span className="text-sm">索提诺比率</span>
                </div>
                <span className="font-medium">1.85</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-lg font-semibold mb-4">策略回测结果</h3>
          {backtestResult && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="bg-muted rounded-xl p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">回测周期</div>
                <div className="text-sm font-semibold">
                  {backtestResult.startDate} - {backtestResult.endDate}
                </div>
              </div>
              <div className="bg-muted rounded-xl p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">累计收益</div>
                <div className={`text-lg font-semibold ${backtestResult.totalReturn >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {backtestResult.totalReturn >= 0 ? '+' : ''}{(backtestResult.totalReturn * 100).toFixed(1)}%
                </div>
              </div>
              <div className="bg-muted rounded-xl p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">年化收益</div>
                <div className={`text-lg font-semibold ${backtestResult.annualizedReturn >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {backtestResult.annualizedReturn >= 0 ? '+' : ''}{(backtestResult.annualizedReturn * 100).toFixed(1)}%
                </div>
              </div>
              <div className="bg-muted rounded-xl p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">夏普比率</div>
                <div className="text-lg font-semibold text-blue-500">
                  {backtestResult.sharpeRatio.toFixed(2)}
                </div>
              </div>
              <div className="bg-muted rounded-xl p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">胜率</div>
                <div className="text-lg font-semibold text-purple-500">
                  {(backtestResult.winningRate * 100).toFixed(0)}%
                </div>
              </div>
              <div className="bg-muted rounded-xl p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">交易次数</div>
                <div className="text-lg font-semibold text-foreground">
                  {backtestResult.trades}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
