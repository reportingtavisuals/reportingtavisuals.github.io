import type { ReactNode } from 'react'

export function StatCard({
  label,
  value,
  wide = false,
}: {
  label: string
  value: number | string
  wide?: boolean
}) {
  return (
    <div className={`stat-card${wide ? ' is-wide' : ''}`}>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  )
}

export function SummaryPill({ children }: { children: ReactNode }) {
  return <span className="summary-pill">{children}</span>
}

export function IconActionButton({
  iconClass,
  label,
  onClick,
  small = false,
}: {
  iconClass: string
  label: string
  onClick: () => void
  small?: boolean
}) {
  return (
    <button
      aria-label={label}
      className={`icon-action-button${small ? ' is-small' : ''}`}
      data-tooltip={label}
      onClick={onClick}
      type="button"
    >
      <i aria-hidden="true" className={`fas ${iconClass}`} />
    </button>
  )
}

export function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      className={`tab-button${active ? ' is-active' : ''}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}
