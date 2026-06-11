/**
 * Transaction service — mock implementation.
 * SUPABASE: supabase.from('transactions')...
 */

import type { Transaction } from '@/types'

export function createTransaction(data: Omit<Transaction, 'id'>): Transaction {
  return { ...data, id: `t_${Date.now()}` }
}

export function updateTransaction(id: string, data: Partial<Transaction>): Transaction {
  return { ...data, id } as Transaction
}

export function deleteTransaction(id: string): void {
  // Mock delete - in real app would call Supabase
}
