import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, SplitText } from '@/lib/gsap'
import { marked } from 'marked'
import { getPaperBySlug, getRelatedPapers } from '@/data/papers'

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  published:    { label: 'Published',    color: '#16a34a' },
  'in-progress':{ label: 'In Progress',  color: '#ea580c' },
  draft:        { label: 'Draft',        color: '#6b7280' },
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
}

function renderMarkdown(md: string): string {
  return marked.parse(md, { async: false }) as string
}

/* ─── Theme icons ─── */
const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

export default function PaperPage() {
  const { slug }     = useParams<{ slug: string }>()
  const navigate     = useNavigate()
  const paper        = slug ? getPaperBySlug(slug) : undefined
  const related      = paper ? getRelatedPapers(paper) : []
  const titleRef     = useRef<HTMLHeadingElement>(null)
  const contentRef   = useRef<HTMLDivElement>(null)
  const metaRef      = useRef<HTMLDivElement>(null)
  const [html, setHtml] = useState('')
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    if (!paper) return
    setHtml(renderMarkdown(paper.content))
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [paper])

  useGSAP(() => {
    if (!paper || !html) return
    const tl = gsap.timeline({ delay: 0.1 })

    if (metaRef.current) {
      tl.from(metaRef.current, { y: 20, opacity: 0, duration: 0.5, ease: 'power2.out' })
    }

    if (titleRef.current) {
      const split = new SplitText(titleRef.current, { type: 'lines' })
      tl.from(split.lines, {
        y: 40, opacity: 0, stagger: 0.07, duration: 0.7, ease: 'power3.out',
      }, '-=0.2')
      return () => split.revert()
    }
  }, { dependencies: [html] })

  useGSAP(() => {
    if (!html || !contentRef.current) return
    gsap.from(contentRef.current, {
      y: 30, opacity: 0, duration: 0.8, delay: 0.5, ease: 'power2.out',
    })
  }, { dependencies: [html] })

  if (!paper) {
    return (
      <div className="min-h-screen bg-[var(--paper-bg)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-black text-[var(--paper-ink)] mb-3">Paper not found</h1>
          <p className="text-sm text-[var(--paper-muted)] mb-6">
            The paper you're looking for doesn't exist or has been moved.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--paper-accent)] hover:opacity-80 transition-opacity"
          >
            ← Back to portfolio
          </button>
        </div>
      </div>
    )
  }

  const statusInfo = STATUS_LABEL[paper.status] ?? STATUS_LABEL.draft

  /* Dark theme overrides */
  const theme = darkMode
    ? {
        bg: '#0a0a0a',
        bgAlt: '#111111',
        bgSection: '#0d0d0d',
        ink: '#ededed',
        text: '#d4d4d4',
        muted: '#a0a0a0',
        border: 'rgba(255,255,255,0.08)',
        border2: 'rgba(255,255,255,0.14)',
        accent: '#60a5fa',
        accentWarm: '#fbbf24',
        tagBg: 'rgba(255,255,255,0.06)',
        cardBg: '#161616',
      }
    : {
        bg: 'var(--paper-bg)',
        bgAlt: 'var(--paper-bg-alt)',
        bgSection: 'var(--paper-bg-section)',
        ink: 'var(--paper-ink)',
        text: 'var(--paper-text)',
        muted: 'var(--paper-muted)',
        border: 'var(--paper-border)',
        border2: 'var(--paper-border-2)',
        accent: 'var(--paper-accent)',
        accentWarm: 'var(--paper-accent-warm)',
        tagBg: 'var(--paper-tag-bg)',
        cardBg: '#ffffff',
      }

  return (
    <div
      className={darkMode ? 'min-h-screen' : 'paper-page min-h-screen'}
      style={darkMode ? {
        background: theme.bg,
        color: theme.text,
        fontFamily: "'Inter', system-ui, sans-serif",
      } : undefined}
    >
      {/* Dark mode CSS overrides */}
      {darkMode && (
        <style>{`
          .paper-dark.paper-content h2 {
            color: ${theme.ink};
          }
          .paper-dark.paper-content h3 {
            color: ${theme.ink};
          }
          .paper-dark.paper-content p {
            color: ${theme.text};
          }
          .paper-dark.paper-content li {
            color: ${theme.text};
          }
          .paper-dark.paper-content a {
            color: ${theme.accent};
          }
          .paper-dark.paper-content hr {
            border-color: ${theme.border2};
          }
          .paper-dark.paper-content pre {
            background: ${theme.bgSection};
            border-color: ${theme.border2};
          }
          .paper-dark.paper-content pre code {
            color: ${theme.text};
          }
          .paper-dark.paper-content code {
            background: ${theme.bgSection};
            border-color: ${theme.border};
            color: ${theme.accentWarm};
          }
          .paper-dark.paper-content th {
            color: ${theme.ink};
            border-color: ${theme.border2};
          }
          .paper-dark.paper-content td {
            color: ${theme.text};
            border-color: ${theme.border};
          }
          .paper-dark.paper-content strong {
            color: ${theme.ink};
          }
        `}</style>
      )}

      {/* ── Paper Navbar ── */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-xl transition-colors duration-300"
        style={{
          background: darkMode ? 'rgba(10,10,10,0.9)' : 'rgba(248,247,244,0.9)',
          borderBottom: `1px solid ${theme.border}`,
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
        }}
      >
        <div className="max-w-5xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm transition-colors"
            style={{ color: theme.muted }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M13 7H1M1 7l5-5M1 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Portfolio
          </button>

          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded flex items-center justify-center"
              style={{ background: darkMode ? 'var(--text)' : theme.ink }}
            >
              <span
                className="font-black text-[8px]"
                style={{ color: darkMode ? '#0a0a0a' : 'var(--paper-bg)' }}
              >
                MC
              </span>
            </div>
            <span className="text-sm font-semibold" style={{ color: theme.ink }}>
              Manuel Cortez
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(d => !d)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{
                background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                color: darkMode ? '#fbbf24' : theme.muted,
                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
              }}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </button>

            <a
              href="https://github.com/mcortezv"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono transition-colors"
              style={{ color: theme.muted }}
            >
              GitHub ↗
            </a>
          </div>
        </div>
      </nav>

      {/* ── Paper Header ── */}
      <header
        className="py-14 md:py-20 px-5 md:px-8 transition-colors duration-300"
        style={{
          background: theme.bg,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <div className="max-w-5xl mx-auto">

          {/* Meta row */}
          <div ref={metaRef} className="mb-7">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-md"
                style={{
                  color: paper.categoryColor,
                  background: `${paper.categoryColor}14`,
                  border: `1px solid ${paper.categoryColor}33`,
                }}
              >
                {paper.category}
              </span>
              <span
                className="text-xs font-medium px-2.5 py-0.5 rounded-full border"
                style={{ color: statusInfo.color, borderColor: `${statusInfo.color}40`, background: `${statusInfo.color}10` }}
              >
                {statusInfo.label}
              </span>
              <span className="text-xs font-mono" style={{ color: theme.muted }}>
                {formatDate(paper.date)}
              </span>
              <span className="text-xs font-mono" style={{ color: theme.muted }}>
                {paper.readingTime} read
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {paper.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[0.7rem] px-2.5 py-1 rounded-md font-medium"
                  style={{
                    background: theme.tagBg,
                    color: theme.muted,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Title */}
          <h1
            ref={titleRef}
            className="font-black mb-6 leading-tight"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.25rem)',
              letterSpacing: '-0.025em',
              color: theme.ink,
            }}
          >
            {paper.title}
          </h1>

          {/* Abstract */}
          <p
            className="leading-relaxed max-w-3xl"
            style={{ fontSize: '1.0625rem', lineHeight: '1.8', color: theme.muted }}
          >
            {paper.abstract}
          </p>
        </div>
      </header>

      {/* ── Divider line ── */}
      <div className="max-w-5xl mx-auto px-5 md:px-8">
        <hr style={{ borderColor: theme.border2 }} />
      </div>

      {/* ── Paper Content ── */}
      <main
        className="py-12 md:py-16 px-5 md:px-8 transition-colors duration-300"
        style={{ background: theme.bg }}
      >
        <div className="max-w-5xl mx-auto">
          <div
            ref={contentRef}
            className={`paper-content ${darkMode ? 'paper-dark' : ''}`}
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {/* Paper meta footer */}
          <div
            className="mt-14 pt-8 flex flex-wrap items-center justify-between gap-4"
            style={{ borderTop: `1px solid ${theme.border2}` }}
          >
            <div className="flex flex-wrap items-center gap-5">
              <div className="flex items-center gap-2 text-xs" style={{ color: theme.muted }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <path d="M1 1h5v12H1zM8 1h5v12H8z" opacity="0.5"/>
                </svg>
                {paper.readingTime} read
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: theme.muted }}>
                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
                </svg>
                {paper.citations} citations
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: theme.muted }}>
                {paper.downloads} downloads
              </div>
            </div>
            <span className="text-xs font-mono" style={{ color: theme.muted }}>
              Published {formatDate(paper.date)}
            </span>
          </div>
        </div>
      </main>

      {/* ── Related Papers ── */}
      {related.length > 0 && (
        <section
          className="py-14 px-5 md:px-8 transition-colors duration-300"
          style={{
            background: theme.bgSection,
            borderTop: `1px solid ${theme.border}`,
          }}
        >
          <div className="max-w-5xl mx-auto">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-8"
              style={{ color: theme.muted }}
            >
              Related Papers
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map((p) => (
                <Link key={p.slug} to={`/papers/${p.slug}`} className="no-underline">
                  <div
                    className="rounded-xl p-5 transition-all hover:shadow-md cursor-pointer"
                    style={{
                      background: theme.cardBg,
                      border: `1px solid ${theme.border2}`,
                    }}
                  >
                    <span
                      className="text-[0.65rem] font-semibold px-2 py-0.5 rounded mb-3 inline-block"
                      style={{ background: `${p.categoryColor}18`, color: p.categoryColor }}
                    >
                      {p.category}
                    </span>
                    <p
                      className="text-sm font-bold mb-2 leading-snug"
                      style={{ color: theme.ink }}
                    >
                      {p.title}
                    </p>
                    <p
                      className="text-xs leading-relaxed line-clamp-2"
                      style={{ color: theme.muted }}
                    >
                      {p.abstract}
                    </p>
                    <p className="text-[0.65rem] font-mono mt-3" style={{ color: darkMode ? '#666' : '#aaa' }}>
                      {formatDate(p.date)} · {p.readingTime}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Paper Footer ── */}
      <footer
        className="py-8 px-5 md:px-8 text-center transition-colors duration-300"
        style={{ background: theme.bg, borderTop: `1px solid ${theme.border}`, paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <p className="text-xs font-mono" style={{ color: theme.muted }}>
          Manuel Cortez © {new Date().getFullYear()} · Ciudad Obregón, México
        </p>
        <div className="flex justify-center gap-5 mt-3">
          <a
            href="https://github.com/mcortezv"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs hover:opacity-70 transition-opacity"
            style={{ color: theme.accent }}
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/mcortezv/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs hover:opacity-70 transition-opacity"
            style={{ color: theme.accent }}
          >
            LinkedIn
          </a>
          <button
            onClick={() => navigate('/')}
            className="text-xs hover:opacity-70 transition-opacity"
            style={{ color: theme.accent }}
          >
            ← Portfolio
          </button>
        </div>
      </footer>
    </div>
  )
}
