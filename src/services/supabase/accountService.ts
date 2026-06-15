/**
 * Account Service — Supabase implementation
 */

import { supabase } from '@/lib/supabase'
import type { Account } from '@/types'

export interface CreateAccountInput {
  name: string
  type: Account['type']
  balance: number
  currency: string
  icon: string
  color: string
  institution?: string
  notes?: string
}

export interface UpdateAccountInput {
  name?: string
  type?: Account['type']
  balance?: number
  currency?: string
  icon?: string
  color?: string
  institution?: string
  notes?: string
}

function mapRowToAccount(row: Record<string, unknown>): Account {
  return {
    id: row.id as string,
    name: row.name as string,
    type: row.type as Account['type'],
    balance: row.balance as number,
    currency: row.currency as string,
    icon: (row.icon as string) || '🏦',
    color: (row.color as string) || '#3b82f6',
    institution: (row.institution as string) || '',
    notes: (row.notes as string) || '',
    createdAt: row.created_at as string,
  }
}

export async function getAccounts(): Promise<Account[]> {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching accounts:', error)
    throw new Error(`Failed to fetch accounts: ${error.message}`)
  }

  return (data || []).map(mapRowToAccount)
}

export async function getAccountById(id: string): Promise<Account | null> {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Error fetching account:', error)
    throw new Error(`Failed to fetch account: ${error.message}`)
  }

  return mapRowToAccount(data)
}

export async function createAccount(input: CreateAccountInput): Promise<Account> {
  const { data, error } = await supabase
    .from('accounts')
    .insert({
      name: input.name,
      type: input.type,
      balance: input.balance,
      currency: input.currency,
      icon: input.icon || '🏦',
      color: input.color || '#3b82f6',
      institution: input.institution || '',
      notes: input.notes || '',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating account:', error)
    throw new Error(`Failed to create account: ${error.message}`)
  }

  return mapRowToAccount(data)
}

export async function updateAccount(id: string, input: UpdateAccountInput): Promise<Account> {
  const updateData: Record<string, unknown> = {}

  if (input.name !== undefined) updateData.name = input.name
  if (input.type !== undefined) updateData.type = input.type
  if (input.balance !== undefined) updateData.balance = input.balance
  if (input.currency !== undefined) updateData.currency = input.currency
  if (input.icon !== undefined) updateData.icon = input.icon
  if (input.color !== undefined) updateData.color = input.color
  if (input.institution !== undefined) updateData.institution = input.institution
  if (input.notes !== undefined) updateData.notes = input.notes

  const { data, error } = await supabase
    .from('accounts')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating account:', error)
    throw new Error(`Failed to update account: ${error.message}`)
  }

  return mapRowToAccount(data)
}

export async function deleteAccount(id: string): Promise<void> {
  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting account:', error)
    throw new Error(`Failed to delete account: ${error.message}`)
  }
}

export async function updateAccountBalance(id: string, amount: number): Promise<Account> {
  const { data, error } = await supabase.rpc('update_account_balance', {
    account_id: id,
    amount: amount,
  })

  if (error) {
    console.error('Error updating account balance:', error)
    throw new Error(`Failed to update account balance: ${error.message}`)
  }

  return mapRowToAccount(data)
}
