'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { 
  User, Bell, Tag, Globe, Shield, ChevronRight, Check, Download, 
  FileText, Loader2, X, Plus, Edit3, Trash2, AlertCircle, Eye, EyeOff,
  Smartphone, QrCode, Copy, Clock, FileSearch
} from 'lucide-react'
import { MainLayout } from '@/components/shared/MainLayout'
import { Tabs } from '@/components/shared/Tabs'
import { useApp } from '@/contexts/AppContext'
import { useAuth } from '@/contexts/AuthContext'
import {
  exportTransactions,
  exportAssets,
  exportLiabilities,
  exportBudgets,
  exportGoals,
} from '@/lib/exportCSV'
import {
  getUserSettings,
  updateNotificationPreferences,
} from '@/services/supabase/userSettingsService'
import { uploadAvatar, cleanupOldAvatars } from '@/services/supabase/storageService'
import {
  getTwoFactorStatus,
  setupTwoFactor,
  enableTwoFactor,
  disableTwoFactor,
  type TwoFactorSetup,
} from '@/services/twoFactorService'
import type { Category } from '@/types'
import { getUserLogs, getActionTypeLabel, type AuditLog } from '@/services/auditService'

const tabs = [
  { key: 'profile', label: '账户设置', icon: User },
  { key: 'notifications', label: '通知设置', icon: Bell },
  { key: 'categories', label: '分类管理', icon: Tag },
  { key: 'general', label: '通用设置', icon: Globe },
  { key: 'security', label: '安全设置', icon: Shield },
  { key: 'audit', label: '操作日志', icon: FileSearch },
]

export default function SettingsPage() {
  const { transactions, assets, liabilities, budgets, goals, categories, loadCategories, createCategory, updateCategory, deleteCategory } = useApp()
  const { user, updateUserProfile, changePassword, sessionTimeoutMinutes, setSessionTimeoutMinutes } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [saved, setSaved] = useState(false)
  const [exporting, setExporting] = useState<string | null>(null)
  const [profile, setProfile] = useState({
    name: user?.name || '用户',
    email: user?.email || '',
    phone: '138 **** 8888',
    currency: 'CNY',
    language: 'zh-CN'
  })

  const notifSettings = [
    { label: '超支提醒', desc: '当支出超出预算时通知', key: 'budgetAlerts' },
    { label: '目标进度更新', desc: '财务目标达到里程碑时通知', key: 'goalAlerts' },
    { label: '月度报告', desc: '每月初发送上月财务摘要', key: 'monthlyReport' },
    { label: '周报', desc: '每周发送财务摘要', key: 'weeklyReport' },
    { label: '邮件通知', desc: '通过邮件接收通知', key: 'emailNotifications' },
    { label: '推送通知', desc: '通过应用推送接收通知', key: 'pushNotifications' },
  ]

  const [notificationPrefs, setNotificationPrefs] = useState<Record<string, boolean>>({})
  const [loadingSettings, setLoadingSettings] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [generalSettings, setGeneralSettings] = useState({
    currency: 'CNY · 人民币',
    language: '中文（简体）',
    fiscalYear: '1月 - 12月',
    weekStart: '周一',
  })

  const [showAddCategory, setShowAddCategory] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newCategory, setNewCategory] = useState<Omit<Category, 'id'>>({ name: '', icon: '', color: '#666666', type: 'expense' })
  
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' })
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false })
  const [passwordError, setPasswordError] = useState('')
  
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  
  const [showLoginHistory, setShowLoginHistory] = useState(false)
  
  // 操作日志相关状态
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  
  // 两步验证相关状态
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false)
  const [showTwoFactorDisable, setShowTwoFactorDisable] = useState(false)
  const [twoFactorSetupData, setTwoFactorSetupData] = useState<TwoFactorSetup | null>(null)
  const [twoFactorToken, setTwoFactorToken] = useState('')
  const [twoFactorError, setTwoFactorError] = useState('')
  const [twoFactorLoading, setTwoFactorLoading] = useState(false)
  
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarUploadProgress, setAvatarUploadProgress] = useState(0)
  const [avatarError, setAvatarError] = useState('')

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  // 加载用户设置
  useEffect(() => {
    async function loadUserSettings() {
      if (!user?.id) return
      
      setLoadingSettings(true)
      try {
        const settings = await getUserSettings(user.id)
        if (settings) {
          setNotificationPrefs({
            budgetAlerts: settings.budgetAlerts,
            goalAlerts: settings.goalAlerts,
            monthlyReport: settings.monthlyReport,
            weeklyReport: settings.weeklyReport,
            emailNotifications: settings.emailNotifications,
            pushNotifications: settings.pushNotifications,
          })
        } else {
          // 如果没有设置，使用默认值
          setNotificationPrefs({
            budgetAlerts: true,
            goalAlerts: true,
            monthlyReport: true,
            weeklyReport: false,
            emailNotifications: true,
            pushNotifications: true,
          })
        }
      } catch (error) {
        console.error('Failed to load user settings:', error)
      } finally {
        setLoadingSettings(false)
      }
    }
    
    loadUserSettings()
  }, [user?.id])

  // 加载两步验证状态
  useEffect(() => {
    async function loadTwoFactorStatus() {
      if (!user?.id) return
      try {
        const status = await getTwoFactorStatus(user.id)
        setTwoFactorEnabled(status.enabled)
      } catch (error) {
        console.error('Failed to load 2FA status:', error)
      }
    }
    loadTwoFactorStatus()
  }, [user?.id])

  // 加载操作日志
  useEffect(() => {
    if (activeTab !== 'audit') return
    
    async function loadAuditLogs() {
      if (!user?.id) return
      setLoadingLogs(true)
      try {
        const logs = await getUserLogs(user.id, 100)
        setAuditLogs(logs)
      } catch (error) {
        console.error('Failed to load audit logs:', error)
      } finally {
        setLoadingLogs(false)
      }
    }
    loadAuditLogs()
  }, [activeTab, user?.id])

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // 操作类型颜色映射
  function getActionTypeColor(actionType: string): string {
    const colors: Record<string, string> = {
      LOGIN: 'rgba(34, 197, 94, 0.15)',
      LOGOUT: 'rgba(156, 163, 175, 0.15)',
      CREATE_TRANSACTION: 'rgba(59, 130, 246, 0.15)',
      UPDATE_TRANSACTION: 'rgba(139, 92, 246, 0.15)',
      DELETE_TRANSACTION: 'rgba(239, 68, 68, 0.15)',
      CREATE_ASSET: 'rgba(34, 197, 94, 0.15)',
      UPDATE_ASSET: 'rgba(139, 92, 246, 0.15)',
      DELETE_ASSET: 'rgba(239, 68, 68, 0.15)',
      UPDATE_SETTINGS: 'rgba(251, 191, 36, 0.15)',
      CHANGE_PASSWORD: 'rgba(239, 68, 68, 0.15)',
      ENABLE_TWO_FACTOR: 'rgba(34, 197, 94, 0.15)',
      DISABLE_TWO_FACTOR: 'rgba(239, 68, 68, 0.15)',
    }
    return colors[actionType] || 'rgba(156, 163, 175, 0.15)'
  }

  // 操作类型图标映射
  function getActionIcon(actionType: string): string {
    const icons: Record<string, string> = {
      LOGIN: '🔓',
      LOGOUT: '🔒',
      CREATE_TRANSACTION: '➕',
      UPDATE_TRANSACTION: '✏️',
      DELETE_TRANSACTION: '🗑️',
      CREATE_ASSET: '💰',
      UPDATE_ASSET: '✏️',
      DELETE_ASSET: '🗑️',
      UPDATE_SETTINGS: '⚙️',
      CHANGE_PASSWORD: '🔑',
      ENABLE_TWO_FACTOR: '✅',
      DISABLE_TWO_FACTOR: '❌',
    }
    return icons[actionType] || '📋'
  }

  // 格式化日期
  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  async function handleExport(type: string) {
    setExporting(type)
    try {
      switch (type) {
        case 'transactions':
          exportTransactions(transactions)
          break
        case 'assets':
          exportAssets(assets)
          break
        case 'liabilities':
          exportLiabilities(liabilities)
          break
        case 'budgets':
          exportBudgets(budgets)
          break
        case 'goals':
          exportGoals(goals)
          break
        case 'all':
          exportTransactions(transactions)
          setTimeout(() => exportAssets(assets), 100)
          setTimeout(() => exportLiabilities(liabilities), 200)
          setTimeout(() => exportBudgets(budgets), 300)
          setTimeout(() => exportGoals(goals), 400)
          break
      }
    } finally {
      setTimeout(() => setExporting(null), 500)
    }
  }

  function handleNotificationToggle(key: string) {
    setNotificationPrefs(prev => ({ ...prev, [key]: !prev[key] }))
  }

  async function handleSaveNotificationPrefs() {
    if (!user?.id) return
    
    setSavingSettings(true)
    setSaveError(null)
    try {
      await updateNotificationPreferences(user.id, {
        budgetAlerts: notificationPrefs.budgetAlerts,
        goalAlerts: notificationPrefs.goalAlerts,
        monthlyReport: notificationPrefs.monthlyReport,
        weeklyReport: notificationPrefs.weeklyReport,
        emailNotifications: notificationPrefs.emailNotifications,
        pushNotifications: notificationPrefs.pushNotifications,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Failed to save notification preferences:', error)
      setSaveError('保存失败，请重试')
    } finally {
      setSavingSettings(false)
    }
  }

  const iconOptions = ['🍽️', '🚗', '🛍️', '🎮', '📚', '🏥', '💼', '📈', '🎁', '💰', '💡', '🏠', '🏢', '🚘', '💳', '✈️', '📦', '💵', '📱', '💡']
  const colorOptions = ['#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f39c12', '#1abc9c', '#e67e22', '#16a085', '#c0392b', '#34495e', '#27ae60', '#8e44ad', '#f1c40f', '#7f8c8d', '#1abc9c']

  async function handleAddCategory() {
    if (!newCategory.name.trim()) return
    try {
      await createCategory({ ...newCategory })
      setNewCategory({ name: '', icon: '', color: '#666666', type: 'expense' })
      setShowAddCategory(false)
      await loadCategories()
    } catch (error) {
      console.error('Failed to create category:', error)
    }
  }

  async function handleEditCategory() {
    if (!editingCategory || !editingCategory.name.trim()) return
    try {
      await updateCategory(editingCategory.id, editingCategory)
      setEditingCategory(null)
      await loadCategories()
    } catch (error) {
      console.error('Failed to update category:', error)
    }
  }

  async function handleDeleteCategory(categoryId: string) {
    if (confirm('确定要删除这个分类吗？')) {
      try {
        await deleteCategory(categoryId)
        await loadCategories()
      } catch (error) {
        console.error('Failed to delete category:', error)
      }
    }
  }

  async function handleChangePassword() {
    setPasswordError('')
    if (passwordData.new !== passwordData.confirm) {
      setPasswordError('新密码两次输入不一致')
      return
    }
    if (passwordData.new.length < 6) {
      setPasswordError('密码长度至少6位')
      return
    }
    try {
      await changePassword(passwordData.current, passwordData.new)
      setShowChangePassword(false)
      setPasswordData({ current: '', new: '', confirm: '' })
      handleSave()
    } catch (error) {
      setPasswordError('修改密码失败，请检查当前密码是否正确')
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return

    setAvatarError('')
    setAvatarUploading(true)
    setAvatarUploadProgress(0)

    try {
      // 显示本地预览
      const reader = new FileReader()
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)

      // 上传到 Supabase Storage
      const result = await uploadAvatar(user.id, file, (progress) => {
        setAvatarUploadProgress(progress.percentage)
      })

      if (result.success && result.url) {
        // 更新用户头像URL
        await updateUserProfile({ avatar: result.url })
        
        // 清理旧头像
        const fileName = result.url.split('/').pop()
        if (fileName) {
          await cleanupOldAvatars(user.id, fileName)
        }
        
        handleSave()
      } else {
        setAvatarError(result.error || '上传失败')
        setAvatarPreview('')
      }
    } catch (error) {
      console.error('Avatar upload error:', error)
      setAvatarError('上传失败，请重试')
      setAvatarPreview('')
    } finally {
      setAvatarUploading(false)
      setAvatarUploadProgress(0)
    }
  }

  // 两步验证处理函数
  async function handleStartTwoFactorSetup() {
    if (!user?.id || !user?.email) return
    
    setTwoFactorLoading(true)
    setTwoFactorError('')
    try {
      const setupData = await setupTwoFactor(user.id, user.email)
      setTwoFactorSetupData(setupData)
      setShowTwoFactorSetup(true)
    } catch (error) {
      setTwoFactorError(error instanceof Error ? error.message : '设置失败')
    } finally {
      setTwoFactorLoading(false)
    }
  }

  async function handleEnableTwoFactor() {
    if (!user?.id || !twoFactorToken) return
    
    setTwoFactorLoading(true)
    setTwoFactorError('')
    try {
      await enableTwoFactor(user.id, twoFactorToken)
      setTwoFactorEnabled(true)
      setShowTwoFactorSetup(false)
      setTwoFactorSetupData(null)
      setTwoFactorToken('')
      handleSave()
    } catch (error) {
      setTwoFactorError(error instanceof Error ? error.message : '验证失败')
    } finally {
      setTwoFactorLoading(false)
    }
  }

  async function handleDisableTwoFactor() {
    if (!user?.id) return
    
    setTwoFactorLoading(true)
    setTwoFactorError('')
    try {
      await disableTwoFactor(user.id)
      setTwoFactorEnabled(false)
      setShowTwoFactorDisable(false)
      handleSave()
    } catch (error) {
      setTwoFactorError(error instanceof Error ? error.message : '禁用失败')
    } finally {
      setTwoFactorLoading(false)
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
  }

  async function handleSessionTimeoutChange(minutes: number) {
    try {
      await setSessionTimeoutMinutes(minutes)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Failed to update session timeout:', error)
    }
  }

  const loginHistoryData = [
    { time: '2024-12-20 14:30', ip: '192.168.1.100', device: 'Chrome - Windows', status: 'success' },
    { time: '2024-12-19 09:15', ip: '192.168.1.100', device: 'Safari - iOS', status: 'success' },
    { time: '2024-12-18 20:45', ip: '10.0.0.5', device: 'Edge - Windows', status: 'success' },
    { time: '2024-12-17 11:20', ip: '192.168.1.101', device: 'Chrome - Mac', status: 'failed' },
    { time: '2024-12-16 16:00', ip: '192.168.1.100', device: 'Chrome - Windows', status: 'success' },
  ]

  return (
    <MainLayout title="设置" subtitle="管理账户和应用设置">
      <div className="space-y-6">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'profile' && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <div>
              <h3 className="text-sm text-foreground mb-4">个人信息</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  {avatarPreview ? (
                    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-2xl text-white overflow-hidden">
                      <Image src={avatarPreview} alt="Avatar" fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-2xl text-white">
                      {profile.name?.charAt(0) || '用户'}
                    </div>
                  )}
                  {avatarUploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                      <Loader2 size={20} className="text-white animate-spin" />
                    </div>
                  )}
                </div>
                <div>
                  <label className={`block text-sm text-primary hover:text-primary/80 transition-colors cursor-pointer ${avatarUploading ? 'pointer-events-none opacity-50' : ''}`}>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAvatarUpload}
                      disabled={avatarUploading}
                      className="hidden"
                    />
                    {avatarUploading ? '上传中...' : '更换头像'}
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">支持 JPG、PNG、WebP，最大 2MB</p>
                  {avatarUploadProgress > 0 && avatarUploadProgress < 100 && (
                    <div className="w-32 h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${avatarUploadProgress}%` }}
                      />
                    </div>
                  )}
                  {avatarError && (
                    <p className="text-xs text-rose-400 mt-1">{avatarError}</p>
                  )}
                </div>
                {avatarPreview && !avatarUploading && (
                  <button
                    onClick={() => {
                      setAvatarPreview('')
                      setAvatarError('')
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    取消预览
                  </button>
                )}
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
                onClick={async () => {
                  await updateUserProfile({ name: profile.name })
                  handleSave()
                }}
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
            <p className="text-xs text-muted-foreground mb-4">选择您希望接收的通知类型</p>
            
            {loadingSettings ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {saveError && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-400/10 text-rose-400 text-xs mb-4">
                    <AlertCircle size={14} />
                    {saveError}
                  </div>
                )}
                <div className="space-y-3">
                  {notifSettings.map((n) => (
                    <div key={n.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div>
                        <div className="text-sm text-foreground">{n.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{n.desc}</div>
                      </div>
                      <button
                        onClick={() => handleNotificationToggle(n.key)}
                        className={`w-11 h-6 rounded-full transition-all relative ${notificationPrefs[n.key] ? 'bg-primary' : 'bg-secondary'}`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${notificationPrefs[n.key] ? 'left-5' : 'left-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="pt-4 mt-4 border-t border-border">
                  <button
                    onClick={handleSaveNotificationPrefs}
                    disabled={savingSettings}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-all shadow shadow-primary/20 disabled:opacity-50"
                  >
                    {savingSettings ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        保存中...
                      </>
                    ) : saved ? (
                      <>
                        <Check size={15} />
                        已保存
                      </>
                    ) : (
                      '保存偏好'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-foreground">交易分类</h3>
              <button
                onClick={() => setShowAddCategory(true)}
                className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <Plus size={14} /> 添加分类
              </button>
            </div>

            {showAddCategory && (
              <div className="mb-6 p-4 rounded-xl bg-secondary space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">添加新分类</span>
                  <button onClick={() => setShowAddCategory(false)} className="text-muted-foreground hover:text-foreground">
                    <X size={16} />
                  </button>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">分类名称</label>
                  <input
                    value={newCategory.name}
                    onChange={e => setNewCategory(p => ({ ...p, name: e.target.value }))}
                    placeholder="输入分类名称"
                    className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm focus:outline-none focus:border-primary/60"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">类型</label>
                  <select
                    value={newCategory.type}
                    onChange={e => setNewCategory(p => ({ ...p, type: e.target.value as 'income' | 'expense' }))}
                    className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm focus:outline-none focus:border-primary/60"
                  >
                    <option value="expense">支出</option>
                    <option value="income">收入</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">图标</label>
                  <div className="flex flex-wrap gap-2">
                    {iconOptions.map(icon => (
                      <button
                        key={icon}
                        onClick={() => setNewCategory(p => ({ ...p, icon }))}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${newCategory.icon === icon ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-secondary'}`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">颜色</label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map(color => (
                      <button
                        key={color}
                        onClick={() => setNewCategory(p => ({ ...p, color }))}
                        className={`w-8 h-8 rounded-lg transition-all ${newCategory.color === color ? 'ring-2 ring-primary ring-offset-2' : 'hover:scale-110'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleAddCategory}
                  className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
                >
                  添加分类
                </button>
              </div>
            )}

            {editingCategory && (
              <div className="mb-6 p-4 rounded-xl bg-secondary space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">编辑分类</span>
                  <button onClick={() => setEditingCategory(null)} className="text-muted-foreground hover:text-foreground">
                    <X size={16} />
                  </button>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">分类名称</label>
                  <input
                    value={editingCategory.name}
                    onChange={e => setEditingCategory(p => p ? { ...p, name: e.target.value } : null)}
                    className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm focus:outline-none focus:border-primary/60"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">图标</label>
                  <div className="flex flex-wrap gap-2">
                    {iconOptions.map(icon => (
                      <button
                        key={icon}
                        onClick={() => setEditingCategory(p => p ? { ...p, icon } : null)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${editingCategory.icon === icon ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-secondary'}`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">颜色</label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map(color => (
                      <button
                        key={color}
                        onClick={() => setEditingCategory(p => p ? { ...p, color } : null)}
                        className={`w-8 h-8 rounded-lg transition-all ${editingCategory.color === color ? 'ring-2 ring-primary ring-offset-2' : 'hover:scale-110'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleEditCategory}
                    className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
                  >
                    保存修改
                  </button>
                  <button
                    onClick={() => setEditingCategory(null)}
                    className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-secondary transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            <div>
              <p className="text-xs text-muted-foreground mb-3">支出分类</p>
              <div className="space-y-2 mb-6">
                {categories.filter(c => c.type === 'expense').map(c => (
                  <div key={c.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-secondary transition-colors group">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base" style={{ background: `${c.color}20` }}>{c.icon}</div>
                    <span className="text-sm text-foreground flex-1">{c.name}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingCategory(c)}
                        className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(c.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-400/10 text-muted-foreground hover:text-rose-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mb-3">收入分类</p>
              <div className="space-y-2">
                {categories.filter(c => c.type === 'income').map(c => (
                  <div key={c.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-secondary transition-colors group">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base" style={{ background: `${c.color}20` }}>{c.icon}</div>
                    <span className="text-sm text-foreground flex-1">{c.name}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingCategory(c)}
                        className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(c.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-400/10 text-muted-foreground hover:text-rose-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h3 className="text-sm text-foreground mb-4 flex items-center gap-2">
                <Download size={16} className="text-primary" />
                数据导出
              </h3>
              <p className="text-xs text-muted-foreground mb-4">导出您的财务数据为 CSV 格式，可在 Excel 或 Google Sheets 中打开</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => handleExport('transactions')}
                  disabled={exporting !== null}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border text-sm text-foreground hover:bg-secondary/50 transition-colors disabled:opacity-50"
                >
                  {exporting === 'transactions' ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                  交易记录
                </button>
                <button
                  onClick={() => handleExport('assets')}
                  disabled={exporting !== null}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border text-sm text-foreground hover:bg-secondary/50 transition-colors disabled:opacity-50"
                >
                  {exporting === 'assets' ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                  资产
                </button>
                <button
                  onClick={() => handleExport('liabilities')}
                  disabled={exporting !== null}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border text-sm text-foreground hover:bg-secondary/50 transition-colors disabled:opacity-50"
                >
                  {exporting === 'liabilities' ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                  负债
                </button>
                <button
                  onClick={() => handleExport('budgets')}
                  disabled={exporting !== null}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border text-sm text-foreground hover:bg-secondary/50 transition-colors disabled:opacity-50"
                >
                  {exporting === 'budgets' ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                  预算
                </button>
                <button
                  onClick={() => handleExport('goals')}
                  disabled={exporting !== null}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border text-sm text-foreground hover:bg-secondary/50 transition-colors disabled:opacity-50"
                >
                  {exporting === 'goals' ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                  目标
                </button>
                <button
                  onClick={() => handleExport('all')}
                  disabled={exporting !== null}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {exporting === 'all' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  导出全部
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground">* 导出文件包含 {transactions.length} 条交易, {assets.length} 项资产, {liabilities.length} 条负债, {budgets.length} 项预算, {goals.length} 个目标</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h3 className="text-sm text-foreground mb-4">安全设置</h3>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <div className="text-sm text-foreground">修改密码</div>
                  <div className="text-xs text-muted-foreground mt-0.5">定期更换密码保护账户安全</div>
                </div>
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                >
                  修改 <ChevronRight size={13} />
                </button>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: twoFactorEnabled ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
                    <Smartphone size={16} className={twoFactorEnabled ? 'text-green-500' : 'text-red-400'} />
                  </div>
                  <div>
                    <div className="text-sm text-foreground">两步验证</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {twoFactorEnabled ? '已启用 - 使用验证器应用保护账户' : '未启用 - 建议启用以增强账户安全'}
                    </div>
                  </div>
                </div>
                {twoFactorEnabled ? (
                  <button
                    onClick={() => setShowTwoFactorDisable(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                  >
                    禁用 <ChevronRight size={13} />
                  </button>
                ) : (
                  <button
                    onClick={handleStartTwoFactorSetup}
                    disabled={twoFactorLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-primary/40 text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                  >
                    {twoFactorLoading ? <Loader2 size={13} className="animate-spin" /> : null}
                    启用 <ChevronRight size={13} />
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <div className="text-sm text-foreground">登录记录</div>
                  <div className="text-xs text-muted-foreground mt-0.5">查看近期登录设备和位置</div>
                </div>
                <button
                  onClick={() => setShowLoginHistory(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                >
                  查看 <ChevronRight size={13} />
                </button>
              </div>
              <div className="py-3 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm text-foreground">会话超时</div>
                    <div className="text-xs text-muted-foreground mt-0.5">无活动时自动登出的时间</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {[15, 30, 60].map((minutes) => (
                    <button
                      key={minutes}
                      onClick={() => handleSessionTimeoutChange(minutes)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs transition-colors ${
                        sessionTimeoutMinutes === minutes
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
                      }`}
                    >
                      <Clock size={12} />
                      {minutes}分钟
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm text-foreground">删除账户</div>
                  <div className="text-xs text-muted-foreground mt-0.5">永久删除账户和所有数据（不可恢复）</div>
                </div>
                <button
                  onClick={() => setShowDeleteAccount(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-rose-400/30 text-rose-400 hover:bg-rose-400/10 transition-colors"
                >
                  删除 <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-foreground">操作日志</h3>
              <span className="text-xs text-muted-foreground">最近 {auditLogs.length} 条记录</span>
            </div>

            {loadingLogs ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-muted-foreground" />
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-12">
                <FileSearch size={40} className="mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">暂无操作记录</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 py-3 px-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium"
                      style={{ backgroundColor: getActionTypeColor(log.actionType) }}>
                      {getActionIcon(log.actionType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {getActionTypeLabel(log.actionType)}
                        </span>
                        {log.targetType && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {log.targetType}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {log.actionDescription}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
                        <span>{formatDate(log.createdAt)}</span>
                        {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showChangePassword && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl p-6 w-full max-w-md space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">修改密码</h3>
                <button onClick={() => setShowChangePassword(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={18} />
                </button>
              </div>
              {passwordError && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-400/10 text-rose-400 text-xs">
                  <AlertCircle size={14} />
                  {passwordError}
                </div>
              )}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">当前密码</label>
                <div className="relative">
                  <input
                    type={showPassword.current ? 'text' : 'password'}
                    value={passwordData.current}
                    onChange={e => setPasswordData(p => ({ ...p, current: e.target.value }))}
                    placeholder="请输入当前密码"
                    className="w-full px-4 py-2.5 pr-10 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:border-primary/60"
                  />
                  <button
                    onClick={() => setShowPassword(p => ({ ...p, current: !p.current }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword.current ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">新密码</label>
                <div className="relative">
                  <input
                    type={showPassword.new ? 'text' : 'password'}
                    value={passwordData.new}
                    onChange={e => setPasswordData(p => ({ ...p, new: e.target.value }))}
                    placeholder="请输入新密码（至少6位）"
                    className="w-full px-4 py-2.5 pr-10 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:border-primary/60"
                  />
                  <button
                    onClick={() => setShowPassword(p => ({ ...p, new: !p.new }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword.new ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">确认新密码</label>
                <div className="relative">
                  <input
                    type={showPassword.confirm ? 'text' : 'password'}
                    value={passwordData.confirm}
                    onChange={e => setPasswordData(p => ({ ...p, confirm: e.target.value }))}
                    placeholder="请再次输入新密码"
                    className="w-full px-4 py-2.5 pr-10 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:border-primary/60"
                  />
                  <button
                    onClick={() => setShowPassword(p => ({ ...p, confirm: !p.confirm }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowChangePassword(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-secondary transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleChangePassword}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
                >
                  确认修改
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteAccount && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl p-6 w-full max-w-md space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-400/10 flex items-center justify-center">
                  <AlertCircle size={20} className="text-rose-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">确认删除账户</h3>
                  <p className="text-xs text-muted-foreground">此操作不可撤销，所有数据将被永久删除</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-rose-400/10">
                <p className="text-xs text-rose-400">请输入 &quot;删除&quot; 确认此操作</p>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder='输入 &quot;删除&quot; 确认'
                  className="w-full mt-2 px-3 py-2 rounded-lg bg-card border border-border text-sm focus:outline-none focus:border-rose-400/60"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteAccount(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-secondary transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    if (deleteConfirm === '删除') {
                      alert('账户删除功能需要连接到 Supabase 后才能使用')
                      setShowDeleteAccount(false)
                    }
                  }}
                  disabled={deleteConfirm !== '删除'}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-rose-400 text-white text-sm hover:bg-rose-400/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        )}

        {showLoginHistory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl p-6 w-full max-w-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">登录记录</h3>
                <button onClick={() => setShowLoginHistory(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-2">
                {loginHistoryData.map((record, index) => (
                  <div key={index} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-secondary">
                    <div>
                      <div className="text-sm text-foreground">{record.time}</div>
                      <div className="text-xs text-muted-foreground">{record.device}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">{record.ip}</div>
                      <div className={`text-xs mt-0.5 ${record.status === 'success' ? 'text-green-400' : 'text-rose-400'}`}>
                        {record.status === 'success' ? '成功' : '失败'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 两步验证设置弹窗 */}
        {showTwoFactorSetup && twoFactorSetupData && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl p-6 w-full max-w-md space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">设置两步验证</h3>
                <button 
                  onClick={() => {
                    setShowTwoFactorSetup(false)
                    setTwoFactorSetupData(null)
                    setTwoFactorToken('')
                    setTwoFactorError('')
                  }} 
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-secondary text-center">
                  <p className="text-xs text-muted-foreground mb-3">使用验证器应用扫描二维码</p>
                  <div className="inline-block p-3 bg-white rounded-xl">
                    {/* QR Code 占位符 - 实际项目中应使用 qrcode 库生成 */}
                    <div className="w-40 h-40 bg-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <QrCode size={48} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-[10px] text-gray-500">扫描二维码</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 break-all">
                    {twoFactorSetupData.qrCodeUrl}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-secondary">
                  <p className="text-xs text-muted-foreground mb-2">或手动输入密钥：</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-card rounded-lg text-xs font-mono break-all">
                      {twoFactorSetupData.manualEntryKey}
                    </code>
                    <button
                      onClick={() => copyToClipboard(twoFactorSetupData.manualEntryKey)}
                      className="p-2 rounded-lg hover:bg-card transition-colors"
                      title="复制密钥"
                    >
                      <Copy size={16} className="text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {twoFactorError && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-400/10 text-rose-400 text-xs">
                    <AlertCircle size={14} />
                    {twoFactorError}
                  </div>
                )}

                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">输入验证码</label>
                  <input
                    type="text"
                    value={twoFactorToken}
                    onChange={e => setTwoFactorToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="请输入6位验证码"
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-sm text-center tracking-[0.5em] font-mono focus:outline-none focus:border-primary/60"
                    maxLength={6}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowTwoFactorSetup(false)
                      setTwoFactorSetupData(null)
                      setTwoFactorToken('')
                      setTwoFactorError('')
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-secondary transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleEnableTwoFactor}
                    disabled={twoFactorToken.length !== 6 || twoFactorLoading}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {twoFactorLoading && <Loader2 size={14} className="animate-spin" />}
                    确认启用
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 禁用两步验证弹窗 */}
        {showTwoFactorDisable && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl p-6 w-full max-w-md space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-400/10 flex items-center justify-center">
                  <AlertCircle size={20} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">禁用两步验证</h3>
                  <p className="text-xs text-muted-foreground">禁用后账户安全性将降低</p>
                </div>
              </div>

              {twoFactorError && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-400/10 text-rose-400 text-xs">
                  <AlertCircle size={14} />
                  {twoFactorError}
                </div>
              )}

              <div className="p-3 rounded-xl bg-amber-400/10">
                <p className="text-xs text-amber-400">
                  警告：禁用两步验证后，您的账户将仅受密码保护。建议保持启用状态以获得最佳安全性。
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowTwoFactorDisable(false)
                    setTwoFactorError('')
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-secondary transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleDisableTwoFactor}
                  disabled={twoFactorLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-amber-400 text-white text-sm hover:bg-amber-400/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {twoFactorLoading && <Loader2 size={14} className="animate-spin" />}
                  确认禁用
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}