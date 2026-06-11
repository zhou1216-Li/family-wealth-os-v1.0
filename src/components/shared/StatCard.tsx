'use client'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: string
    positive: boolean
  }
  icon?: string
  color?: string
}

export function StatCard({ title, value, subtitle, trend, icon, color = '#3b82f6' }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 hover:border-primary/20 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="text-xs text-muted-foreground">{title}</div>
        {icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: `${color}20` }}>
            {icon}
          </div>
        )}
      </div>
      <div className="text-2xl text-foreground mb-1">{value}</div>
      {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
      {trend && (
        <div className={`text-xs mt-1 ${trend.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {trend.value}
        </div>
      )}
    </div>
  )
}
