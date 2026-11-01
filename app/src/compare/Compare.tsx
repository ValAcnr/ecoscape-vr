import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CONFIG, city } from '../config'
import { loadHood } from '../data/hoods'
import { useGame } from '../state'
import { Logo } from '../components/Art'

const BASE = import.meta.env.BASE_URL
const STEPS = [
  { id: 'discover', label: '1 · Discover', mobile: '#/welcome', vr: '#/vr/hub', what: 'Onboarding: the heat & biodiversity problem, Earn-to-Plant, the 4-planting rule.' },
  { id: 'explore', label: '2 · Explore', mobile: '#/map', vr: '#/vr/hood', what: 'Real neighbourhood: hot spots, street trees, missions on real streets.' },
  { id: 'learn', label: '3 · Learn & play', mobile: '#/mission/belleville-m1', vr: '#/vr/game', what: 'Mini-game: choose the right plant for sun & soil, water it, care for it.' },
  { id: 'unlock', label: '4 · Unlock & follow', mobile: '#/plantings', vr: '#/vr/unlock', what: 'A real planting, named and geolocated, planted by a local partner.' },
]

export default function Compare() {
  const { s, set } = useGame()
  const [step, setStep] = useState(STEPS[1])
  const [ready, setReady] = useState(false)

  // Make sure the embedded mobile app has a neighbourhood and is standing next to the demo mission.
  useEffect(() => {
    if (s.onboarded && s.hoodId === 'belleville' && s.player) { setReady(true); return }
    loadHood('belleville').then((h) => {
      const m = h.missions[0]
      // Seed one demo planting (same spot as the VR scene) so the 'Unlock & follow' step is not empty
      const demo = s.plantings.length ? {} : { plantings: [{ id: 'pl-demo', missionId: m.id, hoodId: 'belleville', type: 'flowers' as const, plantId: 'knautia', plantName: 'Field scabious', latin: 'Knautia arvensis', name: 'Bee Corner Parmentier', lat: m.lat, lon: m.lon, addr: m.addr, partner: city('paris').demoPartners[0], score: 85, createdAt: Date.now() }], monthsAhead: 3 }
      set({ onboarded: true, city: 'paris', hoodId: 'belleville', player: [m.lat - 0.00012, m.lon], ...demo })
      setTimeout(() => setReady(true), 50)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="compare" style={{ position: 'fixed', inset: 0, overflowY: 'auto' }}>
      <header style={{ maxWidth: 1280, margin: '0 auto 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div className="row"><Logo size={44} /><div><div className="tiny muted">EcoScape · student prototype</div><h1 style={{ fontSize: 'clamp(24px, 3vw, 36px)' }}>Mobile-web vs VR premium</h1></div></div>
        <div className="row wrap" style={{ gap: 8 }}>
          <Link className="btn" to="/map">Open mobile app</Link>
          <Link className="btn primary" to="/vr">Open VR</Link>
        </div>
      </header>
      <p style={{ maxWidth: 1280, margin: '0 auto 14px', color: 'var(--ink-2)' }}>Same game loop, same data, one web address. The mobile version works on any phone with zero install; the VR version adds an immersive layer on Meta Quest (and a 3D mode everywhere else).</p>

      <nav className="row wrap" style={{ maxWidth: 1280, margin: '0 auto 18px', gap: 8 }} aria-label="Journey step">
        {STEPS.map((st) => (
          <button key={st.id} className={`chip ${step.id === st.id ? 'sun' : ''}`} style={{ fontSize: 15, padding: '8px 14px' }} onClick={() => setStep(st)} aria-pressed={step.id === st.id}>{st.label}</button>
        ))}
        <span className="muted small" style={{ marginLeft: 6 }}>{step.what}</span>
      </nav>

      <div className="grid">
        <section aria-label="Mobile-web version">
          <div className="row between" style={{ marginBottom: 10 }}><h2>Mobile-web</h2><span className="chip sun">Any phone · no install</span></div>
          <div className="frame-phone">{ready && <iframe key={step.mobile} title="EcoScape mobile-web" src={`${BASE}${step.mobile}`} />}</div>
        </section>
        <section aria-label="VR premium version">
          <div className="row between" style={{ marginBottom: 10 }}><h2>VR premium</h2><span className="chip" style={{ background: 'var(--lilac)' }}>Meta Quest · WebXR · 3D fallback</span></div>
          <div className="frame-vr">{ready && <iframe key={step.vr} title="EcoScape VR premium" src={`${BASE}${step.vr}`} allow="xr-spatial-tracking; fullscreen" />}</div>

          <h3 style={{ margin: '22px 0 10px' }}>Screen by screen</h3>
          <table>
            <thead><tr><th>Step</th><th>Mobile-web</th><th>VR premium</th></tr></thead>
            <tbody>
              <tr><td><b>Discover</b></td><td>3 onboarding slides</td><td>Immersive hub</td></tr>
              <tr><td><b>Explore</b></td><td>2D/3D map: hot spots, trees, missions, neighbours' plantings</td><td>Tabletop diorama of the real streets (OpenStreetMap buildings, City trees)</td></tr>
              <tr><td><b>Learn & play</b></td><td>Choose · water (rhythm game) · soil care, scored /100</td><td>Pick the plant from pedestals, water it, watch bees arrive</td></tr>
              <tr><td><b>Unlock</b></td><td>Planting #n/{CONFIG.maxPlantings} screen + story to share</td><td>Immersive unlock with the same planting</td></tr>
              <tr><td><b>Follow & share</b></td><td>Partner photos, community feed, challenges, profile 4/4</td><td>— (done on the phone)</td></tr>
              <tr><td><b>Sponsor</b></td><td>Sponsor dashboard (quieter brand)</td><td>—</td></tr>
            </tbody>
          </table>

          <h3 style={{ margin: '22px 0 10px' }}>Who gets what</h3>
          <table>
            <thead><tr><th>Device</th><th>Experience</th></tr></thead>
            <tbody>
              <tr><td>iPhone (Safari)</td><td>Full game + 3D touch mode (no WebXR on iOS)</td></tr>
              <tr><td>Android (Chrome)</td><td>Full game + 3D touch mode</td></tr>
              <tr><td>Desktop</td><td>Full game + 3D mouse mode</td></tr>
              <tr><td>Meta Quest browser</td><td>Full game + immersive VR ("Enter VR")</td></tr>
            </tbody>
          </table>

          <h3 style={{ margin: '22px 0 10px' }}>Why it's not "buy a tree online"</h3>
          <div className="row wrap" style={{ gap: 8 }}>
            <span className="chip sun">Earned by learning, not bought</span>
            <span className="chip leaf">In your street — go and see it</span>
            <span className="chip" style={{ background: 'var(--lilac)' }}>A neighbourhood community</span>
          </div>
          <p className="small muted" style={{ marginTop: 14 }}>Demo data. Map © OpenStreetMap contributors · OpenFreeMap. Trees, permits & cool islands: Ville de Paris open data (ODbL). Partners and sponsors shown are fictional.</p>
        </section>
      </div>
    </div>
  )
}
