import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { CONFIG, type CityId, type PlantingType } from './config'

export interface Planting {
  id: string
  missionId: string
  hoodId: string
  type: PlantingType
  plantId: string
  plantName: string
  latin: string
  name: string
  lat: number
  lon: number
  addr: string | null
  partner: string
  score: number
  createdAt: number
}

export interface GameState {
  onboarded: boolean
  city: CityId
  hoodId: string | null
  player: [number, number] | null
  plantings: Planting[]
  missionsPlayed: number
  missionsPassed: number
  bestScore: number
  badges: string[]
  shares: number
  likes: string[]
  /** Demo time-travel for the follow-up screen (months after unlock). */
  monthsAhead: number
  /** Mission last opened (mobile) — the VR mini-game plays the same one. */
  activeMissionId: string | null
}

const KEY = 'ecoscape-state-v2' // v2: New York is the default city
const fresh = (): GameState => ({
  onboarded: false,
  city: CONFIG.city,
  hoodId: null,
  player: null,
  plantings: [],
  missionsPlayed: 0,
  missionsPassed: 0,
  bestScore: 0,
  badges: [],
  shares: 0,
  likes: [],
  monthsAhead: 0,
  activeMissionId: null,
})

function load(): GameState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...fresh(), ...JSON.parse(raw) }
  } catch {
    /* private mode / blocked storage: run without persistence */
  }
  return fresh()
}

interface Ctx {
  s: GameState
  set: (patch: Partial<GameState> | ((s: GameState) => Partial<GameState>)) => void
  reset: () => void
  addBadge: (b: string) => void
}

const C = createContext<Ctx | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<GameState>(load)
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(s))
    } catch {
      /* ignore */
    }
  }, [s])
  // Keep every open copy of the app in sync (other tabs, and the two iframes of /compare):
  // when another copy saves, adopt its state instead of overwriting it later with a stale one.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY || !e.newValue) return
      try { setS({ ...fresh(), ...JSON.parse(e.newValue) }) } catch { /* ignore malformed */ }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])
  const set = useCallback<Ctx['set']>((patch) => setS((prev) => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) })), [])
  const reset = useCallback(() => setS(fresh()), [])
  const addBadge = useCallback((b: string) => setS((p) => (p.badges.includes(b) ? p : { ...p, badges: [...p.badges, b] })), [])
  const v = useMemo(() => ({ s, set, reset, addBadge }), [s, set, reset, addBadge])
  return <C.Provider value={v}>{children}</C.Provider>
}

export function useGame() {
  const c = useContext(C)
  if (!c) throw new Error('useGame outside provider')
  return c
}

export const BADGES: Record<string, { label: string; desc: string; color: string }> = {
  first: { label: 'First Seed', desc: 'Unlocked your first real planting', color: 'var(--honey)' },
  bee: { label: 'Bee Buddy', desc: 'Planted pollinator flowers', color: 'var(--honey)' },
  shade: { label: 'Shade Maker', desc: 'Planted a street tree', color: '#9be2b9' },
  grower: { label: 'Street Grower', desc: 'Planted an edible garden', color: '#9be2b9' },
  perfect: { label: 'Green Thumb', desc: 'Scored 90+ in a mission', color: 'var(--lilac)' },
  water: { label: 'Water Wise', desc: 'Perfect watering rhythm', color: '#bcdcff' },
  sharer: { label: 'Storyteller', desc: 'Shared a planting story', color: 'var(--petal)' },
  full: { label: 'Four Seasons', desc: 'Unlocked all 4 plantings', color: 'var(--leaf)' },
}
