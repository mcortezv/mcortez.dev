import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap } from '@/lib/gsap'

export default function CustomCursor() {
  const dotRef   = useRef<HTMLDivElement>(null)
  const ringRef  = useRef<HTMLDivElement>(null)
  const lightRef = useRef<HTMLDivElement>(null)
  const [isTouch, setIsTouch] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  )

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)')
    const onChange = (e: MediaQueryListEvent) => setIsTouch(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const setupCursor = useCallback(() => {
    if (isTouch) return

    const dot   = dotRef.current
    const ring  = ringRef.current
    const light = lightRef.current
    if (!dot || !ring || !light) return

    // quickTo for silky smooth cursor — reuses a single tween per property
    const dotX  = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3.out' })
    const dotY  = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3.out' })
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' })
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' })
    // La luz va mas rezagada que el anillo: se comporta como una lampara
    // que arrastra, no como un puntero pegado al raton.
    const lightX = gsap.quickTo(light, 'x', { duration: 0.65, ease: 'power2.out' })
    const lightY = gsap.quickTo(light, 'y', { duration: 0.65, ease: 'power2.out' })

    // Track velocity for stretch effect
    let lastX = 0, lastY = 0
    let velocityX = 0, velocityY = 0

    const onMove = (e: MouseEvent) => {
      velocityX = e.clientX - lastX
      velocityY = e.clientY - lastY
      lastX = e.clientX
      lastY = e.clientY

      dotX(e.clientX)
      dotY(e.clientY)
      ringX(e.clientX)
      ringY(e.clientY)
      lightX(e.clientX)
      lightY(e.clientY)

      // Subtle stretch based on movement velocity
      const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY)
      const stretch = Math.min(speed * 0.015, 0.35)
      const angle = Math.atan2(velocityY, velocityX) * (180 / Math.PI)

      if (speed > 2) {
        gsap.to(ring, {
          scaleX: 1 + stretch,
          scaleY: 1 - stretch * 0.5,
          rotation: angle,
          duration: 0.15,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      } else {
        gsap.to(ring, {
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          duration: 0.4,
          ease: 'elastic.out(1, 0.5)',
          overwrite: 'auto',
        })
      }
    }

    const onHoverIn = () => {
      ring.classList.add('hovering')
      gsap.to(dot, { scale: 0.5, duration: 0.25, ease: 'back.out(2)' })
      gsap.to(ring, { scale: 1.5, duration: 0.35, ease: 'back.out(1.7)' })
    }

    const onHoverOut = () => {
      ring.classList.remove('hovering')
      gsap.to(dot, { scale: 1, duration: 0.25, ease: 'power2.out' })
      gsap.to(ring, { scale: 1, duration: 0.35, ease: 'power2.out' })
    }

    // Add hover detection to interactive elements
    const targets = document.querySelectorAll('a, button, [role="button"]')
    targets.forEach((el) => {
      el.addEventListener('mouseenter', onHoverIn)
      el.addEventListener('mouseleave', onHoverOut)
    })

    window.addEventListener('mousemove', onMove)

    // MutationObserver for dynamically added elements
    const observer = new MutationObserver(() => {
      const newTargets = document.querySelectorAll('a:not([data-cursor]), button:not([data-cursor])')
      newTargets.forEach((el) => {
        el.setAttribute('data-cursor', 'true')
        el.addEventListener('mouseenter', onHoverIn)
        el.addEventListener('mouseleave', onHoverOut)
      })
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', onMove)
      targets.forEach((el) => {
        el.removeEventListener('mouseenter', onHoverIn)
        el.removeEventListener('mouseleave', onHoverOut)
      })
      observer.disconnect()
    }
  }, [isTouch])

  useEffect(() => {
    return setupCursor()
  }, [setupCursor])

  if (isTouch) return null

  return (
    <>
      <div ref={lightRef} className="cursor-light" aria-hidden="true" />
      <div ref={dotRef}   className="cursor-dot"   aria-hidden="true" />
      <div ref={ringRef}  className="cursor-ring"  aria-hidden="true" />
    </>
  )
}
