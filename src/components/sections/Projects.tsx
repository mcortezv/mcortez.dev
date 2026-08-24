import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import NeuralReveal from '@/components/ui/NeuralReveal'

/* ─── Project nodes ───────────────────────────────────────────
   Cinco nodos en 3 + 2: tres arriba y dos centrados abajo. Los chips de
   herramientas que flotaban en los margenes salieron con el paso a tres
   columnas — no queda margen lateral donde vivan sin chocar contra las
   tarjetas. Las lineas del canvas ahora unen proyectos entre si, que es lo
   que la constelacion queria decir desde el principio. */
/* La firma de cada proyecto. Un icono generico habria dejado las cinco
   tarjetas igual de planas con un adorno encima; esto muestra el material del
   proyecto — su pipeline, su regla, su sintaxis, su equipo, sus numeros — asi
   que cada tarjeta dice algo que solo ella puede decir. Todas ocupan una sola
   linea a proposito: la rejilla necesita que las tarjetas midan lo mismo. */
type Signature =
  | { kind: 'flow'; steps: string[] }
  | { kind: 'rule'; from: string; to: string }
  | { kind: 'code'; key: string; value: string }
  | { kind: 'team'; dots: number; label: string }
  | { kind: 'stats'; items: [string, string][] }

interface ProjectNode {
  id: string; name: string; description: string; url: string; tags: string[]
  color: string; bg: string; border: string; glow: string; label: string
  cta: string; signature: Signature
  x: number; y: number
  concepts: { label: string; x: number; y: number }[]
}

/* `color` va en hex crudo, no en var(--...), a proposito: varias piezas de esta
   seccion construyen fondos y bordes concatenando alpha (`${color}14`), y un
   `var(--accent)14` es CSS invalido que el navegador tira. El SVG tambien lo
   necesita: `stroke` es un atributo de presentacion y no resuelve variables. */
const PROJECTS: ProjectNode[] = [
  {
    id: 'hyperflow', name: 'Hyperflow',
    description: 'AI-powered operating system for modern business workflows. Automation, agent orchestration, and intelligent process management at scale.',
    url: 'https://www.hyperflowos.com/', tags: ['AI Agents', 'Automation', 'Mastra'],
    color: '#40d1a0', bg: 'rgba(64,209,160,0.07)', border: 'rgba(64,209,160,0.2)', glow: 'rgba(64,209,160,0.12)',
    label: 'Core Contributor', cta: 'Visit', x: 18, y: 30,
    signature: { kind: 'flow', steps: ['Trigger', 'Agent', 'Action'] },
    concepts: [
      { label: 'Agent orchestration', x: 7,  y: 7 },
      { label: 'Mind · discovery',    x: 26, y: 5 },
      { label: 'Embeddings + RAG',    x: 6,  y: 52 },
      { label: 'Workflow engine',     x: 24, y: 54 },
    ],
  },
  {
    id: 'roz', name: 'roz',
    description: 'The intelligence layer over GitHub. Derives task state from commits, PRs and repos, then documents, routes and notifies on its own.',
    url: 'https://roz-ops.vercel.app/', tags: ['Claude', 'Hono', 'Supabase'],
    color: '#7299d5', bg: 'rgba(114,153,213,0.07)', border: 'rgba(114,153,213,0.2)', glow: 'rgba(114,153,213,0.12)',
    label: 'Open Source', cta: 'Visit', x: 50, y: 30,
    signature: { kind: 'rule', from: 'PR opened', to: 'in review' },
    concepts: [
      { label: 'Semantic dedup',          x: 42, y: 5 },
      { label: 'Skill + capacity routing', x: 60, y: 7 },
      { label: 'Identity resolution',     x: 44, y: 53 },
      { label: 'Auto-onboarding',         x: 62, y: 55 },
    ],
  },
  {
    id: 'russell', name: 'Russell',
    description: 'A declarative language for conversational agents. Node topology, intent routing and guards as versioned JSON that a runtime compiles.',
    url: 'https://www.npmjs.com/package/russell-schema', tags: ['DSL', 'JSON Schema', 'Agents'],
    color: '#c08292', bg: 'rgba(192,130,146,0.07)', border: 'rgba(192,130,146,0.2)', glow: 'rgba(192,130,146,0.12)',
    label: 'Language Spec', cta: 'npm', x: 82, y: 30,
    signature: { kind: 'code', key: '"type"', value: '"llm_classifier"' },
    concepts: [
      { label: 'llm_classifier',     x: 78, y: 5 },
      { label: 'response_composer',  x: 93, y: 8 },
      { label: 'escalation_node',    x: 92, y: 52 },
      { label: 'price_guard',        x: 76, y: 55 },
    ],
  },
  {
    id: 'teamup', name: 'TeamUp',
    description: 'Team collaboration platform with AI-driven productivity insights for Mexican businesses.',
    url: 'https://www.teamup.mx/', tags: ['B2B', 'SaaS', 'Collaboration'],
    color: '#9786d2', bg: 'rgba(151,134,210,0.07)', border: 'rgba(151,134,210,0.2)', glow: 'rgba(151,134,210,0.12)',
    label: 'B2B SaaS', cta: 'Visit', x: 34, y: 76,
    signature: { kind: 'team', dots: 3, label: 'AI productivity insights' },
    concepts: [
      { label: 'Productivity insights', x: 8,  y: 66 },
      { label: 'LLM service',           x: 6,  y: 82 },
      { label: 'Superadmin',            x: 26, y: 96 },
      { label: 'Supabase Auth',         x: 8,  y: 96 },
    ],
  },
  {
    id: 'aiprogram', name: 'AI Engineering Program',
    description: 'Training program in AI systems engineering. Twenty modules and forty-four lecture hours, compiled from versioned text into 373 slides.',
    url: 'https://github.com/mcortezv/ai-engineering-program', tags: ['Curriculum', 'Python', 'Docs as Code'],
    color: '#d99259', bg: 'rgba(217,146,89,0.07)', border: 'rgba(217,146,89,0.2)', glow: 'rgba(217,146,89,0.12)',
    label: 'Curriculum', cta: 'Code', x: 66, y: 76,
    signature: { kind: 'stats', items: [['20', 'modules'], ['373', 'slides'], ['44', 'hours']] },
    concepts: [
      { label: '5 parts',            x: 92, y: 66 },
      { label: '105-page syllabus',  x: 93, y: 82 },
      { label: '60 vector diagrams', x: 76, y: 96 },
      { label: 'Text → PDF build',   x: 94, y: 96 },
    ],
  },
]

/* Un anillo: cada nodo toca exactamente a dos. Con cinco proyectos eso da una
   figura cerrada y legible, en vez de la maraña que sale al conectar todo
   contra todo. */
const LINKS: [string, string][] = [
  ['hyperflow', 'roz'],
  ['roz', 'russell'],
  ['russell', 'aiprogram'],
  ['aiprogram', 'teamup'],
  ['teamup', 'hyperflow'],
]

const NODE = Object.fromEntries(PROJECTS.map(p => [p.id, p]))

/* Fuera del render: esta seccion se re-renderiza en cada hover. */
const REVEAL_COLOR: [number, number, number] = [234, 232, 228]

function SignatureRow({ sig, color }: { sig: Signature; color: string }) {
  const pill = 'font-mono text-[0.55rem] px-1.5 py-0.5 rounded leading-none'

  if (sig.kind === 'flow') {
    return (
      <div className="flex items-center gap-1 flex-wrap">
        {sig.steps.map((step, i) => (
          <div key={step} className="flex items-center gap-1">
            <span className={pill} style={{ background: `${color}14`, border: `1px solid ${color}2e`, color }}>{step}</span>
            {i < sig.steps.length - 1 && <span className="text-[0.55rem] leading-none" style={{ color: `${color}99` }}>→</span>}
          </div>
        ))}
      </div>
    )
  }

  if (sig.kind === 'rule') {
    return (
      <div className="flex items-center gap-1.5 font-mono text-[0.55rem] leading-none">
        <span className="text-[var(--text-muted)]">{sig.from}</span>
        <span style={{ color }}>▸</span>
        <span style={{ color }}>{sig.to}</span>
      </div>
    )
  }

  if (sig.kind === 'code') {
    return (
      <div
        className="font-mono text-[0.55rem] px-2 py-1 rounded leading-none inline-flex gap-1"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}
      >
        <span style={{ color }}>{sig.key}</span>
        <span className="text-[var(--text-disabled)]">:</span>
        <span className="text-[var(--text-secondary)]">{sig.value}</span>
      </div>
    )
  }

  if (sig.kind === 'team') {
    return (
      <div className="flex items-center gap-2">
        <div className="flex">
          {Array.from({ length: sig.dots }, (_, i) => (
            <span
              key={i}
              className="w-[15px] h-[15px] rounded-full"
              style={{
                background: `${color}26`, border: `1px solid ${color}45`,
                marginLeft: i === 0 ? 0 : -5, zIndex: sig.dots - i,
              }}
            />
          ))}
        </div>
        <span className="font-mono text-[0.55rem] leading-none" style={{ color }}>{sig.label}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {sig.items.map(([value, label]) => (
        <div key={label} className="flex items-baseline gap-1">
          <span className="font-mono text-[0.7rem] font-bold leading-none" style={{ color }}>{value}</span>
          <span className="font-mono text-[0.5rem] leading-none text-[var(--text-muted)]">{label}</span>
        </div>
      ))}
    </div>
  )
}

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
    <section id="projects" ref={containerRef} className="section bg-[var(--bg-surface)] relative overflow-hidden">
      {/* Projects era la unica seccion sin esta capa: por eso se sentia mas
          vacia que sus vecinas incluso con el mismo contenido. */}
      <NeuralReveal color={REVEAL_COLOR} count={45} />
      <div className="max-w-[1280px] mx-auto relative z-10">

        <div className="proj-label-h section-label">Projects</div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <h2 className="proj-title-h text-h1 max-w-md">
            Things I've <span className="text-gradient-accent">shipped</span>
          </h2>
          <p className="proj-subtitle-h text-body text-[var(--text-muted)] max-w-sm md:text-right">
            Live products, open source agent tooling, and a curriculum on AI systems.
          </p>
        </div>

        <div className="proj-canvas relative" style={{ minHeight: 620 }}>

          {/* Lineas: el anillo entre proyectos, siempre; y las que van a los
              conceptos, solo del proyecto que tiene el cursor. */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={`0 0 ${svgW} ${svgH}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {LINKS.map(([a, b]) => {
              const na = NODE[a], nb = NODE[b]
              const isActive = hovered === a || hovered === b
              return (
                <path
                  key={`${a}-${b}`}
                  d={curvedPath(na.x, na.y, nb.x, nb.y, svgW, svgH)}
                  fill="none"
                  stroke={isActive ? NODE[hovered as string].color : 'rgba(255,255,255,0.05)'}
                  strokeWidth={isActive ? 1.2 : 0.6}
                  strokeDasharray={isActive ? '6 4' : '3 5'}
                  opacity={hovered ? (isActive ? 0.7 : 0.03) : 0.2}
                  style={{ transition: 'all 0.35s ease' }}
                />
              )
            })}

            {PROJECTS.map(proj =>
              proj.concepts.map((c, ci) => {
                const isActive = hovered === proj.id
                return (
                  <path
                    key={`${proj.id}-c${ci}`}
                    d={curvedPath(c.x, c.y, proj.x, proj.y, svgW, svgH)}
                    fill="none"
                    stroke={proj.color}
                    strokeWidth={1}
                    strokeDasharray="5 4"
                    opacity={isActive ? 0.55 : 0}
                    style={{ transition: 'opacity 0.35s ease' }}
                  />
                )
              })
            )}
          </svg>

          {/* Conceptos. En reposo son puntos tenues que le dan densidad al
              canvas; al activarse su proyecto, se encienden y sale la etiqueta. */}
          {PROJECTS.map((proj, pi) =>
            proj.concepts.map((c, ci) => {
              const isActive = hovered === proj.id
              const isDimmed = hovered && !isActive
              const flip = c.x > 62
              const seed = pi * 4 + ci
              return (
                /* El punto es el ancla y mide lo que mide: la etiqueta va
                   absoluta a su lado. Cuando ambos vivian en el mismo flex, la
                   etiqueta seguia ocupando su ancho con `opacity: 0`, asi que
                   lo que quedaba centrado en (x, y) era el contenedor entero y
                   el punto acababa desplazado media etiqueta. */
                <div
                  key={`${proj.id}-concept-${ci}`}
                  className="proj-mini proj-concept-dot absolute select-none pointer-events-none"
                  style={{
                    left: `${c.x}%`, top: `${c.y}%`,
                    width: isActive ? 6 : 4,
                    height: isActive ? 6 : 4,
                    marginLeft: isActive ? -3 : -2,
                    marginTop: isActive ? -3 : -2,
                    borderRadius: '9999px',
                    background: isActive ? proj.color : 'var(--text-disabled)',
                    boxShadow: isActive ? `0 0 10px ${proj.glow}` : 'none',
                    opacity: isDimmed ? 0.05 : 1,
                    zIndex: isActive ? 6 : 0,
                    animationDuration: `${9 + (seed % 7) * 1.2}s`,
                    animationDelay: `-${(seed * 1.37) % 9}s`,
                    animationDirection: seed % 2 ? 'reverse' : 'normal',
                    transition: 'width 0.3s ease, height 0.3s ease, margin 0.3s ease, background 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease',
                  }}
                >
                  <span
                    className="absolute top-1/2 font-mono text-[0.55rem] font-medium whitespace-nowrap px-1.5 py-0.5 rounded leading-none"
                    style={{
                      [flip ? 'right' : 'left']: 'calc(100% + 7px)',
                      opacity: isActive ? 1 : 0,
                      transform: isActive
                        ? 'translateY(-50%)'
                        : `translateY(-50%) translateX(${flip ? 5 : -5}px)`,
                      background: `${proj.color}14`,
                      border: `1px solid ${proj.color}2e`,
                      color: proj.color,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {c.label}
                  </span>
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
                          <span>{proj.cta}</span>
                          <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                            <path d="M1 13L13 1M13 1H6M13 1V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[var(--text)] mb-2 leading-tight group-hover:text-white transition-colors duration-200">{proj.name}</h3>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3 line-clamp-2">{proj.description}</p>

                      {/* Firma: lo que solo este proyecto puede mostrar */}
                      <div className="proj-sig mb-3 pt-3 min-h-[30px] flex items-center" style={{ borderTop: '1px solid var(--border)' }}>
                        <SignatureRow sig={proj.signature} color={proj.color} />
                      </div>

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
