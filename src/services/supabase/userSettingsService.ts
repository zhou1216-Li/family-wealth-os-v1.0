import { supabase } from '@/lib/supabase'
import type { UserSettings } from '@/types'
import { logAction } from '@/services/auditService'

export interface CreateUserSettingsInput {
  userId: string
  emailNotifications?: boolean
  pushNotifications?: boolean
  weeklyReport?: boolean
  monthlyReport?: boolean
  budgetAlerts?: boolean
  goalAlerts?: boolean
  darkMode?: boolean
  avatarUrl?: string
  sessionTimeoutMinutes?: number
}

export interface UpdateUserSettingsInput {
  emailNotifications?: boolean
  pushNotifications?: boolean
  weeklyReport?: boolean
  monthlyReport?: boolean
  budgetAlerts?: boolean
  goalAlerts?: boolean
  darkMode?: boolean
  avatarUrl?: string
  sessionTimeoutMinutes?: number
}

function mapRowToUserSettings(row: Record<string, unknown>): UserSettings {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    emailNotifications: (row.email_notifications as boolean) || false,
    pushNotifications: (row.push_notifications as boolean) || false,
    weeklyReport: (row.weekly_report as boolean) || false,
    monthlyReport: (row.monthly_report as boolean) || false,
    budgetAlerts: (row.budget_alerts as boolean) || false,
    goalAlerts: (row.goal_alerts as boolean) || false,
    darkMode: (row.dark_mode as boolean) || false,
    avatarUrl: (row.avatar_url as string) || '',
    sessionTimeoutMinutes: (row.session_timeout_minutes as number) || 30,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Error fetching user settings:', error)
    throw new Error(`Failed to fetch user settings: ${error.message}`)
  }

  return mapRowToUserSettings(data)
}

export async function createUserSettings(input: CreateUserSettingsInput): Promise<UserSettings> {
  const existing = await getUserSettings(input.userId)
  if (existing) {
    throw new Error('User settings already exist')
  }

  const { data, error } = await supabase
    .from('user_settings')
    .insert({
      user_id: input.userId,
      email_notifications: input.emailNotifications ?? true,
      push_notifications: input.pushNotifications ?? true,
      weekly_report: input.weeklyReport ?? true,
      monthly_report: input.monthlyReport ?? true,
      budget_alerts: input.budgetAlerts ?? true,
      goal_alerts: input.goalAlerts ?? true,
      dark_mode: input.darkMode ?? false,
      avatar_url: input.avatarUrl ?? '',
      session_timeout_minutes: input.sessionTimeoutMinutes ?? 30,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating user settings:', error)
    throw new Error(`Failed to create user settings: ${error.message}`)
  }

  return mapRowToUserSettings(data)
}

export async function updateUserSettings(
  userId: string,
  input: UpdateUserSettingsInput
): Promise<UserSettings> {
  const updateData: Record<string, unknown> = {}

  if (input.emailNotifications !== undefined) updateData.email_notifications = input.emailNotifications
  if (input.pushNotifications !== undefined) updateData.push_notifications = input.pushNotifications
  if (input.weeklyReport !== undefined) updateData.weekly_report = input.weeklyReport
  if (input.monthlyReport !== undefined) updateData.monthly_report = input.monthlyReport
  if (input.budgetAlerts !== undefined) updateData.budget_alerts = input.budgetAlerts
  if (input.goalAlerts !== undefined) updateData.goal_alerts = input.goalAlerts
  if (input.darkMode !== undefined) updateData.dark_mode = input.darkMode
  if (input.avatarUrl !== undefined) updateData.avatar_url = input.avatarUrl
  if (input.sessionTimeoutMinutes !== undefined) updateData.session_timeout_minutes = input.sessionTimeoutMinutes
  updateData.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('user_settings')
    .update(updateData)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user settings:', error)
    throw new Error(`Failed to update user settings: ${error.message}`)
  }

  await logAction({
    userId,
    actionType: 'UPDATE_SETTINGS',
    actionDescription: '更新用户设置',
    targetType: 'user_settings',
    targetId: userId,
  })

  return mapRowToUserSettings(data)
}

export async function upsertUserSettings(
  userId: string,
  input: UpdateUserSettingsInput
): Promise<UserSettings> {
  const existing = await getUserSettings(userId)
  if (existing) {
    return updateUserSettings(userId, input)
  }
  return createUserSettings({ userId, ...input })
}

export async function deleteUserSettings(userId: string): Promise<void> {
  const { error } = await supabase
    .from('user_settings')
    .delete()
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting user settings:', error)
    throw new Error(`Failed to delete user settings: ${error.message}`)
  }
}

export interface NotificationPreferences {
  emailNotifications?: boolean
  pushNotifications?: boolean
  weeklyReport?: boolean
  monthlyReport?: boolean
  budgetAlerts?: boolean
  goalAlerts?: boolean
}

export async function updateNotificationPreferences(
  userId: string,
  preferences: NotificationPreferences
): Promise<UserSettings> {
  return upsertUserSettings(userId, {
    emailNotifications: preferences.emailNotifications,
    pushNotifications: preferences.pushNotifications,
    weeklyReport: preferences.weeklyReport,
    monthlyReport: preferences.monthlyReport,
    budgetAlerts: preferences.budgetAlerts,
    goalAlerts: preferences.goalAlerts,
  })
}