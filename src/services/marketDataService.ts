/**
 * 市场数据服务 - 获取实时资产价格
 * 使用免费的公开API
 */

// ─── 类型定义 ────────────────────────────────────────────────────────────────

export interface StockPrice {
  code: string
  name: string
  price: number
  change: number
  changePercent: number
  open: number
  high: number
  low: number
  volume: number
  timestamp: number
}

export interface FundPrice {
  code: string
  name: string
  netValue: number
  expectedValue: number | null
  updateDate: string
  changePercent: number
}

export interface GoldPrice {
  price: number
  change: number
  changePercent: number
  unit: string
  timestamp: number
}

export interface PropertyEstimate {
  address: string
  estimatedValue: number
  pricePerSqm: number
  area: number
  confidence: 'low' | 'medium' | 'high'
}

// ─── 缓存配置 ────────────────────────────────────────────────────────────────

const CACHE_DURATION = {
  stock: 30 * 1000,      // 30秒
  fund: 60 * 60 * 1000,  // 1小时（基金净值每日更新）
  gold: 60 * 1000,       // 1分钟
}

const cache = new Map<string, { data: unknown; timestamp: number }>()

function getCached<T>(key: string): T | null {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < ((CACHE_DURATION as Record<string, number>)[key.split('_')[0]] || 60000)) {
    return cached.data as T
  }
  return null
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() })
}

// ─── 股票价格 ────────────────────────────────────────────────────────────────

/**
 * 获取股票实时价格（新浪财经API）
 * @param code 股票代码，如 sh600000, sz000001
 */
export async function getStockPrice(code: string): Promise<StockPrice | null> {
  const cacheKey = `stock_${code}`
  const cached = getCached<StockPrice>(cacheKey)
  if (cached) return cached

  try {
    // 新浪财经API
    const response = await fetch(
      `https://hq.sinajs.cn/list=${code}`,
      {
        headers: {
          'Referer': 'https://finance.sina.com.cn',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch stock data')
    }

    const text = await response.text()
    const match = text.match(/="([^"]+)"/)

    if (!match || !match[1]) {
      return null
    }

    const data = match[1].split(',')
    if (data.length < 32) {
      return null
    }

    const [
      name, open, lastClose, price, high, low,
      buy, sell, volume, amount,
      buy1, buy1Amount, buy2, buy2Amount, buy3, buy3Amount,
      buy4, buy4Amount, buy5, buy5Amount,
      sell1, sell1Amount, sell2, sell2Amount, sell3, sell3Amount,
      sell4, sell4Amount, sell5, sell5Amount,
      date, time
    ] = data

    const currentPrice = parseFloat(price)
    const lastClosePrice = parseFloat(lastClose)
    const change = currentPrice - lastClosePrice
    const changePercent = lastClosePrice > 0 ? (change / lastClosePrice) * 100 : 0

    const result: StockPrice = {
      code,
      name: name || code,
      price: currentPrice,
      change,
      changePercent,
      open: parseFloat(open),
      high: parseFloat(high),
      low: parseFloat(low),
      volume: parseInt(volume),
      timestamp: Date.now(),
    }

    setCache(cacheKey, result)
    return result
  } catch (error) {
    console.error('Failed to get stock price:', error)
    return null
  }
}

// ─── 基金净值 ────────────────────────────────────────────────────────────────

/**
 * 获取基金净值（天天基金API）
 * @param code 基金代码，如 000001
 */
export async function getFundPrice(code: string): Promise<FundPrice | null> {
  const cacheKey = `fund_${code}`
  const cached = getCached<FundPrice>(cacheKey)
  if (cached) return cached

  try {
    // 天天基金API
    const response = await fetch(
      `https://fundgz.1234567.com.cn/js/${code}.js`,
      {
        headers: {
          'Referer': 'https://fund.eastmoney.com',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch fund data')
    }

    const text = await response.text()
    // 返回格式: jsonpgz({"fundcode":"000001","name":"华夏成长","jzrq":"2024-01-15","dwjz":"1.2340","gsz":"1.2350","gszzl":"0.08","gztime":"2024-01-16 15:00"});
    const match = text.match(/jsonpgz\(([^)]+)\)/)

    if (!match || !match[1]) {
      return null
    }

    const data = JSON.parse(match[1])

    const result: FundPrice = {
      code: data.fundcode || code,
      name: data.name || code,
      netValue: parseFloat(data.dwjz) || 0,
      expectedValue: data.gsz ? parseFloat(data.gsz) : null,
      updateDate: data.jzrq || '',
      changePercent: parseFloat(data.gszzl) || 0,
    }

    setCache(cacheKey, result)
    return result
  } catch (error) {
    console.error('Failed to get fund price:', error)
    return null
  }
}

// ─── 黄金价格 ────────────────────────────────────────────────────────────────

/**
 * 获取黄金价格
 * 由于免费API限制，这里使用模拟数据或备用方案
 */
export async function getGoldPrice(): Promise<GoldPrice | null> {
  const cacheKey = 'gold_spot'
  const cached = getCached<GoldPrice>(cacheKey)
  if (cached) return cached

  try {
    // 尝试使用新浪财经的黄金数据
    const response = await fetch(
      'https://hq.sinajs.cn/list=hf_GC',
      {
        headers: {
          'Referer': 'https://finance.sina.com.cn',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch gold data')
    }

    const text = await response.text()
    const match = text.match(/="([^"]+)"/)

    if (!match || !match[1]) {
      // 返回模拟数据作为备用
      const result: GoldPrice = {
        price: 480.50, // 人民币/克（参考价）
        change: 0,
        changePercent: 0,
        unit: 'CNY/g',
        timestamp: Date.now(),
      }
      setCache(cacheKey, result)
      return result
    }

    const data = match[1].split(',')
    // 纽约黄金期货数据，需要转换为人民币/克
    const priceUsd = parseFloat(data[0]) // 美元/盎司
    const changeUsd = parseFloat(data[4]) || 0

    // 转换: 1盎司 = 31.1035克，假设汇率7.2
    const usdToCny = 7.2
    const pricePerGram = (priceUsd * usdToCny) / 31.1035
    const changePerGram = (changeUsd * usdToCny) / 31.1035
    const changePercent = pricePerGram > 0 ? (changePerGram / pricePerGram) * 100 : 0

    const result: GoldPrice = {
      price: Math.round(pricePerGram * 100) / 100,
      change: Math.round(changePerGram * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      unit: 'CNY/g',
      timestamp: Date.now(),
    }

    setCache(cacheKey, result)
    return result
  } catch (error) {
    console.error('Failed to get gold price:', error)
    // 返回参考价格
    const result: GoldPrice = {
      price: 480.50,
      change: 0,
      changePercent: 0,
      unit: 'CNY/g',
      timestamp: Date.now(),
    }
    return result
  }
}

// ─── 房产估值（预留接口）────────────────────────────────────────────────────────

/**
 * 房产估值接口（预留）
 * 实际实现需要接入房产数据API
 */
export async function getPropertyEstimate(
  address: string,
  area: number
): Promise<PropertyEstimate | null> {
  // 预留接口，返回模拟数据
  // 实际应用中可接入链家、贝壳等平台的API

  const avgPricePerSqm: Record<string, number> = {
    '北京': 65000,
    '上海': 60000,
    '深圳': 70000,
    '广州': 40000,
    '杭州': 45000,
    '成都': 20000,
    '武汉': 18000,
    '南京': 35000,
  }

  // 尝试匹配城市
  let pricePerSqm = 20000 // 默认价格
  for (const [city, price] of Object.entries(avgPricePerSqm)) {
    if (address.includes(city)) {
      pricePerSqm = price
      break
    }
  }

  const result: PropertyEstimate = {
    address,
    estimatedValue: pricePerSqm * area,
    pricePerSqm,
    area,
    confidence: 'low', // 模拟数据置信度低
  }

  return result
}

// ─── 批量刷新资产价值 ────────────────────────────────────────────────────────

export interface AssetWithValue {
  id: string
  type: string
  name: string
  code?: string
  currentValue: number
  newValue: number | null
  change: number | null
  changePercent: number | null
  error?: string
}

/**
 * 批量刷新资产价值
 * @param assets 资产列表，需要包含 code 字段（股票代码/基金代码）
 */
export async function refreshAssetValues(
  assets: Array<{ id: string; type: string; name: string; value: number; code?: string }>
): Promise<AssetWithValue[]> {
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
        const stockData = await getStockPrice(asset.code)
        if (stockData) {
          result.newValue = stockData.price
          result.change = stockData.price - asset.value
          result.changePercent = asset.value > 0 ? (result.change / asset.value) * 100 : 0
        } else {
          result.error = '无法获取股票数据'
        }
      } else if (asset.type === '基金' && asset.code) {
        const fundData = await getFundPrice(asset.code)
        if (fundData) {
          result.newValue = fundData.expectedValue || fundData.netValue
          result.change = result.newValue - asset.value
          result.changePercent = asset.value > 0 ? (result.change / asset.value) * 100 : 0
        } else {
          result.error = '无法获取基金数据'
        }
      } else if (asset.type === '黄金') {
        const goldData = await getGoldPrice()
        if (goldData) {
          // 假设资产价值是克数 * 当前金价
          const grams = asset.value / 480 // 粗略估算克数
          result.newValue = grams * goldData.price
          result.change = result.newValue - asset.value
          result.changePercent = asset.value > 0 ? (result.change / asset.value) * 100 : 0
        } else {
          result.error = '无法获取黄金价格'
        }
      } else {
        result.error = '该资产类型不支持自动刷新'
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : '未知错误'
    }

    results.push(result)
  }

  return results
}

// ─── 导出工具函数 ────────────────────────────────────────────────────────────────

/**
 * 清除所有缓存
 */
export function clearMarketDataCache(): void {
  cache.clear()
}

/**
 * 清除特定类型的缓存
 */
export function clearCacheByType(type: 'stock' | 'fund' | 'gold'): void {
  for (const key of cache.keys()) {
    if (key.startsWith(type)) {
      cache.delete(key)
    }
  }
}
