'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { resetUserPassword, isLoading, error, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLocalError(null)
    clearError()

    if (!email) {
      setLocalError('请输入邮箱地址')
      return
    }

    const result = await resetUserPassword(email)

    if (result.success) {
      setSuccess(true)
    } else {
      setLocalError(result.error || '重置失败')
    }
  }

  const displayError = localError || error

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-400/20 mx-auto mb-4 flex items-center justify-center">
              <Check size={32} className="text-emerald-400" />
            </div>
            <h1 className="text-2xl text-foreground font-semibold mb-2">发送成功！</h1>
            <p className="text-sm text-muted-foreground mb-6">
              我们已发送密码重置链接到 {email}，请查收邮件并按照指示重置密码。
            </p>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              返回登录
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          返回
        </button>

        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary mx-auto mb-4 flex items-center justify-center text-3xl">
              🔑
            </div>
            <h1 className="text-2xl text-foreground font-semibold">重置密码</h1>
            <p className="text-sm text-muted-foreground mt-2">输入您的注册邮箱，我们会发送重置链接</p>
          </div>

          {displayError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-400/10 border border-rose-400/20 text-rose-400 text-sm">
              {displayError}
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-2">邮箱地址</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/60 transition-colors"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isLoading ? '发送中...' : '发送重置链接'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
