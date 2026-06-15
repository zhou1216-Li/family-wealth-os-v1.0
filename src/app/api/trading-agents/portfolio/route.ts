/**
 * 投资组合分析 API 路由
 */

import { NextRequest, NextResponse } from 'next/server'

const TRADING_AGENTS_URL = process.env.TRADING_AGENTS_API_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { holdings, benchmark } = body

    // 转发请求到 Python 后端
    const response = await fetch(`${TRADING_AGENTS_URL}/api/v1/portfolio/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        holdings,
        benchmark: benchmark || 'SPY',
      }),
    })

    if (!response.ok) {
      throw new Error(`TradingAgents API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Portfolio analysis API error:', error)
    return NextResponse.json(
      { error: 'Portfolio analysis service unavailable', details: String(error) },
      { status: 503 }
    )
  }
}
