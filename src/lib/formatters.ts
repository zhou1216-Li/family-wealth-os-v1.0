export function fmtCurrency(value: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function fmtCompact(value: number): string {
  if (value >= 100000000) return `${(value / 100000000).toFixed(1)}亿`
  if (value >= 10000) return `${(value / 10000).toFixed(1)}万`
  return value.toLocaleString('zh-CN')
}

export function fmtPct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function fmtYearMonth(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
}

export function payoffMonths(amount: number, rate: number, monthlyPayment: number): number {
  if (monthlyPayment <= 0) return 0
  const monthlyRate = rate / 100 / 12
  if (monthlyRate === 0) return Math.ceil(amount / monthlyPayment)
  const n = -Math.log(1 - (monthlyRate * amount) / monthlyPayment) / Math.log(1 + monthlyRate)
  return Math.max(0, Math.ceil(n))
}
