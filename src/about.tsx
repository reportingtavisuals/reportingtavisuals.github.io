import type { TaxonomyFilterGroup } from './data'

type AboutViewProps = {
  dataGroups: TaxonomyFilterGroup[]
  visualGroups: TaxonomyFilterGroup[]
}

export function AboutView({ dataGroups, visualGroups }: AboutViewProps) {
  return (
    <div className="about-grid">
      <section className="about-card">
        <p className="eyebrow">Taxonomy guide</p>
        <h2 className="about-title">How to read the figure taxonomies</h2>
        <p className="about-copy">
          The survey organizes each figure along two dimensions. Data type
          describes what kind of thematic-analysis result is being shown, while
          visual encoding describes how that result is visually represented.
        </p>
        <p className="about-copy">
          The same definitions shown here are also available as hover tooltips
          in the taxonomy filters and figure cards, so the survey and glossary
          stay aligned.
        </p>
      </section>

      <TaxonomyGlossaryCard
        eyebrow="Data type taxonomy"
        groups={dataGroups}
        title="What is represented"
      />
      <TaxonomyGlossaryCard
        eyebrow="Visual encoding taxonomy"
        groups={visualGroups}
        title="How it is represented"
      />
    </div>
  )
}

function TaxonomyGlossaryCard({
  eyebrow,
  groups,
  title,
}: {
  eyebrow: string
  groups: TaxonomyFilterGroup[]
  title: string
}) {
  return (
    <section className="about-card">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="about-title">{title}</h2>
      <div className="about-taxonomy-list">
        {groups.map((group) => (
          <article className="about-taxonomy-group" key={group.key}>
            <div className="about-taxonomy-heading">
              <h3 className="about-taxonomy-name">{group.label}</h3>
              <span className="summary-pill">{group.count} figures</span>
            </div>
            {group.definition ? (
              <p className="about-copy">{group.definition}</p>
            ) : null}
            <ul className="about-taxonomy-children">
              {group.options.map((option) => (
                <li className="about-taxonomy-item" key={option.key}>
                  <div className="about-taxonomy-heading">
                    <strong>{option.label}</strong>
                    <span className="summary-pill">{option.count}</span>
                  </div>
                  {option.definition ? (
                    <p className="about-taxonomy-definition">
                      {option.definition}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}
