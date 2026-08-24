import { useRef, useState, useMemo } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, addCardLight } from '@/lib/gsap'
import NeuralReveal from '@/components/ui/NeuralReveal'

/* ─── Map dot positions ─── */
const MAP_DOTS: { x: number; y: number; active?: boolean }[] = [
  { x: 20, y: 15 }, { x: 35, y: 12 }, { x: 50, y: 18 }, { x: 65, y: 10 },
  { x: 80, y: 20 }, { x: 15, y: 30 }, { x: 30, y: 28 }, { x: 45, y: 35 },
  { x: 60, y: 32 }, { x: 75, y: 38 }, { x: 25, y: 48 }, { x: 40, y: 45 },
  { x: 55, y: 50, active: true }, { x: 70, y: 52 }, { x: 85, y: 48 },
  { x: 20, y: 62 }, { x: 35, y: 58 }, { x: 50, y: 65 }, { x: 65, y: 68 },
  { x: 80, y: 60 }, { x: 10, y: 75 }, { x: 30, y: 78 }, { x: 45, y: 72 },
  { x: 60, y: 80 }, { x: 75, y: 75 }, { x: 90, y: 85 }, { x: 42, y: 88 },
  { x: 58, y: 90 }, { x: 22, y: 92 }, { x: 88, y: 70 },
]

/* ─── Focus Network Data ─── */
interface FocusNode {
  id: string
  label: string
  sub: string
  color: string
  bg: string
  border: string
  glow: string
  x: number
  y: number
}

const FOCUS_NODES: FocusNode[] = [
  { id: 'agents',     label: 'AI Agents',           sub: 'LangChain · Mastra · Autonomous orchestration',  color: 'var(--accent-4)', bg: 'rgba(114,153,213,0.08)',  border: 'rgba(114,153,213,0.3)',  glow: 'rgba(114,153,213,0.15)', x: 12, y: 20 },
  { id: 'rag',        label: 'RAG Systems',         sub: 'Context-aware retrieval · Chunking · Reranking', color: 'var(--accent)', bg: 'rgba(64,209,160,0.08)',  border: 'rgba(64,209,160,0.3)',  glow: 'rgba(64,209,160,0.15)', x: 50, y: 10 },
  { id: 'workflows',  label: 'Workflow Automation',  sub: 'Multi-step pipelines · Event-driven triggers',  color: 'var(--accent-3)', bg: 'rgba(217,146,89,0.08)', border: 'rgba(217,146,89,0.3)', glow: 'rgba(217,146,89,0.15)', x: 88, y: 20 },
  { id: 'embeddings', label: 'Embeddings & Context', sub: 'pgvector · Semantic search · Similarity index', color: 'var(--accent-2)', bg: 'rgba(151,134,210,0.08)', border: 'rgba(151,134,210,0.3)', glow: 'rgba(151,134,210,0.15)', x: 22, y: 68 },
  { id: 'evals',      label: 'Model Evaluations',   sub: 'LangSmith traces · Custom evals · Benchmarks',  color: '#c08292', bg: 'rgba(192,130,146,0.08)',  border: 'rgba(192,130,146,0.3)',  glow: 'rgba(192,130,146,0.15)',  x: 55, y: 82 },
  { id: 'b2b',        label: 'B2B Product AI',      sub: 'Revenue features · User-facing AI · SaaS',      color: '#79aab5', bg: 'rgba(121,170,181,0.08)',  border: 'rgba(121,170,181,0.3)',  glow: 'rgba(121,170,181,0.15)',  x: 85, y: 66 },
]

const FOCUS_EDGES: [string, string][] = [
  ['agents', 'rag'],
  ['agents', 'workflows'],
  ['agents', 'embeddings'],
  ['rag', 'embeddings'],
  ['rag', 'evals'],
  ['workflows', 'b2b'],
  ['evals', 'b2b'],
  ['embeddings', 'evals'],
  ['agents', 'b2b'],
]

/* Build a curved SVG path between two percentage-based points */
function curvedPath(x1: number, y1: number, x2: number, y2: number, w: number, h: number): string {
  const ax = (x1 / 100) * w
  const ay = (y1 / 100) * h
  const bx = (x2 / 100) * w
  const by = (y2 / 100) * h
  const mx = (ax + bx) / 2
  const my = (ay + by) / 2
  const dx = bx - ax
  const dy = by - ay
  const len = Math.sqrt(dx * dx + dy * dy)
  const nx = -dy / len
  const ny = dx / len
  const offset = len * 0.18
  const cx = mx + nx * offset
  const cy = my + ny * offset
  return `M ${ax} ${ay} Q ${cx} ${cy} ${bx} ${by}`
}

function FocusNetwork() {
  const [hovered, setHovered] = useState<string | null>(null)
  const svgW = 800
  const svgH = 220

  const connectedMap = useMemo(() => {
    const map = new Map<string, Set<string>>()
    FOCUS_EDGES.forEach(([a, b]) => {
      if (!map.has(a)) map.set(a, new Set())
      if (!map.has(b)) map.set(b, new Set())
      map.get(a)!.add(b)
      map.get(b)!.add(a)
    })
    return map
  }, [])

  const connectedToHovered = useMemo(() => {
    if (!hovered) return null
    const set = new Set<string>([hovered])
    connectedMap.get(hovered)?.forEach(id => set.add(id))
    return set
  }, [hovered, connectedMap])

  return (
    <>
      {/* Desktop: graph layout */}
      <div className="relative w-full hidden md:block" style={{ height: 220 }}>
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${svgW} ${svgH}`}
          preserveAspectRatio="none"
          style={{ zIndex: 0 }}
        >
          {FOCUS_EDGES.map(([a, b]) => {
            const na = FOCUS_NODES.find(n => n.id === a)!
            const nb = FOCUS_NODES.find(n => n.id === b)!
            const isHighlighted = connectedToHovered
              ? connectedToHovered.has(a) && connectedToHovered.has(b)
              : false
            return (
              <path
                key={`${a}-${b}`}
                d={curvedPath(na.x, na.y, nb.x, nb.y, svgW, svgH)}
                fill="none"
                stroke={isHighlighted ? na.color : 'rgba(255,255,255,0.08)'}
                strokeWidth={isHighlighted ? 1.5 : 0.8}
                strokeDasharray={isHighlighted ? '8 4' : '4 6'}
                opacity={connectedToHovered ? (isHighlighted ? 0.9 : 0.05) : 0.35}
                style={{ transition: 'all 0.3s ease' }}
              />
            )
          })}
        </svg>

        {FOCUS_NODES.map(node => {
          const isHighlighted = connectedToHovered ? connectedToHovered.has(node.id) : false
          const isDimmed = connectedToHovered ? !connectedToHovered.has(node.id) : false
          const isHoveredNode = hovered === node.id

          return (
            <div
              key={node.id}
              className="absolute cursor-default select-none"
              style={{
                left: `${node.x}%`, top: `${node.y}%`,
                transform: `translate(-50%, -50%) ${isHoveredNode ? 'scale(1.06)' : ''}`,
                opacity: isDimmed ? 0.12 : isHighlighted ? 1 : 0.8,
                transition: 'all 0.25s ease',
                zIndex: isHighlighted ? 10 : 1,
              }}
              onMouseEnter={() => setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <div
                className={`focus-node px-3.5 py-2 rounded-lg border backdrop-blur-sm ${isHighlighted ? 'focus-node--on' : ''}`}
                style={{
                  '--tone': node.color,
                  background: node.bg,
                  borderColor: isHighlighted ? node.color : node.border,
                } as React.CSSProperties}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: node.color }} />
                  <span className="text-xs font-semibold whitespace-nowrap" style={{ color: isHighlighted ? node.color : 'var(--text-secondary)' }}>
                    {node.label}
                  </span>
                </div>
                <p className="text-[0.6rem] whitespace-nowrap pl-4" style={{ color: isHighlighted ? 'var(--text-secondary)' : 'var(--text-muted)', transition: 'color 0.25s' }}>
                  {node.sub}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Mobile: wrapped grid */}
      <div className="flex flex-wrap gap-2 md:hidden mt-2">
        {FOCUS_NODES.map(node => (
          <div
            key={node.id}
            className="px-3 py-2 rounded-lg border"
            style={{ background: node.bg, borderColor: node.border }}
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: node.color }} />
              <span className="text-xs font-semibold" style={{ color: node.color }}>{node.label}</span>
            </div>
            <p className="text-[0.55rem] text-[var(--text-muted)] pl-3">{node.sub}</p>
          </div>
        ))}
      </div>
    </>
  )
}

export default function About() {
  const containerRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: containerRef.current, start: 'top 75%' },
    })
    tl.from('.about-label', { y: 25, autoAlpha: 0, duration: 0.6, ease: 'smooth-out' })
    tl.from('.about-title', { y: 40, autoAlpha: 0, duration: 0.8, ease: 'smooth-out' }, '-=0.3')

    // ── Cards entrance ──
    const cards = gsap.utils.toArray<HTMLElement>('.about-card')
    cards.forEach((card, i) => {
      gsap.from(card, {
        y: 50,
        autoAlpha: 0,
        duration: 0.9,
        delay: i * 0.12,
        ease: 'smooth-out',
        scrollTrigger: { trigger: card, start: 'top 88%' },
      })
    })

    // ── Luz que sigue al cursor dentro de cada tarjeta ──
    const lightCleanups: (() => void)[] = []
    if (window.innerWidth > 768) {
      cards.forEach(card => {
        lightCleanups.push(addCardLight(card))
      })
    }

    // ── Map dot breathing animation ──
    gsap.utils.toArray<HTMLElement>('.about-map-dot:not(.about-map-dot--active)').forEach((dot) => {
      gsap.to(dot, {
        opacity: Math.random() * 0.5 + 0.15,
        duration: Math.random() * 2 + 1.5,
        repeat: -1, yoyo: true, ease: 'sine.inOut',
        delay: Math.random() * 2,
      })
    })

    // ── Parallax on the about grid as you scroll past ──
    gsap.to('.about-grid', {
      y: -40,
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
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
    <section id="about" ref={containerRef} className="section bg-[var(--bg-base)] relative overflow-hidden">
      <NeuralReveal color={[234, 232, 228]} count={50} />
      <div className="max-w-[1280px] mx-auto relative z-10">

        <div className="about-label section-label">About</div>
        <h2 className="about-title text-h1 mb-14 max-w-xl">
          Building AI systems that{' '}
          <span className="text-gradient-accent">actually work</span>{' '}
          in production.
        </h2>

        <div
          className="about-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1px',
            background: 'var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}
        >
          {/* Bio Card (2-col) */}
          <div
            className="about-card card-light group relative p-7 md:p-8 overflow-hidden transition-all duration-300"
            style={{ gridColumn: 'span 2', background: 'var(--bg-card)' }}
          >

            <span className="font-mono text-[0.6rem] tracking-[0.14em] uppercase text-[var(--text-muted)] mb-4 block relative z-10">Who I am</span>
            <p className="text-lg md:text-xl font-medium text-[var(--text)] leading-relaxed mb-4 relative z-10">
              I'm <span className="text-[var(--text)] font-semibold">Manuel Cortez</span>, Head of AI at HyperLabs,
              crafting intelligent agents, automated workflows, and RAG systems
              that drive real business impact.
            </p>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed relative z-10 max-w-xl">
              I specialize in context-aware AI architectures, embedding
              pipelines, and model evaluations that improve UX, operational
              efficiency, and sales for B2B products.
            </p>
          </div>

          {/* Location Card */}
          <div
            className="about-card card-light group relative p-7 overflow-hidden transition-all duration-300"
            style={{ background: 'var(--bg-card)', minHeight: 200 }}
          >

            <span className="font-mono text-[0.6rem] tracking-[0.14em] uppercase text-[var(--text-muted)] mb-3 block relative z-10">Location</span>
            <h3 className="text-2xl md:text-3xl font-bold text-[var(--text)] leading-tight relative z-10">Sonora, MX</h3>
            <p className="text-sm text-[var(--text-muted)] mt-1 relative z-10">Ciudad Obregón, Mexico</p>

            <div className="absolute bottom-0 right-0 w-[55%] h-[65%] pointer-events-none overflow-hidden">
              {MAP_DOTS.map((dot, i) => (
                <span
                  key={i}
                  className={`about-map-dot absolute rounded-full ${dot.active ? 'about-map-dot--active' : ''}`}
                  style={{
                    left: `${dot.x}%`, top: `${dot.y}%`,
                    width: dot.active ? 6 : 3, height: dot.active ? 6 : 3,
                    background: dot.active ? 'var(--accent)' : 'var(--text-muted)',
                    opacity: dot.active ? 1 : 0.5,
                    boxShadow: 'none',
                  }}
                />
              ))}
              <style>{`
                .about-map-dot--active::after {
                  content: ''; position: absolute; inset: -6px; border-radius: 50%;
                  border: 1px solid var(--accent); opacity: 0;
                  animation: map-ping 3s ease-out infinite;
                }
                @keyframes map-ping {
                  0% { transform: scale(0.5); opacity: 0.8; }
                  100% { transform: scale(3); opacity: 0; }
                }
              `}</style>
            </div>
          </div>

          {/* Focus Network Card (3-col) */}
          <div
            className="about-card group relative p-7 md:p-8 overflow-hidden"
            style={{ gridColumn: 'span 3', background: 'var(--bg-card)' }}
          >
            <span className="font-mono text-[0.6rem] tracking-[0.14em] uppercase text-[var(--text-muted)] mb-2 block relative z-10">What I Focus On</span>
            <FocusNetwork />
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .about-grid { grid-template-columns: 1fr 1fr !important; }
            .about-grid > :first-child { grid-column: span 2 !important; }
            .about-grid > :last-child { grid-column: span 2 !important; }
          }
          @media (max-width: 480px) {
            .about-grid { grid-template-columns: 1fr !important; }
            .about-grid > * { grid-column: span 1 !important; }
          }
        `}</style>
      </div>
    </section>
  )
}
