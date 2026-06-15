'use client'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | null
  icon?: string
  color?: string
}

export function StatCard({ title, value, subtitle, trend, icon, color = '#3b82f6' }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</div>
        {icon && (
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-sm" 
            style={{ background: `${color}20` }}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-semibold text-foreground">{value}</div>
        {trend && (
          <div className={`flex items-center gap-0.5 text-xs font-medium ${trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
            <span>{trend === 'up' ? '↑' : '↓'}</span>
            <span>{trend === 'up' ? '良好' : '关注'}</span>
          </div>
        )}
      </div>
      {subtitle && <div className="text-xs text-muted-foreground mt-2">{subtitle}</div>}
    </div>
  )
}
