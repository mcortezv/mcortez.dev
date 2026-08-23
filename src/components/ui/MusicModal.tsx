import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { TRACKS, trackAudio, trackCover } from '@/data/music'

type Mode = 'full' | 'mini' | 'gone'

interface Props { onDone: () => void }

/**
 * Volumen de reproduccion. Las pistas ya vienen normalizadas a -18 LUFS,
 * bastante por debajo del master tipico de un disco, asi que esto es solo
 * el ajuste fino sobre ese nivel comun.
 */
const VOLUME = 0.8

export default function MusicModal({ onDone }: Props) {
  const [mode, setMode]       = useState<Mode>('full')
  const [playing, setPlaying] = useState(false)
  // Arranca en una pista al azar; desde ahi se puede recorrer el catalogo.
  const [index, setIndex] = useState(() => Math.floor(Math.random() * TRACKS.length))
  const track = TRACKS[index]

  const step = (d: number) => setIndex(i => (i + d + TRACKS.length) % TRACKS.length)

  const backdropRef = useRef<HTMLDivElement>(null)
  const modalRef    = useRef<HTMLDivElement>(null)
  const artRef      = useRef<HTMLImageElement>(null)
  const infoRef     = useRef<HTMLDivElement>(null)
  const miniRef     = useRef<HTMLDivElement>(null)
  const audioRef    = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = VOLUME
  }, [])

  // ── Entrance: backdrop visible instantly, card slides in ─
  const { contextSafe } = useGSAP(() => {
    if (!modalRef.current) return
    gsap.fromTo(modalRef.current,
      { y: 28, opacity: 0, scale: 0.93 },
      { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.4)', delay: 0.35 }
    )
  })

  // ── Cambio de pista: fundido corto de caratula y textos ──
  useGSAP(() => {
    const targets = [artRef.current, infoRef.current].filter(Boolean)
    if (!targets.length) return
    gsap.fromTo(targets, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'smooth-out' })
  }, { dependencies: [index] })

  // ── Mini player entrance when mode flips to 'mini' ───────
  useGSAP(() => {
    if (mode !== 'mini' || !miniRef.current) return
    gsap.fromTo(miniRef.current,
      { y: 72, opacity: 0, scale: 0.88 },
      { y: 0, opacity: 1, scale: 1, duration: 0.48, ease: 'back.out(1.5)', delay: 0.05 }
    )
  }, { dependencies: [mode] })

  // ── Minimize: hide full modal → show mini player ─────────
  const minimize = contextSafe(() => {
    gsap.timeline({ onComplete: () => { setMode('mini'); onDone() } })
      .to(backdropRef.current, { opacity: 0, duration: 0.3, ease: 'power2.in' })
      .to(modalRef.current,    { y: 12, opacity: 0, scale: 0.91, duration: 0.25 }, '-=0.25')
  })

  // ── Skip: close fully without music ──────────────────────
  const closeFully = contextSafe(() => {
    gsap.timeline({ onComplete: () => { setMode('gone'); onDone() } })
      .to(backdropRef.current, { opacity: 0, duration: 0.3, ease: 'power2.in' })
      .to(modalRef.current,    { y: 12, opacity: 0, scale: 0.91, duration: 0.25 }, '-=0.25')
  })

  // ── Close mini player (stop music + dismiss) ──────────────
  const closeMini = () => {
    if (!miniRef.current) return
    gsap.to(miniRef.current, {
      y: 72, opacity: 0, scale: 0.88, duration: 0.3, ease: 'power2.in',
      onComplete: () => {
        audioRef.current?.pause()
        setPlaying(false)
        setMode('gone')
      },
    })
  }

  // ── Play button in full modal ─────────────────────────────
  const handlePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.play().catch(() => {})
    setPlaying(true)
    setTimeout(() => minimize(), 750)
  }

  // ── Play/pause toggle in mini player ─────────────────────
  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play().catch(() => {})
      setPlaying(true)
    }
  }

  if (mode === 'gone') return null

  return (
    <>
      {/* Audio — /public/music/<slug>.mp3, elegido al azar */}
      <audio ref={audioRef} src={trackAudio(track)} loop preload="none" />

      {/* ── Full Modal ─────────────────────────────────────── */}
      {mode === 'full' && (
        <div
          ref={backdropRef}
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 9990, background: '#0a0a0a' }}
        >
          <div
            ref={modalRef}
            className="relative w-[300px] rounded-2xl overflow-hidden"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.85)',
            }}
          >
            {/* Album Art */}
            <div className="relative w-full overflow-hidden" style={{ height: '210px' }}>
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(150deg, #0f0000 0%, #3b0a0a 30%, #6e1212 58%, #1a0505 100%)',
                }}
              />
              {/* Vinyl rings */}
              <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: 0.1 }}>
                <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
                  {[50, 66, 80].map(r => (
                    <circle key={r} cx="90" cy="90" r={r} stroke="white" strokeWidth="1" />
                  ))}
                  <circle cx="90" cy="90" r="9" fill="white" />
                </svg>
              </div>
              {/* Radial texture */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 10px, rgba(255,255,255,0.018) 10px, rgba(255,255,255,0.018) 11px)',
                }}
              />
              {/* Optional cover art — /public/music/appetite-cover.jpg */}
              <img
                ref={artRef}
                src={trackCover(track)}
                alt={track.album}
                className="absolute inset-0 w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).style.opacity = '0' }}
              />
              {/* Bottom fade */}
              <div
                className="absolute inset-x-0 bottom-0"
                style={{
                  height: '70px',
                  background: 'linear-gradient(to top, var(--bg-card) 10%, transparent 100%)',
                }}
              />
              {/* Equalizer bars */}
              <div
                className="absolute bottom-3 left-0 right-0 flex items-end justify-center gap-[3px]"
                style={{ height: '28px' }}
              >
                {[0, 1, 2, 3, 4, 5, 6].map(i => (
                  <div
                    key={i}
                    className="music-eq-bar music-eq-bar--paused"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  />
                ))}
              </div>
            </div>

            {/* Info + Controls */}
            <div className="px-5 pb-5 pt-1">
              <div className="flex items-center justify-between mb-1.5">
                <p className="section-label" style={{ fontSize: '0.58rem', marginBottom: 0 }}>
                  Now Playing
                </p>
                <div className="music-nav">
                  <button onClick={() => step(-1)} aria-label="Pista anterior">&#8249;</button>
                  <span>{index + 1} / {TRACKS.length}</span>
                  <button onClick={() => step(1)} aria-label="Pista siguiente">&#8250;</button>
                </div>
              </div>
              <div ref={infoRef}>
                <p style={{ color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.3 }}>
                  {track.title}
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                  {track.artist} · {track.album}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={handlePlay}
                  className="btn-hero btn-hero--solid flex-1 justify-center"
                  style={{ fontSize: '0.8rem', padding: '0.55rem 1rem' }}
                >
                  ▶&nbsp;&nbsp;Play
                </button>
                <button
                  onClick={closeFully}
                  className="btn-ghost"
                  style={{ fontSize: '0.78rem', padding: '0.5rem 0.9rem' }}
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Mini Player (bottom-right) ──────────────────────── */}
      {mode === 'mini' && (
        <div
          ref={miniRef}
          className="fixed flex items-center gap-3 rounded-2xl"
          style={{
            bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
            right: 'calc(1.5rem + env(safe-area-inset-right, 0px))',
            zIndex: 9990,
            width: '260px',
            padding: '0.6rem 0.75rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 12px 40px rgba(0,0,0,0.7)',
          }}
        >
          {/* Thumbnail */}
          <div
            className="relative shrink-0 rounded-lg overflow-hidden"
            style={{ width: '40px', height: '40px' }}
          >
            <div
              className="absolute inset-0"
              style={{ background: 'var(--bg-surface)' }}
            />
            <img
              src={trackCover(track)}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.opacity = '0' }}
            />
          </div>

          {/* Song info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              {/* Pulsing dot when playing */}
              <span
                className={playing ? 'music-dot-playing' : ''}
                style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: playing ? 'var(--accent)' : 'var(--text-muted)',
                  flexShrink: 0,
                }}
              />
              <p
                className="truncate"
                style={{ color: 'var(--text)', fontSize: '0.75rem', fontWeight: 600 }}
              >
                {track.title}
              </p>
            </div>
            <p className="truncate" style={{ color: 'var(--text-muted)', fontSize: '0.67rem' }}>
              {track.artist}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={togglePlay}
              style={{
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text)',
                cursor: 'pointer',
                fontSize: '0.7rem',
                transition: 'border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-strong)'
                ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'
                ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              }}
            >
              {playing ? '⏸' : '▶'}
            </button>
            <button
              onClick={closeMini}
              style={{
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  )
}
