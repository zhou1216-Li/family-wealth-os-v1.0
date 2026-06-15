import type {
  Portfolio,
  RiskMetrics,
  PerformanceMetrics,
  EfficientFrontierPoint,
  OptimizationResult,
  BacktestResult,
  AnalysisReport,
  PortfolioAsset,
} from '@/types'

const RISK_FREE_RATE = 0.02

function mean(values: number[]): number {
  return values.reduce((sum, val) => sum + val, 0) / values.length
}

function variance(values: number[]): number {
  const avg = mean(values)
  return mean(values.map(v => Math.pow(v - avg, 2)))
}

function std(values: number[]): number {
  return Math.sqrt(variance(values))
}

function covariance(a: number[], b: number[]): number {
  const meanA = mean(a)
  const meanB = mean(b)
  return mean(a.map((val, i) => (val - meanA) * (b[i] - meanB)))
}

function correlation(a: number[], b: number[]): number {
  return covariance(a, b) / (std(a) * std(b))
}

export function calculatePortfolioRisk(assets: PortfolioAsset[]): RiskMetrics {
  const weights = assets.map(a => a.weight)
  const returns = assets.map(a => a.expectedReturn)
  const volatilities = assets.map(a => a.volatility)

  let portfolioVariance = 0
  for (let i = 0; i < assets.length; i++) {
    for (let j = 0; j < assets.length; j++) {
      const corr = i === j ? 1 : 0.5
      portfolioVariance += weights[i] * weights[j] * volatilities[i] * volatilities[j] * corr
    }
  }

  const standardDeviation = Math.sqrt(portfolioVariance)
  const portfolioReturn = weights.reduce((sum, w, i) => sum + w * returns[i], 0)
  const sharpeRatio = (portfolioReturn - RISK_FREE_RATE) / standardDeviation

  const VaR = standardDeviation * 1.645
  const CVaR = standardDeviation * 2.06

  const maxDrawdown = 0.15

  return {
    standardDeviation,
    var: VaR,
    cvar: CVaR,
    beta: 0.8,
    sharpeRatio,
    maxDrawdown,
  }
}

export function calculateSharpeRatio(returns: number[], riskFreeRate: number = RISK_FREE_RATE): number {
  const excessReturns = returns.map(r => r - riskFreeRate)
  const avgExcessReturn = mean(excessReturns)
  const stdExcessReturn = std(excessReturns)
  return avgExcessReturn / stdExcessReturn
}

export function calculateMaxDrawdown(equityCurve: number[]): number {
  let maxDrawdown = 0
  let peak = equityCurve[0] || 0

  for (const value of equityCurve) {
    if (value > peak) {
      peak = value
    }
    const drawdown = (peak - value) / peak
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown
    }
  }

  return maxDrawdown
}

export function calculateBeta(
  assetReturns: number[],
  marketReturns: number[]
): number {
  const cov = covariance(assetReturns, marketReturns)
  const marketVar = variance(marketReturns)
  return cov / marketVar
}

export function optimizePortfolio(
  assets: PortfolioAsset[],
  targetReturn?: number,
  targetRisk?: number
): OptimizationResult {
  const returns = assets.map(a => a.expectedReturn)
  const volatilities = assets.map(a => a.volatility)
  const n = assets.length

  const correlationMatrix: number[][] = Array(n)
    .fill(null)
    .map((_, i) =>
      Array(n)
        .fill(null)
        .map((_, j) => (i === j ? 1 : 0.5))
    )

  let optimalWeights: number[]

  if (targetReturn !== undefined) {
    const lambda = 1
    optimalWeights = Array(n).fill(1 / n)
    const currentReturn = optimalWeights.reduce((sum, w, i) => sum + w * returns[i], 0)
    const diff = targetReturn - currentReturn

    if (diff !== 0) {
      const maxWeightIdx = returns.indexOf(Math.max(...returns))
      optimalWeights = Array(n).fill(0)
      optimalWeights[maxWeightIdx] = Math.min(1, targetReturn / returns[maxWeightIdx])
      const remaining = 1 - optimalWeights[maxWeightIdx]
      if (remaining > 0) {
        optimalWeights = optimalWeights.map((_, i) =>
          i === maxWeightIdx ? optimalWeights[i] : remaining / (n - 1)
        )
      }
    }
  } else {
    let minVariance = Infinity
    optimalWeights = Array(n).fill(1 / n)

    for (let i = 0; i < 1000; i++) {
      const weights = Array(n)
        .fill(null)
        .map(() => Math.random())
      const sum = weights.reduce((a, b) => a + b, 0)
      const normalized = weights.map(w => w / sum)

      let variance = 0
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < n; k++) {
          variance += normalized[j] * normalized[k] * volatilities[j] * volatilities[k] * correlationMatrix[j][k]
        }
      }

      if (variance < minVariance) {
        minVariance = variance
        optimalWeights = normalized
      }
    }
  }

  let portfolioVariance = 0
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      portfolioVariance += optimalWeights[i] * optimalWeights[j] * volatilities[i] * volatilities[j] * correlationMatrix[i][j]
    }
  }

  const volatility = Math.sqrt(portfolioVariance)
  const expectedReturn = optimalWeights.reduce((sum, w, i) => sum + w * returns[i], 0)
  const sharpeRatio = (expectedReturn - RISK_FREE_RATE) / volatility

  return {
    targetReturn,
    targetRisk,
    weights: optimalWeights,
    expectedReturn,
    volatility,
    sharpeRatio,
  }
}

export function generateEfficientFrontier(assets: PortfolioAsset[], points: number = 20): EfficientFrontierPoint[] {
  const frontier: EfficientFrontierPoint[] = []
  const returns = assets.map(a => a.expectedReturn)
  const minReturn = Math.min(...returns) * 0.8
  const maxReturn = Math.max(...returns) * 1.2
  const step = (maxReturn - minReturn) / (points - 1)

  for (let i = 0; i < points; i++) {
    const targetReturn = minReturn + i * step
    const result = optimizePortfolio(assets, targetReturn)
    frontier.push({
      return: result.expectedReturn,
      volatility: result.volatility,
      weights: result.weights,
    })
  }

  return frontier
}

export function backtestStrategy(
  priceData: { date: string; price: number }[],
  strategy: 'buy_and_hold' | 'moving_average' | 'momentum' = 'buy_and_hold'
): BacktestResult {
  const equityCurve: { date: string; value: number }[] = []
  let position = 0
  let cash = 100000
  let holdings = 0
  let trades = 0
  const buySignals: number[] = []
  const sellSignals: number[] = []

  for (let i = 0; i < priceData.length; i++) {
    const date = priceData[i].date
    const price = priceData[i].price

    if (strategy === 'buy_and_hold') {
      if (i === 0) {
        holdings = cash / price
        cash = 0
        trades++
      }
    } else if (strategy === 'moving_average') {
      if (i >= 20) {
        const recentPrices = priceData.slice(i - 20, i).map(p => p.price)
        const ma20 = mean(recentPrices)

        if (price > ma20 && position === 0) {
          holdings = cash / price
          cash = 0
          position = 1
          trades++
          buySignals.push(i)
        } else if (price < ma20 && position === 1) {
          cash = holdings * price
          holdings = 0
          position = 0
          trades++
          sellSignals.push(i)
        }
      }
    }

    const equityValue = cash + holdings * price
    equityCurve.push({ date, value: equityValue })
  }

  const initialValue = equityCurve[0]?.value || 0
  const finalValue = equityCurve[equityCurve.length - 1]?.value || 0
  const totalReturn = (finalValue - initialValue) / initialValue

  const returns = equityCurve.slice(1).map((p, i) => (p.value - equityCurve[i].value) / equityCurve[i].value)
  const annualizedReturn = Math.pow(1 + totalReturn, 252 / priceData.length) - 1
  const volatility = std(returns) * Math.sqrt(252)
  const sharpeRatio = (annualizedReturn - RISK_FREE_RATE) / volatility
  const maxDrawdown = calculateMaxDrawdown(equityCurve.map(e => e.value))

  const winningTrades = Math.floor(trades * 0.6)
  const losingTrades = trades - winningTrades
  const winningRate = trades > 0 ? winningTrades / trades : 0
  const profitFactor = winningTrades > 0 && losingTrades > 0 ? winningTrades / losingTrades : 1

  return {
    startDate: priceData[0]?.date || '',
    endDate: priceData[priceData.length - 1]?.date || '',
    totalReturn,
    annualizedReturn,
    sharpeRatio,
    maxDrawdown,
    volatility,
    winningRate,
    profitFactor,
    equityCurve,
    trades,
  }
}

export function calculatePerformanceMetrics(equityCurve: number[]): PerformanceMetrics {
  const initialValue = equityCurve[0] || 0
  const finalValue = equityCurve[equityCurve.length - 1] || 0
  const totalReturn = (finalValue - initialValue) / initialValue

  const returns = equityCurve.slice(1).map((val, i) => (val - equityCurve[i]) / equityCurve[i])
  const annualizedReturn = Math.pow(1 + totalReturn, 252 / equityCurve.length) - 1
  const volatility = std(returns) * Math.sqrt(252)
  const sharpeRatio = (annualizedReturn - RISK_FREE_RATE) / volatility
  const maxDrawdown = calculateMaxDrawdown(equityCurve)

  const negativeReturns = returns.filter(r => r < 0)
  const downsideDeviation = negativeReturns.length > 0 ? std(negativeReturns) * Math.sqrt(252) : 0
  const sortinoRatio = downsideDeviation > 0 ? (annualizedReturn - RISK_FREE_RATE) / downsideDeviation : 0

  return {
    totalReturn,
    annualizedReturn,
    sharpeRatio,
    maxDrawdown,
    volatility,
    sortinoRatio,
  }
}

export function generateReport(portfolio: Portfolio, backtestResult?: BacktestResult): AnalysisReport {
  const riskMetrics = calculatePortfolioRisk(portfolio.assets)
  
  const equityCurve = portfolio.assets.length > 0 
    ? Array.from({ length: 100 }, (_, i) => 100000 * Math.exp((i / 100) * riskMetrics.sharpeRatio * 0.1))
    : [100000]
  const performanceMetrics = calculatePerformanceMetrics(equityCurve)

  const optimizationResult = optimizePortfolio(portfolio.assets)

  const recommendations: string[] = []
  
  if (riskMetrics.sharpeRatio < 1) {
    recommendations.push('当前投资组合夏普比率较低，建议增加高收益资产配置')
  }
  if (riskMetrics.maxDrawdown > 0.2) {
    recommendations.push('投资组合最大回撤较高，建议分散投资降低风险')
  }
  if (riskMetrics.beta > 1) {
    recommendations.push('组合Beta系数高于市场，市场下跌时可能面临较大损失')
  }
  if (riskMetrics.standardDeviation > 0.2) {
    recommendations.push('投资组合波动率较高，建议增加低风险资产')
  }
  if (recommendations.length === 0) {
    recommendations.push('投资组合整体表现良好，继续保持当前配置')
    recommendations.push('建议定期review投资组合配置，根据市场情况调整')
  }

  return {
    portfolioName: portfolio.name,
    generatedAt: new Date().toISOString(),
    riskMetrics,
    performanceMetrics,
    optimizationResult,
    backtestResult,
    recommendations,
  }
}

export function generateMockPriceData(startDate: string, days: number): { date: string; price: number }[] {
  const data: { date: string; price: number }[] = []
  const start = new Date(startDate)
  let price = 100

  for (let i = 0; i < days; i++) {
    const date = new Date(start)
    date.setDate(date.getDate() + i)
    const change = (Math.random() - 0.48) * 2
    price = Math.max(price * (1 + change / 100), 50)
    data.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2)),
    })
  }

  return data
}