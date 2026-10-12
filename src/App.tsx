import { useEffect, useDeferredValue, useMemo, useRef, useState, type ReactNode } from 'react'
import Cover from './Cover'
import Onboard from './Onboard'
import Settings from './Settings'
import BrandLogo from './BrandLogo'
import { renderStory, STYLES } from './lib/share'
import { MCOLOR, AR_FONTS, DEFAULTS, ID_FONTS, MAJORS, dailyWord, norm, parseDataset, search, usePersisted, type Major, type Similar, type Word } from './lib/core'

type Data = { words: Word[]; similar: Similar[]; skipped: number }
type Scope = 'all' | 'fav' | 'recent'

const Ic = ({ d, fill }: { d: string; fill?: boolean }) => (
  <svg className="i" viewBox="0 0 24 24" aria-hidden fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>)

function Mark({ t, q }: { t: string; q: string }) {
  const nq = norm(q).trim(); if (!nq) return <>{t}</>
  let s = ''; const map: number[] = []
  for (let i = 0; i < t.length; i++) { const c = norm(t[i]); for (const ch of c) { s += ch; map.push(i) } }
  const i = s.indexOf(nq); if (i < 0) return <>{t}</>
  const a = map[i]; let b = map[i + nq.length - 1] + 1
  while (b < t.length && norm(t[b]) === '') b++ // keep trailing diacritics inside the highlight
  return <>{t.slice(0, a)}<mark>{t.slice(a, b)}</mark>{t.slice(b)}</>
}

function Dialog({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { const d = ref.current; if (!d) return; if (open && !d.open) d.showModal(); if (!open && d.open) d.close() }, [open])
  return (
    <dialog className="sheet" ref={ref} aria-label={title} onClose={onClose} onClick={e => { if (e.target === ref.current) onClose() }}>
      <div className="dlg"><header><h2>{title}</h2><button className="icon" onClick={onClose} aria-label="Tutup">✕</button></header>{open && children}</div>
    </dialog>
  )
}

export default function App() {
  const [prefs, setPrefs] = usePersisted('prefs', DEFAULTS)
  const p = { ...DEFAULTS, ...prefs }
  const [seen, setSeen] = usePersisted('seen', false)
  const [mine, setMine] = usePersisted<Major | 'all' | null>('mine', null)
  const [stage, setStage] = useState<'cover' | 'pick' | 'app'>(!seen ? 'cover' : mine == null || mine === 'all' ? 'pick' : 'app')
  const [topic, setTopic] = useState('all')
  const [favs, setFavs] = usePersisted<string[]>('favs', [])
  const [recent, setRecent] = usePersisted<string[]>('recent', [])
  const [data, setData] = useState<Data | null>(null)
  const [err, setErr] = useState('')
  const [tries, setTries] = useState(0)
  const [q, setQ] = useState('')
  const dq = useDeferredValue(q)
  const [major, setMajor] = useState<Major>(mine && mine !== 'all' ? mine : 'RPL')
  const [scope, setScope] = useState<Scope>('all')
  const [lim, setLim] = useState(60)
  const [sel, setSel] = useState<Word | null>(null)
  const [cfg, setCfg] = useState(false)
  const [shareW, setShareW] = useState<Word | null>(null)
  const [style, setStyle] = useState<(typeof STYLES)[number]>('Zamrud')
  const [img, setImg] = useState<{ url: string; blob: Blob } | null>(null)
  const [note, setNote] = useState('')
  const [copied, setCopied] = useState('')
  const [sysDark, setSysDark] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches)

  useEffect(() => {
    const m = matchMedia('(prefers-color-scheme: dark)'); const f = () => setSysDark(m.matches)
    m.addEventListener('change', f); return () => m.removeEventListener('change', f)
  }, [])
  useEffect(() => {
    const r = document.documentElement; const s = r.style
    r.dataset.theme = p.theme === 'system' ? (sysDark ? 'dark' : 'light') : p.theme
    r.dataset.calm = String(p.calm); r.dataset.compact = String(p.compact)
    s.setProperty('--acc', p.accent); s.setProperty('--ar-size', p.arSize + 'rem'); s.setProperty('--id-size', p.idSize + 'rem')
    s.setProperty('--sub-size', p.subSize + 'rem'); s.setProperty('--lh', String(p.lh)); s.setProperty('--maxw', p.width + 'px')
    s.setProperty('--ar-font', AR_FONTS[p.arFont] ?? AR_FONTS.Amiri); s.setProperty('--id-font', ID_FONTS[p.idFont] ?? ID_FONTS['Plus Jakarta Sans'])
  }, [p.theme, p.accent, p.arSize, p.idSize, p.subSize, p.lh, p.width, p.arFont, p.idFont, p.calm, p.compact, sysDark])
  useEffect(() => {
    let live = true; setErr('')
    fetch(`${import.meta.env.BASE_URL}words.json`).then(r => { if (!r.ok) throw new Error(`Gagal memuat words.json (HTTP ${r.status}).`); return r.json() })
      .then(j => live && setData(parseDataset(j))).catch(e => live && setErr(e instanceof Error ? e.message : 'Terjadi kesalahan.'))
    return () => { live = false }
  }, [tries])
  // story image preview, regenerated when the word or style changes
  useEffect(() => {
    if (!shareW) { setImg(null); return }
    let live = true, url = ''; setImg(null); setNote('')
    renderStory(shareW, style, p.arFont).then(b => { if (!live) return; url = URL.createObjectURL(b); setImg({ url, blob: b }) }).catch(() => live && setNote('Gagal membuat gambar.'))
    return () => { live = false; if (url) URL.revokeObjectURL(url) }
  }, [shareW, style, p.arFont])

  const byId = useMemo(() => new Map(data?.words.map(w => [w.id, w])), [data])
  const activeWords = useMemo(() => (data ? data.words.filter(w => w.major === major) : []), [data, major])
  const activeIds = useMemo(() => new Set(activeWords.map(w => w.id)), [activeWords])
  const activeFavIds = useMemo(() => favs.filter(id => activeIds.has(id) && byId.has(id)), [favs, activeIds, byId])
  const activeRecentIds = useMemo(() => recent.filter(id => activeIds.has(id) && byId.has(id)), [recent, activeIds, byId])
  const hits = useMemo(() => search(activeWords, dq), [activeWords, dq])
  const base = useMemo(() => {
    if (scope === 'all') return hits
    const ids = scope === 'fav' ? activeFavIds : activeRecentIds
    const set = new Set(ids)
    const l = hits.filter(h => set.has(h.w.id))
    return dq ? l : l.sort((a, b) => ids.indexOf(a.w.id) - ids.indexOf(b.w.id))
  }, [hits, scope, activeFavIds, activeRecentIds, dq])
  const topics = useMemo(() => { const m = new Map<string, number>(); base.forEach(h => { if (h.w.topic) m.set(h.w.topic, (m.get(h.w.topic) || 0) + 1) }); return [...m].sort((a, b) => b[1] - a[1]) }, [base])
  const shown = useMemo(() => (topic === 'all' ? base : base.filter(h => h.w.topic === topic)), [base, topic])
  const daily = useMemo(() => {
    if (!data) return null
    return activeWords.length ? dailyWord(activeWords) : null
  }, [data, activeWords])
  const similar = sel && data ? data.similar.filter(s => (s.a1 === sel.ar || s.a2 === sel.ar) && (s.scope === 'all' || s.scope === sel.major || !s.scope)) : []
  const coverWords = useMemo(() => (data ? data.words.filter((_, i) => i % 23 === 0).map(w => w.ar) : []), [data])

  useEffect(() => setLim(60), [dq, major, scope, topic])
  useEffect(() => setTopic('all'), [major])
  useEffect(() => { if (topic !== 'all' && !topics.some(t => t[0] === topic)) setTopic('all') }, [topic, topics])
  const choose = (m: Major) => { setMine(m); setMajor(m); setTopic('all'); setQ(''); setScope('all'); setStage('app') }
  const open = (w: Word) => { setSel(w); setRecent(r => [w.id, ...r.filter(x => x !== w.id)].slice(0, 120)) }
  const toggleFav = (id: string) => setFavs(f => (f.includes(id) ? f.filter(x => x !== id) : [id, ...f]))
  const rnd = () => activeWords.length && open(activeWords[Math.floor(Math.random() * activeWords.length)])
  const copy = async (w: Word) => {
    const t = [`${w.ar} (${w.tr}) = ${w.mean}`, w.exAr && `${w.exAr} — ${w.exId}`].filter(Boolean).join('\n')
    try { await navigator.clipboard.writeText(t) } catch { const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); document.execCommand('copy'); a.remove() }
    setCopied(w.id); setTimeout(() => setCopied(''), 1600)
  }
  const fname = (w: Word) => `lughati-${w.id.replace(':', '-')}.png`
  const download = () => { if (!img || !shareW) return; const a = document.createElement('a'); a.href = img.url; a.download = fname(shareW); a.click(); setNote('Gambar diunduh. Unggah dari galeri ke Story-mu.') }
  const share = async () => {
    if (!img || !shareW) return
    const f = new File([img.blob], fname(shareW), { type: 'image/png' })
    if (navigator.canShare?.({ files: [f] })) { try { await navigator.share({ files: [f], title: 'Lughati Vokasi', text: `${shareW.ar} = ${shareW.mean}` }) } catch (e) { if ((e as Error).name !== 'AbortError') download() } }
    else download()
  }
  const wc = (m: Major) => ({ '--mc': MCOLOR[m] } as React.CSSProperties)

  if (stage === 'cover') return <Cover words={coverWords} onStart={() => { setSeen(true); setStage(mine == null || mine === 'all' ? 'pick' : 'app') }} />
  if (stage === 'pick') return <Onboard current={mine === 'all' ? null : mine} words={data?.words} onPick={choose} onClose={mine != null && mine !== 'all' ? () => setStage('app') : undefined} />

  const star = 'm12 3 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9z'
  return (
    <div className="page">
      <header className="hd">
        <button className="brand" onClick={() => setStage('cover')} aria-label="Kembali ke sampul"><span className="logo-shell"><BrandLogo decorative /></span><b>Lughati</b></button>
        <div className="hdr"><button className="icon" onClick={rnd} aria-label="Kata acak" title="Kata acak"><Ic d="M3 7h4l10 10h4M3 17h4l3-3m4-4 3-3h4M18 4l3 3-3 3M18 14l3 3-3 3" /></button>
          <button className="btn tune" onClick={() => setCfg(true)} aria-label="Pengaturan tampilan"><Ic d="M4 6h9m4 0h3M4 12h3m4 0h9M4 18h11m4 0h1" /><span>Tampilan</span></button></div>
      </header>
      <main className="main">
        <button className="me glass" onClick={() => setStage('pick')} aria-label="Ganti jurusan"><i className="dot" style={{ '--mc': MCOLOR[major] } as React.CSSProperties} /><span className="me-copy"><small>Jurusan aktif</small><b>{major}</b></span><span className="switch-label">Ganti</span></button>
        <section className="hero"><p className="eyebrow">Kamus vokasi · fokus jurusan</p><h1 className="h">Kosakata {major}<span>.</span></h1><p className="hero-sub">Pencarian dikunci ke jurusan aktif agar hasil tetap relevan. Ganti jurusan untuk menjelajah bidang lain.</p></section>
        <div className="sbar"><Ic d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm9 16-4-4" />
          <input type="search" dir="auto" value={q} onChange={e => setQ(e.target.value)} placeholder={`Cari kosakata ${major}…`} aria-label={`Cari kosakata jurusan ${major}`} />
          {q && <button className="icon" onClick={() => setQ('')} aria-label="Hapus pencarian"><Ic d="M6 6l12 12M18 6 6 18" /></button>}</div>
        <div className="seg" role="group" aria-label="Tampilkan">
          {([['all', `Semua ${activeWords.length}`], ['fav', `Favorit ${activeFavIds.length}`], ['recent', `Terakhir ${activeRecentIds.length}`]] as [Scope, string][]).map(([k, l]) => <button key={k} aria-pressed={scope === k} onClick={() => setScope(k)}>{l}</button>)}
        </div>
        {topics.length > 0 && <div className="chips topics" role="group" aria-label="Kategori kata">
          <button aria-pressed={topic === 'all'} onClick={() => setTopic('all')}>Semua kategori</button>
          {topics.map(([t, n]) => <button key={t} aria-pressed={topic === t} onClick={() => setTopic(t)}>{t}<small>{n}</small></button>)}
        </div>}
        {err && <div className="state" role="alert"><p>{err}</p><button className="btn" onClick={() => setTries(t => t + 1)}>Coba lagi</button></div>}
        {!data && !err && <div className="state" role="status"><span className="ld" aria-hidden />Memuat kamus…</div>}
        {data && <>
          {daily && !q && scope === 'all' && topic === 'all' && (
            <button className="daily" onClick={() => open(daily)} style={wc(daily.major)}>
              <span className="eyebrow">Kata hari ini</span><span className="ar" lang="ar" dir="rtl">{daily.ar}</span><span className="dm">{daily.mean}</span></button>)}
          <p className="count" aria-live="polite"><b>{shown.length}</b> kata di {major}{q && <> untuk “{q}”</>}{data.skipped > 0 && <> · {data.skipped} baris dilewati</>}</p>
          {shown.length ? <>
            <ul className="list">{shown.slice(0, lim).map(({ w }) => (
              <li key={w.id} className="row" style={wc(w.major)}>
                <button className="open" onClick={() => open(w)}>
                  <span className="info"><b><Mark t={w.mean} q={dq} /></b>{w.tr && <small dir="ltr"><Mark t={w.tr} q={dq} /></small>}</span>
                  <span className="ar" lang="ar" dir="rtl"><Mark t={w.ar} q={dq} /></span></button>
                <button className="fav" aria-pressed={favs.includes(w.id)} aria-label={favs.includes(w.id) ? `Hapus ${w.mean} dari favorit` : `Simpan ${w.mean} ke favorit`} onClick={() => toggleFav(w.id)}><Ic d={star} fill={favs.includes(w.id)} /></button>
              </li>))}</ul>
            {shown.length > lim && <button className="btn more" onClick={() => setLim(l => l + 60)}>Tampilkan lebih banyak</button>}
          </> : <div className="state"><span className="ld" aria-hidden />
            <p>{q ? `Tidak ada hasil untuk “${q}” di jurusan ${major}${topic !== 'all' ? ` · ${topic}` : ''}.` : scope === 'fav' ? `Belum ada favorit di ${major}.` : scope === 'recent' ? `Belum ada riwayat kata di ${major}.` : 'Belum ada kata di kategori ini.'}</p>
            {(q || scope !== 'all' || topic !== 'all') && <button className="btn" onClick={() => { setQ(''); setScope('all'); setTopic('all') }}>Reset filter</button>}</div>}
        </>}
        <footer className="foot"><button className="lnk" onClick={() => setCfg(true)}>Sesuaikan huruf, warna &amp; tema</button><br />Lughati Vokasi · SMK Muhammadiyah Pencongan · Sultan Bagus Permadi</footer>
      </main>

      <nav className="dock glass" aria-label="Navigasi cepat">
        <button onClick={() => { window.scrollTo({ top: 0, behavior: p.calm ? 'auto' : 'smooth' }); requestAnimationFrame(() => document.querySelector<HTMLInputElement>('.sbar input')?.focus({ preventScroll: true })) }} aria-label="Kembali ke pencarian">
          <Ic d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm9 16-4-4" /><span>Cari</span>
        </button>
        <button onClick={() => setStage('pick')} aria-label={`Ganti jurusan dari ${major}`}>
          <Ic d="M4 5h16M7 5v14m10-14v14M4 19h16" /><span>Jurusan</span><b>{major}</b>
        </button>
        <button onClick={() => setCfg(true)} aria-label="Buka pengaturan tampilan">
          <Ic d="M4 6h9m4 0h3M4 12h3m4 0h9M4 18h11m4 0h1" /><span>Tampilan</span>
        </button>
      </nav>

      <Dialog open={!!sel} onClose={() => setSel(null)} title="Detail kata">
        {sel && <article className="detail" style={wc(sel.major)}>
          <div className="ar big" lang="ar" dir="rtl">{sel.ar}</div>
          <div className="mean">{sel.mean}</div>
          {sel.tr && <div className="sub" dir="ltr">{sel.tr}</div>}
          <div className="tags"><b title={MAJORS.find(m => m.key === sel.major)?.full}><i className="dot" />{sel.major}</b>{sel.topic && <span>{sel.topic}</span>}</div>
          {sel.exAr ? <section><h3>Contoh kalimat</h3><p className="exa" lang="ar" dir="rtl">{sel.exAr}</p><p className="exi">{sel.exId}</p></section>
            : <p className="sub">Contoh kalimat belum tersedia untuk kata ini.</p>}
          {similar.map((s, i) => <section key={i} className="sim"><h3>Hati-hati, mirip</h3>
            <p><span lang="ar" dir="rtl">{s.a1}</span> ({s.m1}) ≠ <span lang="ar" dir="rtl">{s.a2}</span> ({s.m2})</p><p className="sub">{s.tip}</p></section>)}
          <div className="acts">
            <button className="btn solid" onClick={() => setShareW(sel)}><Ic d="M12 15V3m0 0L8 7m4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" /> Bagikan ke Story</button>
            <button className="btn" aria-pressed={favs.includes(sel.id)} onClick={() => toggleFav(sel.id)}><Ic d={star} fill={favs.includes(sel.id)} />{favs.includes(sel.id) ? 'Tersimpan' : 'Simpan'}</button>
            <button className="btn" onClick={() => copy(sel)}><Ic d="M9 9h11v11H9zM5 15V4h11" />{copied === sel.id ? 'Tersalin' : 'Salin'}</button>
          </div>
        </article>}
      </Dialog>
      <Dialog open={!!shareW} onClose={() => setShareW(null)} title="Bagikan ke Story">
        <div className="share">
          <div className="story">{img ? <img src={img.url} alt={`Pratinjau kartu story untuk ${shareW?.mean ?? ''}`} /> : <span className="ld" aria-hidden />}</div>
          <div className="seg" role="group" aria-label="Gaya kartu">{STYLES.map(s => <button key={s} aria-pressed={style === s} onClick={() => setStyle(s)}>{s}</button>)}</div>
          <div className="acts"><button className="btn solid" disabled={!img} onClick={share}>Bagikan</button><button className="btn" disabled={!img} onClick={download}>Unduh PNG</button></div>
          <p className="sub" role="status">{note || 'Gambar 1080×1920, siap untuk Instagram, WhatsApp, atau TikTok Story.'}</p>
        </div>
      </Dialog>
      <Dialog open={cfg} onClose={() => setCfg(false)} title="Tampilan"><Settings p={p} set={setPrefs} /></Dialog>
    </div>
  )
}
