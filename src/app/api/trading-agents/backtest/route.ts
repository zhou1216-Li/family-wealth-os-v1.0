/**
 * 回测 API 路由
 */

import { NextRequest, NextResponse } from 'next/server'

const TRADING_AGENTS_URL = process.env.TRADING_AGENTS_API_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { symbol, strategy, start_date, end_date, initial_capital } = body

    // 转发请求到 Python 后端
    const response = await fetch(`${TRADING_AGENTS_URL}/api/v1/backtest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        symbol,
        strategy,
        start_date,
        end_date,
        initial_capital: initial_capital || 100000,
      }),
    })

    if (!response.ok) {
      throw new Error(`TradingAgents API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Backtest API error:', error)
    return NextResponse.json(
      { error: 'Backtest service unavailable', details: String(error) },
      { status: 503 }
    )
  }
}
