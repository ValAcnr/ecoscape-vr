import { CONFIG, type PlantingType } from '../config'
import type { Mission } from '../data/hoods'
import { PLANTS, fits, type Plant } from '../data/plants'

/** Deterministic pseudo-random from a string seed (same mission → same choices). */
function rng(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

/** Mission type respecting the configured planting mix (e.g. trees disabled → flowers). */
export function missionType(m: Mission): PlantingType {
  if (CONFIG.plantingTypes.includes(m.type)) return m.type
  return CONFIG.plantingTypes[0]
}

/**
 * Three candidates: exactly one fits the spot (exposure + soil, native preferred),
 * two are plausible but wrong (fail exposure or soil, or break the charter).
 */
export function candidates(m: Mission): { options: Plant[]; correctId: string } {
  const type = missionType(m)
  const pool = PLANTS[type]
  const r = rng(m.id)
  const shuffle = <T,>(a: T[]) => a.map((x) => [r(), x] as const).sort((a, b) => a[0] - b[0]).map((x) => x[1])
  const ok = (p: Plant) => fits(p, m.exposure, m.soil) && (type !== 'flowers' || p.native)
  const good = shuffle(pool.filter(ok)).sort((a, b) => Number(b.native) - Number(a.native) + (b.pollinators - a.pollinators) * 0.1)
  const bad = shuffle(pool.filter((p) => !ok(p)))
  const correct = good[0] ?? pool[0]
  const wrong = bad.filter((p) => p.id !== correct.id).slice(0, 2)
  return { options: shuffle([correct, ...wrong]), correctId: correct.id }
}

/** Why a plant is wrong for this spot — shown as feedback. */
export function explain(p: Plant, m: Mission): string {
  if (!p.exposure.includes(m.exposure)) return `${p.common} needs ${p.exposure.map(labelExp).join(' / ')}, but this spot is ${labelExp(m.exposure).toLowerCase()}.`
  if (!p.soil.includes(m.soil)) return `${p.common} wants ${p.soil.join(' / ')} soil — this spot is ${m.soil}.`
  if (!p.native && p.type === 'flowers') return `${p.common} is exotic: the charter asks for local, bee-friendly plants.`
  return `${p.common} is a good match: ${p.note}`
}
const labelExp = (e: string) => ({ sun: 'Full sun', partial: 'Half shade', shade: 'Shade' })[e] ?? e

/** Target moisture band for the watering game (0–100), from the spot's soil. */
export function waterBand(m: Mission): [number, number] {
  return ({ dry: [25, 50], fresh: [40, 65], moist: [55, 80], wet: [65, 90] } as const)[m.soil] as [number, number]
}

export interface CareAction { id: string; label: string; good: boolean; why: string }
export function careActions(type: PlantingType): CareAction[] {
  const common: CareAction[] = [
    { id: 'mulch', label: 'Add mulch (wood chips)', good: true, why: 'Keeps soil cool and moist in heatwaves.' },
    { id: 'pesticide', label: 'Spray pesticide against aphids', good: false, why: 'Forbidden by the charter — it kills pollinators too.' },
    { id: 'plastic', label: 'Plastic edging around the bed', good: false, why: 'Plastic is not allowed in street plantings.' },
  ]
  const specific: Record<PlantingType, CareAction> = {
    flowers: { id: 'deadhead', label: 'Leave seed heads in autumn', good: true, why: 'Food and shelter for insects and birds.' },
    edible: { id: 'compost', label: 'Feed with neighbourhood compost', good: true, why: 'Natural fertiliser, closes the loop.' },
    tree: { id: 'guard', label: 'Fit a tree guard', good: true, why: 'Protects young bark from bikes and dogs.' },
  }
  return [common[0], common[1], specific[type], common[2]]
}

export const PASS = CONFIG.passScore
