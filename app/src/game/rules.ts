import { CONFIG, type PlantingType } from '../config'
import type { Mission } from '../data/hoods'
import { TREES, PIT_LABEL, fits, fitsPit, sizeRank, type Pit, type Plant } from '../data/plants'

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

/** Every mission is a street-tree mission (older data may still say 'flowers' / 'edible'). */
export function missionType(_m: Mission): PlantingType {
  return 'tree'
}

/** Tree-pit size at the spot (derived from the mission id; always at least one species fits). */
export function pitOf(m: Mission): Pit {
  const pits: Pit[] = ['small', 'standard', 'standard', 'large']
  let pit = pits[Math.floor(rng(`${m.id}-pit`)() * pits.length)]
  while (pit !== 'large' && !TREES.some((p) => fits(p, m.exposure, m.soil, pit))) pit = pit === 'small' ? 'standard' : 'large'
  return pit
}

/**
 * Three candidates: exactly one fits the spot (sun + soil + pit size; the biggest canopy that fits),
 * two are common NYC street trees that are wrong here (light, soil, or too big for the pit).
 */
export function candidates(m: Mission): { options: Plant[]; correctId: string } {
  const pit = pitOf(m)
  const r = rng(m.id)
  const shuffle = <T,>(a: T[]) => a.map((x) => [r(), x] as const).sort((a, b) => a[0] - b[0]).map((x) => x[1])
  const ok = (p: Plant) => fits(p, m.exposure, m.soil, pit)
  // biggest canopy the pit allows (more shade); among equal sizes, the mission seed picks the species
  const good = shuffle(TREES.filter(ok)).sort((a, b) => sizeRank(b) - sizeRank(a))
  const bad = shuffle(TREES.filter((p) => !ok(p)))
  const correct = good[0] ?? TREES[0]
  const wrong = bad.filter((p) => p.id !== correct.id).slice(0, 2)
  return { options: shuffle([correct, ...wrong]), correctId: correct.id }
}

const SIZE_FT = { small: '20–30 ft', medium: '30–50 ft', large: '50 ft or more' } as const

/** Why a species is wrong for this spot — shown as feedback. */
export function explain(p: Plant, m: Mission): string {
  const pit = pitOf(m)
  if (!p.exposure.includes(m.exposure)) return `${p.common} needs ${p.exposure.map(labelExp).join(' / ').toLowerCase()}, but this spot is ${labelExp(m.exposure).toLowerCase()}.`
  if (!p.soil.includes(m.soil)) return `${p.common} wants ${p.soil.join(' / ')} soil — this pit is ${m.soil}.`
  if (!fitsPit(p, pit)) return `${p.common} grows to ${SIZE_FT[p.size]}: its roots need more room than a ${PIT_LABEL[pit].toLowerCase()}.`
  return `${p.common} is a good match: ${p.note}`
}
const labelExp = (e: string) => ({ sun: 'Full sun', partial: 'Half shade', shade: 'Shade' })[e] ?? e

/** Watering target (gallons a week) and gauge scale for the watering game. */
export const WATER_MAX_GAL = 30
export function waterBand(_m?: Mission): [number, number] {
  return [(CONFIG.water.minGal / WATER_MAX_GAL) * 100, (CONFIG.water.maxGal / WATER_MAX_GAL) * 100]
}

export interface CareAction { id: string; label: string; good: boolean; why: string }
/** Step 3: protect the tree pit. Three right actions (mulch, weeding, no compaction), two traps. */
export function careActions(_type?: PlantingType): CareAction[] {
  return [
    { id: 'mulch', label: 'Spread 2–3 in of mulch, away from the trunk', good: true, why: 'Keeps the soil cool and moist through the summer.' },
    { id: 'volcano', label: 'Pile mulch high against the trunk', good: false, why: '“Volcano mulch” keeps the bark wet: it rots and invites pests.' },
    { id: 'weed', label: 'Pull the weeds and pick up litter', good: true, why: 'Weeds steal the water the young tree needs.' },
    { id: 'herbicide', label: 'Spray weedkiller in the pit', good: false, why: 'Herbicide soaks down to the roots: never in a tree pit.' },
    { id: 'loose', label: 'Keep the soil loose: no stepping, parking or bikes', good: true, why: 'Compacted soil chokes the roots — water and air cannot get in.' },
  ]
}
export const CARE_PICKS = 3

export const PASS = CONFIG.passScore
