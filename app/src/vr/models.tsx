import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { PlantingType } from '../config'
import { C } from './ui3d'
import vr from '../data/vr-bed-stuy.json'

/** Low-poly street tree in its pit (original geometry). variant: 0 round, 1 tall / conical, 2 wide and airy. */
const CROWNS = [[C.leaf, '#279160'], ['#14482c', C.leaf], ['#8fa996', C.lilac]]
export function Plant3D({ scale = 1, position, variant = 0 }: { type?: PlantingType; scale?: number; position?: [number, number, number]; variant?: number }) {
  const v = ((variant % 3) + 3) % 3
  const [c1, c2] = CROWNS[v]
  return (
    <group position={position} scale={scale}>
      {/* tree pit: sidewalk edge + soil + mulch */}
      <mesh position={[0, 0.04, 0]}><boxGeometry args={[0.3, 0.08, 0.3]} /><meshStandardMaterial color="#d9bfa2" /></mesh>
      <mesh position={[0, 0.085, 0]}><boxGeometry args={[0.24, 0.012, 0.24]} /><meshStandardMaterial color="#5a3f24" /></mesh>
      <mesh position={[0, 0.27, 0]}><cylinderGeometry args={[0.022, 0.032, 0.36, 8]} /><meshStandardMaterial color="#7a5533" /></mesh>
      {v === 0 && (<>
        <mesh position={[0, 0.5, 0]}><icosahedronGeometry args={[0.17, 0]} /><meshStandardMaterial color={c1} flatShading /></mesh>
        <mesh position={[0.1, 0.42, 0.04]}><icosahedronGeometry args={[0.11, 0]} /><meshStandardMaterial color={c2} flatShading /></mesh>
      </>)}
      {v === 1 && <mesh position={[0, 0.58, 0]}><coneGeometry args={[0.14, 0.52, 7]} /><meshStandardMaterial color={c1} flatShading /></mesh>}
      {v === 2 && (<>
        <mesh position={[0, 0.48, 0]} scale={[1.5, 0.6, 1.5]}><icosahedronGeometry args={[0.15, 0]} /><meshStandardMaterial color={c1} flatShading /></mesh>
        <mesh position={[0, 0.56, 0]} scale={[1, 0.6, 1]}><icosahedronGeometry args={[0.12, 0]} /><meshStandardMaterial color={c2} flatShading /></mesh>
      </>)}
    </group>
  )
}

/** Local metres from the mission origin: x = east, z = south. */
const [LAT0, LON0] = vr.origin as [number, number]
const KX = 111320 * Math.cos((LAT0 * Math.PI) / 180)
export const toLocal = (lat: number, lon: number): [number, number] => [(lon - LON0) * KX, -(lat - LAT0) * 111320]

/** Neighbourhood diorama: real OSM buildings (ODbL) extruded, real street trees, heat-proxy cells. Units: metres. */
export function Neighbourhood({ heatOn = true }: { heatOn?: boolean }) {
  const buildings = useMemo(() => {
    const geoms: THREE.BufferGeometry[] = []
    for (const b of vr.buildings as { h: number; pts: [number, number][] }[]) {
      const shape = new THREE.Shape(b.pts.map(([la, lo]) => { const [x, z] = toLocal(la, lo); return new THREE.Vector2(x, z) }))
      const g = new THREE.ExtrudeGeometry(shape, { depth: Math.min(b.h, 40), bevelEnabled: false })
      g.rotateX(Math.PI / 2) // extrude upwards (shape in x/z plane)
      g.translate(0, Math.min(b.h, 40), 0)
      geoms.push(g)
    }
    return geoms.length ? mergeGeometries(geoms) : null
  }, [])
  const trees = vr.trees as [number, number][]
  const heat = useMemo(() => (vr.heat as unknown as { level: number; poly: [number, number][] }[]).map((h) => {
    const pts = h.poly.map(([lo, la]) => toLocal(la, lo))
    const xs = pts.map((p) => p[0]); const zs = pts.map((p) => p[1])
    return { level: h.level, x: (Math.min(...xs) + Math.max(...xs)) / 2, z: (Math.min(...zs) + Math.max(...zs)) / 2, w: Math.max(...xs) - Math.min(...xs), d: Math.max(...zs) - Math.min(...zs) }
  }).filter((h) => Math.abs(h.x) < 260 && Math.abs(h.z) < 190), [])
  const treeMesh = useRef<THREE.InstancedMesh>(null)
  useEffect(() => {
    const m = treeMesh.current
    if (!m) return
    const o = new THREE.Object3D()
    trees.forEach(([la, lo], i) => { const [x, z] = toLocal(la, lo); o.position.set(x, 6, z); o.updateMatrix(); m.setMatrixAt(i, o.matrix) })
    m.instanceMatrix.needsUpdate = true
  }, [trees])
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}><circleGeometry args={[305, 64]} /><meshStandardMaterial color="#e1d6bf" /></mesh>
      {heatOn && heat.map((h, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[h.x, 0.3, h.z]}><planeGeometry args={[h.w, h.d]} /><meshBasicMaterial color={C.petal} transparent opacity={0.18 + h.level * 0.12} /></mesh>
      ))}
      {buildings && <mesh geometry={buildings}><meshStandardMaterial color="#f3ead6" roughness={0.95} /></mesh>}
      <instancedMesh ref={treeMesh} args={[undefined, undefined, trees.length]}>
        <icosahedronGeometry args={[4.5, 0]} />
        <meshStandardMaterial color={C.leaf} flatShading />
      </instancedMesh>
    </group>
  )
}
