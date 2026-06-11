'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Transaction, Asset, Liability, Budget, Goal, FamilyMember } from '@/types'
import {
  initialTransactions, initialAssets, initialLiabilities,
  initialBudgets, initialGoals, initialFamilyMembers,
} from '@/data/mockData'

// Re-export chart data so pages can import from one place
export { monthlyData, netWorthTrend, categoryData } from '@/data/mockData'
// Re-export types
export type { Transaction, Asset, Liability, Budget, Goal, FamilyMember } from '@/types'

// ─── Context interface ────────────────────────────────────────────────────────

interface AppContextType {
  // State
  transactions: Transaction[]
  assets: Asset[]
  liabilities: Liability[]
  budgets: Budget[]
  goals: Goal[]
  familyMembers: FamilyMember[]

  // Transaction CRUD
  addTransaction: (t: Omit<Transaction, 'id'>) => void
  updateTransaction: (id: string, t: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void

  // Asset CRUD
  addAsset: (a: Omit<Asset, 'id'>) => void
  updateAsset: (id: string, a: Partial<Asset>) => void
  deleteAsset: (id: string) => void

  // Liability CRUD
  addLiability: (l: Omit<Liability, 'id'>) => void
  updateLiability: (id: string, l: Partial<Liability>) => void
  deleteLiability: (id: string) => void

  // Budget CRUD
  updateBudget: (id: string, b: Partial<Budget>) => void

  // Goal CRUD
  addGoal: (g: Omit<Goal, 'id'>) => void
  updateGoal: (id: string, g: Partial<Goal>) => void
  deleteGoal: (id: string) => void

  // Family CRUD
  updateMemberRole: (id: string, role: FamilyMember['role']) => void
  removeMember: (id: string) => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | null>(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [assets, setAssets]             = useState<Asset[]>(initialAssets)
  const [liabilities, setLiabilities]   = useState<Liability[]>(initialLiabilities)
  const [budgets, setBudgets]           = useState<Budget[]>(initialBudgets)
  const [goals, setGoals]               = useState<Goal[]>(initialGoals)
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(initialFamilyMembers)

  // ── Transactions ──────────────────────────────────────────────────────────

  const addTransaction = (t: Omit<Transaction, 'id'>) =>
    setTransactions(prev => [{ ...t, id: `t_${Date.now()}` }, ...prev])

  const updateTransaction = (id: string, t: Partial<Transaction>) =>
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, ...t } : tx))

  const deleteTransaction = (id: string) =>
    setTransactions(prev => prev.filter(tx => tx.id !== id))

  // ── Assets ────────────────────────────────────────────────────────────────

  const addAsset = (a: Omit<Asset, 'id'>) =>
    setAssets(prev => [...prev, { ...a, id: `a_${Date.now()}` }])

  const updateAsset = (id: string, a: Partial<Asset>) =>
    setAssets(prev => prev.map(asset => asset.id === id ? { ...asset, ...a } : asset))

  const deleteAsset = (id: string) =>
    setAssets(prev => prev.filter(asset => asset.id !== id))

  // ── Liabilities ───────────────────────────────────────────────────────────

  const addLiability = (l: Omit<Liability, 'id'>) =>
    setLiabilities(prev => [...prev, { ...l, id: `l_${Date.now()}` }])

  const updateLiability = (id: string, l: Partial<Liability>) =>
    setLiabilities(prev => prev.map(item => item.id === id ? { ...item, ...l } : item))

  const deleteLiability = (id: string) =>
    setLiabilities(prev => prev.filter(item => item.id !== id))

  // ── Budgets ───────────────────────────────────────────────────────────────

  const updateBudget = (id: string, b: Partial<Budget>) =>
    setBudgets(prev => prev.map(item => item.id === id ? { ...item, ...b } : item))

  // ── Goals ─────────────────────────────────────────────────────────────────

  const addGoal = (g: Omit<Goal, 'id'>) =>
    setGoals(prev => [...prev, { ...g, id: `g_${Date.now()}` }])

  const updateGoal = (id: string, g: Partial<Goal>) =>
    setGoals(prev => prev.map(item => item.id === id ? { ...item, ...g } : item))

  const deleteGoal = (id: string) =>
    setGoals(prev => prev.filter(item => item.id !== id))

  // ── Family ────────────────────────────────────────────────────────────────

  const updateMemberRole = (id: string, role: FamilyMember['role']) =>
    setFamilyMembers(prev => prev.map(m => m.id === id ? { ...m, role } : m))

  const removeMember = (id: string) =>
    setFamilyMembers(prev => prev.filter(m => m.id !== id))

  // ── Provide ───────────────────────────────────────────────────────────────

  return (
    <AppContext.Provider value={{
      transactions, assets, liabilities, budgets, goals, familyMembers,
      addTransaction, updateTransaction, deleteTransaction,
      addAsset, updateAsset, deleteAsset,
      addLiability, updateLiability, deleteLiability,
      updateBudget,
      addGoal, updateGoal, deleteGoal,
      updateMemberRole, removeMember,
    }}>
      {children}
    </AppContext.Provider>
  )
}
