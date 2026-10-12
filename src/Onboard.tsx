import { MAJORS, MCOLOR, type Major, type Word } from './lib/core'

interface Props { current: Major | null; words?: Word[]; onPick: (m: Major) => void; onClose?: () => void }
const PICK = MAJORS.filter(m => m.key !== 'Umum')

export default function Onboard({ current, words, onPick, onClose }: Props) {
  const n = (m: Major) => words?.filter(w => w.major === m).length
  return (
    <main className="onb">
      {onClose && <button className="icon onb-x" onClick={onClose} aria-label="Tutup">✕</button>}
      <p className="eyebrow">Langkah 1 dari 1</p>
      <h1>Kamu jurusan<br />apa<span>?</span></h1>
      <p className="onb-sub">Pilih satu jurusan sebagai ruang belajar aktif. Pencarian dan daftar kata hanya akan menampilkan kosakata dari jurusan ini sampai kamu menggantinya.</p>
      <div className="picks" role="group" aria-label="Pilih jurusan">
        {PICK.map(m => (
          <button key={m.key} className="pick" style={{ '--mc': MCOLOR[m.key] } as React.CSSProperties} aria-pressed={current === m.key} onClick={() => onPick(m.key)}>
            <i className="dot" /><b>{m.key}</b><span>{m.full}</span><small>{n(m.key) != null ? `${n(m.key)} kata` : '…'}</small>
          </button>))}
      </div>
    </main>
  )
}
