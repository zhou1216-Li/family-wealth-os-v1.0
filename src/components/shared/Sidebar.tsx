'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Wallet, CreditCard, TrendingUp, Target, PieChart, Flame, Users, Settings, Menu, X } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { key: 'dashboard', label: '概览', icon: Home, href: '/dashboard' },
  { key: 'transactions', label: '交易', icon: Wallet, href: '/transactions' },
  { key: 'assets', label: '资产', icon: CreditCard, href: '/assets' },
  { key: 'liabilities', label: '负债', icon: TrendingUp, href: '/liabilities' },
  { key: 'budget', label: '预算', icon: PieChart, href: '/budget' },
  { key: 'goals', label: '目标', icon: Target, href: '/goals' },
  { key: 'reports', label: '报表', icon: PieChart, href: '/reports' },
  { key: 'fire', label: 'FIRE', icon: Flame, href: '/fire' },
  { key: 'family', label: '家庭', icon: Users, href: '/family' },
  { key: 'settings', label: '设置', icon: Settings, href: '/settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-foreground hover:bg-secondary transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:z-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h1 className="text-lg font-semibold text-foreground">Family Wealth OS</h1>
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map(item => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all
                    ${isActive 
                      ? 'bg-primary text-primary-foreground shadow shadow-primary/20' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }
                  `}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-sm">
                张
              </div>
              <div>
                <div className="text-sm text-foreground">张伟</div>
                <div className="text-xs text-muted-foreground">管理员</div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
