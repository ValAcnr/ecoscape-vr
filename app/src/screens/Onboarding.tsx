import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { CONFIG, city } from '../config'
import { useGame } from '../state'
import { PlantArt } from '../components/Art'

function HeatArt() {
  return (
    <svg viewBox="0 0 320 300" role="img" aria-label="A hot, paved street with few plants">
      <rect width="320" height="300" rx="28" fill="#fff1c9" />
      <circle cx="250" cy="62" r="34" fill="#ffc533" stroke="#161320" strokeWidth="3" />
      <g stroke="#161320" strokeWidth="3" strokeLinecap="round"><path d="M250 12v10M250 102v10M200 62h10M290 62h10M215 27l7 7M278 90l7 7M215 97l7-7M278 34l7-7" /></g>
      <rect x="30" y="90" width="70" height="150" fill="#d6c7a6" stroke="#161320" strokeWidth="3" />
      <rect x="110" y="120" width="80" height="120" fill="#e8dcc0" stroke="#161320" strokeWidth="3" />
      <g fill="#161320" opacity=".7"><rect x="44" y="108" width="14" height="18" /><rect x="70" y="108" width="14" height="18" /><rect x="44" y="140" width="14" height="18" /><rect x="70" y="140" width="14" height="18" /><rect x="126" y="138" width="16" height="18" /><rect x="156" y="138" width="16" height="18" /></g>
      <rect x="0" y="240" width="320" height="60" fill="#9c9488" />
      <path d="M20 270h40M90 270h40M160 270h40M230 270h40" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      <g fill="none" stroke="#ff6f91" strokeWidth="4" strokeLinecap="round"><path d="M215 225c8-10-8-18 0-28s-8-18 0-28" /><path d="M245 225c8-10-8-18 0-28s-8-18 0-28" /><path d="M275 225c8-10-8-18 0-28s-8-18 0-28" /></g>
      <text x="216" y="160" fontFamily="Bricolage Grotesque" fontWeight="800" fontSize="30" fill="#161320">+°C</text>
    </svg>
  )
}

function EarnArt() {
  return (
    <svg viewBox="0 0 320 300" role="img" aria-label="Phone with a mini-game, arrow to a real planting">
      <rect width="320" height="300" rx="28" fill="#e9e1ff" />
      <rect x="28" y="40" width="120" height="220" rx="22" fill="#161320" />
      <rect x="38" y="52" width="100" height="196" rx="14" fill="#fff8e6" />
      <rect x="50" y="70" width="76" height="10" rx="5" fill="#161320" />
      <rect x="50" y="90" width="76" height="40" rx="10" fill="#ffc533" stroke="#161320" strokeWidth="2.5" />
      <rect x="50" y="138" width="76" height="40" rx="10" fill="#fff" stroke="#161320" strokeWidth="2.5" />
      <rect x="50" y="186" width="76" height="40" rx="10" fill="#fff" stroke="#161320" strokeWidth="2.5" />
      <path d="M62 110l8 8 14-16" stroke="#161320" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M160 150h40" stroke="#161320" strokeWidth="5" strokeLinecap="round" /><path d="M190 136l16 14-16 14" stroke="#161320" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Onboarding() {
  const [i, setI] = useState(0)
  const nav = useNavigate()
  const { s, set } = useGame()
  const c = city(s.city)
  const slides = [
    {
      art: <HeatArt />,
      kicker: 'The problem',
      title: <>Our streets are <span style={{ background: 'var(--petal)', padding: '0 4px' }}>too hot</span>, and bees go hungry.</>,
      body: (
        <>
          <p><b style={{ fontFamily: 'var(--f-display)', fontSize: 28 }}>{c.problem.stat}</b> {c.problem.caption}</p>
          <p className="small muted" style={{ marginTop: 6 }}>Source: {c.problem.source}</p>
        </>
      ),
    },
    {
      art: (
        <div style={{ position: 'relative', width: '100%' }}>
          <EarnArt />
          <div style={{ position: 'absolute', right: '6%', top: '28%', width: '34%' }}><PlantArt type="flowers" stage={3} w={120} /></div>
        </div>
      ),
      kicker: 'Earn-to-Plant',
      title: <>Don't buy a plant. <span style={{ background: 'var(--honey)', padding: '0 4px' }}>Earn it.</span></>,
      body: <p>Play a short mission on a real spot near you: pick the right plant, water it well, care for the soil. Win, and a local association plants it <b>for real, on your street</b> — go and see it grow.</p>,
    },
    {
      art: (
        <svg viewBox="0 0 320 300" role="img" aria-label="Four seed slots">
          <rect width="320" height="300" rx="28" fill="#d9f2e4" />
          {[0, 1, 2, 3].map((k) => (
            <g key={k} transform={`translate(${40 + k * 64} 110)`}>
              <rect width="52" height="52" rx="16" fill={k < 2 ? '#ffc533' : '#fff'} stroke="#161320" strokeWidth="3" />
              {k < 2 && <path d="M26 40V20M26 28c-8 0-12-6-12-10 6 0 12 3 12 10zM26 24c6 0 10-5 10-9-6 0-10 3-10 9z" fill="#2fa36b" stroke="#161320" strokeWidth="2" />}
              <text x="26" y="80" textAnchor="middle" fontFamily="DM Sans" fontWeight="700" fontSize="14" fill="#161320">{k + 1}</text>
            </g>
          ))}
          <text x="160" y="235" textAnchor="middle" fontFamily="Bricolage Grotesque" fontWeight="800" fontSize="22" fill="#161320">4 seeds. Make them count.</text>
        </svg>
      ),
      kicker: 'The rule',
      title: <>{CONFIG.maxPlantings} real plantings per person.</>,
      body: <p>Fewer plantings, better care: partners follow every one, and you get photo updates. After your 4th, keep playing to adopt and care for plants in your neighbourhood.</p>,
    },
  ]
  const sl = slides[i]
  const next = () => {
    if (i < slides.length - 1) return setI(i + 1)
    set({ onboarded: true })
    nav('/hood')
  }
  return (
    <div className="screen onb">
      <div className="row between" style={{ padding: '14px 16px 0' }}>
        <span className="pill-tag">ECOSCAPE · PROTOTYPE</span>
        <button className="btn ghost" onClick={() => { set({ onboarded: true }); nav('/hood') }}>Skip</button>
      </div>
      <div className="art" key={i} style={{ animation: 'up .3s ease' }}>{sl.art}</div>
      <div className="copy stack">
        <span className="tiny muted">{sl.kicker} · {i + 1}/3</span>
        <h1>{sl.title}</h1>
        <div className="stack" style={{ gap: 6 }}>{sl.body}</div>
      </div>
      <div className="dots" aria-hidden>{slides.map((_, k) => <span key={k} className={k === i ? 'on' : ''} />)}</div>
      <div style={{ padding: '0 16px 20px' }}>
        <button className="btn primary block" onClick={next}>{i < 2 ? 'Next' : 'Choose my neighbourhood'} <ArrowRight size={18} /></button>
      </div>
    </div>
  )
}
