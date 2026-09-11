export type TabId = 'survey' | 'reference' | 'about'

export type AppFilters = {
  years: number[]
  dataTags: string[]
  visualTags: string[]
  taxonomyMode: 'and' | 'or'
}
