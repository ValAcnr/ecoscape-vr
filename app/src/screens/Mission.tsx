import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Droplets, RotateCcw, X } from 'lucide-react'
import { CONFIG, city } from '../config'
import { loadHood, type Hood, type Mission as M } from '../data/hoods'
import { EXPOSURE_LABEL, SITE_LABEL, SOIL_LABEL, TYPE_LABEL, type Plant } from '../data/plants'
import { PASS, candidates, careActions, explain, missionType, waterBand } from '../game/rules'
import { useGame, type Planting } from '../state'
import { PlantArt } from '../components/Art'

const WATER_SECONDS = 12

export default function Mission() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const { s, set, addBadge } = useGame()
  const [hood, setHood] = useState<Hood | null>(null)
  const [step, setStep] = useState(0)
  // scores
  const [pick, setPick] = useState<{ tries: string[]; done: boolean }>({ tries: [], done: false })
  const [waterScore, setWaterScore] = useState<number | null>(null)
  const [care, setCare] = useState<string[]>([])
  const [careDone, setCareDone] = useState(false)

  useEffect(() => { if (s.hoodId) loadHood(s.hoodId).then(setHood) }, [s.hoodId])
  const mission = hood?.missions.find((m) => m.id === id)
  const game = useMemo(() => (mission ? candidates(mission) : null), [mission])
  if (!hood || !mission || !game) return <div className="screen pad">Loading mission…</div>
  const type = missionType(mission)
  const correct = game.options.find((p) => p.id === game.correctId)!

  const choosePts = pick.done ? (pick.tries.length === 1 ? 40 : pick.tries.length === 2 ? 20 : 0) : 0
  const acts = careActions(type)
  const carePts = careDone ? Math.max(0, acts.reduce((n, a) => n + (care.includes(a.id) ? (a.good ? 12.5 : -12.5) : 0), 0)) : 0
  const total = Math.round(choosePts + (waterScore ?? 0) + carePts)
  const adopt = s.plantings.length >= CONFIG.maxPlantings

  const finish = () => {
    const passed = total >= PASS
    set((p) => ({ missionsPlayed: p.missionsPlayed + 1, missionsPassed: p.missionsPassed + (passed ? 1 : 0), bestScore: Math.max(p.bestScore, total) }))
    if (total >= 90) addBadge('perfect')
    if ((waterScore ?? 0) >= 32) addBadge('water')
    if (!passed) return setStep(4)
    if (adopt) return setStep(4)
    const partners = city(s.city).demoPartners
    const pl: Planting = {
      id: `pl-${Date.now()}`, missionId: mission.id, hoodId: hood.id, type, plantId: correct.id, plantName: correct.common, latin: correct.latin,
      name: `${correct.common.split(' ')[0]} ${mission.addr ? 'on ' + mission.addr.replace(/^(Rue|Avenue|Boulevard|Place) (de la |du |des |de l'|de |d')?/, '') : 'corner'}`,
      lat: mission.lat, lon: mission.lon, addr: mission.addr, partner: partners[s.plantings.length % partners.length], score: total, createdAt: Date.now(),
    }
    set((p) => ({ plantings: [...p.plantings, pl] }))
    addBadge('first')
    addBadge(type === 'flowers' ? 'bee' : type === 'tree' ? 'shade' : 'grower')
    if (s.plantings.length + 1 >= CONFIG.maxPlantings) addBadge('full')
    nav(`/unlock/${pl.id}`, { replace: true })
  }

  return (
    <div className="screen">
      <header className="topbar">
        <button className="iconbtn" onClick={() => nav('/map')} aria-label="Back to map"><ArrowLeft size={18} /></button>
        <div className="progress" style={{ flex: 1, margin: '0 10px' }} aria-label={`Step ${Math.min(step, 3)} of 3`}>
          {[1, 2, 3].map((k) => <span key={k} className={step >= k ? 'on' : ''} />)}
        </div>
        <span className="chip sun" aria-label="Score">{total} pts</span>
      </header>

      {step === 0 && <Brief m={mission} onGo={() => setStep(1)} adopt={adopt} />}

      {step === 1 && (
        <div className="pad stack">
          <span className="tiny muted">Step 1 · Choose the right plant</span>
          <h2>Which one will thrive here?</h2>
          <Conditions m={mission} />
          {game.options.map((p) => {
            const tried = pick.tries.includes(p.id)
            const isRight = p.id === game.correctId
            const cls = tried ? (isRight ? 'right' : 'wrong') : ''
            return (
              <button key={p.id} className={`option ${cls}`} disabled={pick.done || tried} onClick={() => setPick((x) => ({ tries: [...x.tries, p.id], done: isRight }))}>
                <PlantArt type={type} stage={3} w={64} label={p.common} />
                <div>
                  <div className="row between"><h3>{p.common}</h3>{tried && (isRight ? <Check size={20} /> : <X size={20} />)}</div>
                  <div className="small muted"><i>{p.latin}</i></div>
                  <div className="row wrap" style={{ gap: 4, marginTop: 6 }}>
                    {p.exposure.map((e) => <span key={e} className={`chip ${e}`} style={{ fontSize: 11, padding: '2px 7px' }}>{EXPOSURE_LABEL[e]}</span>)}
                    {p.soil.map((e) => <span key={e} className="chip" style={{ fontSize: 11, padding: '2px 7px' }}>{SOIL_LABEL[e]}</span>)}
                  </div>
                  {tried && <p className="small" style={{ marginTop: 6 }}>{explain(p, mission)}</p>}
                </div>
              </button>
            )
          })}
          <p className="small muted">{type === 'tree' ? 'Tree data: City of Paris tree-species guide (open data).' : 'Simplified for the game. Charter: local, bee-friendly plants only.'}</p>
          <button className="btn primary block" disabled={!pick.done} onClick={() => setStep(2)}>Plant it — next: watering</button>
        </div>
      )}

      {step === 2 && <Water m={mission} plant={correct} onDone={(pts) => { setWaterScore(pts); setStep(3) }} />}

      {step === 3 && (
        <div className="pad stack">
          <span className="tiny muted">Step 3 · Look after the soil</span>
          <h2>Pick the 2 right care actions</h2>
          {acts.map((a) => {
            const on = care.includes(a.id)
            return (
              <div key={a.id}>
                <button className={`check ${on ? 'on' : ''}`} disabled={careDone} aria-pressed={on} onClick={() => setCare((c) => (on ? c.filter((x) => x !== a.id) : c.length < 2 ? [...c, a.id] : c))}>
                  <span className="box">{on && <Check size={16} />}</span>
                  <span style={{ fontWeight: 700 }}>{a.label}</span>
                </button>
                {careDone && (on || a.good) && <p className="small" style={{ margin: '4px 6px 0', color: a.good ? 'var(--leaf-dark)' : '#c2264f' }}>{a.good ? '✓ ' : '✗ '}{a.why}</p>}
              </div>
            )
          })}
          {!careDone ? (
            <button className="btn primary block" disabled={care.length < 2} onClick={() => setCareDone(true)}>Check</button>
          ) : (
            <button className="btn honey block" onClick={finish}>See my result</button>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="pad stack center" style={{ paddingTop: 30 }}>
          <ScoreRing value={total} />
          {total >= PASS ? (
            <>
              <h2>Adopt mode: great care!</h2>
              <p>You've already unlocked your {CONFIG.maxPlantings} plantings. This win adds care points and helps your neighbourhood challenge.</p>
            </>
          ) : (
            <>
              <h2>Almost! {PASS} needed.</h2>
              <p>Plants are living things — try again, you'll get it. Tip: read the spot's sun and soil first.</p>
            </>
          )}
          <div className="row" style={{ justifyContent: 'center' }}>
            <button className="btn" onClick={() => { setStep(1); setPick({ tries: [], done: false }); setWaterScore(null); setCare([]); setCareDone(false) }}><RotateCcw size={16} /> Try again</button>
            <button className="btn primary" onClick={() => nav('/map')}>Back to map</button>
          </div>
        </div>
      )}
    </div>
  )
}

function Conditions({ m }: { m: M }) {
  return (
    <div className="card row wrap" style={{ gap: 6 }}>
      <span className="small" style={{ fontWeight: 700, width: '100%' }}>{m.addr ?? 'Street spot'} · {SITE_LABEL[m.site]}</span>
      <span className={`chip ${m.exposure}`}>{EXPOSURE_LABEL[m.exposure]}</span>
      <span className="chip">{SOIL_LABEL[m.soil]}</span>
      <span className="chip hot">Heat {'●'.repeat(m.heat)}</span>
    </div>
  )
}

function Brief({ m, onGo, adopt }: { m: M; onGo: () => void; adopt: boolean }) {
  const type = missionType(m)
  return (
    <div className="pad stack">
      <div className="center" style={{ display: 'grid', placeItems: 'center' }}><PlantArt type={type} stage={0} w={150} /></div>
      <span className="tiny muted">Mission · {TYPE_LABEL[type]}</span>
      <h1>This corner needs you.</h1>
      <Conditions m={m} />
      <p>Three quick steps: <b>choose</b> the right plant, <b>water</b> at the right rhythm, <b>care</b> for the soil. Score {PASS}+ to {adopt ? 'earn care points (adopt mode)' : 'unlock a real planting right here'}.</p>
      <button className="btn primary block" onClick={onGo}>Start</button>
    </div>
  )
}

function Water({ m, plant, onDone }: { m: M; plant: Plant; onDone: (pts: number) => void }) {
  const [lo, hi] = waterBand(m)
  const [level, setLevel] = useState((lo + hi) / 2 - 15)
  const [t, setT] = useState(0)
  const [running, setRunning] = useState(false)
  const inBand = useRef(0)
  const ticks = useRef(0)
  const lv = useRef(level)
  lv.current = level

  useEffect(() => {
    if (!running) return
    const dryRate = m.heat >= 3 ? 1.9 : m.heat === 2 ? 1.6 : 1.3 // hotter spots dry faster
    const iv = setInterval(() => {
      ticks.current++
      const next = Math.max(0, lv.current - dryRate)
      if (next >= lo && next <= hi) inBand.current++
      setLevel(next)
      setT((x) => x + 0.1)
    }, 100)
    return () => clearInterval(iv)
  }, [running, lo, hi, m.heat])

  useEffect(() => {
    if (running && t >= WATER_SECONDS) {
      setRunning(false)
      onDone(Math.round((inBand.current / Math.max(1, ticks.current)) * 35))
    }
  }, [t, running, onDone])

  const water = () => {
    if (!running) setRunning(true)
    setLevel((x) => Math.min(100, x + 9))
  }
  const pct = ticks.current ? Math.round((inBand.current / ticks.current) * 100) : 0
  return (
    <div className="pad stack">
      <span className="tiny muted">Step 2 · Water at the right rhythm</span>
      <h2>Keep the soil in the green zone</h2>
      <p className="small muted">{plant.common} in {SOIL_LABEL[m.soil].toLowerCase()} — hot spots dry out faster. Don't drown it!</p>
      <div className="row" style={{ justifyContent: 'center', gap: 24, alignItems: 'flex-end', margin: '8px 0' }}>
        <div className="gauge" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(level)} aria-label="Soil moisture">
          <div className="water" style={{ height: `${level}%` }} />
          <div className="band" style={{ bottom: `${lo}%`, height: `${hi - lo}%` }} />
        </div>
        <div className="stack" style={{ gap: 4, minWidth: 110 }}>
          <div className="tiny muted">Time</div>
          <div style={{ fontFamily: 'var(--f-display)', fontWeight: 800, fontSize: 32 }}>{Math.max(0, WATER_SECONDS - t).toFixed(1)}s</div>
          <div className="tiny muted">In the zone</div>
          <div style={{ fontFamily: 'var(--f-display)', fontWeight: 800, fontSize: 24 }}>{pct}%</div>
          <div className="small" style={{ fontWeight: 700, color: level > hi ? '#2d6fd6' : level < lo ? '#c2264f' : 'var(--leaf-dark)' }}>{level > hi ? 'Too wet' : level < lo ? 'Too dry' : 'Perfect'}</div>
        </div>
      </div>
      <button className="btn honey block" style={{ minHeight: 64, fontSize: 18 }} onClick={water}><Droplets size={22} /> {running ? 'Water' : 'Tap to start watering'}</button>
    </div>
  )
}

function ScoreRing({ value }: { value: number }) {
  const r = 62
  const c = 2 * Math.PI * r
  return (
    <svg className="score-ring" viewBox="0 0 150 150" role="img" aria-label={`Score ${value} out of 100`} style={{ margin: '0 auto' }}>
      <circle cx="75" cy="75" r={r} fill="none" stroke="#eadfc3" strokeWidth="14" />
      <circle cx="75" cy="75" r={r} fill="none" stroke={value >= PASS ? 'var(--leaf)' : 'var(--petal)'} strokeWidth="14" strokeDasharray={`${(c * value) / 100} ${c}`} strokeLinecap="round" transform="rotate(-90 75 75)" />
      <text x="75" y="84" textAnchor="middle" fontFamily="Bricolage Grotesque" fontWeight="800" fontSize="36" fill="#161320">{value}</text>
    </svg>
  )
}
