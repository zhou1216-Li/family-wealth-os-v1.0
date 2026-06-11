'use client'

import { MainLayout } from '@/components/shared/MainLayout'
import { StatCard } from '@/components/shared/StatCard'
import { Tabs } from '@/components/shared/Tabs'
import { useApp, monthlyData, netWorthTrend, categoryData } from '@/contexts/AppContext'
import { fmtCurrency, fmtPct } from '@/lib/formatters'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line } from 'recharts'
import { useState } from 'react'

export default function ReportsPage() {
  const { transactions, assets, liabilities, budgets } = useApp()
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { key: 'overview', label: '总览' },
    { key: 'income', label: '收入分析' },
    { key: 'expense', label: '支出分析' },
    { key: 'networth', label: '净资产' },
  ]

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const netSavings = totalIncome - totalExpense
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

  const incomeByCategory = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  const incomeChartData = Object.entries(incomeByCategory).map(([name, value]) => ({
    name,
    value,
    percentage: totalIncome > 0 ? (value / totalIncome) * 100 : 0,
  }))

  const expenseByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  const expenseChartData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name,
    value,
    percentage: totalExpense > 0 ? (value / totalExpense) * 100 : 0,
  }))

  return (
    <MainLayout title="财务报表" subtitle="详细的财务分析报告">
      <div className="space-y-6">
        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="总收入"
                value={fmtCurrency(totalIncome)}
                subtitle="本年度"
                icon="📈"
                color="#10b981"
              />
              <StatCard
                title="总支出"
                value={fmtCurrency(totalExpense)}
                subtitle="本年度"
                icon="📉"
                color="#f59e0b"
              />
              <StatCard
                title="净储蓄"
                value={fmtCurrency(netSavings)}
                subtitle={`储蓄率 ${fmtPct(savingsRate)}`}
                icon="💰"
                color={netSavings > 0 ? '#3b82f6' : '#ef4444'}
              />
              <StatCard
                title="净资产"
                value={fmtCurrency(assets.reduce((sum, a) => sum + a.value, 0) - liabilities.reduce((sum, l) => sum + l.amount, 0))}
                subtitle="当前"
                icon="🏠"
                color="#8b5cf6"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      formatter={(value: number) => fmtCurrency(value)}
                    />
                    <Area type="monotone" dataKey="income" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="收入" />
                    <Area type="monotone" dataKey="expense" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="支出" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-sm text-foreground mb-4">储蓄趋势</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#f1f5f9' }}
                      formatter={(value: number) => fmtCurrency(value)}
                    />
                    <Area type="monotone" dataKey="savings" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="储蓄" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Income Tab */}
        {activeTab === 'income' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-sm text-foreground mb-4">收入来源分布</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={incomeChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {incomeChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#f1f5f9' }}
                      formatter={(value: number) => fmtCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-sm text-foreground mb-4">收入分类明细</h3>
                <div className="space-y-3">
                  {incomeChartData.map((item, index) => (
                    <div key={item.name}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-foreground">{item.name}</span>
                        <span className="text-muted-foreground">{fmtCurrency(item.value)} ({fmtPct(item.percentage)})</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${item.percentage}%`, backgroundColor: COLORS[index % COLORS.length] }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expense Tab */}
        {activeTab === 'expense' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-sm text-foreground mb-4">支出分类分布</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={expenseChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {expenseChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#f1f5f9' }}
                      formatter={(value: number) => fmtCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-sm text-foreground mb-4">支出分类明细</h3>
                <div className="space-y-3">
                  {expenseChartData.map((item, index) => (
                    <div key={item.name}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-foreground">{item.name}</span>
                        <span className="text-muted-foreground">{fmtCurrency(item.value)} ({fmtPct(item.percentage)})</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${item.percentage}%`, backgroundColor: COLORS[index % COLORS.length] }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Net Worth Tab */}
        {activeTab === 'networth' && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-sm text-foreground mb-4">净资产趋势</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={netWorthTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#f1f5f9' }}
                    formatter={(value: number) => fmtCurrency(value)}
                  />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="净资产" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-sm text-foreground mb-4">资产构成</h3>
                <div className="space-y-3">
                  {assets.slice(0, 5).map((asset, index) => (
                    <div key={asset.id}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-foreground">{asset.icon} {asset.name}</span>
                        <span className="text-muted-foreground">{fmtCurrency(asset.value)}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${(asset.value / assets.reduce((sum, a) => sum + a.value, 0)) * 100}%`, backgroundColor: asset.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-sm text-foreground mb-4">负债构成</h3>
                <div className="space-y-3">
                  {liabilities.map((liability, index) => (
                    <div key={liability.id}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-foreground">{liability.name}</span>
                        <span className="text-muted-foreground">{fmtCurrency(liability.amount)}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${(liability.amount / liabilities.reduce((sum, l) => sum + l.amount, 0)) * 100}%`, backgroundColor: '#f43f5e' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
