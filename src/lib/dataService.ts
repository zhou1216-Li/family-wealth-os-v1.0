/**
 * 数据层抽象 - 支持多种数据源
 * 当前支持: Mock数据 (开发) / Supabase (生产)
 */

import type { Transaction, Asset, Liability, Budget, Goal, FamilyMember, Category, Account } from '@/types'
import {
  initialTransactions, initialAssets, initialLiabilities,
  initialBudgets, initialGoals, initialFamilyMembers, initialCategories, initialAccounts,
} from '@/data/mockData'

// Supabase 服务导入
import {
  getTransactions as supabaseGetTransactions,
  createTransaction as supabaseCreateTransaction,
  updateTransaction as supabaseUpdateTransaction,
  deleteTransaction as supabaseDeleteTransaction,
} from '@/services/supabase/transactionService'

import {
  getAccounts as supabaseGetAccounts,
} from '@/services/supabase/accountService'

import {
  getAssets as supabaseGetAssets,
  createAsset as supabaseCreateAsset,
  updateAsset as supabaseUpdateAsset,
  deleteAsset as supabaseDeleteAsset,
} from '@/services/supabase/assetService'

import {
  getLiabilities as supabaseGetLiabilities,
  createLiability as supabaseCreateLiability,
  updateLiability as supabaseUpdateLiability,
  deleteLiability as supabaseDeleteLiability,
} from '@/services/supabase/liabilityService'

import {
  getBudgets as supabaseGetBudgets,
  createBudget as supabaseCreateBudget,
  updateBudget as supabaseUpdateBudget,
  deleteBudget as supabaseDeleteBudget,
} from '@/services/supabase/budgetService'

import {
  getGoals as supabaseGetGoals,
  createGoal as supabaseCreateGoal,
  updateGoal as supabaseUpdateGoal,
  deleteGoal as supabaseDeleteGoal,
} from '@/services/supabase/goalService'

import {
  getFamilyMembers as supabaseGetFamilyMembers,
  createFamilyMember as supabaseCreateFamilyMember,
  updateFamilyMember as supabaseUpdateFamilyMember,
  deleteFamilyMember as supabaseDeleteFamilyMember,
} from '@/services/supabase/familyMemberService'

import {
  getCategories as supabaseGetCategories,
  getCategoriesByType as supabaseGetCategoriesByType,
  createCategory as supabaseCreateCategory,
  updateCategory as supabaseUpdateCategory,
  deleteCategory as supabaseDeleteCategory,
} from '@/services/supabase/categoryService'

export type DataSource = 'supabase' | 'mock'

export interface DataService {
  // Transactions
  getTransactions(): Promise<Transaction[]>
  createTransaction(data: Omit<Transaction, 'id'>): Promise<Transaction>
  updateTransaction(id: string, data: Partial<Transaction>): Promise<Transaction>
  deleteTransaction(id: string): Promise<void>

  // Assets
  getAssets(): Promise<Asset[]>
  createAsset(data: Omit<Asset, 'id'>): Promise<Asset>
  updateAsset(id: string, data: Partial<Asset>): Promise<Asset>
  deleteAsset(id: string): Promise<void>

  // Liabilities
  getLiabilities(): Promise<Liability[]>
  createLiability(data: Omit<Liability, 'id'>): Promise<Liability>
  updateLiability(id: string, data: Partial<Liability>): Promise<Liability>
  deleteLiability(id: string): Promise<void>

  // Budgets
  getBudgets(): Promise<Budget[]>
  createBudget(data: Omit<Budget, 'id'>): Promise<Budget>
  updateBudget(id: string, data: Partial<Budget>): Promise<Budget>
  deleteBudget(id: string): Promise<void>

  // Goals
  getGoals(): Promise<Goal[]>
  createGoal(data: Omit<Goal, 'id'>): Promise<Goal>
  updateGoal(id: string, data: Partial<Goal>): Promise<Goal>
  deleteGoal(id: string): Promise<void>

  // Family Members
  getFamilyMembers(): Promise<FamilyMember[]>
  createFamilyMember(data: Omit<FamilyMember, 'id'>): Promise<FamilyMember>
  updateFamilyMember(id: string, data: Partial<FamilyMember>): Promise<FamilyMember>
  deleteFamilyMember(id: string): Promise<void>

  // Categories
  getCategories(): Promise<Category[]>
  getCategoriesByType(type: 'income' | 'expense'): Promise<Category[]>
  createCategory(data: Omit<Category, 'id'>): Promise<Category>
  updateCategory(id: string, data: Partial<Category>): Promise<Category>
  deleteCategory(id: string): Promise<void>

  // Accounts
  getAccounts(): Promise<Account[]>

  // 初始化和连接测试
  connect(): Promise<boolean>
  getDataSource(): DataSource
}

// Mock 数据服务实现
class MockDataService implements DataService {
  private transactions = [...initialTransactions]
  private assets = [...initialAssets]
  private liabilities = [...initialLiabilities]
  private budgets = [...initialBudgets]
  private goals = [...initialGoals]
  private familyMembers = [...initialFamilyMembers]
  private categories = [...initialCategories]
  private accounts = [...initialAccounts]

  async connect(): Promise<boolean> {
    return true
  }

  getDataSource(): DataSource {
    return 'mock'
  }

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    return [...this.transactions]
  }

  async createTransaction(data: Omit<Transaction, 'id'>): Promise<Transaction> {
    const newTx = { ...data, id: `t_${Date.now()}` }
    this.transactions.unshift(newTx)
    return newTx
  }

  async updateTransaction(id: string, data: Partial<Transaction>): Promise<Transaction> {
    const index = this.transactions.findIndex(t => t.id === id)
    if (index >= 0) {
      this.transactions[index] = { ...this.transactions[index], ...data }
      return this.transactions[index]
    }
    throw new Error('Transaction not found')
  }

  async deleteTransaction(id: string): Promise<void> {
    this.transactions = this.transactions.filter(t => t.id !== id)
  }

  // Assets
  async getAssets(): Promise<Asset[]> {
    return [...this.assets]
  }

  async createAsset(data: Omit<Asset, 'id'>): Promise<Asset> {
    const newAsset = { ...data, id: `a_${Date.now()}` }
    this.assets.push(newAsset)
    return newAsset
  }

  async updateAsset(id: string, data: Partial<Asset>): Promise<Asset> {
    const index = this.assets.findIndex(a => a.id === id)
    if (index >= 0) {
      this.assets[index] = { ...this.assets[index], ...data }
      return this.assets[index]
    }
    throw new Error('Asset not found')
  }

  async deleteAsset(id: string): Promise<void> {
    this.assets = this.assets.filter(a => a.id !== id)
  }

  // Liabilities
  async getLiabilities(): Promise<Liability[]> {
    return [...this.liabilities]
  }

  async createLiability(data: Omit<Liability, 'id'>): Promise<Liability> {
    const newLiab = { ...data, id: `l_${Date.now()}` }
    this.liabilities.push(newLiab)
    return newLiab
  }

  async updateLiability(id: string, data: Partial<Liability>): Promise<Liability> {
    const index = this.liabilities.findIndex(l => l.id === id)
    if (index >= 0) {
      this.liabilities[index] = { ...this.liabilities[index], ...data }
      return this.liabilities[index]
    }
    throw new Error('Liability not found')
  }

  async deleteLiability(id: string): Promise<void> {
    this.liabilities = this.liabilities.filter(l => l.id !== id)
  }

  // Budgets
  async getBudgets(): Promise<Budget[]> {
    return [...this.budgets]
  }

  async createBudget(data: Omit<Budget, 'id'>): Promise<Budget> {
    const newBudget = { ...data, id: `b_${Date.now()}` }
    this.budgets.push(newBudget)
    return newBudget
  }

  async updateBudget(id: string, data: Partial<Budget>): Promise<Budget> {
    const index = this.budgets.findIndex(b => b.id === id)
    if (index >= 0) {
      this.budgets[index] = { ...this.budgets[index], ...data }
      return this.budgets[index]
    }
    throw new Error('Budget not found')
  }

  async deleteBudget(id: string): Promise<void> {
    this.budgets = this.budgets.filter(b => b.id !== id)
  }

  // Goals
  async getGoals(): Promise<Goal[]> {
    return [...this.goals]
  }

  async createGoal(data: Omit<Goal, 'id'>): Promise<Goal> {
    const newGoal = { ...data, id: `g_${Date.now()}` }
    this.goals.push(newGoal)
    return newGoal
  }

  async updateGoal(id: string, data: Partial<Goal>): Promise<Goal> {
    const index = this.goals.findIndex(g => g.id === id)
    if (index >= 0) {
      this.goals[index] = { ...this.goals[index], ...data }
      return this.goals[index]
    }
    throw new Error('Goal not found')
  }

  async deleteGoal(id: string): Promise<void> {
    this.goals = this.goals.filter(g => g.id !== id)
  }

  // Family Members
  async getFamilyMembers(): Promise<FamilyMember[]> {
    return [...this.familyMembers]
  }

  async createFamilyMember(data: Omit<FamilyMember, 'id'>): Promise<FamilyMember> {
    const newMember = { ...data, id: `fm_${Date.now()}` }
    this.familyMembers.push(newMember)
    return newMember
  }

  async updateFamilyMember(id: string, data: Partial<FamilyMember>): Promise<FamilyMember> {
    const index = this.familyMembers.findIndex(m => m.id === id)
    if (index >= 0) {
      this.familyMembers[index] = { ...this.familyMembers[index], ...data }
      return this.familyMembers[index]
    }
    throw new Error('Family member not found')
  }

  async deleteFamilyMember(id: string): Promise<void> {
    this.familyMembers = this.familyMembers.filter(m => m.id !== id)
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return [...this.categories]
  }

  async getCategoriesByType(type: 'income' | 'expense'): Promise<Category[]> {
    return this.categories.filter(c => c.type === type)
  }

  async createCategory(data: Omit<Category, 'id'>): Promise<Category> {
    const existing = this.categories.find(c => c.name === data.name && c.type === data.type)
    if (existing) {
      throw new Error(`Category "${data.name}" already exists`)
    }
    const newCategory = { ...data, id: `cat_${Date.now()}` }
    this.categories.push(newCategory)
    return newCategory
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    const index = this.categories.findIndex(c => c.id === id)
    if (index >= 0) {
      this.categories[index] = { ...this.categories[index], ...data }
      return this.categories[index]
    }
    throw new Error('Category not found')
  }

  async deleteCategory(id: string): Promise<void> {
    this.categories = this.categories.filter(c => c.id !== id)
  }

  // Accounts
  async getAccounts(): Promise<Account[]> {
    return [...this.accounts]
  }
}

// Supabase 数据服务实现
class SupabaseDataService implements DataService {
  async connect(): Promise<boolean> {
    try {
      await this.getTransactions()
      return true
    } catch {
      return false
    }
  }

  getDataSource(): DataSource {
    return 'supabase'
  }

  async getTransactions(): Promise<Transaction[]> {
    return supabaseGetTransactions()
  }

  async createTransaction(data: Omit<Transaction, 'id'>): Promise<Transaction> {
    return supabaseCreateTransaction({
      type: data.type,
      category: data.category,
      amount: data.amount,
      accountId: data.accountId,
      userId: data.userId,
      note: data.note,
      date: data.date,
    })
  }

  async updateTransaction(id: string, data: Partial<Transaction>): Promise<Transaction> {
    return supabaseUpdateTransaction(id, {
      type: data.type,
      category: data.category,
      amount: data.amount,
      accountId: data.accountId,
      userId: data.userId,
      note: data.note,
      date: data.date,
    })
  }

  async deleteTransaction(id: string): Promise<void> {
    return supabaseDeleteTransaction(id)
  }

  async getAssets(): Promise<Asset[]> {
    return supabaseGetAssets()
  }

  async createAsset(data: Omit<Asset, 'id'>): Promise<Asset> {
    return supabaseCreateAsset({
      type: data.type,
      name: data.name,
      value: data.value,
      currency: data.currency,
      icon: data.icon,
      color: data.color,
    })
  }

  async updateAsset(id: string, data: Partial<Asset>): Promise<Asset> {
    return supabaseUpdateAsset(id, {
      type: data.type,
      name: data.name,
      value: data.value,
      currency: data.currency,
      icon: data.icon,
      color: data.color,
    })
  }

  async deleteAsset(id: string): Promise<void> {
    return supabaseDeleteAsset(id)
  }

  async getLiabilities(): Promise<Liability[]> {
    return supabaseGetLiabilities()
  }

  async createLiability(data: Omit<Liability, 'id'>): Promise<Liability> {
    return supabaseCreateLiability({
      type: data.type,
      name: data.name,
      totalAmount: data.totalAmount,
      amount: data.amount,
      interestRate: data.interestRate,
      monthlyPayment: data.monthlyPayment,
      startDate: data.startDate,
      endDate: data.endDate,
      notes: data.notes,
    })
  }

  async updateLiability(id: string, data: Partial<Liability>): Promise<Liability> {
    return supabaseUpdateLiability(id, {
      type: data.type,
      name: data.name,
      totalAmount: data.totalAmount,
      amount: data.amount,
      interestRate: data.interestRate,
      monthlyPayment: data.monthlyPayment,
      startDate: data.startDate,
      endDate: data.endDate,
      notes: data.notes,
    })
  }

  async deleteLiability(id: string): Promise<void> {
    return supabaseDeleteLiability(id)
  }

  async getBudgets(): Promise<Budget[]> {
    return supabaseGetBudgets()
  }

  async createBudget(data: Omit<Budget, 'id'>): Promise<Budget> {
    return supabaseCreateBudget({
      category: data.category,
      monthlyLimit: data.monthlyLimit,
      spent: data.spent,
      icon: data.icon,
      color: data.color,
    })
  }

  async updateBudget(id: string, data: Partial<Budget>): Promise<Budget> {
    return supabaseUpdateBudget(id, {
      category: data.category,
      monthlyLimit: data.monthlyLimit,
      spent: data.spent,
      icon: data.icon,
      color: data.color,
    })
  }

  async deleteBudget(id: string): Promise<void> {
    return supabaseDeleteBudget(id)
  }

  async getGoals(): Promise<Goal[]> {
    return supabaseGetGoals()
  }

  async createGoal(data: Omit<Goal, 'id'>): Promise<Goal> {
    return supabaseCreateGoal({
      name: data.name,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount,
      targetDate: data.targetDate,
      monthlyContribution: data.monthlyContribution,
      icon: data.icon,
      color: data.color,
    })
  }

  async updateGoal(id: string, data: Partial<Goal>): Promise<Goal> {
    return supabaseUpdateGoal(id, {
      name: data.name,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount,
      targetDate: data.targetDate,
      monthlyContribution: data.monthlyContribution,
      icon: data.icon,
      color: data.color,
    })
  }

  async deleteGoal(id: string): Promise<void> {
    return supabaseDeleteGoal(id)
  }

  async getFamilyMembers(): Promise<FamilyMember[]> {
    return supabaseGetFamilyMembers()
  }

  async createFamilyMember(data: Omit<FamilyMember, 'id'>): Promise<FamilyMember> {
    return supabaseCreateFamilyMember({
      name: data.name,
      role: data.role,
      avatar: data.avatar,
      email: data.email,
      joinDate: data.joinDate,
    })
  }

  async updateFamilyMember(id: string, data: Partial<FamilyMember>): Promise<FamilyMember> {
    return supabaseUpdateFamilyMember(id, {
      name: data.name,
      role: data.role,
      avatar: data.avatar,
      email: data.email,
      joinDate: data.joinDate,
    })
  }

  async deleteFamilyMember(id: string): Promise<void> {
    return supabaseDeleteFamilyMember(id)
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return supabaseGetCategories()
  }

  async getCategoriesByType(type: 'income' | 'expense'): Promise<Category[]> {
    return supabaseGetCategoriesByType(type)
  }

  async createCategory(data: Omit<Category, 'id'>): Promise<Category> {
    return supabaseCreateCategory({
      name: data.name,
      type: data.type,
      icon: data.icon,
      color: data.color,
    })
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    return supabaseUpdateCategory(id, {
      name: data.name,
      type: data.type,
      icon: data.icon,
      color: data.color,
    })
  }

  async deleteCategory(id: string): Promise<void> {
    return supabaseDeleteCategory(id)
  }

  // Accounts
  async getAccounts(): Promise<Account[]> {
    return supabaseGetAccounts()
  }
}

// 数据服务工厂
let dataService: DataService | null = null

export async function initializeDataService(): Promise<DataService> {
  // 检查是否强制使用 Mock 数据
  const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

  if (useMockData) {
    console.log('📦 Using mock data (NEXT_PUBLIC_USE_MOCK_DATA=true)')
    dataService = new MockDataService()
    return dataService
  }

  // 优先尝试 Supabase
  const supabaseService = new SupabaseDataService()
  const isConnected = await supabaseService.connect()

  if (isConnected) {
    console.log('✅ Connected to Supabase')
    dataService = supabaseService
  } else {
    console.warn('⚠️ Supabase connection failed, using mock data')
    dataService = new MockDataService()
  }

  return dataService
}

export function getDataService(): DataService {
  if (!dataService) {
    // 同步返回 mock 服务，直到初始化完成
    dataService = new MockDataService()
  }
  return dataService
}

export function getDataSourceName(): string {
  return getDataService().getDataSource()
}
