/**
 * Budget service — Supabase implementation
 */

import { supabase } from '@/lib/supabase'
import type { Budget } from '@/types'

export interface CreateBudgetInput {
  category: string
  monthlyLimit: number
  spent?: number
  icon?: string
  color?: string
}

export interface UpdateBudgetInput {
  category?: string
  monthlyLimit?: number
  spent?: number
  icon?: string
  color?: string
}

function mapRowToBudget(row: Record<string, unknown>): Budget {
  return {
    id: row.id as string,
    category: row.category as string,
    monthlyLimit: Number(row.monthly_limit),
    spent: Number(row.spent),
    icon: (row.icon as string) || '',
    color: (row.color as string) || '#666666',
  }
}

export async function getBudgets(): Promise<Budget[]> {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .order('category', { ascending: true })

  if (error) {
    console.error('Error fetching budgets:', error)
    throw new Error(`Failed to fetch budgets: ${error.message}`)
  }

  return (data || []).map(mapRowToBudget)
}

export async function getBudgetById(id: string): Promise<Budget | null> {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Error fetching budget:', error)
    throw new Error(`Failed to fetch budget: ${error.message}`)
  }

  return mapRowToBudget(data)
}

export async function getBudgetByCategory(category: string): Promise<Budget | null> {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('category', category)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Error fetching budget by category:', error)
    throw new Error(`Failed to fetch budget: ${error.message}`)
  }

  return mapRowToBudget(data)
}

export async function createBudget(input: CreateBudgetInput): Promise<Budget> {
  const { data, error } = await supabase
    .from('budgets')
    .insert({
      category: input.category,
      monthly_limit: input.monthlyLimit,
      spent: input.spent || 0,
      icon: input.icon || '',
      color: input.color || '#666666',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating budget:', error)
    throw new Error(`Failed to create budget: ${error.message}`)
  }

  return mapRowToBudget(data)
}

export async function updateBudget(
  id: string,
  input: UpdateBudgetInput
): Promise<Budget> {
  const updateData: Record<string, unknown> = {}

  if (input.category !== undefined) updateData.category = input.category
  if (input.monthlyLimit !== undefined) updateData.monthly_limit = input.monthlyLimit
  if (input.spent !== undefined) updateData.spent = input.spent
  if (input.icon !== undefined) updateData.icon = input.icon
  if (input.color !== undefined) updateData.color = input.color

  const { data, error } = await supabase
    .from('budgets')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating budget:', error)
    throw new Error(`Failed to update budget: ${error.message}`)
  }

  return mapRowToBudget(data)
}

export async function deleteBudget(id: string): Promise<void> {
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting budget:', error)
    throw new Error(`Failed to delete budget: ${error.message}`)
  }
}

export function calculateBudgetUsage(budget: Budget): number {
  if (budget.monthlyLimit <= 0) return 0
  return Math.min(100, (budget.spent / budget.monthlyLimit) * 100)
}
