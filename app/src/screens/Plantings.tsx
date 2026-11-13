import { useNavigate } from 'react-router-dom'
import { Camera, Check, MapPin, Wrench } from 'lucide-react'
import { CONFIG } from '../config'
import { HOOD_SUMMARY, distM, walkMin } from '../data/hoods'
import { TYPE_LABEL } from '../data/plants'
import { useGame, type Planting } from '../state'
import { Tabs, TopBar } from '../components/Shell'
import { PlantArt } from '../components/Art'

/** 3-year follow-up by the partner NGO (2 inspections a year). Months after the tree was earned. */
const STEPS = [
  { m: 0, label: 'Planted', when: 'within 3 weeks' },
  { m: 1, label: 'Verified', when: '1st inspection' },
  { m: 4, label: 'First summer', when: 'May–Oct watering' },
  { m: 12, label: 'Year 1', when: '2 inspections' },
  { m: 24, label: 'Year 2', when: '2 inspections' },
  { m: 36, label: 'Year 3', when: 'end of NGO care' },
]
const MAX_MONTHS = CONFIG.careYears * 12

/** Demo: trees earned earlier are a bit older (6 months apart), on top of the time-travel slider. */
const ageOf = (i: number, n: number, months: number) => Math.min(MAX_MONTHS, months + (n - 1 - i) * 6)

/** Impact shown as simple, physical facts (illustrative for the prototype). */
function impact(p: Planting, months: number) {
  return [
    ['Shade', months >= 24 ? 'Growing canopy' : months >= 12 ? 'First shade' : 'Too young yet'],
    ['Inspections', `${Math.min(CONFIG.careYears * CONFIG.inspectionsPerYear, Math.floor(months / 6) + (months >= 1 ? 1 : 0))}/${CONFIG.careYears * CONFIG.inspectionsPerYear}`],
    ['Status', months >= MAX_MONTHS ? 'Established ✓' : 'Alive · in NGO care'],
  ] as [string, string][]
}

export function Frise({ age }: { age: number }) {
  const doneN = STEPS.filter((st) => age >= st.m).length
  return (
    <div>
      <ol className="frise" aria-label="3-year follow-up">
        <span className="fill" aria-hidden style={{ width: `${(Math.max(0, doneN - 1) / (STEPS.length - 1)) * 83.33}%` }} />
        {STEPS.map((st, i) => {
          const done = age >= st.m
          const next = !done && i === doneN
          return (
            <li key={st.m} className={done ? 'done' : next ? 'next' : ''} aria-label={`${st.label}: ${done ? 'done' : 'to come'}`}>
              <span className="dot">{done ? <Check size={14} strokeWidth={3} /> : null}</span>
              <span>{st.label}</span>
              <span className="when">{st.when}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export default function Plantings() {
  const { s, set } = useGame()
  const nav = useNavigate()
  const months = s.monthsAhead
  const n = s.plantings.length
  const full = n >= CONFIG.maxPlantings
  const stage = (m: number) => (m >= 24 ? 4 : m >= 12 ? 3 : m >= 1 ? 2 : 1)
  return (
    <>
    <div className="screen with-tabs">
      <TopBar title="My trees" right={<span className="chip sun">{n}/{CONFIG.maxPlantings} trees earned</span>} />
      <div className="pad stack" style={{ paddingTop: 4 }}>
        {full && (
          <div className="card shadow row" style={{ background: 'var(--lilac)', alignItems: 'flex-start' }} role="status">
            <Wrench size={20} style={{ flex: 'none', marginTop: 2 }} />
            <div><b>4/4 trees earned — you're in maintenance mode.</b><p className="small" style={{ marginTop: 4 }}>No more new trees: missions on the map become watering missions for young neighbourhood trees. Win them to earn the Tree Keeper and Block Guardian badges.</p></div>
          </div>
        )}
        {n === 0 ? (
          <div className="card shadow stack center" style={{ padding: 24 }}>
            <div style={{ display: 'grid', placeItems: 'center' }}><PlantArt stage={0} w={120} /></div>
            <h2>No tree yet</h2>
            <p>Win a mission on the map to earn your first real street tree, on your block. You can earn up to {CONFIG.maxPlantings}.</p>
            <button className="btn primary block" onClick={() => nav('/map')}>Find a mission</button>
          </div>
        ) : (
          <>
            <div className="card soft stack" style={{ gap: 6 }}>
              <div className="row between"><span className="tiny muted">Demo · time travel</span><b>{months === 0 ? 'Today' : `+${months} month${months > 1 ? 's' : ''}`}</b></div>
              <input type="range" min={0} max={MAX_MONTHS} step={1} value={months} onChange={(e) => set({ monthsAhead: Number(e.target.value) })} aria-label="Simulate months after planting" />
              <p className="small muted">Slide to follow the {CONFIG.careYears} years of NGO care ({CONFIG.inspectionsPerYear} inspections a year). Demo data.</p>
            </div>
            {s.plantings.map((p, i) => {
              const d = s.player ? distM(s.player, [p.lat, p.lon]) : 0
              const age = ageOf(i, n, months)
              return (
                <article key={p.id} className="card shadow stack" style={{ gap: 12 }}>
                  <div>
                    <span className="tiny muted">Tree #{i + 1}/{CONFIG.maxPlantings} · {TYPE_LABEL[p.type]} · {p.plantName}</span>
                    <h2>“{p.name}”</h2>
                    <div className="row small muted" style={{ gap: 4 }}><MapPin size={14} /> {p.addr ?? 'Street spot'}, {HOOD_SUMMARY[p.hoodId]?.name} · {walkMin(d)} min walk</div>
                  </div>
                  <div className="post-media" style={{ position: 'relative', background: '#fff' }}>
                    <div style={{ display: 'grid', placeItems: 'center', padding: 8 }}><PlantArt stage={stage(age)} w={200} bg={false} variant={i} label={`${p.name}, ${p.plantName}, ${stage(age) >= 2 ? 'growing' : 'just planted'}`} /></div>
                    <span className="chip" style={{ position: 'absolute', left: 10, bottom: 10, fontSize: 11 }}><Camera size={13} /> {age === 0 ? 'Planned pit' : `NGO inspection photo · month ${age}`}</span>
                  </div>
                  <Frise age={age} />
                  <div className="row" style={{ gap: 8 }}>
                    {impact(p, age).map(([k, v]) => (
                      <div key={k} className="card soft" style={{ flex: 1, padding: 8 }}><div className="tiny muted">{k}</div><div className="small" style={{ fontWeight: 700 }}>{v}</div></div>
                    ))}
                  </div>
                  <p className="small muted">{p.plantName} (<i>{p.latin}</i>) · planted and cared for by {p.partner} (demo NGO) · Your score: {p.score}/100</p>
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
