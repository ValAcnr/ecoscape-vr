/**
 * EcoScape — prototype configuration.
 *
 * The team has not decided yet between Paris and New York, nor between trees and
 * pollinator / edible plantings. Everything that depends on those choices is set here.
 */

export type CityId = 'paris' | 'nyc'
export type PlantingType = 'flowers' | 'edible' | 'tree'

export interface CityConfig {
  id: CityId
  label: string
  hoods: string[] // ids of src/data/hood-<id>.json
  /** One-line context for the onboarding "problem" slide, with its source. */
  problem: { stat: string; caption: string; source: string }
  /** Legal framework the app plugs into. */
  framework: string
  /** Illustrative, fictional partners (prototype only — no real partnership implied). */
  demoPartners: string[]
  demoSponsor: string
}

export const CITIES: Record<CityId, CityConfig> = {
  paris: {
    id: 'paris',
    label: 'Paris',
    hoods: ['belleville', 'goutte-dor', 'butte-aux-cailles'],
    problem: {
      stat: '17.6%',
      caption: 'tree canopy inside Paris city walls in 2025. Streets heat up, pollinators lose food.',
      source: 'Ville de Paris, Indice de canopée (open data, 2025)',
    },
    framework: "Plantings follow the City of Paris 'permis de végétaliser' charter: local & bee-friendly plants, no pesticides, no plastic.",
    demoPartners: ['Belleville Green Collective', 'Les Racines du Quartier', 'Jardiniers du 20e'],
    demoSponsor: 'Demo Sponsor Co.',
  },
  nyc: {
    id: 'nyc',
    label: 'New York',
    hoods: ['bed-stuy', 'harlem', 'east-harlem', 'washington-heights', 'lower-east-side', 'mott-haven', 'bushwick', 'sunset-park', 'jackson-heights'],
    problem: {
      stat: '30%',
      caption: 'canopy goal for New York City by 2040 under Local Law 148 — from 23.4% in 2021.',
      source: 'NYC Urban Forest Plan (2026); NYC Comptroller (2026)',
    },
    framework: 'Plantings support the NYC Urban Forest Plan (Local Law 148) and community gardens.',
    demoPartners: ['Bed-Stuy Block Gardeners', 'Brooklyn Shade Crew', 'Uptown Bloom Collective'],
    demoSponsor: 'Demo Sponsor Co.',
  },
}

export const CONFIG = {
  /** Launch city — the project targets New York; switch to 'paris' to show the Paris version. */
  city: 'nyc' as CityId,

  /** Planting types offered in missions, and their share. Remove 'tree' for a pollinator/edible-only concept. */
  plantingTypes: ['flowers', 'edible', 'tree'] as PlantingType[],

  /** Real plantings a player can unlock. */
  maxPlantings: 4,

  /** Score (out of 100) needed to pass a mission. */
  passScore: 70,

  /** Missions can only be started within this distance (metres) of the player. */
  missionRadiusM: 60,

  /** Brand: 'bloom' for the player app, 'canopy' (quieter) for the sponsor space. */
  brand: { player: 'bloom', sponsor: 'canopy' } as const,

  /** Show the corner "prototype" ribbon (off: it hid controls; the prototype label lives in onboarding, profile and the desktop panel). */
  showPrototypeRibbon: false,
}

export const city = (id: CityId = CONFIG.city) => CITIES[id]
