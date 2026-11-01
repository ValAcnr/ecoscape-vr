import type { Planting } from '../state'

/** Draws a 1080×1920 story image (Instagram/TikTok format) for a planting and shares or downloads it. */
export async function makeStory(p: Planting, hoodName: string, index: number, max: number): Promise<Blob | null> {
  const c = document.createElement('canvas')
  c.width = 1080
  c.height = 1920
  const g = c.getContext('2d')
  if (!g) return null
  try { await document.fonts.ready } catch { /* ignore */ }
  g.fillStyle = '#FFC533'
  g.fillRect(0, 0, 1080, 1920)
  // flower motif
  const flower = (x: number, y: number, r: number, petal: string) => {
    g.fillStyle = petal
    for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) { g.beginPath(); g.arc(x + dx * r, y + dy * r, r, 0, 7); g.fill() }
    g.fillStyle = '#FF6F91'; g.beginPath(); g.arc(x, y, r * 0.8, 0, 7); g.fill()
  }
  flower(860, 260, 70, '#161320')
  flower(180, 1620, 50, '#B9A4FF')
  g.fillStyle = '#161320'
  g.font = '800 64px "Bricolage Grotesque", sans-serif'
  g.fillText('EcoScape', 90, 170)
  g.font = '800 120px "Bricolage Grotesque", sans-serif'
  const lines = ['I earned', 'a real planting', `on my street.`]
  lines.forEach((l, i) => g.fillText(l, 90, 520 + i * 135))
  // card
  g.fillStyle = '#161320'; roundRect(g, 102, 1002, 900, 470, 48); g.fill()
  g.fillStyle = '#FFFFFF'; roundRect(g, 90, 990, 900, 470, 48); g.fill()
  g.strokeStyle = '#161320'; g.lineWidth = 8; roundRect(g, 90, 990, 900, 470, 48); g.stroke()
  g.fillStyle = '#161320'
  g.font = '700 44px "DM Sans", sans-serif'
  g.fillText(`Planting #${index}/${max}`, 140, 1080)
  g.font = '800 76px "Bricolage Grotesque", sans-serif'
  wrap(g, `“${p.name}”`, 140, 1180, 800, 84)
  g.font = '500 42px "DM Sans", sans-serif'
  g.fillText(`${p.plantName} · ${p.addr ?? hoodName}`, 140, 1340)
  g.fillText(`Planted by ${p.partner}`, 140, 1400)
  g.font = '700 46px "DM Sans", sans-serif'
  g.fillText('Not bought. Earned. 🌱', 90, 1700)
  g.font = '500 36px "DM Sans", sans-serif'
  g.fillText('valacnr.github.io/ecoscape-vr', 90, 1770)
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
      await navigator.share({ files: [file], title: 'My EcoScape planting', text: 'I earned a real planting on my street 🌱' })
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
