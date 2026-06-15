/**
 * Goal service — Supabase implementation
 */

import { supabase } from '@/lib/supabase'
import type { Goal } from '@/types'

export interface CreateGoalInput {
  name: string
  targetAmount: number
  currentAmount?: number
  targetDate?: string
  monthlyContribution?: number
  icon?: string
  color?: string
}

export interface UpdateGoalInput {
  name?: string
  targetAmount?: number
  currentAmount?: number
  targetDate?: string
  monthlyContribution?: number
  icon?: string
  color?: string
}

function mapRowToGoal(row: Record<string, unknown>): Goal {
  return {
    id: row.id as string,
    name: row.name as string,
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount),
    targetDate: (row.target_date as string) || '',
    monthlyContribution: Number(row.monthly_contribution),
    icon: (row.icon as string) || '',
    color: (row.color as string) || '#666666',
  }
}

export async function getGoals(): Promise<Goal[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .order('target_date', { ascending: true })

  if (error) {
    console.error('Error fetching goals:', error)
    throw new Error(`Failed to fetch goals: ${error.message}`)
  }

  return (data || []).map(mapRowToGoal)
}

export async function getGoalById(id: string): Promise<Goal | null> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Error fetching goal:', error)
    throw new Error(`Failed to fetch goal: ${error.message}`)
  }

  return mapRowToGoal(data)
}

export async function createGoal(input: CreateGoalInput): Promise<Goal> {
  const { data, error } = await supabase
    .from('goals')
    .insert({
      name: input.name,
      target_amount: input.targetAmount,
      current_amount: input.currentAmount || 0,
      target_date: input.targetDate || null,
      monthly_contribution: input.monthlyContribution || 0,
      icon: input.icon || '',
      color: input.color || '#666666',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating goal:', error)
    throw new Error(`Failed to create goal: ${error.message}`)
  }

  return mapRowToGoal(data)
}

export async function updateGoal(
  id: string,
  input: UpdateGoalInput
): Promise<Goal> {
  const updateData: Record<string, unknown> = {}

  if (input.name !== undefined) updateData.name = input.name
  if (input.targetAmount !== undefined) updateData.target_amount = input.targetAmount
  if (input.currentAmount !== undefined) updateData.current_amount = input.currentAmount
  if (input.targetDate !== undefined) updateData.target_date = input.targetDate || null
  if (input.monthlyContribution !== undefined) updateData.monthly_contribution = input.monthlyContribution
  if (input.icon !== undefined) updateData.icon = input.icon
  if (input.color !== undefined) updateData.color = input.color

  const { data, error } = await supabase
    .from('goals')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating goal:', error)
    throw new Error(`Failed to update goal: ${error.message}`)
  }

  return mapRowToGoal(data)
}

export async function deleteGoal(id: string): Promise<void> {
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting goal:', error)
    throw new Error(`Failed to delete goal: ${error.message}`)
  }
}

export function calculateGoalProgress(goal: Goal): number {
  if (goal.targetAmount <= 0) return 0
  return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
}

export function getRemainingAmount(goal: Goal): number {
  return Math.max(0, goal.targetAmount - goal.currentAmount)
}
