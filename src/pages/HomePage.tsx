import Hero       from '@/components/sections/Hero'
import About      from '@/components/sections/About'
import Stack      from '@/components/sections/Stack'
import Experience from '@/components/sections/Experience'
import Projects   from '@/components/sections/Projects'
// import Research   from '@/components/sections/Research'   // ver nota abajo
import Contact    from '@/components/sections/Contact'

export default function HomePage({ heroReady }: { heroReady: boolean }) {
  return (
    <main>
      <Hero canAnimate={heroReady} />
      <About />
      <Stack />
      <Experience />
      <Projects />
      {/* Research: oculta mientras los papers sigan siendo mock (src/data/papers.ts).
          La seccion y su diseno quedan intactos en components/sections/Research.tsx;
          para devolverla basta descomentar esta linea y su import. */}
      {/* <Research /> */}
      <Contact />
    </main>
  )
}
