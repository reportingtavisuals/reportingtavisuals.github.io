import { useState } from 'react'
import type { PaperRecord } from './data'

export function ReferenceView({
  includedPapers,
  excludedPapers,
  totalPaperCount
}: {
  includedPapers: PaperRecord[]
  excludedPapers: PaperRecord[]
  totalPaperCount: number
}) {
  const [showExcluded, setShowExcluded] = useState(false)
  const papers = showExcluded ? excludedPapers : includedPapers

  return (
    <div>
      <div className="results-header">
        <div>
          <h2 className="results-title">Reference list</h2>
          <p className="results-meta">
            Click a paper to open its DOI landing page.
          </p>
        </div>
        <div className="summary-pills">
          <button
            aria-pressed={showExcluded}
            className={`summary-pill summary-pill-toggle${
              showExcluded ? ' is-active' : ''
            }`}
            onClick={() => setShowExcluded((current) => !current)}
            type="button"
          >
            {papers.length + "/" + totalPaperCount} papers
            <span>{showExcluded ? 'Excluded' : 'Included'}</span>
          </button>
        </div>
      </div>

      <div className="reference-list">
        {papers.map((paper) => (
          <a
            className="reference-card"
            href={paper.doiUrl}
            key={paper.id}
            rel="noreferrer"
            target="_blank"
          >
            <div className="reference-header">
              <h3 className="reference-title">{paper.title}</h3>
              <span className="reference-kicker">
                {paper.year}
              </span>
            </div>
            <p className="reference-meta">{paper.authors}</p>
            <p className="reference-meta">
              DOI {paper.doi} • {paper.figureCount} figures in survey
            </p>
          </a>
        ))}
      </div>
    </div>
  )
}
