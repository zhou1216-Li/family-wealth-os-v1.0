'use client'

import { MainLayout } from '@/components/shared/MainLayout'
import { StatCard } from '@/components/shared/StatCard'
import { TransactionCard } from '@/components/dashboard/TransactionCard'
import { AssetCard } from '@/components/dashboard/AssetCard'
import { useApp, monthlyData, netWorthTrend, categoryData } from '@/contexts/AppContext'
import { fmtCurrency, fmtCompact } from '@/lib/formatters'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function DashboardPage() {
  const { assets, liabilities, transactions, budgets, goals } = useApp()

  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0)
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0)
  const netWorth = totalAssets - totalLiabilities
  
  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthlyIncome = transactions
    .filter(t => t.type === 'income' && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + t.amount, 0)
  const monthlyExpense = transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + t.amount, 0)

  const recentTransactions = transactions.slice(0, 5)
  const activeGoals = goals.filter(g => g.currentAmount < g.targetAmount)
  const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount)
  const topAssets = assets.slice(0, 4)

  return (
    <MainLayout title="概览" subtitle="家庭财务总览">
      <div className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="净资产"
            value={fmtCompact(netWorth)}
            subtitle={`总资产 ${fmtCompact(totalAssets)} - 总负债 ${fmtCompact(totalLiabilities)}`}
            icon="💰"
            color="#3b82f6"
            trend={netWorth > 0 ? 'up' : 'down'}
          />
          <StatCard
            title="本月收入"
            value={fmtCurrency(monthlyIncome)}
            subtitle={`较上月 +12%`}
            icon="📈"
            color="#10b981"
            trend="up"
          />
          <StatCard
            title="本月支出"
            value={fmtCurrency(monthlyExpense)}
            subtitle={`预算使用率 ${((monthlyExpense / 30000) * 100).toFixed(0)}%`}
            icon="📉"
            color="#f59e0b"
            trend={monthlyExpense > 25000 ? 'up' : 'down'}
          />
          <StatCard
            title="储蓄率"
            value={`${monthlyIncome > 0 ? ((monthlyIncome - monthlyExpense) / monthlyIncome * 100).toFixed(1) : 0}%`}
            subtitle={`目标: 30%`}
            icon="🎯"
            color="#8b5cf6"
            trend={monthlyIncome > 0 && (monthlyIncome - monthlyExpense) / monthlyIncome > 0.3 ? 'up' : 'down'}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Monthly Trend */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-medium text-foreground mb-3">收支趋势</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#f1f5f9' }}
                  formatter={(value: number) => fmtCurrency(value)}
                />
                <Area type="monotone" dataKey="income" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <Area type="monotone" dataKey="expense" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-medium text-foreground mb-3">支出分类</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#f1f5f9' }}
                  formatter={(value: number) => [fmtCurrency(value), '金额']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Middle Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Transactions */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">最近交易</h3>
              <a href="/transactions" className="text-xs text-primary hover:text-primary/80 transition-colors">
                查看全部
              </a>
            </div>
            <div className="space-y-2">
              {recentTransactions.length > 0 ? (
                recentTransactions.map(transaction => (
                  <TransactionCard key={transaction.id} transaction={transaction} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                  <div className="text-3xl mb-2">📝</div>
                  <div className="text-sm">暂无交易记录</div>
                  <a href="/transactions" className="text-xs text-primary mt-2 hover:text-primary/80">
                    添加交易
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Goals Progress */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">理财目标</h3>
              <a href="/goals" className="text-xs text-primary hover:text-primary/80 transition-colors">
                管理目标
              </a>
            </div>
            <div className="space-y-3">
              {activeGoals.length > 0 ? (
                activeGoals.slice(0, 3).map(goal => {
                  const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
                  return (
                    <div key={goal.id} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{goal.icon}</span>
                          <span className="text-sm text-foreground">{goal.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{progress.toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${progress}%`, backgroundColor: goal.color }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{fmtCurrency(goal.currentAmount)}</span>
                        <span>{fmtCurrency(goal.targetAmount)}</span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                  <div className="text-3xl mb-2">🎯</div>
                  <div className="text-sm">暂无理财目标</div>
                  <a href="/goals" className="text-xs text-primary mt-2 hover:text-primary/80">
                    创建目标
                  </a>
                </div>
              )}
              {completedGoals.length > 0 && (
                <div className="pt-2 border-t border-border mt-2">
                  <div className="flex items-center gap-2 text-xs text-green-400">
                    <span>✓</span>
                    <span>{completedGoals.length} 个目标已完成</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Assets & Budget Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Assets */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">资产概览</h3>
              <a href="/assets" className="text-xs text-primary hover:text-primary/80 transition-colors">
                查看全部
              </a>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {topAssets.length > 0 ? (
                topAssets.map(asset => (
                  <AssetCard key={asset.id} asset={asset} />
                ))
              ) : (
                <div className="col-span-2 flex flex-col items-center justify-center py-6 text-muted-foreground">
                  <div className="text-3xl mb-2">💳</div>
                  <div className="text-sm">暂无资产记录</div>
                  <a href="/assets" className="text-xs text-primary mt-2 hover:text-primary/80">
                    添加资产
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Budget Overview */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">预算概览</h3>
              <a href="/budget" className="text-xs text-primary hover:text-primary/80 transition-colors">
                调整预算
              </a>
            </div>
            <div className="space-y-3">
              {budgets.length > 0 ? (
                budgets.slice(0, 5).map(budget => {
                  const percentage = Math.min(100, (budget.spent / budget.monthlyLimit) * 100)
                  const isOverBudget = budget.spent > budget.monthlyLimit
                  return (
                    <div key={budget.id} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground">{budget.icon} {budget.category}</span>
                        <span className={isOverBudget ? 'text-rose-400' : 'text-muted-foreground'}>
                          {fmtCurrency(budget.spent)} / {fmtCurrency(budget.monthlyLimit)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
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
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                  <div className="text-3xl mb-2">📊</div>
                  <div className="text-sm">暂无预算设置</div>
                  <a href="/budget" className="text-xs text-primary mt-2 hover:text-primary/80">
                    设置预算
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Net Worth Trend - Optional */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-medium text-foreground mb-3">净资产趋势</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={netWorthTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                itemStyle={{ color: '#f1f5f9' }}
                formatter={(value: number) => fmtCurrency(value)}
              />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </MainLayout>
  )
}
