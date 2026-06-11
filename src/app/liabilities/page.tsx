'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/shared/MainLayout'
import { FormModal } from '@/components/shared/FormModal'
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatCard } from '@/components/shared/StatCard'
import { useApp, type Liability } from '@/contexts/AppContext'
import { Plus, Pencil, Trash2, Check, TrendingDown, Home, Car, CreditCard, Zap, Smartphone } from 'lucide-react'
import { fmtCurrency, fmtCompact, fmtPct, fmtYearMonth, payoffMonths } from '@/lib/formatters'
import { LIABILITY_TYPES, LIABILITY_TYPE_META, payoffProgress } from '@/services/liabilityService'

const TYPE_ICONS: Record<string, React.ReactNode> = {
  房贷: <Home size={18} />, 车贷: <Car size={18} />,
  信用卡: <CreditCard size={18} />, 花呗: <Smartphone size={18} />, 网贷: <Zap size={18} />,
}

const EMPTY_FORM: Omit<Liability, 'id'> = {
  type: '房贷', name: '', totalAmount: 0, amount: 0,
  interestRate: 4.1, monthlyPayment: 0,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '', notes: '',
}

type FormState = {
  type: string; name: string; totalAmount: string; amount: string
  interestRate: string; monthlyPayment: string; startDate: string; endDate: string; notes: string
}

function toFormState(l: Omit<Liability, 'id'>): FormState {
  return {
    type: l.type, name: l.name,
    totalAmount: String(l.totalAmount), amount: String(l.amount),
    interestRate: String(l.interestRate), monthlyPayment: String(l.monthlyPayment),
    startDate: l.startDate, endDate: l.endDate, notes: l.notes,
  }
}

function fromFormState(f: FormState): Omit<Liability, 'id'> {
  return {
    type: f.type as Liability['type'], name: f.name,
    totalAmount: Number(f.totalAmount), amount: Number(f.amount),
    interestRate: Number(f.interestRate), monthlyPayment: Number(f.monthlyPayment),
    startDate: f.startDate, endDate: f.endDate, notes: f.notes,
  }
}

function InputField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all'

export default function LiabilitiesPage() {
  const { liabilities, assets, addLiability, updateLiability, deleteLiability } = useApp()

  const [formOpen, setFormOpen] = useState(false)
  const [editId, setEditId]     = useState<string | null>(null)
  const [form, setForm]         = useState<FormState>(toFormState(EMPTY_FORM))
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [errors, setErrors]     = useState<Partial<Record<keyof FormState, string>>>({})

  // ── Computed ────────────────────────────────────────────────────────────

  const totalLiabilities = liabilities.reduce((s, l) => s + l.amount, 0)
  const totalMonthly     = liabilities.reduce((s, l) => s + l.monthlyPayment, 0)
  const totalAssets      = assets.reduce((s, a) => s + a.value, 0)
  const debtRatio        = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0
  const monthlyIncome    = 35000

  // ── Validation ──────────────────────────────────────────────────────────

  function validate(f: FormState): boolean {
    const errs: typeof errors = {}
    if (!f.name.trim())                          errs.name         = '请输入负债名称'
    if (!Number(f.totalAmount) || Number(f.totalAmount) <= 0) errs.totalAmount = '请输入有效金额'
    if (Number(f.amount) < 0)                    errs.amount       = '剩余金额不能为负'
    if (Number(f.amount) > Number(f.totalAmount)) errs.amount      = '剩余金额不能超过总金额'
    if (!Number(f.monthlyPayment) || Number(f.monthlyPayment) <= 0) errs.monthlyPayment = '请输入月还款'
    if (!f.endDate)                              errs.endDate      = '请选择到期日'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Handlers ────────────────────────────────────────────────────────────

  function openAdd() {
    setForm(toFormState(EMPTY_FORM))
    setEditId(null)
    setErrors({})
    setFormOpen(true)
  }

  function openEdit(l: Liability) {
    setForm(toFormState(l))
    setEditId(l.id)
    setErrors({})
    setFormOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate(form)) return
    if (editId) updateLiability(editId, fromFormState(form))
    else        addLiability(fromFormState(form))
    setFormOpen(false)
  }

  function handleDelete() {
    if (deleteId) deleteLiability(deleteId)
    setDeleteId(null)
  }

  function set(key: keyof FormState, value: string) {
    setForm(f => ({ ...f, [key]: value }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }))
  }

  // ── UI ───────────────────────────────────────────────────────────────────

  const debtRatioColor =
    debtRatio < 50 ? 'text-emerald-400' :
    debtRatio < 70 ? 'text-amber-400'   : 'text-rose-400'

  return (
    <MainLayout title="负债管理" subtitle="追踪所有负债和还款进度">
      <div className="space-y-5">

        {/* ── Summary cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="总负债"
            value={fmtCompact(totalLiabilities)}
            subtitle={`${liabilities.length} 项负债`}
            icon="💳"
            color="#f43f5e"
          />
          <StatCard
            title="月还款"
            value={fmtCurrency(totalMonthly)}
            subtitle={`占月收入 ${fmtPct(totalMonthly / monthlyIncome * 100)}`}
            icon="📅"
            color="#f59e0b"
          />
          <StatCard
            title="负债率"
            value={fmtPct(debtRatio)}
            subtitle={debtRatio < 50 ? '健康' : debtRatio < 70 ? '偏高，注意控制' : '危险，需要减负'}
            icon="📊"
            color={debtRatio < 50 ? '#10b981' : debtRatio < 70 ? '#f59e0b' : '#f43f5e'}
          />
          <StatCard
            title="债务收入比"
            value={fmtPct(totalMonthly / monthlyIncome * 100)}
            subtitle="建议低于 40%"
            icon="💰"
            color={totalMonthly / monthlyIncome < 0.4 ? '#10b981' : '#f59e0b'}
          />
        </div>

        {/* ── Debt ratio bar ────────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm text-foreground flex items-center gap-2">
              <TrendingDown size={15} className="text-primary" />负债率分析
            </h3>
            <span className={`text-xs px-2.5 py-1 rounded-full ${
              debtRatio < 50 ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' :
              debtRatio < 70 ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' :
                               'bg-rose-400/10 text-rose-400 border border-rose-400/20'
            }`}>
              {debtRatio < 50 ? '健康区间' : debtRatio < 70 ? '偏高' : '危险'}
            </span>
          </div>
          <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(debtRatio, 100)}%`, background: 'linear-gradient(to right, #34d399, #f59e0b, #f87171)' }}
            />
            {/* Reference lines */}
            <div className="absolute top-0 h-full border-l border-dashed border-emerald-400/50" style={{ left: '50%' }} />
            <div className="absolute top-0 h-full border-l border-dashed border-rose-400/50" style={{ left: '70%' }} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>0%</span>
            <span className="text-emerald-400">50% 安全线</span>
            <span className="text-amber-400">70% 警戒线</span>
            <span>100%</span>
          </div>
        </div>

        {/* ── Liability list header ─────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm text-foreground">负债明细</h2>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors shadow shadow-primary/20"
          >
            <Plus size={15} />添加负债
          </button>
        </div>

        {/* ── Liability cards ────────────────────────────────────────────── */}
        {liabilities.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl">
            <EmptyState
              icon="💳"
              title="暂无负债记录"
              description="添加房贷、车贷、信用卡等负债，追踪还款进度"
              action={{ label: '添加负债', onClick: openAdd }}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {liabilities.map(l => {
              const meta     = LIABILITY_TYPE_META[l.type] ?? { icon: '💳', color: '#95a5a6' }
              const progress = payoffProgress(l)
              const months   = payoffMonths(l.amount, l.interestRate, l.monthlyPayment)
              const years    = Math.floor(months / 12)
              const remM     = months % 12
              const payoffStr = years > 0 ? `${years}年${remM > 0 ? remM + '个月' : ''}` : `${months}个月`

              return (
                <div key={l.id} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/20 transition-colors group">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${meta.color}20`, color: meta.color }}
                    >
                      {TYPE_ICONS[l.type]}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                        <div>
                          <h4 className="text-sm text-foreground">{l.name}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {l.type} · 年利率 {l.interestRate}%
                            {l.notes && ` · ${l.notes}`}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg text-rose-400">{fmtCurrency(l.amount)}</div>
                          <div className="text-xs text-muted-foreground">剩余 / 总额 {fmtCompact(l.totalAmount)}</div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                          <span>还款进度 {fmtPct(progress)}</span>
                          <span>预计 {payoffStr} 还清</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress}%`, background: meta.color + 'cc' }}
                          />
                        </div>
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border">
                        <div>
                          <div className="text-xs text-muted-foreground">月还款</div>
                          <div className="text-sm text-foreground mt-0.5">{fmtCurrency(l.monthlyPayment)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">已还</div>
                          <div className="text-sm text-emerald-400 mt-0.5">{fmtCompact(l.totalAmount - l.amount)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">开始日期</div>
                          <div className="text-sm text-foreground mt-0.5">{fmtYearMonth(l.startDate)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">到期日期</div>
                          <div className="text-sm text-foreground mt-0.5">{fmtYearMonth(l.endDate)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => openEdit(l)}
                        className="w-8 h-8 rounded-xl hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="编辑"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteId(l.id)}
                        className="w-8 h-8 rounded-xl hover:bg-rose-400/15 flex items-center justify-center text-muted-foreground hover:text-rose-400 transition-colors"
                        aria-label="删除"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Monthly breakdown ─────────────────────────────────────────── */}
        {liabilities.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-sm text-foreground mb-4">月还款明细</h3>
            <div className="space-y-3">
              {liabilities.map(l => (
                <div key={l.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">{l.name}</span>
                      <span className="text-foreground">{fmtCurrency(l.monthlyPayment)}</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/60 rounded-full"
                        style={{ width: `${(l.monthlyPayment / totalMonthly * 100).toFixed(0)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground w-10 text-right">
                    {fmtPct(l.monthlyPayment / totalMonthly * 100, 0)}
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-3 border-t border-border">
                <span className="text-sm text-foreground">合计月还款</span>
                <span className="text-sm text-amber-400">{fmtCurrency(totalMonthly)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Add / Edit form modal ─────────────────────────────────────── */}
        <FormModal
          open={formOpen}
          onClose={() => setFormOpen(false)}
          title={editId ? '编辑负债' : '添加负债'}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Type picker */}
            <InputField label="负债类型">
              <div className="flex flex-wrap gap-2">
                {LIABILITY_TYPES.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set('type', t)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all border ${
                      form.type === t
                        ? 'bg-primary/20 text-primary border-primary/30'
                        : 'bg-secondary text-muted-foreground border-transparent hover:border-border'
                    }`}
                  >
                    {LIABILITY_TYPE_META[t]?.icon ?? '💳'} {t}
                  </button>
                ))}
              </div>
            </InputField>

            {/* Name */}
            <InputField label="负债名称">
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="例：招商银行房贷"
                className={inputCls}
                required
              />
              {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
            </InputField>

            {/* Amounts */}
            <div className="grid grid-cols-2 gap-3">
              <InputField label="总金额（元）">
                <input type="number" value={form.totalAmount} onChange={e => set('totalAmount', e.target.value)} placeholder="0" className={inputCls} min="0" />
                {errors.totalAmount && <p className="text-xs text-rose-400 mt-1">{errors.totalAmount}</p>}
              </InputField>
              <InputField label="剩余金额（元）">
                <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0" className={inputCls} min="0" />
                {errors.amount && <p className="text-xs text-rose-400 mt-1">{errors.amount}</p>}
              </InputField>
            </div>

            {/* Rate + Monthly */}
            <div className="grid grid-cols-2 gap-3">
              <InputField label="年利率（%）">
                <input type="number" value={form.interestRate} onChange={e => set('interestRate', e.target.value)} placeholder="4.1" step="0.1" className={inputCls} min="0" />
              </InputField>
              <InputField label="月还款额（元）">
                <input type="number" value={form.monthlyPayment} onChange={e => set('monthlyPayment', e.target.value)} placeholder="0" className={inputCls} min="0" />
                {errors.monthlyPayment && <p className="text-xs text-rose-400 mt-1">{errors.monthlyPayment}</p>}
              </InputField>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <InputField label="开始日期">
                <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className={inputCls} />
              </InputField>
              <InputField label="到期日期">
                <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} className={inputCls} />
                {errors.endDate && <p className="text-xs text-rose-400 mt-1">{errors.endDate}</p>}
              </InputField>
            </div>

            {/* Notes */}
            <InputField label="备注（可选）">
              <textarea
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="例：每月15日自动还款"
                rows={2}
                className={`${inputCls} resize-none`}
              />
            </InputField>

            {/* Preview */}
            {Number(form.totalAmount) > 0 && Number(form.amount) >= 0 && (
              <div className="bg-secondary rounded-xl p-3 text-xs text-muted-foreground">
                <div className="flex justify-between mb-1">
                  <span>还款进度</span>
                  <span className="text-foreground">
                    {fmtPct(Math.max(0, (Number(form.totalAmount) - Number(form.amount)) / Number(form.totalAmount) * 100))}
                  </span>
                </div>
                <div className="h-1.5 bg-background/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/60 rounded-full"
                    style={{ width: `${Math.max(0, Math.min(100, (Number(form.totalAmount) - Number(form.amount)) / Number(form.totalAmount) * 100))}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
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
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow shadow-primary/20"
              >
                <Check size={15} />
                {editId ? '保存修改' : '添加负债'}
              </button>
            </div>
          </form>
        </FormModal>

        {/* ── Delete confirm ────────────────────────────────────────────── */}
        <DeleteConfirmDialog
          open={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="删除负债记录"
          description={`确认删除「${liabilities.find(l => l.id === deleteId)?.name ?? ''}」？此操作不可撤销。`}
        />
      </div>
    </MainLayout>
  )
}
