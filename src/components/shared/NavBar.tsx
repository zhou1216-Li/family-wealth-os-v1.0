'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Wallet, CreditCard, TrendingUp, Target, PieChart, Flame, Users, Settings } from 'lucide-react'

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

export function NavBar() {
  const pathname = usePathname()

  return (
    <nav className="hidden md:flex flex-col gap-1 w-56 flex-shrink-0">
      {navItems.map(item => {
        const isActive = pathname === item.href
        const Icon = item.icon
        return (
          <Link
            key={item.key}
            href={item.href}
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
  )
}
