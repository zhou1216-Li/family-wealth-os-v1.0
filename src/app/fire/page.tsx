'use client'

import { MainLayout } from '@/components/shared/MainLayout'
import { StatCard } from '@/components/shared/StatCard'
import { useApp, monthlyData } from '@/contexts/AppContext'
import { fmtCurrency, fmtCompact, fmtPct } from '@/lib/formatters'
import { Flame, TrendingUp, Target, Calculator } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

export default function FirePage() {
  const { assets, liabilities, transactions, goals } = useApp()

  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0)
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0)
  const netWorth = totalAssets - totalLiabilities

  const annualIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) * 12
  const annualExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) * 12
  const annualSavings = annualIncome - annualExpense

  // FIRE calculations (4% rule)
  const fireNumber = annualExpense * 25
  const fireProgress = (netWorth / fireNumber) * 100
  const yearsToFire = fireNumber > netWorth ? Math.ceil((fireNumber - netWorth) / annualSavings) : 0

  // Projected net worth growth
  const projectedGrowth = Array.from({ length: 20 }, (_, i) => {
    const year = i + 1
    const growthRate = 0.07 // 7% annual return
    const projectedNetWorth = netWorth * Math.pow(1 + growthRate, year) + annualSavings * ((Math.pow(1 + growthRate, year) - 1) / growthRate)
    return {
      year: `第${year}年`,
      value: projectedNetWorth,
      fireNumber: fireNumber,
    }
  })

  return (
    <MainLayout title="FIRE 计划" subtitle="财务独立，提前退休">
      <div className="space-y-6">
        {/* FIRE Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="FIRE 目标金额"
            value={fmtCompact(fireNumber)}
            subtitle="25倍年支出"
            icon="🎯"
            color="#3b82f6"
          />
          <StatCard
            title="当前净资产"
            value={fmtCompact(netWorth)}
            subtitle={`完成度 ${fmtPct(fireProgress)}`}
            icon="💰"
            color="#10b981"
          />
          <StatCard
            title="年储蓄"
            value={fmtCurrency(annualSavings)}
            subtitle={`储蓄率 ${fmtPct((annualSavings / annualIncome) * 100)}`}
            icon="📈"
            color="#f59e0b"
          />
          <StatCard
            title="预计 FIRE 年限"
            value={yearsToFire > 0 ? `${yearsToFire}年` : '已达成'}
            subtitle="按当前储蓄率"
            icon="🔥"
            color="#8b5cf6"
          />
        </div>

        {/* FIRE Progress */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm text-foreground flex items-center gap-2">
              <Flame size={15} className="text-primary" />FIRE 进度
            </h3>
            <span className={`text-xs px-2.5 py-1 rounded-full ${
              fireProgress >= 100 ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' :
              fireProgress >= 50 ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' :
              'bg-blue-400/10 text-blue-400 border border-blue-400/20'
            }`}>
              {fireProgress >= 100 ? '已达成 FIRE' : fireProgress >= 50 ? '进度过半' : '起步阶段'}
            </span>
          </div>
          <div className="relative h-4 bg-secondary rounded-full overflow-hidden mb-4">
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"
              style={{ width: `${Math.min(fireProgress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>25% - 财务安全</span>
            <span>50% - 半 FIRE</span>
            <span>75% - 接近 FIRE</span>
            <span>100% - 完全 FIRE</span>
          </div>
        </div>

        {/* Projected Growth Chart */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-sm text-foreground mb-4">净资产增长预测</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={projectedGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => fmtCompact(value)} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                itemStyle={{ color: '#f1f5f9' }}
                formatter={(value: number) => fmtCurrency(value)}
              />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="预测净资产" />
              <Line type="monotone" dataKey="fireNumber" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="FIRE 目标" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* FIRE Strategy */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-sm text-foreground mb-4 flex items-center gap-2">
              <TrendingUp size={15} className="text-primary" />加速 FIRE 策略
            </h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-emerald-400/10 border border-emerald-400/20">
                <p className="text-sm text-foreground font-medium">提高储蓄率</p>
                <p className="text-xs text-muted-foreground mt-1">
                  当前储蓄率 {fmtPct((annualSavings / annualIncome) * 100)}，提高到 50% 可大幅缩短 FIRE 年限
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-400/10 border border-blue-400/20">
                <p className="text-sm text-foreground font-medium">增加投资收益</p>
                <p className="text-xs text-muted-foreground mt-1">
                  优化资产配置，提高投资组合回报率
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-400/10 border border-purple-400/20">
                <p className="text-sm text-foreground font-medium">降低生活成本</p>
                <p className="text-xs text-muted-foreground mt-1">
                  减少 FIRE 目标金额，加快达成速度
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-sm text-foreground mb-4 flex items-center gap-2">
              <Calculator size={15} className="text-primary" />FIRE 计算器
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-muted-foreground">年支出</span>
                  <span className="text-foreground">{fmtCurrency(annualExpense)}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary/60 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-muted-foreground">25倍 (4%提取率)</span>
                  <span className="text-foreground">{fmtCurrency(fireNumber)}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400/60 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-muted-foreground">当前进度</span>
                  <span className="text-foreground">{fmtPct(fireProgress)}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400/60 rounded-full" style={{ width: `${Math.min(fireProgress, 100)}%` }} />
                </div>
              </div>
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  基于 4% 安全提取率，您需要 {fmtCurrency(fireNumber)} 才能实现 FIRE
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FIRE Milestones */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-sm text-foreground mb-4 flex items-center gap-2">
            <Target size={15} className="text-primary" />FIRE 里程碑
          </h3>
          <div className="space-y-3">
            {[
              { name: '财务安全', amount: fireNumber * 0.25, description: '可应对紧急情况' },
              { name: '半 FIRE', amount: fireNumber * 0.5, description: '可选择兼职或降低工作强度' },
              { name: '接近 FIRE', amount: fireNumber * 0.75, description: '基本实现财务自由' },
              { name: '完全 FIRE', amount: fireNumber, description: '可完全退休' },
            ].map((milestone, index) => {
              const progress = (netWorth / milestone.amount) * 100
              const achieved = netWorth >= milestone.amount
              return (
                <div key={index} className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${achieved ? 'bg-emerald-400/20 text-emerald-400' : 'bg-secondary text-muted-foreground'}`}>
                        {achieved ? '✓' : (index + 1)}
                      </div>
                      <div>
                        <h4 className="text-sm text-foreground">{milestone.name}</h4>
                        <p className="text-xs text-muted-foreground">{milestone.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${achieved ? 'text-emerald-400' : 'text-foreground'}`}>
                        {fmtCurrency(milestone.amount)}
                      </div>
                      <div className="text-xs text-muted-foreground">{fmtPct(progress)}</div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-background rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${achieved ? 'bg-emerald-400' : 'bg-primary/60'}`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
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
