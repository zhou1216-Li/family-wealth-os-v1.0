'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Wallet, CreditCard, TrendingUp, Target, PieChart, Flame, Users, Settings, Menu, X, LogOut, Brain, BarChart3 } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

const navItems = [
  { key: 'dashboard', label: '概览', icon: Home, href: '/dashboard' },
  { key: 'transactions', label: '交易', icon: Wallet, href: '/transactions' },
  { key: 'assets', label: '资产', icon: CreditCard, href: '/assets' },
  { key: 'liabilities', label: '负债', icon: TrendingUp, href: '/liabilities' },
  { key: 'budget', label: '预算', icon: PieChart, href: '/budget' },
  { key: 'goals', label: '目标', icon: Target, href: '/goals' },
  { key: 'reports', label: '报表', icon: BarChart3, href: '/reports' },
  { key: 'analytics', label: '分析', icon: BarChart3, href: '/analytics' },
  { key: 'ai-analysis', label: 'AI分析', icon: Brain, href: '/ai-analysis' },
  { key: 'fire', label: 'FIRE', icon: Flame, href: '/fire' },
  { key: 'family', label: '家庭', icon: Users, href: '/family' },
  { key: 'settings', label: '设置', icon: Settings, href: '/settings' },
]

// 移动端底部导航栏（类似原生App风格）
function MobileBottomNav() {
  const pathname = usePathname()
  
  // 移动端只显示常用的几个导航项
  const mobileNavItems = [
    { key: 'dashboard', label: '概览', icon: Home, href: '/dashboard' },
    { key: 'transactions', label: '交易', icon: Wallet, href: '/transactions' },
    { key: 'assets', label: '资产', icon: CreditCard, href: '/assets' },
    { key: 'settings', label: '设置', icon: Settings, href: '/settings' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {mobileNavItems.map(item => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`
                flex flex-col items-center justify-center flex-1 h-full transition-all duration-200
                ${isActive ? 'text-primary' : 'text-muted-foreground'}
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={20} className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-xs mt-0.5 font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { user, isLoading, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleNavClick = () => {
    setIsOpen(false)
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } finally {
      setIsLoggingOut(false)
    }
  }

  const displayName = user?.name || user?.email?.split('@')[0] || '用户'
  const avatarText = user?.avatar || displayName.charAt(0).toUpperCase()

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 w-10 h-10 rounded-xl bg-card border border-border shadow-lg flex items-center justify-center text-foreground hover:bg-secondary transition-all hover:scale-105"
        aria-label="打开菜单"
      >
        <Menu size={22} />
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
          role="button"
          tabIndex={0}
          onKeyDown={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-72 bg-card border-r border-border z-50
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:relative md:z-0 md:flex-shrink-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                <Wallet size={18} className="text-white" />
              </div>
              <h1 className="text-lg font-bold text-foreground">家庭财富</h1>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="关闭菜单"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
            {navItems.map(item => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={handleNavClick}
                  className={`
                    flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer - User Info & Logout */}
          <div className="p-3 sm:p-4 border-t border-border space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 size={20} className="animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 px-3 sm:px-4 py-2.5 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-medium text-sm shadow-sm">
                    {avatarText}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{displayName}</div>
                    <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors disabled:opacity-50"
                >
                  {isLoggingOut ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <LogOut size={18} />
                  )}
                  <span>退出登录</span>
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <MobileBottomNav />
    </>
  )
}
