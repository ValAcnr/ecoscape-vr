/** Mock community content — fictional neighbours, illustrative only. */
import type { CityId, PlantingType } from '../config'

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

const POSTS_PARIS: Post[] = [
  { id: 'p1', who: 'Lina M.', color: 'var(--lilac)', when: '2 h', kind: 'planting', text: "Won my 2nd mission! 'Bee Corner Vilin' is getting planted next week by the Belleville Green Collective 🐝", plant: { type: 'flowers', name: 'Wild marjoram', stage: 1 }, likes: 24, street: 'Rue Vilin' },
  { id: 'p2', who: 'Malik B.', color: 'var(--honey)', when: '5 h', kind: 'growth', text: 'One month later: my thyme planter is flowering and covered in bees. Go see it, corner of Rue Moret!', plant: { type: 'edible', name: 'Thyme', stage: 3 }, likes: 41, street: 'Rue Moret' },
  { id: 'p3', who: 'Chloé R.', color: '#9be2b9', when: 'Yesterday', kind: 'badge', text: 'Got the Green Thumb badge (94/100). Tip: half-shade + moist soil = mint, not tomatoes 😅', likes: 17 },
  { id: 'p4', who: 'Sam K.', color: 'var(--petal)', when: 'Yesterday', kind: 'growth', text: 'Our tree base on Rue Julien Lacroix after 3 months. Watering rota with the neighbours works!', plant: { type: 'flowers', name: 'Field scabious', stage: 4 }, likes: 33, street: 'Rue Julien Lacroix' },
  { id: 'p5', who: 'Inès D.', color: '#bcdcff', when: '2 days', kind: 'planting', text: 'First planting unlocked: a cherry tomato planter for the kids of my building 🍅', plant: { type: 'edible', name: 'Cherry tomato', stage: 1 }, likes: 12, street: 'Rue de Ménilmontant' },
]

const CHALLENGES_PARIS = [
  { id: 'c1', title: 'Belleville Bee Week', desc: 'Plant 20 tree bases with pollinator flowers', done: 13, goal: 20, ends: '5 days left', reward: 'Bee Buddy+ badge' },
  { id: 'c2', title: 'Cool Corners', desc: 'Win 10 missions in the hottest streets', done: 4, goal: 10, ends: '12 days left', reward: 'Shade Maker badge' },
]

const LEADERBOARD_PARIS = [
  { hood: 'Belleville', plantings: 46 },
  { hood: 'Butte-aux-Cailles', plantings: 38 },
  { hood: "La Goutte d'Or", plantings: 29 },
]

/** Sponsor dashboard demo numbers (illustrative). */
const SPONSOR_PARIS = {
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
  latest: [
    ['Rue Vilin', 'Wild marjoram', 'Photo · month 1'],
    ['Rue Moret', 'Thyme planter', 'Photo · month 3'],
    ['Rue Julien Lacroix', 'Field scabious', 'Planted'],
    ['Rue Desargues', 'Street tree', 'Scheduled'],
  ],
}

/* ---------- New York ---------- */
const POSTS_NYC: Post[] = [
  { id: 'n1', who: 'Keisha W.', color: 'var(--lilac)', when: '2 h', kind: 'planting', text: "Won my 2nd mission! 'Bee Corner Halsey' gets planted next week by the Bed-Stuy Block Gardeners 🐝", plant: { type: 'flowers', name: 'Wild marjoram', stage: 1 }, likes: 24, street: 'Halsey Street' },
  { id: 'n2', who: 'Marco T.', color: 'var(--honey)', when: '5 h', kind: 'growth', text: 'One month later: our thyme planter on Knickerbocker is flowering and full of bees. Come see it!', plant: { type: 'edible', name: 'Thyme', stage: 3 }, likes: 41, street: 'Knickerbocker Avenue' },
  { id: 'n3', who: 'Priya S.', color: '#9be2b9', when: 'Yesterday', kind: 'badge', text: 'Got the Green Thumb badge (94/100). Tip: half-shade + moist soil = mint, not tomatoes 😅', likes: 17 },
  { id: 'n4', who: 'Darnell J.', color: 'var(--petal)', when: 'Yesterday', kind: 'growth', text: 'Our tree pit on Malcolm X Boulevard after 3 months. The block watering rota works!', plant: { type: 'flowers', name: 'Field scabious', stage: 4 }, likes: 33, street: 'Malcolm X Boulevard' },
  { id: 'n5', who: 'Ana L.', color: '#bcdcff', when: '2 days', kind: 'planting', text: 'First planting unlocked: a cherry tomato planter for the kids in my building in Sunset Park 🍅', plant: { type: 'edible', name: 'Cherry tomato', stage: 1 }, likes: 12, street: '43rd Street' },
  { id: 'n6', who: 'Wei C.', color: 'var(--lilac)', when: '3 days', kind: 'planting', text: 'Lower East Side represent: a shade tree is coming to Orchard Street 🌳', plant: { type: 'tree', name: 'Street tree', stage: 1 }, likes: 28, street: 'Orchard Street' },
]

const CHALLENGES_NYC = [
  { id: 'c1', title: 'Brooklyn Bee Week', desc: 'Plant 20 tree pits with pollinator flowers', done: 13, goal: 20, ends: '5 days left', reward: 'Bee Buddy+ badge' },
  { id: 'c2', title: 'Cool Blocks', desc: 'Win 10 missions on the hottest blocks', done: 4, goal: 10, ends: '12 days left', reward: 'Shade Maker badge' },
]

const LEADERBOARD_NYC = [
  { hood: 'Bedford-Stuyvesant', plantings: 52 },
  { hood: 'Harlem', plantings: 44 },
  { hood: 'Bushwick', plantings: 37 },
  { hood: 'Mott Haven', plantings: 31 },
  { hood: 'Sunset Park', plantings: 26 },
]

const SPONSOR_NYC = {
  funded: 240,
  planted: 171,
  players: 3280,
  missions: 8740,
  avgScore: 77,
  shares: 1390,
  hoods: [
    { name: 'Bedford-Stuyvesant', funded: 60, planted: 48 },
    { name: 'Harlem', funded: 52, planted: 39 },
    { name: 'Bushwick', funded: 44, planted: 31 },
    { name: 'Mott Haven', funded: 46, planted: 29 },
    { name: 'Sunset Park', funded: 38, planted: 24 },
  ],
  mix: { flowers: 112, edible: 84, tree: 44 },
  latest: [
    ['Halsey Street, Bed-Stuy', 'Wild marjoram', 'Photo · month 1'],
    ['Knickerbocker Ave, Bushwick', 'Thyme planter', 'Photo · month 3'],
    ['Malcolm X Blvd, Harlem', 'Field scabious', 'Planted'],
    ["St Ann's Ave, Mott Haven", 'Street tree', 'Scheduled'],
  ],
}

const BY_CITY = {
  paris: { posts: POSTS_PARIS, challenges: CHALLENGES_PARIS, leaderboard: LEADERBOARD_PARIS, sponsor: SPONSOR_PARIS },
  nyc: { posts: POSTS_NYC, challenges: CHALLENGES_NYC, leaderboard: LEADERBOARD_NYC, sponsor: SPONSOR_NYC },
}

/** Community + sponsor demo content for a city. */
export const social = (city: CityId) => BY_CITY[city]
