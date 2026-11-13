import type { PlantingType } from '../config'
import guide from './species-guide.json'

export type Exposure = 'sun' | 'partial' | 'shade'
export type Soil = 'dry' | 'fresh' | 'moist' | 'wet'
/** Mature size of a street tree. */
export type TreeSize = 'small' | 'medium' | 'large'
/** Size of the tree pit at the mission spot. */
export type Pit = 'small' | 'standard' | 'large'

export interface Plant {
  id: string
  type: PlantingType
  common: string
  latin: string
  exposure: Exposure[]
  soil: Soil[]
  size: TreeSize
  native: boolean
  note: string
  source: 'nyc' | 'guide'
}

/**
 * Street-tree species common on New York City blocks (NYC Parks street-tree list, 2015 Street Tree
 * Census), with simplified site needs for the game: light, soil, and the room the roots need.
 */
type Raw = Omit<Plant, 'type' | 'source'>
const NYC_RAW: Raw[] = [
  { id: 'planetree', common: 'London planetree', latin: 'Platanus × acerifolia', exposure: ['sun'], soil: ['dry', 'fresh', 'moist'], size: 'large', native: false, note: 'The most common NYC street tree: tough, big shade — but it needs a big pit.' },
  { id: 'honeylocust', common: 'Thornless honeylocust', latin: 'Gleditsia triacanthos var. inermis', exposure: ['sun'], soil: ['dry', 'fresh'], size: 'medium', native: true, note: 'Light, airy shade; copes with dry, salty streets.' },
  { id: 'pin-oak', common: 'Pin oak', latin: 'Quercus palustris', exposure: ['sun'], soil: ['fresh', 'moist', 'wet'], size: 'large', native: true, note: 'Native oak that wants moist soil and lots of root room.' },
  { id: 'zelkova', common: 'Japanese zelkova', latin: 'Zelkova serrata', exposure: ['sun', 'partial'], soil: ['dry', 'fresh'], size: 'large', native: false, note: 'Vase-shaped and very tolerant — needs a large pit.' },
  { id: 'pagoda', common: 'Japanese pagoda tree', latin: 'Styphnolobium japonicum', exposure: ['sun'], soil: ['dry', 'fresh'], size: 'medium', native: false, note: 'Handles heat and dry soil; flowers in late summer.' },
  { id: 'linden', common: 'Little-leaf linden', latin: 'Tilia cordata', exposure: ['sun', 'partial'], soil: ['fresh', 'moist'], size: 'medium', native: false, note: 'Dense shade, but suffers in dry, compacted soil.' },
  { id: 'red-maple', common: 'Red maple', latin: 'Acer rubrum', exposure: ['sun', 'partial'], soil: ['moist', 'wet'], size: 'medium', native: true, note: 'Native, red in autumn — thirsty, wants moist soil.' },
  { id: 'ginkgo', common: 'Ginkgo', latin: 'Ginkgo biloba', exposure: ['sun'], soil: ['dry', 'fresh'], size: 'medium', native: false, note: 'Almost indestructible on hot, paved blocks.' },
  { id: 'hackberry', common: 'Common hackberry', latin: 'Celtis occidentalis', exposure: ['sun', 'partial'], soil: ['dry', 'fresh', 'moist'], size: 'large', native: true, note: 'Native and drought-tolerant — a big tree for a big pit.' },
  { id: 'redbud', common: 'Eastern redbud', latin: 'Cercis canadensis', exposure: ['sun', 'partial', 'shade'], soil: ['fresh', 'moist'], size: 'small', native: true, note: 'Small native tree, pink in spring; fine under wires and in small pits.' },
  { id: 'serviceberry', common: 'Serviceberry', latin: 'Amelanchier canadensis', exposure: ['sun', 'partial'], soil: ['fresh', 'moist'], size: 'small', native: true, note: 'Small native tree with berries for birds.' },
  { id: 'hedge-maple', common: 'Hedge maple', latin: 'Acer campestre', exposure: ['sun', 'partial'], soil: ['dry', 'fresh'], size: 'small', native: false, note: 'Small, tough and drought-tolerant: made for small pits.' },
  { id: 'lilac-tree', common: 'Japanese tree lilac', latin: 'Syringa reticulata', exposure: ['sun'], soil: ['dry', 'fresh'], size: 'small', native: false, note: 'Small tree for sunny, narrow sidewalks.' },
  { id: 'hornbeam', common: 'American hornbeam', latin: 'Carpinus caroliniana', exposure: ['partial', 'shade'], soil: ['fresh', 'moist'], size: 'small', native: true, note: 'Native understory tree: happy in shade, not in full sun.' },
]
const NYC_TREES: Plant[] = NYC_RAW.map((p) => ({ ...p, type: 'tree' as const, source: 'nyc' as const }))

/**
 * Paris street trees — City of Paris tree-species guide (open data, ODbL). Kept for the Paris version,
 * which is hidden in the interface.
 */
interface GuideRow { common: string; latin: string; size: string; street: boolean; exposure: Exposure[]; soil: Soil[]; native: string; flowers: boolean }
export const PARIS_TREES: Plant[] = (guide as GuideRow[])
  .filter((g) => g.street)
  .map((g, i) => ({
    id: `paris-tree-${i}`,
    type: 'tree' as const,
    common: g.common,
    latin: g.latin,
    exposure: g.exposure,
    soil: g.soil,
    size: /petit/i.test(g.size ?? '') ? 'small' as const : /grand/i.test(g.size ?? '') ? 'large' as const : 'medium' as const,
    native: /indig/i.test(g.native ?? ''),
    note: `${g.size ?? ''} tree · ${g.native ?? ''}`.trim(),
    source: 'guide' as const,
  }))

/** Species pool used by the missions. */
export const TREES: Plant[] = NYC_TREES

export const EXPOSURE_LABEL: Record<Exposure, string> = { sun: 'Full sun', partial: 'Half shade', shade: 'Shade' }
export const SOIL_LABEL: Record<Soil, string> = { dry: 'Dry soil', fresh: 'Normal soil', moist: 'Moist soil', wet: 'Wet soil' }
export const SIZE_LABEL: Record<TreeSize, string> = { small: 'Small tree · 20–30 ft', medium: 'Medium tree · 30–50 ft', large: 'Large tree · 50 ft+' }
export const PIT_LABEL: Record<Pit, string> = { small: 'Small pit 4×5 ft', standard: 'Standard pit 5×10 ft', large: 'Large pit 5×20 ft' }
export const TYPE_LABEL: Record<PlantingType, string> = { tree: 'Street tree' }

/** Biggest tree each pit can hold: roots need room, or they lift the sidewalk and the tree declines. */
const PIT_MAX: Record<Pit, number> = { small: 0, standard: 1, large: 2 }
const SIZE_RANK: Record<TreeSize, number> = { small: 0, medium: 1, large: 2 }
export const fitsPit = (p: Plant, pit: Pit) => SIZE_RANK[p.size] <= PIT_MAX[pit]
export const sizeRank = (p: Plant) => SIZE_RANK[p.size]
export const fits = (p: Plant, exposure: Exposure, soil: Soil, pit: Pit) => p.exposure.includes(exposure) && p.soil.includes(soil) && fitsPit(p, pit)
