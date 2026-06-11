/**
 * Liability service — mock implementation.
 * SUPABASE: supabase.from('liabilities')...
 */

import type { Liability, LiabilityType } from '@/types'

export function createLiability(data: Omit<Liability, 'id'>): Liability {
  return { ...data, id: `l_${Date.now()}` }
}

export const LIABILITY_TYPES: LiabilityType[] = ['房贷', '车贷', '信用卡', '花呗', '网贷']

export const LIABILITY_TYPE_META: Record<LiabilityType, { icon: string; color: string }> = {
  房贷:  { icon: '🏠', color: '#3498db' },
  车贷:  { icon: '🚗', color: '#9b59b6' },
  信用卡: { icon: '💳', color: '#f39c12' },
  花呗:  { icon: '📱', color: '#e67e22' },
  网贷:  { icon: '⚡', color: '#e74c3c' },
}

/** Payoff progress as a 0-100 percentage */
export function payoffProgress(l: Liability): number {
  if (l.totalAmount <= 0) return 0
  const paid = l.totalAmount - l.amount
  return Math.max(0, Math.min(100, (paid / l.totalAmount) * 100))
}
