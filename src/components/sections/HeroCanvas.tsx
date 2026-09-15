/**
 * Neural Particle Text Formation → Hojas técnicas
 *
 * Las partículas convergen para formar "Manuel Cortez", estallan, y a partir
 * de ahí se reagrupan sobre hojas de trabajo: en cada ciclo se compone una
 * pieza grande (pipeline, topología, secuencia…) más dos piezas de detalle
 * (fórmula, gráfica, UML, matriz…) en posiciones distintas del cuerpo de la
 * ventana. Encima se traza la línea nítida con draw-on, sostiene, y la hoja
 * se disuelve hacia la siguiente.
 */

import { useEffect, useRef } from 'react'
import {
  composeSheet, samplePolyline, nodeOutline,
  type Pt, type CNode, type Placement, type MarginSpot,
} from './heroBlueprints'

/* ─── Minimal 2D Perlin noise ─────────────────────────── */
function buildNoise(seed: number) {
  const p = Array.from({ length: 256 }, (_: unknown, i: number) => i)
  let s = (seed ^ 0x1d2e3f4a) & 0x7fffffff
  for (let i = 255; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) & 0x7fffffff
    const j = s % (i + 1)
    ;[p[i], p[j]] = [p[j], p[i]]
  }
  const perm = new Uint8Array(512)
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255]

  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)
  const lerp = (t: number, a: number, b: number) => a + t * (b - a)
  const grad = (h: number, x: number, y: number) =>
    ((h & 1) ? -x : x) + ((h & 2) ? -y : y)

  return (x: number, y: number): number => {
    const X = Math.floor(x) & 255
    const Y = Math.floor(y) & 255
    const xf = x - Math.floor(x)
    const yf = y - Math.floor(y)
    const u = fade(xf)
    const v = fade(yf)
    return lerp(v,
      lerp(u, grad(perm[perm[X] + Y], xf, yf),
        grad(perm[perm[X + 1] + Y], xf - 1, yf)),
      lerp(u, grad(perm[perm[X] + Y + 1], xf, yf - 1),
        grad(perm[perm[X + 1] + Y + 1], xf - 1, yf - 1)),
    )
  }
}

/* ─── Seeded PRNG ─────────────────────────────────────── */
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

/* ─── Particle ────────────────────────────────────────── */
interface P {
  x: number; y: number
  tx: number; ty: number
  vx: number; vy: number
  speed: number
  life: number; maxLife: number
  size: number
  hasTarget: boolean
  /** su objetivo pertenece a una fórmula: cede el sitio al texto nítido */
  onGlyph: boolean
  ph: number
}

/* ─── Sample text pixels from the REAL DOM title position ── */
function sampleTextPositions(w: number, h: number, canvasEl: HTMLCanvasElement): { x: number; y: number }[] {
  const container = canvasEl.parentElement
  if (!container) return []
  const titleEl = container.querySelector('h1')
  if (!titleEl) return []

  const containerRect = container.getBoundingClientRect()
  const titleRect = titleEl.getBoundingClientRect()

  // Mismo ajuste de escala que en `measure`: bajo el transform del pin de
  // scroll los rects vienen escalados y el canvas trabaja sin escalar.
  const scale = (container as HTMLElement).offsetWidth
    ? containerRect.width / (container as HTMLElement).offsetWidth
    : 1
  const sc = scale || 1

  const titleLeft = (titleRect.left - containerRect.left) / sc
  const titleTop = (titleRect.top - containerRect.top) / sc

  const computed = getComputedStyle(titleEl)
  const fontSize = parseFloat(computed.fontSize)
  const fontWeight = computed.fontWeight
  const fontFamily = computed.fontFamily
  const lineHeight = parseFloat(computed.lineHeight) || fontSize * 0.94

  const off = document.createElement('canvas')
  off.width = w
  off.height = h
  const offCtx = off.getContext('2d')!

  // Variable-font weights (e.g. 560) can fail the canvas font shorthand parser
  // in some engines — fall back to the nearest 100 if the assignment is rejected.
  const setFont = (weight: string) => {
    offCtx.font = `${weight} ${fontSize}px ${fontFamily}`
    return offCtx.font.includes(`${fontSize}px`)
  }
  if (!setFont(fontWeight)) {
    setFont(String(Math.round(parseInt(fontWeight, 10) / 100) * 100 || 600))
  }

  offCtx.fillStyle = 'white'
  offCtx.textBaseline = 'alphabetic'

  const letterSpacing = computed.letterSpacing
  if (letterSpacing && letterSpacing !== 'normal') {
    ;(offCtx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = letterSpacing
  }

  // El line box centra la caja de glifos: la primera baseline queda a
  // halfLeading + ascent del borde superior del elemento.
  const metrics = offCtx.measureText('Manuel')
  const ascent  = metrics.fontBoundingBoxAscent  ?? fontSize * 0.97
  const descent = metrics.fontBoundingBoxDescent ?? fontSize * 0.24
  const baseline = titleTop + (lineHeight - (ascent + descent)) / 2 + ascent

  offCtx.fillText('Manuel', titleLeft, baseline)
  offCtx.fillText('Cortez', titleLeft, baseline + lineHeight)

  const data = offCtx.getImageData(0, 0, w, h).data
  const positions: { x: number; y: number }[] = []
  const isMob = w < 768
  const step = isMob ? 3 : Math.max(4, Math.floor(Math.min(w, h) / 180))

  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      if (data[(y * w + x) * 4 + 3] > 128) {
        positions.push({ x, y })
      }
    }
  }
  return positions
}

/** Muestrea los píxeles de un texto mono; offsets desde (izquierda, centro vertical). */
function sampleGlyphs(text: string, fontPx: number, step: number): Pt[] {
  const font = `500 ${fontPx}px "JetBrains Mono", monospace`
  const probe = document.createElement('canvas').getContext('2d')!
  probe.font = font
  const tw = Math.ceil(probe.measureText(text).width)
  if (!tw) return []

  const pad = 3
  const w = tw + pad * 2
  const h = Math.ceil(fontPx * 1.8) + pad * 2
  const off = document.createElement('canvas')
  off.width = w
  off.height = h
  const c = off.getContext('2d')!
  c.font = font
  c.fillStyle = '#fff'
  c.textBaseline = 'middle'
  c.fillText(text, pad, h / 2)

  const d = c.getImageData(0, 0, w, h).data
  const out: Pt[] = []
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      if (d[(y * w + x) * 4 + 3] > 120) out.push([x - pad, y - h / 2])
    }
  }
  return out
}

/* ─── Phase curves ────────────────────────────────────── */
function formingStrength(t: number): number {
  if (t < 0.4) return 0
  if (t < 1.5) return Math.min(1, (t - 0.4) / 0.9)
  if (t < 2.35) return 1
  return 0
}
const EXPLOSION_TIME = 2.35

/** Cuándo arranca la secuencia de hojas y cuánto dura cada una. */
const BP_START = 3.9
/** En retrato no hay formación del nombre: las hojas entran casi de inmediato. */
const BP_START_PORTRAIT = 1.0
const BP_CYCLE = 7.6

/* Ventanas dentro de un ciclo (segundos desde su inicio) */
const CONVERGE_IN: [number, number] = [0.10, 1.45]
const CONVERGE_OUT = 6.45
const DRAW_WIN: [number, number] = [0.90, 2.30]
const LINE_FADE  = [0.90, 1.40, 6.15, 6.95] as const
const LABEL_FADE = [1.95, 2.65, 5.95, 6.55] as const

/* ─── Paleta ─────────────────────────────────────────── */
const BG = { r: 10, g: 10, b: 10 }
const BG_HEX = '#0a0a0a'
const INK = { r: 234, g: 232, b: 228 }
const ACCENT = { r: 79, g: 191, b: 154 }

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)
const smooth = (v: number) => v * v * (3 - 2 * v)
const ramp = (t: number, a: number, b: number) => smooth(clamp01((t - a) / (b - a)))

/* ─── Trazo progresivo de una polilínea ────────────────── */
function strokePartial(ctx: CanvasRenderingContext2D, pts: Pt[], p: number) {
  if (p <= 0 || pts.length < 2) return
  let total = 0
  for (let i = 0; i < pts.length - 1; i++) {
    total += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1])
  }
  const target = total * p
  let acc = 0
  ctx.beginPath()
  ctx.moveTo(pts[0][0], pts[0][1])
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i]
    const [x2, y2] = pts[i + 1]
    const seg = Math.hypot(x2 - x1, y2 - y1)
    if (acc + seg <= target) {
      ctx.lineTo(x2, y2)
      acc += seg
    } else {
      const f = seg === 0 ? 0 : (target - acc) / seg
      ctx.lineTo(x1 + (x2 - x1) * f, y1 + (y2 - y1) * f)
      break
    }
  }
  ctx.stroke()
}

function drawArrowHead(ctx: CanvasRenderingContext2D, pts: Pt[], size: number) {
  const n = pts.length
  const [x2, y2] = pts[n - 1]
  const [x1, y1] = pts[n - 2]
  const a = Math.atan2(y2 - y1, x2 - x1)
  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - size * Math.cos(a - 0.42), y2 - size * Math.sin(a - 0.42))
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - size * Math.cos(a + 0.42), y2 - size * Math.sin(a + 0.42))
  ctx.stroke()
}

/* ─── Hoja resuelta a coordenadas de pantalla ──────────── */
interface RStroke { pts: Pt[]; dashed: boolean; arrow: boolean; dim: number }
interface RText {
  x: number; y: number
  text: string
  align: CanvasTextAlign
  size: number
  dim: number
}
interface RCaption { x: number; y: number; size: number; code?: string; title: string; dim: number }
interface RSheet {
  strokes: RStroke[]
  labels: RText[]
  glyphs: RText[]
  captions: RCaption[]
  leadBox: { x: number; y: number; w: number; h: number } | null
  leadUnit: number
  targets: Pt[]
  /** paralelo a `targets`: true si el punto forma parte de una fórmula */
  targetGlyph: boolean[]
}

const EMPTY_SHEET: RSheet = {
  strokes: [], labels: [], glyphs: [], captions: [],
  leadBox: null, leadUnit: 1, targets: [], targetGlyph: [],
}

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    /* Sin asercion: si el navegador niega el contexto (presion de memoria en
       movil, por ejemplo), esto lanzaba en la linea siguiente y el error subia
       hasta desmontar el arbol entero — pagina negra. */
    const ctx2d = canvas.getContext('2d')
    if (!ctx2d) return
    const ctx: CanvasRenderingContext2D = ctx2d

    const SEED = 2025
    const noise = buildNoise(SEED)
    const rng = mulberry32(SEED ^ 0xdeadbeef)
    let startTime = performance.now()
    let time = 0
    let animId = 0
    let particles: P[] = []
    let W = 0, H = 0
    let exploded = false
    let explosionCx = 0, explosionCy = 0
    let sheetsOn = false
    let portrait = false
    let sheet: RSheet = EMPTY_SHEET
    let sheetCycle = -1
    let started = false
    let lastW = -1, lastH = -1

    function makeParticle(w: number, h: number, target?: { x: number; y: number }): P {
      return {
        x: rng() * w,
        y: rng() * h,
        tx: target?.x ?? 0,
        ty: target?.y ?? 0,
        vx: (rng() - 0.5) * 3,
        vy: (rng() - 0.5) * 3,
        speed: 0.25 + rng() * 0.6,
        life: Math.floor(rng() * 300),
        maxLife: 250 + Math.floor(rng() * 250),
        size: 0.45 + rng() * 0.85,
        hasTarget: !!target,
        onGlyph: false,
        ph: rng() * Math.PI * 2,
      }
    }

    /**
     * Mide un elemento en el espacio de coordenadas del canvas.
     *
     * El hero se escala con el pin de scroll (`transform: scale`), y bajo un
     * transform `getBoundingClientRect()` devuelve medidas escaladas mientras
     * que el canvas sigue trabajando en píxeles de layout. Sin dividir entre
     * ese factor, toda la geometría se desplaza hacia el centro al hacer
     * scroll — el descuadre clásico.
     */
    function measure(sel: string) {
      const container = canvasRef.current?.parentElement as HTMLElement | null
      const el = container?.querySelector(sel)
      if (!container || !el) return null
      const c = container.getBoundingClientRect()
      const scale = container.offsetWidth ? c.width / container.offsetWidth : 1
      const s = scale || 1
      const b = el.getBoundingClientRect()
      return {
        x: (b.left - c.left) / s,
        y: (b.top - c.top) / s,
        w: b.width / s,
        h: b.height / s,
        el: el as HTMLElement,
      }
    }

    /**
     * Caja de contenido del cuerpo de la ventana. Se descuenta el padding para
     * que ninguna pieza toque el borde del marco.
     */
    function fieldRect() {
      const m = measure('.hero-body')
      if (!m) return { x: W * 0.08, y: H * 0.16, w: W * 0.84, h: H * 0.62 }
      const cs = getComputedStyle(m.el)
      const pl = parseFloat(cs.paddingLeft)   || 0
      const pr = parseFloat(cs.paddingRight)  || 0
      const pt = parseFloat(cs.paddingTop)    || 0
      const pb = parseFloat(cs.paddingBottom) || 0
      return {
        x: m.x + pl,
        y: m.y + pt,
        w: Math.max(0, m.w - pl - pr),
        h: Math.max(0, m.h - pt - pb),
      }
    }

    /** Rectángulo de la ventana (marco completo). */
    function windowRect() {
      return measure('.hero-window')
    }

    /**
     * Caja disponible en un margen exterior. Devuelve null si el margen es
     * demasiado estrecho: en pantallas donde la ventana ocupa casi todo el
     * ancho, la pieza simplemente no se dibuja en vez de invadir el marco.
     */
    function marginRect(m: MarginSpot) {
      const win = windowRect()
      if (!win) return null
      const [b0, b1] = m.band

      if (m.region === 'left') {
        const w = win.x - 16
        if (w < 78) return null
        return { x: 8, y: win.y + b0 * win.h, w, h: (b1 - b0) * win.h }
      }
      if (m.region === 'right') {
        const right = win.x + win.w
        const w = W - right - 16
        if (w < 78) return null
        return { x: right + 8, y: win.y + b0 * win.h, w, h: (b1 - b0) * win.h }
      }
      const top = win.y + win.h
      const h = H - top - 10
      if (h < 44) return null
      return { x: win.x + b0 * win.w, y: top + 5, w: (b1 - b0) * win.w, h }
    }

    /**
     * Los dos huecos que deja la columna de texto en retrato, medidos contra
     * el bloque real: así ninguna pieza aterriza encima del contenido por
     * mucho que cambie la altura del texto.
     */
    function voidBands(field: { x: number; y: number; w: number; h: number }) {
      const main = measure('.hero-main')
      if (!main) return null
      const gap = 12
      const bottomStart = main.y + main.h + gap

      // Hueco a la derecha del nombre: el h1 ocupa todo el ancho pero el texto
      // no, así que se mide el span de la línea (inline-block) para saber
      // dónde termina de verdad.
      const h1 = measure('.hero-title')
      const ln = measure('.hero-title-ln')
      const pocketX = h1 && ln ? h1.x + ln.w + 16 : 0
      const pocket = h1 && ln
        ? {
            x: pocketX, y: h1.y + 4,
            w: Math.max(0, field.x + field.w - pocketX),
            h: Math.max(0, h1.h - 8),
          }
        : { x: 0, y: 0, w: 0, h: 0 }

      const topH = Math.max(0, main.y - gap - field.y)
      const botH = Math.max(0, field.y + field.h - bottomStart)

      /* Cada hueco se parte en dos mitades con un pasillo en medio: en retrato
         entran dos piezas por hueco, cada una apoyada en su borde exterior. */
      const alley = 14
      const halfW = Math.max(0, (field.w - alley) / 2)
      const rightX = field.x + halfW + alley

      return {
        'void-top':      { x: field.x, y: field.y,     w: field.w, h: topH },
        'void-bottom':   { x: field.x, y: bottomStart, w: field.w, h: botH },
        'void-top-l':    { x: field.x, y: field.y,     w: halfW,   h: topH },
        'void-top-r':    { x: rightX,  y: field.y,     w: halfW,   h: topH },
        'void-bottom-l': { x: field.x, y: bottomStart, w: halfW,   h: botH },
        'void-bottom-r': { x: rightX,  y: bottomStart, w: halfW,   h: botH },
        'title-pocket': pocket,
      }
    }

    /* ── Resolver la hoja del ciclo a coordenadas de pantalla ── */
    function resolveSheet(cycle: number): RSheet {
      const field = fieldRect()
      if (field.w < (portrait ? 200 : 320) || field.h < 220) return EMPTY_SHEET

      const strokes: RStroke[] = []
      const labels: RText[] = []
      const glyphs: RText[] = []
      const captions: RCaption[] = []
      const targets: Pt[] = []
      const targetGlyph: boolean[] = []
      let leadBox: RSheet['leadBox'] = null
      let leadUnit = 1

      const bands = portrait ? voidBands(field) : null
      // Cuantas piezas normales se han podido dibujar: las de reserva miran
      // esto para saber si hacen falta.
      let colocadas = 0

      for (const place of composeSheet(cycle, portrait) as Placement[]) {
        const { item, slot, margin, zone, lead, dim, units } = place
        if (place.fallback && colocadas > 0) continue

        // Slot del cuerpo, hueco medido de la columna, o margen exterior
        const area = zone
          ? bands?.[zone] ?? null
          : slot
            ? {
                x: field.x + slot.x0 * field.w,
                y: field.y + slot.y0 * field.h,
                w: (slot.x1 - slot.x0) * field.w,
                h: (slot.y1 - slot.y0) * field.h,
              }
            : margin ? marginRect(margin) : null
        if (!area || area.h < 26 || area.w < 62) continue

        const { x: sx, y: sy, w: sw, h: sh } = area

        // Escala acotada: por debajo del mínimo la pieza no cabe legible y se
        // omite; por encima del máximo se mantiene a tamaño de referencia y
        // simplemente le sobra hueco.
        const fit = Math.min(sw / item.w, sh / item.h)
        if (fit < units.min) continue
        const unit = Math.min(fit, units.max)

        if (!place.fallback) colocadas++

        const bw = item.w * unit
        const bh = item.h * unit
        // La pieza manda sobre el margen: en retrato se apoya en su borde exterior.
        const align = place.align ?? margin?.align ?? 'center'
        const ox = align === 'start' ? sx
                 : align === 'end'   ? sx + sw - bw
                 : sx + (sw - bw) / 2
        const oy = sy + (sh - bh) / 2
        const to = (p: Pt): Pt => [ox + p[0] * unit, oy + p[1] * unit]

        if (lead) {
          leadBox = { x: ox, y: oy, w: bw, h: bh }
          leadUnit = unit
        } else if (!leadBox && leadUnit === 1) {
          // Retrato no designa pieza principal: la primera marca la escala
          leadUnit = unit
        }

        const noteSize = clamp(item.fu * unit, portrait ? 6.5 : 7, 14)
        const spacing = lead ? 5.2 : 4.4
        const local: RStroke[] = []

        /* Nodos */
        for (const n of (item.nodes ?? []) as CNode[]) {
          local.push({ pts: nodeOutline(n).map(to), dashed: false, arrow: false, dim })

          if (n.shape === 'db') {
            const dy = n.y + Math.min(4.5, n.h * 0.22)
            local.push({ pts: [to([n.x, dy]), to([n.x + n.w, dy])], dashed: false, arrow: false, dim })
          }
          for (const off of n.sep ?? []) {
            local.push({
              pts: [to([n.x, n.y + off]), to([n.x + n.w, n.y + off])],
              dashed: false, arrow: false, dim,
            })
          }

          if (n.label) {
            // Con separadores la etiqueta va en el primer compartimento
            const band = n.sep?.length ? n.sep[0] : n.h
            const dy = n.shape === 'db' ? Math.min(2.5, n.h * 0.12) : 0
            const c = to([n.x + n.w / 2, n.y + band / 2 + dy])
            labels.push({ x: c[0], y: c[1], text: n.label, align: 'center', size: noteSize, dim })
          }
        }

        /* Aristas */
        for (const e of item.edges ?? []) {
          local.push({ pts: e.pts.map(to), dashed: !!e.dashed, arrow: !!e.arrow, dim })
        }

        /* Notas */
        for (const nt of item.notes ?? []) {
          const c = to([nt.x, nt.y])
          labels.push({
            x: c[0], y: c[1], text: nt.text,
            align: (nt.anchor ?? 'left') as CanvasTextAlign,
            size: noteSize * 0.9,
            dim,
          })
        }

        /* Fórmulas: el texto se muestrea a partículas */
        for (const g of item.glyphs ?? []) {
          const px = clamp(g.size * unit, 10, 18)
          const c = to([g.x, g.y])
          glyphs.push({ x: c[0], y: c[1], text: g.text, align: 'left', size: px, dim })
          if (!place.particles) continue
          const gpts = sampleGlyphs(g.text, px, 3)
          const every = Math.max(1, Math.ceil(gpts.length / 300))
          for (let i = 0; i < gpts.length; i += every) {
            targets.push([c[0] + gpts[i][0], c[1] + gpts[i][1]])
            targetGlyph.push(true)
          }
        }

        /* Cartucho */
        if (item.caption && place.caption) {
          const capSize = lead
            ? clamp(unit * 3.9, 8.5, 12)
            : clamp(noteSize * 0.92, 7.5, 10)
          captions.push({
            x: ox,
            y: oy - capSize * (lead ? 1.2 : 1.05),
            size: capSize,
            code: lead ? item.code : undefined,
            title: item.caption,
            dim,
          })
        }

        /* Objetivos de partícula sobre la geometría ya escalada */
        if (place.particles) {
          const before = targets.length
          for (const s of local) samplePolyline(s.pts, spacing, targets)
          for (let i = before; i < targets.length; i++) targetGlyph.push(false)
        }
        strokes.push(...local)
      }

      return { strokes, labels, glyphs, captions, leadBox, leadUnit, targets, targetGlyph }
    }

    /** Reasigna los objetivos de las partículas a la hoja del ciclo `cycle`. */
    function assignSheet(cycle: number) {
      if (cycle === sheetCycle) return
      sheetCycle = cycle
      sheet = resolveSheet(cycle)

      const t = sheet.targets
      const n = particles.length
      if (t.length === 0) {
        for (let i = 0; i < n; i++) particles[i].hasTarget = false
        return
      }
      const claimed = Math.min(n, t.length)
      for (let i = 0; i < n; i++) {
        const p = particles[i]
        if (i < claimed) {
          const j = Math.floor((i / claimed) * t.length) % t.length
          p.tx = t[j][0]
          p.ty = t[j][1]
          p.hasTarget = true
          p.onGlyph = sheet.targetGlyph[j] === true
        } else {
          p.hasTarget = false
        }
      }
    }

    const resize = () => {
      const nextW = canvas.offsetWidth
      const nextH = canvas.offsetHeight
      // La barra de direcciones móvil dispara resize constantemente; sin este
      // filtro la formación del nombre se reiniciaba a media animación.
      if (started && Math.abs(nextW - lastW) < 2 && Math.abs(nextH - lastH) < 2) return
      lastW = nextW
      lastH = nextH

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = nextW
      H = nextH
      canvas.width = W * dpr
      canvas.height = H * dpr
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
      ctx.fillStyle = BG_HEX
      ctx.fillRect(0, 0, W, H)

      const isMobile = W < 768
      // En retrato la hoja se compone en columna y cabe desde 340px de ancho
      portrait = isMobile
      /* El umbral de retrato baja de 340x620 a 320x560: un iPhone SE quedaba
         fuera y se iba sin una sola linea tecnica. Ahi los huecos de arriba y
         abajo no dan de si, pero la ficha de reserva junto al nombre si entra. */
      sheetsOn = portrait ? (W >= 320 && H >= 560) : (W >= 1000 && H >= 600)

      const textPositions = portrait ? [] : sampleTextPositions(W, H, canvas)

      if (textPositions.length > 0) {
        explosionCx = textPositions.reduce((s, p) => s + p.x, 0) / textPositions.length
        explosionCy = textPositions.reduce((s, p) => s + p.y, 0) / textPositions.length
      } else {
        explosionCx = W / 2
        explosionCy = H / 2
      }

      for (let i = textPositions.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1))
        ;[textPositions[i], textPositions[j]] = [textPositions[j], textPositions[i]]
      }

      const maxTextParticles = 580
      let usedPositions = textPositions
      if (textPositions.length > maxTextParticles) {
        const every = Math.ceil(textPositions.length / maxTextParticles)
        usedPositions = textPositions.filter((_, i) => i % every === 0)
      }

      particles = []
      // El nombre se forma también en móvil: era la parte de la animación que
      // más se echaba en falta ahí.
      for (let i = 0; i < usedPositions.length; i++) {
        particles.push(makeParticle(W, H, usedPositions[i]))
      }
      const extraCount = Math.max(12, Math.floor(usedPositions.length * 0.06))
      for (let i = 0; i < extraCount; i++) {
        particles.push(makeParticle(W, H))
      }
      // Pool fijo: cubre la hoja más densa sin recalcular por ciclo
      // En retrato solo hacen falta partículas para las piezas de banda
      const pool = isMobile ? 300 : 620
      while (sheetsOn && particles.length < pool) particles.push(makeParticle(W, H))

      // La geometría se vuelve a resolver en el siguiente ciclo
      sheetCycle = -1
      sheet = EMPTY_SHEET

      // Solo el primer arranque fija el reloj: un resize posterior recompone
      // la geometría pero no rebobina la animación.
      if (!started) {
        startTime = performance.now()
        exploded = false
        started = true
      }
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        // El ResizeObserver puede haber corrido ya con la fuente de respaldo:
        // se fuerza un remuestreo con Inter cargada.
        lastW = -1
        resize()
      })
    } else {
      resize()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    /* ─── Draw loop ─── */
    const draw = () => {
      const elapsed = (performance.now() - startTime) / 1000
      // Retrato: sin formación del nombre ni explosión. Esas fases se leían
      // como ruido en una pantalla pequeña.
      const forming = portrait ? 0 : formingStrength(elapsed)
      const sheetStart = portrait ? BP_START_PORTRAIT : BP_START
      // En retrato el lienzo entra DESPUÉS de que la ventana termine de
      // montarse: ver partículas sueltas mientras se dibuja el marco se leía
      // como ruido. En escritorio arranca ya, porque ahí forman el nombre.
      const intro = portrait ? ramp(elapsed, 0.85, 2.0) : 1

      let onSheet = false
      let converge = 0
      let lineAlpha = 0
      let labelAlpha = 0
      let drawP = 0

      if (sheetsOn && elapsed >= sheetStart) {
        const since = elapsed - sheetStart
        const cycle = Math.floor(since / BP_CYCLE)
        const local = since % BP_CYCLE
        assignSheet(cycle)
        onSheet = sheet.strokes.length > 0 || sheet.glyphs.length > 0
        converge = local < CONVERGE_OUT
          ? ramp(local, CONVERGE_IN[0], CONVERGE_IN[1])
          : 1 - ramp(local, CONVERGE_OUT, CONVERGE_OUT + 0.9)
        drawP = clamp01((local - DRAW_WIN[0]) / (DRAW_WIN[1] - DRAW_WIN[0]))
        lineAlpha  = ramp(local, LINE_FADE[0], LINE_FADE[1])
                   * (1 - ramp(local, LINE_FADE[2], LINE_FADE[3]))
        labelAlpha = ramp(local, LABEL_FADE[0], LABEL_FADE[1])
                   * (1 - ramp(local, LABEL_FADE[2], LABEL_FADE[3]))
      }

      /** Campo de flujo: solo cuando no hay hoja a la que agarrarse */
      const flow = portrait
        ? (1 - converge) * ramp(elapsed, 0.2, 1.1)
        : sheetsOn
          ? (1 - converge) * ramp(elapsed, EXPLOSION_TIME + 0.3, EXPLOSION_TIME + 1.4)
          : ramp(elapsed, EXPLOSION_TIME + 1.55, EXPLOSION_TIME + 4.55)

      const settled = forming > 0.5 || converge > 0.5
      const fadeAlpha = settled ? 0.14 : (portrait ? 0.10 : 0.055)
      ctx.fillStyle = `rgba(${BG.r},${BG.g},${BG.b},${fadeAlpha})`
      ctx.fillRect(0, 0, W, H)

      time += 0.0035

      /* ── Conexiones neuronales (solo durante el texto) ── */
      if (!portrait && forming > 0.25) {
        ctx.lineWidth = 0.4
        const threshold = 40 + forming * 40
        const threshSq = threshold * threshold
        for (let i = 0; i < particles.length; i += 2) {
          const a = particles[i]
          if (!a.hasTarget) continue
          for (let j = i + 2; j < Math.min(i + 50, particles.length); j += 2) {
            const b = particles[j]
            if (!b.hasTarget) continue
            const dx = a.x - b.x
            const dy = a.y - b.y
            if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) continue
            const dSq = dx * dx + dy * dy
            if (dSq < threshSq) {
              const d = Math.sqrt(dSq)
              const a2 = (1 - d / threshold) * 0.075 * forming
              ctx.beginPath()
              ctx.moveTo(a.x, a.y)
              ctx.lineTo(b.x, b.y)
              ctx.strokeStyle = `rgba(${INK.r},${INK.g},${INK.b},${a2})`
              ctx.stroke()
            }
          }
        }
      }

      /* ── Explosión ── */
      if (!portrait && elapsed >= EXPLOSION_TIME && !exploded) {
        exploded = true
        for (const p of particles) {
          const dx = p.x - explosionCx
          const dy = p.y - explosionCy
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const force = 2.6 + Math.random() * 4
          p.vx = (dx / dist) * force + (Math.random() - 0.5) * 3
          p.vy = (dy / dist) * force + (Math.random() - 0.5) * 3
          p.life = 0
          p.maxLife = 400 + Math.floor(Math.random() * 400)
        }
      }

      /* ── Partículas ── */
      const pull = Math.max(forming, converge)
      for (const p of particles) {
        if (p.hasTarget && pull > 0) {
          const jx = Math.cos(p.ph + time * 22) * 0.5 * converge
          const jy = Math.sin(p.ph * 1.7 + time * 19) * 0.5 * converge
          const dx = p.tx + jx - p.x
          const dy = p.ty + jy - p.y
          p.vx += dx * 0.12 * pull
          p.vy += dy * 0.12 * pull
          p.vx *= 0.82
          p.vy *= 0.82
          if (forming > 0.9) {
            p.vx += (Math.random() - 0.5) * 0.15
            p.vy += (Math.random() - 0.5) * 0.15
          }
        }

        if (flow > 0.01) {
          const n = noise(p.x * 0.0026, p.y * 0.0026 + time)
          const angle = n * Math.PI * 5
          const cx = ((W * 0.5 - p.x) / W) * 0.015
          const cy = ((H * 0.5 - p.y) / H) * 0.01
          p.vx += (Math.cos(angle) * 0.09 + cx) * p.speed * flow
          p.vy += (Math.sin(angle) * 0.09 + cy) * p.speed * flow
        }

        const damp = pull > 0.02 ? 1 : 0.997 - flow * 0.087
        p.vx *= damp
        p.vy *= damp

        p.x += p.vx
        p.y += p.vy
        p.life++

        const free = pull < 0.05
        if (free && (p.life > p.maxLife || p.x < -8 || p.x > W + 8 || p.y < -8 || p.y > H + 8)) {
          p.x = rng() * W
          p.y = rng() * H
          p.vx = (rng() - 0.5) * 2
          p.vy = (rng() - 0.5) * 2
          p.life = 0
          continue
        }

        const lifeT = p.life / p.maxLife
        let alpha: number
        if (forming > 0.1) {
          alpha = 0.34 + forming * 0.48
        } else if (p.onGlyph) {
          // La fórmula se arma con partículas y luego estas se retiran del
          // todo: el texto nítido se queda solo, sin halo encima.
          alpha = converge * Math.max(0, 0.42 - labelAlpha * 0.42)
        } else if (p.hasTarget) {
          // Sobre la hoja ceden protagonismo al trazo; al disolverse mantienen
          // un piso de opacidad para que el enjambre siga leyéndose.
          alpha = Math.max(converge * (0.44 - lineAlpha * 0.30), 0.14)
        } else {
          alpha = Math.sin(lifeT * Math.PI) * (portrait ? 0.15 : 0.30)
        }

        const sz = forming > 0.1 ? p.size * (0.9 + forming * 0.8) : p.size

        if (alpha * intro <= 0.002) continue
        ctx.beginPath()
        ctx.arc(p.x, p.y, sz, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${INK.r},${INK.g},${INK.b},${alpha * intro})`
        ctx.fill()
      }

      /* ── Trazo de la hoja por encima de las partículas ── */
      if (onSheet && lineAlpha * intro > 0.01) {
        const N = sheet.strokes.length
        const stag = N > 1 ? 0.5 / (N - 1) : 0
        const win = 1 - stag * (N - 1)

        ctx.lineWidth = 1
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'

        for (let i = 0; i < N; i++) {
          const s = sheet.strokes[i]
          const pi = clamp01((drawP - i * stag) / win)
          if (pi <= 0) continue
          ctx.strokeStyle = `rgba(${INK.r},${INK.g},${INK.b},${lineAlpha * intro * s.dim * (s.dashed ? 0.18 : 0.30)})`
          ctx.setLineDash(s.dashed ? [3, 4] : [])
          strokePartial(ctx, s.pts, pi)
          if (s.arrow && pi > 0.985) {
            ctx.setLineDash([])
            drawArrowHead(ctx, s.pts, Math.max(3.5, sheet.leadUnit * 1.9))
          }
        }
        ctx.setLineDash([])

        /* Marcas de registro en la pieza principal */
        if (sheet.leadBox) {
          const { x, y, w, h } = sheet.leadBox
          const tick = Math.max(5, sheet.leadUnit * 2.4)
          ctx.strokeStyle = `rgba(${INK.r},${INK.g},${INK.b},${lineAlpha * intro * 0.28})`
          ctx.beginPath()
          for (const [cx, cy, dx, dy] of [
            [x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1],
          ] as const) {
            ctx.moveTo(cx, cy); ctx.lineTo(cx + tick * dx, cy)
            ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + tick * dy)
          }
          ctx.stroke()
        }

        /* ── Texto ── */
        if (labelAlpha * intro > 0.01) {
          ctx.textBaseline = 'middle'
          for (const l of sheet.labels) {
            ctx.font = `500 ${l.size}px "JetBrains Mono", monospace`
            ctx.textAlign = l.align
            ctx.fillStyle = `rgba(${INK.r},${INK.g},${INK.b},${labelAlpha * intro * l.dim * 0.38})`
            ctx.fillText(l.text, l.x, l.y)
          }

          for (const g of sheet.glyphs) {
            ctx.font = `500 ${g.size}px "JetBrains Mono", monospace`
            ctx.textAlign = 'left'
            ctx.fillStyle = `rgba(${INK.r},${INK.g},${INK.b},${labelAlpha * intro * g.dim * 0.42})`
            ctx.fillText(g.text, g.x, g.y)
          }

          ctx.textBaseline = 'alphabetic'
          ctx.textAlign = 'left'
          for (const c of sheet.captions) {
            ctx.font = `500 ${c.size}px "JetBrains Mono", monospace`
            let dx = 0
            if (c.code) {
              ctx.fillStyle = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${labelAlpha * intro * c.dim * 0.58})`
              ctx.fillText(c.code, c.x, c.y)
              dx = ctx.measureText(c.code).width + c.size * 0.9
              ctx.fillStyle = `rgba(${INK.r},${INK.g},${INK.b},${labelAlpha * intro * c.dim * 0.34})`
            } else {
              ctx.fillStyle = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${labelAlpha * intro * c.dim * 0.42})`
            }
            ctx.fillText(c.title, c.x + dx, c.y)
          }
        }
      }

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  )
}
