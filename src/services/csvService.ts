import type { Transaction, Asset, Liability } from '@/types'

export interface ImportResult {
  success: number
  failed: number
  errors: string[]
}

export interface CSVValidationError {
  row: number
  field: string
  message: string
}

export function exportTransactions(transactions: Transaction[]): void {
  const headers = ['日期', '类型', '分类', '金额', '账户ID', '备注']
  const rows = transactions.map(t => [
    t.date,
    t.type,
    t.category,
    t.amount,
    t.accountId,
    t.note,
  ])
  downloadCSV(headers, rows, `transactions_${new Date().toISOString().split('T')[0]}`)
}

export function exportAssets(assets: Asset[]): void {
  const headers = ['类型', '名称', '价值', '货币', '图标', '颜色']
  const rows = assets.map(a => [
    a.type,
    a.name,
    a.value,
    a.currency,
    a.icon,
    a.color,
  ])
  downloadCSV(headers, rows, `assets_${new Date().toISOString().split('T')[0]}`)
}

export function exportLiabilities(liabilities: Liability[]): void {
  const headers = ['类型', '名称', '总金额', '剩余金额', '利率', '月还款', '开始日期', '到期日期', '备注']
  const rows = liabilities.map(l => [
    l.type,
    l.name,
    l.totalAmount,
    l.amount,
    l.interestRate,
    l.monthlyPayment,
    l.startDate,
    l.endDate,
    l.notes,
  ])
  downloadCSV(headers, rows, `liabilities_${new Date().toISOString().split('T')[0]}`)
}

export async function importTransactions(content: string): Promise<ImportResult> {
  const lines = parseCSV(content)
  if (lines.length === 0) {
    return { success: 0, failed: 0, errors: ['CSV内容为空'] }
  }

  const errors: string[] = []
  let successCount = 0
  const transactions: Omit<Transaction, 'id'>[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (line.length === 0 || line.every(cell => cell.trim() === '')) continue

    try {
      const validation = validateTransactionRow(line, i + 1)
      if (validation.length > 0) {
        errors.push(`第${i + 1}行: ${validation.map(v => v.message).join('; ')}`)
        continue
      }

      const transaction: Omit<Transaction, 'id'> = {
        date: line[0],
        type: line[1] as Transaction['type'],
        category: line[2],
        amount: parseFloat(line[3]),
        accountId: line[4],
        userId: 'u1',
        note: line[5] || '',
      }
      transactions.push(transaction)
      successCount++
    } catch (e) {
      errors.push(`第${i + 1}行: ${e instanceof Error ? e.message : '解析错误'}`)
    }
  }

  return {
    success: successCount,
    failed: lines.length - 1 - successCount - errors.length,
    errors,
  }
}

export async function importAssets(content: string): Promise<ImportResult> {
  const lines = parseCSV(content)
  if (lines.length === 0) {
    return { success: 0, failed: 0, errors: ['CSV内容为空'] }
  }

  const errors: string[] = []
  let successCount = 0

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (line.length === 0 || line.every(cell => cell.trim() === '')) continue

    try {
      const validation = validateAssetRow(line, i + 1)
      if (validation.length > 0) {
        errors.push(`第${i + 1}行: ${validation.map(v => v.message).join('; ')}`)
        continue
      }

      successCount++
    } catch (e) {
      errors.push(`第${i + 1}行: ${e instanceof Error ? e.message : '解析错误'}`)
    }
  }

  return {
    success: successCount,
    failed: lines.length - 1 - successCount,
    errors,
  }
}

export async function importLiabilities(content: string): Promise<ImportResult> {
  const lines = parseCSV(content)
  if (lines.length === 0) {
    return { success: 0, failed: 0, errors: ['CSV内容为空'] }
  }

  const errors: string[] = []
  let successCount = 0

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (line.length === 0 || line.every(cell => cell.trim() === '')) continue

    try {
      const validation = validateLiabilityRow(line, i + 1)
      if (validation.length > 0) {
        errors.push(`第${i + 1}行: ${validation.map(v => v.message).join('; ')}`)
        continue
      }

      successCount++
    } catch (e) {
      errors.push(`第${i + 1}行: ${e instanceof Error ? e.message : '解析错误'}`)
    }
  }

  return {
    success: successCount,
    failed: lines.length - 1 - successCount,
    errors,
  }
}

export function validateCSV(content: string, type: 'transaction' | 'asset' | 'liability'): CSVValidationError[] {
  const lines = parseCSV(content)
  const errors: CSVValidationError[] = []

  if (lines.length === 0) {
    return [{ row: 0, field: 'content', message: 'CSV内容为空' }]
  }

  const expectedHeaders: Record<string, string[]> = {
    transaction: ['日期', '类型', '分类', '金额', '账户ID', '备注'],
    asset: ['类型', '名称', '价值', '货币', '图标', '颜色'],
    liability: ['类型', '名称', '总金额', '剩余金额', '利率', '月还款', '开始日期', '到期日期', '备注'],
  }

  const headers = lines[0].map(h => h.trim())
  const expected = expectedHeaders[type]

  headers.forEach((header, index) => {
    if (index < expected.length && header !== expected[index]) {
      errors.push({ row: 1, field: `列${index + 1}`, message: `期望表头 "${expected[index]}"，实际为 "${header}"` })
    }
  })

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (line.length === 0 || line.every(cell => cell.trim() === '')) continue

    const rowErrors = type === 'transaction' 
      ? validateTransactionRow(line, i + 1)
      : type === 'asset' 
        ? validateAssetRow(line, i + 1)
        : validateLiabilityRow(line, i + 1)
    
    errors.push(...rowErrors)
  }

  return errors
}

function validateTransactionRow(row: string[], lineNumber: number): CSVValidationError[] {
  const errors: CSVValidationError[] = []
  
  if (!row[0] || !/^\d{4}-\d{2}-\d{2}$/.test(row[0])) {
    errors.push({ row: lineNumber, field: '日期', message: '日期格式不正确，应为 YYYY-MM-DD' })
  }

  if (!row[1] || !['income', 'expense', 'transfer'].includes(row[1])) {
    errors.push({ row: lineNumber, field: '类型', message: '类型必须为 income、expense 或 transfer' })
  }

  if (!row[2] || row[2].trim() === '') {
    errors.push({ row: lineNumber, field: '分类', message: '分类不能为空' })
  }

  if (!row[3] || isNaN(parseFloat(row[3]))) {
    errors.push({ row: lineNumber, field: '金额', message: '金额必须为数字' })
  }

  if (!row[4] || row[4].trim() === '') {
    errors.push({ row: lineNumber, field: '账户ID', message: '账户ID不能为空' })
  }

  return errors
}

function validateAssetRow(row: string[], lineNumber: number): CSVValidationError[] {
  const errors: CSVValidationError[] = []
  const assetTypes = ['银行卡', '现金', '微信', '支付宝', '股票', '基金', '黄金', '房产', '车辆', '其他']

  if (!row[0] || !assetTypes.includes(row[0])) {
    errors.push({ row: lineNumber, field: '类型', message: `类型必须是 ${assetTypes.join('、')} 之一` })
  }

  if (!row[1] || row[1].trim() === '') {
    errors.push({ row: lineNumber, field: '名称', message: '名称不能为空' })
  }

  if (!row[2] || isNaN(parseFloat(row[2]))) {
    errors.push({ row: lineNumber, field: '价值', message: '价值必须为数字' })
  }

  if (!row[3] || !['CNY', 'USD', 'EUR'].includes(row[3])) {
    errors.push({ row: lineNumber, field: '货币', message: '货币必须为 CNY、USD 或 EUR' })
  }

  return errors
}

function validateLiabilityRow(row: string[], lineNumber: number): CSVValidationError[] {
  const errors: CSVValidationError[] = []
  const liabilityTypes = ['房贷', '车贷', '信用卡', '花呗', '网贷']

  if (!row[0] || !liabilityTypes.includes(row[0])) {
    errors.push({ row: lineNumber, field: '类型', message: `类型必须是 ${liabilityTypes.join('、')} 之一` })
  }

  if (!row[1] || row[1].trim() === '') {
    errors.push({ row: lineNumber, field: '名称', message: '名称不能为空' })
  }

  if (!row[2] || isNaN(parseFloat(row[2]))) {
    errors.push({ row: lineNumber, field: '总金额', message: '总金额必须为数字' })
  }

  if (!row[3] || isNaN(parseFloat(row[3]))) {
    errors.push({ row: lineNumber, field: '剩余金额', message: '剩余金额必须为数字' })
  }

  if (!row[4] || isNaN(parseFloat(row[4]))) {
    errors.push({ row: lineNumber, field: '利率', message: '利率必须为数字' })
  }

  if (!row[5] || isNaN(parseFloat(row[5]))) {
    errors.push({ row: lineNumber, field: '月还款', message: '月还款必须为数字' })
  }

  if (!row[6] || !/^\d{4}-\d{2}-\d{2}$/.test(row[6])) {
    errors.push({ row: lineNumber, field: '开始日期', message: '开始日期格式不正确，应为 YYYY-MM-DD' })
  }

  if (!row[7] || !/^\d{4}-\d{2}-\d{2}$/.test(row[7])) {
    errors.push({ row: lineNumber, field: '到期日期', message: '到期日期格式不正确，应为 YYYY-MM-DD' })
  }

  return errors
}

function parseCSV(content: string): string[][] {
  const lines = content.split('\n').filter(line => line.trim() !== '')
  return lines.map(line => parseCSVLine(line))
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"' && !inQuotes) {
      inQuotes = true
    } else if (char === '"' && inQuotes) {
      if (line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = false
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }

  result.push(current)
  return result.map(cell => cell.trim())
}

function downloadCSV(headers: string[], rows: (string | number)[][], filename: string): void {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      const str = String(cell)
      return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str
    }).join(',')),
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
