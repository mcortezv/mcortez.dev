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
      {/* Gradient accent line */}
      <div
        ref={borderRef}
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, var(--accent-dim) 20%, var(--accent) 50%, var(--accent-dim) 80%, transparent 100%)',
          opacity: 0.15,
        }}
      />

      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-[var(--accent)] flex items-center justify-center">
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

        <span className="text-xs text-[var(--text-disabled)] font-mono">
          Built with React + GSAP
        </span>
      </div>
    </footer>
  )
}
