/**
 * Asset service — mock implementation.
 * SUPABASE: supabase.from('assets')...
 */

import type { Asset } from '@/types'

export function createAsset(data: Omit<Asset, 'id'>): Asset {
  return { ...data, id: `a_${Date.now()}` }
}

export function updateAsset(id: string, data: Partial<Asset>): Asset {
  return { ...data, id } as Asset
}

export function deleteAsset(id: string): void {
  // Mock delete - in real app would call Supabase
}
