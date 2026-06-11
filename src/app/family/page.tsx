'use client'

import { MainLayout } from '@/components/shared/MainLayout'
import { StatCard } from '@/components/shared/StatCard'
import { useApp } from '@/contexts/AppContext'
import { Users, Shield, Edit, Trash2, Plus } from 'lucide-react'
import { useState } from 'react'
import { FormModal } from '@/components/shared/FormModal'
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import type { FamilyMember } from '@/types'

export default function FamilyPage() {
  const { familyMembers, updateMemberRole, removeMember } = useApp()
  const [formOpen, setFormOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<FamilyMember, 'id'>>({
    name: '',
    role: 'viewer',
    avatar: '',
    email: '',
    joinDate: new Date().toISOString().slice(0, 10),
  })

  const adminCount = familyMembers.filter(m => m.role === 'admin').length
  const editorCount = familyMembers.filter(m => m.role === 'editor').length
  const viewerCount = familyMembers.filter(m => m.role === 'viewer').length

  function openAdd() {
    setForm({
      name: '',
      role: 'viewer',
      avatar: '',
      email: '',
      joinDate: new Date().toISOString().slice(0, 10),
    })
    setEditId(null)
    setFormOpen(true)
  }

  function openEdit(member: FamilyMember) {
    setForm(member)
    setEditId(member.id)
    setFormOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // In real app, would add member via API
    setFormOpen(false)
  }

  function handleDelete() {
    if (deleteId) removeMember(deleteId)
    setDeleteId(null)
  }

  const member = familyMembers.find(m => m.id === deleteId)

  return (
    <MainLayout title="家庭成员" subtitle="管理家庭成员和权限">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="家庭成员"
            value={familyMembers.length}
            subtitle="人"
            icon="👨‍👩‍👧‍👦"
            color="#3b82f6"
          />
          <StatCard
            title="管理员"
            value={adminCount}
            subtitle="完全权限"
            icon="🛡️"
            color="#ef4444"
          />
          <StatCard
            title="编辑者"
            value={editorCount}
            subtitle="可编辑数据"
            icon="✏️"
            color="#f59e0b"
          />
          <StatCard
            title="查看者"
            value={viewerCount}
            subtitle="仅查看"
            icon="👁️"
            color="#10b981"
          />
        </div>

        {/* Members List */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm text-foreground">成员列表</h2>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors shadow shadow-primary/20"
          >
            <Plus size={15} />添加成员
          </button>
        </div>

        {familyMembers.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl">
            <EmptyState
              icon="👨‍👩‍👧‍👦"
              title="暂无家庭成员"
              description="添加家庭成员开始协作管理财务"
              action={{ label: '添加成员', onClick: openAdd }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {familyMembers.map(member => (
              <div key={member.id} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/20 transition-colors group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-xl text-primary-foreground">
                      {member.avatar}
                    </div>
                    <div>
                      <h4 className="text-sm text-foreground">{member.name}</h4>
                      <p className="text-xs text-muted-foreground">{member.email || '未设置邮箱'}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(member)}
                      className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Edit size={14} />
                    </button>
                    {member.role !== 'admin' && (
                      <button
                        onClick={() => setDeleteId(member.id)}
                        className="w-8 h-8 rounded-lg hover:bg-rose-400/15 flex items-center justify-center text-muted-foreground hover:text-rose-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">角色</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      member.role === 'admin' ? 'bg-rose-400/10 text-rose-400 border border-rose-400/20' :
                      member.role === 'editor' ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' :
                      'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                    }`}>
                      {member.role === 'admin' ? '管理员' : member.role === 'editor' ? '编辑者' : '查看者'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">加入日期</span>
                    <span className="text-xs text-foreground">{member.joinDate}</span>
                  </div>
                </div>

                {member.role === 'admin' && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Shield size={12} />
                      <span>拥有完全管理权限</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Role Descriptions */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-sm text-foreground mb-4">角色权限说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-rose-400/10 border border-rose-400/20">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={16} className="text-rose-400" />
                <h4 className="text-sm text-foreground font-medium">管理员</h4>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• 完全访问权限</li>
                <li>• 添加/删除成员</li>
                <li>• 修改所有数据</li>
                <li>• 系统设置管理</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-amber-400/10 border border-amber-400/20">
              <div className="flex items-center gap-2 mb-2">
                <Edit size={16} className="text-amber-400" />
                <h4 className="text-sm text-foreground font-medium">编辑者</h4>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• 添加/编辑交易</li>
                <li>• 管理资产和负债</li>
                <li>• 设置预算和目标</li>
                <li>• 查看所有报表</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-emerald-400/10 border border-emerald-400/20">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-emerald-400" />
                <h4 className="text-sm text-foreground font-medium">查看者</h4>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• 查看所有财务数据</li>
                <li>• 查看报表和分析</li>
                <li>• 无法修改数据</li>
                <li>• 仅限只读访问</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Add/Edit Modal */}
        <FormModal
          open={formOpen}
          onClose={() => setFormOpen(false)}
          title={editId ? '编辑成员' : '添加成员'}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-2">姓名</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="张三"
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/60 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-2">邮箱</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="zhangsan@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-2">角色</label>
              <select
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value as FamilyMember['role'] })}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/60 transition-colors"
              >
                <option value="viewer">查看者</option>
                <option value="editor">编辑者</option>
                <option value="admin">管理员</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-2">头像（单字）</label>
              <input
                type="text"
                value={form.avatar}
                onChange={e => setForm({ ...form, avatar: e.target.value })}
                placeholder="张"
                maxLength={1}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/60 transition-colors"
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
                {editId ? '保存修改' : '添加成员'}
              </button>
            </div>
          </form>
        </FormModal>

        {/* Delete Confirm */}
        <DeleteConfirmDialog
          open={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="删除家庭成员"
          description={`确认删除「${member?.name}」？此操作不可撤销。`}
        />
      </div>
    </MainLayout>
  )
}
