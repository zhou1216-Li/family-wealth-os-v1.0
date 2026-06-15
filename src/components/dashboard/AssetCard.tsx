'use client'

import type { Asset } from '@/types'
import { fmtCurrency } from '@/lib/formatters'

interface AssetCardProps {
  asset: Asset
}

const assetIcons: Record<string, string> = {
  'cash': '💰',
  'bank': '🏦',
  'investment': '📈',
  'property': '🏠',
  'vehicle': '🚗',
  'gold': '🥇',
  'stock': '📊',
  'fund': '💰',
}

export function AssetCard({ asset }: AssetCardProps) {
  const icon = assetIcons[asset.type] || asset.icon || '💳'
  
  return (
    <div className="p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer group">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{asset.type}</span>
      </div>
      <div className="text-sm font-medium text-foreground truncate">{asset.name}</div>
      <div className="text-xs text-muted-foreground">{fmtCurrency(asset.value)}</div>
    </div>
  )
}
