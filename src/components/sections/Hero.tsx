import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, scrollTo } from '@/lib/gsap'
import HeroCanvas from './HeroCanvas'

/** Momento en que el canvas dispara la explosión de partículas (ver HeroCanvas) */
const HANDOFF = 2.35

export default function Hero({ canAnimate = false }: { canAnimate?: boolean }) {
  const containerRef = useRef<HTMLElement>(null)

  // ── Estado inicial oculto ─────────────────────────────────
  useGSAP(() => {
    gsap.set('.hero-window',   { autoAlpha: 0, y: 18 })
    // La placa entra con la ventana: antes de eso las partículas forman el
    // nombre sobre el fondo limpio, sin nada que las apague.
    gsap.set('.hero-plate',    { autoAlpha: 0 })
    gsap.set('.hero-chrome',   { autoAlpha: 0 })
    gsap.set('.hero-title-ln', { yPercent: 104 })
    gsap.set('.hero-divider',  { scaleX: 0 })
    gsap.set('.hero-stagger',  { autoAlpha: 0, y: 12 })
    gsap.set('.hero-scroll',   { autoAlpha: 0 })
  }, { scope: containerRef })

  // ── Entrada ───────────────────────────────────────────────
  useGSAP(() => {
    if (!canAnimate || !containerRef.current) return

    const isMobile = window.innerWidth < 768
    // En retrato no hay formación del nombre que esperar: el contenido entra ya.
    gsap.timeline({ delay: isMobile ? 0.25 : HANDOFF - 0.2, defaults: { ease: 'smooth-out' } })
      .to('.hero-window',   { autoAlpha: 1, y: 0, duration: 0.9 })
      .to('.hero-plate',    { autoAlpha: 1, duration: 1.1, ease: 'none' }, 0)
      .to('.hero-chrome',   { autoAlpha: 1, duration: 0.5, stagger: 0.06 }, 0.22)
      .to('.hero-title-ln', { yPercent: 0, duration: 1.0, stagger: 0.07 }, 0.30)
      .to('.hero-divider',  { scaleX: 1, duration: 0.8 }, 0.58)
      .to('.hero-stagger',  { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.07 }, 0.62)
      .to('.hero-scroll',   { autoAlpha: 1, duration: 0.5 }, 0.95)

    // ── Scale-down anclado al scroll (solo desktop) ──
    if (!isMobile) {
      gsap.timeline({
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: '+=50%',
          pin: true,
          scrub: 0.5,
        },
      }).to('.hero-inner', { scale: 0.94, borderRadius: '20px', duration: 1 })
    }

    // ── Indicador de scroll ──
    gsap.to('.hero-scroll', {
      autoAlpha: 0,
      ease: 'none',
      scrollTrigger: { trigger: '#hero', start: '60px top', end: '260px top', scrub: true },
    })
  }, { scope: containerRef, dependencies: [canAnimate] })

  return (
    <section id="hero" ref={containerRef} className="relative overflow-visible bg-[var(--bg-base)]">
      <div
        className="hero-inner hero-shell relative overflow-hidden flex"
        style={{ minHeight: '100svh', willChange: 'transform', background: 'var(--bg-base)' }}
      >
        {/* ── Plano de esquemas generado por partículas ── */}
        {canAnimate && <HeroCanvas />}

        {/* ── Placa sólida bajo la columna de texto ── */}
        <div className="hero-plate z-[1]" aria-hidden="true" />

        {/* ── Vignette ── */}
        <div className="hero-vignette z-[2]" aria-hidden="true" />

        {/* ═══ Ventana ═══ */}
        <div
          className="relative z-10 w-full max-w-[1320px] mx-auto px-4 sm:px-8 lg:px-12 flex flex-col"
          style={{
            minHeight: '100svh',
            paddingTop:    'calc(5.25rem + env(safe-area-inset-top, 0px))',
            paddingBottom: 'calc(5.75rem + env(safe-area-inset-bottom, 0px))',
          }}
        >
          <div className="hero-window">

            {/* ── Barra de título ── */}
            <div className="hero-titlebar">
              <span className="hero-chrome hero-dots" aria-hidden="true">
                <i /><i /><i />
              </span>

              <span className="hero-chrome hero-url">mcortez.dev</span>

              <span className="hero-chrome hero-eyebrow hidden sm:inline-flex items-center gap-2 flex-none">
                <span className="w-1 h-1 rounded-full bg-[var(--accent)] animate-pulse-dot" />
                Active
              </span>
            </div>

            {/* ── Cuerpo ── */}
            <div className="hero-body">
              <div className="hero-main">

                <p className="hero-stagger hero-eyebrow mb-6 sm:mb-7">
                  001 &nbsp;/&nbsp; AI Developer &amp; Consultant
                </p>

                <h1 className="hero-title mb-7 sm:mb-8">
                  <span className="hero-line"><span className="hero-title-ln">Manuel</span></span>
                  <span className="hero-line"><span className="hero-title-ln">Cortez</span></span>
                </h1>

                <div className="hero-divider mb-7 sm:mb-8" />

                <p
                  className="hero-stagger text-[var(--text-secondary)] max-w-[46ch] mb-8 sm:mb-10"
                  style={{ fontSize: 'clamp(0.9375rem, 1.15vw, 1.0625rem)', lineHeight: 1.72, textWrap: 'pretty' }}
                >
                  Building at the intersection of AI and exceptional software.{' '}
                  <span className="text-[var(--text)]">Agents, RAG pipelines, automated workflows</span>{' '}
                  and interfaces that move the needle in B2B products.
                </p>

                <div className="hero-stagger flex flex-wrap gap-2.5">
                  <button onClick={() => scrollTo('research')} className="btn-hero btn-hero--solid">
                    Read research <span className="btn-hero-arrow">→</span>
                  </button>
                  <button onClick={() => scrollTo('contact')} className="btn-hero">
                    Get in touch
                  </button>
                </div>
              </div>
            </div>

            {/* ── Barra de estado ── */}
            <div className="hero-statusbar">
              <span className="hero-chrome hero-eyebrow">Monterrey, MX</span>

              <div className="hero-chrome flex flex-wrap items-center gap-x-5 gap-y-2">
                <span className="hero-eyebrow hidden md:inline">Working at</span>
                <a
                  href="https://www.hyperflowos.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-affil"
                >
                  <span className="hero-affil-mark">H</span>
                  Hyper Digital
                </a>
                <span className="hero-affil">
                  <span className="hero-affil-mark">N</span>
                  NVIDIA Inception
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Indicador de scroll ── */}
      <div
        className="hero-scroll absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 z-10"
        style={{ bottom: 'calc(1.6rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <span className="hero-eyebrow" style={{ fontSize: '0.5625rem', letterSpacing: '0.22em' }}>Scroll</span>
        <div
          className="w-px h-8 animate-scroll-bounce"
          style={{ background: 'linear-gradient(to bottom, var(--text-muted), transparent)' }}
        />
      </div>
    </section>
  )
}
