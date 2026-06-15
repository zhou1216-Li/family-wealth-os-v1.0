import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables.\n' +
    'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

export type Database = {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string
          type: 'income' | 'expense' | 'transfer'
          category: string
          amount: number
          account_id: string
          user_id: string
          note: string
          date: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>
      }
      assets: {
        Row: {
          id: string
          type: string
          name: string
          value: number
          currency: string
          icon: string
          color: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['assets']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['assets']['Insert']>
      }
      liabilities: {
        Row: {
          id: string
          type: string
          name: string
          total_amount: number
          amount: number
          interest_rate: number
          monthly_payment: number
          start_date: string
          end_date: string
          notes: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['liabilities']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['liabilities']['Insert']>
      }
      budgets: {
        Row: {
          id: string
          category: string
          monthly_limit: number
          spent: number
          icon: string
          color: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['budgets']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['budgets']['Insert']>
      }
      goals: {
        Row: {
          id: string
          name: string
          target_amount: number
          current_amount: number
          target_date: string
          monthly_contribution: number
          icon: string
          color: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['goals']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['goals']['Insert']>
      }
      family_members: {
        Row: {
          id: string
          name: string
          role: 'admin' | 'editor' | 'viewer'
          avatar: string
          email: string
          join_date: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['family_members']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['family_members']['Insert']>
      }
    }
  }
}
