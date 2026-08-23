import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'

/* ─── Project nodes ─── */
interface ProjectNode {
  id: string; name: string; description: string; url: string; tags: string[]
  color: string; bg: string; border: string; glow: string; label: string
  x: number; y: number
  tools: { label: string; x: number; y: number }[]
}

const PROJECTS: ProjectNode[] = [
  {
    id: 'hyperflow', name: 'Hyperflow',
    description: 'AI-powered operating system for modern business workflows. Automation, agent orchestration, and intelligent process management at scale.',
    url: 'https://www.hyperflowos.com/', tags: ['AI Agents', 'Automation', 'Mastra'],
    color: 'var(--accent)', bg: 'rgba(64,209,160,0.07)', border: 'rgba(64,209,160,0.2)', glow: 'rgba(64,209,160,0.12)',
    label: 'Core Contributor', x: 24, y: 28,
    tools: [
      { label: 'Mastra SDK', x: 5, y: 8 },
      { label: 'RAG Pipeline', x: 8, y: 52 },
      { label: 'Agent Orchestration', x: 3, y: 78 },
      { label: 'Workflow Engine', x: 38, y: 6 },
    ],
  },
  {
    id: 'teamup', name: 'TeamUp',
    description: 'Team collaboration platform with AI-driven productivity insights for Mexican businesses.',
    url: 'https://www.teamup.mx/', tags: ['B2B', 'SaaS', 'Collaboration'],
    color: 'var(--accent-2)', bg: 'rgba(151,134,210,0.07)', border: 'rgba(151,134,210,0.2)', glow: 'rgba(151,134,210,0.12)',
    label: 'B2B SaaS', x: 76, y: 22,
    tools: [
      { label: 'React SPA', x: 92, y: 5 },
      { label: 'Supabase Auth', x: 95, y: 38 },
      { label: 'AI Insights', x: 62, y: 4 },
    ],
  },
  {
    id: 'productlink', name: 'ProductLink',
    description: 'Digital product catalog and commerce solution for SMBs. Streamlined product management.',
    url: 'https://www.productlink.mx/', tags: ['E-commerce', 'B2B', 'Catalog'],
    color: 'var(--accent-3)', bg: 'rgba(217,146,89,0.07)', border: 'rgba(217,146,89,0.2)', glow: 'rgba(217,146,89,0.12)',
    label: 'E-commerce', x: 22, y: 74,
    tools: [
      { label: 'Catalog API', x: 5, y: 94 },
      { label: 'SKU Sync', x: 38, y: 92 },
      { label: 'Commerce Engine', x: 8, y: 60 },
    ],
  },
  {
    id: 'nvem', name: 'Nvem',
    description: 'Modern platform built with a cutting-edge TypeScript stack, showcasing scalable architecture patterns.',
    url: 'https://nvem.vercel.app/', tags: ['TypeScript', 'Vercel', 'Modern Stack'],
    color: 'var(--accent-4)', bg: 'rgba(114,153,213,0.07)', border: 'rgba(114,153,213,0.2)', glow: 'rgba(114,153,213,0.12)',
    label: 'Web App', x: 76, y: 76,
    tools: [
      { label: 'Edge Functions', x: 95, y: 62 },
      { label: 'pgvector', x: 93, y: 90 },
      { label: 'TypeScript', x: 62, y: 94 },
    ],
  },
]

function curvedPath(x1: number, y1: number, x2: number, y2: number, w: number, h: number): string {
  const ax = (x1 / 100) * w, ay = (y1 / 100) * h
  const bx = (x2 / 100) * w, by = (y2 / 100) * h
  const mx = (ax + bx) / 2, my = (ay + by) / 2
  const dx = bx - ax, dy = by - ay
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const nx = -dy / len, ny = dx / len
  const offset = len * 0.12
  return `M ${ax} ${ay} Q ${mx + nx * offset} ${my + ny * offset} ${bx} ${by}`
}

export default function Projects() {
  const containerRef = useRef<HTMLElement>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const svgW = 1200, svgH = 650

  useGSAP(() => {
    const headerTl = gsap.timeline({
      scrollTrigger: { trigger: containerRef.current, start: 'top 78%' },
    })
    headerTl.from('.proj-label-h', { y: 25, autoAlpha: 0, duration: 0.6, ease: 'smooth-out' })
    headerTl.from('.proj-title-h', { y: 40, autoAlpha: 0, duration: 0.8, ease: 'smooth-out' }, '-=0.3')
    headerTl.from('.proj-subtitle-h', { y: 20, autoAlpha: 0, duration: 0.6, ease: 'smooth-out' }, '-=0.5')
  }, { scope: containerRef })

  return (
    <section id="projects" ref={containerRef} className="section bg-[var(--bg-surface)]">
      <div className="max-w-[1280px] mx-auto relative z-10">

        <div className="proj-label-h section-label">Projects</div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <h2 className="proj-title-h text-h1 max-w-md">
            Things I've <span className="text-gradient-accent">shipped</span>
          </h2>
          <p className="proj-subtitle-h text-body text-[var(--text-muted)] max-w-sm md:text-right">
            Live products used by real businesses — AI engines to commerce platforms.
          </p>
        </div>

        <div className="proj-canvas relative" style={{ minHeight: 620 }}>

          {/* SVG connection lines: tool mini-nodes → project nodes */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={`0 0 ${svgW} ${svgH}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {PROJECTS.map(proj =>
              proj.tools.map((tool, ti) => {
                const isActive = hovered === proj.id
                return (
                  <path
                    key={`${proj.id}-t${ti}`}
                    d={curvedPath(tool.x, tool.y, proj.x, proj.y, svgW, svgH)}
                    fill="none"
                    stroke={isActive ? proj.color : 'rgba(255,255,255,0.05)'}
                    strokeWidth={isActive ? 1.2 : 0.6}
                    strokeDasharray={isActive ? '6 4' : '3 5'}
                    opacity={hovered ? (isActive ? 0.7 : 0.03) : 0.2}
                    style={{ transition: 'all 0.35s ease' }}
                  />
                )
              })
            )}
          </svg>

          {/* Mini tool nodes */}
          {PROJECTS.map(proj =>
            proj.tools.map((tool, ti) => {
              const isActive = hovered === proj.id
              const isDimmed = hovered && hovered !== proj.id
              return (
                <div
                  key={`${proj.id}-mini-${ti}`}
                  className="proj-mini absolute select-none pointer-events-none"
                  style={{
                    left: `${tool.x}%`, top: `${tool.y}%`,
                    transform: 'translate(-50%, -50%)',
                    opacity: isDimmed ? 0.06 : isActive ? 1 : 0.5,
                    transition: 'all 0.3s ease',
                    zIndex: isActive ? 5 : 0,
                  }}
                >
                  <div
                    className="px-2 py-1 rounded-md whitespace-nowrap"
                    style={{
                      background: isActive ? `${proj.color}15` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isActive ? `${proj.color}40` : 'rgba(255,255,255,0.06)'}`,
                      boxShadow: 'none',
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: isActive ? proj.color : 'var(--text-disabled)' }} />
                      <span className="font-mono text-[0.55rem] font-medium" style={{ color: isActive ? proj.color : 'var(--text-muted)' }}>
                        {tool.label}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          )}

          {/* Project node cards */}
          {PROJECTS.map(proj => {
            const isActive = hovered === proj.id
            const isDimmed = hovered && hovered !== proj.id
            return (
              <a
                key={proj.id}
                href={proj.url}
                target="_blank"
                rel="noopener noreferrer"
                className="proj-node absolute group no-underline"
                style={{
                  left: `${proj.x}%`, top: `${proj.y}%`,
                  transform: `translate(-50%, -50%) ${isActive ? 'scale(1.03)' : ''}`,
                  opacity: isDimmed ? 0.12 : 1,
                  transition: 'all 0.3s ease',
                  zIndex: isActive ? 10 : 1,
                  width: 'clamp(250px, 28%, 320px)',
                }}
                onMouseEnter={() => setHovered(proj.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <div
                  className="proj-card card-light rounded-xl overflow-hidden backdrop-blur-sm"
                  style={{
                    '--card-accent': proj.color,
                    background: proj.bg,
                    border: `1px solid ${isActive ? proj.color : proj.border}`,
                    boxShadow: isActive ? '0 16px 48px rgba(0,0,0,0.5)' : '0 4px 16px rgba(0,0,0,0.25)',
                  } as React.CSSProperties}
                >
                  <div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="chip gap-1.5 font-mono text-[0.55rem] tracking-[0.1em] uppercase px-2 py-0.5 rounded-md font-medium" style={{ '--chip': proj.color } as React.CSSProperties}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: proj.color }} />
                          {proj.label}
                        </span>
                        <span
                          className="inline-flex items-center gap-1 font-mono text-[0.55rem] uppercase tracking-[0.1em] opacity-70 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5"
                          style={{ color: proj.color }}
                        >
                          <span>Visit</span>
                          <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                            <path d="M1 13L13 1M13 1H6M13 1V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[var(--text)] mb-2 leading-tight group-hover:text-white transition-colors duration-200">{proj.name}</h3>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3 line-clamp-2">{proj.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {proj.tags.map(t => (
                          <span key={t} className="font-mono text-[0.55rem] px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            )
          })}
        </div>

        <style>{`
          @media (max-width: 768px) {
            .proj-canvas { min-height: auto !important; display: flex; flex-direction: column; gap: 1rem; }
            .proj-canvas > svg, .proj-mini { display: none !important; }
            .proj-node { position: relative !important; left: auto !important; top: auto !important; transform: none !important; width: 100% !important; opacity: 1 !important; }
          }
        `}</style>
      </div>
    </section>
  )
}
