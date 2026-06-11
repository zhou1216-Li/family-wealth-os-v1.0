'use client'

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-sm text-foreground font-medium mb-2">{title}</h3>
      <p className="text-xs text-muted-foreground text-center mb-6 max-w-xs">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors shadow shadow-primary/20"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
