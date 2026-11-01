import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Footprints, GraduationCap, MapPin, Pencil, Share2, Users } from 'lucide-react'
import { CONFIG } from '../config'
import { HOOD_SUMMARY, distM, walkMin } from '../data/hoods'
import { TYPE_LABEL } from '../data/plants'
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
  const confetti = useMemo(() => Array.from({ length: 40 }, (_, i) => ({ left: Math.random() * 100, delay: Math.random() * 0.8, dur: 2 + Math.random() * 1.6, color: ['#FFC533', '#FF6F91', '#B9A4FF', '#2FA36B', '#161320'][i % 5] })), [])
  useEffect(() => { if (!p) nav('/plantings', { replace: true }) }, [p, nav])
  if (!p) return null

  const home = HOOD_SUMMARY[p.hoodId]
  const d = s.player ? distM(s.player, [p.lat, p.lon]) : 0
  const saveName = () => {
    set((st) => ({ plantings: st.plantings.map((x) => (x.id === p.id ? { ...x, name: name.trim() || x.name } : x)) }))
    setEditing(false)
  }
  const share = async () => {
    const blob = await makeStory({ ...p, name }, home?.name ?? '', idx + 1, CONFIG.maxPlantings)
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
        <span className="pill-tag" style={{ justifySelf: 'start' }}>PLANTING UNLOCKED</span>
        <h1 style={{ fontSize: 38 }}>Your planting #{idx + 1}/{CONFIG.maxPlantings} is validated!</h1>
        <div className="card shadow stack" style={{ gap: 10 }}>
          <div className="row" style={{ alignItems: 'flex-start' }}>
            <PlantArt type={p.type} stage={1} w={84} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <span className="tiny muted">{TYPE_LABEL[p.type]} · {p.plantName}</span>
              {editing ? (
                <div className="row" style={{ marginTop: 4 }}>
                  <input aria-label="Planting name" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} style={{ flex: 1, minWidth: 0, font: '700 17px var(--f-body)', padding: '8px 10px', border: '2px solid var(--ink)', borderRadius: 10 }} autoFocus />
                  <button className="btn primary" style={{ minHeight: 40, padding: '8px 12px' }} onClick={saveName}>OK</button>
                </div>
              ) : (
                <button className="row" style={{ background: 'none', border: 0, padding: 0, textAlign: 'left' }} onClick={() => setEditing(true)} aria-label="Rename planting">
                  <h2>“{name}”</h2><Pencil size={16} />
                </button>
              )}
              <p className="small muted"><i>{p.latin}</i></p>
            </div>
          </div>
          <div className="row small" style={{ gap: 6 }}><MapPin size={16} /> {p.addr ?? 'Street spot'}, {home?.name} · GPS {p.lat.toFixed(5)}, {p.lon.toFixed(5)}</div>
          <div className="row small" style={{ gap: 6 }}><Users size={16} /> Planted by <b>{p.partner}</b> <span className="muted">(demo partner)</span> within 3 weeks</div>
        </div>

        <div className="card stack" style={{ gap: 12 }}>
          <h3>Why this is different</h3>
          <div className="diff"><span className="ico"><GraduationCap size={18} /></span><div><b>Earned, not bought.</b><br /><span className="small">You won it with a score of {p.score}/100 — you know how to care for it.</span></div></div>
          <div className="diff"><span className="ico" style={{ background: '#9be2b9' }}><Footprints size={18} /></span><div><b>It's on your street.</b><br /><span className="small">{walkMin(d)} min walk from you. Go and see it grow.</span></div></div>
          <div className="diff"><span className="ico" style={{ background: 'var(--lilac)' }}><Users size={18} /></span><div><b>Your neighbours will see it.</b><br /><span className="small">It joins the {home?.name} feed and this week's challenge.</span></div></div>
        </div>

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
