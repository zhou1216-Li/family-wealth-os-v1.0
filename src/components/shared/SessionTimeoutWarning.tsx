'use client'

import { Clock, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export function SessionTimeoutWarning() {
  const { showSessionWarning, sessionRemainingSeconds, dismissSessionWarning, logout } = useAuth()

  const minutesRemaining = Math.ceil(sessionRemainingSeconds / 60)
  const secondsRemaining = sessionRemainingSeconds % 60

  if (!showSessionWarning) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl p-6 w-full max-w-sm space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-400/10 flex items-center justify-center">
            <Clock size={24} className="text-amber-500" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">会话即将超时</h3>
            <p className="text-xs text-muted-foreground mt-0.5">您的会话将在 {minutesRemaining} 分 {secondsRemaining} 秒后自动登出</p>
          </div>
        </div>

        <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="absolute inset-y-0 left-0 bg-amber-500 rounded-full transition-all duration-1000"
            style={{ width: `${(sessionRemainingSeconds / (5 * 60)) * 100}%` }}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          为了您的账户安全，系统将在超时后自动登出。点击{'\"'}继续使用{'\"'}以延长会话时间。
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => logout()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-secondary transition-colors"
          >
            <LogOut size={14} />
            立即登出
          </button>
          <button
            onClick={() => dismissSessionWarning()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
          >
            继续使用
          </button>
        </div>
      </div>
    </div>
  )
}
