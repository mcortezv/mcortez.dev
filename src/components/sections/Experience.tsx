import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, addCardLight } from '@/lib/gsap'
import { personal, achievements } from '@/data/personal'
import NeuralReveal from '@/components/ui/NeuralReveal'

/* ─── Education progress calculation ─── */
function getEducationProgress(): number {
  const start = new Date(2024, 6, 1)
  const end = new Date(2028, 11, 31)
  const now = new Date()
  const total = end.getTime() - start.getTime()
  const elapsed = now.getTime() - start.getTime()
  return Math.min(Math.max((elapsed / total) * 100, 0), 100)
}

export default function Experience() {
  const containerRef = useRef<HTMLElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  const { currentRole, education } = personal
  const progress = getEducationProgress()

  useGSAP(() => {
    const headerTl = gsap.timeline({
      scrollTrigger: { trigger: containerRef.current, start: 'top 78%' },
    })
    headerTl.from('.exp-label', { y: 25, autoAlpha: 0, duration: 0.6, ease: 'smooth-out' })
    headerTl.from('.exp-title', { y: 40, autoAlpha: 0, duration: 0.8, ease: 'smooth-out' }, '-=0.3')

    // ── Cards entrance ──
    const cards = gsap.utils.toArray<HTMLElement>('.exp-card')
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

    // ── Luz que sigue al cursor ──
    const lightCleanups: (() => void)[] = []
    if (window.innerWidth > 768) {
      cards.forEach(card => {
        lightCleanups.push(addCardLight(card))
      })
    }

    // ── Progress bar with glow animation ──
    if (progressRef.current) {
      const barTl = gsap.timeline({
        scrollTrigger: { trigger: progressRef.current, start: 'top 88%' },
      })
      barTl.to(progressRef.current, {
        width: `${progress}%`,
        duration: 2, delay: 0.3, ease: 'smooth-out',
      })
      // Pulse glow on the progress dot after bar animates
      const dot = progressRef.current.querySelector('span')
      if (dot) {
        barTl.to(dot, {
          boxShadow: 'none',
          duration: 0.8, ease: 'power2.inOut', yoyo: true, repeat: 3,
        }, '-=0.5')
      }
    }

    return () => {
      lightCleanups.forEach(fn => fn())
    }
  }, { scope: containerRef })

  return (
    <section id="experience" ref={containerRef} className="section bg-[var(--bg-base)] relative overflow-hidden">
      <NeuralReveal color={[234, 232, 228]} count={40} />
      <div className="max-w-[1280px] mx-auto relative z-10">

        {/* Header */}
        <div className="exp-label section-label">Experience</div>
        <h2 className="exp-title text-h1 mb-14">
          Where I've been{' '}
          <span className="text-gradient-accent">building</span>
        </h2>

        {/* ── Bento Grid ── */}
        <div
          className="exp-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1px',
            background: 'var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}
        >
          {/* ── Current Role Card (2-col) ── */}
          <div
            className="exp-card card-light group relative p-7 md:p-8 overflow-hidden transition-all duration-300 flex flex-col justify-between"
            style={{ gridColumn: 'span 2', background: 'var(--bg-card)', minHeight: 240 }}
          >

            <div className="relative z-10">
              <span className="font-mono text-[0.6rem] tracking-[0.14em] uppercase text-[var(--text-muted)] mb-4 block">Current Role</span>
              <h3 className="text-xl md:text-2xl font-bold text-[var(--text)] leading-tight">
                {currentRole.title}{' '}
                <span className="text-[var(--text-secondary)]">@ {currentRole.company}</span>
              </h3>
              <p className="text-sm text-[var(--text-muted)] mt-3 leading-relaxed max-w-lg">{currentRole.description}</p>
            </div>

            <div className="flex items-center flex-wrap gap-2 mt-6 relative z-10">
              <span className="w-2 h-2 rounded-full flex-shrink-0 relative" style={{ background: 'var(--accent)' }}>
                <span className="absolute inset-[-3px] rounded-full animate-pulse-dot" style={{ background: 'var(--accent)', opacity: 0.4 }} />
              </span>
              <span className="font-mono text-[0.65rem] sm:text-xs text-[var(--text-secondary)] tracking-wide">Active · Remote · ene. 2026 – Present</span>
            </div>
          </div>

          {/* ── Education Card ── */}
          <div className="exp-card card-light group relative p-7 overflow-hidden transition-all duration-300 flex flex-col" style={{ background: 'var(--bg-card)' }}>

            <div className="relative z-10 flex-1">
              <span className="font-mono text-[0.6rem] tracking-[0.14em] uppercase text-[var(--text-muted)] mb-3 block">Education</span>
              <h3 className="text-lg font-bold text-[var(--text)] leading-tight">ITSON</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1 leading-snug">B.S. Computer Software Engineering<br />Instituto Tecnológico de Sonora</p>
              <div className="flex flex-wrap gap-1.5 mt-4">
                {education.subjects.map((s) => (
                  <span key={s} className="font-mono text-[0.6rem] text-[var(--text-secondary)] px-2 py-0.5 rounded border border-[var(--border)]" style={{ background: 'var(--accent-2-dim)' }}>{s}</span>
                ))}
              </div>
            </div>

            <div className="relative z-10 mt-6">
              <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div ref={progressRef} className="h-full rounded-full relative" style={{ width: 0, background: 'linear-gradient(90deg, var(--accent-2), rgba(151,134,210,0.4))' }}>
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full" style={{ background: 'var(--accent-2)' }} />
                </div>
              </div>
              <div className="flex justify-between mt-2 font-mono text-[0.6rem] text-[var(--text-muted)] tracking-wide">
                <span>Jul 2024</span>
                <span>{Math.round(progress)}% Complete</span>
                <span>Dec 2028</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── Achievements — separate row, equal width ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* NVIDIA */}
          <div
            className="exp-card group relative rounded-2xl p-7 overflow-hidden transition-all duration-300"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >

            <div className="relative z-10 flex items-start gap-5">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-medium)' }}
              >
                <img src="https://upload.wikimedia.org/wikipedia/sco/2/21/Nvidia_logo.svg" alt="NVIDIA" className="tech-logo w-10 h-10 object-contain" loading="lazy" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-[var(--text)] leading-tight mb-1">{achievements[0].title}</p>
                <p className="text-xs font-medium mb-2 text-[var(--text-secondary)]">{achievements[0].issuer}</p>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{achievements[0].description}</p>
                <p className="text-[0.65rem] text-[var(--text-disabled)] font-mono mt-3">{achievements[0].date}</p>
              </div>
            </div>
          </div>

          {/* Intel */}
          <div
            className="exp-card group relative rounded-2xl p-7 overflow-hidden transition-all duration-300"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >

            <div className="relative z-10 flex items-start gap-5">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-medium)' }}
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282006-2020%29.svg" alt="Intel" className="tech-logo w-10 h-10 object-contain" loading="lazy"  />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-[var(--text)] leading-tight mb-1">{achievements[1].title}</p>
                <p className="text-xs font-medium mb-2 text-[var(--text-secondary)]">{achievements[1].issuer}</p>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{achievements[1].description}</p>
                <p className="text-[0.65rem] text-[var(--text-disabled)] font-mono mt-3">{achievements[1].date}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Responsive */}
        <style>{`
          @media (max-width: 768px) {
            .exp-grid {
              grid-template-columns: 1fr 1fr !important;
            }
            .exp-grid > :first-child {
              grid-column: span 2 !important;
            }
            .exp-grid > :nth-child(3) {
              grid-column: span 1 !important;
            }
          }
          @media (max-width: 480px) {
            .exp-grid {
              grid-template-columns: 1fr !important;
            }
            .exp-grid > * {
              grid-column: span 1 !important;
            }
          }
        `}</style>
      </div>
    </section>
  )
}
