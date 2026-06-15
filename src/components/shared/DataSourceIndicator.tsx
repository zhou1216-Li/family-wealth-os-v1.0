'use client'

import { useApp } from '@/contexts/AppContext'

export function DataSourceIndicator() {
  const { dataSource, error } = useApp()

  if (dataSource === 'supabase') {
    return (
      <div className="fixed bottom-3 right-3 z-50 flex items-center gap-1.5 rounded-full bg-green-500/10 px-2 py-1 text-[10px] text-green-500 border border-green-500/20">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500"></span>
        </span>
        云端
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed bottom-3 right-3 z-50 flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-2 py-1 text-[10px] text-yellow-500 border border-yellow-500/20">
        <span className="relative flex h-1.5 w-1.5">
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-yellow-500"></span>
        </span>
        本地
      </div>
    )
  }

  return (
    <div className="fixed bottom-3 right-3 z-50 flex items-center gap-1.5 rounded-full bg-gray-500/10 px-2 py-1 text-[10px] text-gray-500 border border-gray-500/20">
      <span className="relative flex h-1.5 w-1.5">
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gray-500"></span>
      </span>
      加载
    </div>
  )
}

export function LoadingOverlay() {
  const { loading } = useApp()

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
        <p className="text-sm text-muted-foreground">加载数据中...</p>
      </div>
    </div>
  )
}
