/**
 * Hero Blueprints — catálogo de piezas técnicas dibujadas por partículas.
 *
 * Cada pieza vive en su propio espacio de diseño local (w × h) y se ajusta a
 * un "slot" del cuerpo de la ventana. En cada ciclo se compone una hoja con
 * una pieza grande y dos pequeñas en posiciones distintas, así el fondo se
 * reorganiza en vez de repetir siempre el mismo encuadre.
 */

export type Pt = [number, number]
export type Anchor = 'left' | 'center' | 'right'

export interface CNode {
  x: number; y: number; w: number; h: number
  label?: string
  /** 'db' añade la línea superior típica de un datastore */
  shape?: 'rect' | 'db'
  /** separadores horizontales internos, en offsets desde node.y */
  sep?: number[]
}

export interface CEdge {
  pts: Pt[]
  dashed?: boolean
  arrow?: boolean
}

export interface CNote {
  x: number; y: number
  text: string
  anchor?: Anchor
}

/** Texto grande muestreado a partículas (fórmulas). `size` en unidades de diseño. */
export interface CGlyph {
  x: number; y: number
  text: string
  size: number
  anchor?: Anchor
}

export interface CItem {
  id: string
  w: number; h: number
  /** tamaño de fuente de las notas, en unidades de diseño */
  fu: number
  code?: string
  caption?: string
  nodes?: CNode[]
  edges?: CEdge[]
  notes?: CNote[]
  glyphs?: CGlyph[]
}

/* ══════════════════════════════════════════════════════════
   PIEZAS GRANDES — flujos de arquitectura (aspecto ≈ 3:1)
   ══════════════════════════════════════════════════════════ */

const RAG: CItem = {
  id: 'rag', w: 300, h: 100, fu: 3.6,
  code: 'FIG. 01', caption: 'RETRIEVAL AUGMENTED GENERATION',
  nodes: [
    { x: 0,     y: 40, w: 42, h: 22, label: 'QUERY' },
    { x: 51.6,  y: 40, w: 42, h: 22, label: 'EMBED' },
    { x: 103.2, y: 40, w: 42, h: 22, label: 'VECTOR DB', shape: 'db' },
    { x: 154.8, y: 40, w: 42, h: 22, label: 'RERANK' },
    { x: 206.4, y: 40, w: 42, h: 22, label: 'LLM' },
    { x: 258,   y: 40, w: 42, h: 22, label: 'RESPONSE' },
    { x: 51.6,  y: 6,  w: 42, h: 18, label: 'DOCS' },
    { x: 103.2, y: 6,  w: 42, h: 18, label: 'CHUNKER' },
  ],
  edges: [
    { pts: [[42, 51], [51.6, 51]], arrow: true },
    { pts: [[93.6, 51], [103.2, 51]], arrow: true },
    { pts: [[145.2, 51], [154.8, 51]], arrow: true },
    { pts: [[196.8, 51], [206.4, 51]], arrow: true },
    { pts: [[248.4, 51], [258, 51]], arrow: true },
    { pts: [[93.6, 15], [103.2, 15]], arrow: true },
    { pts: [[124.2, 24], [124.2, 40]], arrow: true },
    { pts: [[279, 62], [279, 90], [21, 90], [21, 62]], dashed: true, arrow: true },
  ],
  notes: [
    { x: 103.2, y: 35, text: 'TOP-K = 12', anchor: 'left' },
    { x: 248.4, y: 35, text: 'STREAM', anchor: 'right' },
    { x: 150,   y: 97, text: 'EVAL / FEEDBACK LOOP', anchor: 'center' },
  ],
}

const AGENT: CItem = {
  id: 'agent', w: 300, h: 100, fu: 3.6,
  code: 'FIG. 02', caption: 'AGENT ORCHESTRATION · REACT LOOP',
  nodes: [
    { x: 0,   y: 42, w: 40, h: 20, label: 'GOAL' },
    { x: 126, y: 40, w: 54, h: 24, label: 'ORCHESTRATOR' },
    { x: 260, y: 42, w: 40, h: 20, label: 'OUTPUT' },
    { x: 78,  y: 4,  w: 44, h: 18, label: 'SEARCH' },
    { x: 131, y: 4,  w: 44, h: 18, label: 'EXEC' },
    { x: 184, y: 4,  w: 44, h: 18, label: 'HTTP' },
    { x: 100, y: 74, w: 44, h: 16, label: 'MEMORY', shape: 'db' },
    { x: 157, y: 74, w: 44, h: 16, label: 'TRACE' },
  ],
  edges: [
    { pts: [[40, 52], [126, 52]], arrow: true },
    { pts: [[180, 52], [260, 52]], arrow: true },
    { pts: [[100, 22], [100, 32]] },
    { pts: [[153, 22], [153, 32]] },
    { pts: [[206, 22], [206, 32]] },
    { pts: [[100, 32], [206, 32]] },
    { pts: [[153, 32], [153, 40]], arrow: true },
    { pts: [[153, 64], [153, 68], [122, 68], [122, 74]], arrow: true },
    { pts: [[153, 64], [153, 68], [179, 68], [179, 74]], arrow: true },
    { pts: [[180, 58], [212, 58], [212, 94], [94, 94], [94, 58], [126, 58]], dashed: true, arrow: true },
  ],
  notes: [
    { x: 0,   y: 37, text: 'MAX STEPS = 8', anchor: 'left' },
    { x: 216, y: 97, text: 'OBSERVE → REASON → ACT', anchor: 'right' },
  ],
}

const TOPOLOGY: CItem = {
  id: 'topology', w: 300, h: 100, fu: 3.6,
  code: 'FIG. 03', caption: 'EDGE DEPLOYMENT TOPOLOGY',
  nodes: [
    { x: 0,   y: 41, w: 36, h: 18, label: 'CLIENT' },
    { x: 48,  y: 41, w: 44, h: 18, label: 'EDGE / CDN' },
    { x: 116, y: 7,  w: 48, h: 18, label: 'API GATEWAY' },
    { x: 116, y: 41, w: 48, h: 18, label: 'FUNCTIONS' },
    { x: 116, y: 75, w: 48, h: 18, label: 'STATIC' },
    { x: 190, y: 7,  w: 42, h: 18, label: 'QUEUE' },
    { x: 190, y: 41, w: 42, h: 18, label: 'CACHE', shape: 'db' },
    { x: 248, y: 28, w: 50, h: 24, label: 'POSTGRES', shape: 'db' },
    { x: 248, y: 70, w: 50, h: 18, label: 'OTEL' },
  ],
  edges: [
    { pts: [[36, 50], [48, 50]], arrow: true },
    { pts: [[92, 50], [104, 50]] },
    { pts: [[104, 16], [104, 84]] },
    { pts: [[104, 16], [116, 16]], arrow: true },
    { pts: [[104, 50], [116, 50]], arrow: true },
    { pts: [[104, 84], [116, 84]], arrow: true },
    { pts: [[164, 16], [178, 16]] },
    { pts: [[164, 50], [178, 50]] },
    { pts: [[164, 84], [178, 84], [178, 50]] },
    { pts: [[178, 16], [190, 16]], arrow: true },
    { pts: [[178, 50], [190, 50]], arrow: true },
    { pts: [[232, 16], [240, 16], [240, 34], [248, 34]], arrow: true },
    { pts: [[232, 50], [240, 50], [240, 46], [248, 46]], arrow: true },
    { pts: [[140, 93], [140, 99], [268, 99], [268, 88]], dashed: true, arrow: true },
  ],
  notes: [
    { x: 0,   y: 36, text: 'p95 < 120 ms', anchor: 'left' },
    { x: 298, y: 24, text: 'PRIMARY + 2 RR', anchor: 'right' },
    { x: 298, y: 66, text: 'TRACES', anchor: 'right' },
  ],
}

const TRANSFORMER: CItem = {
  id: 'transformer', w: 300, h: 100, fu: 3.6,
  code: 'FIG. 04', caption: 'TRANSFORMER DECODER BLOCK',
  nodes: [
    { x: 0,     y: 40, w: 40, h: 22, label: 'TOKEN EMBED' },
    { x: 48.8,  y: 40, w: 56, h: 22, label: 'MULTI-HEAD ATTN' },
    { x: 113.6, y: 40, w: 40, h: 22, label: 'ADD & NORM' },
    { x: 162.4, y: 40, w: 46, h: 22, label: 'FEED FORWARD' },
    { x: 217.2, y: 40, w: 40, h: 22, label: 'ADD & NORM' },
    { x: 266,   y: 40, w: 34, h: 22, label: 'LOGITS' },
  ],
  edges: [
    { pts: [[40, 51], [48.8, 51]], arrow: true },
    { pts: [[104.8, 51], [113.6, 51]], arrow: true },
    { pts: [[153.6, 51], [162.4, 51]], arrow: true },
    { pts: [[208.4, 51], [217.2, 51]], arrow: true },
    { pts: [[257.2, 51], [266, 51]], arrow: true },
    { pts: [[20, 62], [20, 80], [133.6, 80], [133.6, 62]], dashed: true, arrow: true },
    { pts: [[133.6, 62], [133.6, 92], [237.2, 92], [237.2, 62]], dashed: true, arrow: true },
    { pts: [[48.8, 26], [48.8, 20], [257.2, 20], [257.2, 26]] },
  ],
  notes: [
    { x: 0,     y: 34, text: 'd = 4096',       anchor: 'left' },
    { x: 48.8,  y: 34, text: '32 HEADS',       anchor: 'left' },
    { x: 162.4, y: 34, text: 'd_ff = 16384',   anchor: 'left' },
    { x: 153,   y: 12, text: '× 32 BLOCKS',    anchor: 'center' },
    { x: 300,   y: 97, text: 'RESIDUAL PATHS', anchor: 'right' },
  ],
}

const SEQUENCE: CItem = {
  id: 'sequence', w: 300, h: 100, fu: 3.6,
  code: 'FIG. 05', caption: 'ASYNC INFERENCE — SEQUENCE',
  nodes: [
    { x: 4,   y: 0,  w: 62, h: 16, label: 'CLIENT' },
    { x: 119, y: 0,  w: 62, h: 16, label: 'API' },
    { x: 234, y: 0,  w: 62, h: 16, label: 'WORKER' },
    // barras de activación
    { x: 146, y: 30, w: 8,  h: 52 },
    { x: 261, y: 46, w: 8,  h: 22 },
  ],
  edges: [
    { pts: [[35, 16], [35, 96]], dashed: true },
    { pts: [[150, 16], [150, 96]], dashed: true },
    { pts: [[265, 16], [265, 96]], dashed: true },
    { pts: [[35, 30], [146, 30]], arrow: true },
    { pts: [[154, 46], [261, 46]], arrow: true },
    { pts: [[261, 68], [154, 68]], dashed: true, arrow: true },
    { pts: [[146, 82], [35, 82]], dashed: true, arrow: true },
  ],
  notes: [
    { x: 90,  y: 25, text: 'POST /infer',   anchor: 'center' },
    { x: 207, y: 41, text: 'enqueue(job)',  anchor: 'center' },
    { x: 207, y: 63, text: 'tokens[]',      anchor: 'center' },
    { x: 90,  y: 77, text: '200 · stream',  anchor: 'center' },
  ],
}

/* ══════════════════════════════════════════════════════════
   PIEZAS PEQUEÑAS — detalle de la hoja
   ══════════════════════════════════════════════════════════ */

const CLASS_DIAGRAM: CItem = {
  id: 'uml', w: 120, h: 98, fu: 5.4,
  caption: 'CLASS',
  nodes: [
    { x: 10, y: 0,  w: 100, h: 46, label: 'Retriever', sep: [15] },
    { x: 10, y: 74, w: 100, h: 22, label: 'HybridRetriever' },
  ],
  edges: [
    { pts: [[60, 74], [60, 46]], arrow: true },
    // punta de generalización (triángulo abierto)
    { pts: [[54, 52], [60, 46], [66, 52], [54, 52]] },
  ],
  notes: [
    { x: 16, y: 24, text: '+ topK: int',   anchor: 'left' },
    { x: 16, y: 32, text: '+ search(q)',   anchor: 'left' },
    { x: 16, y: 40, text: '+ rerank(d[])', anchor: 'left' },
  ],
}

const CHART_BARS: CItem = {
  id: 'hist', w: 130, h: 96, fu: 5.2,
  caption: 'LATENCY',
  nodes: [
    { x: 16, y: 66, w: 9, h: 14 }, { x: 28, y: 54, w: 9, h: 26 },
    { x: 40, y: 36, w: 9, h: 44 }, { x: 52, y: 18, w: 9, h: 62 },
    { x: 64, y: 10, w: 9, h: 70 }, { x: 76, y: 26, w: 9, h: 54 },
    { x: 88, y: 46, w: 9, h: 34 }, { x: 100, y: 60, w: 9, h: 20 },
    { x: 112, y: 70, w: 9, h: 10 },
  ],
  edges: [
    { pts: [[12, 6], [12, 80], [126, 80]] },
    { pts: [[9, 80], [12, 80]] }, { pts: [[9, 56], [12, 56]] },
    { pts: [[9, 32], [12, 32]] }, { pts: [[9, 8], [12, 8]] },
  ],
  notes: [
    { x: 126, y: 90, text: 'p99 340', anchor: 'right' },
  ],
}

const CHART_LINE: CItem = {
  id: 'evals', w: 130, h: 96, fu: 5.2,
  caption: 'EVAL',
  edges: [
    { pts: [[12, 6], [12, 80], [126, 80]] },
    { pts: [[9, 80], [12, 80]] }, { pts: [[9, 56], [12, 56]] },
    { pts: [[9, 32], [12, 32]] }, { pts: [[9, 8], [12, 8]] },
    { pts: [[18, 68], [32, 60], [46, 62], [60, 44], [74, 38], [88, 40], [102, 24], [120, 18]] },
    { pts: [[18, 74], [32, 71], [46, 70], [60, 64], [74, 63], [88, 60], [102, 57], [120, 54]], dashed: true },
  ],
  notes: [
    { x: 126, y: 90, text: 'v1 → v8',   anchor: 'right' },
    { x: 126, y: 14, text: '0.94',      anchor: 'right' },
  ],
}

const MATRIX: CItem = {
  id: 'matrix', w: 92, h: 96, fu: 5.4,
  caption: 'ATTENTION',
  nodes: [
    { x: 6, y: 14, w: 80, h: 72 },
    // celdas activas (patrón causal)
    { x: 6,     y: 14, w: 13.33, h: 12 },
    { x: 19.33, y: 26, w: 13.33, h: 12 },
    { x: 6,     y: 38, w: 13.33, h: 12 },
    { x: 32.66, y: 38, w: 13.33, h: 12 },
    { x: 45.99, y: 50, w: 13.33, h: 12 },
    { x: 19.33, y: 62, w: 13.33, h: 12 },
    { x: 59.32, y: 74, w: 13.33, h: 12 },
  ],
  edges: [
    { pts: [[19.33, 14], [19.33, 86]] }, { pts: [[32.66, 14], [32.66, 86]] },
    { pts: [[45.99, 14], [45.99, 86]] }, { pts: [[59.32, 14], [59.32, 86]] },
    { pts: [[72.65, 14], [72.65, 86]] },
    { pts: [[6, 26], [86, 26]] }, { pts: [[6, 38], [86, 38]] },
    { pts: [[6, 50], [86, 50]] }, { pts: [[6, 62], [86, 62]] },
    { pts: [[6, 74], [86, 74]] },
  ],
  notes: [
    { x: 6,  y: 6,  text: 'Q·Kᵀ  6×6', anchor: 'left' },
    { x: 86, y: 94, text: 'CAUSAL',    anchor: 'right' },
  ],
}

const STATE_MACHINE: CItem = {
  id: 'state', w: 120, h: 100, fu: 5.0,
  caption: 'STATE',
  nodes: [
    { x: 0,  y: 42, w: 40, h: 18, label: 'IDLE' },
    { x: 64, y: 6,  w: 52, h: 18, label: 'RUNNING' },
    { x: 80, y: 44, w: 40, h: 18, label: 'DONE' },
    { x: 64, y: 80, w: 52, h: 18, label: 'FAILED' },
  ],
  edges: [
    { pts: [[40, 51], [52, 51], [52, 15], [64, 15]], arrow: true },
    { pts: [[90, 24], [90, 36], [100, 36], [100, 44]], arrow: true },
    { pts: [[64, 20], [56, 20], [56, 89], [64, 89]], arrow: true },
    { pts: [[64, 89], [20, 89], [20, 60]], dashed: true, arrow: true },
  ],
  notes: [{ x: 0, y: 36, text: 'RETRY ≤ 3', anchor: 'left' }],
}

const TREE_INDEX: CItem = {
  id: 'tree', w: 140, h: 96, fu: 5.0,
  caption: 'INDEX',
  nodes: [
    { x: 50, y: 0,  w: 40, h: 16, label: 'ROOT' },
    { x: 4,   y: 40, w: 38, h: 16, label: 'N0' },
    { x: 51,  y: 40, w: 38, h: 16, label: 'N1' },
    { x: 98,  y: 40, w: 38, h: 16, label: 'N2' },
    { x: 4,   y: 76, w: 38, h: 14 },
    { x: 98,  y: 76, w: 38, h: 14 },
  ],
  edges: [
    { pts: [[70, 16], [70, 28], [23, 28], [23, 40]], arrow: true },
    { pts: [[70, 16], [70, 40]], arrow: true },
    { pts: [[70, 16], [70, 28], [117, 28], [117, 40]], arrow: true },
    { pts: [[23, 56], [23, 76]], arrow: true },
    { pts: [[117, 56], [117, 76]], arrow: true },
  ],
  notes: [{ x: 140, y: 95, text: 'B-TREE · h = 3', anchor: 'right' }],
}

const SCATTER: CItem = {
  id: 'scatter', w: 130, h: 96, fu: 5.2,
  caption: 'CORRELATION',
  nodes: [
    [20, 68], [28, 63], [35, 70], [42, 57], [50, 60], [58, 49],
    [66, 52], [74, 41], [82, 45], [92, 33], [100, 29], [112, 25],
  ].map(([x, y]) => ({ x, y, w: 3, h: 3 })),
  edges: [
    { pts: [[12, 6], [12, 80], [126, 80]] },
    { pts: [[9, 80], [12, 80]] }, { pts: [[9, 56], [12, 56]] },
    { pts: [[9, 32], [12, 32]] }, { pts: [[9, 8], [12, 8]] },
    { pts: [[16, 72], [122, 22]], dashed: true },
  ],
  notes: [{ x: 126, y: 92, text: 'r = 0.87', anchor: 'right' }],
}

const METERS: CItem = {
  id: 'meters', w: 124, h: 74, fu: 4.8,
  caption: 'RESOURCES',
  nodes: [
    // pista + relleno de cada barra
    { x: 36, y: 6,  w: 64, h: 7 }, { x: 36, y: 6,  w: 46, h: 7 },
    { x: 36, y: 24, w: 64, h: 7 }, { x: 36, y: 24, w: 29, h: 7 },
    { x: 36, y: 42, w: 64, h: 7 }, { x: 36, y: 42, w: 56, h: 7 },
    { x: 36, y: 60, w: 64, h: 7 }, { x: 36, y: 60, w: 20, h: 7 },
  ],
  notes: [
    { x: 0, y: 9.5,  text: 'GPU',   anchor: 'left' },
    { x: 0, y: 27.5, text: 'MEM',   anchor: 'left' },
    { x: 0, y: 45.5, text: 'CACHE', anchor: 'left' },
    { x: 0, y: 63.5, text: 'QUEUE', anchor: 'left' },
    { x: 124, y: 9.5,  text: '72%', anchor: 'right' },
    { x: 124, y: 27.5, text: '45%', anchor: 'right' },
    { x: 124, y: 45.5, text: '88%', anchor: 'right' },
    { x: 124, y: 63.5, text: '31%', anchor: 'right' },
  ],
}

const SPARKS: CItem = {
  id: 'sparks', w: 118, h: 78, fu: 4.6,
  caption: 'THROUGHPUT',
  edges: [
    { pts: [[0, 26], [118, 26]] },
    { pts: [[0, 52], [118, 52]] },
    { pts: [[34, 16], [43, 11], [52, 15], [61, 7], [70, 10], [79, 5], [88, 8]] },
    { pts: [[34, 41], [43, 45], [52, 38], [61, 42], [70, 34], [79, 38], [88, 32]] },
    { pts: [[34, 69], [43, 64], [52, 68], [61, 62], [70, 66], [79, 60], [88, 57]] },
  ],
  notes: [
    { x: 0, y: 12, text: 'tok/s', anchor: 'left' },
    { x: 0, y: 38, text: 'req/s', anchor: 'left' },
    { x: 0, y: 64, text: 'p95',   anchor: 'left' },
    { x: 118, y: 12, text: '1.2k',  anchor: 'right' },
    { x: 118, y: 38, text: '340',   anchor: 'right' },
    { x: 118, y: 64, text: '118ms', anchor: 'right' },
  ],
}

/** Fórmulas: el texto se muestrea a partículas, así que se arma glifo a glifo. */
function formula(id: string, caption: string, text: string, size = 10): CItem {
  return {
    id, w: 180, h: 30, fu: 5.2,
    caption,
    glyphs: [{ x: 0, y: 15, text, size, anchor: 'left' }],
    edges: [{ pts: [[0, 28], [180, 28]] }],
  }
}

const FORMULAS: CItem[] = [
  formula('f-attn',  'SCALED DOT-PRODUCT ATTENTION', 'softmax(Q·Kᵀ / √d) · V'),
  formula('f-loss',  'CROSS-ENTROPY LOSS',           'L = −Σ y · log(p)'),
  formula('f-cos',   'COSINE SIMILARITY',            'cos(u,v) = u·v / |u||v|'),
  formula('f-sgd',   'GRADIENT DESCENT',             'θ ← θ − η ∇L(θ)'),
  formula('f-bayes', 'BAYES RULE',                   'P(y|x) = P(x|y)P(y) / P(x)'),
  formula('f-norm',  'LAYER NORM',                   '(x − μ) / √(σ² + ε)'),
  formula('f-kl',    'KL DIVERGENCE',                'D(P||Q) = Σ P log(P/Q)'),
  formula('f-ppl',   'PERPLEXITY',                   'PPL = exp(−1/N Σ log p)'),
  formula('f-f1',    'F1 SCORE',                     'F1 = 2PR / (P + R)'),
  formula('f-big-o', 'INDEX COMPLEXITY',             'build O(n log n) · get O(1)'),
]



/* Piezas anchas y bajas: encajan en las bandas libres (huecos del móvil y
   márgenes inferiores del escritorio), donde un diagrama cuadrado no cabe. */

const TOKENS: CItem = {
  id: 'tokens', w: 180, h: 30, fu: 5.0,
  caption: 'TOKENIZER',
  nodes: [
    ...Array.from({ length: 13 }, (_, i) => ({ x: i * 12.6, y: 4, w: 11, h: 14 })),
    // celdas atendidas: marca interior, no un segundo contorno encima
    { x: 15.1,  y: 7, w: 6, h: 8 }, { x: 52.9,  y: 7, w: 6, h: 8 },
    { x: 103.3, y: 7, w: 6, h: 8 }, { x: 141.1, y: 7, w: 6, h: 8 },
  ],
  notes: [{ x: 180, y: 26, text: 'ctx 128k · bpe', anchor: 'right' }],
}

const LATENCY_STRIP: CItem = {
  id: 'latstrip', w: 180, h: 30, fu: 4.6,
  caption: 'LATENCY',
  edges: [
    { pts: [[0, 26], [180, 26]] },
    { pts: [[34, 18], [48, 11], [62, 16], [76, 8], [90, 13], [104, 6], [118, 10], [132, 4]] },
  ],
  notes: [
    { x: 0,   y: 12, text: 'p95',   anchor: 'left' },
    { x: 180, y: 12, text: '118ms', anchor: 'right' },
  ],
}

const STAGES: CItem = {
  id: 'stages', w: 180, h: 30, fu: 4.8,
  caption: 'PIPELINE',
  nodes: [
    { x: 0,   y: 2, w: 40, h: 16, label: 'INGEST' },
    { x: 47,  y: 2, w: 40, h: 16, label: 'EMBED' },
    { x: 94,  y: 2, w: 40, h: 16, label: 'INDEX' },
    { x: 141, y: 2, w: 39, h: 16, label: 'SERVE' },
  ],
  edges: [
    { pts: [[40, 10], [47, 10]], arrow: true },
    { pts: [[87, 10], [94, 10]], arrow: true },
    { pts: [[134, 10], [141, 10]], arrow: true },
    { pts: [[0, 26], [180, 26]], dashed: true },
  ],
  notes: [],
}


/* ── Fichas ────────────────────────────────────────────────
   Piezas diminutas para el hueco que queda a la derecha del
   nombre en retrato: pocos elementos y etiquetas grandes en
   proporción, para que sigan legibles a esa escala. */

const CHIP_ATTN: CItem = {
  id: 'chip-attn', w: 64, h: 76, fu: 7,
  caption: 'ATTN',
  nodes: [
    { x: 0,    y: 14, w: 64, h: 56 },
    { x: 3.5,  y: 17, w: 9,  h: 8 },
    { x: 35.5, y: 31, w: 9,  h: 8 },
    { x: 19.5, y: 45, w: 9,  h: 8 },
    { x: 51.5, y: 59, w: 9,  h: 8 },
  ],
  edges: [
    { pts: [[16, 14], [16, 70]] }, { pts: [[32, 14], [32, 70]] }, { pts: [[48, 14], [48, 70]] },
    { pts: [[0, 28], [64, 28]] },  { pts: [[0, 42], [64, 42]] },  { pts: [[0, 56], [64, 56]] },
  ],
  notes: [{ x: 0, y: 6, text: 'ATTN 4×4', anchor: 'left' }],
}

const CHIP_METER: CItem = {
  id: 'chip-meter', w: 68, h: 62, fu: 7,
  caption: 'LOAD',
  nodes: [
    { x: 0, y: 12, w: 68, h: 8 }, { x: 0, y: 12, w: 49, h: 8 },
    { x: 0, y: 36, w: 68, h: 8 }, { x: 0, y: 36, w: 31, h: 8 },
  ],
  notes: [
    { x: 0,  y: 5,  text: 'GPU', anchor: 'left' },
    { x: 68, y: 5,  text: '72%', anchor: 'right' },
    { x: 0,  y: 29, text: 'MEM', anchor: 'left' },
    { x: 68, y: 29, text: '45%', anchor: 'right' },
    { x: 0,  y: 57, text: 'p95 118ms', anchor: 'left' },
  ],
}

const CHIP_SPARK: CItem = {
  id: 'chip-spark', w: 70, h: 54, fu: 7,
  caption: 'RATE',
  edges: [
    { pts: [[0, 46], [70, 46]] },
    { pts: [[0, 34], [10, 28], [20, 32], [30, 22], [40, 26], [50, 16], [60, 20], [70, 12]] },
  ],
  notes: [
    { x: 0,  y: 5, text: 'tok/s', anchor: 'left' },
    { x: 70, y: 5, text: '1.2k',  anchor: 'right' },
  ],
}

const CHIP_FLOW: CItem = {
  id: 'chip-flow', w: 62, h: 76, fu: 6.5,
  caption: 'PATH',
  nodes: [
    { x: 0, y: 0,  w: 62, h: 18, label: 'API' },
    { x: 0, y: 29, w: 62, h: 18, label: 'FN' },
    { x: 0, y: 58, w: 62, h: 18, label: 'DB', shape: 'db' },
  ],
  edges: [
    { pts: [[31, 18], [31, 29]], arrow: true },
    { pts: [[31, 47], [31, 58]], arrow: true },
  ],
}

/* ══════════════════════════════════════════════════════════
   VARIANTES VERTICALES — retrato / móvil
   Los flujos de arriba son 3:1 y no caben en una pantalla de
   teléfono; estas versiones recorren el mismo camino en columna.
   ══════════════════════════════════════════════════════════ */

const RAG_V: CItem = {
  id: 'rag-v', w: 120, h: 158, fu: 5.2,
  code: 'FIG. 01', caption: 'RETRIEVAL',
  nodes: [
    { x: 24, y: 0,   w: 68, h: 18, label: 'QUERY' },
    { x: 24, y: 34,  w: 68, h: 18, label: 'EMBED' },
    { x: 24, y: 68,  w: 68, h: 18, label: 'VECTOR DB', shape: 'db' },
    { x: 24, y: 102, w: 68, h: 18, label: 'RERANK' },
    { x: 24, y: 136, w: 68, h: 18, label: 'LLM' },
  ],
  edges: [
    { pts: [[58, 18], [58, 34]], arrow: true },
    { pts: [[58, 52], [58, 68]], arrow: true },
    { pts: [[58, 86], [58, 102]], arrow: true },
    { pts: [[58, 120], [58, 136]], arrow: true },
    { pts: [[92, 145], [110, 145], [110, 9], [92, 9]], dashed: true, arrow: true },
  ],
  notes: [{ x: 21, y: 79, text: 'k=12', anchor: 'right' }],
}

const AGENT_V: CItem = {
  id: 'agent-v', w: 130, h: 158, fu: 5.0,
  code: 'FIG. 02', caption: 'AGENT LOOP',
  nodes: [
    { x: 0,  y: 0,   w: 40, h: 16, label: 'SEARCH' },
    { x: 45, y: 0,   w: 40, h: 16, label: 'EXEC' },
    { x: 90, y: 0,   w: 40, h: 16, label: 'HTTP' },
    { x: 25, y: 40,  w: 80, h: 24, label: 'ORCHESTRATOR' },
    { x: 0,  y: 74,  w: 52, h: 18, label: 'GOAL' },
    { x: 78, y: 74,  w: 52, h: 18, label: 'MEMORY', shape: 'db' },
    { x: 39, y: 126, w: 52, h: 18, label: 'OUTPUT' },
  ],
  edges: [
    { pts: [[20, 16], [20, 24]] },
    { pts: [[65, 16], [65, 24]] },
    { pts: [[110, 16], [110, 24]] },
    { pts: [[20, 24], [110, 24]] },
    { pts: [[65, 24], [65, 40]], arrow: true },
    { pts: [[45, 64], [45, 74]], arrow: true },
    { pts: [[85, 64], [85, 74]], arrow: true },
    { pts: [[65, 64], [65, 126]], arrow: true },
    { pts: [[105, 52], [124, 52], [124, 112], [6, 112], [6, 52], [25, 52]], dashed: true, arrow: true },
  ],
  notes: [{ x: 130, y: 154, text: 'OBSERVE → ACT', anchor: 'right' }],
}

const TRANSFORMER_V: CItem = {
  id: 'transformer-v', w: 120, h: 158, fu: 5.0,
  code: 'FIG. 04', caption: 'DECODER BLOCK',
  nodes: [
    { x: 14, y: 0,   w: 90, h: 16, label: 'LOGITS' },
    { x: 14, y: 26,  w: 90, h: 14, label: 'ADD & NORM' },
    { x: 14, y: 52,  w: 90, h: 18, label: 'FEED FORWARD' },
    { x: 14, y: 82,  w: 90, h: 14, label: 'ADD & NORM' },
    { x: 14, y: 108, w: 90, h: 18, label: 'MULTI-HEAD ATTN' },
    { x: 14, y: 138, w: 90, h: 16, label: 'TOKEN EMBED' },
  ],
  edges: [
    { pts: [[59, 138], [59, 126]], arrow: true },
    { pts: [[59, 108], [59, 96]], arrow: true },
    { pts: [[59, 82], [59, 70]], arrow: true },
    { pts: [[59, 52], [59, 40]], arrow: true },
    { pts: [[59, 26], [59, 16]], arrow: true },
    { pts: [[104, 146], [112, 146], [112, 89], [104, 89]], dashed: true, arrow: true },
    { pts: [[104, 89], [118, 89], [118, 33], [104, 33]], dashed: true, arrow: true },
  ],
  notes: [
    { x: 12, y: 117, text: '32H',  anchor: 'right' },
    { x: 12, y: 61,  text: 'd_ff', anchor: 'right' },
  ],
}

/* ══════════════════════════════════════════════════════════
   Composición
   ══════════════════════════════════════════════════════════ */

export const LARGE: CItem[] = [RAG, AGENT, TOPOLOGY, TRANSFORMER, SEQUENCE]

/** Flujos en columna, para retrato. */
export const LARGE_V: CItem[] = [RAG_V, AGENT_V, TRANSFORMER_V]

/** Fichas para el hueco junto al nombre en retrato. */
export const CHIPS: CItem[] = [CHIP_ATTN, CHIP_METER, CHIP_SPARK, CHIP_FLOW]

/** Piezas que caben en una banda ancha y baja (huecos del móvil). */
export const BANDS: CItem[] = [...FORMULAS, TOKENS, STAGES, LATENCY_STRIP]

/** Detalle a la derecha del contenido: cualquier pieza vale. */
export const SMALL: CItem[] = [
  CLASS_DIAGRAM, FORMULAS[0], SCATTER, FORMULAS[1], STATE_MACHINE, FORMULAS[2],
  CHART_BARS, FORMULAS[3], TREE_INDEX, FORMULAS[4], MATRIX, FORMULAS[5],
  SPARKS, FORMULAS[6], CHART_LINE, FORMULAS[7], METERS, FORMULAS[8], FORMULAS[9],
]

/** Sin texto protagonista: seguras por detrás de la columna de texto. */
export const SMALL_GEO: CItem[] = [
  CLASS_DIAGRAM, CHART_BARS, MATRIX, CHART_LINE, SCATTER, STATE_MACHINE, TREE_INDEX,
]

/** Retrato: solo piezas dibujadas.
    Antes los huecos del telefono se llenaban con BANDS, y ahi habia dos
    problemas. Uno: de sus 13 piezas, 10 eran una formula — una etiqueta, una
    linea de matematicas y un subrayado, que no es un diagrama sino un renglon.
    Dos: todas las de banda miden 180x30, o sea 6:1, y como la escala es
    uniforme, en un hueco de 342x135 se dibujan como una tira de 342x57 que
    cruza la pantalla de lado a lado. Estas van entre 1:1 y 1.7:1, asi que en
    el mismo hueco caen como un diagrama de unos 130x135. */
export const PORTRAIT_PIECES: CItem[] = [
  CLASS_DIAGRAM, CHART_LINE, MATRIX, SCATTER, CHART_BARS,
  STATE_MACHINE, TREE_INDEX, SPARKS, METERS,
]

/** Apuntes al margen: verticales para los costados, anchos para las bandas. */
export const OUTER_TALL: CItem[] = [
  MATRIX, METERS, CLASS_DIAGRAM, STATE_MACHINE, SPARKS, CHART_BARS, SCATTER,
]
export const OUTER_WIDE: CItem[] = [...FORMULAS, TOKENS, STAGES, TREE_INDEX]

export interface Slot { x0: number; y0: number; x1: number; y1: number }

/**
 * Slots del cuerpo de la ventana (fracción de su caja de contenido).
 *
 * La columna de texto ocupa x ∈ [0, ~0.52], así que las piezas se agrupan en
 * la mitad derecha y rondan el centro vertical. Dos familias:
 *   · LG / CLEAR — el bloque principal, a la derecha del contenido.
 *   · UNDER      — por detrás del contenido; solo geometría, nunca texto
 *                  sobre texto. Lee como una hoja que asoma por debajo.
 */
const LG_SLOTS: Slot[] = [
  { x0: 0.46, y0: 0.04, x1: 1.00, y1: 0.44 },
  { x0: 0.44, y0: 0.30, x1: 0.98, y1: 0.70 },
  { x0: 0.48, y0: 0.54, x1: 1.00, y1: 0.94 },
  { x0: 0.42, y0: 0.16, x1: 0.96, y1: 0.56 },
]

const CLEAR_SLOTS: Slot[] = [
  { x0: 0.58, y0: 0.56, x1: 0.90, y1: 0.90 },
  { x0: 0.60, y0: 0.02, x1: 0.92, y1: 0.30 },
  { x0: 0.56, y0: 0.04, x1: 0.88, y1: 0.38 },
  { x0: 0.58, y0: 0.64, x1: 0.90, y1: 0.98 },
]

const UNDER_SLOTS: Slot[] = [
  { x0: 0.00, y0: 0.02, x1: 0.20, y1: 0.28 },
  { x0: 0.00, y0: 0.62, x1: 0.18, y1: 0.92 },
  { x0: 0.20, y0: 0.74, x1: 0.42, y1: 1.00 },
  { x0: 0.20, y0: 0.00, x1: 0.41, y1: 0.24 },
]

/**
 * Apuntes al margen. Se posicionan contra el margen real que deja la ventana
 * (no contra fracciones fijas del lienzo), así nunca invaden el marco por
 * estrecha que sea la pantalla; si el margen no da, la pieza no se dibuja.
 *
 * La opacidad es distinta por lado a propósito: la placa que protege el texto
 * se desvanece hacia la derecha, así que ahí basta muchísimo menos tinta para
 * leer igual de fuerte que a la izquierda.
 */
export type Region = 'left' | 'right' | 'bottom'

export interface MarginSpot {
  region: Region
  /** tramo a lo largo del lado, como fracción del alto (o ancho) de la ventana */
  band: [number, number]
  dim: number
  /** las piezas se arriman al borde de la ventana, no al del viewport */
  align: 'start' | 'center' | 'end'
}

const MARGIN_SPOTS: Record<Region, MarginSpot[]> = {
  left: [
    { region: 'left', band: [0.14, 0.42], dim: 0.42, align: 'end' },
    { region: 'left', band: [0.54, 0.84], dim: 0.42, align: 'end' },
  ],
  right: [
    { region: 'right', band: [0.12, 0.40], dim: 0.15, align: 'start' },
    { region: 'right', band: [0.56, 0.86], dim: 0.15, align: 'start' },
  ],
  bottom: [
    { region: 'bottom', band: [0.04, 0.30], dim: 0.30, align: 'center' },
    { region: 'bottom', band: [0.58, 0.86], dim: 0.24, align: 'center' },
  ],
}

const LAYOUTS: {
  lg: number; clear: number; under: number
  left: number; right: number; bottom: number
}[] = [
  { lg: 0, clear: 0, under: 1, left: 0, right: 1, bottom: 1 },
  { lg: 1, clear: 1, under: 2, left: 1, right: 0, bottom: 0 },
  { lg: 2, clear: 2, under: 0, left: 0, right: 0, bottom: 1 },
  { lg: 3, clear: 3, under: 3, left: 1, right: 1, bottom: 0 },
]

/**
 * Límites de escala de una pieza, en px de pantalla por unidad de diseño.
 *
 * Sin tope, un margen ancho (pantallas grandes) infla la pieza hasta que las
 * etiquetas — que sí están acotadas — quedan ridículas dentro de sus cajas.
 * Sin suelo, en pantallas pequeñas el texto no cabe en la caja. Fuera de
 * rango por abajo la pieza no se dibuja; por arriba se centra en su hueco.
 */
export interface UnitRange { min: number; max: number }

const UNITS: Record<'lead' | 'inner' | 'margin' | 'mobile', UnitRange> = {
  lead:   { min: 1.25, max: 2.50 },
  inner:  { min: 1.05, max: 2.30 },
  margin: { min: 0.95, max: 1.75 },
  /* En un teléfono el suelo baja: mejor una pieza algo pequeña que ninguna.
     Y baja hasta 0.62 porque en una pantalla corta el hueco se queda en unos
     65px: con el suelo en 0.90 una pieza de 96 de alto pedía 86px y se
     descartaba, dejando el hero sin una sola línea técnica. A 0.62 mide unos
     60x57 — una anotación al margen, que es lo que es. */
  mobile: { min: 0.62, max: 2.80 },
}

export interface Placement {
  item: CItem
  lead: boolean
  units: UnitRange
  /** multiplicador de opacidad */
  dim: number
  /** si aporta objetivos de partícula */
  particles: boolean
  /** los apuntes al margen van sin cartucho: son marcas, no figuras */
  caption: boolean
  /** dentro del cuerpo de la ventana */
  slot?: Slot
  /** o en uno de los huecos que deja la columna de texto (retrato) */
  zone?: 'void-top' | 'void-bottom' | 'title-pocket'
    | 'void-top-l' | 'void-top-r' | 'void-bottom-l' | 'void-bottom-r'
  /** Contra que borde de su area se apoya. Por defecto, centrada. */
  align?: 'start' | 'center' | 'end'
  /** Solo se dibuja si ninguna pieza normal cupo. Ver `fallback` en composeMobile. */
  fallback?: boolean
  /** o contra uno de los márgenes exteriores */
  margin?: MarginSpot
}

/** Toma la siguiente pieza libre del pool, evitando repetir dentro de la hoja. */
function pick(pool: CItem[], start: number, taken: Set<string>): CItem {
  for (let k = 0; k < pool.length; k++) {
    const it = pool[(start + k) % pool.length]
    if (!taken.has(it.id)) {
      taken.add(it.id)
      return it
    }
  }
  return pool[start % pool.length]
}

/* ── Retrato / móvil ──────────────────────────────────────
   No hay columna libre al lado del texto, y poner un diagrama
   de fondo se solapa con él. En su lugar se aprovechan los tres
   huecos reales: encima del contenido, debajo, y el margen que
   queda bajo la ventana. */

function composeMobile(cycle: number): Placement[] {
  const taken = new Set<string>()
  const topL = pick(PORTRAIT_PIECES, cycle * 2, taken)
  const topR = pick(PORTRAIT_PIECES, cycle * 2 + 3, taken)
  const botL = pick(PORTRAIT_PIECES, cycle * 2 + 5, taken)
  const botR = pick(PORTRAIT_PIECES, cycle * 2 + 7, taken)
  const chip = pick(CHIPS, cycle, taken)

  /* Sin cartuchos ni marcas de registro en retrato: no hay hueco para ellos
     sin pisar el texto. Y sin la ficha del 'title-pocket': ese hueco se medía
     a la derecha del nombre, y desde que el hero va a sangre el nombre es mas
     grande y ocupa el ancho completo, asi que la ficha aterrizaba pegada a las
     letras y se salia por el borde. */
  /* Dos piezas por hueco y no una.
     El hueco de un telefono mide 342x135 y la escala la manda el alto
     (135/96 = 1.41), asi que una pieza cuadrada nunca pasa de ~190px de ancho
     y, centrada, dejaba ~150px de vacio repartidos a izquierda y derecha. Con
     dos, apoyadas contra los bordes de la columna, el vacio se reduce a la
     separacion central y los extremos caen sobre las mismas verticales que el
     texto — las de 24 y 366. */
  return [
    { item: topL, zone: 'void-top-l', align: 'start', lead: false,
      units: UNITS.mobile, dim: 1, particles: true, caption: false },
    { item: topR, zone: 'void-top-r', align: 'end', lead: false,
      units: UNITS.mobile, dim: 0.85, particles: true, caption: false },
    { item: botL, zone: 'void-bottom-l', align: 'start', lead: false,
      units: UNITS.mobile, dim: 0.85, particles: true, caption: false },
    { item: botR, zone: 'void-bottom-r', align: 'end', lead: false,
      units: UNITS.mobile, dim: 1, particles: true, caption: false },

    /* Reserva para pantallas muy cortas. Ahi los huecos de arriba y abajo se
       quedan sin alto suficiente y las cuatro piezas se descartan, asi que el
       hero se quedaria sin una sola linea tecnica. Esta ficha ocupa el hueco
       a la derecha del nombre, y solo entra si ninguna de las otras cupo: en
       un telefono normal se descarta, que es justo lo que se buscaba al
       sacarla — pegada a las letras del nombre no funcionaba. */
    { item: chip, zone: 'title-pocket', fallback: true, lead: false,
      units: UNITS.mobile, dim: 0.9, particles: true, caption: false },
  ]
}

/**
 * Hoja del ciclo `cycle`: pieza grande + detalle a la derecha + geometría por
 * debajo del contenido + tres apuntes al margen (izquierda, derecha y banda
 * inferior). Los índices avanzan a ritmos distintos, así que la combinación
 * tarda decenas de ciclos en repetirse.
 */
export function composeSheet(cycle: number, portrait = false): Placement[] {
  if (portrait) return composeMobile(cycle)

  const L = LAYOUTS[cycle % LAYOUTS.length]
  const taken = new Set<string>()

  const lead   = pick(LARGE,      cycle,         taken)
  const clear  = pick(SMALL,      cycle * 5,     taken)
  const under  = pick(SMALL_GEO,  cycle * 2 + 1, taken)
  const mLeft  = pick(OUTER_TALL, cycle * 3,     taken)
  const mRight = pick(OUTER_TALL, cycle * 3 + 4, taken)
  const mDown  = pick(OUTER_WIDE, cycle * 4 + 2, taken)

  return [
    { item: lead,  slot: LG_SLOTS[L.lg],       lead: true,  units: UNITS.lead,  dim: 1, particles: true, caption: true },
    { item: clear, slot: CLEAR_SLOTS[L.clear], lead: false, units: UNITS.inner, dim: 1, particles: true, caption: true },
    { item: under, slot: UNDER_SLOTS[L.under], lead: false, units: UNITS.inner, dim: 1, particles: true, caption: true },

    { item: mLeft,  margin: MARGIN_SPOTS.left[L.left],     lead: false, units: UNITS.margin, dim: MARGIN_SPOTS.left[L.left].dim,     particles: false, caption: false },
    { item: mRight, margin: MARGIN_SPOTS.right[L.right],   lead: false, units: UNITS.margin, dim: MARGIN_SPOTS.right[L.right].dim,   particles: false, caption: false },
    { item: mDown,  margin: MARGIN_SPOTS.bottom[L.bottom], lead: false, units: UNITS.margin, dim: MARGIN_SPOTS.bottom[L.bottom].dim, particles: false, caption: false },
  ]
}

/* ─── Geometría ────────────────────────────────────────── */

/** Añade puntos equiespaciados a lo largo de una polilínea. */
export function samplePolyline(pts: Pt[], spacing: number, out: Pt[]) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i]
    const [x2, y2] = pts[i + 1]
    const len = Math.hypot(x2 - x1, y2 - y1)
    const steps = Math.max(1, Math.round(len / spacing))
    for (let k = 0; k < steps; k++) {
      out.push([x1 + ((x2 - x1) * k) / steps, y1 + ((y2 - y1) * k) / steps])
    }
  }
  out.push(pts[pts.length - 1])
}

/** Contorno cerrado de un nodo. */
export function nodeOutline(n: CNode): Pt[] {
  return [
    [n.x, n.y],
    [n.x + n.w, n.y],
    [n.x + n.w, n.y + n.h],
    [n.x, n.y + n.h],
    [n.x, n.y],
  ]
}
