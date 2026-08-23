import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger, addTilt3D } from '@/lib/gsap'
import { papers } from '@/data/papers'
import { useNavigate } from 'react-router-dom'
import NeuralReveal from '@/components/ui/NeuralReveal'

const STATUS_COLORS: Record<string, string> = {
  published:    'var(--accent)',
  'in-progress': 'var(--accent-3)',
  draft:        '#888',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'short' })
}

export default function Research() {
  const containerRef = useRef<HTMLElement>(null)
  const navigate     = useNavigate()

  useGSAP(() => {
    const headerTl = gsap.timeline({
      scrollTrigger: { trigger: containerRef.current, start: 'top 78%' },
    })
    headerTl.from('.research-label-h', { y: 25, autoAlpha: 0, duration: 0.6, ease: 'smooth-out' })
    headerTl.from('.research-title-h', { y: 40, autoAlpha: 0, duration: 0.8, ease: 'smooth-out' }, '-=0.3')

    // ── ScrollTrigger.batch for dramatic paper cell reveals ──
    ScrollTrigger.batch('.paper-cell', {
      start: 'top 88%',
      onEnter: (elements) => {
        gsap.from(elements, {
          y: 120,
          scale: 0.8,
          opacity: 0,
          rotateX: 8,
          transformPerspective: 1000,
          stagger: 0.12,
          duration: 1.2,
          ease: 'smooth-out',
          overwrite: true,
        })
      },
    })

    // ── 3D tilt on paper cells ──
    const tiltCleanups: (() => void)[] = []
    if (window.innerWidth > 768) {
      gsap.utils.toArray<HTMLElement>('.paper-cell').forEach(cell => {
        tiltCleanups.push(addTilt3D(cell, 5))
      })
    }

    return () => {
      tiltCleanups.forEach(fn => fn())
    }
  }, { scope: containerRef })

  const featured = papers[0]
  const rest      = papers.slice(1)

  /* Category → unique colors */
  const categories = [...new Set(papers.map(p => p.category))]

  return (
    <section id="research" ref={containerRef} className="section bg-[var(--bg-base)] relative overflow-hidden">
      <NeuralReveal color={[234, 232, 228]} count={40} />
      <div className="max-w-[1280px] mx-auto relative z-10">

        {/* Header */}
        <div className="research-label-h section-label">Research</div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <h2 className="research-title-h text-h1 max-w-lg">
            Papers &{' '}
            <span className="text-gradient-accent">Investigations</span>
          </h2>
          <p className="text-body text-[var(--text-muted)] max-w-sm md:text-right">
            Exploring AI systems, evaluation methodologies, and production patterns
            from real-world B2B deployments.
          </p>
        </div>

        {/* ── Hairline bento ── */}
        <div
          className="papers-bento rounded-2xl overflow-hidden"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1px',
            background: 'var(--border-medium)',
          }}
        >
          {/* ─ Featured paper (col 1-3) ─ */}
          <button
            onClick={() => navigate(`/papers/${featured.slug}`)}
            className="paper-cell group flex flex-col p-6 md:p-8 text-left min-h-[280px] transition-colors duration-150"
            style={{ gridColumn: '1 / 4', background: 'var(--bg-card)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-card)')}
          >
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span
                className="font-mono text-[0.6rem] tracking-[0.12em] uppercase px-2 py-0.5 rounded"
                style={{
                  background: `${featured.categoryColor}18`,
                  color: featured.categoryColor,
                  border: `1px solid ${featured.categoryColor}30`,
                }}
              >
                {featured.category}
              </span>
              <span
                className="font-mono text-[0.6rem] px-2 py-0.5 rounded-full"
                style={{
                  color: STATUS_COLORS[featured.status],
                  background: `${STATUS_COLORS[featured.status]}15`,
                  border: `1px solid ${STATUS_COLORS[featured.status]}28`,
                }}
              >
                {featured.status === 'in-progress' ? 'In Progress' : featured.status.charAt(0).toUpperCase() + featured.status.slice(1)}
              </span>
              <span className="font-mono text-[0.62rem] text-[var(--text-disabled)]">
                {formatDate(featured.date)}
              </span>
            </div>

            {/* Title */}
            <h3
              className="font-display font-semibold text-[var(--text)] mb-3 leading-snug"
              style={{ fontSize: 'clamp(1.1rem, 2vw, 1.5rem)', maxWidth: '680px' }}
            >
              {featured.title}
            </h3>

            {/* Abstract */}
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4" style={{ maxWidth: '620px' }}>
              {featured.abstract.slice(0, 200)}…
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {featured.tags.slice(0, 5).map(t => (
                <span key={t} className="tag text-[0.6rem]">{t}</span>
              ))}
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[var(--border)] pt-4 mt-auto">
              <div className="flex items-center flex-wrap gap-x-4 gap-y-1">
                <div>
                  <span className="text-sm font-bold text-[var(--text)]">{featured.citations}</span>
                  <span className="text-[0.68rem] text-[var(--text-muted)] ml-1">citations</span>
                </div>
                <div>
                  <span className="text-sm font-bold text-[var(--text)]">{featured.downloads}</span>
                  <span className="text-[0.68rem] text-[var(--text-muted)] ml-1">downloads</span>
                </div>
                <div>
                  <span className="text-[0.68rem] text-[var(--text-muted)] font-mono">{featured.readingTime}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[var(--accent)] flex-shrink-0">
                <span className="text-xs font-medium">Read paper</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="group-hover:translate-x-0.5 transition-transform">
                  <path d="M1 6h10M5.5 1.5L10 6l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </button>

          {/* ─ Stats sidebar (col 4) ─ */}
          <div
            className="paper-cell flex flex-col p-6"
            style={{ gridColumn: '4', gridRow: '1', background: 'var(--bg-card)' }}
          >
            <span className="font-mono text-[0.6rem] tracking-[0.14em] text-[var(--text-muted)] uppercase mb-5">
              Research
            </span>

            {/* Paper count */}
            <div className="mb-6">
              <p className="font-display text-4xl font-bold text-[var(--text)]">{papers.length}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">papers & investigations</p>
            </div>

            {/* Categories */}
            <div className="space-y-2.5 mt-auto">
              <p className="text-[0.65rem] text-[var(--text-disabled)] font-mono uppercase tracking-wider mb-3">
                Categories
              </p>
              {categories.map(cat => {
                const paper = papers.find(p => p.category === cat)!
                return (
                  <div key={cat} className="flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: paper.categoryColor }}
                    />
                    <span className="text-xs text-[var(--text-secondary)]">{cat}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ─ Remaining papers (row 2, 4 cols) ─ */}
          {rest.map((paper) => (
            <button
              key={paper.slug}
              onClick={() => navigate(`/papers/${paper.slug}`)}
              className="paper-cell group flex flex-col p-5 md:p-6 text-left min-h-[190px] transition-colors duration-150"
              style={{ background: 'var(--bg-card)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-card)')}
            >
              {/* Category */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className="font-mono text-[0.58rem] tracking-[0.12em] uppercase px-1.5 py-0.5 rounded"
                  style={{
                    background: `${paper.categoryColor}15`,
                    color: paper.categoryColor,
                  }}
                >
                  {paper.category}
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-[var(--accent)] opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200">
                  <span>Read</span>
                  <svg width="10" height="10" viewBox="0 0 11 11" fill="none">
                    <path d="M1 10L10 1M10 1H5M10 1V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>

              {/* Title */}
              <h3 className="text-sm font-semibold text-[var(--text)] leading-snug mb-2 flex-1 line-clamp-3">
                {paper.title}
              </h3>

              {/* Footer */}
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--border)]">
                <span className="font-mono text-[0.62rem] text-[var(--text-disabled)]">
                  {formatDate(paper.date)}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: STATUS_COLORS[paper.status] }}
                  />
                  <span className="font-mono text-[0.62rem] text-[var(--text-muted)]">
                    {paper.readingTime}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-8 text-micro text-[var(--text-disabled)] font-mono text-center">
          * Papers represent work-in-progress investigations and published findings.
        </p>

        {/* Mobile: single column */}
        <style>{`
          @media (max-width: 640px) {
            .papers-bento {
              grid-template-columns: 1fr !important;
            }
            .papers-bento > * {
              grid-column: auto !important;
              grid-row: auto !important;
              min-height: 160px !important;
            }
          }
          @media (min-width: 641px) and (max-width: 900px) {
            .papers-bento {
              grid-template-columns: repeat(2, 1fr) !important;
            }
            .papers-bento > *:first-child {
              grid-column: 1 / 3 !important;
            }
            .papers-bento > *:nth-child(2) {
              grid-column: auto !important;
              grid-row: auto !important;
            }
          }
        `}</style>
      </div>
    </section>
  )
}
