import type { PlantingType } from '../config'

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="EcoScape">
      <rect x="2" y="2" width="60" height="60" rx="18" fill="#161320" />
      <g fill="#ffc533">
        <circle cx="32" cy="20" r="9" /><circle cx="44" cy="32" r="9" /><circle cx="32" cy="44" r="9" /><circle cx="20" cy="32" r="9" />
      </g>
      <circle cx="32" cy="32" r="7" fill="#ff6f91" />
      <path d="M48 50l6 6" stroke="#2fa36b" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

/** Illustration of a planting at a growth stage (0 = ordered … 4 = established). Original SVG. */
export function PlantArt({ type, stage = 3, w = 64, bg = true, label }: { type: PlantingType; stage?: number; w?: number; bg?: boolean; label?: string }) {
  const s = Math.max(0, Math.min(4, stage))
  const k = 0.35 + s * 0.17
  return (
    <svg width={w} height={w} viewBox="0 0 100 100" role="img" aria-label={label ?? `${type} illustration`}>
      {bg && <rect width="100" height="100" rx="18" fill={type === 'tree' ? '#d9f2e4' : type === 'edible' ? '#e6f6d8' : '#fff1c9'} />}
      <ellipse cx="50" cy="86" rx="34" ry="7" fill="#c9a777" />
      <rect x="20" y="80" width="60" height="9" rx="4" fill="#8b6a43" />
      {s === 0 ? (
        <g>
          <circle cx="50" cy="80" r="5" fill="#6b4f2f" />
          <path d="M50 74c0-6 4-9 8-9-1 5-4 8-8 9z" fill="#2fa36b" />
        </g>
      ) : type === 'tree' ? (
        <g transform={`translate(50 82) scale(${k}) translate(-50 -82)`}>
          <rect x="45" y="44" width="10" height="38" rx="3" fill="#7a5533" />
          <circle cx="50" cy="36" r="24" fill="#2fa36b" stroke="#161320" strokeWidth="2.5" />
          <circle cx="36" cy="44" r="14" fill="#38b878" stroke="#161320" strokeWidth="2.5" />
          <circle cx="64" cy="44" r="14" fill="#279160" stroke="#161320" strokeWidth="2.5" />
        </g>
      ) : type === 'edible' ? (
        <g transform={`translate(50 82) scale(${k}) translate(-50 -82)`}>
          <path d="M50 82V40M50 60l-14-10M50 52l14-10M50 70l12-6" stroke="#2f8a4f" strokeWidth="4" strokeLinecap="round" fill="none" />
          <ellipse cx="34" cy="48" rx="10" ry="6" fill="#4cb36b" stroke="#161320" strokeWidth="2" transform="rotate(-30 34 48)" />
          <ellipse cx="66" cy="40" rx="10" ry="6" fill="#4cb36b" stroke="#161320" strokeWidth="2" transform="rotate(30 66 40)" />
          {s >= 3 && (<g stroke="#161320" strokeWidth="2"><circle cx="58" cy="62" r="6" fill="#ff5d5d" /><circle cx="44" cy="58" r="5" fill="#ff7a5d" /><circle cx="50" cy="36" r="5" fill="#ff5d5d" /></g>)}
        </g>
      ) : (
        <g transform={`translate(50 82) scale(${k}) translate(-50 -82)`}>
          <path d="M50 82V44M38 82V54M62 82V50M44 82V60M56 82V58" stroke="#2f8a4f" strokeWidth="3.5" strokeLinecap="round" />
          <g stroke="#161320" strokeWidth="2">
            <circle cx="50" cy="40" r="8" fill="#b9a4ff" /><circle cx="38" cy="50" r="7" fill="#ff6f91" /><circle cx="62" cy="46" r="7" fill="#ffc533" />
            {s >= 2 && <circle cx="44" cy="56" r="6" fill="#ffc533" />}
            {s >= 3 && <circle cx="56" cy="54" r="6" fill="#b9a4ff" />}
          </g>
          {s >= 3 && (
            <g>
              <ellipse cx="72" cy="30" rx="5" ry="3.5" fill="#ffc533" stroke="#161320" strokeWidth="1.5" />
              <path d="M70 30h4M71.5 27.5v5" stroke="#161320" strokeWidth="1.2" />
              <ellipse cx="72" cy="26.5" rx="3" ry="2" fill="#fff" opacity=".8" />
            </g>
          )}
        </g>
      )}
    </svg>
  )
}

export function Avatar({ name, color }: { name: string; color: string }) {
  return <div className="avatar" style={{ background: color }} aria-hidden>{name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</div>
}
