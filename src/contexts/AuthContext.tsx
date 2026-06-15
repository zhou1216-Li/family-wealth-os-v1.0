'use client'

/**
 * 认证上下文
 * 管理全局认证状态和用户会话
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { AuthUser } from '@/lib/auth'
import {
  signIn,
  signUp,
  signOut as authSignOut,
  getCurrentUser,
  getSession,
  resetPassword,
  updatePassword,
  changePassword as changeUserPassword,
  updateProfile,
  onAuthStateChange,
} from '@/lib/auth'
import { logAction } from '@/services/auditService'
import { useSessionTimeout } from '@/hooks/useSessionTimeout'
import { getUserSettings, updateUserSettings } from '@/services/supabase/userSettingsService'

interface AuthContextType {
  // 状态
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  
  // 会话超时相关状态
  sessionTimeoutMinutes: number
  sessionRemainingSeconds: number
  showSessionWarning: boolean

  // 方法
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  resetUserPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
  updateUserProfile: (updates: { name?: string; avatar?: string }) => Promise<{ success: boolean; error?: string }>
  clearError: () => void
  
  // 会话超时相关方法
  resetSessionTimer: () => void
  dismissSessionWarning: () => void
  setSessionTimeoutMinutes: (minutes: number) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}

interface AuthProviderProps {
  children: ReactNode
  protectedRoutes?: string[]
}

export function AuthProvider({ children, protectedRoutes = [] }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(30)
  const router = useRouter()

  const {
    remainingSeconds,
    showWarning,
    resetTimer,
    dismissWarning,
  } = useSessionTimeout({
    timeoutMinutes: sessionTimeoutMinutes,
    warningMinutes: 5,
    onTimeout: () => {
      if (user) {
        void logout()
      }
    },
    enabled: !!user,
  })

  // 初始化认证状态
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        
        if (currentUser?.id) {
          const settings = await getUserSettings(currentUser.id)
          if (settings?.sessionTimeoutMinutes) {
            setSessionTimeoutMinutes(settings.sessionTimeoutMinutes)
          }
        }
      } catch (e) {
        console.error('Auth initialization error:', e)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // 订阅认证状态变化
    const unsubscribe = onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const newUser = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name,
          avatar: session.user.user_metadata?.avatar,
          createdAt: session.user.created_at,
        }
        setUser(newUser)
        
        // 加载用户会话超时设置
        setTimeout(async () => {
          const settings = await getUserSettings(session.user.id)
          if (settings?.sessionTimeoutMinutes) {
            setSessionTimeoutMinutes(settings.sessionTimeoutMinutes)
          }
        }, 100)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name,
          avatar: session.user.user_metadata?.avatar,
          createdAt: session.user.created_at,
        })
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // 登录
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn({ email, password })

      if (result.error) {
        const errorMessage = getErrorMessage(result.error)
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }

      if (result.user) {
        setUser(result.user)
        
        logAction({
          userId: result.user.id,
          actionType: 'LOGIN',
          actionDescription: `用户登录: ${result.user.email}`,
          ipAddress: '',
          userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
        }).catch(console.error)
        
        return { success: true }
      }

      return { success: false, error: 'Login failed' }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Login failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 注册
  const register = useCallback(async (email: string, password: string, name?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signUp({ email, password, name })

      if (result.error) {
        const errorMessage = getErrorMessage(result.error)
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }

      if (result.user) {
        setUser(result.user)
        return { success: true }
      }

      return { success: false, error: 'Registration failed' }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Registration failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 登出
  const logout = useCallback(async () => {
    setIsLoading(true)
    
    const currentUserId = user?.id

    try {
      await authSignOut()
      
      if (currentUserId) {
        logAction({
          userId: currentUserId,
          actionType: 'LOGOUT',
          actionDescription: '用户退出登录',
          ipAddress: '',
          userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
        }).catch(console.error)
      }
      
      setUser(null)
      router.push('/login')
    } catch (e) {
      console.error('Logout error:', e)
    } finally {
      setIsLoading(false)
    }
  }, [router, user?.id])

  // 重置密码
  const resetUserPassword = useCallback(async (email: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await resetPassword(email)

      if (result.error) {
        const errorMessage = getErrorMessage(result.error)
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }

      return { success: true }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Password reset failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 修改密码
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await changeUserPassword(currentPassword, newPassword)

      if (result.error) {
        const errorMessage = getErrorMessage(result.error)
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }

      if (user?.id) {
        logAction({
          userId: user.id,
          actionType: 'CHANGE_PASSWORD',
          actionDescription: '修改密码',
          ipAddress: '',
          userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
        }).catch(console.error)
      }

      return { success: true }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Password change failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  // 更新资料
  const updateUserProfile = useCallback(async (updates: { name?: string; avatar?: string }) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await updateProfile(updates)

      if (result.error) {
        const errorMessage = getErrorMessage(result.error)
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }

      // 刷新用户数据
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      return { success: true }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Profile update failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 清除错误
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // 重置会话计时器
  const resetSessionTimer = useCallback(() => {
    resetTimer()
  }, [resetTimer])

  // 关闭会话警告
  const dismissSessionWarning = useCallback(() => {
    dismissWarning()
  }, [dismissWarning])

  // 设置会话超时时间
  const updateSessionTimeout = useCallback(async (minutes: number) => {
    setSessionTimeoutMinutes(minutes)
    
    if (user?.id) {
      try {
        await updateUserSettings(user.id, { sessionTimeoutMinutes: minutes })
      } catch (error) {
        console.error('Failed to update session timeout setting:', error)
      }
    }
  }, [user?.id])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    sessionTimeoutMinutes,
    sessionRemainingSeconds: remainingSeconds,
    showSessionWarning: showWarning,
    login,
    register,
    logout,
    resetUserPassword,
    changePassword,
    updateUserProfile,
    clearError,
    resetSessionTimer,
    dismissSessionWarning,
    setSessionTimeoutMinutes: updateSessionTimeout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * 获取错误消息
 */
function getErrorMessage(error: Error | { message?: string; code?: string }): string {
  if ('code' in error) {
    switch (error.code) {
      case 'invalid_credentials':
        return '邮箱或密码错误'
      case 'user_already_exists':
        return '该邮箱已被注册'
      case 'weak_password':
        return '密码强度太弱'
      case 'email_not_confirmed':
        return '请先验证您的邮箱'
      default:
        break
    }
  }

  const message = error.message || String(error)

  if (message.includes('Invalid login credentials')) {
    return '邮箱或密码错误'
  }
  if (message.includes('Email not confirmed')) {
    return '请先验证您的邮箱'
  }
  if (message.includes('User already registered')) {
    return '该邮箱已被注册'
  }

  return message
}
