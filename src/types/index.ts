// ─── Domain types ────────────────────────────────────────────────────────────

export type TransactionType = 'income' | 'expense' | 'transfer'
export type LiabilityType = '房贷' | '车贷' | '信用卡' | '花呗' | '网贷'
export type AssetType =
  | '银行卡' | '现金' | '微信' | '支付宝'
  | '股票' | '基金' | '黄金' | '房产' | '车辆' | '其他'
export type FamilyRole = 'admin' | 'editor' | 'viewer'

export interface Transaction {
  id: string
  type: TransactionType
  category: string
  amount: number
  accountId: string
  userId: string
  note: string
  date: string
}

export interface Asset {
  id: string
  type: AssetType
  name: string
  value: number
  currency: string
  icon: string
  color: string
}

export interface Liability {
  id: string
  type: LiabilityType
  name: string
  /** Original loan / credit limit */
  totalAmount: number
  /** Current remaining balance */
  amount: number
  interestRate: number
  monthlyPayment: number
  startDate: string
  endDate: string
  notes: string
}

export interface Budget {
  id: string
  category: string
  monthlyLimit: number
  spent: number
  icon: string
  color: string
}

export interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  monthlyContribution: number
  icon: string
  color: string
}

export interface FamilyMember {
  id: string
  name: string
  role: FamilyRole
  avatar: string
  email: string
  joinDate: string
}

// ─── Chart / UI types ────────────────────────────────────────────────────────

export interface MonthlyDataPoint {
  month: string
  income: number
  expense: number
  savings: number
}

export interface NetWorthDataPoint {
  month: string
  value: number
}

export interface CategoryDataPoint {
  name: string
  value: number
  color: string
}
