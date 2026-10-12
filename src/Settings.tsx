import { useId } from 'react'
import { ACCENTS, AR_FONTS, ID_FONTS, DEFAULTS, type Prefs } from './lib/core'
import './settings.css'

type Props = { p: Prefs; set: (p: Prefs) => void }
type NumericKey = 'arSize' | 'idSize' | 'subSize' | 'lh' | 'width'

const THEMES = [['system', 'Sistem'], ['light', 'Terang'], ['dark', 'Gelap']] as const

function Range({ label, k, min, max, step, unit, p, set }: Props & { label: string; k: NumericKey; min: number; max: number; step: number; unit: string }) {
  const id = useId()
  return (
    <div className="set-field">
      <div className="set-head">
        <label className="set-label" htmlFor={id}>{label}</label>
        <output className="set-value" htmlFor={id}>{String(p[k])}{unit}</output>
      </div>
      <input id={id} className="set-range" type="range" min={min} max={max} step={step} value={p[k]} onChange={e => set({ ...p, [k]: +e.target.value })} />
    </div>
  )
}

function FontSelect({ label, k, opts, p, set }: Props & { label: string; k: 'arFont' | 'idFont'; opts: string[] }) {
  const id = useId()
  return (
    <div className="set-field">
      <label className="set-label" htmlFor={id}>{label}</label>
      <select id={id} className="set-select" value={p[k]} onChange={e => set({ ...p, [k]: e.target.value })}>
        {opts.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

export default function Settings({ p, set }: Props) {
  const themeId = useId()
  const accentId = useId()
  const densityId = useId()

  return (
    <div className="set">
      <section className="set-preview" aria-label="Pratinjau langsung">
        <div className="set-preview__text">
          <div className="mean">laptop</div>
          <div className="sub">ḥāsūb maḥmūl · Komputer dan perangkat</div>
        </div>
        <div className="ar set-preview__ar" lang="ar" dir="rtl">حَاسُوب مَحْمُول</div>
      </section>

      <fieldset className="set-group">
        <legend>Tampilan</legend>

        <div className="set-field">
          <span className="set-label" id={themeId}>Tema</span>
          <div className="set-seg" role="group" aria-labelledby={themeId}>
            {THEMES.map(([v, name]) => (
              <button type="button" key={v} aria-pressed={p.theme === v} onClick={() => set({ ...p, theme: v })}>{name}</button>
            ))}
          </div>
        </div>

        <div className="set-field">
          <span className="set-label" id={accentId}>Warna aksen</span>
          <div className="set-swatches" role="group" aria-labelledby={accentId}>
            {ACCENTS.map(([n, c]) => (
              <button type="button" key={c} title={n} aria-label={n} aria-pressed={p.accent === c} style={{ background: c }} onClick={() => set({ ...p, accent: c })} />
            ))}
          </div>
        </div>

        <div className="set-field">
          <span className="set-label" id={densityId}>Kepadatan kartu</span>
          <div className="set-seg" role="group" aria-labelledby={densityId}>
            <button type="button" aria-pressed={!p.compact} onClick={() => set({ ...p, compact: false })}>Nyaman</button>
            <button type="button" aria-pressed={p.compact} onClick={() => set({ ...p, compact: true })}>Ringkas</button>
          </div>
        </div>

        <label className="set-field set-switch">
          <span className="set-label">Kurangi animasi</span>
          <input type="checkbox" role="switch" checked={p.calm} onChange={e => set({ ...p, calm: e.target.checked })} />
        </label>
      </fieldset>

      <fieldset className="set-group">
        <legend>Huruf</legend>
        <div className="set-pair">
          <FontSelect label="Font Arab" k="arFont" opts={Object.keys(AR_FONTS)} p={p} set={set} />
          <FontSelect label="Font Indonesia" k="idFont" opts={Object.keys(ID_FONTS)} p={p} set={set} />
        </div>
        <Range label="Ukuran Arab" k="arSize" min={1.4} max={4} step={0.1} unit="rem" p={p} set={set} />
        <Range label="Ukuran terjemahan" k="idSize" min={0.85} max={1.7} step={0.05} unit="rem" p={p} set={set} />
        <Range label="Ukuran transliterasi & teks pendukung" k="subSize" min={0.7} max={1.3} step={0.05} unit="rem" p={p} set={set} />
        <Range label="Tinggi baris" k="lh" min={1.3} max={2.1} step={0.05} unit="" p={p} set={set} />
        <Range label="Lebar konten" k="width" min={720} max={1400} step={20} unit="px" p={p} set={set} />
      </fieldset>

      <button type="button" className="btn-ghost set-reset" onClick={() => set(DEFAULTS)}>Pulihkan pengaturan awal</button>
    </div>
  )
}
