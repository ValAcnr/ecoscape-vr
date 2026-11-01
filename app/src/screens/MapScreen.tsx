import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
// MapLibre v6 runs tiles in a module worker: give Vite's bundled URL explicitly.
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import { Box, Footprints, LocateFixed, Play, X } from 'lucide-react'
import { CONFIG } from '../config'
import { distM, loadHood, walkMin, type Hood, type Mission } from '../data/hoods'
import { EXPOSURE_LABEL, SITE_LABEL, SOIL_LABEL, TYPE_LABEL } from '../data/plants'
import { missionType } from '../game/rules'
import { useGame } from '../state'
import { Tabs } from '../components/Shell'
import { PlantArt } from '../components/Art'

maplibregl.setWorkerUrl(workerUrl)
const STYLE = 'https://tiles.openfreemap.org/styles/positron'
const TYPE_ICON = { flowers: '🌼', edible: '🍅', tree: '🌳' } as const

function circle(center: [number, number], r: number) {
  const pts: [number, number][] = []
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * Math.PI * 2
    pts.push([center[1] + ((r * Math.cos(a)) / (111320 * Math.cos((center[0] * Math.PI) / 180))), center[0] + (r * Math.sin(a)) / 111320])
  }
  return { type: 'Feature' as const, properties: {}, geometry: { type: 'Polygon' as const, coordinates: [pts] } }
}

export default function MapScreen() {
  const { s, set } = useGame()
  const nav = useNavigate()
  const box = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const meMk = useRef<maplibregl.Marker | null>(null)
  const [hood, setHood] = useState<Hood | null>(null)
  const [sel, setSel] = useState<Mission | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [is3d, setIs3d] = useState(false)
  const doneIds = useMemo(() => new Set(s.plantings.map((p) => p.missionId)), [s.plantings])

  useEffect(() => {
    if (!s.hoodId) nav('/hood', { replace: true })
    else loadHood(s.hoodId).then(setHood)
  }, [s.hoodId, nav])

  const player = (s.player ?? hood?.center ?? [0, 0]) as [number, number]

  // Build the map once the neighbourhood is loaded
  useEffect(() => {
    if (!hood || !box.current) return
    const m = new maplibregl.Map({
      container: box.current,
      style: STYLE,
      center: [player[1], player[0]],
      zoom: 15.4,
      attributionControl: { compact: true },
      maxBounds: [[hood.bbox[1] - 0.03, hood.bbox[0] - 0.02], [hood.bbox[3] + 0.03, hood.bbox[2] + 0.02]],
    })
    map.current = m
    ;(window as unknown as { __ecoMap?: maplibregl.Map }).__ecoMap = m // debug/screenshot hook
    m.on('load', () => {
      // Frame all missions + the player so every mission is reachable at a glance
      const pts = [...hood.missions.map((x) => [x.lon, x.lat] as [number, number]), [player[1], player[0]] as [number, number]]
      const b = pts.reduce((bb, p) => bb.extend(p), new maplibregl.LngLatBounds(pts[0], pts[0]))
      const frame = () => m.fitBounds(b, { padding: { top: 160, bottom: 120, left: 56, right: 56 }, duration: 0, maxZoom: 16.2 })
      frame()
      m.once('idle', () => { m.resize(); frame() }) // re-frame once the container has its final size
      m.addSource('heat', { type: 'geojson', data: { type: 'FeatureCollection', features: hood.heat.map((h) => ({ type: 'Feature', properties: { level: h.level }, geometry: { type: 'Polygon', coordinates: [[...h.poly, h.poly[0]]] } })) } })
      m.addLayer({ id: 'heat', type: 'fill', source: 'heat', paint: { 'fill-color': '#ff6f91', 'fill-opacity': ['interpolate', ['linear'], ['get', 'level'], 1, 0.16, 3, 0.42] } })
      m.addSource('cool', { type: 'geojson', data: { type: 'FeatureCollection', features: hood.cool.map((c) => ({ type: 'Feature', properties: { name: c.name }, geometry: c.geom })) } as GeoJSON.FeatureCollection })
      m.addLayer({ id: 'cool', type: 'fill', source: 'cool', paint: { 'fill-color': '#2fa36b', 'fill-opacity': 0.28 } })
      m.addSource('trees', { type: 'geojson', data: { type: 'FeatureCollection', features: hood.trees.map((t) => ({ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [t[1], t[0]] } })) } })
      m.addLayer({ id: 'trees', type: 'circle', source: 'trees', paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 14, 1.8, 18, 4.5], 'circle-color': '#2fa36b', 'circle-opacity': 0.6 } })
      m.addSource('permits', { type: 'geojson', data: { type: 'FeatureCollection', features: hood.permits.map((p) => ({ type: 'Feature', properties: { type: p.type, addr: p.addr }, geometry: { type: 'Point', coordinates: [p.p[1], p.p[0]] } })) } })
      m.addLayer({ id: 'permits', type: 'circle', source: 'permits', paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 14, 3, 18, 7], 'circle-color': '#b9a4ff', 'circle-stroke-color': '#161320', 'circle-stroke-width': 1.5 } })
      m.addSource('range', { type: 'geojson', data: circle(player, CONFIG.missionRadiusM) })
      m.addLayer({ id: 'range', type: 'fill', source: 'range', paint: { 'fill-color': '#6aa9ff', 'fill-opacity': 0.12 } })
      m.addLayer({ id: 'range-line', type: 'line', source: 'range', paint: { 'line-color': '#6aa9ff', 'line-width': 1.5, 'line-dasharray': [2, 2] } })
      m.on('click', 'permits', (e: maplibregl.MapLayerMouseEvent) => {
        const f = e.features?.[0]
        if (f) setToast(`Neighbours' planting (vegetation permit): ${f.properties?.type ?? ''}${f.properties?.addr ? ' · ' + f.properties.addr : ''}`)
      })
    })
    // Missions + my plantings as HTML markers (no beehives are ever shown — UNAF position)
    hood.missions.forEach((mi) => {
      const el = document.createElement('button')
      const done = doneIds.has(mi.id)
      const t = missionType(mi)
      el.className = `mk ${done ? 'done' : t}`
      el.setAttribute('aria-label', `${done ? 'Your planting' : 'Mission'}: ${TYPE_LABEL[t]}${mi.addr ? ', ' + mi.addr : ''}`)
      el.innerHTML = `<span style="font-size:18px">${done ? '★' : TYPE_ICON[t]}</span>`
      el.onclick = (ev) => { ev.stopPropagation(); setSel(mi) }
      new maplibregl.Marker({ element: el }).setLngLat([mi.lon, mi.lat]).addTo(m)
    })
    const me = document.createElement('div')
    me.className = 'me'
    me.setAttribute('aria-label', 'You')
    meMk.current = new maplibregl.Marker({ element: me }).setLngLat([player[1], player[0]]).addTo(m)
    return () => { m.remove(); map.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hood])

  // Move "me" + range circle when the player moves
  useEffect(() => {
    if (!map.current || !s.player) return
    meMk.current?.setLngLat([s.player[1], s.player[0]])
    const src = map.current.getSource('range') as maplibregl.GeoJSONSource | undefined
    src?.setData(circle(s.player, CONFIG.missionRadiusM))
  }, [s.player])

  // 3D buildings toggle (OpenMapTiles 'building' layer from OpenFreeMap)
  useEffect(() => {
    const m = map.current
    if (!m) return
    const apply = () => {
      if (is3d && !m.getLayer('b3d')) {
        m.addLayer({ id: 'b3d', type: 'fill-extrusion', source: 'openmaptiles', 'source-layer': 'building', paint: { 'fill-extrusion-color': '#e9dfc7', 'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 12], 'fill-extrusion-opacity': 0.85 } }, 'heat')
      }
      if (!is3d && m.getLayer('b3d')) m.removeLayer('b3d')
      m.easeTo({ pitch: is3d ? 55 : 0, duration: 700 })
    }
    if (m.isStyleLoaded()) apply()
    else m.once('load', apply)
  }, [is3d])

  const d = sel ? distM(player, [sel.lat, sel.lon]) : 0
  const inRange = sel ? d <= CONFIG.missionRadiusM : false
  const left = CONFIG.maxPlantings - s.plantings.length

  const walkTo = (mi: Mission) => {
    const from = player
    const to: [number, number] = [mi.lat - 0.00012, mi.lon]
    const t0 = performance.now()
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / 1100)
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2
      set({ player: [from[0] + (to[0] - from[0]) * e, from[1] + (to[1] - from[1]) * e] })
      if (k < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
    map.current?.easeTo({ center: [to[1], to[0]], zoom: 16.6, duration: 1100 })
  }

  const locate = () => {
    if (!('geolocation' in navigator)) return setToast('Location is not available on this device — demo mode keeps you in the neighbourhood.')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        if (hood && p[0] > hood.bbox[0] && p[0] < hood.bbox[2] && p[1] > hood.bbox[1] && p[1] < hood.bbox[3]) {
          set({ player: p })
          map.current?.easeTo({ center: [p[1], p[0]], zoom: 16.4 })
        } else setToast(`You're not in ${hood?.name} right now — demo mode keeps you here. Your position is never stored.`)
      },
      () => setToast('Location permission declined — no problem, demo mode works without it.'),
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  return (
    <div className="screen" style={{ overflow: 'hidden' }}>
      <div className="map-wrap"><div ref={box} style={{ position: 'absolute', inset: 0 }} role="application" aria-label={`Map of ${hood?.name ?? 'the neighbourhood'}`} /></div>
      <div className="map-top">
        <div className="hud">
          <button className="card" style={{ textAlign: 'left' }} onClick={() => nav('/hood')} aria-label="Change neighbourhood">
            <div className="tiny muted">Your neighbourhood</div>
            <div style={{ fontFamily: 'var(--f-display)', fontWeight: 800, fontSize: 18 }}>{hood?.name ?? '…'}</div>
          </button>
          <div className="card row" style={{ gap: 6 }} aria-label={`${s.plantings.length} of ${CONFIG.maxPlantings} plantings unlocked`}>
            <span style={{ fontSize: 18 }}>🌱</span><b>{s.plantings.length}/{CONFIG.maxPlantings}</b>
          </div>
        </div>
        <div className="row between">
          <div className="legend" aria-label="Legend">
            <span className="chip hot">Hot spot</span>
            <span className="chip leaf">Cool island</span>
            <span className="chip" style={{ background: 'var(--lilac)' }}>Neighbours' plantings</span>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <button className="iconbtn" onClick={() => setIs3d((v) => !v)} aria-pressed={is3d} aria-label="Toggle 3D buildings" style={{ background: is3d ? 'var(--honey)' : undefined }}><Box size={18} /></button>
            <button className="iconbtn" onClick={locate} aria-label="Use my real location"><LocateFixed size={18} /></button>
          </div>
        </div>
      </div>

      {toast && (
        <div className="sheet row between" role="status" style={{ alignItems: 'flex-start' }}>
          <p className="small">{toast}</p>
          <button className="iconbtn" style={{ width: 32, height: 32 }} onClick={() => setToast(null)} aria-label="Close"><X size={16} /></button>
        </div>
      )}

      {sel && !toast && (
        <div className="sheet" role="dialog" aria-label="Mission">
          <div className="row between" style={{ alignItems: 'flex-start' }}>
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <PlantArt type={missionType(sel)} stage={doneIds.has(sel.id) ? 3 : 0} w={58} />
              <div>
                <span className="tiny muted">{doneIds.has(sel.id) ? 'Your planting' : `Mission · ${TYPE_LABEL[missionType(sel)]}`}</span>
                <h3>{sel.addr ?? 'Street spot'}</h3>
                <p className="small muted">{SITE_LABEL[sel.site]} · {Math.round(d)} m · {walkMin(d)} min walk</p>
              </div>
            </div>
            <button className="iconbtn" style={{ width: 32, height: 32 }} onClick={() => setSel(null)} aria-label="Close"><X size={16} /></button>
          </div>
          <div className="row wrap" style={{ gap: 6, margin: '10px 0 12px' }}>
            <span className={`chip ${sel.exposure}`}>{EXPOSURE_LABEL[sel.exposure]}</span>
            <span className="chip">{SOIL_LABEL[sel.soil]}</span>
            <span className="chip hot">Heat {'●'.repeat(sel.heat)}</span>
          </div>
          {doneIds.has(sel.id) ? (
            <button className="btn primary block" onClick={() => nav('/plantings')}>See my planting</button>
          ) : inRange ? (
            <button className="btn primary block" onClick={() => nav(`/mission/${sel.id}`)}><Play size={18} /> Start mission {left <= 0 && '(adopt mode)'}</button>
          ) : (
            <button className="btn honey block" onClick={() => walkTo(sel)}><Footprints size={18} /> Walk there <span className="small">(demo)</span></button>
          )}
          {!inRange && !doneIds.has(sel.id) && <p className="small muted center" style={{ marginTop: 8 }}>Missions unlock within {CONFIG.missionRadiusM} m. The demo walks you there; on the street, your phone's location does it.</p>}
        </div>
      )}
      <Tabs />
    </div>
  )
}
