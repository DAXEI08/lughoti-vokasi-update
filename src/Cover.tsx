import { useMemo } from 'react'

export default function Cover({ onStart, words }: { onStart: () => void; words: string[] }) {
  const rows = useMemo(() => {
    const source = words.length ? words : ['بَرْمَجَة', 'حِسَاب', 'مُحَرِّك', 'دَرَّاجَة', 'شَبَكَة', 'مِهْنَة']
    return [0, 1, 2].map(row =>
      source.filter((_, i) => i % 3 === row).slice(0, 12)
    )
  }, [words])

  return (
    <main className="cover cover-v2">
      <div className="cover-aurora" aria-hidden />
      <div className="cover-marquee" aria-hidden>
        {rows.map((row, i) => (
          <div key={i} className={'cover-marquee-row' + (i === 1 ? ' reverse' : '')}>
            <div className="cover-marquee-track">
              {[...row, ...row].map((word, j) => (
                <span key={j} lang="ar" dir="rtl">{word}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <section className="cover-card" aria-labelledby="cover-title">
        <p className="cover-school">SMK Muhammadiyah Pencongan</p>
        <h1 id="cover-title" className="cover-arabic" lang="ar" dir="rtl">لُغَتِي</h1>
        <h2 className="cover-title">Lughati Vokasi</h2>
        <p className="cover-author">Author: Sultan Bagus Permadi</p>
        <button className="cover-cta" onClick={onStart} autoFocus>
          Mulai Belajar <span aria-hidden>→</span>
        </button>
      </section>
    </main>
  )
}
