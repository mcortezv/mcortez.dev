import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { personal } from '@/data/personal'

export default function Footer() {
  const borderRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!borderRef.current) return
    gsap.fromTo(borderRef.current,
      { opacity: 0.15 },
      {
        opacity: 0.7,
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: borderRef.current,
          start: 'top 95%',
        },
      }
    )
  })

  return (
    <footer className="relative bg-[var(--bg-base)]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {/* Hairline superior */}
      <div
        ref={borderRef}
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'var(--border)',
          opacity: 0.15,
        }}
      />

      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-[var(--text)] flex items-center justify-center">
            <span className="text-[#0a0a0a] font-black text-[10px]">MC</span>
          </div>
          <span className="text-xs text-[var(--text-muted)] font-mono">
            Manuel Cortez © {new Date().getFullYear()}
          </span>
        </div>

        <div className="flex items-center gap-5">
          <a
            href={personal.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors font-mono"
          >
            GitHub
          </a>
          <a
            href={personal.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors font-mono"
          >
            LinkedIn
          </a>
          <a
            href={`mailto:${personal.email.personal}`}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors font-mono"
          >
            Email
          </a>
        </div>

        {/* Antes decia "Built with React + GSAP", que es la cadencia exacta de
            un badge de patrocinio: acredita al proveedor y no al autor. Un
            enlace al codigo de este mismo sitio no puede leerse como badge, y
            ademas dice algo: aqui esta, revisalo. Va mas apagado que los
            enlaces de contacto porque es el cierre, no una via de contacto. */}
        <a
          href={personal.links.repo}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1.5 text-xs text-[var(--text-disabled)] hover:text-[var(--accent)] transition-colors font-mono"
        >
          Source on GitHub
          <svg
            width="9"
            height="9"
            viewBox="0 0 11 11"
            fill="none"
            className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          >
            <path d="M1 10L10 1M10 1H5M10 1V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
    </footer>
  )
}
