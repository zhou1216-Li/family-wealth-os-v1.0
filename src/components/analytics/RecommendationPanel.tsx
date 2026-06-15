'use client'

import type { OptimizationResult } from '@/types'

interface RecommendationPanelProps {
  recommendations: string[]
  optimizationResult?: OptimizationResult
  assetNames?: string[]
  title?: string
}

export function RecommendationPanel({
  recommendations,
  optimizationResult,
  assetNames = [],
  title = '优化建议',
}: RecommendationPanelProps) {
  const getRecommendationIcon = (text: string): string => {
    if (text.includes('夏普比率')) return '📈'
    if (text.includes('回撤')) return '📉'
    if (text.includes('风险')) return '🛡️'
    if (text.includes('分散')) return '🔄'
    if (text.includes('良好')) return '✅'
    if (text.includes('定期')) return '📅'
    return '💡'
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      
      {optimizationResult && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-4">
          <div className="text-sm font-medium text-blue-800 mb-2">✨ 优化配置建议</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">期望收益</span>
              <span className="font-semibold text-emerald-600">
                +{(optimizationResult.expectedReturn * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">波动率</span>
              <span className="font-semibold text-blue-600">
                {(optimizationResult.volatility * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">夏普比率</span>
              <span className="font-semibold text-purple-600">
                {optimizationResult.sharpeRatio.toFixed(2)}
              </span>
            </div>
          </div>
          
          {assetNames.length > 0 && optimizationResult.weights.length === assetNames.length && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="text-xs text-blue-600 mb-2">建议配置比例</div>
              <div className="space-y-1">
                {assetNames.map((name, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground flex-1">{name}</span>
                    <div className="flex-1 bg-blue-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${optimizationResult.weights[index] * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium w-12 text-right">
                      {(optimizationResult.weights[index] * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-xl">
            <span className="text-lg">{getRecommendationIcon(rec)}</span>
            <span className="text-sm text-foreground">{rec}</span>
          </div>
        ))}
      </div>
    </div>
  )
}