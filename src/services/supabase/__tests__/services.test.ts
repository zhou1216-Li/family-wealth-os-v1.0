/**
 * Unit tests for Supabase CRUD services
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'

// Mock the supabase client
const mockSupabaseClient = {
  from: vi.fn(),
}

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabaseClient,
}))

describe('Transaction Service', () => {
  const mockTransactionRow = {
    id: 'test-id-123',
    type: 'expense',
    category: '餐饮',
    amount: 328,
    account_id: 'a1',
    user_id: 'u1',
    note: '测试交易',
    date: '2024-12-20',
  }

  beforeAll(() => {
    // Reset mocks before tests
    vi.clearAllMocks()
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  describe('getTransactions', () => {
    it('should fetch all transactions and map to correct format', async () => {
      const { getTransactions } = await import('@/services/supabase/transactionService')

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [mockTransactionRow],
            error: null,
          }),
        }),
      })

      const transactions = await getTransactions()

      expect(transactions).toHaveLength(1)
      expect(transactions[0]).toEqual({
        id: 'test-id-123',
        type: 'expense',
        category: '餐饮',
        amount: 328,
        accountId: 'a1',
        userId: 'u1',
        note: '测试交易',
        date: '2024-12-20',
      })
    })

    it('should throw error when fetch fails', async () => {
      const { getTransactions } = await import('@/services/supabase/transactionService')

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Network error' },
          }),
        }),
      })

      await expect(getTransactions()).rejects.toThrow('Failed to fetch transactions')
    })
  })

  describe('createTransaction', () => {
    it('should create a new transaction and return mapped result', async () => {
      const { createTransaction } = await import('@/services/supabase/transactionService')

      mockSupabaseClient.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockTransactionRow,
              error: null,
            }),
          }),
        }),
      })

      const input = {
        type: 'expense' as const,
        category: '餐饮',
        amount: 328,
        accountId: 'a1',
        userId: 'u1',
        note: '测试交易',
        date: '2024-12-20',
      }

      const result = await createTransaction(input)

      expect(result.id).toBe('test-id-123')
      expect(result.amount).toBe(328)
    })
  })

  describe('updateTransaction', () => {
    it('should update transaction and return updated result', async () => {
      const { updateTransaction } = await import('@/services/supabase/transactionService')

      const updatedRow = { ...mockTransactionRow, amount: 500 }

      mockSupabaseClient.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: updatedRow,
                error: null,
              }),
            }),
          }),
        }),
      })

      const result = await updateTransaction('test-id-123', { amount: 500 })

      expect(result.amount).toBe(500)
    })
  })

  describe('deleteTransaction', () => {
    it('should delete transaction without error', async () => {
      const { deleteTransaction } = await import('@/services/supabase/transactionService')

      mockSupabaseClient.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      })

      await expect(deleteTransaction('test-id-123')).resolves.toBeUndefined()
    })

    it('should throw error when delete fails', async () => {
      const { deleteTransaction } = await import('@/services/supabase/transactionService')

      mockSupabaseClient.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: { message: 'Delete failed' },
          }),
        }),
      })

      await expect(deleteTransaction('test-id-123')).rejects.toThrow('Failed to delete transaction')
    })
  })
})

describe('Asset Service', () => {
  const mockAssetRow = {
    id: 'asset-123',
    type: '银行卡',
    name: '测试银行',
    value: 50000,
    currency: 'CNY',
    icon: '🏦',
    color: '#e74c3c',
  }

  beforeAll(() => {
    vi.clearAllMocks()
  })

  describe('getAssets', () => {
    it('should fetch and map assets correctly', async () => {
      const { getAssets } = await import('@/services/supabase/assetService')

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [mockAssetRow],
            error: null,
          }),
        }),
      })

      const assets = await getAssets()

      expect(assets).toHaveLength(1)
      expect(assets[0].id).toBe('asset-123')
      expect(assets[0].name).toBe('测试银行')
    })
  })

  describe('createAsset', () => {
    it('should create asset with default values', async () => {
      const { createAsset } = await import('@/services/supabase/assetService')

      mockSupabaseClient.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockAssetRow,
              error: null,
            }),
          }),
        }),
      })

      const input = {
        type: '银行卡' as const,
        name: '测试银行',
        value: 50000,
      }

      const result = await createAsset(input)

      expect(result.id).toBe('asset-123')
      expect(result.currency).toBe('CNY')
    })
  })
})

describe('Budget Service', () => {
  const mockBudgetRow = {
    id: 'budget-123',
    category: '餐饮',
    monthly_limit: 3000,
    spent: 1500,
    icon: '🍽️',
    color: '#e74c3c',
  }

  beforeAll(() => {
    vi.clearAllMocks()
  })

  describe('calculateBudgetUsage', () => {
    it('should calculate usage percentage correctly', async () => {
      const { calculateBudgetUsage } = await import('@/services/supabase/budgetService')

      const budget = {
        id: 'b1',
        category: '餐饮',
        monthlyLimit: 3000,
        spent: 1500,
        icon: '🍽️',
        color: '#e74c3c',
      }

      expect(calculateBudgetUsage(budget)).toBe(50)
    })

    it('should cap usage at 100%', async () => {
      const { calculateBudgetUsage } = await import('@/services/supabase/budgetService')

      const budget = {
        id: 'b1',
        category: '餐饮',
        monthlyLimit: 1000,
        spent: 1500,
        icon: '🍽️',
        color: '#e74c3c',
      }

      expect(calculateBudgetUsage(budget)).toBe(100)
    })

    it('should return 0 when monthlyLimit is 0', async () => {
      const { calculateBudgetUsage } = await import('@/services/supabase/budgetService')

      const budget = {
        id: 'b1',
        category: '餐饮',
        monthlyLimit: 0,
        spent: 0,
        icon: '🍽️',
        color: '#e74c3c',
      }

      expect(calculateBudgetUsage(budget)).toBe(0)
    })
  })
})

describe('Goal Service', () => {
  beforeAll(() => {
    vi.clearAllMocks()
  })

  describe('calculateGoalProgress', () => {
    it('should calculate progress percentage correctly', async () => {
      const { calculateGoalProgress } = await import('@/services/supabase/goalService')

      const goal = {
        id: 'g1',
        name: '测试目标',
        targetAmount: 100000,
        currentAmount: 50000,
        targetDate: '2025-12-31',
        monthlyContribution: 5000,
        icon: '🎯',
        color: '#3498db',
      }

      expect(calculateGoalProgress(goal)).toBe(50)
    })

    it('should cap progress at 100%', async () => {
      const { calculateGoalProgress } = await import('@/services/supabase/goalService')

      const goal = {
        id: 'g1',
        name: '测试目标',
        targetAmount: 50000,
        currentAmount: 60000,
        targetDate: '2025-12-31',
        monthlyContribution: 5000,
        icon: '🎯',
        color: '#3498db',
      }

      expect(calculateGoalProgress(goal)).toBe(100)
    })
  })

  describe('getRemainingAmount', () => {
    it('should calculate remaining amount correctly', async () => {
      const { getRemainingAmount } = await import('@/services/supabase/goalService')

      const goal = {
        id: 'g1',
        name: '测试目标',
        targetAmount: 100000,
        currentAmount: 30000,
        targetDate: '2025-12-31',
        monthlyContribution: 5000,
        icon: '🎯',
        color: '#3498db',
      }

      expect(getRemainingAmount(goal)).toBe(70000)
    })

    it('should return 0 when currentAmount exceeds target', async () => {
      const { getRemainingAmount } = await import('@/services/supabase/goalService')

      const goal = {
        id: 'g1',
        name: '测试目标',
        targetAmount: 50000,
        currentAmount: 60000,
        targetDate: '2025-12-31',
        monthlyContribution: 5000,
        icon: '🎯',
        color: '#3498db',
      }

      expect(getRemainingAmount(goal)).toBe(0)
    })
  })
})

describe('Liability Service', () => {
  const mockLiabilityRow = {
    id: 'liab-123',
    type: '房贷',
    name: '测试房贷',
    total_amount: 1000000,
    amount: 800000,
    interest_rate: 4.5,
    monthly_payment: 5000,
    start_date: '2020-01-01',
    end_date: '2040-01-01',
    notes: '测试备注',
  }

  beforeAll(() => {
    vi.clearAllMocks()
  })

  describe('getLiabilities', () => {
    it('should fetch and map liabilities correctly', async () => {
      const { getLiabilities } = await import('@/services/supabase/liabilityService')

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [mockLiabilityRow],
            error: null,
          }),
        }),
      })

      const liabilities = await getLiabilities()

      expect(liabilities).toHaveLength(1)
      expect(liabilities[0].totalAmount).toBe(1000000)
      expect(liabilities[0].amount).toBe(800000)
    })
  })

  describe('getTotalLiabilitiesAmount', () => {
    it('should sum all liability amounts', async () => {
      const { getTotalLiabilitiesAmount } = await import('@/services/supabase/liabilityService')

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              { ...mockLiabilityRow, amount: 800000 },
              { ...mockLiabilityRow, id: 'liab-456', amount: 200000 },
            ],
            error: null,
          }),
        }),
      })

      const total = await getTotalLiabilitiesAmount()

      expect(total).toBe(1000000)
    })
  })
})

describe('Family Member Service', () => {
  const mockMemberRow = {
    id: 'member-123',
    name: '张三',
    role: 'admin',
    avatar: '张',
    email: 'zhang@example.com',
    join_date: '2024-01-01',
  }

  beforeAll(() => {
    vi.clearAllMocks()
  })

  describe('getFamilyMembers', () => {
    it('should fetch and map family members correctly', async () => {
      const { getFamilyMembers } = await import('@/services/supabase/familyMemberService')

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [mockMemberRow],
            error: null,
          }),
        }),
      })

      const members = await getFamilyMembers()

      expect(members).toHaveLength(1)
      expect(members[0].name).toBe('张三')
      expect(members[0].role).toBe('admin')
    })
  })
})
