/** Mock community content — fictional neighbours, illustrative only. Every reward is a real street tree. */
import type { CityId, PlantingType } from '../config'

export interface Post {
  id: string
  who: string
  color: string
  when: string
  kind: 'planting' | 'growth' | 'challenge' | 'badge'
  text: string
  /** name = the tree's name given by its player; species shown underneath. */
  plant?: { type: PlantingType; name: string; species: string; stage: number }
  likes: number
  street?: string
}

/** Neighbourhood league: ranked by trees still ALIVE (not by trees planted). */
export interface LeagueRow { hood: string; hoodId?: string; alive: number; planted: number }

/* ---------- Paris (kept, hidden in the interface) ---------- */
const POSTS_PARIS: Post[] = [
  { id: 'p1', who: 'Lina M.', color: 'var(--lilac)', when: '2 h', kind: 'planting', text: "Won my 2nd mission! 'Vilin Shade Tree' gets planted next week by the Belleville Green Collective 🌳", plant: { type: 'tree', name: 'Vilin Shade Tree', species: 'Field maple', stage: 1 }, likes: 24, street: 'Rue Vilin' },
  { id: 'p2', who: 'Malik B.', color: 'var(--honey)', when: '5 h', kind: 'growth', text: 'First inspection passed for our lime tree on Rue Moret. Watering rota with the neighbours works!', plant: { type: 'tree', name: 'Moret Lime', species: 'Small-leaved lime', stage: 2 }, likes: 41, street: 'Rue Moret' },
]
const CHALLENGES_PARIS = [
  { id: 'c1', title: 'Belleville Shade Week', desc: 'Earn 20 new street trees', done: 13, goal: 20, ends: '5 days left', reward: 'Shade Maker badge' },
]
const LEADERBOARD_PARIS: LeagueRow[] = [
  { hood: 'Belleville', hoodId: 'belleville', alive: 44, planted: 46 },
  { hood: 'Butte-aux-Cailles', hoodId: 'butte-aux-cailles', alive: 35, planted: 38 },
  { hood: "La Goutte d'Or", hoodId: 'goutte-dor', alive: 27, planted: 29 },
]
const SPONSOR_PARIS = {
  funded: 120, planted: 84, alive: 81, players: 1460, missions: 3920, avgScore: 78, shares: 612,
  hoods: [
    { name: 'Belleville', funded: 46, planted: 35 },
    { name: 'Butte-aux-Cailles', funded: 41, planted: 30 },
    { name: "La Goutte d'Or", funded: 33, planted: 19 },
  ],
  species: [['Field maple', 30], ['Small-leaved lime', 26], ['Ginkgo', 16], ['Other', 12]] as [string, number][],
  latest: [
    ['Rue Vilin', 'Field maple', 'Inspection 1 · OK'],
    ['Rue Moret', 'Small-leaved lime', 'Planted'],
  ],
}

/* ---------- New York ---------- */
const POSTS_NYC: Post[] = [
  { id: 'n1', who: 'Keisha W.', color: 'var(--lilac)', when: '2 h', kind: 'planting', text: "Won my 2nd mission! 'Halsey Honey' gets planted next week by the Bed-Stuy Tree Stewards 🌳", plant: { type: 'tree', name: 'Halsey Honey', species: 'Thornless honeylocust', stage: 1 }, likes: 24, street: 'Halsey Street' },
  { id: 'n2', who: 'Marco T.', color: 'var(--honey)', when: '5 h', kind: 'growth', text: 'Our ginkgo on Knickerbocker passed its first inspection. 15 gallons every Saturday all summer!', plant: { type: 'tree', name: 'Knick the Ginkgo', species: 'Ginkgo', stage: 2 }, likes: 41, street: 'Knickerbocker Avenue' },
  { id: 'n3', who: 'Priya S.', color: '#a9bfac', when: 'Yesterday', kind: 'badge', text: 'Got the Green Thumb badge (94/100). Tip: small pit + half shade = Eastern redbud, not a London planetree 😅', likes: 17 },
  { id: 'n4', who: 'Darnell J.', color: 'var(--petal)', when: 'Yesterday', kind: 'growth', text: 'Our little-leaf linden on Malcolm X Boulevard made it through its first summer. Mulch + the block watering rota = alive!', plant: { type: 'tree', name: 'Big Mal', species: 'Little-leaf linden', stage: 3 }, likes: 33, street: 'Malcolm X Boulevard' },
  { id: 'n5', who: 'Ana L.', color: '#d9e2c7', when: '2 days', kind: 'planting', text: 'First tree earned: a hedge maple for the kids in my building in Sunset Park. They named it 🌳', plant: { type: 'tree', name: 'Señor Maple', species: 'Hedge maple', stage: 1 }, likes: 12, street: '43rd Street' },
  { id: 'n6', who: 'Wei C.', color: 'var(--lilac)', when: '3 days', kind: 'planting', text: 'Lower East Side represent: a Japanese zelkova is coming to Orchard Street 🌳', plant: { type: 'tree', name: 'Orchard Zel', species: 'Japanese zelkova', stage: 1 }, likes: 28, street: 'Orchard Street' },
]

const CHALLENGES_NYC = [
  { id: 'c1', title: 'Brooklyn Shade Week', desc: 'Earn 20 new street trees in Brooklyn', done: 13, goal: 20, ends: '5 days left', reward: 'Shade Maker badge' },
  { id: 'c2', title: 'Summer Watering Rota', desc: 'Win 50 watering missions: 15–20 gallons a week for young trees', done: 31, goal: 50, ends: '12 days left', reward: 'Tree Keeper badge' },
]

const LEADERBOARD_NYC: LeagueRow[] = [
  { hood: 'Harlem', hoodId: 'harlem', alive: 41, planted: 44 },
  { hood: 'Bedford-Stuyvesant', hoodId: 'bed-stuy', alive: 39, planted: 52 },
  { hood: 'Bushwick', hoodId: 'bushwick', alive: 34, planted: 37 },
  { hood: 'Mott Haven', hoodId: 'mott-haven', alive: 27, planted: 31 },
  { hood: 'Sunset Park', hoodId: 'sunset-park', alive: 25, planted: 26 },
  { hood: 'Washington Heights', hoodId: 'washington-heights', alive: 19, planted: 24 },
]

const SPONSOR_NYC = {
  funded: 240, planted: 171, alive: 158, players: 3280, missions: 8740, avgScore: 77, shares: 1390,
  hoods: [
    { name: 'Bedford-Stuyvesant', funded: 60, planted: 48 },
    { name: 'Harlem', funded: 52, planted: 39 },
    { name: 'Bushwick', funded: 44, planted: 31 },
    { name: 'Mott Haven', funded: 46, planted: 29 },
    { name: 'Sunset Park', funded: 38, planted: 24 },
  ],
  species: [['Thornless honeylocust', 46], ['Ginkgo', 38], ['Little-leaf linden', 31], ['Hedge maple', 29], ['Other', 27]] as [string, number][],
  latest: [
    ['Halsey St, Bed-Stuy', 'Thornless honeylocust', 'Inspection 2 · OK'],
    ['Knickerbocker Ave, Bushwick', 'Ginkgo', 'Inspection 1 · OK'],
    ['Malcolm X Blvd, Harlem', 'Little-leaf linden', 'Planted'],
    ["St Ann's Ave, Mott Haven", 'Eastern redbud', 'Scheduled'],
  ],
}

const BY_CITY = {
  paris: { posts: POSTS_PARIS, challenges: CHALLENGES_PARIS, leaderboard: LEADERBOARD_PARIS, sponsor: SPONSOR_PARIS },
  nyc: { posts: POSTS_NYC, challenges: CHALLENGES_NYC, leaderboard: LEADERBOARD_NYC, sponsor: SPONSOR_NYC },
}

/** Community + sponsor demo content for a city. */
export const social = (city: CityId) => BY_CITY[city]
