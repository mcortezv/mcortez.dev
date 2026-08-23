import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import SplitText from 'gsap/SplitText'
import ScrollToPlugin from 'gsap/ScrollToPlugin'
import ScrambleTextPlugin from 'gsap/ScrambleTextPlugin'
import CustomEase from 'gsap/CustomEase'

gsap.registerPlugin(ScrollTrigger, SplitText, ScrollToPlugin, ScrambleTextPlugin, CustomEase)

// ── Cinematic ease curves ──
CustomEase.create('smooth-out', '0.16, 1, 0.3, 1')
CustomEase.create('reveal', '0.77, 0, 0.175, 1')
CustomEase.create('smooth-in-out', '0.76, 0, 0.24, 1')
// Escala transitions.dev — curvas cortas y precisas
CustomEase.create('standard', '0.30, 0, 0.20, 1')
CustomEase.create('entrance', '0.00, 0, 0.20, 1')
CustomEase.create('exit',     '0.40, 0, 1.00, 1')

export { gsap, ScrollTrigger, SplitText }

/** Animate an element in from below on scroll */
export function animateIn(
  el: Element | Element[] | NodeListOf<Element>,
  options: {
    delay?: number
    stagger?: number
    y?: number
    duration?: number
    start?: string
  } = {}
) {
  const { delay = 0, stagger = 0.08, y = 40, duration = 0.75, start = 'top 82%' } = options

  gsap.from(el, {
    scrollTrigger: {
      trigger: Array.isArray(el) ? (el[0] as Element) : (el as Element),
      start,
    },
    y,
    opacity: 0,
    duration,
    delay,
    stagger,
    ease: 'power3.out',
  })
}

/** Smooth scroll to an element by id */
export function scrollTo(id: string) {
  gsap.to(window, {
    duration: 1,
    scrollTo: { y: `#${id}`, offsetY: 80 },
    ease: 'power3.inOut',
  })
}

/** Magnetic hover effect */
export function addMagneticEffect(el: HTMLElement, strength = 0.3) {
  const handleMove = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    gsap.to(el, { x: x * strength, y: y * strength, duration: 0.35, ease: 'power2.out' })
  }

  const handleLeave = () => {
    gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'smooth-out' })
  }

  el.addEventListener('mousemove', handleMove)
  el.addEventListener('mouseleave', handleLeave)

  return () => {
    el.removeEventListener('mousemove', handleMove)
    el.removeEventListener('mouseleave', handleLeave)
  }
}

/** 3D perspective tilt on hover — cinematic depth effect */
export function addTilt3D(el: HTMLElement, strength = 12) {
  const handleMove = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    gsap.to(el, {
      rotationY: x * strength,
      rotationX: -y * strength,
      transformPerspective: 800,
      duration: 0.4,
      ease: 'power2.out',
    })
  }

  const handleLeave = () => {
    gsap.to(el, {
      rotationY: 0,
      rotationX: 0,
      duration: 0.55,
      ease: 'smooth-out',
    })
  }

  el.addEventListener('mousemove', handleMove)
  el.addEventListener('mouseleave', handleLeave)

  return () => {
    el.removeEventListener('mousemove', handleMove)
    el.removeEventListener('mouseleave', handleLeave)
  }
}
