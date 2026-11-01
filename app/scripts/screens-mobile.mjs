// Plays the full mobile journey in Chromium and saves a PNG of every screen.
// Usage: node scripts/screens-mobile.mjs [baseUrl] [outDir]
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.argv[2] ?? 'http://localhost:4173/ecoscape-vr/'
const OUT = process.argv[3] ?? '../exports/screens/mobile'
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
let n = 0
const shot = async (name) => { n++; await page.screenshot({ path: `${OUT}/${String(n).padStart(2, '0')}-${name}.png` }); console.log('shot', name) }
const wait = (ms) => page.waitForTimeout(ms)

await page.goto(BASE)
await page.evaluate(() => localStorage.clear())
await page.goto(`${BASE}#/welcome`)
await wait(1200)
await shot('onboarding-1-problem')
await page.getByRole('button', { name: /^Next/ }).click(); await wait(500)
await shot('onboarding-2-earn')
await page.getByRole('button', { name: /^Next/ }).click(); await wait(500)
await shot('onboarding-3-limit')
await page.getByRole('button', { name: /Choose my neighbourhood/ }).click(); await wait(1500)
await shot('neighbourhood')

await page.getByRole('button', { name: /Belleville/ }).click()
await page.waitForSelector('.maplibregl-canvas', { timeout: 20000 })
await wait(5000)
await shot('map')
// open a mission
const marker = page.locator('button.mk').first()
await marker.click(); await wait(600)
await shot('map-mission-sheet')
await page.getByRole('button', { name: /Walk there/ }).click(); await wait(1800)
await page.getByRole('button', { name: /Start mission/ }).click(); await wait(800)
await shot('mission-brief')
await page.getByRole('button', { name: /^Start$/ }).click(); await wait(500)
// choose: try options until the right one
for (let i = 0; i < 3; i++) {
  const opts = page.locator('button.option:not([disabled])')
  if ((await page.locator('button.option.right').count()) > 0) break
  await opts.nth(0).click(); await wait(300)
}
await shot('mission-1-choose')
await page.getByRole('button', { name: /Plant it/ }).click(); await wait(400)
// water: tap in rhythm
const waterBtn = page.getByRole('button', { name: /water/i }).last()
const t0 = Date.now()
let shotWater = false
while (Date.now() - t0 < 13000) {
  if (await waterBtn.count() === 0) break
  const txt = await page.locator('.gauge').getAttribute('aria-valuenow').catch(() => null)
  if (txt === null) break
  if (Number(txt) < 45) await waterBtn.click().catch(() => {})
  if (!shotWater && Date.now() - t0 > 5000) { await shot('mission-2-water'); shotWater = true }
  await wait(250)
}
await wait(600)
// care: pick the two good actions (mulch + the specific one at index 2)
const checks = page.locator('button.check')
await checks.nth(0).click(); await checks.nth(2).click(); await wait(200)
await page.getByRole('button', { name: /^Check$/ }).click(); await wait(300)
await shot('mission-3-care')
await page.getByRole('button', { name: /See my result/ }).click(); await wait(2200)
await shot('unlock')

await page.goto(`${BASE}#/plantings`); await wait(800)
await page.locator('input[type=range]').fill('3'); await wait(400)
await shot('plantings')
await page.goto(`${BASE}#/feed`); await wait(800)
await shot('feed')
await page.getByRole('tab', { name: /Challenges/ }).click(); await wait(400)
await shot('feed-challenges')
await page.goto(`${BASE}#/profile`); await wait(800)
await shot('profile')
await page.goto(`${BASE}#/sponsor`); await wait(800)
await shot('sponsor')

console.log('errors:', errors.length ? errors : 'none')
await browser.close()
