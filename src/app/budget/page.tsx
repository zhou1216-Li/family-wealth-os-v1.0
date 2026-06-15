'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/shared/MainLayout'
import { StatCard } from '@/components/shared/StatCard'
import { useApp } from '@/contexts/AppContext'
import { fmtCurrency, fmtPct } from '@/lib/formatters'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Pencil, X, Check, Plus } from 'lucide-react'
import type { Budget } from '@/types'

interface EditFormState {
  id: string | null
  monthlyLimit: number
}

export default function BudgetPage() {
  const { budgets, updateBudget, addBudget, deleteBudget } = useApp()
  const [editForm, setEditForm] = useState<EditFormState>({ id: null, monthlyLimit: 0 })
  const [showAddForm, setShowAddForm] = useState(false)
  const [newBudget, setNewBudget] = useState({
    category: '',
    monthlyLimit: 0,
    icon: '💰',
    color: '#3b82f6',
  })

  const totalBudget = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
  const remainingBudget = totalBudget - totalSpent

  const budgetData = budgets.map(b => ({
    name: b.category,
    budget: b.monthlyLimit,
    spent: b.spent,
    remaining: b.monthlyLimit - b.spent,
    percentage: Math.min(100, (b.spent / b.monthlyLimit) * 100),
    color: b.color,
    icon: b.icon,
  }))

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

  const handleEditStart = (budget: Budget) => {
    setEditForm({ id: budget.id, monthlyLimit: budget.monthlyLimit })
  }

  const handleEditCancel = () => {
    setEditForm({ id: null, monthlyLimit: 0 })
  }

  const handleEditSave = async () => {
    if (editForm.id) {
      await updateBudget(editForm.id, { monthlyLimit: editForm.monthlyLimit })
      setEditForm({ id: null, monthlyLimit: 0 })
    }
  }

  const handleAddBudget = async () => {
    if (newBudget.category && newBudget.monthlyLimit > 0) {
      await addBudget({
        category: newBudget.category,
        monthlyLimit: newBudget.monthlyLimit,
        spent: 0,
        icon: newBudget.icon,
        color: newBudget.color,
      })
      setNewBudget({ category: '', monthlyLimit: 0, icon: '💰', color: '#3b82f6' })
      setShowAddForm(false)
    }
  }

  return (
    <MainLayout title="预算管理" subtitle="追踪和控制每月支出">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="总预算"
            value={fmtCurrency(totalBudget)}
            subtitle={`${budgets.length} 个分类`}
            icon="💰"
            color="#3b82f6"
          />
          <StatCard
            title="已支出"
            value={fmtCurrency(totalSpent)}
            subtitle={`占比 ${fmtPct((totalSpent / totalBudget) * 100)}`}
            icon="💸"
            color="#f59e0b"
          />
          <StatCard
            title="剩余预算"
            value={fmtCurrency(remainingBudget)}
            subtitle="本月可用"
            icon="📊"
            color={remainingBudget > 0 ? '#10b981' : '#ef4444'}
          />
          <StatCard
            title="预算使用率"
            value={fmtPct((totalSpent / totalBudget) * 100)}
            subtitle="目标: 80%"
            icon="🎯"
            color={(totalSpent / totalBudget) * 100 < 80 ? '#10b981' : '#f59e0b'}
          />
        </div>

        {/* Budget Overview Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-sm text-foreground mb-4">预算分布</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={budgetData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="budget"
                >
                  {budgetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
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
            <h3 className="text-sm text-foreground mb-4">预算 vs 实际支出</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#f1f5f9' }}
                  formatter={(value: number) => fmtCurrency(value)}
                />
                <Bar dataKey="budget" fill="#3b82f6" name="预算" />
                <Bar dataKey="spent" fill="#f59e0b" name="实际" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget Details */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm text-foreground">预算明细</h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus size={14} />
              添加预算
            </button>
          </div>

          {/* Add Budget Form */}
          {showAddForm && (
            <div className="mb-4 p-4 rounded-xl bg-secondary/50 border border-border">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="分类名称"
                  value={newBudget.category}
                  onChange={e => setNewBudget({ ...newBudget, category: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
                />
                <input
                  type="number"
                  placeholder="月度限额"
                  value={newBudget.monthlyLimit || ''}
                  onChange={e => setNewBudget({ ...newBudget, monthlyLimit: Number(e.target.value) })}
                  className="px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddBudget}
                    className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {budgets.map(budget => {
              const percentage = Math.min(100, (budget.spent / budget.monthlyLimit) * 100)
              const isOverBudget = budget.spent > budget.monthlyLimit
              const remaining = budget.monthlyLimit - budget.spent
              const isEditing = editForm.id === budget.id

              return (
                <div key={budget.id} className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ background: `${budget.color}20` }}>
                        {budget.icon}
                      </div>
                      <div>
                        <h4 className="text-sm text-foreground">{budget.category}</h4>
                        {isEditing ? (
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="number"
                              value={editForm.monthlyLimit}
                              onChange={e => setEditForm({ ...editForm, monthlyLimit: Number(e.target.value) })}
                              className="w-28 px-2 py-1 rounded bg-background border border-border text-sm text-foreground"
                              autoFocus
                            />
                            <button
                              onClick={handleEditSave}
                              className="p-1 rounded hover:bg-emerald-500/20 text-emerald-500"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={handleEditCancel}
                              className="p-1 rounded hover:bg-rose-500/20 text-rose-500"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            {fmtCurrency(budget.spent)} / {fmtCurrency(budget.monthlyLimit)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isEditing && (
                        <button
                          onClick={() => handleEditStart(budget)}
                          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                      <div className="text-right">
                        <div className={`text-lg font-semibold ${isOverBudget ? 'text-rose-400' : 'text-foreground'}`}>
                          {fmtPct(percentage)}
                        </div>
                        <div className={`text-xs ${isOverBudget ? 'text-rose-400' : 'text-muted-foreground'}`}>
                          {isOverBudget ? '超支' : '剩余'} {fmtCurrency(Math.abs(remaining))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
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

        {/* Budget Tips */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-sm text-foreground mb-4">预算建议</h3>
          <div className="space-y-3">
            {budgets.filter(b => b.spent > b.monthlyLimit).length > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-rose-400/10 border border-rose-400/20">
                <span className="text-rose-400 mt-0.5">⚠️</span>
                <div>
                  <p className="text-sm text-foreground font-medium">超支警告</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {budgets.filter(b => b.spent > b.monthlyLimit).map(b => b.category).join('、')} 分类已超出预算
                  </p>
                </div>
              </div>
            )}
            {budgets.filter(b => (b.spent / b.monthlyLimit) > 0.8 && b.spent <= b.monthlyLimit).length > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-400/10 border border-amber-400/20">
                <span className="text-amber-400 mt-0.5">💡</span>
                <div>
                  <p className="text-sm text-foreground font-medium">接近预算上限</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {budgets.filter(b => (b.spent / b.monthlyLimit) > 0.8 && b.spent <= b.monthlyLimit).map(b => b.category).join('、')} 分类已使用超过80%预算
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-400/10 border border-emerald-400/20">
              <span className="text-emerald-400 mt-0.5">✓</span>
              <div>
                <p className="text-sm text-foreground font-medium">预算健康</p>
                <p className="text-xs text-muted-foreground mt-1">
                  整体预算使用率 {fmtPct((totalSpent / totalBudget) * 100)}，保持在合理范围内
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
