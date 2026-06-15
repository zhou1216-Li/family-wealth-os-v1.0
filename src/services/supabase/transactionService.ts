import { supabase } from '@/lib/supabase'
import type { Transaction } from '@/types'
import { generateAESKey, encryptData, decryptData, exportKey, importAESKey } from '@/services/encryptionService'
import { logAction } from '@/services/auditService'

const ENCRYPTION_KEY_STORAGE_KEY = 'fwos_transaction_key'

let cachedEncryptionKey: CryptoKey | null = null

async function getEncryptionKey(): Promise<CryptoKey> {
  if (cachedEncryptionKey) {
    return cachedEncryptionKey
  }

  const storedKey = localStorage.getItem(ENCRYPTION_KEY_STORAGE_KEY)
  
  if (storedKey) {
    try {
      cachedEncryptionKey = await importAESKey(storedKey)
      return cachedEncryptionKey
    } catch {
      localStorage.removeItem(ENCRYPTION_KEY_STORAGE_KEY)
    }
  }

  const newKey = await generateAESKey()
  const exportedKey = await exportKey(newKey)
  localStorage.setItem(ENCRYPTION_KEY_STORAGE_KEY, exportedKey)
  cachedEncryptionKey = newKey
  
  return newKey
}

async function encryptSensitiveFields(data: Record<string, unknown>): Promise<Record<string, unknown>> {
  const result = { ...data }
  
  if (result.note && typeof result.note === 'string' && result.note.length > 0) {
    try {
      const key = await getEncryptionKey()
      result.note = await encryptData(key, result.note)
      result.note_encrypted = true
    } catch {
      console.warn('Failed to encrypt transaction note')
    }
  }
  
  return result
}

async function decryptSensitiveFields(data: Record<string, unknown>): Promise<Record<string, unknown>> {
  const result = { ...data }
  
  if (result.note && typeof result.note === 'string' && result.note_encrypted === true) {
    try {
      const key = await getEncryptionKey()
      result.note = await decryptData(key, result.note)
    } catch {
      console.warn('Failed to decrypt transaction note, keeping encrypted value')
    }
    delete result.note_encrypted
  }
  
  return result
}

export interface CreateTransactionInput {
  type: 'income' | 'expense' | 'transfer'
  category: string
  amount: number
  accountId: string
  userId: string
  note: string
  date: string
}

export interface UpdateTransactionInput {
  type?: 'income' | 'expense' | 'transfer'
  category?: string
  amount?: number
  accountId?: string
  userId?: string
  note?: string
  date?: string
}

async function mapRowToTransaction(row: Record<string, unknown>): Promise<Transaction> {
  const decryptedRow = await decryptSensitiveFields(row)
  
  return {
    id: decryptedRow.id as string,
    type: decryptedRow.type as Transaction['type'],
    category: decryptedRow.category as string,
    amount: Number(decryptedRow.amount),
    accountId: (decryptedRow.account_id as string) || '',
    userId: (decryptedRow.user_id as string) || '',
    note: (decryptedRow.note as string) || '',
    date: decryptedRow.date as string,
  }
}

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch transactions: ${error.message || error.code || 'Unknown error'}`)
    }

    return Promise.all((data || []).map(mapRowToTransaction))
  } catch (err) {
    throw err instanceof Error ? err : new Error('Failed to fetch transactions')
  }
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Error fetching transaction:', error)
    throw new Error(`Failed to fetch transaction: ${error.message}`)
  }

  return mapRowToTransaction(data)
}

export async function createTransaction(
  input: CreateTransactionInput
): Promise<Transaction> {
  const insertData = await encryptSensitiveFields({
    type: input.type,
    category: input.category,
    amount: input.amount,
    account_id: input.accountId || null,
    user_id: input.userId || null,
    note: input.note || '',
    date: input.date,
  })

  const { data, error } = await supabase
    .from('transactions')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('Error creating transaction:', error)
    throw new Error(`Failed to create transaction: ${error.message}`)
  }

  await logAction({
    userId: input.userId || '',
    actionType: 'CREATE_TRANSACTION',
    actionDescription: `创建交易: ${input.type} ${input.category} ¥${input.amount}`,
    targetType: 'transaction',
    targetId: data.id as string,
  })

  return mapRowToTransaction(data)
}

export async function updateTransaction(
  id: string,
  input: UpdateTransactionInput
): Promise<Transaction> {
  const updateData: Record<string, unknown> = {}

  if (input.type !== undefined) updateData.type = input.type
  if (input.category !== undefined) updateData.category = input.category
  if (input.amount !== undefined) updateData.amount = input.amount
  if (input.accountId !== undefined) updateData.account_id = input.accountId || null
  if (input.userId !== undefined) updateData.user_id = input.userId || null
  if (input.note !== undefined) updateData.note = input.note
  if (input.date !== undefined) updateData.date = input.date

  const encryptedData = await encryptSensitiveFields(updateData)

  const { data, error } = await supabase
    .from('transactions')
    .update(encryptedData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating transaction:', error)
    throw new Error(`Failed to update transaction: ${error.message}`)
  }

  await logAction({
    userId: input.userId || '',
    actionType: 'UPDATE_TRANSACTION',
    actionDescription: `更新交易 ${id}`,
    targetType: 'transaction',
    targetId: id,
  })

  return mapRowToTransaction(data)
}

export async function deleteTransaction(id: string, userId?: string): Promise<void> {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting transaction:', error)
    throw new Error(`Failed to delete transaction: ${error.message}`)
  }

  await logAction({
    userId: userId || '',
    actionType: 'DELETE_TRANSACTION',
    actionDescription: `删除交易 ${id}`,
    targetType: 'transaction',
    targetId: id,
  })
}

export async function getTransactionsByDateRange(
  startDate: string,
  endDate: string
): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching transactions by date range:', error)
    throw new Error(`Failed to fetch transactions: ${error.message}`)
  }

  return Promise.all((data || []).map(mapRowToTransaction))
}

export async function getTransactionsByCategory(
  category: string
): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('category', category)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching transactions by category:', error)
    throw new Error(`Failed to fetch transactions: ${error.message}`)
  }

  return Promise.all((data || []).map(mapRowToTransaction))
}