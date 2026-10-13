import { useEffect } from 'react'
import type { CSSProperties } from 'react'
import { MAJORS, MCOLOR, type Major } from './lib/core'
import './about.css'

interface Props {
  /** Entries per major, derived from the loaded dataset so the page never shows stale numbers. */
  counts: Map<Major, number> | null
  onBack: () => void
}

const PICK = MAJORS.filter(m => m.key !== 'Umum')
const style = (vars: Record<string, string | number>) => vars as CSSProperties

const FEATURES = [
  ['Kosakata per jurusan', 'Setiap kata dipilih dari pekerjaan nyata di jurusanmu, bukan dari topik umum.'],
  ['Contoh kalimat kerja', 'Kalimat pendek yang bisa kamu ucapkan di kelas praktik, bengkel, kantor, atau saat magang.'],
  ['Hati-hati, mirip', 'Pasangan kata yang gampang tertukar, supaya salah baca tidak jadi salah kerja.'],
  ['Bagikan ke Story', 'Ubah satu kata menjadi kartu gambar untuk dibagikan dan diingat bersama teman.'],
] as const

export default function About({ counts, onBack }: Props) {
  useEffect(() => { window.scrollTo({ top: 0 }) }, [])
  const total = counts ? PICK.reduce((n, m) => n + (counts.get(m.key) ?? 0), 0) : null

  return (
    <main className="about">
      <header className="about__bar">
        <button type="button" className="btn" onClick={onBack} aria-label="Kembali">
          <svg className="i" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m6-6-6 6 6 6" /></svg>
          Kembali
        </button>
      </header>

      <article className="about__inner">
        <section className="about__hero about__reveal" style={style({ '--i': 0 })}>
          <p className="about__eyebrow">Tentang Lughati Vokasi</p>
          <h1 className="about__title">Bahasa Arab yang akhirnya nyambung dengan jurusanmu<span>.</span></h1>
          <p className="about__ar" lang="ar" dir="rtl">لُغَتِي فِي مِهْنَتِي</p>
          <p className="about__gloss">“Bahasaku dalam profesiku”</p>
        </section>

        <section className="about__block about__reveal" style={style({ '--i': 1 })}>
          <h2>Kenapa kamus ini ada</h2>
          <p>Di SMK, kita belajar bahasa Arab dari buku pelajaran yang sama untuk semua jurusan. Isinya tentang sekolah, keluarga, dan percakapan sehari-hari. Itu penting, tetapi jarang menyentuh dunia yang sedang kita siapkan: baris kode, jurnal dan neraca, bodi mobil, atau mesin motor.</p>
          <p>Akibatnya banyak dari kita merasa materinya tidak nyambung. “Ini nanti dipakai di mana?” Pertanyaan itu wajar, dan selama ini jarang ada yang menjawabnya.</p>
          <p>Lughati Vokasi dibuat untuk menjawabnya. Setiap kata di sini diambil dari pekerjaan yang benar-benar kamu pelajari, supaya bahasa Arab terasa seperti bagian dari keahlianmu, bukan pelajaran yang berdiri sendiri.</p>
        </section>

        <section className="about__block about__reveal" style={style({ '--i': 2 })}>
          <h2>Yang ada di dalamnya</h2>
          <ul className="about__feats">
            {FEATURES.map(([t, d]) => <li key={t}><b>{t}</b><span>{d}</span></li>)}
          </ul>
          <div className="about__majors" role="list" aria-label="Isi kamus per jurusan">
            {PICK.map(m => (
              <div role="listitem" key={m.key} className="about__major" style={style({ '--mc': MCOLOR[m.key] })}>
                <i aria-hidden /><b>{m.key}</b>
                <small>{counts ? `${counts.get(m.key) ?? 0} kata` : '…'}</small>
              </div>
            ))}
          </div>
          {total != null && <p className="about__total">Total {total} kata khusus jurusan, ditambah kosakata umum untuk dunia kerja.</p>}
        </section>

        <section className="about__block about__quote about__reveal" style={style({ '--i': 3 })}>
          <h2>Pesan untukmu</h2>
          <p>Kamu tidak sedang menambah beban pelajaran. Kamu sedang menambah satu bahasa untuk profesimu. Bahasa yang membuka buku panduan teknis, istilah perbankan syariah, peluang kerja yang lebih luas, dan percakapan dengan pelanggan yang beragam.</p>
          <p>Tidak perlu langsung fasih. Satu kata sehari sudah cukup. Setelah sebulan, tiga puluh kata yang benar-benar kamu pakai lebih berharga daripada tiga ratus yang dihafal lalu lupa.</p>
          <blockquote>
            <span lang="ar" dir="rtl">مَنْ جَدَّ وَجَدَ</span>
            <small>man jadda wajada · siapa bersungguh-sungguh, ia akan berhasil</small>
          </blockquote>
        </section>

        <section className="about__block about__reveal" style={style({ '--i': 4 })}>
          <h2>Cara mulai</h2>
          <ol className="about__steps">
            <li>Pilih jurusanmu, lalu buka <b>Kata hari ini</b>.</li>
            <li>Baca contoh kalimatnya dan ucapkan dengan lantang.</li>
            <li>Simpan yang paling berguna ke favorit, lalu pakai saat praktik atau magang.</li>
          </ol>
        </section>

        <footer className="about__sign about__reveal" style={style({ '--i': 5 })}>
          <p>Selamat belajar, dan tetap bangga dengan jalur vokasimu.</p>
          <strong>Sultan Bagus Permadi</strong>
          <span>SMK Muhammadiyah Pencongan</span>
          <button type="button" className="btn solid" onClick={onBack}>Mulai belajar</button>
        </footer>
      </article>
    </main>
  )
}
