import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { PlantingType } from '../config'
import { C } from './ui3d'
import vr from '../data/vr-belleville.json'

/** Low-poly plant in the Bloom style (original geometry). */
const PALETTES = [[C.lilac, C.petal, C.honey], ['#ffffff', '#f4f0ff', '#e8e2ff'], ['#ffe066', '#fff2a8', '#f7c948']]
export function Plant3D({ type, scale = 1, position, variant = 0 }: { type: PlantingType; scale?: number; position?: [number, number, number]; variant?: number }) {
  const pal = PALETTES[variant % PALETTES.length]
  const tall = variant === 1 ? 0.75 : variant === 2 ? 0.6 : 1
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.04, 0]}><cylinderGeometry args={[0.14, 0.11, 0.08, 20]} /><meshStandardMaterial color="#8b6a43" /></mesh>
      <mesh position={[0, 0.085, 0]}><cylinderGeometry args={[0.13, 0.13, 0.01, 20]} /><meshStandardMaterial color="#5a3f24" /></mesh>
      {type === 'tree' ? (
        <group>
          <mesh position={[0, 0.25, 0]}><cylinderGeometry args={[0.025, 0.035, 0.32, 8]} /><meshStandardMaterial color="#7a5533" /></mesh>
          <mesh position={[0, 0.48, 0]}><icosahedronGeometry args={[0.17, 0]} /><meshStandardMaterial color={C.leaf} flatShading /></mesh>
          <mesh position={[0.1, 0.4, 0.04]}><icosahedronGeometry args={[0.11, 0]} /><meshStandardMaterial color="#38b878" flatShading /></mesh>
        </group>
      ) : type === 'edible' ? (
        <group>
          {[[-0.05, 0.03], [0.05, -0.02], [0, 0.06], [0.03, 0.05]].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.16 + i * 0.02, z]} rotation={[0.3 * i, i, 0.4]}><sphereGeometry args={[0.06, 8, 6]} /><meshStandardMaterial color="#4cb36b" flatShading /></mesh>
          ))}
          {[[0.07, 0.04], [-0.05, -0.05], [0.0, 0.09]].map(([x, z], i) => (
            <mesh key={`t${i}`} position={[x, 0.2, z]}><sphereGeometry args={[0.03, 10, 8]} /><meshStandardMaterial color="#ff5d5d" /></mesh>
          ))}
        </group>
      ) : (
        <group>
          {[[-0.06, 0, 0.26 * tall, pal[0]], [0.05, 0.03, 0.3 * tall, pal[1]], [0, -0.06, 0.22 * tall, pal[2]], [0.07, -0.05, 0.2 * tall, pal[0]], [-0.07, 0.06, 0.24 * tall, pal[2]]].map(([x, z, h, col], i) => (
            <group key={i} position={[x as number, 0, z as number]}>
              <mesh position={[0, (h as number) / 2 + 0.08, 0]}><cylinderGeometry args={[0.006, 0.006, h as number, 5]} /><meshStandardMaterial color="#2f8a4f" /></mesh>
              <mesh position={[0, (h as number) + 0.08, 0]}><sphereGeometry args={[0.035, 10, 8]} /><meshStandardMaterial color={col as string} /></mesh>
            </group>
          ))}
        </group>
      )}
    </group>
  )
}

/** A bee orbiting a point (pollinators — never a hive). */
export function Bee({ radius = 0.3, speed = 1, height = 0.4, phase = 0 }: { radius?: number; speed?: number; height?: number; phase?: number }) {
  const g = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + phase
    if (g.current) {
      g.current.position.set(Math.cos(t) * radius, height + Math.sin(t * 3) * 0.04, Math.sin(t) * radius)
      g.current.rotation.y = -t
    }
  })
  return (
    <group ref={g}>
      <mesh scale={[1, 0.8, 1.4]}><sphereGeometry args={[0.03, 12, 10]} /><meshStandardMaterial color={C.honey} /></mesh>
      <mesh position={[0, 0, 0.01]} scale={[1.02, 0.82, 0.25]}><sphereGeometry args={[0.03, 12, 10]} /><meshStandardMaterial color={C.ink} /></mesh>
      <mesh position={[0.025, 0.025, 0]} rotation={[0, 0, 0.5]}><sphereGeometry args={[0.02, 8, 6]} /><meshStandardMaterial color="#ffffff" transparent opacity={0.8} /></mesh>
      <mesh position={[-0.025, 0.025, 0]} rotation={[0, 0, -0.5]}><sphereGeometry args={[0.02, 8, 6]} /><meshStandardMaterial color="#ffffff" transparent opacity={0.8} /></mesh>
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}><circleGeometry args={[305, 64]} /><meshStandardMaterial color="#e9e2d0" /></mesh>
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
