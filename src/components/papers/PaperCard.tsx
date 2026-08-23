import { useNavigate } from 'react-router-dom'
import type { Paper } from '@/types'

interface PaperCardProps {
  paper: Paper
  featured?: boolean
}

const STATUS_STYLES: Record<Paper['status'], { label: string; color: string }> = {
  published:    { label: 'Published',   color: 'var(--accent)' },
  'in-progress':{ label: 'In Progress', color: 'var(--accent-3)' },
  draft:        { label: 'Draft',       color: '#8a8782' },
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function PaperCard({ paper, featured = false }: PaperCardProps) {
  const navigate = useNavigate()
  const status   = STATUS_STYLES[paper.status]

  const handleClick = () => navigate(`/papers/${paper.slug}`)

  if (featured) {
    return (
      <button
        onClick={handleClick}
        className="w-full text-left card card-glow card-light rounded-2xl p-7 md:p-9 group"
        style={{ '--card-accent': paper.categoryColor } as React.CSSProperties}
      >
        <div className="grid md:grid-cols-[1fr_auto] gap-8 items-start">
          <div>
            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-2.5 mb-5">
              <span
                className="chip text-[0.68rem] font-semibold px-2.5 py-1 rounded-md"
                style={{ '--chip': paper.categoryColor } as React.CSSProperties}
              >
                {paper.category}
              </span>
              <span
                className="chip text-micro text-[0.65rem] font-medium px-2 py-0.5 rounded-full"
                style={{ '--chip': status.color } as React.CSSProperties}
              >
                {status.label}
              </span>
              <span className="text-micro text-[var(--text-disabled)] font-mono">
                {formatDate(paper.date)}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-h2 font-bold text-[var(--text)] mb-4 group-hover:text-[var(--card-accent)] transition-colors duration-200 leading-snug">
              {paper.title}
            </h3>

            {/* Abstract */}
            <p className="text-body text-[var(--text-secondary)] mb-5 leading-relaxed">
              {paper.abstract}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {paper.tags.map((tag) => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>

          {/* Stats sidebar */}
          <div className="flex md:flex-col gap-4 md:gap-5 md:text-right flex-shrink-0">
            <div>
              <p className="text-lg font-bold text-[var(--text)]">{paper.citations}</p>
              <p className="text-micro text-[var(--text-muted)]">citations</p>
            </div>
            <div>
              <p className="text-lg font-bold text-[var(--text)]">{paper.downloads}</p>
              <p className="text-micro text-[var(--text-muted)]">downloads</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">{paper.readingTime}</p>
              <p className="text-micro text-[var(--text-muted)]">read time</p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="flex items-center gap-2 mt-2 pt-5 border-t border-[var(--border)]">
          <span className="text-sm font-medium text-[var(--accent)] group-hover:gap-3 transition-all">
            Read paper
          </span>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="text-[var(--accent)] group-hover:translate-x-1 transition-transform">
            <path d="M1 6.5h11M6.5 1l5.5 5.5-5.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      className="w-full text-left card card-glow card-light rounded-xl p-5 md:p-6 flex flex-col group h-full"
      style={{ '--card-accent': paper.categoryColor } as React.CSSProperties}
    >
      {/* Category + status */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span
          className="chip text-[0.65rem] font-semibold px-2 py-0.5 rounded"
          style={{ '--chip': paper.categoryColor } as React.CSSProperties}
        >
          {paper.category}
        </span>
        <span
          className="chip text-[0.62rem] font-medium px-1.5 py-0.5 rounded-full"
          style={{ '--chip': status.color } as React.CSSProperties}
        >
          {status.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-[var(--text)] mb-2.5 leading-snug group-hover:text-[var(--card-accent)] transition-colors duration-200 flex-1">
        {paper.title}
      </h3>

      {/* Abstract excerpt */}
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4 line-clamp-3">
        {paper.abstract}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-4">
        {paper.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="tag text-[0.6rem]">{tag}</span>
        ))}
        {paper.tags.length > 3 && (
          <span className="tag text-[0.6rem]">+{paper.tags.length - 3}</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[var(--border)] pt-3 mt-auto">
        <div className="flex items-center gap-3">
          <span className="text-micro text-[var(--text-disabled)] font-mono">{formatDate(paper.date)}</span>
          <span className="text-[var(--text-disabled)]">·</span>
          <span className="text-micro text-[var(--text-disabled)] font-mono">{paper.readingTime}</span>
        </div>
        <svg
          width="11" height="11" viewBox="0 0 11 11" fill="none"
          className="text-[var(--text-muted)] group-hover:text-[var(--card-accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
        >
          <path d="M1 10L10 1M10 1H5M10 1V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </button>
  )
}
