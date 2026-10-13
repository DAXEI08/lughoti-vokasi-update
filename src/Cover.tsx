import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { CSSProperties, PointerEvent } from 'react'
import './cover.css'

type CoverProps = {
  onStart: () => void
  onAbout?: () => void
  words: string[]
}

const FALLBACK_WORDS = [
  'بَرْمَجَة', 'حِسَاب', 'مُحَرِّك', 'دَرَّاجَة', 'شَبَكَة', 'مِهْنَة',
  'بَيَانَات', 'تَطْبِيق', 'مِيزَانِيَّة', 'صِيَانَة', 'مُحَاسَبَة', 'تِقْنِيَّة',
]

const LANE_COUNT = 4
const MAX_WORDS = 36
const MIN_POOL = LANE_COUNT * 3
// The track is translated by exactly one group width, so one group must be wider than the
// viewport. Three copies keep the loop seamless up to ~2x group width on ultra-wide screens.
const LOOP_COPIES = 3

const stagger = (index: number) => ({ '--i': index }) as CSSProperties

export default function Cover({ onStart, onAbout, words }: CoverProps) {
  const rootRef = useRef<HTMLElement>(null)
  const frameRef = useRef(0)

  const lanes = useMemo(() => {
    const source = words.filter(Boolean).slice(0, MAX_WORDS)
    // A short or empty dictionary must never leave a lane blank.
    const pool = source.length >= MIN_POOL ? source : [...source, ...FALLBACK_WORDS].slice(0, MIN_POOL)
    return Array.from({ length: LANE_COUNT }, (_, lane) => pool.filter((_, i) => i % LANE_COUNT === lane))
  }, [words])

  // Mouse-only parallax. Touch devices skip it (no hover, and tilt-on-drag fights scrolling).
  const handlePointerMove = useCallback((e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return
    const el = rootRef.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const { clientX, clientY } = e
    cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(() => {
      el.style.setProperty('--mx', ((clientX / window.innerWidth) * 2 - 1).toFixed(3))
      el.style.setProperty('--my', ((clientY / window.innerHeight) * 2 - 1).toFixed(3))
    })
  }, [])

  const resetParallax = useCallback(() => {
    cancelAnimationFrame(frameRef.current)
    rootRef.current?.style.setProperty('--mx', '0')
    rootRef.current?.style.setProperty('--my', '0')
  }, [])

  useEffect(() => () => cancelAnimationFrame(frameRef.current), [])

  return (
    <main
      ref={rootRef}
      className="immersive-cover"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetParallax}
    >
      <div className="immersive-cover__aurora" aria-hidden>
        <span className="immersive-cover__orb immersive-cover__orb--a" />
        <span className="immersive-cover__orb immersive-cover__orb--b" />
        <span className="immersive-cover__orb immersive-cover__orb--c" />
      </div>

      {/* Sits behind the glass card so backdrop-filter has real content to blur. */}
      <div className="immersive-cover__vocabulary" aria-hidden>
        {lanes.map((lane, index) => (
          <div
            className={'immersive-cover__lane' + (index % 2 ? ' immersive-cover__lane--reverse' : '')}
            key={index}
          >
            <div className="immersive-cover__track">
              {Array.from({ length: LOOP_COPIES }, (_, copy) => (
                <div className="immersive-cover__group" key={copy}>
                  {lane.map((word, wordIndex) => (
                    <span lang="ar" dir="rtl" key={wordIndex}>{word}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <header className="immersive-cover__top immersive-cover__reveal" style={stagger(0)}>
        <span className="immersive-cover__chip">
          <i aria-hidden />
          SMK Muhammadiyah Pencongan
        </span>
      </header>

      <section className="immersive-cover__hero immersive-cover__reveal" style={stagger(1)} aria-labelledby="cover-title">
        <p className="immersive-cover__kicker">Kamus Digital Arab–Indonesia</p>
        <span className="immersive-cover__rule" aria-hidden />

        <h1 id="cover-title" className="immersive-cover__title">
          <span className="immersive-cover__arabic" lang="ar" dir="rtl">لُغَتِي</span>
          <span className="immersive-cover__latin">
            <span>Lughati</span> <span>Vokasi</span>
          </span>
        </h1>
      </section>

      <footer className="immersive-cover__footer immersive-cover__reveal" style={stagger(2)}>
        <div className="immersive-cover__author">
          <span>Author</span>
          <strong>Sultan Bagus Permadi</strong>
        </div>

        <button type="button" className="immersive-cover__start" onClick={onStart}>
          <span>Mulai</span>
          <span className="immersive-cover__arrow" aria-hidden>
            <svg viewBox="0 0 24 24"><path d="M5 12h13M13 7l5 5-5 5" /></svg>
          </span>
        </button>
        {onAbout && <button type="button" className="immersive-cover__about" onClick={onAbout}>Kenapa kamus ini dibuat?</button>}
      </footer>
    </main>
  )
}
