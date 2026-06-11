'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/shared/MainLayout'
import { FormModal } from '@/components/shared/FormModal'
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatCard } from '@/components/shared/StatCard'
import { useApp, type Asset } from '@/contexts/AppContext'
import { Plus, Pencil, Trash2, TrendingUp } from 'lucide-react'
import { fmtCurrency, fmtCompact } from '@/lib/formatters'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

export default function AssetsPage() {
  const { assets, addAsset, updateAsset, deleteAsset } = useApp()
  const [formOpen, setFormOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const EMPTY_FORM: Omit<Asset, 'id'> = {
    type: '银行卡',
    name: '',
    value: 0,
    currency: 'CNY',
    icon: '🏦',
    color: '#3b82f6',
  }

  const [form, setForm] = useState<Omit<Asset, 'id'>>(EMPTY_FORM)

  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0)
  const ASSET_TYPES = ['银行卡', '现金', '微信', '支付宝', '股票', '基金', '黄金', '房产', '车辆', '其他'] as const

  const assetDistribution = ASSET_TYPES.map(type => ({
    name: type,
    value: assets.filter(a => a.type === type).reduce((sum, a) => sum + a.value, 0),
    color: assets.find(a => a.type === type)?.color || '#64748b',
  })).filter(d => d.value > 0)

  function openAdd() {
    setForm(EMPTY_FORM)
    setEditId(null)
    setFormOpen(true)
  }

  function openEdit(a: Asset) {
    setForm(a)
    setEditId(a.id)
    setFormOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editId) updateAsset(editId, form)
    else addAsset(form)
    setFormOpen(false)
  }

  function handleDelete() {
    if (deleteId) deleteAsset(deleteId)
    setDeleteId(null)
  }

  const asset = assets.find(a => a.id === deleteId)

  return (
    <MainLayout title="资产管理" subtitle="追踪所有资产配置">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="总资产"
            value={fmtCompact(totalAssets)}
            subtitle={`${assets.length} 项资产`}
            icon="💰"
            color="#3b82f6"
          />
          <StatCard
            title="流动资产"
            value={fmtCompact(assets.filter(a => ['银行卡', '现金', '微信', '支付宝'].includes(a.type)).reduce((sum, a) => sum + a.value, 0))}
            subtitle="可随时使用"
            icon="💵"
            color="#10b981"
          />
          <StatCard
            title="投资资产"
            value={fmtCompact(assets.filter(a => ['股票', '基金', '黄金'].includes(a.type)).reduce((sum, a) => sum + a.value, 0))}
            subtitle="股票、基金、黄金"
            icon="📈"
            color="#f59e0b"
          />
          <StatCard
            title="固定资产"
            value={fmtCompact(assets.filter(a => ['房产', '车辆'].includes(a.type)).reduce((sum, a) => sum + a.value, 0))}
            subtitle="房产、车辆"
            icon="🏠"
            color="#8b5cf6"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-sm text-foreground mb-4">资产分布</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={assetDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {assetDistribution.map((entry, index) => (
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
            <h3 className="text-sm text-foreground mb-4">资产类型占比</h3>
            <div className="space-y-3">
              {assetDistribution.map(item => (
                <div key={item.name}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-foreground">{item.name}</span>
                    <span className="text-muted-foreground">{((item.value / totalAssets) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(item.value / totalAssets) * 100}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Assets List */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm text-foreground">资产明细</h2>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors shadow shadow-primary/20"
          >
            <Plus size={15} />添加资产
          </button>
        </div>

        {assets.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl">
            <EmptyState
              icon="💰"
              title="暂无资产记录"
              description="添加您的银行账户、投资、房产等资产"
              action={{ label: '添加资产', onClick: openAdd }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assets.map(a => (
              <div key={a.id} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/20 transition-colors group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${a.color}20` }}>
                    {a.icon}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(a)}
                      className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteId(a.id)}
                      className="w-8 h-8 rounded-lg hover:bg-rose-400/15 flex items-center justify-center text-muted-foreground hover:text-rose-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h4 className="text-sm text-foreground mb-1">{a.name}</h4>
                <p className="text-xs text-muted-foreground mb-3">{a.type} · {a.currency}</p>
                <div className="text-xl text-foreground font-semibold">{fmtCurrency(a.value)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        <FormModal
          open={formOpen}
          onClose={() => setFormOpen(false)}
          title={editId ? '编辑资产' : '添加资产'}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-2">资产类型</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value as Asset['type'] })}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/60 transition-colors"
              >
                {ASSET_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-2">资产名称</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="招商银行储蓄卡"
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/60 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-2">价值</label>
              <input
                type="number"
                value={form.value}
                onChange={e => setForm({ ...form, value: Number(e.target.value) })}
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/60 transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-2">货币</label>
                <select
                  value={form.currency}
                  onChange={e => setForm({ ...form, currency: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/60 transition-colors"
                >
                  <option value="CNY">CNY</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-2">图标</label>
                <input
                  type="text"
                  value={form.icon}
                  onChange={e => setForm({ ...form, icon: e.target.value })}
                  placeholder="🏦"
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>
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
                {editId ? '保存修改' : '添加资产'}
              </button>
            </div>
          </form>
        </FormModal>

        {/* Delete Confirm */}
        <DeleteConfirmDialog
          open={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="删除资产记录"
          description={`确认删除「${asset?.name}」？此操作不可撤销。`}
        />
      </div>
    </MainLayout>
  )
}
