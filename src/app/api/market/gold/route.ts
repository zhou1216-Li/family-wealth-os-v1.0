import { NextResponse } from 'next/server'
import { getGoldPrice } from '@/services/marketDataService'

export async function GET() {
  try {
    const data = await getGoldPrice()
    
    if (!data) {
      return NextResponse.json(
        { error: '无法获取黄金价格' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Gold API error:', error)
    return NextResponse.json(
      { error: '获取黄金价格失败' },
      { status: 500 }
    )
  }
}
