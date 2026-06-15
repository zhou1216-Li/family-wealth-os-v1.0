import type {
  Transaction, Asset, Liability, Budget, Goal, FamilyMember, Category, Account,
  MonthlyDataPoint, NetWorthDataPoint, CategoryDataPoint,
} from '@/types'

// ─── Transactions ─────────────────────────────────────────────────────────────

export const initialTransactions: Transaction[] = [
  { id: 't1',  type: 'expense', category: '餐饮',    amount: 328,   accountId: 'a1', userId: 'u1', note: '家庭晚餐 · 外婆家',      date: '2024-12-20' },
  { id: 't2',  type: 'expense', category: '购物',    amount: 1280,  accountId: 'a2', userId: 'u2', note: '孩子冬季衣服',           date: '2024-12-19' },
  { id: 't3',  type: 'income',  category: '工资',    amount: 22000, accountId: 'a1', userId: 'u1', note: '12月工资',              date: '2024-12-18' },
  { id: 't4',  type: 'expense', category: '交通',    amount: 156,   accountId: 'a3', userId: 'u1', note: '滴滴出行',              date: '2024-12-18' },
  { id: 't5',  type: 'expense', category: '教育',    amount: 2400,  accountId: 'a1', userId: 'u2', note: '英语培训班',            date: '2024-12-17' },
  { id: 't6',  type: 'income',  category: '工资',    amount: 13000, accountId: 'a1', userId: 'u2', note: '12月工资',              date: '2024-12-16' },
  { id: 't7',  type: 'expense', category: '医疗',    amount: 680,   accountId: 'a1', userId: 'u1', note: '年度体检',              date: '2024-12-15' },
  { id: 't8',  type: 'expense', category: '房贷',    amount: 9200,  accountId: 'a1', userId: 'u1', note: '12月房贷还款',          date: '2024-12-15' },
  { id: 't9',  type: 'expense', category: '娱乐',    amount: 498,   accountId: 'a4', userId: 'u1', note: '爱奇艺 + 网飞订阅',     date: '2024-12-14' },
  { id: 't10', type: 'income',  category: '投资收益', amount: 3200,  accountId: 'a5', userId: 'u1', note: '基金分红',              date: '2024-12-13' },
  { id: 't11', type: 'expense', category: '餐饮',    amount: 420,   accountId: 'a3', userId: 'u2', note: '朋友聚餐',              date: '2024-12-12' },
  { id: 't12', type: 'expense', category: '通讯',    amount: 298,   accountId: 'a3', userId: 'u1', note: '手机话费',              date: '2024-12-11' },
  { id: 't13', type: 'expense', category: '水电',    amount: 486,   accountId: 'a1', userId: 'u1', note: '水电煤气费',            date: '2024-12-10' },
  { id: 't14', type: 'transfer',category: '转账',    amount: 5000,  accountId: 'a1', userId: 'u1', note: '转入支付宝',            date: '2024-12-09' },
  { id: 't15', type: 'expense', category: '餐饮',    amount: 218,   accountId: 'a4', userId: 'u1', note: '午餐外卖',              date: '2024-12-08' },
  { id: 't16', type: 'expense', category: '购物',    amount: 3680,  accountId: 'a2', userId: 'u2', note: '双十二购物节',          date: '2024-12-07' },
  { id: 't17', type: 'income',  category: '奖金',    amount: 8000,  accountId: 'a1', userId: 'u1', note: '年终奖金（预发）',      date: '2024-12-05' },
  { id: 't18', type: 'expense', category: '保险',    amount: 1200,  accountId: 'a1', userId: 'u1', note: '健康险保费',            date: '2024-12-03' },
  { id: 't19', type: 'expense', category: '交通',    amount: 680,   accountId: 'a1', userId: 'u2', note: '孩子上学校车费',        date: '2024-12-02' },
  { id: 't20', type: 'expense', category: '餐饮',    amount: 168,   accountId: 'a4', userId: 'u1', note: '超市采购',              date: '2024-12-01' },
  { id: 't21', type: 'expense', category: '房贷',    amount: 9200,  accountId: 'a1', userId: 'u1', note: '11月房贷还款',          date: '2024-11-15' },
  { id: 't22', type: 'income',  category: '工资',    amount: 22000, accountId: 'a1', userId: 'u1', note: '11月工资',              date: '2024-11-14' },
  { id: 't23', type: 'income',  category: '工资',    amount: 13000, accountId: 'a1', userId: 'u2', note: '11月工资',              date: '2024-11-14' },
  { id: 't24', type: 'expense', category: '教育',    amount: 2400,  accountId: 'a1', userId: 'u2', note: '钢琴课',               date: '2024-11-10' },
  { id: 't25', type: 'expense', category: '医疗',    amount: 320,   accountId: 'a3', userId: 'u2', note: '感冒就医',              date: '2024-11-08' },
  { id: 't26', type: 'expense', category: '娱乐',    amount: 860,   accountId: 'a4', userId: 'u1', note: '周末看演出',            date: '2024-11-06' },
  { id: 't27', type: 'income',  category: '投资收益', amount: 1850,  accountId: 'a5', userId: 'u1', note: '股票分红',              date: '2024-11-04' },
  { id: 't28', type: 'expense', category: '餐饮',    amount: 956,   accountId: 'a3', userId: 'u1', note: '家庭聚餐',              date: '2024-11-02' },
  { id: 't29', type: 'expense', category: '购物',    amount: 2100,  accountId: 'a2', userId: 'u1', note: '家电维修',              date: '2024-10-28' },
  { id: 't30', type: 'expense', category: '交通',    amount: 1800,  accountId: 'a1', userId: 'u1', note: '国庆出行机票',          date: '2024-10-01' },
]

// ─── Assets ───────────────────────────────────────────────────────────────────

export const initialAssets: Asset[] = [
  { id: 'a1', type: '银行卡', name: '招商银行储蓄卡',  value: 120000,   currency: 'CNY', icon: '🏦', color: '#e74c3c' },
  { id: 'a2', type: '银行卡', name: '工商银行',        value: 38000,    currency: 'CNY', icon: '🏦', color: '#c0392b' },
  { id: 'a3', type: '微信',   name: '微信零钱',        value: 3200,     currency: 'CNY', icon: '💬', color: '#2ecc71' },
  { id: 'a4', type: '支付宝', name: '支付宝余额宝',    value: 28000,    currency: 'CNY', icon: '💰', color: '#3498db' },
  { id: 'a5', type: '股票',   name: 'A股股票账户',     value: 85000,    currency: 'CNY', icon: '📈', color: '#e67e22' },
  { id: 'a6', type: '基金',   name: '公募基金',        value: 60000,    currency: 'CNY', icon: '📊', color: '#9b59b6' },
  { id: 'a7', type: '黄金',   name: '黄金投资',        value: 15000,    currency: 'CNY', icon: '🥇', color: '#f39c12' },
  { id: 'a8', type: '房产',   name: '上海住宅',        value: 2800000,  currency: 'CNY', icon: '🏠', color: '#1abc9c' },
  { id: 'a9', type: '车辆',   name: 'Tesla Model 3',  value: 220000,   currency: 'CNY', icon: '🚗', color: '#34495e' },
  { id: 'a10',type: '现金',   name: '现金',            value: 5000,     currency: 'CNY', icon: '💵', color: '#27ae60' },
]

// ─── Liabilities ──────────────────────────────────────────────────────────────

export const initialLiabilities: Liability[] = [
  {
    id: 'l1', type: '房贷', name: '上海住宅房贷',
    totalAmount: 2100000, amount: 1850000,
    interestRate: 4.1, monthlyPayment: 9200,
    startDate: '2020-06-01', endDate: '2050-06-01',
    notes: '等额还款，每月15日自动扣款',
  },
  {
    id: 'l2', type: '车贷', name: 'Tesla 车贷',
    totalAmount: 150000, amount: 45000,
    interestRate: 5.5, monthlyPayment: 2100,
    startDate: '2023-03-01', endDate: '2025-03-01',
    notes: '即将还清',
  },
  {
    id: 'l3', type: '信用卡', name: '招行信用卡',
    totalAmount: 50000, amount: 8500,
    interestRate: 18.0, monthlyPayment: 8500,
    startDate: '2024-12-01', endDate: '2025-01-10',
    notes: '账单日10号，还款日次月10号',
  },
]

// ─── Budgets ──────────────────────────────────────────────────────────────────

export const initialBudgets: Budget[] = [
  { id: 'b1', category: '餐饮',    monthlyLimit: 3000, spent: 2090, icon: '🍽️', color: '#e74c3c' },
  { id: 'b2', category: '购物',    monthlyLimit: 2000, spent: 4960, icon: '🛍️', color: '#3498db' },
  { id: 'b3', category: '交通',    monthlyLimit: 1000, spent: 836,  icon: '🚗', color: '#2ecc71' },
  { id: 'b4', category: '娱乐',    monthlyLimit: 800,  spent: 498,  icon: '🎮', color: '#9b59b6' },
  { id: 'b5', category: '教育',    monthlyLimit: 3000, spent: 4800, icon: '📚', color: '#f39c12' },
  { id: 'b6', category: '医疗',    monthlyLimit: 1000, spent: 680,  icon: '🏥', color: '#1abc9c' },
  { id: 'b7', category: '通讯',    monthlyLimit: 400,  spent: 298,  icon: '📱', color: '#e67e22' },
  { id: 'b8', category: '水电',    monthlyLimit: 600,  spent: 486,  icon: '💡', color: '#16a085' },
]

// ─── Goals ────────────────────────────────────────────────────────────────────

export const initialGoals: Goal[] = [
  { id: 'g1', name: '孩子大学教育基金', targetAmount: 500000, currentAmount: 88000,   targetDate: '2033-09-01', monthlyContribution: 3500,  icon: '🎓', color: '#3498db' },
  { id: 'g2', name: '出国旅游基金',     targetAmount: 80000,  currentAmount: 32000,   targetDate: '2025-07-01', monthlyContribution: 5000,  icon: '✈️', color: '#2ecc71' },
  { id: 'g3', name: '应急储备金',       targetAmount: 200000, currentAmount: 163000,  targetDate: '2025-06-01', monthlyContribution: 8000,  icon: '🛡️', color: '#e67e22' },
  { id: 'g4', name: '提前退休目标',     targetAmount: 8000000,currentAmount: 1432700, targetDate: '2040-01-01', monthlyContribution: 15000, icon: '🏖️', color: '#9b59b6' },
]

// ─── Family ───────────────────────────────────────────────────────────────────

export const initialFamilyMembers: FamilyMember[] = [
  { id: 'u1', name: '张伟',   role: 'admin',  avatar: '张', email: 'zhangwei@gmail.com', joinDate: '2023-01-01' },
  { id: 'u2', name: '李娜',   role: 'editor', avatar: '李', email: 'lina@gmail.com',      joinDate: '2023-01-01' },
  { id: 'u3', name: '张小明', role: 'viewer', avatar: '明', email: '',                    joinDate: '2024-03-15' },
]

// ─── Categories ────────────────────────────────────────────────────────────────

export const initialCategories: Category[] = [
  { id: 'c1',  name: '工资',        type: 'income',  icon: '💼', color: '#2ecc71' },
  { id: 'c2',  name: '奖金',        type: 'income',  icon: '🎁', color: '#f39c12' },
  { id: 'c3',  name: '投资收益',    type: 'income',  icon: '📈', color: '#3498db' },
  { id: 'c4',  name: '副业',        type: 'income',  icon: '💡', color: '#9b59b6' },
  { id: 'c5',  name: '其他收入',    type: 'income',  icon: '💰', color: '#1abc9c' },
  { id: 'c6',  name: '餐饮',        type: 'expense', icon: '🍽️', color: '#e74c3c' },
  { id: 'c7',  name: '购物',        type: 'expense', icon: '🛍️', color: '#3498db' },
  { id: 'c8',  name: '交通',        type: 'expense', icon: '🚗', color: '#2ecc71' },
  { id: 'c9',  name: '娱乐',        type: 'expense', icon: '🎮', color: '#9b59b6' },
  { id: 'c10', name: '教育',        type: 'expense', icon: '📚', color: '#f39c12' },
  { id: 'c11', name: '医疗',        type: 'expense', icon: '🏥', color: '#1abc9c' },
  { id: 'c12', name: '通讯',        type: 'expense', icon: '📱', color: '#e67e22' },
  { id: 'c13', name: '水电',        type: 'expense', icon: '💡', color: '#16a085' },
  { id: 'c14', name: '房租',        type: 'expense', icon: '🏠', color: '#c0392b' },
  { id: 'c15', name: '房贷',        type: 'expense', icon: '🏢', color: '#e74c3c' },
  { id: 'c16', name: '车贷',        type: 'expense', icon: '🚘', color: '#34495e' },
  { id: 'c17', name: '信用卡还款',  type: 'expense', icon: '💳', color: '#9b59b6' },
  { id: 'c18', name: '礼物',        type: 'expense', icon: '🎁', color: '#f1c40f' },
  { id: 'c19', name: '旅游',        type: 'expense', icon: '✈️', color: '#3498db' },
  { id: 'c20', name: '其他支出',    type: 'expense', icon: '📦', color: '#7f8c8d' },
]

export const initialAccounts: Account[] = [
  { id: 'acc1', name: '招商银行储蓄卡', type: 'checking', balance: 85000,   currency: 'CNY', icon: '🏦', color: '#e74c3c', institution: '招商银行', notes: '', createdAt: '2023-01-01' },
  { id: 'acc2', name: '工商银行储蓄卡', type: 'checking', balance: 42000,   currency: 'CNY', icon: '🏦', color: '#3498db', institution: '工商银行', notes: '', createdAt: '2023-01-01' },
  { id: 'acc3', name: '微信零钱',       type: 'cash',    balance: 5200,    currency: 'CNY', icon: '💬', color: '#2ecc71', institution: '微信支付', notes: '', createdAt: '2023-06-15' },
  { id: 'acc4', name: '支付宝余额宝',   type: 'savings', balance: 38000,   currency: 'CNY', icon: '💰', color: '#3498db', institution: '蚂蚁金服', notes: '', createdAt: '2023-03-01' },
  { id: 'acc5', name: '证券账户',       type: 'investment', balance: 145000, currency: 'CNY', icon: '📈', color: '#e67e22', institution: '华泰证券', notes: '', createdAt: '2022-06-01' },
  { id: 'acc6', name: '基金账户',       type: 'investment', balance: 60000,  currency: 'CNY', icon: '📊', color: '#9b59b6', institution: '天天基金', notes: '', createdAt: '2022-09-01' },
  { id: 'acc7', name: '招行信用卡',     type: 'credit',  balance: -8500,   currency: 'CNY', icon: '💳', color: '#e74c3c', institution: '招商银行', notes: '', createdAt: '2023-04-01' },
]

// ─── Chart data ───────────────────────────────────────────────────────────────

export const monthlyData: MonthlyDataPoint[] = [
  { month: '1月',  income: 28000, expense: 18500, savings: 9500  },
  { month: '2月',  income: 28000, expense: 12000, savings: 16000 },
  { month: '3月',  income: 30500, expense: 19800, savings: 10700 },
  { month: '4月',  income: 28000, expense: 17200, savings: 10800 },
  { month: '5月',  income: 28000, expense: 20100, savings: 7900  },
  { month: '6月',  income: 32000, expense: 21300, savings: 10700 },
  { month: '7月',  income: 28000, expense: 22500, savings: 5500  },
  { month: '8月',  income: 28000, expense: 16800, savings: 11200 },
  { month: '9月',  income: 29500, expense: 18900, savings: 10600 },
  { month: '10月', income: 28000, expense: 23100, savings: 4900  },
  { month: '11月', income: 31000, expense: 19500, savings: 11500 },
  { month: '12月', income: 35000, expense: 21800, savings: 13200 },
]

export const netWorthTrend: NetWorthDataPoint[] = [
  { month: '1月',  value: 1180000 },
  { month: '2月',  value: 1196000 },
  { month: '3月',  value: 1206700 },
  { month: '4月',  value: 1217500 },
  { month: '5月',  value: 1225400 },
  { month: '6月',  value: 1292100 },
  { month: '7月',  value: 1297600 },
  { month: '8月',  value: 1308800 },
  { month: '9月',  value: 1319400 },
  { month: '10月', value: 1324300 },
  { month: '11月', value: 1335800 },
  { month: '12月', value: 1432700 },
]

export const categoryData: CategoryDataPoint[] = [
  { name: '餐饮',   value: 2090, color: '#e74c3c' },
  { name: '购物',   value: 4960, color: '#3498db' },
  { name: '交通',   value: 836,  color: '#2ecc71' },
  { name: '教育',   value: 4800, color: '#f39c12' },
  { name: '医疗',   value: 680,  color: '#1abc9c' },
  { name: '娱乐',   value: 498,  color: '#9b59b6' },
  { name: '房贷',   value: 9200, color: '#e67e22' },
  { name: '其他',   value: 1736, color: '#95a5a6' },
]
