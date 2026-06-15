/**
 * Family Member service — Supabase implementation
 */

import { supabase } from '@/lib/supabase'
import type { FamilyMember } from '@/types'

export interface CreateFamilyMemberInput {
  name: string
  role: FamilyMember['role']
  avatar?: string
  email?: string
  joinDate: string
}

export interface UpdateFamilyMemberInput {
  name?: string
  role?: FamilyMember['role']
  avatar?: string
  email?: string
  joinDate?: string
}

function mapRowToFamilyMember(row: Record<string, unknown>): FamilyMember {
  return {
    id: row.id as string,
    name: row.name as string,
    role: row.role as FamilyMember['role'],
    avatar: (row.avatar as string) || '',
    email: (row.email as string) || '',
    joinDate: row.join_date as string,
  }
}

export async function getFamilyMembers(): Promise<FamilyMember[]> {
  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .order('join_date', { ascending: true })

  if (error) {
    console.error('Error fetching family members:', error)
    throw new Error(`Failed to fetch family members: ${error.message}`)
  }

  return (data || []).map(mapRowToFamilyMember)
}

export async function getFamilyMemberById(id: string): Promise<FamilyMember | null> {
  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Error fetching family member:', error)
    throw new Error(`Failed to fetch family member: ${error.message}`)
  }

  return mapRowToFamilyMember(data)
}

export async function createFamilyMember(
  input: CreateFamilyMemberInput
): Promise<FamilyMember> {
  const { data, error } = await supabase
    .from('family_members')
    .insert({
      name: input.name,
      role: input.role,
      avatar: input.avatar || '',
      email: input.email || '',
      join_date: input.joinDate,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating family member:', error)
    throw new Error(`Failed to create family member: ${error.message}`)
  }

  return mapRowToFamilyMember(data)
}

export async function updateFamilyMember(
  id: string,
  input: UpdateFamilyMemberInput
): Promise<FamilyMember> {
  const updateData: Record<string, unknown> = {}

  if (input.name !== undefined) updateData.name = input.name
  if (input.role !== undefined) updateData.role = input.role
  if (input.avatar !== undefined) updateData.avatar = input.avatar
  if (input.email !== undefined) updateData.email = input.email
  if (input.joinDate !== undefined) updateData.join_date = input.joinDate

  const { data, error } = await supabase
    .from('family_members')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating family member:', error)
    throw new Error(`Failed to update family member: ${error.message}`)
  }

  return mapRowToFamilyMember(data)
}

export async function deleteFamilyMember(id: string): Promise<void> {
  const { error } = await supabase
    .from('family_members')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting family member:', error)
    throw new Error(`Failed to delete family member: ${error.message}`)
  }
}
