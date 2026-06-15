'use client'

import { useState, useCallback } from 'react'
import { MainLayout } from '@/components/shared/MainLayout'
import { FormModal } from '@/components/shared/FormModal'
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { useApp, type Transaction } from '@/contexts/AppContext'
import { Plus, Pencil, Trash2, Search, Filter, Download, Upload, X, CheckCircle, XCircle } from 'lucide-react'
import { fmtCurrency, fmtYearMonth } from '@/lib/formatters'
import { exportTransactions, importTransactions, type ImportResult } from '@/services/csvService'

export default function TransactionsPage() {
  const { transactions, accounts, addTransaction, updateTransaction, deleteTransaction } = useApp()
  const [formOpen, setFormOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'transfer'>('all')
  const [importAreaOpen, setImportAreaOpen] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const defaultAccountId = accounts.length > 0 ? accounts[0].id : 'acc1'
  
  const EMPTY_FORM: Omit<Transaction, 'id'> = {
    type: 'expense',
    category: '餐饮',
    amount: 0,
    accountId: defaultAccountId,
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
    setForm({ ...EMPTY_FORM, accountId: accounts.length > 0 ? accounts[0].id : 'acc1' })
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

  function handleExport() {
    exportTransactions(transactions)
  }

  const handleFileDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    await processFiles(e.dataTransfer.files)
  }, [])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processFiles(e.target.files)
    }
  }, [])

  const processFiles = async (files: FileList) => {
    const file = files[0]
    if (!file || !file.name.endsWith('.csv')) {
      setImportResult({ success: 0, failed: 0, errors: ['请选择CSV文件'] })
      return
    }

    setIsImporting(true)
    try {
      const content = await file.text()
      const result = await importTransactions(content)
      setImportResult(result)
    } catch (error) {
      setImportResult({ success: 0, failed: 0, errors: [error instanceof Error ? error.message : '导入失败'] })
    } finally {
      setIsImporting(false)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const clearImportResult = () => {
    setImportResult(null)
  }

  const transaction = transactions.find(t => t.id === deleteId)

  return (
    <MainLayout title="交易记录" subtitle="管理所有收支记录">
      <div className="space-y-6">
        {/* 工具栏 */}
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
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-foreground text-sm hover:bg-secondary/80 transition-colors"
            >
              <Download size={16} />
              导出CSV
            </button>
            <button
              onClick={() => {
                setImportAreaOpen(true)
                setImportResult(null)
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors shadow shadow-primary/20"
            >
              <Upload size={16} />
              导入CSV
            </button>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors shadow shadow-primary/20"
            >
              <Plus size={16} />
              添加交易
            </button>
          </div>
        </div>

        {/* 导入区域 */}
        {importAreaOpen && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-6">
              {!importResult ? (
                <div
                  onDrop={handleFileDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                    isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="mb-4">
                    <Upload size={48} className="mx-auto text-muted-foreground" />
                  </div>
                  <p className="text-sm text-foreground mb-2">拖拽 CSV 文件到此处上传</p>
                  <p className="text-xs text-muted-foreground mb-4">或</p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-sm text-foreground hover:bg-secondary/80 cursor-pointer">
                    <Upload size={14} />
                    选择文件
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                  {isImporting && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      导入中...
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">CSV格式要求：日期,类型(income/expense/transfer),分类,金额,账户ID,备注</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-foreground">导入结果</h3>
                    <button
                      onClick={() => setImportAreaOpen(false)}
                      className="p-1 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <X size={16} className="text-muted-foreground" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-500/10 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <CheckCircle size={24} className="text-emerald-500" />
                      </div>
                      <div className="text-2xl font-semibold text-emerald-500">{importResult.success}</div>
                      <div className="text-xs text-muted-foreground">成功导入</div>
                    </div>
                    <div className="bg-rose-500/10 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <XCircle size={24} className="text-rose-500" />
                      </div>
                      <div className="text-2xl font-semibold text-rose-500">{importResult.failed}</div>
                      <div className="text-xs text-muted-foreground">导入失败</div>
                    </div>
                  </div>
                  {importResult.errors.length > 0 && (
                    <div className="bg-rose-500/5 rounded-xl p-4">
                      <p className="text-xs text-rose-500 font-medium mb-2">错误详情：</p>
                      <ul className="text-xs text-muted-foreground space-y-1 max-h-40 overflow-y-auto">
                        {importResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={clearImportResult}
                      className="flex-1 py-2.5 rounded-xl bg-secondary text-muted-foreground text-sm hover:text-foreground transition-colors"
                    >
                      继续导入
                    </button>
                    <button
                      onClick={() => setImportAreaOpen(false)}
                      className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
                    >
                      完成
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 交易列表 */}
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
              {filteredTransactions.map(t => {
                const account = accounts.find(a => a.id === t.accountId)
                return (
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
                          <div className="text-xs text-muted-foreground">
                            {t.category} · {account?.name || '未知账户'} · {fmtYearMonth(t.date)}
                          </div>
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
                )
              })}
            </div>
          </div>
        )}

        {/* 添加/编辑交易弹窗 */}
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
              <label className="block text-xs text-muted-foreground mb-2">账户</label>
              <select
                value={form.accountId}
                onChange={e => setForm({ ...form, accountId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/60 transition-colors cursor-pointer"
              >
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.icon} {account.name} ({fmtCurrency(account.balance)})
                  </option>
                ))}
              </select>
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

        {/* 删除确认弹窗 */}
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
