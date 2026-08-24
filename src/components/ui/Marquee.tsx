import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '@/lib/gsap'

const ITEMS = [
  'HEAD OF AI',
  'AGENT ARCHITECT',
  'RAG SYSTEMS',
  'B2B PRODUCT AI',
  'WORKFLOW AUTOMATION',
  'LLM ENGINEERING',
  'FULL-STACK',
]

export default function Marquee() {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!trackRef.current) return

    const tween = gsap.to(trackRef.current, {
      xPercent: -50,
      ease: 'none',
      repeat: -1,
      duration: 30,
    })

    ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const velocity = Math.abs(self.getVelocity())
        const scale = gsap.utils.clamp(0.5, 3, 1 + velocity / 2000)
        gsap.to(tween, { timeScale: scale, duration: 0.3, overwrite: true })
      },
    })
  }, { scope: containerRef })

  return (
    <div
      ref={containerRef}
      className="overflow-hidden py-8 border-y border-[var(--border)] bg-[var(--bg-base)]"
    >
      <div ref={trackRef} className="flex items-center whitespace-nowrap will-change-transform">
        {Array.from({ length: 4 }).map((_, rep) =>
          ITEMS.map((item, i) => (
            <div key={`${rep}-${i}`} className="flex items-center gap-6 mx-6 flex-shrink-0">
              <span
                className="font-display font-bold tracking-tight uppercase text-[var(--text-disabled)]"
                style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}
              >
                {item}
              </span>
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] flex-shrink-0" />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
