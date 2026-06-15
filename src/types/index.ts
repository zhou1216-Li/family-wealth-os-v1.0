// ─── Domain types ────────────────────────────────────────────────────────────

export type TransactionType = 'income' | 'expense' | 'transfer'
export type LiabilityType = '房贷' | '车贷' | '信用卡' | '花呗' | '网贷'
export type AssetType =
  | '银行卡' | '现金' | '微信' | '支付宝'
  | '股票' | '基金' | '黄金' | '房产' | '车辆' | '其他'
export type FamilyRole = 'admin' | 'editor' | 'viewer'
export type AccountType = 'checking' | 'savings' | 'investment' | 'credit' | 'cash'
export type CategoryType = 'income' | 'expense'

export interface Account {
  id: string
  name: string
  type: AccountType
  balance: number
  currency: string
  icon: string
  color: string
  institution: string
  notes: string
  createdAt: string
}

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
  /** 资产代码（股票代码/基金代码等） */
  code?: string
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

export interface Category {
  id: string
  name: string
  type: CategoryType
  icon: string
  color: string
}

export interface UserSettings {
  id: string
  userId: string
  emailNotifications: boolean
  pushNotifications: boolean
  weeklyReport: boolean
  monthlyReport: boolean
  budgetAlerts: boolean
  goalAlerts: boolean
  darkMode: boolean
  avatarUrl: string
  sessionTimeoutMinutes: number
  createdAt: string
  updatedAt: string
}

export interface LoginHistory {
  id: string
  userId: string
  ipAddress: string
  userAgent: string
  loginTime: string
  success: boolean
  errorMessage: string
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

// ─── Quantitative Analysis types ──────────────────────────────────────────────

export interface PortfolioAsset {
  id: string
  name: string
  type: AssetType
  weight: number
  expectedReturn: number
  volatility: number
  color: string
}

export interface Portfolio {
  id: string
  name: string
  assets: PortfolioAsset[]
  totalValue: number
  createdAt: string
  updatedAt: string
}

export interface RiskMetrics {
  standardDeviation: number
  var: number
  cvar: number
  beta: number
  sharpeRatio: number
  maxDrawdown: number
}

export interface PerformanceMetrics {
  totalReturn: number
  annualizedReturn: number
  sharpeRatio: number
  maxDrawdown: number
  volatility: number
  sortinoRatio: number
}

export interface EfficientFrontierPoint {
  return: number
  volatility: number
  weights: number[]
}

export interface OptimizationResult {
  targetReturn?: number
  targetRisk?: number
  weights: number[]
  expectedReturn: number
  volatility: number
  sharpeRatio: number
}

export interface BacktestResult {
  startDate: string
  endDate: string
  totalReturn: number
  annualizedReturn: number
  sharpeRatio: number
  maxDrawdown: number
  volatility: number
  winningRate: number
  profitFactor: number
  equityCurve: { date: string; value: number }[]
  trades: number
}

export interface AnalysisReport {
  portfolioName: string
  generatedAt: string
  riskMetrics: RiskMetrics
  performanceMetrics: PerformanceMetrics
  optimizationResult?: OptimizationResult
  backtestResult?: BacktestResult
  recommendations: string[]
}

export interface TimeSeriesData {
  date: string
  value: number
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'very_high'
