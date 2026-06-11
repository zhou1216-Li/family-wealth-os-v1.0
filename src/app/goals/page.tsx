'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/shared/MainLayout'
import { FormModal } from '@/components/shared/FormModal'
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatCard } from '@/components/shared/StatCard'
import { useApp, type Goal } from '@/contexts/AppContext'
import { Plus, Pencil, Trash2, Target } from 'lucide-react'
import { fmtCurrency, fmtCompact, fmtPct, fmtYearMonth } from '@/lib/formatters'
import { calculateProgress } from '@/services/goalService'

export default function GoalsPage() {
  const { goals, addGoal, updateGoal, deleteGoal } = useApp()
  const [formOpen, setFormOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const EMPTY_FORM: Omit<Goal, 'id'> = {
    name: '',
    targetAmount: 0,
    currentAmount: 0,
    targetDate: '',
    monthlyContribution: 0,
    icon: '🎯',
    color: '#3b82f6',
  }

  const [form, setForm] = useState<Omit<Goal, 'id'>>(EMPTY_FORM)

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0)
  const totalCurrent = goals.reduce((sum, g) => sum + g.currentAmount, 0)
  const totalRemaining = totalTarget - totalCurrent
  const avgProgress = goals.length > 0 ? goals.reduce((sum, g) => sum + calculateProgress(g), 0) / goals.length : 0

  function openAdd() {
    setForm(EMPTY_FORM)
    setEditId(null)
    setFormOpen(true)
  }

  function openEdit(g: Goal) {
    setForm(g)
    setEditId(g.id)
    setFormOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editId) updateGoal(editId, form)
    else addGoal(form)
    setFormOpen(false)
  }

  function handleDelete() {
    if (deleteId) deleteGoal(deleteId)
    setDeleteId(null)
  }

  const goal = goals.find(g => g.id === deleteId)

  return (
    <MainLayout title="财务目标" subtitle="追踪和实现您的财务目标">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="目标总数"
            value={goals.length}
            subtitle="个财务目标"
            icon="🎯"
            color="#3b82f6"
          />
          <StatCard
            title="目标总额"
            value={fmtCompact(totalTarget)}
            subtitle={`已存 ${fmtCompact(totalCurrent)}`}
            icon="💰"
            color="#10b981"
          />
          <StatCard
            title="剩余金额"
            value={fmtCompact(totalRemaining)}
            subtitle="还需达成"
            icon="📊"
            color="#f59e0b"
          />
          <StatCard
            title="平均进度"
            value={fmtPct(avgProgress)}
            subtitle="整体完成度"
            icon="📈"
            color="#8b5cf6"
          />
        </div>

        {/* Goals List */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm text-foreground">目标明细</h2>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors shadow shadow-primary/20"
          >
            <Plus size={15} />添加目标
          </button>
        </div>

        {goals.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl">
            <EmptyState
              icon="🎯"
              title="暂无财务目标"
              description="设置您的财务目标，如教育基金、旅游基金等"
              action={{ label: '添加目标', onClick: openAdd }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map(g => {
              const progress = calculateProgress(g)
              const remaining = g.targetAmount - g.currentAmount
              const monthsRemaining = Math.max(0, Math.ceil((new Date(g.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)))
              const onTrack = g.currentAmount >= (g.targetAmount * (1 - monthsRemaining / 36)) // Simple on-track calculation

              return (
                <div key={g.id} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/20 transition-colors group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${g.color}20` }}>
                      {g.icon}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(g)}
                        className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteId(g.id)}
                        className="w-8 h-8 rounded-lg hover:bg-rose-400/15 flex items-center justify-center text-muted-foreground hover:text-rose-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm text-foreground mb-2">{g.name}</h4>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-muted-foreground">进度</span>
                      <span className="text-foreground">{fmtPct(progress)}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%`, backgroundColor: g.color }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <div className="text-xs text-muted-foreground">目标金额</div>
                      <div className="text-sm text-foreground mt-0.5">{fmtCurrency(g.targetAmount)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">已存金额</div>
                      <div className="text-sm text-emerald-400 mt-0.5">{fmtCurrency(g.currentAmount)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">剩余金额</div>
                      <div className="text-sm text-foreground mt-0.5">{fmtCurrency(remaining)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">月存入</div>
                      <div className="text-sm text-foreground mt-0.5">{fmtCurrency(g.monthlyContribution)}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="text-xs text-muted-foreground">
                      目标日期: {fmtYearMonth(g.targetDate)}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      onTrack ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' : 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                    }`}>
                      {onTrack ? '按计划进行' : '需要加速'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Add/Edit Modal */}
        <FormModal
          open={formOpen}
          onClose={() => setFormOpen(false)}
          title={editId ? '编辑目标' : '添加目标'}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-2">目标名称</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="孩子大学教育基金"
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/60 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-2">目标金额</label>
              <input
                type="number"
                value={form.targetAmount}
                onChange={e => setForm({ ...form, targetAmount: Number(e.target.value) })}
                placeholder="500000"
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/60 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-2">当前金额</label>
              <input
                type="number"
                value={form.currentAmount}
                onChange={e => setForm({ ...form, currentAmount: Number(e.target.value) })}
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/60 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-2">目标日期</label>
              <input
                type="date"
                value={form.targetDate}
                onChange={e => setForm({ ...form, targetDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/60 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-2">月存入金额</label>
              <input
                type="number"
                value={form.monthlyContribution}
                onChange={e => setForm({ ...form, monthlyContribution: Number(e.target.value) })}
                placeholder="3500"
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/60 transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-2">图标</label>
                <input
                  type="text"
                  value={form.icon}
                  onChange={e => setForm({ ...form, icon: e.target.value })}
                  placeholder="🎯"
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-2">颜色</label>
                <input
                  type="color"
                  value={form.color}
                  onChange={e => setForm({ ...form, color: e.target.value })}
                  className="w-full h-10 rounded-xl bg-secondary border border-border cursor-pointer"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-secondary text-muted-foreground text-sm hover:text-foreground transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors shadow shadow-primary/20"
              >
                {editId ? '保存修改' : '添加目标'}
              </button>
            </div>
          </form>
        </FormModal>

        {/* Delete Confirm */}
        <DeleteConfirmDialog
          open={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="删除财务目标"
          description={`确认删除「${goal?.name}」？此操作不可撤销。`}
        />
      </div>
    </MainLayout>
  )
}
