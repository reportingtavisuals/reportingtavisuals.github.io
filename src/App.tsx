import {
  useDeferredValue,
  useEffect,
  useRef,
  useState,
  useTransition,
  type CSSProperties,
} from 'react'
import { AboutView } from './about'
import { loadAppData, type FigureRecord } from './data'
import {
  buildYearCounts,
  countUniquePapers,
  filterFigures,
} from './filter-utils'
import { FiltersPanel } from './filters'
import { ReferenceView } from './reference'
import { FigureModal, SurveyView } from './survey'
import type { AppFilters, TabId } from './types'
import { SummaryPill, TabButton } from './ui'

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('survey')
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const [navHeight, setNavHeight] = useState(52)
  const [data, setData] = useState<Awaited<ReturnType<typeof loadAppData>> | null>(null)
  const [filters, setFilters] = useState<AppFilters | null>(null)
  const [selectedFigure, setSelectedFigure] = useState<FigureRecord | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [isPending, startTransition] = useTransition()
  const navRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    let isMounted = true

    const bootstrap = async () => {
      try {
        const appData = await loadAppData()
        if (!isMounted) {
          return
        }

        setData(appData)
        setFilters({
          years: [],
          dataTags: [],
          visualTags: [],
          taxonomyMode: 'and',
        })
      } catch (error) {
        if (!isMounted) {
          return
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'The dataset could not be loaded.',
        )
      }
    }

    void bootstrap()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const nav = navRef.current

    if (!nav) {
      return
    }

    const updateNavHeight = () => {
      setNavHeight(nav.getBoundingClientRect().height)
    }

    updateNavHeight()

    const resizeObserver = new ResizeObserver(() => {
      updateNavHeight()
    })

    resizeObserver.observe(nav)
    window.addEventListener('resize', updateNavHeight)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateNavHeight)
    }
  }, [activeTab, isFilterDrawerOpen])

  const deferredFilters = useDeferredValue(filters)

  const updateFilters = (recipe: (current: AppFilters) => AppFilters) => {
    startTransition(() => {
      setFilters((current) => {
        if (!current) {
          return current
        }

        return recipe(current)
      })
    })
  }

  if (errorMessage) {
    return (
      <main className="app-shell">
        <section className="error-card">
          <p className="eyebrow">Data load error</p>
          <h1 className="empty-state-title">The refactored site could not start.</h1>
          <p className="error-copy">{errorMessage}</p>
        </section>
      </main>
    )
  }

  if (!data || !deferredFilters) {
    return (
      <main className="app-shell">
        <section className="loading-card">
          <p className="eyebrow">Preparing survey</p>
          <h1 className="empty-state-title">Building the figure taxonomy view</h1>
          <p className="loading-copy">
            Loading figures, paper metadata, and taxonomy indexes from the
            public dataset.
          </p>
        </section>
      </main>
    )
  }

  const figuresForYearCounts = filterFigures(data.figures, {
    ...deferredFilters,
    years: [],
  })
  const visibleFigures = filterFigures(data.figures, deferredFilters)
  const yearCounts = buildYearCounts(figuresForYearCounts, data.years)
  const visiblePaperCount = countUniquePapers(visibleFigures)
  const visiblePaperIds = new Set(visibleFigures.map((figure) => figure.paperIndex))
  const visiblePapers = data.papers.filter((paper) => visiblePaperIds.has(paper.id))
  const hiddenPapers = data.papers.filter((paper) => !visiblePaperIds.has(paper.id))

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div className="hero-intro">
          <p className="eyebrow">Beyond the Wall of Text</p>
          <h1 className="hero-title">
            Practices in Visualizing Thematic Analysis Results
          </h1>
          <p className="hero-copy"></p>
        </div>
        
        <div className="summary-pills app-filter-summary">
          <SummaryPill>
            Years {deferredFilters.years.length === 0 ? 'All' : deferredFilters.years.length}
          </SummaryPill>
          <SummaryPill>
            Data {deferredFilters.dataTags.length === 0 ? 'All' : deferredFilters.dataTags.length}
          </SummaryPill>
          <SummaryPill>
            Visual {deferredFilters.visualTags.length === 0 ? 'All' : deferredFilters.visualTags.length}
          </SummaryPill>
        </div>
        <p className="app-filter-meta">
          {visibleFigures.length} figures from {visiblePaperCount} papers
        </p>
      </section>

    {/*
      <div className="summary-pills app-filter-summary">
        <SummaryPill>
          Years {deferredFilters.years.length === 0 ? 'All' : deferredFilters.years.length}
        </SummaryPill>
        <SummaryPill>
          Data {deferredFilters.dataTags.length === 0 ? 'All' : deferredFilters.dataTags.length}
        </SummaryPill>
        <SummaryPill>
          Visual {deferredFilters.visualTags.length === 0 ? 'All' : deferredFilters.visualTags.length}
        </SummaryPill>
      </div>
      */}

      <div
        className={`workspace-layout${isFilterDrawerOpen ? ' is-filter-open' : ''}`}
        style={
          {
            '--nav-height': `${navHeight}px`,
          } as CSSProperties
        }
      >
        <aside className={`filter-drawer${isFilterDrawerOpen ? ' is-open' : ''}`}>
          {isFilterDrawerOpen ? (
            <div className="filter-drawer-panel">
              <FiltersPanel
                data={data}
                filters={deferredFilters}
                yearCounts={yearCounts}
                isPending={isPending}
                onClosePanel={() => setIsFilterDrawerOpen(false)}
                onReset={() =>
                  updateFilters((current) => ({
                    years: [],
                    dataTags: [],
                    visualTags: [],
                    taxonomyMode: current.taxonomyMode,
                  }))
                }
                onResetYear={() =>
                  updateFilters((current) => ({
                    ...current,
                    years: [],
                  }))
                }
                onResetData={() =>
                  updateFilters((current) => ({
                    ...current,
                    dataTags: [],
                  }))
                }
                onResetVisual={() =>
                  updateFilters((current) => ({
                    ...current,
                    visualTags: [],
                  }))
                }
                onResetMatrix={() =>
                  updateFilters((current) => ({
                    ...current,
                    dataTags: [],
                    visualTags: [],
                  }))
                }
                onToggleYear={(year) =>
                  updateFilters((current) => ({
                    ...current,
                    years: toggleValue(current.years, year),
                  }))
                }
                onToggleDataTag={(tagKey) =>
                  updateFilters((current) => ({
                    ...current,
                    dataTags: toggleValue(current.dataTags, tagKey),
                  }))
                }
                onToggleDataGroup={(tagKeys) =>
                  updateFilters((current) => ({
                    ...current,
                    dataTags: toggleGroupValues(current.dataTags, tagKeys),
                  }))
                }
                onToggleVisualTag={(tagKey) =>
                  updateFilters((current) => ({
                    ...current,
                    visualTags: toggleValue(current.visualTags, tagKey),
                  }))
                }
                onToggleVisualGroup={(tagKeys) =>
                  updateFilters((current) => ({
                    ...current,
                    visualTags: toggleGroupValues(current.visualTags, tagKeys),
                  }))
                }
                onToggleMatrixCell={(dataTagKey, visualTagKey) =>
                  updateFilters((current) => ({
                    ...current,
                    ...toggleMatrixValues(
                      current.dataTags,
                      current.visualTags,
                      dataTagKey,
                      visualTagKey,
                    ),
                  }))
                }
                onToggleTaxonomyMode={() =>
                  updateFilters((current) => ({
                    ...current,
                    taxonomyMode: current.taxonomyMode === 'and' ? 'or' : 'and',
                  }))
                }
              />
            </div>
          ) : null}
        </aside>

        <div className="workspace-main">
          <nav className="tab-row" aria-label="Main tabs" ref={navRef}>
            <button
              aria-expanded={isFilterDrawerOpen}
              aria-label={isFilterDrawerOpen ? 'Hide filters' : 'Show filters'}
              className={`filter-tab-button${isFilterDrawerOpen ? ' is-active' : ''}`}
              onClick={() => setIsFilterDrawerOpen((current) => !current)}
              type="button"
            >
              <i
                aria-hidden="true"
                className={`fas ${isFilterDrawerOpen ? 'fa-chevron-left' : 'fa-filter'}`}
              />
              Filters
            </button>
            <TabButton
              active={activeTab === 'survey'}
              onClick={() => setActiveTab('survey')}
            >
              Survey
            </TabButton>
            <TabButton
              active={activeTab === 'reference'}
              onClick={() => setActiveTab('reference')}
            >
              Reference
            </TabButton>
            {/*
            <TabButton
              active={activeTab === 'about'}
              onClick={() => setActiveTab('about')}
            >
              About
            </TabButton>
            */}
          </nav>

          <section className="content-panel">
            {activeTab === 'survey' ? (
              <SurveyView
                figures={visibleFigures}
                filters={deferredFilters}
                onToggleDataTag={(tagKey) =>
                  updateFilters((current) => ({
                    ...current,
                    dataTags: toggleValue(current.dataTags, tagKey),
                  }))
                }
                onToggleVisualTag={(tagKey) =>
                  updateFilters((current) => ({
                    ...current,
                    visualTags: toggleValue(current.visualTags, tagKey),
                  }))
                }
                onSelectFigure={setSelectedFigure}
              />
            ) : null}

            {activeTab === 'reference' ? (
              <ReferenceView
                includedPapers={visiblePapers}
                excludedPapers={hiddenPapers}
                totalPaperCount={data.totalPaperCount}
              />
            ) : null}
            {activeTab === 'about' ? (
              <AboutView
                dataGroups={data.dataGroups}
                visualGroups={data.visualGroups}
              />
            ) : null}
          </section>
        </div>
      </div>

      {isFilterDrawerOpen ? (
        <button
          aria-label="Close filters"
          className="filter-drawer-backdrop"
          onClick={() => setIsFilterDrawerOpen(false)}
          type="button"
        />
      ) : null}

      {selectedFigure ? (
        <FigureModal
          figure={selectedFigure}
          onAddDataTag={(tagKey) =>
            updateFilters((current) => ({
              ...current,
              dataTags: addMissingValues(current.dataTags, [tagKey]),
            }))
          }
          onAddVisualTag={(tagKey) =>
            updateFilters((current) => ({
              ...current,
              visualTags: addMissingValues(current.visualTags, [tagKey]),
            }))
          }
          onClose={() => setSelectedFigure(null)}
        />
      ) : null}
    </main>
  )
}

function toggleValue<T>(list: T[], value: T) {
  return list.includes(value)
    ? list.filter((entry) => entry !== value)
    : [...list, value]
}

function addMissingValues<T>(list: T[], values: T[]) {
  const next = [...list]

  for (const value of values) {
    if (!next.includes(value)) {
      next.push(value)
    }
  }

  return next
}

function toggleGroupValues<T>(list: T[], values: T[]) {
  if (values.length === 0) {
    return list
  }

  const allSelected = values.every((value) => list.includes(value))

  return allSelected
    ? list.filter((entry) => !values.includes(entry))
    : addMissingValues(list, values)
}

function toggleMatrixValues<T>(
  dataValues: T[],
  visualValues: T[],
  dataValue: T,
  visualValue: T,
) {
  const pairSelected =
    dataValues.includes(dataValue) && visualValues.includes(visualValue)

  return pairSelected
    ? {
        dataTags: dataValues.filter((entry) => entry !== dataValue),
        visualTags: visualValues.filter((entry) => entry !== visualValue),
      }
    : {
        dataTags: addMissingValues(dataValues, [dataValue]),
        visualTags: addMissingValues(visualValues, [visualValue]),
      }
}

export default App
