import { useState, useEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger, scrollTo, addMagneticEffect } from '@/lib/gsap'
import { useLocation, useNavigate } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'About',    id: 'about',    icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' },
  { label: 'Stack',    id: 'stack',    icon: 'M4 6h16M4 12h16M4 18h16' },
  { label: 'Projects', id: 'projects', icon: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z' },
  // Oculto con la seccion Research (ver src/pages/HomePage.tsx). Alimenta a la vez el menu de escritorio y el desplegable movil.
  // { label: 'Research', id: 'research', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { label: 'Contact',  id: 'contact',  icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
]

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false)
  const [mobileOpen, setMobile]   = useState(false)
  const navRef                    = useRef<HTMLElement>(null)
  const dropdownRef               = useRef<HTMLDivElement>(null)
  const logoRef                   = useRef<HTMLButtonElement>(null)
  const location                  = useLocation()
  const navigate                  = useNavigate()
  const isPaperPage               = location.pathname.startsWith('/papers/')

  // ── ScrollTrigger-driven navbar background ──
  useGSAP(() => {
    ScrollTrigger.create({
      trigger: document.body,
      start: '60px top',
      onEnter: () => setScrolled(true),
      onLeaveBack: () => setScrolled(false),
    })

    // ── Magnetic effect on logo ──
    const cleanups: (() => void)[] = []
    if (logoRef.current && window.innerWidth > 768) {
      cleanups.push(addMagneticEffect(logoRef.current, 0.15))
    }

    // ── Logo entrance — dramatic scale + blur ──
    if (logoRef.current) {
      gsap.from(logoRef.current, {
        scale: 0.9, autoAlpha: 0,
        duration: 0.7, ease: 'smooth-out', delay: 0.25,
      })
    }

    // ── Nav links entrance — staggered with blur ──
    gsap.from('.nav-link-item', {
      y: -20, autoAlpha: 0,
      stagger: 0.06,
      duration: 0.6,
      ease: 'smooth-out',
      delay: 0.6,
    })

    return () => cleanups.forEach(fn => fn())
  })

  useEffect(() => {
    if (!mobileOpen) return
    const close = () => setMobile(false)
    window.addEventListener('scroll', close, { passive: true })
    return () => window.removeEventListener('scroll', close)
  }, [mobileOpen])

  useGSAP(() => {
    if (!dropdownRef.current || !mobileOpen) return
    gsap.fromTo(dropdownRef.current,
      { opacity: 0, y: -10, scaleY: 0.95 },
      { opacity: 1, y: 0, scaleY: 1, duration: 0.25, ease: 'power2.out', transformOrigin: 'top' }
    )
  }, { dependencies: [mobileOpen] })

  const handleNav = (id: string) => {
    setMobile(false)
    if (isPaperPage) {
      navigate('/')
      setTimeout(() => scrollTo(id), 100)
    } else {
      scrollTo(id)
    }
  }

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 border-b"
        style={{
          background: scrolled || mobileOpen ? 'rgba(10,10,10,0.88)' : 'transparent',
          backdropFilter: scrolled || mobileOpen ? 'blur(24px)' : 'none',
          WebkitBackdropFilter: scrolled || mobileOpen ? 'blur(24px)' : 'none',
          borderColor: scrolled || mobileOpen ? 'var(--border)' : 'transparent',
          transition: 'background var(--dur-base) var(--ease-standard), border-color var(--dur-base) var(--ease-standard), backdrop-filter var(--dur-base) var(--ease-standard)',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
        }}
      >
        <div className="flex items-center justify-between px-6 md:px-10 h-16 max-w-[1280px] mx-auto">
          <button ref={logoRef} onClick={() => handleNav('hero')} className="flex items-center gap-2.5 group magnetic">
            <div className="w-7 h-7 rounded-md bg-[var(--text)] flex items-center justify-center">
              <span className="text-[#0a0a0a] font-bold text-[0.65rem] tracking-tight">MC</span>
            </div>
            <span className="font-display font-semibold text-sm text-[var(--text)] hidden sm:block">
              mcortezv
            </span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className="nav-link nav-link-item px-3 py-1.5 rounded-md hover:bg-[var(--bg-card)] transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/mcortezv"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link-item btn-nav"
            >
              GitHub ↗
            </a>

            <button
              className="md:hidden flex flex-col gap-1.5 p-2 relative z-[60]"
              onClick={() => setMobile(!mobileOpen)}
              aria-label="Menu"
            >
              <span className={`block w-5 h-[1.5px] transition-all duration-200 ${mobileOpen ? 'rotate-45 translate-y-2 bg-[var(--accent)]' : 'bg-[var(--text)]'}`} />
              <span className={`block w-5 h-[1.5px] bg-[var(--text)] transition-all duration-200 ${mobileOpen ? 'opacity-0 scale-x-0' : ''}`} />
              <span className={`block w-5 h-[1.5px] transition-all duration-200 ${mobileOpen ? '-rotate-45 -translate-y-2 bg-[var(--accent)]' : 'bg-[var(--text)]'}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Dropdown ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobile(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30" />

          {/* Dropdown panel */}
          <div
            ref={dropdownRef}
            className="absolute left-3 right-3 rounded-2xl overflow-hidden shadow-2xl"
            style={{
              top: 'calc(4rem + env(safe-area-inset-top, 0px))',
              background: 'rgba(14,14,14,0.98)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '1px solid var(--border)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-8 h-0.5 rounded-full" style={{ background: 'var(--border-strong)' }} />
            </div>

            {/* Nav items */}
            <div className="flex flex-col px-2 pb-3 pt-1">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNav(link.id)}
                  className="text-left text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors py-2.5 px-3 rounded-lg active:scale-[0.98]"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
