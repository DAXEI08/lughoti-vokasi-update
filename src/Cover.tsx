import { useMemo } from 'react'
import './cover.css'

const FALLBACK_WORDS = [
  'بَرْمَجَة','حِسَاب','مُحَرِّك','دَرَّاجَة','شَبَكَة','مِهْنَة',
  'بَيَانَات','تَطْبِيق','مِيزَانِيَّة','صِيَانَة','مُحَاسَبَة','تِقْنِيَّة'
]

export default function Cover({ onStart, words }: { onStart: () => void; words: string[] }) {
  const lanes = useMemo(() => {
    const source = (words.length ? words : FALLBACK_WORDS).slice(0, 36)
    return [0, 1, 2, 3].map(lane => source.filter((_, index) => index % 4 === lane))
  }, [words])

  return (
    <main className="immersive-cover">
      <div className="immersive-cover__glow immersive-cover__glow--top" aria-hidden />
      <div className="immersive-cover__glow immersive-cover__glow--bottom" aria-hidden />

      <div className="immersive-cover__vocabulary" aria-hidden>
        {lanes.map((lane, index) => (
          <div
            className={'immersive-cover__lane' + (index % 2 ? ' immersive-cover__lane--reverse' : '')}
            key={index}
          >
            <div className="immersive-cover__track">
              {[0, 1].map(copy => (
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

      <header className="immersive-cover__school">
        <span className="immersive-cover__school-line" aria-hidden />
        <span>SMK Muhammadiyah Pencongan</span>
      </header>

      <section className="immersive-cover__hero" aria-labelledby="cover-title">
        <p className="immersive-cover__kicker">Kamus Digital Arab–Indonesia</p>

        <h1 id="cover-title" className="immersive-cover__arabic" lang="ar" dir="rtl">
          لُغَتِي
        </h1>

        <div className="immersive-cover__latin" aria-label="Lughati Vokasi">
          <span>LUGHATI</span>
          <span>VOKASI</span>
        </div>
      </section>

      <footer className="immersive-cover__footer">
        <div className="immersive-cover__author">
          <span>Author</span>
          <strong>Sultan Bagus Permadi</strong>
        </div>

        <button className="immersive-cover__start" onClick={onStart} autoFocus>
          <span>Mulai</span>
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M5 12h13M13 7l5 5-5 5" />
          </svg>
        </button>
      </footer>
    </main>
  )
}
