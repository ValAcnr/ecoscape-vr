import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download } from 'lucide-react'
import { city } from '../config'
import { social } from '../data/social'
import { useGame } from '../state'

/** Sponsor space — quieter "Canopy" treatment (direction A) for B2B credibility. Demo numbers. */
export default function Sponsor() {
  const nav = useNavigate()
  const { s } = useGame()
  const c = city(s.city)
  const SPONSOR = social(s.city).sponsor
  const mixTotal = SPONSOR.mix.flowers + SPONSOR.mix.edible + SPONSOR.mix.tree
  return (
    <div className="screen sponsor">
      <div className="s-head">
        <div className="row between">
          <button className="iconbtn" style={{ background: 'transparent', borderColor: 'var(--sand)', color: 'var(--sand)' }} onClick={() => nav(-1)} aria-label="Back"><ArrowLeft size={18} /></button>
          <span style={{ fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', opacity: 0.8 }}>Sponsor space · demo</span>
        </div>
        <h1 style={{ fontSize: 28, marginTop: 14 }}>{c.demoSponsor}</h1>
        <p style={{ opacity: 0.85, marginTop: 4 }}>Season 2026 · {c.label}</p>
      </div>
      <div className="pad stack">
        <div className="kpis">
          <div className="kpi"><b>{SPONSOR.funded}</b><span className="small">plantings funded</span></div>
          <div className="kpi"><b>{SPONSOR.planted}</b><span className="small">planted & photographed</span></div>
          <div className="kpi"><b>{SPONSOR.players.toLocaleString('en')}</b><span className="small">players trained</span></div>
          <div className="kpi"><b>{SPONSOR.avgScore}/100</b><span className="small">average care score</span></div>
        </div>

        <div className="s-card stack" style={{ gap: 10 }}>
          <h3>Progress by neighbourhood</h3>
          {SPONSOR.hoods.map((h) => (
            <div key={h.name}>
              <div className="row between small"><span>{h.name}</span><span>{h.planted}/{h.funded} planted</span></div>
              <div className="bar"><i style={{ width: `${(h.planted / h.funded) * 100}%` }} /></div>
            </div>
          ))}
        </div>

        <div className="s-card">
          <h3 style={{ marginBottom: 8 }}>Planting mix</h3>
          <div style={{ display: 'flex', height: 14, borderRadius: 7, overflow: 'hidden' }}>
            <i style={{ width: `${(SPONSOR.mix.flowers / mixTotal) * 100}%`, background: '#e0a526' }} />
            <i style={{ width: `${(SPONSOR.mix.edible / mixTotal) * 100}%`, background: 'var(--moss)' }} />
            <i style={{ width: `${(SPONSOR.mix.tree / mixTotal) * 100}%`, background: 'var(--forest)' }} />
          </div>
          <div className="row small" style={{ gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
            <span style={{ color: '#b07f12' }}>■ Pollinator flowers {SPONSOR.mix.flowers}</span>
            <span style={{ color: 'var(--moss)' }}>■ Edible {SPONSOR.mix.edible}</span>
            <span style={{ color: 'var(--forest)' }}>■ Trees {SPONSOR.mix.tree}</span>
          </div>
        </div>

        <div className="s-card">
          <h3 style={{ marginBottom: 6 }}>Latest verified plantings</h3>
          <table>
            <thead><tr><th>Spot</th><th>Plant</th><th>Status</th></tr></thead>
            <tbody>
              {SPONSOR.latest.map(([spot, plant, status]) => <tr key={spot}><td>{spot}</td><td>{plant}</td><td>{status}</td></tr>)}
            </tbody>
          </table>
        </div>

        <div className="s-card stack" style={{ gap: 6 }}>
          <h3>Visibility</h3>
          <p className="small">{SPONSOR.missions.toLocaleString('en')} missions played · {SPONSOR.shares} story shares carrying your name · logo on every partner photo update.</p>
          <p className="small" style={{ color: '#5d625b' }}>{c.framework}</p>
        </div>
        <button className="s-btn row" style={{ justifyContent: 'center', gap: 8 }} onClick={() => alert('Demo: the impact report (PDF) would be generated here.')}><Download size={16} /> Download impact report</button>
        <p className="small" style={{ color: '#5d625b' }}>Illustrative figures for the prototype. Sponsor name is fictional.</p>
      </div>
    </div>
  )
}
