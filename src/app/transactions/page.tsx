'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/shared/MainLayout'
import { FormModal } from '@/components/shared/FormModal'
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { useApp, type Transaction } from '@/contexts/AppContext'
import { Plus, Pencil, Trash2, Search, Filter } from 'lucide-react'
import { fmtCurrency, fmtYearMonth } from '@/lib/formatters'

export default function TransactionsPage() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useApp()
  const [formOpen, setFormOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'transfer'>('all')

  const EMPTY_FORM: Omit<Transaction, 'id'> = {
    type: 'expense',
    category: '餐饮',
    amount: 0,
    accountId: 'a1',
    userId: 'u1',
    note: '',
    date: new Date().toISOString().slice(0, 10),
  }

  const [form, setForm] = useState<Omit<Transaction, 'id'>>(EMPTY_FORM)

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || t.type === filterType
    return matchesSearch && matchesFilter
  })

  function openAdd() {
    setForm(EMPTY_FORM)
    setEditId(null)
    setFormOpen(true)
  }

  function openEdit(t: Transaction) {
    setForm(t)
    setEditId(t.id)
    setFormOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editId) updateTransaction(editId, form)
    else addTransaction(form)
    setFormOpen(false)
  }

  function handleDelete() {
    if (deleteId) deleteTransaction(deleteId)
    setDeleteId(null)
  }

  const transaction = transactions.find(t => t.id === deleteId)

  return (
    <MainLayout title="交易记录" subtitle="管理所有收支记录">
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索交易..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'income', 'expense', 'transfer'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  filterType === type
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {type === 'all' ? '全部' : type === 'income' ? '收入' : type === 'expense' ? '支出' : '转账'}
              </button>
            ))}
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors shadow shadow-primary/20"
          >
            <Plus size={16} />
            添加交易
          </button>
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl">
            <EmptyState
              icon="📝"
              title="暂无交易记录"
              description="添加您的第一笔收支记录开始追踪财务"
              action={{ label: '添加交易', onClick: openAdd }}
            />
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="divide-y divide-border">
              {filteredTransactions.map(t => (
                <div key={t.id} className="p-4 hover:bg-secondary/50 transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                        t.type === 'income' ? 'bg-emerald-400/10' : t.type === 'expense' ? 'bg-rose-400/10' : 'bg-blue-400/10'
                      }`}>
                        {t.type === 'income' ? '💰' : t.type === 'expense' ? '💸' : '🔄'}
                      </div>
                      <div>
                        <div className="text-sm text-foreground">{t.note || t.category}</div>
                        <div className="text-xs text-muted-foreground">{t.category} · {fmtYearMonth(t.date)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`text-lg font-medium ${t.type === 'income' ? 'text-emerald-400' : t.type === 'expense' ? 'text-rose-400' : 'text-blue-400'}`}>
                        {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}{fmtCurrency(t.amount)}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(t)}
                          className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(t.id)}
                          className="w-8 h-8 rounded-lg hover:bg-rose-400/15 flex items-center justify-center text-muted-foreground hover:text-rose-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        <FormModal
          open={formOpen}
          onClose={() => setFormOpen(false)}
          title={editId ? '编辑交易' : '添加交易'}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-2">交易类型</label>
              <div className="flex gap-2">
                {(['income', 'expense', 'transfer'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm({ ...form, type })}
                    className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                      form.type === type
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {type === 'income' ? '收入' : type === 'expense' ? '支出' : '转账'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-2">金额</label>
              <input
                type="number"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: Number(e.target.value) })}
                placeholder="0.00"
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/60 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-2">分类</label>
              <input
                type="text"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                placeholder="餐饮"
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/60 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-2">备注</label>
              <input
                type="text"
                value={form.note}
                onChange={e => setForm({ ...form, note: e.target.value })}
                placeholder="家庭晚餐"
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-2">日期</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/60 transition-colors"
                required
              />
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
                {editId ? '保存修改' : '添加交易'}
              </button>
            </div>
          </form>
        </FormModal>

        {/* Delete Confirm */}
        <DeleteConfirmDialog
          open={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="删除交易记录"
          description={`确认删除「${transaction?.note || transaction?.category}」？此操作不可撤销。`}
        />
      </div>
    </MainLayout>
  )
}
