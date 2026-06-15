import { NextRequest, NextResponse } from 'next/server'
import { getFundPrice } from '@/services/marketDataService'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json(
      { error: '缺少基金代码参数' },
      { status: 400 }
    )
  }

  try {
    const data = await getFundPrice(code)
    
    if (!data) {
      return NextResponse.json(
        { error: '无法获取基金数据，请检查基金代码是否正确' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Fund API error:', error)
    return NextResponse.json(
      { error: '获取基金数据失败' },
      { status: 500 }
    )
  }
}
