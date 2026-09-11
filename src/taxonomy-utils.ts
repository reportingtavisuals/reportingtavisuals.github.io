import type { CSSProperties } from 'react'
import type { TaxonomyTag } from './data'

export function buildTaxonomyTooltip(_label: string, definition: string) {
  return definition.trim()
}

export function formatItemLabel(item: string) {
  return item.replace(/([A-Za-z]+)(\d+)/, '$1 $2')
}

export function truncateText(value: string, limit: number) {
  return value.length > limit ? `${value.slice(0, limit)}...` : value
}

export function getVisualIconClass(group: string) {
  switch (group.toLowerCase()) {
    case 'grid':
      return 'fa-table'
    case 'chart':
      return 'fa-chart-bar'
    case 'image':
      return 'fa-image'
    case 'diagram':
      return 'fa-sitemap'
    case 'mscvis':
      return 'fa-minus-square'
    default:
      return 'fa-tag'
  }
}

export function getTagStyle(
  tag: Pick<TaxonomyTag, 'group'>,
  domain: 'data' | 'visual',
): CSSProperties | undefined {
  if (domain === 'visual') {
    return undefined
  }

  const color = getDataThemeColor(tag.group)

  return {
    backgroundColor: hexToRgba(color, 0.14),
    borderColor: hexToRgba(color, 0.3),
    color,
  }
}

export function getDataThemeColor(group: string) {
  switch (group.toLowerCase()) {
    case 'theme':
      return '#4E79A7'
    case 'concept':
      return '#F28E2B'
    case 'quantitative':
      return '#59A14F'
    default:
      return '#6f5a4a'
  }
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '')
  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}
