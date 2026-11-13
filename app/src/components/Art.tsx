import type { PlantingType } from '../config'

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="EcoScape">
      <rect x="2" y="2" width="60" height="60" rx="18" fill="#14281d" />
      <g fill="#cda88b">
        <circle cx="32" cy="20" r="9" /><circle cx="44" cy="32" r="9" /><circle cx="32" cy="44" r="9" /><circle cx="20" cy="32" r="9" />
      </g>
      <circle cx="32" cy="32" r="7" fill="#e6c7b2" />
      <path d="M48 50l6 6" stroke="#1b603a" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

/** Illustration of a street tree in its pit at a growth stage (0 = sapling ordered … 4 = established). Original SVG.
 *  variant: 0 round canopy, 1 tall / oval, 2 wide and airy — so three species never look the same. */
export function PlantArt({ stage = 3, w = 64, bg = true, label, variant = 0 }: { type?: PlantingType; stage?: number; w?: number; bg?: boolean; label?: string; variant?: number }) {
  const s = Math.max(0, Math.min(4, stage))
  const k = 0.35 + s * 0.17
  const v = ((variant % 3) + 3) % 3
  const greens = [['#1b603a', '#279160'], ['#14482c', '#1b603a'], ['#8fa996', '#a9bfac']][v]
  return (
    <svg width={w} height={w} viewBox="0 0 100 100" role="img" aria-label={label ?? 'Street tree illustration'}>
      {bg && <rect width="100" height="100" rx="18" fill={['#e3eadf', '#d9e2c7', '#eadfc8'][v]} />}
      <rect x="10" y="82" width="80" height="8" rx="3" fill="#d9bfa2" />
      <rect x="28" y="81" width="44" height="6" rx="2" fill="#6b4f2f" />
      {s === 0 ? (
        <g>
          <rect x="48.5" y="62" width="3" height="20" rx="1.5" fill="#7a5533" />
          <path d="M50 66c-7 0-10-5-10-8 6 0 10 3 10 8zM50 62c6 0 9-5 9-8-6 0-9 3-9 8z" fill="#1b603a" />
        </g>
      ) : (
        <g transform={`translate(50 82) scale(${k}) translate(-50 -82)`}>
          <rect x="46" y="44" width="8" height="38" rx="3" fill="#7a5533" />
          {v === 0 && (<>
            <circle cx="50" cy="36" r="24" fill={greens[0]} stroke="#14281d" strokeWidth="2.5" />
            <circle cx="36" cy="44" r="14" fill={greens[0]} stroke="#14281d" strokeWidth="2.5" />
            <circle cx="64" cy="44" r="14" fill={greens[1]} stroke="#14281d" strokeWidth="2.5" />
          </>)}
          {v === 1 && <ellipse cx="50" cy="34" rx="17" ry="30" fill={greens[1]} stroke="#14281d" strokeWidth="2.5" />}
          {v === 2 && (<>
            <ellipse cx="50" cy="40" rx="34" ry="15" fill={greens[0]} stroke="#14281d" strokeWidth="2.5" />
            <ellipse cx="50" cy="30" rx="22" ry="11" fill={greens[1]} stroke="#14281d" strokeWidth="2.5" />
          </>)}
        </g>
      )}
      {s >= 1 && <rect x="28" y="80" width="44" height="7" rx="2" fill="none" stroke="#14281d" strokeWidth="1.5" opacity=".5" />}
    </svg>
  )
}

export function Avatar({ name, color }: { name: string; color: string }) {
  return <div className="avatar" style={{ background: color }} aria-hidden>{name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</div>
}
