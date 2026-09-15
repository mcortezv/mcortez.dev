import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, scrollTo } from '@/lib/gsap'
import { personal } from '@/data/personal'
import HeroCanvas from './HeroCanvas'

/** Momento en que el canvas dispara la explosión de partículas (ver HeroCanvas) */
const HANDOFF = 2.35

/* Apertura del marco. El estado final lleva margenes negativos a proposito:
   `inset(0%)` recorta justo al borde y se comeria la sombra proyectada, que
   vive fuera de la caja. Asi la sombra se descubre con el marco en vez de
   aparecer de golpe al terminar. */
const CLIP_CERRADO = 'inset(50% -25% 50% -25%)'
const CLIP_ABIERTO = 'inset(-14% -25% -14% -25%)'

export default function Hero({ canAnimate = false }: { canAnimate?: boolean }) {
  const containerRef = useRef<HTMLElement>(null)

  // ── Estado inicial oculto ─────────────────────────────────
  useGSAP(() => {
    /* El marco no entra: se abre. Arranca recortado a su propia linea
       central — alto cero, asi que no se ve — y de ahi se despliega hacia
       arriba y hacia abajo. El deslizamiento de 18px anterior era un gesto
       generico de "aparece contenido", ajeno al lenguaje del lienzo. */
    gsap.set('.hero-window',   { autoAlpha: 1, clipPath: CLIP_CERRADO })
    // La placa entra con la ventana: antes de eso las partículas forman el
    // nombre sobre el fondo limpio, sin nada que las apague.
    gsap.set('.hero-plate',    { autoAlpha: 0 })
    gsap.set('.hero-chrome',   { autoAlpha: 0 })
    /* El titulo se parte en letras al animar; hasta entonces se oculta en
       bloque para que no asome ni un frame con las letras sin colocar. */
    gsap.set('.hero-title-ln', { autoAlpha: 0 })
    gsap.set('.hero-divider',  { scaleX: 0 })
    gsap.set('.hero-stagger',  { autoAlpha: 0, y: 12 })
    gsap.set('.hero-scroll',   { autoAlpha: 0 })
  }, { scope: containerRef })

  // ── Entrada ───────────────────────────────────────────────
  useGSAP(() => {
    if (!canAnimate || !containerRef.current) return

    const isMobile = window.innerWidth < 768

    /* El nombre real ya no sube detras de una linea horizontal: esa figura
       abria un gesto nuevo justo despues del estallido y cortaba la
       continuidad. Ahora cada nombre entra entero desde pequeno y
       desenfocado, y se asienta con un rebote corto.
       El desenfoque necesita estado final explicito: de 'blur(14px)' a `none`
       no hay nada que interpolar y el borroso se quedaria puesto. */
    const lines = gsap.utils.toArray<HTMLElement>('.hero-title-ln', containerRef.current)
    gsap.set(lines, { autoAlpha: 1, filter: 'blur(0px)', transformOrigin: '50% 50%' })

    /* Arrancaba en HANDOFF - 0.2, es decir el marco empezaba a materializarse
       0.2s ANTES de que las particulas estallaran: el estallido ocurria encima
       de una ventana a medio aparecer y las dos cosas se estorbaban. Ahora la
       explosion sucede sobre el campo limpio y el marco se abre a partir de
       ella, en la misma direccion: del centro hacia afuera.
       En retrato no hay formación del nombre que esperar: el contenido entra ya. */
    gsap.timeline({ delay: isMobile ? 0.25 : HANDOFF, defaults: { ease: 'smooth-out' } })
      /* fromTo y no to: el valor calculado del recorte lo colapsa el navegador
         de cuatro numeros a dos, y GSAP acababa emparejandolos mal contra el
         destino — el borde de abajo se abria casi entero mientras el de arriba
         no se habia movido. Dando los dos extremos explicitos, con la misma
         forma, la apertura es simetrica. */
      .fromTo('.hero-window', { clipPath: CLIP_CERRADO }, { clipPath: CLIP_ABIERTO, duration: 0.75 })
      .to('.hero-plate',    { autoAlpha: 1, duration: 1.1, ease: 'none' }, 0)
      // El cromo vive en los bordes, que son lo ultimo que descubre la apertura.
      .to('.hero-chrome',   { autoAlpha: 1, duration: 0.5, stagger: 0.06 }, 0.5)
      /* Un pelo despues del impulso del lienzo (EXPLOSION_TIME en HeroCanvas,
         el cero de esta linea de tiempo). Con 0.4 se leia como dos gestos
         seguidos — estalla, y luego aparece el nombre. Clavado en 0 el nombre
         empezaba a crecer antes de que el ojo llegara a registrar el estallido.
         0.12 es el hueco justo para que la explosion se lea y el nombre monte
         su expansion, no lo que venga despues. `back.out` le da ademas la misma
         fisica que a las particulas: arranque seco y frenada larga.
         El desfase entre las dos palabras es 0.07: las dos montan el mismo
         estallido, no uno cada una. */
      .from(lines, {
        autoAlpha: 0,
        scale: 0.55,
        // Menos desenfoque en retrato: mismo efecto sobre un cuerpo la mitad de grande.
        filter: `blur(${isMobile ? 8 : 14}px)`,
        duration: 0.85,
        ease: 'back.out(1.7)',
        stagger: 0.07,
      }, 0.12)
      .to('.hero-divider',  { scaleX: 1, duration: 0.8 }, 0.68)
      .to('.hero-stagger',  { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.07 }, 0.72)
      .to('.hero-scroll',   { autoAlpha: 1, duration: 0.5 }, 1.05)

    /* El trigger es el nodo, no la cadena '#hero'. El `scope` de useGSAP
       resuelve todo selector dentro de containerRef, y containerRef ES
       #hero: buscarlo ahi es buscarlo dentro de si mismo, asi que no
       encontraba nada y estas dos animaciones nunca llegaron a existir
       (la consola lo avisaba con "Element not found: #hero"). */
    const hero = containerRef.current

    /* Scale-down anclado al scroll (solo desktop).
       Sin `pin`: fijando el hero, el primer tramo de scroll se gastaba entero
       en el zoom y la pagina no avanzaba hasta soltarlo — dos gestos para una
       sola intencion. Asi el hero se encoge mientras sube, ambas cosas desde
       el primer scroll, que es lo que se siente inmediato. */
    if (!isMobile) {
      gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: '+=50%',
          scrub: 0.5,
        },
      }).to('.hero-inner', { scale: 0.94, borderRadius: '20px', duration: 1 })
    }

    // ── Indicador de scroll ──
    gsap.to('.hero-scroll', {
      autoAlpha: 0,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: '60px top', end: '260px top', scrub: true },
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
          // px-6 y no px-4: sin la caja, el texto se lee contra el borde de la pagina
          // y tiene que caer en la misma vertical que el logo del navbar.
          className="hero-frame relative z-10 w-full max-w-[1320px] mx-auto px-6 sm:px-8 lg:px-12 flex flex-col"
          // Las paddings verticales viven en CSS (.hero-frame): en un telefono
          // corto tienen que encoger con el viewport, y un style inline no se
          // puede sobrescribir desde una media query.
          style={{ minHeight: '100svh' }}
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
                  001 &nbsp;/&nbsp; {personal.role}
                </p>

                <h1 className="hero-title mb-7 sm:mb-8">
                  <span className="hero-line"><span className="hero-title-ln">Manuel</span></span>
                  <span className="hero-line"><span className="hero-title-ln">Cortez</span></span>
                </h1>

                <div className="hero-divider mb-7 sm:mb-8" />

                <p
                  className="hero-stagger text-[var(--text-secondary)] max-w-[46ch] mb-8 sm:mb-10"
                  /* El `min(..., 2.05svh)` solo muerde en pantallas cortas: en un
                     telefono normal o en escritorio gana el clamp de siempre y el
                     tamaño no cambia. Va inline y no en CSS porque este style
                     inline no se puede sobrescribir desde una media query. */
                  style={{
                    fontSize: 'max(0.8125rem, min(clamp(0.9375rem, 1.15vw, 1.0625rem), 2.05svh))',
                    lineHeight: 1.72,
                    textWrap: 'pretty',
                  }}
                >
                  Building at the intersection of AI and exceptional software.{' '}
                  <span className="text-[var(--text)]">Agents, RAG pipelines, automated workflows</span>{' '}
                  and interfaces that move the needle in B2B products.
                </p>

                <div className="hero-stagger flex flex-wrap gap-2.5">
                  {/* Oculto con la seccion Research: sin #research en el documento
                      este boton no llevaba a ninguna parte. Vuelve con ella. */}
                  {/* <button onClick={() => scrollTo('research')} className="btn-hero btn-hero--solid">
                    Read research <span className="btn-hero-arrow">→</span>
                  </button> */}
                  <button onClick={() => scrollTo('contact')} className="btn-hero">
                    Get in touch
                  </button>
                </div>
              </div>
            </div>

            {/* ── Barra de estado ── */}
            <div className="hero-statusbar">
              <span className="hero-chrome hero-eyebrow">Sonora, MX</span>

              <div className="hero-chrome flex flex-wrap items-center gap-x-5 gap-y-2">
                <span className="hero-eyebrow hidden md:inline">Working at</span>
                <a
                  href="https://www.hyperflowos.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-affil"
                >
                  <span className="hero-affil-mark">H</span>
                  HyperLabs
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
        /* Centrado en todos los tamanos. Llevarlo al eje izquierdo de la
           columna lo dejaba leyendose como un error: es una indicacion de
           interfaz, no una pieza del bloque de texto, y su sitio es el centro
           del borde inferior. */
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
