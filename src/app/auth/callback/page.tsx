'use client'

/**
 * Auth Callback 页面
 * 处理 Supabase Auth 的 OAuth 回调和密码重置回调
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      // Supabase Auth 会自动处理 URL 中的 token
      // 等待一会儿让 auth 状态更新
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 size={32} className="animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">处理中...</p>
        {error && (
          <p className="text-rose-400 mt-2">{error}</p>
        )}
      </div>
    </div>
  )
}
