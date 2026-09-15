import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import Navbar       from '@/components/layout/Navbar'
import Footer       from '@/components/layout/Footer'
import CustomCursor from '@/components/ui/CustomCursor'
import MusicModal   from '@/components/ui/MusicModal'
import HomePage     from '@/pages/HomePage'
import PaperPage    from '@/pages/PaperPage'

function useSmoothScroll() {
  useEffect(() => {
    // Skip on mobile for performance
    if (window.innerWidth < 768) return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    })

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time: number) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove((time: number) => lenis.raf(time * 1000))
      lenis.destroy()
    }
  }, [])
}

/* React Router no toca el scroll al cambiar de ruta. Al volver de un paper la
   landing se montaba con el desplazamiento que traia la lectura y aterrizabas
   en mitad de una seccion cualquiera — que es ademas lo que destapaba el
   ReferenceError de NeuralReveal y dejaba la pagina negra. Aqui cada ruta
   recuerda donde se quedo: se vuelve al sitio que se dejo, y una ruta que se
   abre por primera vez empieza arriba. */
function ScrollMemory() {
  const { pathname } = useLocation()
  const positions    = useRef(new Map<string, number>())
  const current      = useRef(pathname)
  const firstRender  = useRef(true)

  /* La posicion se anota mientras se navega y no al desmontar: para cuando
     React cambia de ruta el documento ya mide otra cosa y el navegador pudo
     haber recortado el scroll, asi que leerlo en ese momento da un valor que
     no corresponde a la pagina que se esta abandonando. */
  useEffect(() => {
    const onScroll = () => positions.current.set(current.current, window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* En layout effect, despues de que las secciones montaron y crearon sus
     ScrollTrigger pero antes de que el navegador pinte: asi no se ve el salto. */
  useLayoutEffect(() => {
    current.current = pathname
    // La carga inicial se deja como la entrego el navegador.
    if (firstRender.current) { firstRender.current = false; return }
    window.scrollTo(0, positions.current.get(pathname) ?? 0)
    ScrollTrigger.refresh()
  }, [pathname])

  return null
}

function MainLayout({ heroReady }: { heroReady: boolean }) {
  return (
    <>
      <Navbar />
      <HomePage heroReady={heroReady} />
      <Footer />
    </>
  )
}

export default function App() {
  const [heroReady, setHeroReady] = useState(false)
  useSmoothScroll()

  /* El hero arranca en autoAlpha: 0 y solo se revela cuando `heroReady` se
     pone en true, lo que hasta ahora dependia de que el usuario pulsara el
     modal de musica. Si ese clic no llega — porque el modal no se pinto, o
     porque algo fallo antes — la pagina se queda negra de forma permanente.
     Este plazo garantiza que el contenido aparezca de todas formas. Es red de
     seguridad, no la via normal: da tiempo de sobra para interactuar. */
  useEffect(() => {
    if (heroReady) return
    const t = window.setTimeout(() => setHeroReady(true), 6000)
    return () => window.clearTimeout(t)
  }, [heroReady])

  return (
    <BrowserRouter>
      <div className="grain-overlay" aria-hidden="true" />
      <ScrollMemory />
      <CustomCursor />
      {/* MusicModal lives outside Routes so audio persists on all pages */}
      <MusicModal onDone={() => setHeroReady(true)} />

      <Routes>
        <Route path="/"              element={<MainLayout heroReady={heroReady} />} />
        <Route path="/papers/:slug"  element={<PaperPage />} />
      </Routes>
    </BrowserRouter>
  )
}
