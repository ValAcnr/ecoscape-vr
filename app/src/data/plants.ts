import type { PlantingType } from '../config'
import guide from './species-guide.json'

export type Exposure = 'sun' | 'partial' | 'shade'
export type Soil = 'dry' | 'fresh' | 'moist' | 'wet'

export interface Plant {
  id: string
  type: PlantingType
  common: string
  latin: string
  exposure: Exposure[]
  soil: Soil[]
  native: boolean
  /** 0–3: how useful for pollinators (flowers/edible are simplified for the game). */
  pollinators: number
  note: string
  source: 'guide' | 'curated'
}

/**
 * Pollinator flowers — curated list of species common in Île-de-France, simplified for teaching.
 * Charter of the 'permis de végétaliser': local & bee-friendly plants (Ville de Paris, 2025).
 */
type Raw = Omit<Plant, 'type' | 'source'>
const FLOWERS_RAW: Raw[] = [
  { id: 'origanum', common: 'Wild marjoram', latin: 'Origanum vulgare', exposure: ['sun'], soil: ['dry', 'fresh'], native: true, pollinators: 3, note: 'Loved by bees and butterflies, survives dry summers.' },
  { id: 'echium', common: "Viper's bugloss", latin: 'Echium vulgare', exposure: ['sun'], soil: ['dry'], native: true, pollinators: 3, note: 'A bee magnet for poor, dry soils.' },
  { id: 'knautia', common: 'Field scabious', latin: 'Knautia arvensis', exposure: ['sun', 'partial'], soil: ['dry', 'fresh'], native: true, pollinators: 3, note: 'Long flowering, many pollinators.' },
  { id: 'achillea', common: 'Yarrow', latin: 'Achillea millefolium', exposure: ['sun', 'partial'], soil: ['dry', 'fresh'], native: true, pollinators: 2, note: 'Tough, drought-tolerant.' },
  { id: 'malva', common: 'Common mallow', latin: 'Malva sylvestris', exposure: ['sun', 'partial'], soil: ['fresh'], native: true, pollinators: 2, note: 'Big flowers for bumblebees.' },
  { id: 'lamium', common: 'White dead-nettle', latin: 'Lamium album', exposure: ['partial', 'shade'], soil: ['fresh', 'moist'], native: true, pollinators: 3, note: 'Early food for bumblebees in shady spots.' },
  { id: 'geranium', common: 'Herb-Robert', latin: 'Geranium robertianum', exposure: ['shade', 'partial'], soil: ['fresh', 'moist'], native: true, pollinators: 1, note: 'Fine in deep shade.' },
  { id: 'primula', common: 'Primrose', latin: 'Primula vulgaris', exposure: ['shade', 'partial'], soil: ['moist'], native: true, pollinators: 1, note: 'Likes cool, moist shade.' },
  { id: 'petunia', common: 'Petunia (bedding)', latin: 'Petunia × hybrida', exposure: ['sun'], soil: ['fresh', 'moist'], native: false, pollinators: 0, note: 'Pretty, but exotic and thirsty — not allowed by the charter.' },
]
const FLOWERS: Plant[] = FLOWERS_RAW.map((p) => ({ ...p, type: 'flowers' as const, source: 'curated' as const }))

/** Edible plants — simplified growing needs for a street planter. */
const EDIBLE_RAW: Raw[] = [
  { id: 'thyme', common: 'Thyme', latin: 'Thymus vulgaris', exposure: ['sun'], soil: ['dry'], native: false, pollinators: 3, note: 'Herb that flowers for bees; needs little water.' },
  { id: 'tomato', common: 'Cherry tomato', latin: 'Solanum lycopersicum', exposure: ['sun'], soil: ['fresh', 'moist'], native: false, pollinators: 1, note: 'Needs full sun and regular watering.' },
  { id: 'strawberry', common: 'Strawberry', latin: 'Fragaria vesca', exposure: ['sun', 'partial'], soil: ['fresh'], native: true, pollinators: 2, note: 'Wild strawberry copes with partial shade.' },
  { id: 'chard', common: 'Swiss chard', latin: 'Beta vulgaris', exposure: ['partial', 'sun'], soil: ['fresh', 'moist'], native: false, pollinators: 0, note: 'Easy leafy crop for half-shade.' },
  { id: 'mint', common: 'Mint', latin: 'Mentha spicata', exposure: ['partial', 'shade'], soil: ['moist'], native: false, pollinators: 2, note: 'Wants moisture — grows in shade.' },
  { id: 'lettuce', common: 'Lettuce', latin: 'Lactuca sativa', exposure: ['partial'], soil: ['moist', 'fresh'], native: false, pollinators: 0, note: 'Bolts in hot sun; prefers half-shade.' },
  { id: 'sage', common: 'Garden sage', latin: 'Salvia officinalis', exposure: ['sun', 'partial'], soil: ['dry', 'fresh'], native: false, pollinators: 3, note: 'Hardy herb: copes with dry soil and some shade; bees love its flowers.' },
  { id: 'wild-garlic', common: 'Wild garlic', latin: 'Allium ursinum', exposure: ['shade', 'partial'], soil: ['fresh', 'moist'], native: true, pollinators: 2, note: 'Native woodland herb: edible leaves, happy in shade.' },
  { id: 'rosemary', common: 'Rosemary', latin: 'Salvia rosmarinus', exposure: ['sun'], soil: ['dry'], native: false, pollinators: 3, note: 'Mediterranean, drought-proof, early bee food.' },
]
const EDIBLE: Plant[] = EDIBLE_RAW.map((p) => ({ ...p, type: 'edible' as const, source: 'curated' as const }))

/** Trees — real data: City of Paris tree-species guide (open data, ODbL), street-suitable species only. */
interface GuideRow { common: string; latin: string; size: string; street: boolean; exposure: Exposure[]; soil: Soil[]; native: string; flowers: boolean }
const TREES: Plant[] = (guide as GuideRow[])
  .filter((g) => g.street)
  .map((g, i) => ({
    id: `tree-${i}`,
    type: 'tree' as const,
    common: g.common,
    latin: g.latin,
    exposure: g.exposure,
    soil: g.soil,
    native: /indig/i.test(g.native ?? ''),
    pollinators: g.flowers ? 2 : 0,
    note: `${g.size ?? ''} tree · ${g.native ?? ''}`.trim(),
    source: 'guide' as const,
  }))

export const PLANTS: Record<PlantingType, Plant[]> = { flowers: FLOWERS, edible: EDIBLE, tree: TREES }

export const EXPOSURE_LABEL: Record<Exposure, string> = { sun: 'Full sun', partial: 'Half shade', shade: 'Shade' }
export const SOIL_LABEL: Record<Soil, string> = { dry: 'Dry soil', fresh: 'Normal soil', moist: 'Moist soil', wet: 'Wet soil' }
export const SITE_LABEL = { 'tree-base': 'Tree base', planter: 'Street planter', street: 'Street tree pit' } as const
export const TYPE_LABEL: Record<PlantingType, string> = { flowers: 'Pollinator flowers', edible: 'Edible garden', tree: 'Street tree' }

export const fits = (p: Plant, exposure: Exposure, soil: Soil) => p.exposure.includes(exposure) && p.soil.includes(soil)
