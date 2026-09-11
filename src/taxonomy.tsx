import type { TaxonomyTag } from './data'
import {
  buildTaxonomyTooltip,
  getTagStyle,
  getVisualIconClass,
} from './taxonomy-utils'

export function BadgeRow({
  onTagClick,
  tags,
  variant,
}: {
  onTagClick?: (tagKey: string) => void
  tags: TaxonomyTag[]
  variant: 'data' | 'visual'
}) {
  return (
    <div className="badge-row">
      {tags.map((tag) => (
        <button
          className={`badge is-${variant}${onTagClick ? ' is-clickable' : ''}`}
          data-tooltip={buildTaxonomyTooltip(tag.label, tag.definition)}
          key={tag.key}
          onClick={(event) => {
            event.stopPropagation()
            if (onTagClick) {
              onTagClick(tag.key)
            }
          }}
          onKeyDown={(event) => {
            event.stopPropagation()
          }}
          style={getTagStyle(tag, variant)}
          title={buildTaxonomyTooltip(tag.label, tag.definition)}
          type="button"
        >
          {variant === 'visual' ? (
            <i
              aria-hidden="true"
              className={`fas ${getVisualIconClass(tag.group)}`}
            />
          ) : null}
          {tag.label}
        </button>
      ))}
    </div>
  )
}
