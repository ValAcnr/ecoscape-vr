/** Mock community content — fictional neighbours, illustrative only. */
import type { PlantingType } from '../config'

export interface Post {
  id: string
  who: string
  color: string
  when: string
  kind: 'planting' | 'growth' | 'challenge' | 'badge'
  text: string
  plant?: { type: PlantingType; name: string; stage: number }
  likes: number
  street?: string
}

export const POSTS: Post[] = [
  { id: 'p1', who: 'Lina M.', color: 'var(--lilac)', when: '2 h', kind: 'planting', text: "Won my 2nd mission! 'Bee Corner Vilin' is getting planted next week by the Belleville Green Collective 🐝", plant: { type: 'flowers', name: 'Wild marjoram', stage: 1 }, likes: 24, street: 'Rue Vilin' },
  { id: 'p2', who: 'Malik B.', color: 'var(--honey)', when: '5 h', kind: 'growth', text: 'One month later: my thyme planter is flowering and covered in bees. Go see it, corner of Rue Moret!', plant: { type: 'edible', name: 'Thyme', stage: 3 }, likes: 41, street: 'Rue Moret' },
  { id: 'p3', who: 'Chloé R.', color: '#9be2b9', when: 'Yesterday', kind: 'badge', text: 'Got the Green Thumb badge (94/100). Tip: half-shade + moist soil = mint, not tomatoes 😅', likes: 17 },
  { id: 'p4', who: 'Sam K.', color: 'var(--petal)', when: 'Yesterday', kind: 'growth', text: 'Our tree base on Rue Julien Lacroix after 3 months. Watering rota with the neighbours works!', plant: { type: 'flowers', name: 'Field scabious', stage: 4 }, likes: 33, street: 'Rue Julien Lacroix' },
  { id: 'p5', who: 'Inès D.', color: '#bcdcff', when: '2 days', kind: 'planting', text: 'First planting unlocked: a cherry tomato planter for the kids of my building 🍅', plant: { type: 'edible', name: 'Cherry tomato', stage: 1 }, likes: 12, street: 'Rue de Ménilmontant' },
]

export const CHALLENGES = [
  { id: 'c1', title: 'Belleville Bee Week', desc: 'Plant 20 tree bases with pollinator flowers', done: 13, goal: 20, ends: '5 days left', reward: 'Bee Buddy+ badge' },
  { id: 'c2', title: 'Cool Corners', desc: 'Win 10 missions in the hottest streets', done: 4, goal: 10, ends: '12 days left', reward: 'Shade Maker badge' },
]

export const LEADERBOARD = [
  { hood: 'Belleville', plantings: 46 },
  { hood: 'Butte-aux-Cailles', plantings: 38 },
  { hood: "La Goutte d'Or", plantings: 29 },
]

/** Sponsor dashboard demo numbers (illustrative). */
export const SPONSOR = {
  funded: 120,
  planted: 84,
  players: 1460,
  missions: 3920,
  avgScore: 78,
  shares: 612,
  hoods: [
    { name: 'Belleville', funded: 46, planted: 35 },
    { name: 'Butte-aux-Cailles', funded: 41, planted: 30 },
    { name: "La Goutte d'Or", funded: 33, planted: 19 },
  ],
  mix: { flowers: 58, edible: 44, tree: 18 },
}
