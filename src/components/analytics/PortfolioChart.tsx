'use client'

import { useEffect, useRef } from 'react'
import type { PortfolioAsset } from '@/types'

interface PortfolioChartProps {
  assets: PortfolioAsset[]
  title?: string
}

export function PortfolioChart({ assets, title = '投资组合分布' }: PortfolioChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
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
    const radius = Math.min(width, height) / 2 - 20

    ctx.clearRect(0, 0, width, height)

    let startAngle = -Math.PI / 2

    assets.forEach((asset) => {
      const sliceAngle = asset.weight * 2 * Math.PI
      const endAngle = startAngle + sliceAngle

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = asset.color
      ctx.fill()

      const midAngle = startAngle + sliceAngle / 2
      const labelRadius = radius * 0.7
      const labelX = centerX + Math.cos(midAngle) * labelRadius
      const labelY = centerY + Math.sin(midAngle) * labelRadius

      ctx.fillStyle = '#fff'
      ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      const weightPercent = (asset.weight * 100).toFixed(1)
      ctx.fillText(`${asset.name}`, labelX, labelY - 8)
      ctx.fillText(`${weightPercent}%`, labelX, labelY + 8)

      startAngle = endAngle
    })

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.4, 0, 2 * Math.PI)
    ctx.fillStyle = '#1e293b'
    ctx.fill()

    const totalValue = assets.reduce((sum, a) => sum + a.weight, 0)
    ctx.fillStyle = '#fff'
    ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('总资产', centerX, centerY - 5)
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.fillText('100%', centerX, centerY + 12)
  }, [assets])

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <canvas
            ref={canvasRef}
            className="w-full aspect-square"
            style={{ maxHeight: '280px' }}
          />
        </div>
        <div className="lg:w-48 space-y-2">
          {assets.map((asset) => (
            <div key={asset.id} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: asset.color }}
              />
              <span className="text-sm text-muted-foreground flex-1">{asset.name}</span>
              <span className="text-sm font-medium">{(asset.weight * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}