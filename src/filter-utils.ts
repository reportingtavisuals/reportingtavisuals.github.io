import type { FigureRecord } from './data'
import type { AppFilters } from './types'

export function filterFigures(figures: FigureRecord[], filters: AppFilters) {
  return figures.filter((figure) => {
    if (filters.years.length > 0 && !filters.years.includes(figure.year)) {
      return false
    }

    if (
      filters.dataTags.length > 0 &&
      !matchesTaxonomyMode(filters.dataTags, figure.dataTags, filters.taxonomyMode)
    ) {
      return false
    }

    if (
      filters.visualTags.length > 0 &&
      !matchesTaxonomyMode(
        filters.visualTags,
        figure.visualTags,
        filters.taxonomyMode,
      )
    ) {
      return false
    }

    return true
  })
}

export function buildYearCounts(figures: FigureRecord[], years: number[]) {
  const index = new Map<number, Set<number>>()

  for (const year of years) {
    index.set(year, new Set<number>())
  }

  for (const figure of figures) {
    const papers = index.get(figure.year)
    if (papers) {
      papers.add(figure.paperIndex)
    }
  }

  return years.map((year) => ({
    year,
    count: index.get(year)?.size ?? 0,
  }))
}

export function countUniquePapers(figures: FigureRecord[]) {
  return new Set(figures.map((figure) => figure.paperIndex)).size
}

function matchesTaxonomyMode(
  selectedKeys: string[],
  tags: FigureRecord['dataTags'],
  mode: AppFilters['taxonomyMode'],
) {
  return mode === 'and'
    ? selectedKeys.every((selectedTag) =>
        tags.some((tag) => tag.key === selectedTag),
      )
    : selectedKeys.some((selectedTag) =>
        tags.some((tag) => tag.key === selectedTag),
      )
}
