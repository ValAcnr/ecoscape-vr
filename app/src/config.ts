/**
 * EcoScape — prototype configuration.
 *
 * The project is decided: New York only, and every reward is a real street TREE.
 * The Paris version (code + open data) is kept in the repo but hidden from the interface.
 */

export type CityId = 'paris' | 'nyc'
/** Only street trees are earned. (Older mission data may still carry 'flowers' / 'edible': they are played as trees.) */
export type PlantingType = 'tree'

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
      caption: 'tree canopy inside Paris city walls in 2025. Streets heat up.',
      source: 'Ville de Paris, Indice de canopée (open data, 2025)',
    },
    framework: 'Street trees follow the City of Paris tree-species guide.',
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
    framework: 'Street trees follow NYC Parks street-tree standards and support the NYC Urban Forest Plan (Local Law 148). The partner NGO plants each tree, then cares for it for 3 years with 2 inspections a year.',
    demoPartners: ['Bed-Stuy Tree Stewards', 'Brooklyn Shade Crew', 'Uptown Canopy Collective'],
    demoSponsor: 'Demo Sponsor Co.',
  },
}

export const CONFIG = {
  /** The app runs in New York only. (The Paris data is kept but no longer offered in the interface.) */
  city: 'nyc' as CityId,

  /** Show the city picker (Paris / New York). Off: the app stays on New York. */
  showCityPicker: false,

  /** Real street trees a player can earn. After that: maintenance mode (watering missions, badges). */
  maxPlantings: 4,

  /** The partner NGO cares for each tree for this many years, with this many inspections a year. */
  careYears: 3,
  inspectionsPerYear: 2,

  /** Watering target for a young street tree, May to October (NYC Parks guidance). */
  water: { minGal: 15, maxGal: 20, months: ['May', 'June', 'July', 'August', 'September', 'October'] },

  /** Score (out of 100) needed to pass a mission. */
  passScore: 70,

  /** Missions can only be started within this distance (metres) of the player. */
  missionRadiusM: 60,

  /** Show the corner "prototype" ribbon (off: it hid controls; the prototype label lives in onboarding, profile and the desktop panel). */
  showPrototypeRibbon: false,
}

export const city = (id: CityId = CONFIG.city) => CITIES[id]
