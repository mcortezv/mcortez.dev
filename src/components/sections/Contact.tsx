import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, SplitText, addMagneticEffect } from '@/lib/gsap'
import { personal } from '@/data/personal'
import NeuralReveal from '@/components/ui/NeuralReveal'

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
  </svg>
)
const EmailIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
)
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

export default function Contact() {
  const containerRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  useGSAP((_, contextSafe) => {
    // ── Title with SplitText chars reveal — dramatic cinematic entrance ──
    let split: SplitText | null = null
    if (titleRef.current) {
      split = SplitText.create(titleRef.current, { type: 'words,chars', mask: 'words' })
    }

    const headerTl = gsap.timeline({
      scrollTrigger: { trigger: containerRef.current, start: 'top 78%' },
    })
    headerTl.from('.contact-label', { y: 25, autoAlpha: 0, duration: 0.6, ease: 'smooth-out' })
    if (split) {
      headerTl.from(split.chars, {
        y: '200%',
        scale: 1.5,
        rotationX: -30,
        stagger: 0.02,
        duration: 1.2,
        ease: 'smooth-out',
      }, '-=0.3')
    }
    headerTl.from('.contact-together', {
      y: 40, autoAlpha: 0, duration: 0.8, ease: 'smooth-out',
    }, '-=0.6')
    headerTl.from('.contact-sub', {
      y: 30, autoAlpha: 0, duration: 0.8, ease: 'smooth-out',
    }, '-=0.5')

    // ── Contact cards staggered dramatic entrance ──
    gsap.from('.cc-card', {
      scrollTrigger: { trigger: '.cc-grid', start: 'top 85%' },
      y: 80, scale: 0.85, opacity: 0,
      stagger: 0.15,
      duration: 1,
      ease: 'back.out(1.2)',
    })

    // ── CTA button entrance ──
    gsap.from('.contact-cta', {
      scrollTrigger: { trigger: '.contact-cta', start: 'top 90%' },
      y: 30, autoAlpha: 0, scale: 0.9,
      duration: 0.8, ease: 'smooth-out',
    })

    // ── Magnetic effect on contact cards ──
    const cleanups: (() => void)[] = []
    if (window.innerWidth > 768) {
      document.querySelectorAll<HTMLElement>('.cc-card').forEach(card => {
        cleanups.push(addMagneticEffect(card, 0.12))
      })
      // Magnetic CTA button
      const ctaBtn = document.querySelector<HTMLElement>('.contact-cta')
      if (ctaBtn) cleanups.push(addMagneticEffect(ctaBtn, 0.2))
    }

    // ── ScrambleText on card values on hover ──
    const scrambleHandler = contextSafe!((e: Event) => {
      const card = (e.currentTarget as HTMLElement)
      const valueEl = card.querySelector<HTMLElement>('.cc-value')
      if (!valueEl) return
      const originalText = valueEl.getAttribute('data-text') || valueEl.textContent || ''
      valueEl.setAttribute('data-text', originalText)
      gsap.to(valueEl, {
        duration: 0.6,
        scrambleText: {
          text: originalText,
          chars: '0123456789!@#$%^&*()_+',
          revealDelay: 0.3,
          speed: 0.4,
        },
      })
    })

    document.querySelectorAll<HTMLElement>('.cc-card').forEach(card => {
      card.addEventListener('mouseenter', scrambleHandler)
      cleanups.push(() => card.removeEventListener('mouseenter', scrambleHandler))
    })

    return () => {
      split?.revert()
      cleanups.forEach(fn => fn())
    }
  }, { scope: containerRef })

  return (
    <section id="contact" ref={containerRef} className="section bg-[var(--bg-surface)] relative overflow-hidden">
      <NeuralReveal color={[234, 232, 228]} count={55} />

      <div className="max-w-[1280px] mx-auto relative z-10">
        <div className="contact-label section-label">Contact</div>

        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="contact-title text-h1 mb-5">
            <span ref={titleRef}>Let's build something </span>
            <span className="text-gradient-accent contact-together">together</span>
          </h2>
          <p className="contact-sub text-body-lg text-[var(--text-secondary)]">
            Have a project in mind? Let's talk about AI, automation, or anything interesting.
          </p>
        </div>

        {/* ── Contact cards ── */}
        <div className="cc-grid">
          {/* GitHub */}
          <a href={personal.links.github} target="_blank" rel="noopener noreferrer" className="card-light cc-card magnetic">
            <div className="cc-icon"><GitHubIcon /></div>
            <div className="cc-info">
              <span className="cc-label">GitHub</span>
              <span className="cc-value">mcortezv</span>
            </div>
            <span className="cc-arrow">→</span>
          </a>

          {/* Email */}
          <a href={`mailto:${personal.email.personal}`} className="card-light cc-card cc-card--email magnetic">
            <div className="cc-icon"><EmailIcon /></div>
            <div className="cc-info">
              <span className="cc-label">Email</span>
              <span className="cc-value">{personal.email.personal}</span>
              <span className="cc-secondary">{personal.email.work}</span>
            </div>
            <span className="cc-arrow">→</span>
          </a>

          {/* LinkedIn */}
          <a href={personal.links.linkedin} target="_blank" rel="noopener noreferrer" className="card-light cc-card magnetic">
            <div className="cc-icon cc-icon--blue"><LinkedInIcon /></div>
            <div className="cc-info">
              <span className="cc-label">LinkedIn</span>
              <span className="cc-value cc-value--blue">mcortezv</span>
            </div>
            <span className="cc-arrow">→</span>
          </a>
        </div>

        {/* CTA */}
        <div className="flex justify-center mb-10 mt-10">
          <a
            href={`mailto:${personal.email.personal}`}
            className="contact-cta btn-hero btn-hero--solid text-sm px-7 py-3.5 magnetic"
          >
            Send me an email
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>

        <div className="flex items-center justify-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse-dot" />
          <span className="text-small text-[var(--text-secondary)]">
            Currently available for part-time consulting & AI projects.
          </span>
        </div>
      </div>

      {/* ── CSS ── */}
      <style>{`
        .cc-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          max-width: 900px;
          margin: 0 auto;
        }

        .cc-card {
          position: relative;
          display: flex;
          align-items: center;
          gap: 1rem;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          backdrop-filter: blur(20px);
          padding: 1.5rem;
          text-decoration: none;
          color: inherit;
          overflow: hidden;
          cursor: pointer;
          will-change: transform;
        }

        /* El box-shadow se declara completo aqui a proposito: este <style> se
           inyecta despues de index.css y pisaria el aro interior del sistema
           de tarjetas si solo declarara la sombra proyectada. */
        .cc-card:hover {
          background: var(--bg-card-hover);
          border-color: var(--border-strong);
          box-shadow:
            inset 0 0 0 999px rgba(255, 255, 255, 0.038),
            0 20px 60px rgba(0,0,0,0.5);
        }

        /* Grid pattern on hover */
        .cc-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 20px 20px;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.25s ease;
        }
        .cc-card:hover::before { opacity: 1; }

        /* Corner glow on hover */
        .cc-card::after {
          content: '';
          position: absolute;
          top: -1px;
          left: -1px;
          width: 140px;
          height: 140px;
          background: none;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.25s ease;
          border-radius: var(--radius-lg) 0 0 0;
        }
        .cc-card:hover::after { opacity: 1; }

        /* Icon container */
        .cc-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          min-width: 48px;
          border-radius: var(--radius-md);
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-medium);
          color: var(--text-secondary);
          position: relative;
          z-index: 1;
          transition: background var(--dur-base) var(--ease-standard),
                      border-color var(--dur-base) var(--ease-standard),
                      color var(--dur-base) var(--ease-standard);
        }
        .cc-card:hover .cc-icon {
          background: rgba(255,255,255,0.055);
          border-color: var(--border-strong);
          color: var(--text);
        }

        /* Info */
        .cc-info {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
          flex: 1;
          min-width: 0;
          position: relative;
          z-index: 1;
        }
        .cc-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .cc-value {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .cc-value--blue { color: var(--text); }
        .cc-secondary {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          color: var(--text-muted);
          letter-spacing: 0.02em;
        }

        /* Arrow */
        .cc-arrow {
          font-size: 1.125rem;
          color: var(--text-muted);
          position: relative;
          z-index: 1;
          flex-shrink: 0;
          transition: background var(--dur-base) var(--ease-standard),
                      border-color var(--dur-base) var(--ease-standard),
                      color var(--dur-base) var(--ease-standard);
        }
        .cc-card:hover .cc-arrow {
          color: var(--accent);
          filter: saturate(1.5) brightness(1.14);
          transform: translateX(4px);
        }

        @media (max-width: 768px) {
          .cc-grid {
            grid-template-columns: 1fr;
            max-width: 420px;
          }
          .cc-card { padding: 1.25rem; }
        }
      `}</style>
    </section>
  )
}
