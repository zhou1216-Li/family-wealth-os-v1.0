import { supabase } from '@/lib/supabase'
import type { Category, CategoryType } from '@/types'

export interface CreateCategoryInput {
  name: string
  type: CategoryType
  icon?: string
  color?: string
}

export interface UpdateCategoryInput {
  name?: string
  type?: CategoryType
  icon?: string
  color?: string
}

function mapRowToCategory(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    name: row.name as string,
    type: row.type as CategoryType,
    icon: (row.icon as string) || '',
    color: (row.color as string) || '#666666',
  }
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('type', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    throw new Error(`Failed to fetch categories: ${error.message}`)
  }

  return (data || []).map(mapRowToCategory)
}

export async function getCategoriesByType(type: CategoryType): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('type', type)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    throw new Error(`Failed to fetch categories: ${error.message}`)
  }

  return (data || []).map(mapRowToCategory)
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Error fetching category:', error)
    throw new Error(`Failed to fetch category: ${error.message}`)
  }

  return mapRowToCategory(data)
}

export async function getCategoryByName(name: string, type: CategoryType): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('name', name)
    .eq('type', type)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Error fetching category:', error)
    throw new Error(`Failed to fetch category: ${error.message}`)
  }

  return mapRowToCategory(data)
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  const existing = await getCategoryByName(input.name, input.type)
  if (existing) {
    throw new Error(`Category "${input.name}" already exists`)
  }

  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: input.name,
      type: input.type,
      icon: input.icon || '',
      color: input.color || '#666666',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating category:', error)
    throw new Error(`Failed to create category: ${error.message}`)
  }

  return mapRowToCategory(data)
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput
): Promise<Category> {
  const updateData: Record<string, unknown> = {}

  if (input.name !== undefined) updateData.name = input.name
  if (input.type !== undefined) updateData.type = input.type
  if (input.icon !== undefined) updateData.icon = input.icon
  if (input.color !== undefined) updateData.color = input.color

  const { data, error } = await supabase
    .from('categories')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating category:', error)
    throw new Error(`Failed to update category: ${error.message}`)
  }

  return mapRowToCategory(data)
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting category:', error)
    throw new Error(`Failed to delete category: ${error.message}`)
  }
}