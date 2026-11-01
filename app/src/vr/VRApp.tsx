import { Suspense, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Canvas, useThree } from '@react-three/fiber'
import { Float, OrbitControls, Sparkles } from '@react-three/drei'
import { NotInXR, XR, createXRStore, useXRSessionModeSupported } from '@react-three/xr'
import { Glasses, Smartphone } from 'lucide-react'
import { CONFIG, city } from '../config'
import { loadHood, type Mission } from '../data/hoods'
import { EXPOSURE_LABEL, SITE_LABEL, SOIL_LABEL } from '../data/plants'
import { candidates, explain, missionType } from '../game/rules'
import { useGame, type Planting } from '../state'
import { Logo } from '../components/Art'
import { isEmbed } from '../components/Shell'
import vr from '../data/vr-belleville.json'
import { Bee, Neighbourhood, Plant3D, toLocal } from './models'
import { Button3D, C, Chip, Label, Panel } from './ui3d'

const store = createXRStore({ emulate: false, hand: { teleportPointer: false }, controller: { teleportPointer: false } })
type Scene = 'hub' | 'hood' | 'game' | 'unlock'
const SCENES: { id: Scene; label: string }[] = [
  { id: 'hub', label: '1 · Hub' },
  { id: 'hood', label: '2 · Neighbourhood' },
  { id: 'game', label: '3 · Mission' },
  { id: 'unlock', label: '4 · Unlock' },
]
const DEFAULT_MISSION = vr.mission as Mission

/**
 * The VR mini-game plays the same mission as the phone: the Belleville mission last opened on mobile
 * (state.activeMissionId), or the demo mission (Avenue Parmentier) if none.
 */
function useVRMission(): Mission {
  const { s } = useGame()
  const [list, setList] = useState<Mission[] | null>(null)
  useEffect(() => { loadHood('belleville').then((h) => setList(h.missions)) }, [])
  return list?.find((m) => m.id === s.activeMissionId) ?? DEFAULT_MISSION
}
const DIORAMA_SCALE = 1 / 320

export default function VRApp() {
  const loc = useLocation()
  const nav = useNavigate()
  const scene = (loc.pathname.split('/')[2] as Scene) || 'hub'
  const go = (s: Scene) => nav(`/vr/${s}${isEmbed() ? '?embed' : ''}`)
  const vrSupported = useXRSessionModeSupported('immersive-vr')
  const embed = isEmbed()
  const mission = useVRMission()
  const plantNames = useMemo(() => candidates(mission).options.map((o) => o.common), [mission])

  return (
    <div style={{ position: 'fixed', inset: 0, background: C.sky }}>
      <Canvas camera={{ position: [0, 1.65, 1.1], fov: 60 }} shadows={false} dpr={[1, 1.75]}>
        <XR store={store}>
          <color attach="background" args={[C.sky]} />
          <hemisphereLight args={['#ffffff', '#e9dcc0', 1.1]} />
          <directionalLight position={[3, 6, 2]} intensity={1.6} />
          <Suspense fallback={null}>
            {scene === 'hub' && <Hub go={go} />}
            {scene === 'hood' && <Hood go={go} />}
            {scene === 'game' && <Game go={go} />}
            {scene === 'unlock' && <Unlock go={go} />}
            <Ground />
          </Suspense>
          <NotInXR>
            <OrbitControls makeDefault target={[0, 1.25, -1.6]} enablePan={false} minDistance={0.8} maxDistance={4.5} maxPolarAngle={Math.PI * 0.49} />
            <CameraRig scene={scene} />
          </NotInXR>
        </XR>
      </Canvas>

      {/* Text equivalent of the 3D scene (screen readers; also used by the automated tests) */}
      <div id="vr-scene-summary" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }} aria-live="polite">
        {`Scene: ${scene}. Mission: ${mission.id}, ${mission.addr ?? 'street spot'}. Plants: ${plantNames.join(' | ')}.`}
        <span id="vr-game-state" />
      </div>
      {/* 2D overlay (hidden inside the headset) */}
      <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, pointerEvents: 'none' }}>
        <div className="card row" style={{ padding: '6px 10px', pointerEvents: 'auto', gap: 8 }}>
          <Logo size={28} />
          <div><div className="tiny muted">EcoScape VR premium</div><b style={{ fontFamily: 'var(--f-display)' }}>Belleville, Paris</b></div>
        </div>
        <div className="row" style={{ gap: 8, pointerEvents: 'auto' }}>
          {vrSupported ? (
            <button className="btn primary" onClick={() => store.enterVR()}><Glasses size={18} /> Enter VR</button>
          ) : (
            <span className="chip" title="Open this page in the Meta Quest browser for immersive VR">3D mode · drag to look around</span>
          )}
          {!embed && <Link className="btn" to="/map"><Smartphone size={16} /> Mobile app</Link>}
        </div>
      </div>
      <nav aria-label="VR scenes" style={{ position: 'absolute', bottom: 14, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap', padding: '0 12px' }}>
        {SCENES.map((s) => (
          <button key={s.id} className={`chip ${scene === s.id ? 'sun' : ''}`} onClick={() => go(s.id)} aria-current={scene === s.id}>{s.label}</button>
        ))}
      </nav>
    </div>
  )
}

/** Non-XR camera framing per scene (in the headset the user just looks around). */
const VIEWS: Record<Scene, { pos: [number, number, number]; target: [number, number, number] }> = {
  hub: { pos: [0, 1.65, 1.1], target: [0, 1.3, -1.6] },
  hood: { pos: [0, 2.05, 0.35], target: [0, 1.3, -2.05] },
  game: { pos: [0, 1.6, 0.75], target: [0, 1.25, -1.6] },
  unlock: { pos: [0, 1.6, 0.9], target: [0, 1.35, -1.8] },
}
function CameraRig({ scene }: { scene: Scene }) {
  const { camera, controls } = useThree() as unknown as { camera: { position: { set: (...a: number[]) => void } }; controls: { target: { set: (...a: number[]) => void }; update: () => void } | null }
  useEffect(() => {
    const v = VIEWS[scene]
    camera.position.set(...v.pos)
    if (controls) { controls.target.set(...v.target); controls.update() }
  }, [scene, camera, controls])
  return null
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1]}>
      <circleGeometry args={[6, 48]} />
      <meshStandardMaterial color="#efe4c6" />
    </mesh>
  )
}

/* ---------------- Scene 1: Hub ---------------- */
function Hub({ go }: { go: (s: Scene) => void }) {
  const c = city()
  return (
    <group>
      <Panel w={1.7} h={1.05} position={[0, 1.55, -1.8]}>
        <Label font="display" size={0.15} position={[0, 0.3, 0]}>EcoScape VR</Label>
        <Label size={0.06} position={[0, 0.14, 0]} maxWidth={1.45}>Learn to care for a plant. Earn a real one on your street.</Label>
        <Chip label={`${c.label} · Belleville`} color={C.honey} position={[-0.3, 0, 0]} w={0.5} />
        <Chip label="Up to 4 real plantings" color={C.lilac} position={[0.32, 0, 0]} w={0.56} />
        <Button3D label="Explore my neighbourhood" w={1.2} position={[0, -0.27, 0]} onClick={() => go('hood')} />
      </Panel>
      <Float speed={2} floatIntensity={0.3}><Plant3D type="flowers" scale={1.4} position={[-1.25, 0.9, -1.6]} /></Float>
      <Float speed={1.6} floatIntensity={0.3}><Plant3D type="edible" scale={1.3} position={[1.25, 0.9, -1.6]} /></Float>
      <group position={[-1.25, 0.9, -1.6]}><Bee radius={0.35} height={0.55} /><Bee radius={0.25} height={0.45} speed={1.4} phase={2} /></group>
      <Plant3D type="tree" scale={2.2} position={[2.2, 0, -2.6]} />
      <Plant3D type="tree" scale={2.6} position={[-2.4, 0, -2.8]} />
    </group>
  )
}

/* ---------------- Scene 2: Neighbourhood diorama ---------------- */
function Hood({ go }: { go: (s: Scene) => void }) {
  const mission = useVRMission()
  // Beacon at the mission's real position; clamped to the edge of the 3D extract if it is further away.
  const [bx0, bz0] = toLocal(mission.lat, mission.lon)
  const dist = Math.hypot(bx0, bz0)
  const k = dist > 280 ? 280 / dist : 1
  const [bx, bz] = [bx0 * k, bz0 * k]
  return (
    <group>
      {/* table */}
      <mesh position={[0, 0.42, -1.75]}><cylinderGeometry args={[1.0, 1.05, 0.84, 48]} /><meshStandardMaterial color="#d9c9a5" /></mesh>
      <group position={[0, 0.85, -1.75]} scale={DIORAMA_SCALE}>
        <Neighbourhood />
        <group position={[bx, 0, bz]} onClick={(e) => { e.stopPropagation(); go('game') }} onPointerOver={() => (document.body.style.cursor = 'pointer')} onPointerOut={() => (document.body.style.cursor = 'default')}>
          <mesh position={[0, 45, 0]}><cylinderGeometry args={[4, 4, 90, 16]} /><meshBasicMaterial color={C.honey} transparent opacity={0.75} /></mesh>
          <mesh position={[0, 98, 0]}><sphereGeometry args={[12, 16, 12]} /><meshStandardMaterial color={C.honey} emissive={C.honey} emissiveIntensity={0.4} /></mesh>
        </group>
      </group>
      <Panel w={1.5} h={0.62} position={[0, 1.78, -2.55]} rotation={[0.12, 0, 0]}>
        <Label font="display" size={0.072} position={[0, 0.2, 0]}>Belleville — real buildings, real trees</Label>
        <Chip label="Hot spot" color={C.petal} position={[-0.45, 0.07, 0]} w={0.28} />
        <Chip label="Street trees" color="#9be2b9" position={[-0.1, 0.07, 0]} w={0.34} />
        <Chip label={k < 1 ? 'Mission (edge →)' : 'Mission'} color={C.honey} position={[0.3, 0.07, 0]} w={k < 1 ? 0.38 : 0.26} />
        <Label size={0.04} position={[0, -0.04, 0]} maxWidth={1.35}>Buildings: OpenStreetMap · Trees: Ville de Paris open data · Hot spots: prototype proxy</Label>
        <Button3D label={`Start mission — ${mission.addr}`} w={1.15} h={0.15} position={[0, -0.18, 0]} onClick={() => go('game')} />
      </Panel>
    </group>
  )
}

/* ---------------- Scene 3: Mission (3D mini-game) ---------------- */
function Game({ go }: { go: (s: Scene) => void }) {
  const mission = useVRMission()
  return <GameRound key={mission.id} mission={mission} go={go} />
}

function GameRound({ mission, go }: { mission: Mission; go: (s: Scene) => void }) {
  const { options, correctId } = useMemo(() => candidates(mission), [mission])
  const type = missionType(mission)
  const [wrong, setWrong] = useState<string[]>([])
  const [found, setFound] = useState(false)
  const [water, setWater] = useState(0)
  const { s, set, addBadge } = useGame()
  const chosen = options.find((p) => p.id === correctId)!
  const lastWrong = wrong.length ? options.find((p) => p.id === wrong[wrong.length - 1]) : null
  const temp = 41 - water * 1 // illustrative surface temperature
  const done = found && water >= 3

  const pick = (id: string) => {
    if (found || wrong.includes(id)) return
    if (id === correctId) setFound(true)
    else setWrong((w) => [...w, id])
  }

  const validate = () => {
    const already = s.plantings.some((p) => p.missionId === mission.id)
    const score = 40 - 10 * wrong.length + 35 + 25 // same scale as mobile
    if (!already && s.plantings.length < CONFIG.maxPlantings) {
      const pl: Planting = {
        id: `pl-${Date.now()}`, missionId: mission.id, hoodId: 'belleville', type, plantId: chosen.id, plantName: chosen.common, latin: chosen.latin,
        name: `${{ flowers: 'Bee Corner', edible: 'Street Garden', tree: 'Shade Tree' }[type]} ${mission.addr?.replace(/^(Rue|Avenue|Boulevard|Place) (de la |du |des |de l'|de |d')?/, '') ?? 'Belleville'}`,
        lat: mission.lat, lon: mission.lon, addr: mission.addr, partner: city().demoPartners[0], score, createdAt: Date.now(),
      }
      set((p) => ({ plantings: [...p.plantings, pl], missionsPlayed: p.missionsPlayed + 1, missionsPassed: p.missionsPassed + 1, bestScore: Math.max(p.bestScore, score) }))
      addBadge('first'); addBadge(type === 'flowers' ? 'bee' : type === 'tree' ? 'shade' : 'grower')
    }
    go('unlock')
  }

  // Announce the game state in the page's text summary (screen readers, automated tests)
  useEffect(() => {
    const el = document.getElementById('vr-game-state')
    if (el) el.textContent = `Step: ${!found ? 'choose' : done ? 'done' : 'water'}. Wrong picks: ${wrong.length}. Water: ${water}/3.${lastWrong && !found ? ` Not this one: ${lastWrong.common}.` : ''}`
  }, [found, done, wrong, water, lastWrong])

  const title = found ? (done ? 'Planted! Feel the difference.' : 'Water it: keep the soil just moist') : lastWrong ? 'Not this one — try another plant' : 'Which plant will thrive here?'
  const hint = found ? `${chosen.common}: ${explain(chosen, mission)}` : lastWrong
    ? `${explain(lastWrong, mission)} ${options.length - wrong.length - 1 > 1 ? 'Pick another plant.' : 'One plant left: it is the one that fits.'}`
    : 'Point at a plant and click (trigger in VR).'

  return (
    <group>
      <Panel w={1.9} h={0.5} position={[0, 1.9, -2.1]} rotation={[0.1, 0, 0]} color={lastWrong && !found ? '#ffd3dd' : C.paper}>
        <Label font="display" size={0.08} position={[0, 0.14, 0]}>{title}</Label>
        <Chip label={`${mission.addr ?? 'Street spot'} · ${SITE_LABEL[mission.site]}`} color="#f1ead6" position={[-0.52, 0.01, 0]} w={0.7} />
        <Chip label={EXPOSURE_LABEL[mission.exposure]} color={C.honey} position={[0.07, 0.01, 0]} w={0.3} />
        <Chip label={SOIL_LABEL[mission.soil]} color="#f1ead6" position={[0.42, 0.01, 0]} w={0.3} />
        <Chip label={`Heat ${'●'.repeat(mission.heat)}`} color={C.petal} position={[0.76, 0.01, 0]} w={0.28} />
        <Label size={0.04} position={[0, -0.14, 0]} maxWidth={1.78}>{hint}</Label>
      </Panel>

      {!found && options.map((p, i) => {
        const x = (i - 1) * 0.7
        const isWrong = wrong.includes(p.id)
        return (
          <group key={p.id} position={[x, 0, -1.45]}
            onClick={(e) => { e.stopPropagation(); pick(p.id) }}
            onPointerOver={() => (document.body.style.cursor = isWrong ? 'not-allowed' : 'pointer')} onPointerOut={() => (document.body.style.cursor = 'default')}>
            <mesh position={[0, 0.4, 0]}><cylinderGeometry args={[0.2, 0.22, 0.8, 32]} /><meshStandardMaterial color={isWrong ? '#ffb3c4' : '#fff'} /></mesh>
            <Plant3D type={type} variant={i} scale={1.25} position={[0, 0.8, 0]} />
            {/* generous hit area so the whole pedestal + plant is clickable */}
            <mesh position={[0, 0.75, 0]}><boxGeometry args={[0.5, 1.5, 0.5]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>
            <Label size={0.055} font="bold" position={[0, 1.42, 0]}>{p.common}</Label>
            <Label size={0.035} position={[0, 1.35, 0]}>{`${p.exposure.map((e) => EXPOSURE_LABEL[e]).join(' / ')} · ${p.soil.join(' / ')} soil`}</Label>
            {isWrong && <Label size={0.05} font="bold" color="#c2264f" position={[0, 1.27, 0]}>✗ Doesn't fit this spot</Label>}
          </group>
        )
      })}

      {found && (
        <group position={[0, 0, -1.45]}>
          <mesh position={[0, 0.35, 0]}><boxGeometry args={[0.9, 0.7, 0.6]} /><meshStandardMaterial color="#8b6a43" /></mesh>
          <mesh position={[0, 0.705, 0]}><boxGeometry args={[0.84, 0.02, 0.54]} /><meshStandardMaterial color={water >= 3 ? '#4a3220' : water > 0 ? '#5f4329' : '#9a7a52'} /></mesh>
          <Plant3D type={type} variant={options.findIndex((o) => o.id === correctId)} scale={1.6 + water * 0.12} position={[0, 0.62, 0]} />
          {done && type !== 'tree' && <><Bee radius={0.45} height={1.25} /><Bee radius={0.32} height={1.1} speed={1.3} phase={1.5} /><Bee radius={0.55} height={1.35} speed={0.8} phase={3} /></>}
          <Panel w={0.62} h={0.36} position={[0.95, 1.15, 0.1]} rotation={[0, -0.4, 0]} color={done ? '#c8efda' : C.paper}>
            <Label size={0.035} position={[0, 0.11, 0]}>Street surface (illustrative)</Label>
            <Label font="display" size={0.1} position={[0, 0.0, 0]}>{`${temp} °C`}</Label>
            <Label size={0.035} position={[0, -0.11, 0]}>{done ? 'Shade + moist soil = cooler' : `Soil moisture ${water}/3`}</Label>
          </Panel>
          {!done ? (
            <Button3D label={`Water (${water}/3)`} w={0.6} primary={false} position={[-0.9, 1.0, 0.1]} onClick={() => setWater((w) => Math.min(3, w + 1))} />
          ) : (
            <Button3D label="Validate my planting" w={0.8} position={[-0.95, 1.0, 0.1]} onClick={validate} />
          )}
        </group>
      )}
    </group>
  )
}

/* ---------------- Scene 4: Immersive unlock ---------------- */
function Unlock({ go }: { go: (s: Scene) => void }) {
  const { s } = useGame()
  const mission = useVRMission()
  const p = [...s.plantings].reverse().find((x) => x.missionId === mission.id)
  const idx = p ? s.plantings.indexOf(p) + 1 : 1
  const name = p?.name ?? 'Your planting'
  return (
    <group>
      <Sparkles count={120} scale={[4, 2.5, 2]} position={[0, 1.6, -2]} size={6} speed={0.6} color={C.honey} />
      <Sparkles count={60} scale={[4, 2.5, 2]} position={[0, 1.6, -2]} size={5} speed={0.5} color={C.petal} />
      <Panel w={1.8} h={1.12} position={[0, 1.6, -2.0]} color={C.honey}>
        <Label size={0.05} font="bold" position={[0, 0.43, 0]}>{`PLANTING #${idx}/${CONFIG.maxPlantings} VALIDATED`}</Label>
        <Label font="display" size={0.13} position={[0, 0.29, 0]} maxWidth={1.6}>{`“${name}”`}</Label>
        <Label size={0.048} position={[0, 0.15, 0]} maxWidth={1.6}>{`${mission.addr}, Belleville · planted within 3 weeks by ${city().demoPartners[0]} (demo partner)`}</Label>
        <Chip label="Earned, not bought" color="#ffffff" position={[-0.55, 0.0, 0]} w={0.5} />
        <Chip label="On your street" color="#9be2b9" position={[0, 0.0, 0]} w={0.42} />
        <Chip label="Seen by neighbours" color={C.lilac} position={[0.55, 0.0, 0]} w={0.5} />
        <Button3D label="Back to neighbourhood" w={1.0} h={0.16} position={[-0.38, -0.3, 0]} onClick={() => go('hood')} />
        <Button3D label="Play again" w={0.5} h={0.16} primary={false} position={[0.48, -0.3, 0]} onClick={() => go('game')} />
      </Panel>
      <Plant3D type={p?.type ?? missionType(mission)} scale={2.2} position={[-1.35, 0.3, -1.6]} />
      <group position={[-1.35, 0.3, -1.6]}><Bee radius={0.4} height={0.95} /><Bee radius={0.3} height={0.8} speed={1.5} phase={2} /></group>
      <Plant3D type="tree" scale={2.4} position={[1.5, 0, -2.2]} />
    </group>
  )
}
