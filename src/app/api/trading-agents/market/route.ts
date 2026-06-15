/**
 * 市场概览 API 路由
 */

import { NextRequest, NextResponse } from 'next/server'

const TRADING_AGENTS_URL = process.env.TRADING_AGENTS_API_URL || 'http://localhost:8000'

export async function GET(request: NextRequest) {
  try {
    // 转发请求到 Python 后端
    const response = await fetch(`${TRADING_AGENTS_URL}/api/v1/market/overview`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`TradingAgents API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Market overview API error:', error)
    return NextResponse.json(
      { error: 'Market overview service unavailable', details: String(error) },
      { status: 503 }
    )
  }
}
