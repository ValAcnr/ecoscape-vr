import type { Planting } from '../state'

/** Draws a 1080×1920 story image (Instagram/TikTok format) for an earned street tree and shares or downloads it. */
export async function makeStory(p: Planting, hoodName: string, index: number, max: number): Promise<Blob | null> {
  const c = document.createElement('canvas')
  c.width = 1080
  c.height = 1920
  const g = c.getContext('2d')
  if (!g) return null
  try { await document.fonts.ready } catch { /* ignore */ }
  g.fillStyle = '#cda88b'
  g.fillRect(0, 0, 1080, 1920)
  // tree motif
  const tree = (x: number, y: number, r: number, crown: string) => {
    g.fillStyle = '#7a5533'; g.fillRect(x - r * 0.14, y, r * 0.28, r * 1.5)
    g.fillStyle = crown
    for (const [dx, dy, k] of [[0, -0.35, 1], [-0.6, 0.1, 0.65], [0.6, 0.1, 0.65]]) { g.beginPath(); g.arc(x + dx * r, y + dy * r, r * k, 0, 7); g.fill() }
  }
  tree(860, 260, 110, '#1b603a')
  tree(190, 1600, 70, '#a9bfac')
  g.fillStyle = '#14281d'
  g.font = '800 64px "Bricolage Grotesque", sans-serif'
  g.fillText('EcoScape', 90, 170)
  g.font = '800 120px "Bricolage Grotesque", sans-serif'
  const lines = ['I earned', 'a real tree', `on my block.`]
  lines.forEach((l, i) => g.fillText(l, 90, 520 + i * 135))
  // card
  g.fillStyle = '#14281d'; roundRect(g, 102, 1002, 900, 470, 48); g.fill()
  g.fillStyle = '#FFFFFF'; roundRect(g, 90, 990, 900, 470, 48); g.fill()
  g.strokeStyle = '#14281d'; g.lineWidth = 8; roundRect(g, 90, 990, 900, 470, 48); g.stroke()
  g.fillStyle = '#14281d'
  g.font = '700 44px "DM Sans", sans-serif'
  g.fillText(`Street tree #${index}/${max} · New York`, 140, 1080)
  g.font = '800 76px "Bricolage Grotesque", sans-serif'
  wrap(g, `“${p.name}”`, 140, 1180, 800, 84)
  g.font = '500 42px "DM Sans", sans-serif'
  g.fillText(`${p.plantName} · ${p.addr ?? hoodName}`, 140, 1340)
  g.fillText(`Planted & cared for by ${p.partner}`, 140, 1400)
  g.font = '700 46px "DM Sans", sans-serif'
  g.fillText('Not bought. Earned. 🌳', 90, 1700)
  g.font = '500 36px "DM Sans", sans-serif'
  g.fillText((location.host + import.meta.env.BASE_URL).replace(/\/$/, ''), 90, 1770)
  return new Promise((res) => c.toBlob((b) => res(b), 'image/png'))
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath()
}
function wrap(g: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, lh: number) {
  let line = ''
  for (const w of text.split(' ')) {
    const t = line ? `${line} ${w}` : w
    if (g.measureText(t).width > max && line) { g.fillText(line, x, y); y += lh; line = w } else line = t
  }
  g.fillText(line, x, y)
}

export async function shareStory(blob: Blob, name: string) {
  const file = new File([blob], `ecoscape-${name.replace(/\W+/g, '-').toLowerCase()}.png`, { type: 'image/png' })
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: `My EcoScape tree: ${name}`, text: `I earned a real street tree on my block: “${name}” 🌳` })
      return 'shared'
    }
  } catch { /* user cancelled: fall back to download */ }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = file.name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 4000)
  return 'downloaded'
}
