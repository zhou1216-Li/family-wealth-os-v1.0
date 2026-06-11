'use client'

import { useState } from 'react'
import { User, Bell, Tag, Globe, Shield, ChevronRight, Check } from 'lucide-react'
import { MainLayout } from '@/components/shared/MainLayout'
import { Tabs } from '@/components/shared/Tabs'

const tabs = [
  { key: 'profile', label: '账户设置', icon: User },
  { key: 'notifications', label: '通知设置', icon: Bell },
  { key: 'categories', label: '分类管理', icon: Tag },
  { key: 'general', label: '通用设置', icon: Globe },
  { key: 'security', label: '安全设置', icon: Shield },
]

const DEFAULT_CATEGORIES = [
  { name: '餐饮', icon: '🍽️', color: '#e74c3c', type: 'expense' },
  { name: '交通', icon: '🚗', color: '#2ecc71', type: 'expense' },
  { name: '购物', icon: '🛍️', color: '#3498db', type: 'expense' },
  { name: '娱乐', icon: '🎮', color: '#9b59b6', type: 'expense' },
  { name: '教育', icon: '📚', color: '#f39c12', type: 'expense' },
  { name: '医疗', icon: '🏥', color: '#1abc9c', type: 'expense' },
  { name: '工资', icon: '💼', color: '#27ae60', type: 'income' },
  { name: '投资收益', icon: '📈', color: '#e67e22', type: 'income' },
  { name: '奖金', icon: '🎁', color: '#8e44ad', type: 'income' },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [saved, setSaved] = useState(false)
  const [profile, setProfile] = useState({ name: '张伟', email: 'zhangwei@gmail.com', phone: '138 **** 8888', currency: 'CNY', language: 'zh-CN' })

  const notifSettings = [
    { label: '超支提醒', desc: '当支出超出预算时通知', defaultOn: true },
    { label: '目标进度更新', desc: '财务目标达到里程碑时通知', defaultOn: true },
    { label: '月度报告', desc: '每月初发送上月财务摘要', defaultOn: true },
    { label: '大额支出提醒', desc: '单笔支出超过 ¥5,000 时提醒', defaultOn: false },
    { label: '账单到期提醒', desc: '信用卡等账单到期前提醒', defaultOn: true },
  ]

  const [notifs, setNotifs] = useState<boolean[]>(notifSettings.map(n => n.defaultOn))

  // General settings state - FIXED: using controlled state instead of defaultValue
  const [generalSettings, setGeneralSettings] = useState({
    currency: 'CNY · 人民币',
    language: '中文（简体）',
    fiscalYear: '1月 - 12月',
    weekStart: '周一',
  })

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <MainLayout title="设置" subtitle="管理账户和应用设置">
      <div className="space-y-6">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'profile' && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <div>
              <h3 className="text-sm text-foreground mb-4">个人信息</h3>
              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-2xl text-white">
                  张
                </div>
                <div>
                  <button className="text-sm text-primary hover:text-primary/80 transition-colors">更换头像</button>
                  <p className="text-xs text-muted-foreground mt-1">支持 JPG、PNG，最大 2MB</p>
                </div>
              </div>
            </div>
            {[
              { label: '姓名', key: 'name' },
              { label: '邮箱', key: 'email' },
              { label: '手机号', key: 'phone' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs text-muted-foreground mb-2">{f.label}</label>
                <input
                  value={profile[f.key as keyof typeof profile]}
                  onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/60 max-w-md"
                />
              </div>
            ))}
            <div className="pt-4">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-all shadow shadow-primary/20"
              >
                {saved ? <><Check size={15} />已保存</> : '保存设置'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-sm text-foreground mb-4">通知偏好</h3>
            <div className="space-y-3">
              {notifSettings.map((n, i) => (
                <div key={n.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <div className="text-sm text-foreground">{n.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{n.desc}</div>
                  </div>
                  <button
                    onClick={() => setNotifs(prev => prev.map((v, idx) => idx === i ? !v : v))}
                    className={`w-11 h-6 rounded-full transition-all relative ${notifs[i] ? 'bg-primary' : 'bg-secondary'}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${notifs[i] ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-foreground">交易分类</h3>
              <button className="text-xs text-primary hover:text-primary/80 transition-colors">+ 添加分类</button>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-3">支出分类</p>
              <div className="space-y-2 mb-6">
                {DEFAULT_CATEGORIES.filter(c => c.type === 'expense').map(c => (
                  <div key={c.name} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-secondary transition-colors group">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base" style={{ background: `${c.color}20` }}>{c.icon}</div>
                    <span className="text-sm text-foreground flex-1">{c.name}</span>
                    <button className="text-xs text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100">编辑</button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mb-3">收入分类</p>
              <div className="space-y-2">
                {DEFAULT_CATEGORIES.filter(c => c.type === 'income').map(c => (
                  <div key={c.name} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-secondary transition-colors group">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base" style={{ background: `${c.color}20` }}>{c.icon}</div>
                    <span className="text-sm text-foreground flex-1">{c.name}</span>
                    <button className="text-xs text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100">编辑</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'general' && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <h3 className="text-sm text-foreground mb-4">通用设置</h3>
            {[
              { 
                label: '默认货币', 
                key: 'currency',
                options: ['CNY · 人民币', 'USD · 美元', 'EUR · 欧元', 'HKD · 港元']
              },
              { 
                label: '显示语言', 
                key: 'language',
                options: ['中文（简体）', 'English', '繁體中文']
              },
              { 
                label: '财务年度', 
                key: 'fiscalYear',
                options: ['1月 - 12月', '4月 - 3月', '7月 - 6月']
              },
              { 
                label: '每周第一天', 
                key: 'weekStart',
                options: ['周一', '周日']
              },
            ].map(s => (
              <div key={s.key}>
                <label className="block text-xs text-muted-foreground mb-2">{s.label}</label>
                {/* FIXED: Using value and onChange instead of defaultValue */}
                <select 
                  value={generalSettings[s.key as keyof typeof generalSettings]}
                  onChange={e => setGeneralSettings(prev => ({ ...prev, [s.key]: e.target.value }))}
                  className="px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/60 cursor-pointer"
                >
                  {s.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div className="pt-4">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-all shadow shadow-primary/20"
              >
                {saved ? <><Check size={15} />已保存</> : '保存设置'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="text-sm text-foreground mb-4">安全设置</h3>
            {[
              { label: '修改密码', desc: '定期更换密码保护账户安全', action: '修改' },
              { label: '两步验证', desc: '启用后登录需要验证手机或邮箱', action: '启用' },
              { label: '登录记录', desc: '查看近期登录设备和位置', action: '查看' },
              { label: '数据导出', desc: '导出所有财务数据为 CSV 格式', action: '导出' },
              { label: '删除账户', desc: '永久删除账户和所有数据（不可恢复）', action: '删除', danger: true },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <div className="text-sm text-foreground">{s.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.desc}</div>
                </div>
                <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors ${s.danger ? 'border-rose-400/30 text-rose-400 hover:bg-rose-400/10' : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40'}`}>
                  {s.action} <ChevronRight size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
