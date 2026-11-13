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
  /** Maintenance (watering) missions won after the 4 trees were earned. */
  careMissions: number
  bestScore: number
  badges: string[]
  shares: number
  likes: string[]
  /** Demo time-travel for the follow-up screen (months after unlock). */
  monthsAhead: number
  /** Mission last opened (mobile) — the VR mini-game plays the same one. */
  activeMissionId: string | null
}

const KEY = 'ecoscape-state-v3' // v3: street trees only, New York only
const fresh = (): GameState => ({
  onboarded: false,
  city: CONFIG.city,
  hoodId: null,
  player: null,
  plantings: [],
  missionsPlayed: 0,
  missionsPassed: 0,
  careMissions: 0,
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
    // The city picker is hidden: always New York, whatever an older copy stored.
    if (raw) return { ...fresh(), ...JSON.parse(raw), ...(CONFIG.showCityPicker ? {} : { city: CONFIG.city }) }
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
  first: { label: 'First Tree', desc: 'Earned your first real street tree', color: 'var(--honey)' },
  shade: { label: 'Shade Maker', desc: 'Picked a large-canopy tree for a big pit', color: '#a9bfac' },
  perfect: { label: 'Green Thumb', desc: 'Scored 90+ in a mission', color: 'var(--lilac)' },
  water: { label: 'Water Wise', desc: '15–20 gallons a week, all season', color: '#d9e2c7' },
  sharer: { label: 'Storyteller', desc: 'Shared your tree’s story', color: 'var(--petal)' },
  full: { label: 'Four Trees', desc: 'Earned all 4 street trees', color: 'var(--leaf)' },
  keeper: { label: 'Tree Keeper', desc: 'Won a maintenance (watering) mission', color: '#d9bfa2' },
  guardian: { label: 'Block Guardian', desc: 'Won 5 maintenance missions', color: '#8fa996' },
}
