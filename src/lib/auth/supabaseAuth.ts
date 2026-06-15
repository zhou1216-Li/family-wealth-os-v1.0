/**
 * Supabase Auth 认证服务
 * 处理用户注册、登录、登出和会话管理
 */

import { supabase } from '../supabase'
import type { User, Session, AuthError } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  name?: string
  avatar?: string
  createdAt: string
}

export interface SignUpData {
  email: string
  password: string
  name?: string
}

export interface SignInData {
  email: string
  password: string
}

export interface AuthResult {
  user?: AuthUser
  session?: Session
  error?: AuthError | Error
}

/**
 * 用户注册
 */
export async function signUp({ email, password, name }: SignUpData): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
        },
      },
    })

    if (error) {
      return { error }
    }

    if (data.user) {
      return {
        user: formatUser(data.user),
        session: data.session ?? undefined,
      }
    }

    return { error: new Error('Registration failed') }
  } catch (e) {
    return { error: e as Error }
  }
}

/**
 * 用户登录
 */
export async function signIn({ email, password }: SignInData): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error }
    }

    if (data.user && data.session) {
      return {
        user: formatUser(data.user),
        session: data.session,
      }
    }

    return { error: new Error('Login failed') }
  } catch (e) {
    return { error: e as Error }
  }
}

/**
 * 用户登出
 */
export async function signOut(): Promise<{ error?: Error }> {
  try {
    const { error } = await supabase.auth.signOut()
    return { error: error ?? undefined }
  } catch (e) {
    return { error: e as Error }
  }
}

/**
 * 获取当前会话
 */
export async function getSession(): Promise<Session | null> {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error('Get session error:', error)
      return null
    }
    return data.session
  } catch {
    return null
  }
}

/**
 * 获取当前用户
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) {
      // AuthSessionMissingError 是正常的未登录状态，不需要报错
      if (error.message.includes('Auth session missing')) {
        return null
      }
      console.error('Get user error:', error)
      return null
    }
    if (data.user) {
      return formatUser(data.user)
    }
    return null
  } catch (e) {
    // 捕获 AuthSessionMissingError 和其他异常
    const error = e as Error
    if (!error.message.includes('Auth session missing')) {
      console.error('Get user exception:', e)
    }
    return null
  }
}

/**
 * 发送密码重置邮件
 */
export async function resetPassword(email: string): Promise<{ error?: Error }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })
    return { error: error ?? undefined }
  } catch (e) {
    return { error: e as Error }
  }
}

/**
 * 更新用户密码（不需要旧密码，用户已登录）
 */
export async function updatePassword(newPassword: string): Promise<{ error?: Error }> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    return { error: error ?? undefined }
  } catch (e) {
    return { error: e as Error }
  }
}

/**
 * 使用旧密码验证并更新密码
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<{ error?: Error }> {
  try {
    const user = (await supabase.auth.getUser()).data.user
    if (!user?.email) {
      return { error: new Error('User not found') }
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })

    if (signInError) {
      return { error: signInError }
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    return { error: error ?? undefined }
  } catch (e) {
    return { error: e as Error }
  }
}

/**
 * 更新用户资料
 */
export async function updateProfile(updates: { name?: string; avatar?: string }): Promise<{ error?: Error }> {
  try {
    const { error } = await supabase.auth.updateUser({
      data: updates,
    })
    return { error: error ?? undefined }
  } catch (e) {
    return { error: e as Error }
  }
}

/**
 * 订阅认证状态变化
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
): () => void {
  const { data } = supabase.auth.onAuthStateChange(callback)
  return () => data.subscription.unsubscribe()
}

/**
 * 格式化用户对象
 */
function formatUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || user.email?.split('@')[0],
    avatar: user.user_metadata?.avatar || user.email?.charAt(0).toUpperCase(),
    createdAt: user.created_at,
  }
}
