'use client'

import { useEffect, useRef } from 'react'
import type { RiskMetrics } from '@/types'

interface RiskMeterProps {
  riskMetrics: RiskMetrics
  title?: string
}

export function RiskMeter({ riskMetrics, title = '风险评估' }: RiskMeterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const riskLevel = riskMetrics.standardDeviation < 0.15 ? 'low' : 
                      riskMetrics.standardDeviation < 0.25 ? 'medium' : 'high'
    const riskColors = {
      low: '#22c55e',
      medium: '#f59e0b',
      high: '#ef4444',
    }
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 2 - 15

    ctx.clearRect(0, 0, width, height)

    const startAngle = Math.PI * 0.75
    const endAngle = Math.PI * 2.25

    const gradient = ctx.createLinearGradient(0, 0, width, 0)
    gradient.addColorStop(0, '#22c55e')
    gradient.addColorStop(0.5, '#f59e0b')
    gradient.addColorStop(1, '#ef4444')

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, startAngle, endAngle)
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 12
    ctx.lineCap = 'round'
    ctx.stroke()

    const riskValue = Math.min(riskMetrics.standardDeviation / 0.4, 1)
    const arcLength = (endAngle - startAngle) * riskValue
    const endAngleValue = startAngle + arcLength

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, startAngle, endAngleValue)
    ctx.strokeStyle = riskColors[riskLevel]
    ctx.lineWidth = 12
    ctx.lineCap = 'round'
    ctx.stroke()

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${(riskMetrics.standardDeviation * 100).toFixed(1)}%`, centerX, centerY - 5)

    ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.fillStyle = '#94a3b8'
    ctx.fillText('波动率', centerX, centerY + 20)
  }, [riskMetrics])

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="flex flex-col items-center">
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ maxWidth: '200px', maxHeight: '150px' }}
        />
        <div className="grid grid-cols-2 gap-4 w-full mt-4">
          <div className="bg-muted rounded-xl p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">VaR (95%)</div>
            <div className="text-lg font-semibold text-foreground">
              {(riskMetrics.var * 100).toFixed(1)}%
            </div>
          </div>
          <div className="bg-muted rounded-xl p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">CVaR (95%)</div>
            <div className="text-lg font-semibold text-foreground">
              {(riskMetrics.cvar * 100).toFixed(1)}%
            </div>
          </div>
          <div className="bg-muted rounded-xl p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">Beta</div>
            <div className="text-lg font-semibold text-foreground">
              {riskMetrics.beta.toFixed(2)}
            </div>
          </div>
          <div className="bg-muted rounded-xl p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">最大回撤</div>
            <div className="text-lg font-semibold text-foreground">
              {(riskMetrics.maxDrawdown * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}