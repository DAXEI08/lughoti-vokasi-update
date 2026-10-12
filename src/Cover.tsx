import { useMemo } from 'react'

export default function Cover({ onStart, words }: { onStart: () => void; words: string[] }) {
  const rows = useMemo(() => {
    const fallback = ['بَرْمَجَة', 'حِسَاب', 'مُحَرِّك', 'دَرَّاجَة', 'شَبَكَة', 'مِهْنَة', 'بَيَانَات', 'تَطْبِيق', 'مِيزَانِيَّة', 'صِيَانَة', 'مُحَاسَبَة', 'تِقْنِيَّة']
    const source = words.length ? [...words] : fallback

    for (let i = source.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[source[i], source[j]] = [source[j], source[i]]
    }

    const pool = source.slice(0, Math.min(30, source.length))
    return [0, 1, 2].map(row => pool.filter((_, i) => i % 3 === row))
  }, [words])

  return (
    <main className="cover cover-v3">
      <div className="cover-v3-orb cover-v3-orb-a" aria-hidden />
      <div className="cover-v3-orb cover-v3-orb-b" aria-hidden />

      <div className="cover-v3-rails" aria-hidden>
        {rows.map((row, i) => (
          <div key={i} className={'cover-v3-rail' + (i === 1 ? ' is-reverse' : '')}>
            <div className="cover-v3-track">
              <div className="cover-v3-group">
                {row.map((word, j) => <span key={'a' + j} lang="ar" dir="rtl">{word}</span>)}
              </div>
              <div className="cover-v3-group">
                {row.map((word, j) => <span key={'b' + j} lang="ar" dir="rtl">{word}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="cover-v3-panel" aria-labelledby="cover-title">
        <div className="cover-v3-school">
          <span aria-hidden />
          SMK Muhammadiyah Pencongan
        </div>

        <div className="cover-v3-wordmark">
          <h1 id="cover-title" lang="ar" dir="rtl">لُغَتِي</h1>
          <div className="cover-v3-rule" aria-hidden />
          <h2>Lughati Vokasi</h2>
        </div>

        <div className="cover-v3-footer">
          <p>Author: Sultan Bagus Permadi</p>
          <button className="cover-v3-cta" onClick={onStart} autoFocus>
            <span>Mulai</span>
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </section>
    </main>
  )
}
