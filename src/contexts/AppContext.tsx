'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Transaction, Asset, Liability, Budget, Goal, FamilyMember, Category, Account } from '@/types'
import { initializeDataService, getDataService, type DataService, type DataSource } from '@/lib/dataService'

export { monthlyData, netWorthTrend, categoryData } from '@/data/mockData'
export type { Transaction, Asset, Liability, Budget, Goal, FamilyMember, Category, Account } from '@/types'

interface AppContextType {
  // State
  transactions: Transaction[]
  assets: Asset[]
  liabilities: Liability[]
  budgets: Budget[]
  goals: Goal[]
  familyMembers: FamilyMember[]
  categories: Category[]

  // Status
  loading: boolean
  error: string | null
  dataSource: DataSource

  // Transaction CRUD
  addTransaction: (t: Omit<Transaction, 'id'>) => Promise<void>
  updateTransaction: (id: string, t: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>

  // Asset CRUD
  addAsset: (a: Omit<Asset, 'id'>) => Promise<void>
  updateAsset: (id: string, a: Partial<Asset>) => Promise<void>
  deleteAsset: (id: string) => Promise<void>

  // Liability CRUD
  addLiability: (l: Omit<Liability, 'id'>) => Promise<void>
  updateLiability: (id: string, l: Partial<Liability>) => Promise<void>
  deleteLiability: (id: string) => Promise<void>

  // Budget CRUD
  addBudget: (b: Omit<Budget, 'id'>) => Promise<void>
  updateBudget: (id: string, b: Partial<Budget>) => Promise<void>
  deleteBudget: (id: string) => Promise<void>

  // Goal CRUD
  addGoal: (g: Omit<Goal, 'id'>) => Promise<void>
  updateGoal: (id: string, g: Partial<Goal>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>

  // Family CRUD
  addMember: (m: Omit<FamilyMember, 'id'>) => Promise<void>
  updateMember: (id: string, m: Partial<FamilyMember>) => Promise<void>
  updateMemberRole: (id: string, role: FamilyMember['role']) => Promise<void>
  removeMember: (id: string) => Promise<void>

  // Category CRUD
  loadCategories: () => Promise<void>
  createCategory: (c: Omit<Category, 'id'>) => Promise<void>
  updateCategory: (id: string, c: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>

  // Accounts
  accounts: Account[]
  loadAccounts: () => Promise<void>
}

const AppContext = createContext<AppContextType | null>(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [liabilities, setLiabilities] = useState<Liability[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<DataSource>('mock')

  const loadAllData = async () => {
    setLoading(true)
    setError(null)
    try {
      const service = await initializeDataService()
      setDataSource(service.getDataSource())

      const [txs, asts, liabs, budgs, gls, fms, accs] = await Promise.all([
        service.getTransactions(),
        service.getAssets(),
        service.getLiabilities(),
        service.getBudgets(),
        service.getGoals(),
        service.getFamilyMembers(),
        service.getAccounts(),
      ])

      setTransactions(txs)
      setAssets(asts)
      setLiabilities(liabs)
      setBudgets(budgs)
      setGoals(gls)
      setFamilyMembers(fms)
      setAccounts(accs)
    } catch (err) {
      console.error('Failed to load data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()
  }, [])

  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    const service = getDataService()
    const newTx = await service.createTransaction(t)
    setTransactions(prev => [newTx, ...prev])
  }

  const updateTransaction = async (id: string, t: Partial<Transaction>) => {
    const service = getDataService()
    const updated = await service.updateTransaction(id, t)
    setTransactions(prev => prev.map(tx => tx.id === id ? updated : tx))
  }

  const deleteTransaction = async (id: string) => {
    const service = getDataService()
    await service.deleteTransaction(id)
    setTransactions(prev => prev.filter(tx => tx.id !== id))
  }

  const addAsset = async (a: Omit<Asset, 'id'>) => {
    const service = getDataService()
    const newAsset = await service.createAsset(a)
    setAssets(prev => [...prev, newAsset])
  }

  const updateAsset = async (id: string, a: Partial<Asset>) => {
    const service = getDataService()
    const updated = await service.updateAsset(id, a)
    setAssets(prev => prev.map(asset => asset.id === id ? updated : asset))
  }

  const deleteAsset = async (id: string) => {
    const service = getDataService()
    await service.deleteAsset(id)
    setAssets(prev => prev.filter(asset => asset.id !== id))
  }

  const addLiability = async (l: Omit<Liability, 'id'>) => {
    const service = getDataService()
    const newLiab = await service.createLiability(l)
    setLiabilities(prev => [...prev, newLiab])
  }

  const updateLiability = async (id: string, l: Partial<Liability>) => {
    const service = getDataService()
    const updated = await service.updateLiability(id, l)
    setLiabilities(prev => prev.map(item => item.id === id ? updated : item))
  }

  const deleteLiability = async (id: string) => {
    const service = getDataService()
    await service.deleteLiability(id)
    setLiabilities(prev => prev.filter(item => item.id !== id))
  }

  const updateBudget = async (id: string, b: Partial<Budget>) => {
    const service = getDataService()
    const updated = await service.updateBudget(id, b)
    setBudgets(prev => prev.map(item => item.id === id ? updated : item))
  }

  const addBudget = async (b: Omit<Budget, 'id'>) => {
    const service = getDataService()
    const newBudget = await service.createBudget(b)
    setBudgets(prev => [...prev, newBudget])
  }

  const deleteBudget = async (id: string) => {
    const service = getDataService()
    await service.deleteBudget(id)
    setBudgets(prev => prev.filter(item => item.id !== id))
  }

  const addGoal = async (g: Omit<Goal, 'id'>) => {
    const service = getDataService()
    const newGoal = await service.createGoal(g)
    setGoals(prev => [...prev, newGoal])
  }

  const updateGoal = async (id: string, g: Partial<Goal>) => {
    const service = getDataService()
    const updated = await service.updateGoal(id, g)
    setGoals(prev => prev.map(item => item.id === id ? updated : item))
  }

  const deleteGoal = async (id: string) => {
    const service = getDataService()
    await service.deleteGoal(id)
    setGoals(prev => prev.filter(item => item.id !== id))
  }

  const updateMemberRole = async (id: string, role: FamilyMember['role']) => {
    const service = getDataService()
    const updated = await service.updateFamilyMember(id, { role })
    setFamilyMembers(prev => prev.map(m => m.id === id ? updated : m))
  }

  const removeMember = async (id: string) => {
    const service = getDataService()
    await service.deleteFamilyMember(id)
    setFamilyMembers(prev => prev.filter(m => m.id !== id))
  }

  const addMember = async (m: Omit<FamilyMember, 'id'>) => {
    const service = getDataService()
    const newMember = await service.createFamilyMember(m)
    setFamilyMembers(prev => [...prev, newMember])
  }

  const updateMember = async (id: string, m: Partial<FamilyMember>) => {
    const service = getDataService()
    const updated = await service.updateFamilyMember(id, m)
    setFamilyMembers(prev => prev.map(item => item.id === id ? updated : item))
  }

  const loadCategories = async () => {
    const service = getDataService()
    const cats = await service.getCategories()
    setCategories(cats)
  }

  const createCategory = async (c: Omit<Category, 'id'>) => {
    const service = getDataService()
    const newCat = await service.createCategory(c)
    setCategories(prev => [...prev, newCat])
  }

  const updateCategory = async (id: string, c: Partial<Category>) => {
    const service = getDataService()
    const updated = await service.updateCategory(id, c)
    setCategories(prev => prev.map(item => item.id === id ? updated : item))
  }

  const deleteCategory = async (id: string) => {
    const service = getDataService()
    await service.deleteCategory(id)
    setCategories(prev => prev.filter(item => item.id !== id))
  }

  const loadAccounts = async () => {
    const service = getDataService()
    const accs = await service.getAccounts()
    setAccounts(accs)
  }

  return (
    <AppContext.Provider value={{
      transactions, assets, liabilities, budgets, goals, familyMembers, categories, accounts,
      loading, error, dataSource,
      addTransaction, updateTransaction, deleteTransaction,
      addAsset, updateAsset, deleteAsset,
      addLiability, updateLiability, deleteLiability,
      addBudget, updateBudget, deleteBudget,
      addGoal, updateGoal, deleteGoal,
      addMember, updateMember, updateMemberRole, removeMember,
      loadCategories, createCategory, updateCategory, deleteCategory,
      loadAccounts,
    }}>
      {children}
    </AppContext.Provider>
  )
}
