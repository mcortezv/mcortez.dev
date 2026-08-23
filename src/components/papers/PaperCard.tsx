import { useNavigate } from 'react-router-dom'
import type { Paper } from '@/types'

interface PaperCardProps {
  paper: Paper
  featured?: boolean
}

const STATUS_STYLES: Record<Paper['status'], { label: string; style: React.CSSProperties }> = {
  published:    { label: 'Published',    style: { background: 'rgba(64,209,160,0.1)', color: 'var(--accent)', border: '1px solid rgba(64,209,160,0.25)' } },
  'in-progress':{ label: 'In Progress',  style: { background: 'rgba(217,146,89,0.1)', color: 'var(--accent-3)', border: '1px solid rgba(217,146,89,0.25)' } },
  draft:        { label: 'Draft',        style: { background: 'rgba(136,136,136,0.08)', color: '#888', border: '1px solid rgba(136,136,136,0.15)' } },
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
        className="w-full text-left card card-glow rounded-2xl p-7 md:p-9 group"
      >
        <div className="grid md:grid-cols-[1fr_auto] gap-8 items-start">
          <div>
            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-2.5 mb-5">
              <span
                className="text-[0.68rem] font-semibold px-2.5 py-1 rounded-md"
                style={{ background: `${paper.categoryColor}18`, color: paper.categoryColor, border: `1px solid ${paper.categoryColor}30` }}
              >
                {paper.category}
              </span>
              <span className="text-micro text-[0.65rem] font-medium px-2 py-0.5 rounded-full" style={status.style}>
                {status.label}
              </span>
              <span className="text-micro text-[var(--text-disabled)] font-mono">
                {formatDate(paper.date)}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-h2 font-bold text-[var(--text)] mb-4 group-hover:text-[var(--accent)] transition-colors duration-200 leading-snug">
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
      className="w-full text-left card card-glow rounded-xl p-5 md:p-6 flex flex-col group h-full"
    >
      {/* Category + status */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span
          className="text-[0.65rem] font-semibold px-2 py-0.5 rounded"
          style={{ background: `${paper.categoryColor}18`, color: paper.categoryColor, border: `1px solid ${paper.categoryColor}30` }}
        >
          {paper.category}
        </span>
        <span className="text-[0.62rem] font-medium px-1.5 py-0.5 rounded-full" style={status.style}>
          {status.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-[var(--text)] mb-2.5 leading-snug group-hover:text-[var(--accent)] transition-colors duration-200 flex-1">
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
          className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
        >
          <path d="M1 10L10 1M10 1H5M10 1V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </button>
  )
}
