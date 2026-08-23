import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'

type Mode = 'full' | 'mini' | 'gone'

interface Props { onDone: () => void }

export default function MusicModal({ onDone }: Props) {
  const [mode, setMode]       = useState<Mode>('full')
  const [playing, setPlaying] = useState(false)

  const backdropRef = useRef<HTMLDivElement>(null)
  const modalRef    = useRef<HTMLDivElement>(null)
  const miniRef     = useRef<HTMLDivElement>(null)
  const audioRef    = useRef<HTMLAudioElement>(null)

  // ── Entrance: backdrop visible instantly, card slides in ─
  const { contextSafe } = useGSAP(() => {
    if (!modalRef.current) return
    gsap.fromTo(modalRef.current,
      { y: 28, opacity: 0, scale: 0.93 },
      { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.4)', delay: 0.35 }
    )
  })

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
      {/* Audio — place file at /public/music/welcome-to-the-jungle.mp3 */}
      <audio ref={audioRef} src="/music/welcome-to-the-jungle.mp3" loop />

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
                src="/music/appetite-cover.jpg"
                alt="Appetite for Destruction"
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
              <p className="section-label" style={{ fontSize: '0.58rem', marginBottom: '0.4rem' }}>
                Now Playing
              </p>
              <p style={{ color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.3 }}>
                Welcome to the Jungle
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                Guns N' Roses · Appetite for Destruction
              </p>
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={handlePlay}
                  className="btn-primary flex-1 justify-center"
                  style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
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
              src="/music/appetite-cover.jpg"
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
                Welcome to the Jungle
              </p>
            </div>
            <p className="truncate" style={{ color: 'var(--text-muted)', fontSize: '0.67rem' }}>
              Guns N' Roses
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
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'
                ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'
                ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text)'
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
