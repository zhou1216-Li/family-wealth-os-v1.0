import { supabase } from '@/lib/supabase'
import type { LoginHistory } from '@/types'

export interface CreateLoginHistoryInput {
  userId: string
  ipAddress?: string
  userAgent?: string
  success?: boolean
  errorMessage?: string
}

function mapRowToLoginHistory(row: Record<string, unknown>): LoginHistory {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    ipAddress: (row.ip_address as string) || '',
    userAgent: (row.user_agent as string) || '',
    loginTime: row.login_time as string,
    success: (row.success as boolean) || false,
    errorMessage: (row.error_message as string) || '',
  }
}

export async function getLoginHistory(userId: string, limit = 20): Promise<LoginHistory[]> {
  const { data, error } = await supabase
    .from('login_history')
    .select('*')
    .eq('user_id', userId)
    .order('login_time', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching login history:', error)
    throw new Error(`Failed to fetch login history: ${error.message}`)
  }

  return (data || []).map(mapRowToLoginHistory)
}

export async function createLoginHistory(input: CreateLoginHistoryInput): Promise<LoginHistory> {
  const { data, error } = await supabase
    .from('login_history')
    .insert({
      user_id: input.userId,
      ip_address: input.ipAddress || '',
      user_agent: input.userAgent || '',
      success: input.success ?? true,
      error_message: input.errorMessage || '',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating login history:', error)
    throw new Error(`Failed to create login history: ${error.message}`)
  }

  return mapRowToLoginHistory(data)
}

export async function deleteLoginHistory(userId: string): Promise<void> {
  const { error } = await supabase
    .from('login_history')
    .delete()
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting login history:', error)
    throw new Error(`Failed to delete login history: ${error.message}`)
  }
}