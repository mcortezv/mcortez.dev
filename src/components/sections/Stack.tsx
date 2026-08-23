import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger, addCardLight } from '@/lib/gsap'
import { techStack } from '@/data/personal'
import type { TechItem } from '@/types'
import NeuralReveal from '@/components/ui/NeuralReveal'

/* ─── Grouped data ──────────────────────────────────────── */
const AI_ML  = techStack.filter(t => t.category === 'AI/ML')
const LANGS  = techStack.filter(t => t.category === 'Language')
const FW     = techStack.filter(t => t.category === 'Framework')
const DB     = techStack.filter(t => t.category === 'Database')
const INFRA  = techStack.filter(t => t.category === 'Infrastructure')
const TOOLS  = techStack.filter(t => t.category === 'Tool')

/* ─── Logo URLs ──────────────────────────────────────────── */
const LOGOS: Record<string, string> = {
  'Python':      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
  'TypeScript':  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
  'Java':        'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
  'React':       'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
  'PostgreSQL':  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
  'Supabase':    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg',
  'SQL':         'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azuresqldatabase/azuresqldatabase-original.svg',
  'Git':         'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg',
  'GitHub':      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg',
  'Vercel':      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg',
  'LangChain':   'https://registry.npmmirror.com/@lobehub/icons-static-png/1.24.0/files/dark/langchain-color.png',
  'LangSmith':   'https://registry.npmmirror.com/@lobehub/icons-static-png/1.24.0/files/dark/langchain-color.png',
  'Scikit-Learn':'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/scikitlearn/scikitlearn-original.svg',
  'Railway':     'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/railway/railway-original.svg',
}

/* ─── Mastra inline SVG logo ─── */
const MastraLogo = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 34 21" className={className}>
    <path fill="currentColor" d="M4.5 11.7a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9M10.4 0a4.5 4.5 0 0 1 4.4 5.5c-.3 1.4-.6 3 .2 4.2l1.3 1.8.3.2q.2 0 .3-.2l1.3-1.9c.8-1.1.5-2.7.2-4a4.5 4.5 0 1 1 8.8 0c-.3 1.3-.6 2.8 0 4l1.3 2a4.5 4.5 0 1 1-4.3 3.5c.3-1.3.6-2.8 0-4l-1.2-2h-.2L21.5 11c-.8 1.2-.5 2.8-.2 4.2a4.5 4.5 0 1 1-8.8.2q.5-2-.4-3.8l-.9-1.3q-.9-1.1-2.4-1.6A4.5 4.5 0 0 1 10.4 0"/>
  </svg>
)

/* ─── Helpers ───────────────────────────────────────────── */
const levelWidth = (l: TechItem['level']) => l === 'core' ? '100%' : l === 'proficient' ? '66%' : '33%'

const LevelBar = ({ level, color }: { level: TechItem['level']; color: string }) => (
  <div className="w-8 h-1 rounded-full overflow-hidden flex-shrink-0" style={{ background: 'var(--border-medium)' }}>
    <div className="level-bar h-full rounded-full" style={{ width: levelWidth(level), background: color }} />
  </div>
)

const CellLabel = ({ text, color }: { text: string; color: string }) => (
  <span
    className="cell-label font-mono text-[0.6rem] tracking-[0.14em] uppercase mb-4 inline-block"
    style={{ '--label': color } as React.CSSProperties}
  >
    {text}
  </span>
)

const Logo = ({ name }: { name: string }) => {
  if (name === 'Mastra') return <MastraLogo className="w-5 h-5 flex-shrink-0 text-[var(--accent)]" />
  const url = LOGOS[name]
  if (!url) return null
  return (
    <img
      src={url}
      alt={`${name} logo`}
      className="tech-logo w-5 h-5 flex-shrink-0 object-contain"
      loading="lazy"
      style={{ filter: name === 'GitHub' || name === 'Vercel' ? 'invert(1)' : undefined }}
    />
  )
}

/* ─── In-cell visualizations ─────────────────────────────── */
const AIPipelineViz = () => (
  <div className="mt-3 mb-5">
    <div className="flex items-center gap-1.5 flex-wrap">
      {AI_ML.filter(t => t.level === 'core').map((t, i, arr) => (
        <div key={t.name} className="flex items-center gap-1.5">
          <span
            className="inline-flex items-center gap-1 sm:gap-1.5 font-mono text-[0.6rem] sm:text-[0.68rem] font-semibold px-1.5 sm:px-2 py-0.5 rounded"
            style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)', border: '1px solid var(--border-medium)' }}
          >
            <span className="hidden sm:inline-flex"><Logo name={t.name} /></span>
            {t.name}
          </span>
          {i < arr.length - 1 && (
            <span className="text-[var(--text-disabled)] text-[0.6rem]">→</span>
          )}
        </div>
      ))}
    </div>
  </div>
)

export default function Stack() {
  const containerRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    const headerTl = gsap.timeline({
      scrollTrigger: { trigger: containerRef.current, start: 'top 78%' },
    })
    headerTl.from('.stack-label-h', { y: 25, autoAlpha: 0, duration: 0.6, ease: 'smooth-out' })
    headerTl.from('.stack-title-h', { y: 40, autoAlpha: 0, duration: 0.8, ease: 'smooth-out' }, '-=0.3')

    // ── ScrollTrigger.batch for dramatic cell reveals ──
    ScrollTrigger.batch('.stack-cell', {
      start: 'top 88%',
      onEnter: (elements) => {
        gsap.from(elements, {
          y: 100,
          scale: 0.8,
          opacity: 0,
          rotateX: 8,
          transformPerspective: 1000,
          stagger: 0.1,
          duration: 1.2,
          ease: 'smooth-out',
          overwrite: true,
        })
      },
    })

    // ── Luz que sigue al cursor ──
    const lightCleanups: (() => void)[] = []
    if (window.innerWidth > 768) {
      gsap.utils.toArray<HTMLElement>('.stack-cell').forEach(cell => {
        lightCleanups.push(addCardLight(cell))
      })
    }

    // ── Parallax on the bento grid ──
    gsap.to('.stack-bento', {
      y: -25,
      ease: 'none',
      scrollTrigger: {
        trigger: '.stack-bento',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
      },
    })

    return () => {
      lightCleanups.forEach(fn => fn())
    }
  }, { scope: containerRef })

  return (
    <section id="stack" ref={containerRef} className="section bg-[var(--bg-surface)] relative overflow-hidden">
      <NeuralReveal color={[234, 232, 228]} count={45} />
      <div className="max-w-[1280px] mx-auto relative z-10">

        <div className="stack-label-h section-label">Tech Stack</div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <h2 className="stack-title-h text-h1 max-w-md">
            Tools I use to{' '}
            <span className="text-gradient-accent">ship fast</span>
          </h2>
          <p className="text-body text-[var(--text-muted)] max-w-sm md:text-right">
            From Python ML pipelines to TypeScript AI agents — a full-stack approach to
            building intelligent products.
          </p>
        </div>

        {/* ── Hairline bento grid ── */}
        <div
          className="stack-bento rounded-2xl overflow-hidden"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1px',
            background: 'var(--border-medium)',
          }}
        >
          {/* AI/ML — 2 cols */}
          <div className="stack-cell card-light flex flex-col p-6 md:p-8 min-h-[220px]" style={{ gridColumn: '1 / 3', background: 'var(--bg-card)', '--card-accent': 'var(--accent)' } as React.CSSProperties}>
            <CellLabel text="AI / ML Stack" color="var(--accent)" />
            <AIPipelineViz />
            <div className="space-y-2.5 mt-auto">
              {AI_ML.map(t => (
                <div key={t.name} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Logo name={t.name} />
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-[var(--text)]">{t.name}</span>
                      <span className="text-[var(--text-disabled)] mx-1.5 text-xs">·</span>
                      <span className="text-[0.68rem] text-[var(--text-muted)]">{t.description}</span>
                    </div>
                  </div>
                  <LevelBar level={t.level} color="var(--accent)" />
                </div>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="stack-cell card-light flex flex-col p-6" style={{ background: 'var(--bg-card)', '--card-accent': 'var(--accent)' } as React.CSSProperties}>
            <CellLabel text="Languages" color="var(--accent)" />
            <div className="space-y-4 mt-auto">
              {LANGS.map(t => (
                <div key={t.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Logo name={t.name} />
                      <span className="text-sm font-bold text-[var(--text)]">{t.name}</span>
                    </div>
                    <LevelBar level={t.level} color="var(--accent)" />
                  </div>
                  <p className="text-[0.68rem] text-[var(--text-muted)] leading-snug pl-7">{t.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Framework */}
          <div className="stack-cell card-light flex flex-col p-6" style={{ background: 'var(--bg-card)', '--card-accent': 'var(--accent-2)' } as React.CSSProperties}>
            <CellLabel text="Framework" color="var(--accent-2)" />
            {FW.map(t => (
              <div key={t.name} className="mt-auto">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <Logo name={t.name} />
                    <span className="text-2xl font-semibold tracking-tight text-[var(--text)]">{t.name}</span>
                  </div>
                  <LevelBar level={t.level} color="var(--accent-2)" />
                </div>
                <p className="text-[0.68rem] text-[var(--text-muted)]">{t.description}</p>
                <div className="mt-4 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(151,134,210,0.12)' }}>
                  <div className="tone-meter h-full rounded-full" style={{ width: '95%', background: 'var(--accent-2)', opacity: 0.72 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Database — 2 cols */}
          <div className="stack-cell card-light flex flex-col p-6 md:p-8 min-h-[180px]" style={{ gridColumn: '1 / 3', background: 'var(--bg-card)', '--card-accent': 'var(--accent-4)' } as React.CSSProperties}>
            <CellLabel text="Database" color="var(--accent-4)" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-auto">
              {DB.map(t => (
                <div key={t.name} className="tone-tile p-3 rounded-lg flex flex-col gap-2" style={{ '--tone': 'var(--accent-4)' } as React.CSSProperties}>
                  <div className="flex items-center gap-2">
                    <Logo name={t.name} />
                    <span className="text-sm font-bold text-[var(--text)] leading-tight">{t.name}</span>
                  </div>
                  <p className="text-[0.63rem] text-[var(--text-muted)] leading-snug">{t.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Infrastructure */}
          <div className="stack-cell card-light flex flex-col p-6" style={{ background: 'var(--bg-card)', '--card-accent': 'var(--accent-3)' } as React.CSSProperties}>
            <CellLabel text="Infrastructure" color="var(--accent-3)" />
            <div className="space-y-3 mt-auto">
              {INFRA.map(t => (
                <div key={t.name}>
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-2">
                      <Logo name={t.name} />
                      <span className="text-sm font-bold text-[var(--text)]">{t.name}</span>
                    </div>
                    <LevelBar level={t.level} color="var(--accent-3)" />
                  </div>
                  <p className="text-[0.68rem] text-[var(--text-muted)] pl-7">{t.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div className="stack-cell card-light flex flex-col p-6" style={{ background: 'var(--bg-card)', '--card-accent': '#9d9a94' } as React.CSSProperties}>
            <CellLabel text="Tools" color="var(--text-muted)" />
            <div className="space-y-3 mt-auto">
              {TOOLS.map(t => (
                <div key={t.name}>
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-2">
                      <Logo name={t.name} />
                      <span className="text-sm font-bold text-[var(--text)]">{t.name}</span>
                    </div>
                    <LevelBar level={t.level} color="var(--text-muted)" />
                  </div>
                  <p className="text-[0.68rem] text-[var(--text-muted)] pl-7">{t.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 640px) {
            .stack-bento {
              grid-template-columns: 1fr !important;
            }
            .stack-bento > * {
              grid-column: auto !important;
            }
          }
        `}</style>
      </div>
    </section>
  )
}
