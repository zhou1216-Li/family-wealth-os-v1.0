import { NextRequest, NextResponse } from 'next/server'
import { getStockPrice } from '@/services/marketDataService'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json(
      { error: '缺少股票代码参数' },
      { status: 400 }
    )
  }

  try {
    const data = await getStockPrice(code)
    
    if (!data) {
      return NextResponse.json(
        { error: '无法获取股票数据，请检查股票代码是否正确' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Stock API error:', error)
    return NextResponse.json(
      { error: '获取股票数据失败' },
      { status: 500 }
    )
  }
}
