'use client'

import { MainLayout } from '@/components/shared/MainLayout'
import { StatCard } from '@/components/shared/StatCard'
import { useApp, monthlyData, netWorthTrend, categoryData } from '@/contexts/AppContext'
import { fmtCurrency, fmtCompact } from '@/lib/formatters'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'

export default function DashboardPage() {
  const { assets, liabilities, transactions, budgets } = useApp()

  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0)
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0)
  const netWorth = totalAssets - totalLiabilities
  const monthlyIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const monthlyExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

  return (
    <MainLayout title="概览" subtitle="家庭财务总览">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="净资产"
            value={fmtCompact(netWorth)}
            subtitle={`总资产 ${fmtCompact(totalAssets)}`}
            icon="💰"
            color="#3b82f6"
          />
          <StatCard
            title="本月收入"
            value={fmtCurrency(monthlyIncome)}
            subtitle="本月支出"
            icon="📈"
            color="#10b981"
          />
          <StatCard
            title="本月支出"
            value={fmtCurrency(monthlyExpense)}
            subtitle="预算使用率"
            icon="📉"
            color="#f59e0b"
          />
          <StatCard
            title="储蓄率"
            value={`${((monthlyIncome - monthlyExpense) / monthlyIncome * 100).toFixed(1)}%`}
            subtitle="目标: 30%"
            icon="🎯"
            color="#8b5cf6"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trend */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-sm text-foreground mb-4">收支趋势</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#f1f5f9' }}
                />
                <Area type="monotone" dataKey="income" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <Area type="monotone" dataKey="expense" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-sm text-foreground mb-4">支出分类</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#f1f5f9' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Net Worth Trend */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-sm text-foreground mb-4">净资产趋势</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={netWorthTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                itemStyle={{ color: '#f1f5f9' }}
                formatter={(value: number) => fmtCurrency(value)}
              />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Budget Overview */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-sm text-foreground mb-4">预算概览</h3>
          <div className="space-y-4">
            {budgets.slice(0, 4).map(budget => {
              const percentage = Math.min(100, (budget.spent / budget.monthlyLimit) * 100)
              const isOverBudget = budget.spent > budget.monthlyLimit
              return (
                <div key={budget.id}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-foreground">{budget.icon} {budget.category}</span>
                    <span className={isOverBudget ? 'text-rose-400' : 'text-muted-foreground'}>
                      {fmtCurrency(budget.spent)} / {fmtCurrency(budget.monthlyLimit)}
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: isOverBudget ? '#f43f5e' : budget.color
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
