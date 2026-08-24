/**
 * NeuralReveal — Canvas particle + neural-network convergence effect.
 *
 * Place inside a section with `position: relative; overflow: hidden`.
 * When the section enters the viewport, particles converge toward the
 * center with animated connection lines (neural network look), then
 * scatter and fade as content materialises.
 */

import { useEffect, useRef } from 'react'
import { ScrollTrigger } from '@/lib/gsap'

interface Props {
  /** RGB tuple, default accent teal */
  color?: [number, number, number]
  /** Number of particles, default 55 */
  count?: number
  /** Extra CSS class on the canvas */
  className?: string
}

interface Dot {
  x: number; y: number
  ox: number; oy: number   // origin (scatter position)
  vx: number; vy: number
  size: number
  alpha: number
  speed: number
}

export default function NeuralReveal({
  color = [34, 211, 165],
  count = 55,
  className = '',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  /* Los canales se extraen aqui para que el efecto dependa de sus valores y no
     de la identidad del array: `color={[234, 232, 228]}` en el JSX construye un
     array nuevo en cada render, y con `[color]` como dependencia el efecto se
     reiniciaba en cada re-render de la seccion. */
  const [cr, cg, cb] = color

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return
    const ctx = canvas.getContext('2d')!

    let W = 0, H = 0
    let dots: Dot[] = []
    let phase = 0      // 0=idle, 1=converging, 2=hold, 3=scattering, 4=done
    let phaseT = 0
    let animId = 0
    let isVisible = false


    function init() {
      if (!canvas) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = canvas.offsetWidth
      H = canvas.offsetHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)

      dots = Array.from({ length: count }, () => {
        const edge = Math.random()
        let ox: number, oy: number
        if (edge < 0.25) { ox = -20; oy = Math.random() * H }
        else if (edge < 0.5) { ox = W + 20; oy = Math.random() * H }
        else if (edge < 0.75) { ox = Math.random() * W; oy = -20 }
        else { ox = Math.random() * W; oy = H + 20 }

        return {
          x: ox, y: oy,
          ox, oy,
          vx: 0, vy: 0,
          size: 1 + Math.random() * 2,
          alpha: 0.3 + Math.random() * 0.5,
          speed: 0.5 + Math.random() * 1.5,
        }
      })
    }

    init()
    const ro = new ResizeObserver(init)
    ro.observe(canvas)

    function resetAnimation() {
      phase = 1
      phaseT = 0
      if (canvas) canvas.style.display = ''
      // Re-scatter dots to edges
      for (const d of dots) {
        const edge = Math.random()
        if (edge < 0.25) { d.x = -20; d.y = Math.random() * H }
        else if (edge < 0.5) { d.x = W + 20; d.y = Math.random() * H }
        else if (edge < 0.75) { d.x = Math.random() * W; d.y = -20 }
        else { d.x = Math.random() * W; d.y = H + 20 }
        d.vx = 0; d.vy = 0
      }
      startLoop()
    }

    /* ── ScrollTriggers ── */
    const visibilityTrigger = ScrollTrigger.create({
      trigger: parent,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => { isVisible = true; resetAnimation() },
      onLeave: () => { isVisible = false },
      onEnterBack: () => { isVisible = true; resetAnimation() },
      onLeaveBack: () => { isVisible = false },
    })

    function startLoop() {
      if (animId) return
      lastFrame = performance.now()
      animId = requestAnimationFrame(loop)
    }

    let lastFrame = performance.now()

    function loop(now: number) {
      if (!isVisible && phase === 4) { animId = 0; return }

      const dt = Math.min((now - lastFrame) / 1000, 0.05)
      lastFrame = now

      // Phase timing
      phaseT += dt
      if (phase === 1 && phaseT > 1.4) { phase = 2; phaseT = 0 }
      if (phase === 2 && phaseT > 0.5) { phase = 3; phaseT = 0 }
      if (phase === 3 && phaseT > 1.8) { phase = 4; phaseT = 0 }

      ctx.clearRect(0, 0, W, H)

      // Global alpha for fade in/out
      let globalAlpha = 1
      if (phase === 0) globalAlpha = 0.4
      if (phase === 3) globalAlpha = Math.max(0, 1 - phaseT / 1.8)
      if (phase === 4) {
        // Done — clear canvas and hide it so it can't interfere
        ctx.clearRect(0, 0, W, H)
        canvas!.style.display = 'none'
        animId = 0
        return
      }

      const cx = W / 2
      const cy = H / 2

      /* ── Update dots ── */
      for (const d of dots) {
        if (phase === 0) {
          // Idle: gentle drift toward center
          d.vx += (cx + (Math.random() - 0.5) * W * 0.8 - d.x) * 0.002
          d.vy += (cy + (Math.random() - 0.5) * H * 0.8 - d.y) * 0.002
          d.vx *= 0.96
          d.vy *= 0.96
        } else if (phase === 1) {
          // Converge toward center area
          const tx = cx + (Math.random() - 0.5) * W * 0.3
          const ty = cy + (Math.random() - 0.5) * H * 0.3
          d.vx += (tx - d.x) * 0.03 * d.speed
          d.vy += (ty - d.y) * 0.03 * d.speed
          d.vx *= 0.92
          d.vy *= 0.92
        } else if (phase === 2) {
          // Hold with vibration
          d.vx += (Math.random() - 0.5) * 0.8
          d.vy += (Math.random() - 0.5) * 0.8
          d.vx *= 0.9
          d.vy *= 0.9
        } else if (phase === 3) {
          // Scatter outward
          const dx = d.x - cx
          const dy = d.y - cy
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          d.vx += (dx / dist) * 2.5 * d.speed
          d.vy += (dy / dist) * 2.5 * d.speed
          d.vx *= 0.97
          d.vy *= 0.97
        }

        d.x += d.vx
        d.y += d.vy
      }

      /* ── Draw neural connections ── */
      const connectionPhase = phase === 1 || phase === 2
      if (connectionPhase || (phase === 3 && phaseT < 0.6)) {
        const threshold = phase === 2 ? 120 : phase === 1 ? 90 + phaseT * 30 : 80
        const threshSq = threshold * threshold
        const lineAlpha = phase === 3 ? 0.08 * (1 - phaseT / 0.6) : phase === 1 ? 0.03 + phaseT * 0.06 : 0.1

        ctx.lineWidth = 0.6
        for (let i = 0; i < dots.length; i++) {
          const a = dots[i]
          for (let j = i + 1; j < dots.length; j++) {
            const b = dots[j]
            const dx = a.x - b.x
            const dy = a.y - b.y
            if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) continue
            const dSq = dx * dx + dy * dy
            if (dSq < threshSq) {
              const dist = Math.sqrt(dSq)
              const a2 = (1 - dist / threshold) * lineAlpha * globalAlpha
              ctx.beginPath()
              ctx.moveTo(a.x, a.y)
              ctx.lineTo(b.x, b.y)
              ctx.strokeStyle = `rgba(${cr},${cg},${cb},${a2})`
              ctx.stroke()
            }
          }
        }
      }

      /* ── Draw dots ── */
      for (const d of dots) {
        const a = d.alpha * globalAlpha
        if (a < 0.01) continue
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${a})`
        ctx.fill()
      }

      /* ── Center glow pulse during convergence ── */
      if (phase === 1 && phaseT > 0.8) {
        const pulseA = Math.min(0.15, (phaseT - 0.8) * 0.25) * globalAlpha
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.25)
        grad.addColorStop(0, `rgba(${cr},${cg},${cb},${pulseA})`)
        grad.addColorStop(1, 'transparent')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, W, H)
      }
      if (phase === 2) {
        const pulseA = 0.12 * globalAlpha
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.2)
        grad.addColorStop(0, `rgba(${cr},${cg},${cb},${pulseA})`)
        grad.addColorStop(1, 'transparent')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, W, H)
      }

      animId = requestAnimationFrame(loop)
    }

    return () => {
      if (animId) cancelAnimationFrame(animId)
      visibilityTrigger.kill()
      ro.disconnect()
    }
  }, [cr, cg, cb, count])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none z-[1] ${className}`}
      aria-hidden="true"
    />
  )
}
