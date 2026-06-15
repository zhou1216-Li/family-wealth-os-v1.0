/**
 * TradingAgents API 路由
 * 提供与 Python 后端 TradingAgents 服务的接口
 */

import { NextRequest, NextResponse } from 'next/server'

const TRADING_AGENTS_URL = process.env.TRADING_AGENTS_API_URL || 'http://localhost:8000'

// 股票分析
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { symbol, market, date, provider, model, research_depth } = body

    // 转发请求到 Python 后端
    const response = await fetch(`${TRADING_AGENTS_URL}/api/v1/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        symbol,
        market,
        date,
        provider: provider || 'openai',
        model: model || 'gpt-4o',
        research_depth: research_depth || 'standard',
      }),
    })

    if (!response.ok) {
      throw new Error(`TradingAgents API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Stock analysis API error:', error)
    return NextResponse.json(
      { error: 'Analysis service unavailable', details: String(error) },
      { status: 503 }
    )
  }
}
