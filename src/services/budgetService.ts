/**
 * Budget service — mock implementation.
 * SUPABASE: supabase.from('budgets')...
 */

import type { Budget } from '@/types'

export function createBudget(data: Omit<Budget, 'id'>): Budget {
  return { ...data, id: `b_${Date.now()}` }
}

export function updateBudget(id: string, data: Partial<Budget>): Budget {
  return { ...data, id } as Budget
}

export function calculateBudgetUsage(budget: Budget): number {
  if (budget.monthlyLimit <= 0) return 0
  return Math.min(100, (budget.spent / budget.monthlyLimit) * 100)
}
