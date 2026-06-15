'use client'

import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { DataSourceIndicator, LoadingOverlay } from './DataSourceIndicator'
import { SessionTimeoutWarning } from './SessionTimeoutWarning'

interface MainLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export function MainLayout({ children, title, subtitle }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 pb-20 md:pb-8">
        <Header title={title} subtitle={subtitle} />
        {children}
      </main>
      <LoadingOverlay />
      <DataSourceIndicator />
      <SessionTimeoutWarning />
    </div>
  )
}
