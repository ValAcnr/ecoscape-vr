import { useNavigate } from 'react-router-dom'
import { Camera, Check, Clock, MapPin } from 'lucide-react'
import { CONFIG } from '../config'
import { HOOD_SUMMARY, distM, walkMin } from '../data/hoods'
import { TYPE_LABEL } from '../data/plants'
import { useGame, type Planting } from '../state'
import { Tabs, TopBar } from '../components/Shell'
import { PlantArt } from '../components/Art'

const STEPS = [
  { m: 0, label: 'Order sent to partner' },
  { m: 1, label: 'Planted — first photo' },
  { m: 3, label: '3-month check' },
  { m: 12, label: '1-year check' },
]

/** Impact shown as simple, physical facts (illustrative for the prototype). */
function impact(p: Planting, months: number) {
  if (p.type === 'tree') return [['Shade', months >= 12 ? 'Growing (young tree)' : 'Too young yet'], ['Pit area', '≈ 2 m² unpaved'], ['Species', p.plantName]]
  if (p.type === 'edible') return [['Harvest', months >= 3 ? 'First crops' : 'Not yet'], ['Planter', '≈ 1 m²'], ['For bees', months >= 1 ? 'Flowering herbs' : '—']]
  return [['Flowering', months >= 1 ? 'Yes' : 'Not yet'], ['Bed area', '≈ 1.5 m²'], ['Pesticides', 'None (charter)']]
}

export default function Plantings() {
  const { s, set } = useGame()
  const nav = useNavigate()
  const months = s.monthsAhead
  const stage = (m: number) => (m >= 12 ? 4 : m >= 3 ? 3 : m >= 1 ? 2 : 1)
  return (
    <>
    <div className="screen with-tabs">
      <TopBar title="My plantings" right={<span className="chip sun">{s.plantings.length}/{CONFIG.maxPlantings}</span>} />
      <div className="pad stack" style={{ paddingTop: 4 }}>
        {s.plantings.length === 0 ? (
          <div className="card shadow stack center" style={{ padding: 24 }}>
            <div style={{ display: 'grid', placeItems: 'center' }}><PlantArt type="flowers" stage={0} w={120} /></div>
            <h2>No planting yet</h2>
            <p>Win a mission on the map to unlock your first real planting, on your street.</p>
            <button className="btn primary block" onClick={() => nav('/map')}>Find a mission</button>
          </div>
        ) : (
          <>
            <div className="card soft stack" style={{ gap: 6 }}>
              <div className="row between"><span className="tiny muted">Demo · time travel</span><b>{months === 0 ? 'Today' : `+${months} month${months > 1 ? 's' : ''}`}</b></div>
              <input type="range" min={0} max={12} step={1} value={months} onChange={(e) => set({ monthsAhead: Number(e.target.value) })} aria-label="Simulate months after planting" />
              <p className="small muted">Slide to see partner photo updates over a year.</p>
            </div>
            {s.plantings.map((p, i) => {
              const d = s.player ? distM(s.player, [p.lat, p.lon]) : 0
              return (
                <article key={p.id} className="card shadow stack" style={{ gap: 10 }}>
                  <div className="row between" style={{ alignItems: 'flex-start' }}>
                    <div>
                      <span className="tiny muted">#{i + 1} · {TYPE_LABEL[p.type]}</span>
                      <h2>“{p.name}”</h2>
                      <div className="row small muted" style={{ gap: 4 }}><MapPin size={14} /> {p.addr ?? 'Street spot'}, {HOOD_SUMMARY[p.hoodId]?.name} · {walkMin(d)} min walk</div>
                    </div>
                  </div>
                  <div className="post-media" style={{ position: 'relative', background: '#fff' }}>
                    <div style={{ display: 'grid', placeItems: 'center', padding: 8 }}><PlantArt type={p.type} stage={stage(months)} w={220} bg={false} label={`${p.plantName}, ${stage(months) >= 2 ? 'growing' : 'just ordered'}`} /></div>
                    <span className="chip" style={{ position: 'absolute', left: 10, bottom: 10, fontSize: 11 }}><Camera size={13} /> {months === 0 ? 'Planned spot' : `Partner photo · month ${months}`}</span>
                  </div>
                  <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 6 }}>
                    {STEPS.map((st) => {
                      const done = months >= st.m
                      return (
                        <li key={st.m} className="row small" style={{ gap: 8, opacity: done ? 1 : 0.5 }}>
                          <span style={{ width: 22, height: 22, borderRadius: 7, border: '2px solid var(--ink)', display: 'grid', placeItems: 'center', background: done ? 'var(--leaf)' : '#fff', color: '#fff' }}>{done ? <Check size={14} /> : <Clock size={12} color="#161320" />}</span>
                          {st.label}{st.m === 0 && <span className="muted"> · {p.partner}</span>}
                        </li>
                      )
                    })}
                  </ol>
                  <div className="row" style={{ gap: 8 }}>
                    {impact(p, months).map(([k, v]) => (
                      <div key={k} className="card soft" style={{ flex: 1, padding: 8 }}><div className="tiny muted">{k}</div><div className="small" style={{ fontWeight: 700 }}>{v}</div></div>
                    ))}
                  </div>
                  <p className="small muted">Plant: {p.plantName} (<i>{p.latin}</i>) · Your score: {p.score}/100</p>
                </article>
              )
            })}
          </>
        )}
      </div>
    </div>
    <Tabs />
    </>
  )
}
