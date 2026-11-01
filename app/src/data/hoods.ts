import type { CityId, PlantingType } from '../config'
import type { Exposure, Soil } from './plants'

export interface Mission {
  id: string
  lat: number
  lon: number
  type: PlantingType
  heat: 1 | 2 | 3
  exposure: Exposure
  soil: Soil
  site: 'tree-base' | 'planter' | 'street'
  addr: string | null
}

export interface Hood {
  id: string
  city: CityId
  name: string
  district: string
  bbox: [number, number, number, number]
  center: [number, number]
  stats: { trees: number; topSpecies: [string, number][]; permits?: number; plantingProjects?: number; coolIslands?: number; hviByZip?: Record<string, number> }
  trees: [number, number][]
  permits: { p: [number, number]; type: string | null; addr: string | null }[]
  planted: { p: [number, number]; name: string | null; n: string | null }[]
  cool: { name: string | null; geom: GeoJSON.Geometry }[]
  heat: { level: 1 | 2 | 3; trees: number; poly: [number, number][] }[]
  missions: Mission[]
  sources: string[]
}

// Small summaries for the neighbourhood picker (no need to load the heavy files up front).
export const HOOD_SUMMARY: Record<string, { name: string; district: string; city: CityId; blurb: string }> = {
  belleville: { name: 'Belleville', district: 'Paris 19e–20e', city: 'paris', blurb: 'Dense, hilly, lively — lots of hot, paved corners.' },
  'goutte-dor': { name: "La Goutte d'Or", district: 'Paris 18e', city: 'paris', blurb: 'One of the least green areas of Paris.' },
  'butte-aux-cailles': { name: 'Butte-aux-Cailles', district: 'Paris 13e', city: 'paris', blurb: 'Village streets, street-art, small squares.' },
  'bed-stuy': { name: 'Bedford-Stuyvesant', district: 'Brooklyn, NYC', city: 'nyc', blurb: 'Brownstone blocks in a high heat-vulnerability area.' },
}

const loaders: Record<string, () => Promise<{ default: unknown }>> = {
  belleville: () => import('./hood-belleville.json'),
  'goutte-dor': () => import('./hood-goutte-dor.json'),
  'butte-aux-cailles': () => import('./hood-butte-aux-cailles.json'),
  'bed-stuy': () => import('./hood-bed-stuy.json'),
}

const cache: Record<string, Hood> = {}
export async function loadHood(id: string): Promise<Hood> {
  if (cache[id]) return cache[id]
  const mod = await loaders[id]()
  cache[id] = mod.default as Hood
  return cache[id]
}

/** Distance in metres (equirectangular — fine at neighbourhood scale). */
export function distM(a: [number, number], b: [number, number]) {
  const k = Math.PI / 180
  const x = (b[1] - a[1]) * k * Math.cos(((a[0] + b[0]) / 2) * k)
  const y = (b[0] - a[0]) * k
  return Math.sqrt(x * x + y * y) * 6371000
}

export const walkMin = (m: number) => Math.max(1, Math.round(m / 80))
