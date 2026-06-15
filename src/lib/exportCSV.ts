/**
 * CSV Export Utilities
 * 提供数据导出为 CSV 格式的功能
 */

/**
 * 将数据数组导出为 CSV 文件并触发下载
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; header: string }[]
): void {
  if (data.length === 0) {
    console.warn('No data to export')
    return
  }

  // 如果没有指定列，使用所有键
  const cols = columns || (Object.keys(data[0]) as (keyof T)[]).map(key => ({
    key,
    header: String(key),
  }))

  // 构建 CSV 头部
  const headers = cols.map(col => escapeCSVValue(col.header)).join(',')

  // 构建 CSV 行
  const rows = data.map(row =>
    cols.map(col => {
      const value = row[col.key]
      return escapeCSVValue(formatCSVValue(value))
    }).join(',')
  )

  // 组合 CSV 内容
  const csvContent = [headers, ...rows].join('\n')

  // 添加 BOM 以支持 UTF-8 中文
  const bom = '\uFEFF'
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })

  // 创建下载链接
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // 清理 URL
  URL.revokeObjectURL(url)
}

/**
 * 转义 CSV 值
 */
function escapeCSVValue(value: string): string {
  // 如果值包含逗号、引号或换行符，需要用引号包裹
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    // 双引号转义
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * 格式化 CSV 值
 */
function formatCSVValue(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }
  if (value instanceof Date) {
    return value.toISOString().split('T')[0]
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}

/**
 * 导出交易记录
 */
export function exportTransactions(transactions: {
  id: string
  type: string
  category: string
  amount: number
  accountId: string
  note: string
  date: string
}[]): void {
  exportToCSV(transactions, `transactions_${new Date().toISOString().split('T')[0]}`, [
    { key: 'date', header: '日期' },
    { key: 'type', header: '类型' },
    { key: 'category', header: '分类' },
    { key: 'amount', header: '金额' },
    { key: 'accountId', header: '账户' },
    { key: 'note', header: '备注' },
  ])
}

/**
 * 导出资产记录
 */
export function exportAssets(assets: {
  id: string
  type: string
  name: string
  value: number
  currency: string
}[]): void {
  exportToCSV(assets, `assets_${new Date().toISOString().split('T')[0]}`, [
    { key: 'name', header: '名称' },
    { key: 'type', header: '类型' },
    { key: 'value', header: '价值' },
    { key: 'currency', header: '货币' },
  ])
}

/**
 * 导出负债记录
 */
export function exportLiabilities(liabilities: {
  id: string
  type: string
  name: string
  totalAmount: number
  amount: number
  interestRate: number
}[]): void {
  exportToCSV(liabilities, `liabilities_${new Date().toISOString().split('T')[0]}`, [
    { key: 'name', header: '名称' },
    { key: 'type', header: '类型' },
    { key: 'totalAmount', header: '总额' },
    { key: 'amount', header: '剩余' },
    { key: 'interestRate', header: '利率(%)' },
  ])
}

/**
 * 导出预算记录
 */
export function exportBudgets(budgets: {
  id: string
  category: string
  monthlyLimit: number
  spent: number
}[]): void {
  exportToCSV(budgets, `budgets_${new Date().toISOString().split('T')[0]}`, [
    { key: 'category', header: '分类' },
    { key: 'monthlyLimit', header: '月度限额' },
    { key: 'spent', header: '已支出' },
  ])
}

/**
 * 导出目标记录
 */
export function exportGoals(goals: {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string
}[]): void {
  exportToCSV(goals, `goals_${new Date().toISOString().split('T')[0]}`, [
    { key: 'name', header: '名称' },
    { key: 'targetAmount', header: '目标金额' },
    { key: 'currentAmount', header: '当前金额' },
    { key: 'targetDate', header: '目标日期' },
  ])
}
