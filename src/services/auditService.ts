/**
 * Audit service — Supabase implementation
 * 操作日志审计服务
 */

import { supabase } from '@/lib/supabase'

export type ActionType = 
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREATE_TRANSACTION'
  | 'UPDATE_TRANSACTION'
  | 'DELETE_TRANSACTION'
  | 'CREATE_ASSET'
  | 'UPDATE_ASSET'
  | 'DELETE_ASSET'
  | 'UPDATE_SETTINGS'
  | 'CHANGE_PASSWORD'
  | 'CREATE_CATEGORY'
  | 'UPDATE_CATEGORY'
  | 'DELETE_CATEGORY'
  | 'CREATE_BUDGET'
  | 'UPDATE_BUDGET'
  | 'DELETE_BUDGET'
  | 'CREATE_GOAL'
  | 'UPDATE_GOAL'
  | 'DELETE_GOAL'
  | 'CREATE_LIABILITY'
  | 'UPDATE_LIABILITY'
  | 'DELETE_LIABILITY'
  | 'ENABLE_TWO_FACTOR'
  | 'DISABLE_TWO_FACTOR'

export interface AuditLog {
  id: string
  userId: string
  actionType: ActionType
  actionDescription: string
  targetType: string
  targetId: string
  ipAddress: string
  userAgent: string
  createdAt: string
}

export interface LogActionInput {
  userId: string
  actionType: ActionType
  actionDescription: string
  targetType?: string
  targetId?: string
  ipAddress?: string
  userAgent?: string
}

function mapRowToAuditLog(row: Record<string, unknown>): AuditLog {
  return {
    id: row.id as string,
    userId: (row.user_id as string) || '',
    actionType: row.action_type as ActionType,
    actionDescription: (row.action_description as string) || '',
    targetType: (row.target_type as string) || '',
    targetId: (row.target_id as string) || '',
    ipAddress: (row.ip_address as string) || '',
    userAgent: (row.user_agent as string) || '',
    createdAt: row.created_at as string,
  }
}

export async function logAction(input: LogActionInput): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: input.userId,
        action_type: input.actionType,
        action_description: input.actionDescription,
        target_type: input.targetType || null,
        target_id: input.targetId || null,
        ip_address: input.ipAddress || '',
        user_agent: input.userAgent || '',
      })

    if (error) {
      console.error('Error logging action:', error)
      throw new Error(`Failed to log action: ${error.message}`)
    }
  } catch (err) {
    console.error('Error in logAction:', err)
  }
}

export async function getUserLogs(userId: string, limit: number = 50): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching user logs:', error)
    throw new Error(`Failed to fetch user logs: ${error.message}`)
  }

  return (data || []).map(mapRowToAuditLog)
}

export async function getSystemLogs(limit: number = 100): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching system logs:', error)
    throw new Error(`Failed to fetch system logs: ${error.message}`)
  }

  return (data || []).map(mapRowToAuditLog)
}

export async function getLogsByActionType(actionType: ActionType, limit: number = 50): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('action_type', actionType)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching logs by action type:', error)
    throw new Error(`Failed to fetch logs: ${error.message}`)
  }

  return (data || []).map(mapRowToAuditLog)
}

export async function exportLogs(userId?: string): Promise<string> {
  let query = supabase.from('audit_logs').select('*').order('created_at', { ascending: false })
  
  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error exporting logs:', error)
    throw new Error(`Failed to export logs: ${error.message}`)
  }

  const logs = (data || []).map(mapRowToAuditLog)
  
  const headers = ['ID', '用户ID', '操作类型', '操作描述', '目标类型', '目标ID', 'IP地址', '用户代理', '创建时间']
  const rows = logs.map(log => [
    log.id,
    log.userId,
    log.actionType,
    log.actionDescription,
    log.targetType,
    log.targetId,
    log.ipAddress,
    log.userAgent,
    log.createdAt,
  ])

  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
  
  return csvContent
}

export async function clearLogs(daysToKeep: number = 30): Promise<void> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
  
  const { error } = await supabase
    .from('audit_logs')
    .delete()
    .lt('created_at', cutoffDate.toISOString())

  if (error) {
    console.error('Error clearing logs:', error)
    throw new Error(`Failed to clear logs: ${error.message}`)
  }
}

export async function getLogsCount(): Promise<number> {
  const { count, error } = await supabase
    .from('audit_logs')
    .select('id', { count: 'exact', head: true })

  if (error) {
    console.error('Error counting logs:', error)
    throw new Error(`Failed to count logs: ${error.message}`)
  }

  return count || 0
}

export function getActionTypeLabel(actionType: ActionType): string {
  const labels: Record<ActionType, string> = {
    LOGIN: '登录',
    LOGOUT: '登出',
    CREATE_TRANSACTION: '创建交易',
    UPDATE_TRANSACTION: '更新交易',
    DELETE_TRANSACTION: '删除交易',
    CREATE_ASSET: '创建资产',
    UPDATE_ASSET: '更新资产',
    DELETE_ASSET: '删除资产',
    UPDATE_SETTINGS: '更新设置',
    CHANGE_PASSWORD: '修改密码',
    CREATE_CATEGORY: '创建分类',
    UPDATE_CATEGORY: '更新分类',
    DELETE_CATEGORY: '删除分类',
    CREATE_BUDGET: '创建预算',
    UPDATE_BUDGET: '更新预算',
    DELETE_BUDGET: '删除预算',
    CREATE_GOAL: '创建目标',
    UPDATE_GOAL: '更新目标',
    DELETE_GOAL: '删除目标',
    CREATE_LIABILITY: '创建负债',
    UPDATE_LIABILITY: '更新负债',
    DELETE_LIABILITY: '删除负债',
    ENABLE_TWO_FACTOR: '启用两步验证',
    DISABLE_TWO_FACTOR: '禁用两步验证',
  }
  return labels[actionType] || actionType
}