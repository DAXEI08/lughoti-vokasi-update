import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import { MAJORS, MCOLOR, type Major, type Word } from './lib/core'
import './onboard.css'

interface Props {
  current: Major | null
  words?: Word[]
  onPick: (m: Major) => void
  onClose?: () => void
}

const PICK = MAJORS.filter(m => m.key !== 'Umum')
const style = (vars: Record<string, string | number>) => vars as CSSProperties

export default function Onboard({ current, words, onPick, onClose }: Props) {
  // One pass over the dictionary instead of one filter() per card.
  const counts = useMemo(() => {
    if (!words) return null
    const map = new Map<Major, number>()
    for (const w of words) map.set(w.major, (map.get(w.major) ?? 0) + 1)
    return map
  }, [words])

  return (
    <main className="major">
      {onClose && <button type="button" className="icon major__close" onClick={onClose} aria-label="Tutup">✕</button>}

      <div className="major__inner">
        <header className="major__head major__reveal" style={style({ '--i': 0 })}>
          <p className="major__eyebrow">Langkah 1 dari 1</p>
          <h1 className="major__title">Kamu jurusan apa<span>?</span></h1>
          <p className="major__ask" lang="ar" dir="rtl">ما تخصصك؟</p>
          <p className="major__sub">
            Pilih satu jurusan sebagai ruang belajar aktif. Pencarian dan daftar kata hanya akan menampilkan kosakata dari jurusan ini sampai kamu menggantinya.
          </p>
        </header>

        <div className="major__grid" role="group" aria-label="Pilih jurusan">
          {PICK.map((m, i) => {
            const total = counts ? counts.get(m.key) ?? 0 : null
            return (
              <button
                type="button"
                key={m.key}
                className="major__card major__reveal"
                style={style({ '--mc': MCOLOR[m.key], '--i': i + 1 })}
                aria-pressed={current === m.key}
                onClick={() => onPick(m.key)}
              >
                <b className="major__name">{m.full}</b>
                <span className="major__name-ar" lang="ar" dir="rtl">{m.ar}</span>
                <small className="major__count"><i className="major__dot" aria-hidden />{total == null ? '…' : `${total} kata`}</small>
              </button>
            )
          })}
        </div>
      </div>
    </main>
  )
}
