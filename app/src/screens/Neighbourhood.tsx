import { useNavigate } from 'react-router-dom'
import { Check, MapPin } from 'lucide-react'
import { CITIES, type CityId } from '../config'
import { HOOD_SUMMARY, loadHood } from '../data/hoods'
import { useGame } from '../state'
import { TopBar } from '../components/Shell'
import { useEffect, useState } from 'react'

export default function Neighbourhood() {
  const { s, set } = useGame()
  const nav = useNavigate()
  const [stats, setStats] = useState<Record<string, { trees: number; hot: number; permits: number; missions: number }>>({})
  const c = CITIES[s.city]

  useEffect(() => {
    c.hoods.forEach((id) =>
      loadHood(id).then((h) =>
        setStats((p) => ({ ...p, [id]: { trees: h.stats.trees, hot: h.heat.filter((x) => x.level === 3).length, permits: h.stats.permits ?? 0, missions: h.missions.length } })),
      ),
    )
  }, [c])

  const pick = async (id: string) => {
    const h = await loadHood(id)
    set({ hoodId: id, player: h.center })
    nav('/map')
  }

  return (
    <div className="screen">
      <TopBar title="Where do you live?" />
      <div className="pad stack" style={{ paddingTop: 4 }}>
        <div className="row" role="tablist" aria-label="City">
          {(Object.keys(CITIES) as CityId[]).map((id) => (
            <button key={id} role="tab" aria-selected={s.city === id} className={`chip ${s.city === id ? 'sun' : ''}`} onClick={() => set({ city: id, hoodId: null })}>
              {s.city === id && <Check size={14} />} {CITIES[id].label}
            </button>
          ))}
        </div>
        <p className="muted small">Pick your neighbourhood. Missions are real street spots, based on City open data.</p>
        {c.hoods.map((id) => {
          const h = HOOD_SUMMARY[id]
          const st = stats[id]
          const on = s.hoodId === id
          return (
            <button key={id} className="card shadow" style={{ textAlign: 'left', background: on ? 'var(--honey)' : 'var(--paper)' }} onClick={() => pick(id)}>
              <div className="row between">
                <div>
                  <h2>{h.name}</h2>
                  <div className="row small muted" style={{ gap: 4 }}><MapPin size={14} /> {h.district}</div>
                </div>
                <span className="chip hot">{st ? `${st.hot} hot spots` : '…'}</span>
              </div>
              <p style={{ margin: '8px 0 10px' }}>{h.blurb}</p>
              <div className="row wrap small" style={{ gap: 6 }}>
                <span className="chip leaf">{st ? st.trees.toLocaleString('en') : '…'} trees mapped</span>
                {s.city === 'paris' && <span className="chip">{st ? st.permits : '…'} vegetation permits</span>}
                <span className="chip sun">{st ? st.missions : '…'} missions</span>
              </div>
            </button>
          )
        })}
        <p className="small muted">Data: {s.city === 'paris' ? 'Ville de Paris — Paris Data (ODbL)' : 'NYC Open Data — NYC Parks Forestry Tree Points'}. Hot spots: prototype proxy based on the lowest street-tree density.</p>
      </div>
    </div>
  )
}
