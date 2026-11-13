/** Tree names: suggestion + a simple filter against rude words (prototype-level, not a moderation system). */

const BLOCKED = [
  'fuck', 'fuk', 'shit', 'bitch', 'cunt', 'nigg', 'fag', 'whore', 'slut', 'bastard', 'asshole', 'dickhead', 'wank', 'twat', 'retard', 'rape', 'nazi', 'hitler',
  'pussy', 'penis', 'vagina', 'porn', 'cock', 'motherf', 'putain', 'merde', 'connard', 'connasse', 'salope', 'encul', 'pute', 'batard',
]
/** Short words matched as whole words only (so "Grass", "Scunthorpe" or "Dickens" are fine). */
const BLOCKED_WORDS = ['ass', 'arse', 'dick', 'tit', 'tits', 'cum', 'sex', 'kkk', 'fdp', 'pd', 'con', 'nique', 'kill', 'die']

const LEET: Record<string, string> = { '0': 'o', '1': 'i', '!': 'i', '3': 'e', '4': 'a', '@': 'a', '5': 's', '$': 's', '7': 't', '8': 'b' }
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[0-9!@$]/g, (c) => LEET[c] ?? c)

export function isClean(name: string) {
  const n = norm(name)
  const squashed = n.replace(/[^a-z]/g, '').replace(/(.)\1+/g, '$1')
  if (BLOCKED.some((w) => n.replace(/[^a-z]/g, '').includes(w) || squashed.includes(w.replace(/(.)\1+/g, '$1')))) return false
  const words = n.split(/[^a-z]+/).filter(Boolean)
  return !words.some((w) => BLOCKED_WORDS.includes(w))
}

export const NAME_MIN = 2
export const NAME_MAX = 24

/** Returns an error message, or null when the name is fine. */
export function checkName(raw: string): string | null {
  const name = raw.trim().replace(/\s+/g, ' ')
  if (name.length < NAME_MIN) return `Give your tree a name (at least ${NAME_MIN} letters).`
  if (name.length > NAME_MAX) return `Keep it short: ${NAME_MAX} characters max.`
  if (!/[\p{L}]/u.test(name)) return 'Use at least one letter.'
  if (!isClean(name)) return 'Let’s keep it friendly — your neighbours will see this name. Try another one.'
  return null
}

export const cleanName = (raw: string) => raw.trim().replace(/\s+/g, ' ')

/** Default suggestion from the street: "Lafayette Shade Tree". */
export function suggestName(addr: string | null, fallback: string) {
  const street = addr
    ? addr.replace(/^(Rue|Avenue|Boulevard|Place) (de la |du |des |de l'|de |d')?/, '').replace(/ (Street|Avenue|Road|Place|Boulevard|Drive|Parkway)$/, '').replace(/^(East|West|North|South) /, '')
    : fallback
  return `${street} Shade Tree`.slice(0, NAME_MAX)
}
