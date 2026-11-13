import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download } from 'lucide-react'
import { city } from '../config'
import { social } from '../data/social'
import { useGame } from '../state'

/** Sponsor space — quieter treatment of the same palette, for B2B credibility. Demo numbers. */
export default function Sponsor() {
  const nav = useNavigate()
  const { s } = useGame()
  const c = city(s.city)
  const SPONSOR = social(s.city).sponsor
  const mixTotal = SPONSOR.species.reduce((n, [, v]) => n + v, 0)
  const MIX_COLORS = ['var(--forest)', 'var(--moss)', '#b98a66', '#a9bfac', '#d9bfa2']
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
          <div className="kpi"><b>{SPONSOR.funded}</b><span className="small">street trees funded</span></div>
          <div className="kpi"><b>{SPONSOR.alive}/{SPONSOR.planted}</b><span className="small">planted trees still alive</span></div>
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
          <h3 style={{ marginBottom: 8 }}>Species mix</h3>
          <div style={{ display: 'flex', height: 14, borderRadius: 7, overflow: 'hidden' }}>
            {SPONSOR.species.map(([k, v], i) => <i key={k} style={{ width: `${(v / mixTotal) * 100}%`, background: MIX_COLORS[i % MIX_COLORS.length] }} />)}
          </div>
          <div className="row small" style={{ gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
            {SPONSOR.species.map(([k, v], i) => <span key={k}><span style={{ color: MIX_COLORS[i % MIX_COLORS.length] }}>■</span> {k} {v}</span>)}
          </div>
        </div>

        <div className="s-card">
          <h3 style={{ marginBottom: 6 }}>Latest NGO inspections</h3>
          <table>
            <thead><tr><th>Spot</th><th>Species</th><th>Status</th></tr></thead>
            <tbody>
              {SPONSOR.latest.map(([spot, plant, status]) => <tr key={spot}><td>{spot}</td><td>{plant}</td><td>{status}</td></tr>)}
            </tbody>
          </table>
        </div>

        <div className="s-card stack" style={{ gap: 6 }}>
          <h3>Visibility</h3>
          <p className="small">{SPONSOR.missions.toLocaleString('en')} missions played · {SPONSOR.shares} story shares carrying your name · logo on every NGO inspection photo.</p>
          <p className="small" style={{ color: '#5d625b' }}>{c.framework}</p>
        </div>
        <button className="s-btn row" style={{ justifyContent: 'center', gap: 8 }} onClick={() => alert('Demo: the impact report (PDF) would be generated here.')}><Download size={16} /> Download impact report</button>
        <p className="small" style={{ color: '#5d625b' }}>Illustrative figures for the prototype. Sponsor name is fictional.</p>
      </div>
    </div>
  )
}
