/**
 * Liability service — Supabase implementation
 */

import { supabase } from '@/lib/supabase'
import type { Liability } from '@/types'

export interface CreateLiabilityInput {
  type: Liability['type']
  name: string
  totalAmount: number
  amount: number
  interestRate?: number
  monthlyPayment?: number
  startDate?: string
  endDate?: string
  notes?: string
}

export interface UpdateLiabilityInput {
  type?: Liability['type']
  name?: string
  totalAmount?: number
  amount?: number
  interestRate?: number
  monthlyPayment?: number
  startDate?: string
  endDate?: string
  notes?: string
}

function mapRowToLiability(row: Record<string, unknown>): Liability {
  return {
    id: row.id as string,
    type: row.type as Liability['type'],
    name: row.name as string,
    totalAmount: Number(row.total_amount),
    amount: Number(row.amount),
    interestRate: Number(row.interest_rate),
    monthlyPayment: Number(row.monthly_payment),
    startDate: (row.start_date as string) || '',
    endDate: (row.end_date as string) || '',
    notes: (row.notes as string) || '',
  }
}

export async function getLiabilities(): Promise<Liability[]> {
  const { data, error } = await supabase
    .from('liabilities')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching liabilities:', error)
    throw new Error(`Failed to fetch liabilities: ${error.message}`)
  }

  return (data || []).map(mapRowToLiability)
}

export async function getLiabilityById(id: string): Promise<Liability | null> {
  const { data, error } = await supabase
    .from('liabilities')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Error fetching liability:', error)
    throw new Error(`Failed to fetch liability: ${error.message}`)
  }

  return mapRowToLiability(data)
}

export async function createLiability(
  input: CreateLiabilityInput
): Promise<Liability> {
  const { data, error } = await supabase
    .from('liabilities')
    .insert({
      type: input.type,
      name: input.name,
      total_amount: input.totalAmount,
      amount: input.amount,
      interest_rate: input.interestRate || 0,
      monthly_payment: input.monthlyPayment || 0,
      start_date: input.startDate || null,
      end_date: input.endDate || null,
      notes: input.notes || '',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating liability:', error)
    throw new Error(`Failed to create liability: ${error.message}`)
  }

  return mapRowToLiability(data)
}

export async function updateLiability(
  id: string,
  input: UpdateLiabilityInput
): Promise<Liability> {
  const updateData: Record<string, unknown> = {}

  if (input.type !== undefined) updateData.type = input.type
  if (input.name !== undefined) updateData.name = input.name
  if (input.totalAmount !== undefined) updateData.total_amount = input.totalAmount
  if (input.amount !== undefined) updateData.amount = input.amount
  if (input.interestRate !== undefined) updateData.interest_rate = input.interestRate
  if (input.monthlyPayment !== undefined) updateData.monthly_payment = input.monthlyPayment
  if (input.startDate !== undefined) updateData.start_date = input.startDate || null
  if (input.endDate !== undefined) updateData.end_date = input.endDate || null
  if (input.notes !== undefined) updateData.notes = input.notes

  const { data, error } = await supabase
    .from('liabilities')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating liability:', error)
    throw new Error(`Failed to update liability: ${error.message}`)
  }

  return mapRowToLiability(data)
}

export async function deleteLiability(id: string): Promise<void> {
  const { error } = await supabase
    .from('liabilities')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting liability:', error)
    throw new Error(`Failed to delete liability: ${error.message}`)
  }
}

export async function getTotalLiabilitiesAmount(): Promise<number> {
  const liabilities = await getLiabilities()
  return liabilities.reduce((sum, liability) => sum + liability.amount, 0)
}
