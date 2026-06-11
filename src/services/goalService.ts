/**
 * Goal service — mock implementation.
 * SUPABASE: supabase.from('goals')...
 */

import type { Goal } from '@/types'

export function createGoal(data: Omit<Goal, 'id'>): Goal {
  return { ...data, id: `g_${Date.now()}` }
}

export function updateGoal(id: string, data: Partial<Goal>): Goal {
  return { ...data, id } as Goal
}

export function deleteGoal(id: string): void {
  // Mock delete - in real app would call Supabase
}

export function calculateProgress(goal: Goal): number {
  if (goal.targetAmount <= 0) return 0
  return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
}
