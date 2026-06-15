'use client'

import type { Transaction } from '@/types'
import { fmtCurrency } from '@/lib/formatters'

interface TransactionCardProps {
  transaction: Transaction
}

const categoryIcons: Record<string, string> = {
  '餐饮': '🍜',
  '购物': '🛒',
  '交通': '🚗',
  '娱乐': '🎮',
  '教育': '📚',
  '医疗': '🏥',
  '通讯': '📱',
  '水电': '💡',
  '工资': '💼',
  '奖金': '🎁',
  '投资': '📈',
  '其他': '💰',
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const icon = categoryIcons[transaction.category] || '💰'
  const isIncome = transaction.type === 'income'
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer group">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg bg-secondary">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">{transaction.category}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${isIncome ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
            {isIncome ? '收入' : '支出'}
          </span>
        </div>
        {transaction.note && (
          <div className="text-xs text-muted-foreground truncate mt-0.5">
            {transaction.note}
          </div>
        )}
        <div className="text-xs text-muted-foreground mt-0.5">
          {new Date(transaction.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
        </div>
      </div>
      <div className={`text-sm font-medium ${isIncome ? 'text-green-400' : 'text-foreground'}`}>
        {isIncome ? '+' : '-'}{fmtCurrency(transaction.amount)}
      </div>
    </div>
  )
}
