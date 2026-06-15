'use client'

import { useEffect, useRef } from 'react'
import type { BacktestResult } from '@/types'

interface PerformanceChartProps {
  backtestResult?: BacktestResult
  title?: string
}

export function PerformanceChart({ backtestResult, title = '收益曲线' }: PerformanceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !backtestResult) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height
    const padding = { top: 20, right: 20, bottom: 30, left: 50 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    ctx.clearRect(0, 0, width, height)

    const equityCurve = backtestResult.equityCurve
    const values = equityCurve.map(e => e.value)
    const minValue = Math.min(...values) * 0.95
    const maxValue = Math.max(...values) * 1.05
    const range = maxValue - minValue

    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i
      const value = maxValue - (range / 4) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
      ctx.stroke()

      ctx.fillStyle = '#94a3b8'
      ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(`${(value / 1000).toFixed(1)}k`, padding.left - 5, y + 3)
    }

    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom)
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)')
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)')

    ctx.beginPath()
    ctx.moveTo(padding.left, height - padding.bottom)
    
    equityCurve.forEach((point, index) => {
      const x = padding.left + (index / (equityCurve.length - 1)) * chartWidth
      const y = padding.top + ((maxValue - point.value) / range) * chartHeight
      if (index === 0) {
        ctx.lineTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    
    ctx.lineTo(padding.left + chartWidth, height - padding.bottom)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()

    ctx.beginPath()
    equityCurve.forEach((point, index) => {
      const x = padding.left + (index / (equityCurve.length - 1)) * chartWidth
      const y = padding.top + ((maxValue - point.value) / range) * chartHeight
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.stroke()

    const labelCount = Math.min(6, equityCurve.length)
    for (let i = 0; i < labelCount; i++) {
      const index = Math.floor((i / (labelCount - 1)) * (equityCurve.length - 1))
      const point = equityCurve[index]
      const x = padding.left + (index / (equityCurve.length - 1)) * chartWidth
      
      ctx.fillStyle = '#94a3b8'
      ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif'
      ctx.textAlign = 'center'
      const dateParts = point.date.split('-')
      ctx.fillText(`${dateParts[1]}/${dateParts[2]}`, x, height - 10)
    }
  }, [backtestResult])

  if (!backtestResult) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          暂无收益数据
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            策略收益
          </span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ maxHeight: '250px' }}
      />
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center">
          <div className="text-xs text-muted-foreground">累计收益</div>
          <div className={`text-lg font-semibold ${backtestResult.totalReturn >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {backtestResult.totalReturn >= 0 ? '+' : ''}{(backtestResult.totalReturn * 100).toFixed(1)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground">年化收益</div>
          <div className={`text-lg font-semibold ${backtestResult.annualizedReturn >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {backtestResult.annualizedReturn >= 0 ? '+' : ''}{(backtestResult.annualizedReturn * 100).toFixed(1)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground">交易次数</div>
          <div className="text-lg font-semibold text-foreground">
            {backtestResult.trades}
          </div>
        </div>
      </div>
    </div>
  )
}