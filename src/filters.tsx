import { useEffect, useRef, useState } from 'react'
import type {
  AppData,
  FigureRecord,
  TaxonomyDomain,
  TaxonomyFilterGroup,
} from './data'
import { filterFigures } from './filter-utils'
import {
  buildTaxonomyTooltip,
  getDataThemeColor,
  getTagStyle,
  getVisualIconClass,
} from './taxonomy-utils'
import type { AppFilters } from './types'
import { IconActionButton } from './ui'

type FiltersPanelProps = {
  data: AppData
  filters: AppFilters
  yearCounts: Array<{ year: number; count: number }>
  isPending: boolean
  onClosePanel: () => void
  onReset: () => void
  onResetYear: () => void
  onResetData: () => void
  onResetVisual: () => void
  onResetMatrix: () => void
  onToggleTaxonomyMode: () => void
  onToggleYear: (year: number) => void
  onToggleDataTag: (tagKey: string) => void
  onToggleDataGroup: (tagKeys: string[]) => void
  onToggleVisualTag: (tagKey: string) => void
  onToggleVisualGroup: (tagKeys: string[]) => void
  onToggleMatrixCell: (dataTagKey: string, visualTagKey: string) => void
}

export function FiltersPanel({
  data,
  filters,
  yearCounts,
  isPending,
  onClosePanel,
  onReset,
  onResetYear,
  onResetData,
  onResetVisual,
  onResetMatrix,
  onToggleTaxonomyMode,
  onToggleYear,
  onToggleDataTag,
  onToggleDataGroup,
  onToggleVisualTag,
  onToggleVisualGroup,
  onToggleMatrixCell,
}: FiltersPanelProps) {
  const filterPanelRef = useRef<HTMLElement | null>(null)
  const [sectionOpen, setSectionOpen] = useState({
    year: false,
    data: false,
    visual: false,
    matrix: false,
  })

  const toggleSection = (section: keyof typeof sectionOpen) => {
    setSectionOpen((current) => ({
      ...current,
      [section]: !current[section],
    }))
  }

  const taxonomyScopeFigures = filterFigures(data.figures, {
    ...filters,
    dataTags: [],
    visualTags: [],
  })
  const dataTaxonomyCounts = buildTaxonomyCounts(taxonomyScopeFigures, 'data')
  const visualTaxonomyCounts = buildTaxonomyCounts(
    taxonomyScopeFigures,
    'visual',
  )

  useEffect(() => {
    const panel = filterPanelRef.current

    if (!panel) {
      return
    }

    let frameId = 0

    const updateAvailableHeight = () => {
      frameId = 0
      const panelTop = panel.getBoundingClientRect().top
      const bottomGap = 10
      const minimumHeight = 260
      const availableHeight = Math.max(
        window.innerHeight - panelTop - bottomGap,
        minimumHeight,
      )

      panel.style.setProperty(
        '--filter-available-height',
        `${availableHeight}px`,
      )
    }

    const requestUpdate = () => {
      if (frameId !== 0) {
        return
      }

      frameId = window.requestAnimationFrame(updateAvailableHeight)
    }

    requestUpdate()

    const resizeObserver = new ResizeObserver(() => {
      requestUpdate()
    })

    resizeObserver.observe(panel)
    window.addEventListener('resize', requestUpdate)
    window.addEventListener('scroll', requestUpdate, { passive: true })

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId)
      }

      resizeObserver.disconnect()
      window.removeEventListener('resize', requestUpdate)
      window.removeEventListener('scroll', requestUpdate)
    }
  }, [sectionOpen])

  return (
    <section className="filter-panel" ref={filterPanelRef}>
      <div className="filter-panel-header">
        <div className="panel-title-row">
          <h2 className="panel-title">Filters</h2>
        </div>
        <div className="filter-panel-controls">
          {isPending ? <span className="pending-badge">Updating…</span> : null}
          <button
            aria-label={`Taxonomy mode ${filters.taxonomyMode.toUpperCase()}`}
            className={`filter-mode-toggle${
              filters.taxonomyMode === 'or' ? ' is-alt' : ''
            }`}
            onClick={onToggleTaxonomyMode}
            type="button"
          >
            {filters.taxonomyMode.toUpperCase()}
          </button>
          <IconActionButton
            iconClass="fa-chevron-left"
            label="Hide filters"
            onClick={onClosePanel}
          />
          <IconActionButton
            iconClass="fa-rotate-right"
            label="Clear filters"
            onClick={onReset}
          />
        </div>
      </div>
      <div className="filter-panel-body">
          <section className="filter-section">
            <div className="section-header">
              <div className="section-header-top">
                <h3 className="section-title">Year</h3>
                <div className="section-controls">
                  <IconActionButton
                    iconClass={sectionOpen.year ? 'fa-chevron-up' : 'fa-chevron-down'}
                    label={sectionOpen.year ? 'Hide year filter' : 'Show year filter'}
                    onClick={() => toggleSection('year')}
                    small
                  />
                  <IconActionButton
                    iconClass="fa-rotate-right"
                    label="Reset year filter"
                    onClick={onResetYear}
                    small
                  />
                </div>
              </div>
              {sectionOpen.year ? (
                <p className="section-copy">
                  Click a bar to toggle year-based filtering.
                </p>
              ) : null}
            </div>
            {sectionOpen.year ? (
              <YearBarChart
                counts={yearCounts}
                selectedYears={filters.years}
                onToggleYear={onToggleYear}
              />
            ) : null}
          </section>

          <TaxonomyFilterSection
            copy="Choose data types to filter the figure set."
            domain="data"
            groupCounts={dataTaxonomyCounts.groupCounts}
            groups={data.dataGroups}
            isOpen={sectionOpen.data}
            optionCounts={dataTaxonomyCounts.optionCounts}
            onReset={onResetData}
            onToggleOpen={() => toggleSection('data')}
            selectedKeys={filters.dataTags}
            title="Data type taxonomy"
            onToggleGroup={onToggleDataGroup}
            onToggle={onToggleDataTag}
          />

          <TaxonomyFilterSection
            copy="Choose visual encodings to filter the figure set."
            domain="visual"
            groupCounts={visualTaxonomyCounts.groupCounts}
            groups={data.visualGroups}
            isOpen={sectionOpen.visual}
            optionCounts={visualTaxonomyCounts.optionCounts}
            onReset={onResetVisual}
            onToggleOpen={() => toggleSection('visual')}
            selectedKeys={filters.visualTags}
            title="Visual encoding taxonomy"
            onToggleGroup={onToggleVisualGroup}
            onToggle={onToggleVisualTag}
          />

          <section className="filter-section filter-section-matrix">
            <div className="section-header">
              <div className="section-header-top">
                <h3 className="section-title">Data × Visual</h3>
                <div className="section-controls">
                  <IconActionButton
                    iconClass={sectionOpen.matrix ? 'fa-chevron-up' : 'fa-chevron-down'}
                    label={sectionOpen.matrix ? 'Hide Data × Visual' : 'Show Data × Visual'}
                    onClick={() => toggleSection('matrix')}
                    small
                  />
                  <IconActionButton
                    iconClass="fa-rotate-right"
                    label="Reset Data × Visual"
                    onClick={onResetMatrix}
                    small
                  />
                </div>
              </div>
              {sectionOpen.matrix ? (
                <p className="section-copy">
                  Click a cell to add both filters. Click row or column headers
                  to add visual or data tags.
                </p>
              ) : null}
            </div>
            {sectionOpen.matrix ? (
              <OverlapMatrix
                dataGroups={data.dataGroups}
                figures={taxonomyScopeFigures}
                filters={filters}
                onToggleDataGroup={onToggleDataGroup}
                onToggleDataTag={onToggleDataTag}
                onToggleMatrixCell={onToggleMatrixCell}
                onToggleVisualGroup={onToggleVisualGroup}
                onToggleVisualTag={onToggleVisualTag}
                visualGroups={data.visualGroups}
              />
            ) : null}
          </section>
        </div>
    </section>
  )
}

type TaxonomyFilterSectionProps = {
  title: string
  copy: string
  domain: 'data' | 'visual'
  groupCounts: Map<string, number>
  groups: TaxonomyFilterGroup[]
  isOpen: boolean
  optionCounts: Map<string, number>
  onReset: () => void
  onToggleOpen: () => void
  selectedKeys: string[]
  onToggleGroup: (tagKeys: string[]) => void
  onToggle: (tagKey: string) => void
}

function TaxonomyFilterSection({
  title,
  copy,
  domain,
  groupCounts,
  groups,
  isOpen,
  optionCounts,
  onReset,
  onToggleOpen,
  selectedKeys,
  onToggleGroup,
  onToggle,
}: TaxonomyFilterSectionProps) {
  return (
    <section className="filter-section">
      <div className="section-header">
        <div className="section-header-top">
          <h3 className="section-title">{title}</h3>
          <div className="section-controls">
            <IconActionButton
              iconClass={isOpen ? 'fa-chevron-up' : 'fa-chevron-down'}
              label={isOpen ? `Hide ${title}` : `Show ${title}`}
              onClick={onToggleOpen}
              small
            />
            <IconActionButton
              iconClass="fa-rotate-right"
              label={`Reset ${title}`}
              onClick={onReset}
              small
            />
          </div>
        </div>
        {isOpen ? <p className="section-copy">{copy}</p> : null}
      </div>
      {isOpen ? (
        <div className="taxonomy-tree">
          {groups.map((group) => {
            const groupTagKeys = group.options.map((option) => option.key)
            const allSelected =
              groupTagKeys.length > 0 &&
              groupTagKeys.every((tagKey) => selectedKeys.includes(tagKey))

            return (
              <div className="taxonomy-tree-group" key={group.key}>
                <button
                  aria-pressed={allSelected}
                  className={`taxonomy-tree-node taxonomy-tree-node-group ${
                    domain === 'data' ? 'is-data' : 'is-visual'
                  }${allSelected ? ' is-active' : ''}`}
                  style={
                    domain === 'data' ? getTagStyle({ group: group.label }, 'data') : undefined
                  }
                  onClick={() => onToggleGroup(groupTagKeys)}
                  type="button"
                >
                  <div className="taxonomy-tree-copy">
                    <div className="taxonomy-tree-heading">
                      {domain === 'visual' ? (
                        <i
                          aria-hidden="true"
                          className={`fas ${getVisualIconClass(group.label)}`}
                        />
                      ) : null}
                      <h4 className="taxonomy-tree-title">{group.label}</h4>
                    </div>
                    {group.definition ? (
                      <p className="taxonomy-tree-definition">{group.definition}</p>
                    ) : null}
                  </div>
                  <span className="taxonomy-tree-count">
                    {groupCounts.get(group.key) ?? 0}
                  </span>
                </button>
                <ul className="taxonomy-tree-children">
                  {group.options.map((option) => {
                    const active = selectedKeys.includes(option.key)
                    const classes = [
                      'taxonomy-tree-node',
                      'taxonomy-tree-node-leaf',
                      domain === 'data' ? 'is-data' : 'is-visual',
                      active ? 'is-active' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')

                    return (
                      <li className="taxonomy-tree-item" key={option.key}>
                        <button
                          aria-pressed={active}
                          className={classes}
                          style={getTagStyle(option, domain)}
                          onClick={() => onToggle(option.key)}
                          type="button"
                        >
                          <div className="taxonomy-tree-copy">
                            <div className="taxonomy-tree-heading">
                              {domain === 'visual' ? (
                                <i
                                  aria-hidden="true"
                                  className={`fas ${getVisualIconClass(option.group)}`}
                                />
                              ) : null}
                              <span className="taxonomy-tree-label">{option.label}</span>
                            </div>
                            {option.definition ? (
                              <p className="taxonomy-tree-definition">
                                {option.definition}
                              </p>
                            ) : null}
                          </div>
                          <span className="taxonomy-tree-count">
                            {optionCounts.get(option.key) ?? 0}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}

type YearBarChartProps = {
  counts: Array<{ year: number; count: number }>
  selectedYears: number[]
  onToggleYear: (year: number) => void
}

function YearBarChart({ counts, selectedYears, onToggleYear }: YearBarChartProps) {
  const maxCount = Math.max(...counts.map((entry) => entry.count), 1)
  const chartClassName = [
    'year-chart',
    counts.length >= 18 ? 'is-dense' : '',
    counts.length >= 24 ? 'is-cramped' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={chartClassName}>
      <div className="year-bars" role="list" aria-label="Paper counts by year">
        {counts.map((entry) => {
          const height = `${Math.max((entry.count / maxCount) * 100, 6)}%`
          const active = selectedYears.includes(entry.year)
          return (
            <button
              aria-pressed={active}
              className={`year-bar${active ? ' is-active' : ''}`}
              key={entry.year}
              onClick={() => onToggleYear(entry.year)}
              type="button"
            >
              <span className="year-bar-track">
                <span
                  className="year-bar-fill"
                  data-count={entry.count}
                  style={{ height }}
                />
              </span>
              <span className="year-bar-label">{entry.year}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function OverlapMatrix({
  dataGroups,
  figures,
  filters,
  onToggleDataGroup,
  onToggleDataTag,
  onToggleMatrixCell,
  onToggleVisualGroup,
  onToggleVisualTag,
  visualGroups,
}: {
  dataGroups: TaxonomyFilterGroup[]
  figures: FigureRecord[]
  filters: AppFilters
  onToggleDataGroup: (tagKeys: string[]) => void
  onToggleDataTag: (tagKey: string) => void
  onToggleMatrixCell: (dataTagKey: string, visualTagKey: string) => void
  onToggleVisualGroup: (tagKeys: string[]) => void
  onToggleVisualTag: (tagKey: string) => void
  visualGroups: TaxonomyFilterGroup[]
}) {
  const dataOptions = dataGroups.flatMap((group) => group.options)
  const orderedVisualGroups = sortVisualGroupsForMatrix(visualGroups)
  const visualOptions = orderedVisualGroups.flatMap((group) => group.options)
  const maxCount = Math.max(
    1,
    ...visualOptions.flatMap((visualOption) =>
      dataOptions.map((dataOption) =>
        countOverlap(figures, dataOption.key, visualOption.key),
      ),
    ),
  )

  return (
    <section className="matrix-panel">
      <div className="matrix-header">
        <p className="matrix-copy">
          Counts reflect the current year filter. Click a cell to
          add both filters, or click a row or column label to add one taxonomy
          side at a time.
        </p>
      </div>

      <div className="matrix-scroll">
        <table className="overlap-table">
          <colgroup>
            <col className="matrix-group-col" />
            <col className="matrix-header-col" />
            {dataOptions.map((dataOption) => (
              <col className="matrix-value-col" key={dataOption.key} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th className="matrix-corner" colSpan={2} rowSpan={2} scope="col">
                <span className="sr-only">Data by visual overlap matrix</span>
              </th>
              {dataGroups.map((group) => (
                <th
                  className="matrix-col-header matrix-col-header-group"
                  colSpan={group.options.length}
                  key={group.key}
                  scope="colgroup"
                >
                  <button
                    aria-label={`Add ${group.label} data filter`}
                    aria-pressed={group.options.every((option) =>
                      filters.dataTags.includes(option.key),
                    )}
                    className={`matrix-col-header-button matrix-col-group-button${
                      group.options.every((option) =>
                        filters.dataTags.includes(option.key),
                      )
                        ? ' is-active'
                        : ''
                    }`}
                    onClick={() =>
                      onToggleDataGroup(group.options.map((option) => option.key))
                    }
                    type="button"
                  >
                    <span
                      className="matrix-col-group"
                      style={{ color: getDataThemeColor(group.label) }}
                    >
                      {group.label}
                    </span>
                  </button>
                </th>
              ))}
            </tr>
            <tr>
              {dataGroups.flatMap((group) =>
                group.options.map((option) => (
                  <th
                    className="matrix-col-header matrix-col-header-leaf"
                    key={option.key}
                    scope="col"
                    title={option.label}
                  >
                    <button
                      aria-label={`Add ${option.label} data filter`}
                      aria-pressed={filters.dataTags.includes(option.key)}
                      className={`matrix-col-header-button${
                        filters.dataTags.includes(option.key) ? ' is-active' : ''
                      }`}
                      onClick={() => onToggleDataTag(option.key)}
                      title={buildTaxonomyTooltip(option.label, option.definition)}
                      type="button"
                    >
                      <span
                        className="matrix-col-label matrix-col-label-abbr"
                        style={{ color: getDataThemeColor(option.group) }}
                      >
                        {getDataAbbreviation(option.label)}
                      </span>
                    </button>
                  </th>
                )),
              )}
            </tr>
          </thead>
          <tbody>
            {orderedVisualGroups.map((group) =>
              group.options.map((visualOption, index) => (
                <tr key={visualOption.key}>
                  {index === 0 ? (
                    <th
                      className={`matrix-row-group-header${
                        group.label === 'MscVis' ? ' is-empty' : ''
                      }`}
                      rowSpan={group.options.length}
                      scope="rowgroup"
                    >
                      <button
                        aria-label={`Add ${group.label} visual filter`}
                        aria-pressed={group.options.every((option) =>
                          filters.visualTags.includes(option.key),
                        )}
                        className={`matrix-row-group-button${
                          group.options.every((option) =>
                            filters.visualTags.includes(option.key),
                          )
                            ? ' is-active'
                            : ''
                        }`}
                        onClick={() =>
                          onToggleVisualGroup(group.options.map((option) => option.key))
                        }
                        type="button"
                      >
                        {group.label === 'MscVis' ? null : (
                          <span className="matrix-row-group-rotated">{group.label}</span>
                        )}
                      </button>
                    </th>
                  ) : null}
                  <th
                    className="matrix-row-header"
                    scope="row"
                    title={visualOption.label}
                  >
                    <button
                      aria-label={`Add ${visualOption.label} visual filter`}
                      aria-pressed={filters.visualTags.includes(visualOption.key)}
                      className={`matrix-row-header-button${
                        filters.visualTags.includes(visualOption.key) ? ' is-active' : ''
                      }`}
                      onClick={() => onToggleVisualTag(visualOption.key)}
                      title={buildTaxonomyTooltip(
                        visualOption.label,
                        visualOption.definition,
                      )}
                      type="button"
                    >
                      <span className="matrix-row-label">
                        <i
                          aria-hidden="true"
                          className={`fas ${getVisualIconClass(visualOption.group)}`}
                        />
                        {getVisualMatrixLabel(visualOption.group, visualOption.label)}
                      </span>
                    </button>
                  </th>
                  {dataOptions.map((dataOption) => {
                    const count = countOverlap(
                      figures,
                      dataOption.key,
                      visualOption.key,
                    )
                    const intensity = count / maxCount
                    const active =
                      filters.dataTags.includes(dataOption.key) &&
                      filters.visualTags.includes(visualOption.key)

                    return (
                      <td className="matrix-cell" key={`${visualOption.key}-${dataOption.key}`}>
                        <button
                          aria-label={`${visualOption.label} × ${dataOption.label}: ${count}`}
                          aria-pressed={active}
                          className={`matrix-cell-button${active ? ' is-active' : ''}`}
                          onClick={() =>
                            onToggleMatrixCell(dataOption.key, visualOption.key)
                          }
                          style={{
                            backgroundColor:
                              count > 0
                                ? `rgba(94, 86, 83, ${0.08 + intensity * 0.42})`
                                : 'rgba(255, 255, 255, 0.9)',
                          }}
                          title={`${visualOption.label} × ${dataOption.label}`}
                          type="button"
                        >
                          <span className="matrix-cell-count">{count}</span>
                        </button>
                      </td>
                    )
                  })}
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function countOverlap(
  figures: FigureRecord[],
  dataKey: string,
  visualKey: string,
) {
  return figures.filter(
    (figure) =>
      figure.dataTags.some((tag) => tag.key === dataKey) &&
      figure.visualTags.some((tag) => tag.key === visualKey),
  ).length
}

function getDataAbbreviation(label: string) {
  switch (label) {
    case 'Taxonomy':
      return 'Tax'
    case 'Definition':
      return 'Def'
    case 'Example':
      return 'Ex'
    case 'Source':
      return 'Src'
    case 'Other theme':
      return 'Other'
    case 'Model/Framework':
      return 'Mdl/Fw'
    case 'Design insight':
      return 'Design'
    case 'Frequency':
      return 'Freq'
    case 'Objectively-measured':
      return 'Obj'
    case 'Self-reported':
      return 'Self'
    default:
      return label
  }
}

function getVisualMatrixLabel(group: string, label: string) {
  if (group === 'Diagram' || group === 'Chart') {
    return label.split(' ')[0] ?? label
  }

  return label
}

function sortVisualGroupsForMatrix(groups: TaxonomyFilterGroup[]) {
  const priority = ['Grid', 'Diagram', 'Image', 'Chart', 'MscVis']

  return [...groups].sort((left, right) => {
    const leftIndex = priority.indexOf(left.label)
    const rightIndex = priority.indexOf(right.label)

    if (leftIndex === -1 || rightIndex === -1) {
      return left.label.localeCompare(right.label)
    }

    return leftIndex - rightIndex
  })
}

function buildTaxonomyCounts(
  figures: FigureRecord[],
  domain: TaxonomyDomain,
) {
  const optionCounts = new Map<string, number>()
  const groupCounts = new Map<string, number>()

  for (const figure of figures) {
    const tags = domain === 'data' ? figure.dataTags : figure.visualTags
    const seenGroups = new Set<string>()

    for (const tag of tags) {
      optionCounts.set(tag.key, (optionCounts.get(tag.key) ?? 0) + 1)

      const groupKey = `${domain}::${tag.group}`
      if (seenGroups.has(groupKey)) {
        continue
      }

      seenGroups.add(groupKey)
      groupCounts.set(groupKey, (groupCounts.get(groupKey) ?? 0) + 1)
    }
  }

  return {
    optionCounts,
    groupCounts,
  }
}
