import { useNavigate } from 'react-router-dom'
import { Building2, Footprints, GraduationCap, Glasses, RotateCcw, Users } from 'lucide-react'
import { CITIES, CONFIG, type CityId } from '../config'
import { HOOD_SUMMARY } from '../data/hoods'
import { BADGES, useGame } from '../state'
import { Tabs, TopBar } from '../components/Shell'

export default function Profile() {
  const { s, set, reset } = useGame()
  const nav = useNavigate()
  const left = CONFIG.maxPlantings - s.plantings.length
  return (
    <>
    <div className="screen with-tabs">
      <TopBar title="My profile" />
      <div className="pad stack" style={{ paddingTop: 4 }}>
        <div className="card shadow stack" style={{ background: 'var(--honey)', gap: 10 }}>
          <div className="row between">
            <div>
              <div className="tiny">Tree keeper of {s.hoodId ? HOOD_SUMMARY[s.hoodId]?.name : '—'}</div>
              <h2>Real street trees</h2>
            </div>
            <b style={{ fontFamily: 'var(--f-display)', fontSize: 40 }}>{s.plantings.length}/{CONFIG.maxPlantings}</b>
          </div>
          <div className="seeds" aria-label={`${s.plantings.length} of ${CONFIG.maxPlantings} trees earned`}>
            {Array.from({ length: CONFIG.maxPlantings }, (_, i) => (
              <div key={i} className={`seed ${i < s.plantings.length ? 'on' : ''}`} title={s.plantings[i]?.name}>{i < s.plantings.length ? '🌳' : i + 1}</div>
            ))}
          </div>
          <p className="small"><b>{s.plantings.length}/{CONFIG.maxPlantings} trees earned.</b> {left > 0 ? `${left} tree${left > 1 ? 's' : ''} left to earn — make them count.` : `That's the maximum: you're in maintenance mode. Missions become watering missions for young neighbourhood trees, with care badges to win (${s.careMissions} won so far).`}</p>
        </div>

        <div className="row" style={{ gap: 8 }}>
          {[['Missions', s.missionsPlayed], ['Won', s.missionsPassed], ['Best', s.bestScore], ['Shares', s.shares]].map(([k, v]) => (
            <div key={k as string} className="card" style={{ flex: 1, padding: 10, textAlign: 'center' }}><div style={{ fontFamily: 'var(--f-display)', fontWeight: 800, fontSize: 22 }}>{v}</div><div className="tiny muted">{k}</div></div>
          ))}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 8 }}>My badges</h3>
          <div className="row wrap" style={{ gap: 6 }}>
            {s.badges.length === 0 && <span className="small muted">Win a mission to earn your first badge.</span>}
            {s.badges.map((b) => <span key={b} className="badge" style={{ background: BADGES[b]?.color }}>{BADGES[b]?.label}</span>)}
          </div>
        </div>

        <div className="card stack" style={{ gap: 10 }}>
          <h3>Not another "buy a tree" app</h3>
          <div className="diff"><span className="ico"><GraduationCap size={18} /></span><p className="small"><b>You earn it by learning.</b> No payment: you pass a tree-care mission first.</p></div>
          <div className="diff"><span className="ico" style={{ background: '#a9bfac' }}><Footprints size={18} /></span><p className="small"><b>It's on your block,</b> not on another continent. You can visit it, and a partner NGO looks after it for {CONFIG.careYears} years.</p></div>
          <div className="diff"><span className="ico" style={{ background: 'var(--lilac)' }}><Users size={18} /></span><p className="small"><b>A neighbourhood community:</b> feed, challenges, shared care.</p></div>
        </div>

        <button className="card row between" onClick={() => nav('/vr')} style={{ textAlign: 'left' }}>
          <span className="row"><Glasses size={20} /><span><b>Try the VR premium version</b><br /><span className="small muted">Meta Quest, or 3D on any screen</span></span></span><span>→</span>
        </button>
        <button className="card row between" onClick={() => nav('/sponsor')} style={{ textAlign: 'left' }}>
          <span className="row"><Building2 size={20} /><span><b>Sponsor space</b><br /><span className="small muted">What companies see (demo)</span></span></span><span>→</span>
        </button>

        <div className="card soft stack" style={{ gap: 8 }}>
          <span className="tiny muted">Prototype settings</span>
          {CONFIG.showCityPicker ? (
            <div className="row" style={{ gap: 6 }}>
              <span className="small">City:</span>
              {(Object.keys(CITIES) as CityId[]).map((id) => (
                <button key={id} className={`chip ${s.city === id ? 'sun' : ''}`} onClick={() => { set({ city: id, hoodId: null }); nav('/hood') }}>{CITIES[id].label}</button>
              ))}
            </div>
          ) : <span className="small">City: <b>{CITIES[CONFIG.city].label}</b></span>}
          <button className="btn" onClick={() => { if (confirm('Reset the demo? Your trees and badges will be cleared on this device.')) { reset(); nav('/welcome') } }}><RotateCcw size={16} /> Reset demo</button>
          <p className="small muted">Your data stays on this device. Location is optional and never stored.</p>
        </div>
      </div>
    </div>
    <Tabs />
    </>
  )
}
