import type { FigureRecord } from './data'
import type { AppFilters } from './types'
import { BadgeRow } from './taxonomy'
import { formatItemLabel, truncateText } from './taxonomy-utils'

type SurveyViewProps = {
  figures: FigureRecord[]
  filters: AppFilters
  onToggleDataTag: (tagKey: string) => void
  onToggleVisualTag: (tagKey: string) => void
  onSelectFigure: (figure: FigureRecord) => void
}

export function SurveyView({
  figures,
  filters,
  onToggleDataTag,
  onToggleVisualTag,
  onSelectFigure,
}: SurveyViewProps) {
  return (
    <div className="survey-layout">
      <div className="survey-results">
        <div className="results-header">
          <div>
            <h2 className="results-title">Survey figures</h2>
          </div>
        </div>

        {figures.length === 0 ? (
          <div className="empty-state">
            <h3 className="empty-state-title">No figures match the current filter set.</h3>
            <p className="empty-state-copy">
              Try clearing the year filter or relaxing the taxonomy selections.
            </p>
          </div>
        ) : (
          <div className="figure-grid">
            {figures.map((figure) => (
              <article
                className="figure-card"
                key={figure.id}
                onClick={() => onSelectFigure(figure)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onSelectFigure(figure)
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="figure-media">
                  <img
                    alt={`${figure.title} ${figure.item}`}
                    loading="lazy"
                    src={figure.thumbnailSrc}
                  />
                  <div className="figure-media-overlay">
                    <span className="overlay-item">{formatItemLabel(figure.item)}</span>
                  </div>
                </div>
                <div className="figure-body">
                  <h3 className="figure-title">{truncateText(figure.title, 20)}</h3>
                  <p className="figure-meta">
                    {figure.year} • {formatItemLabel(figure.item)}
                  </p>
                  <BadgeRow
                    onTagClick={(tagKey) => {
                      updateIfNeeded(filters.dataTags, tagKey, onToggleDataTag)
                    }}
                    tags={figure.dataTags}
                    variant="data"
                  />
                  <BadgeRow
                    onTagClick={(tagKey) => {
                      updateIfNeeded(filters.visualTags, tagKey, onToggleVisualTag)
                    }}
                    tags={figure.visualTags}
                    variant="visual"
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function FigureModal({
  figure,
  onAddDataTag,
  onAddVisualTag,
  onClose,
}: {
  figure: FigureRecord
  onAddDataTag: (tagKey: string) => void
  onAddVisualTag: (tagKey: string) => void
  onClose: () => void
}) {
  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{figure.title}</h2>
          </div>
          <button className="close-button" onClick={onClose} type="button">
            Close
          </button>
        </div>

        <div className="modal-layout">
          <div className="modal-image">
            <img alt={`${figure.title} ${figure.item}`} src={figure.thumbnailSrc} />
          </div>

          <div className="modal-meta">
            <section className="modal-meta-card">
              <p className="meta-label">Year</p>
              <p className="meta-value">{figure.year}</p>
            </section>

            <section className="modal-meta-card">
              <p className="meta-label">Figure</p>
              <p className="meta-value">{formatItemLabel(figure.item)}</p>
            </section>

            <section className="modal-meta-card">
              <p className="meta-label">Authors</p>
              <p className="meta-value">{figure.authors}</p>
            </section>

            <section className="modal-meta-card">
              <p className="meta-label">Visual taxonomy</p>
              <BadgeRow
                onTagClick={onAddVisualTag}
                tags={figure.visualTags}
                variant="visual"
              />
            </section>

            <section className="modal-meta-card">
              <p className="meta-label">Data taxonomy</p>
              <BadgeRow
                onTagClick={onAddDataTag}
                tags={figure.dataTags}
                variant="data"
              />
            </section>

            <a
              className="doi-link"
              href={figure.doiUrl}
              rel="noreferrer"
              target="_blank"
            >
              Open DOI
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function updateIfNeeded<T>(list: T[], value: T, onAdd: (value: T) => void) {
  if (!list.includes(value)) {
    onAdd(value)
  }
}
