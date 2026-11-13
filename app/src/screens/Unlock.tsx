import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Footprints, GraduationCap, MapPin, Pencil, Share2, Users } from 'lucide-react'
import { CONFIG } from '../config'
import { HOOD_SUMMARY, distM, walkMin } from '../data/hoods'
import { TYPE_LABEL } from '../data/plants'
import { NAME_MAX, checkName, cleanName } from '../game/names'
import { useGame } from '../state'
import { PlantArt } from '../components/Art'
import { makeStory, shareStory } from '../components/story'

export default function Unlock() {
  const { pid } = useParams()
  const nav = useNavigate()
  const { s, set, addBadge } = useGame()
  const idx = s.plantings.findIndex((p) => p.id === pid)
  const p = s.plantings[idx]
  const [name, setName] = useState(p?.name ?? '')
  const [editing, setEditing] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const confetti = useMemo(() => Array.from({ length: 40 }, (_, i) => ({ left: Math.random() * 100, delay: Math.random() * 0.8, dur: 2 + Math.random() * 1.6, color: ['#cda88b', '#e6c7b2', '#a9bfac', '#1b603a', '#14281d'][i % 5] })), [])
  useEffect(() => { if (!p) nav('/plantings', { replace: true }) }, [p, nav])
  if (!p) return null

  const home = HOOD_SUMMARY[p.hoodId]
  const d = s.player ? distM(s.player, [p.lat, p.lon]) : 0
  const saveName = () => {
    const e = checkName(name)
    if (e) return setErr(e)
    set((st) => ({ plantings: st.plantings.map((x) => (x.id === p.id ? { ...x, name: cleanName(name) } : x)) }))
    setName(cleanName(name))
    setEditing(false)
  }
  const share = async () => {
    const blob = await makeStory(p, home?.name ?? '', idx + 1, CONFIG.maxPlantings)
    if (!blob) return
    const r = await shareStory(blob, name)
    set((st) => ({ shares: st.shares + 1 }))
    addBadge('sharer')
    setMsg(r === 'shared' ? 'Shared!' : 'Story image downloaded — post it on Instagram or TikTok.')
  }

  return (
    <div className="screen" style={{ background: 'var(--honey)' }}>
      <div className="confetti" aria-hidden>
        {confetti.map((c, i) => <i key={i} style={{ left: `${c.left}%`, background: c.color, animationDelay: `${c.delay}s`, animationDuration: `${c.dur}s` }} />)}
      </div>
      <div className="pad stack" style={{ paddingTop: 26 }}>
        <span className="pill-tag" style={{ justifySelf: 'start' }}>STREET TREE EARNED · {idx + 1}/{CONFIG.maxPlantings} TREES</span>
        <h1 style={{ fontSize: 36 }}>Your tree #{idx + 1}/{CONFIG.maxPlantings} is on its way!</h1>
        <div className="card shadow stack" style={{ gap: 10 }}>
          <div className="row" style={{ alignItems: 'flex-start' }}>
            <PlantArt type={p.type} stage={1} w={84} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <span className="tiny muted">{TYPE_LABEL[p.type]} · {p.plantName}</span>
              {editing ? (
                <form className="stack" style={{ marginTop: 4, gap: 4 }} onSubmit={(e) => { e.preventDefault(); saveName() }}>
                  <div className="row">
                    <input className="field" aria-label="Tree name" aria-invalid={!!err} value={name} maxLength={NAME_MAX + 6} onChange={(e) => { setName(e.target.value); setErr(null) }} style={{ flex: 1, minWidth: 0, fontSize: 17, padding: '8px 10px' }} autoFocus />
                    <button type="submit" className="btn primary" style={{ minHeight: 40, padding: '8px 12px' }}>OK</button>
                  </div>
                  {err && <p className="small" role="alert" style={{ color: '#8b3a2b', fontWeight: 700 }}>{err}</p>}
                </form>
              ) : (
                <button className="row" style={{ background: 'none', border: 0, padding: 0, textAlign: 'left' }} onClick={() => setEditing(true)} aria-label="Rename tree">
                  <h2>“{name}”</h2><Pencil size={16} />
                </button>
              )}
              <p className="small muted"><i>{p.latin}</i></p>
            </div>
          </div>
          <p className="small" style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}><MapPin size={16} style={{ flex: 'none', marginTop: 2 }} /><span>{p.addr ?? 'Street spot'}, {home?.name} · GPS {p.lat.toFixed(5)}, {p.lon.toFixed(5)}</span></p>
          <p className="small" style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}><Users size={16} style={{ flex: 'none', marginTop: 2 }} /><span>Planted within 3 weeks by <b>{p.partner}</b> <span className="muted">(demo NGO)</span>, then cared for {CONFIG.careYears} years with {CONFIG.inspectionsPerYear} inspections a year</span></p>
        </div>

        <div className="card stack" style={{ gap: 12 }}>
          <h3>Why this is different</h3>
          <div className="diff"><span className="ico"><GraduationCap size={18} /></span><div><b>Earned, not bought.</b><br /><span className="small">You won it with a score of {p.score}/100 — you know how to care for a street tree.</span></div></div>
          <div className="diff"><span className="ico" style={{ background: '#a9bfac' }}><Footprints size={18} /></span><div><b>It's on your block.</b><br /><span className="small">{walkMin(d)} min walk from you. Go and see it grow.</span></div></div>
          <div className="diff"><span className="ico" style={{ background: 'var(--lilac)' }}><Users size={18} /></span><div><b>Your neighbours will see it.</b><br /><span className="small">It joins the {home?.name} feed and this week's challenge.</span></div></div>
        </div>

        {idx + 1 >= CONFIG.maxPlantings && <div className="card" style={{ background: 'var(--lilac)' }}><b>That's your 4th tree — the maximum.</b><p className="small" style={{ marginTop: 4 }}>From now on you're in maintenance mode: missions become watering missions for young neighbourhood trees, with care badges to win.</p></div>}
        <button className="btn primary block" onClick={share}><Share2 size={18} /> Share my story</button>
        {msg && <p className="small center" role="status">{msg}</p>}
        <div className="row">
          <button className="btn block" onClick={() => nav('/plantings')}>Follow it</button>
          <button className="btn block" onClick={() => nav('/map')}>Back to map</button>
        </div>
      </div>
    </div>
  )
}
