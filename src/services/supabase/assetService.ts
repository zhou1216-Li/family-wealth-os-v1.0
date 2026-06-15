/**
 * Asset service — Supabase implementation
 */

import { supabase } from '@/lib/supabase'
import type { Asset } from '@/types'
import { logAction } from '@/services/auditService'

export interface CreateAssetInput {
  type: Asset['type']
  name: string
  value: number
  currency?: string
  icon?: string
  color?: string
}

export interface UpdateAssetInput {
  type?: Asset['type']
  name?: string
  value?: number
  currency?: string
  icon?: string
  color?: string
}

function mapRowToAsset(row: Record<string, unknown>): Asset {
  return {
    id: row.id as string,
    type: row.type as Asset['type'],
    name: row.name as string,
    value: Number(row.value),
    currency: (row.currency as string) || 'CNY',
    icon: (row.icon as string) || '',
    color: (row.color as string) || '#666666',
  }
}

export async function getAssets(): Promise<Asset[]> {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching assets:', error)
    throw new Error(`Failed to fetch assets: ${error.message}`)
  }

  return (data || []).map(mapRowToAsset)
}

export async function getAssetById(id: string): Promise<Asset | null> {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Error fetching asset:', error)
    throw new Error(`Failed to fetch asset: ${error.message}`)
  }

  return mapRowToAsset(data)
}

export async function createAsset(input: CreateAssetInput, userId?: string): Promise<Asset> {
  const { data, error } = await supabase
    .from('assets')
    .insert({
      type: input.type,
      name: input.name,
      value: input.value,
      currency: input.currency || 'CNY',
      icon: input.icon || '',
      color: input.color || '#666666',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating asset:', error)
    throw new Error(`Failed to create asset: ${error.message}`)
  }

  await logAction({
    userId: userId || '',
    actionType: 'CREATE_ASSET',
    actionDescription: `创建资产: ${input.name} ¥${input.value}`,
    targetType: 'asset',
    targetId: data.id as string,
  })

  return mapRowToAsset(data)
}

export async function updateAsset(
  id: string,
  input: UpdateAssetInput,
  userId?: string
): Promise<Asset> {
  const updateData: Record<string, unknown> = {}

  if (input.type !== undefined) updateData.type = input.type
  if (input.name !== undefined) updateData.name = input.name
  if (input.value !== undefined) updateData.value = input.value
  if (input.currency !== undefined) updateData.currency = input.currency
  if (input.icon !== undefined) updateData.icon = input.icon
  if (input.color !== undefined) updateData.color = input.color

  const { data, error } = await supabase
    .from('assets')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating asset:', error)
    throw new Error(`Failed to update asset: ${error.message}`)
  }

  await logAction({
    userId: userId || '',
    actionType: 'UPDATE_ASSET',
    actionDescription: `更新资产 ${id}`,
    targetType: 'asset',
    targetId: id,
  })

  return mapRowToAsset(data)
}

export async function deleteAsset(id: string, userId?: string): Promise<void> {
  const { error } = await supabase
    .from('assets')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting asset:', error)
    throw new Error(`Failed to delete asset: ${error.message}`)
  }

  await logAction({
    userId: userId || '',
    actionType: 'DELETE_ASSET',
    actionDescription: `删除资产 ${id}`,
    targetType: 'asset',
    targetId: id,
  })
}

export async function getTotalAssetsValue(): Promise<number> {
  const assets = await getAssets()
  return assets.reduce((sum, asset) => sum + asset.value, 0)
}
