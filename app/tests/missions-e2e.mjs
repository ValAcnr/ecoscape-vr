// End-to-end test of every mission, every tree species, real clicks/taps from the map to naming the tree and the unlock screen.
// Usage: node tests/missions-e2e.mjs <baseUrl> <mobile|desktop> [hoods comma-separated]
// For each mission, run A tries the species in on-screen order (wrong ones first if they come first),
// checks the error message for each wrong pick, then finishes; run B picks the right species first.
import { chromium } from 'playwright'

const BASE = process.argv[2] ?? 'http://localhost:4173/ecoscape-vr/'
const MODE = process.argv[3] ?? 'mobile'
const HOODS = (process.argv[4] ?? 'bed-stuy,harlem,east-harlem,washington-heights,lower-east-side,mott-haven,bushwick,sunset-park,jackson-heights').split(',')
const [FROM, TO] = (process.argv[5] ?? '1-8').split('-').map(Number) // mission range, 1-based (short batches)
const CITY = { belleville: 'paris', 'goutte-dor': 'paris', 'butte-aux-cailles': 'paris', 'bed-stuy': 'nyc', 'harlem': 'nyc', 'east-harlem': 'nyc', 'washington-heights': 'nyc', 'lower-east-side': 'nyc', 'mott-haven': 'nyc', 'bushwick': 'nyc', 'sunset-park': 'nyc', 'jackson-heights': 'nyc' }

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const ctxOpts = MODE === 'mobile'
  ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }
  : { viewport: { width: 1280, height: 800 } }
let failures = 0, runs = 0

async function run(hood, idx, strategy) {
  const ctx = await browser.newContext(ctxOpts)
  const p = await ctx.newPage()
  const errs = []
  p.on('pageerror', (e) => errs.push(e.message))
  const press = (loc) => (MODE === 'mobile' ? loc.tap() : loc.click())
  const log = []
  try {
    await p.goto(BASE)
    await p.evaluate(([h, c]) => localStorage.setItem('ecoscape-state-v3', JSON.stringify({ onboarded: true, city: c, hoodId: h })), [hood, CITY[hood]])
    await p.goto(`${BASE}#/map`); await p.reload()
    await p.waitForSelector('button.mk', { timeout: 25000 }); await p.waitForTimeout(1800)
    const marker = p.locator('button.mk').nth(idx)
    const label = await marker.getAttribute('aria-label')
    await press(marker); await p.waitForTimeout(350)
    const walk = p.getByRole('button', { name: /Walk there/ })
    if (await walk.count()) { await press(walk); await p.waitForTimeout(1500) }
    await press(p.getByRole('button', { name: /Start mission/ })); await p.waitForTimeout(400)
    await press(p.getByRole('button', { name: /^Start$/ })); await p.waitForTimeout(300)

    const names = await p.locator('button.option h3').allInnerTexts()
    // Pressing the button with nothing selected must explain what to do
    await press(p.getByRole('button', { name: /^Plant it here$/ }))
    const hint = await p.getByRole('alert').innerText().catch(() => '')
    if (!/select it first/i.test(hint)) throw new Error('no hint when nothing selected')

    let order = [0, 1, 2]
    if (strategy === 'right-first') {
      order = [Number(await p.evaluate(() => sessionStorage.getItem('__right') ?? '0'))]
    }
    let advanced = false
    for (const i of order) {
      const opt = p.locator('button.option').nth(i)
      if (await opt.isDisabled()) continue
      await press(opt); await p.waitForTimeout(150)
      await press(p.getByRole('button', { name: /^Plant .* here$/ })); await p.waitForTimeout(350)
      const step = await p.locator('.phone .tiny').first().innerText()
      if (/Step 2/i.test(step)) { log.push(`✓${names[i]}`); advanced = true; break }
      const msg = await p.getByRole('alert').innerText().catch(() => '')
      if (!/Not this one/.test(msg)) throw new Error(`wrong pick "${names[i]}" gave no clear message`)
      log.push(`✗${names[i]}`)
    }
    if (!advanced) throw new Error('never reached the watering step')

    // Watering: tap whenever the weekly water (gallons) drops under 16 gal (green zone 15–20)
    const target = 16
    const btn = p.getByRole('button', { name: /water/i }).last()
    const t0 = Date.now()
    while (Date.now() - t0 < 14000) {
      const now = await p.locator('.gauge').getAttribute('aria-valuenow').catch(() => null)
      if (now === null) break
      if (Number(now) < target) await press(btn).catch(() => {})
      await p.waitForTimeout(140)
    }
    await p.waitForSelector('button.check', { timeout: 5000 })
    // Pit care: pick the three right actions (mulch, weeding, no compaction)
    for (const k of [0, 2, 4]) await press(p.locator('button.check').nth(k))
    await press(p.getByRole('button', { name: /^Check/ })); await p.waitForTimeout(200)
    const score = await p.getByLabel('Score').innerText()
    await press(p.getByRole('button', { name: /See my result/ })); await p.waitForTimeout(600)
    // Name the tree: a rude name is refused, a friendly one is accepted
    await p.getByLabel('Tree name').fill('Big Sh!t')
    await press(p.getByRole('button', { name: /Name my tree/ })); await p.waitForTimeout(200)
    if (!/friendly/i.test(await p.getByRole('alert').innerText().catch(() => ''))) throw new Error('rude name not refused')
    await p.getByLabel('Tree name').fill(`Test Tree ${idx + 1}`)
    await press(p.getByRole('button', { name: /Name my tree/ })); await p.waitForTimeout(900)
    const url = p.url()
    if (!/#\/unlock\//.test(url)) throw new Error(`no unlock screen (score ${score}, url ${url})`)
    log.push(`unlock ${score}`)
    if (errs.length) throw new Error('page errors: ' + errs.join(' / '))
    console.log(`PASS ${MODE} ${hood} #${idx + 1} [${strategy}] ${label?.replace(/^Mission: /, '')} :: ${log.join(' → ')}`)
    return log
  } catch (e) {
    failures++
    console.log(`FAIL ${MODE} ${hood} #${idx + 1} [${strategy}] :: ${log.join(' → ')} :: ${e.message.split('\n')[0]}`)
    await p.screenshot({ path: `/tmp/fail-${MODE}-${hood}-${idx}-${strategy}.png` }).catch(() => {})
    return log
  } finally {
    runs++
    await ctx.close()
  }
}

for (const hood of HOODS) {
  for (let i = FROM - 1; i < TO; i++) {
    const log = await run(hood, i, 'all-in-order')
    // right-first run: index of the plant that was right in run A
    const rightIdx = log.findIndex((x) => x.startsWith('✓')) // run A tries options 0,1,2 in order, so log index = option index
    if (rightIdx > 0) await runRightFirst(hood, i, rightIdx) // run B only needed when run A started with wrong picks
  }
}

async function runRightFirst(hood, idx, rightIdx) {
  // reuse run() with an init script telling it which option is right
  const origNew = browser.newContext.bind(browser)
  browser.newContext = async (o) => { const c = await origNew(o); await c.addInitScript((r) => { try { sessionStorage.setItem('__right', String(r)) } catch {} }, rightIdx); return c }
  await run(hood, idx, 'right-first')
  browser.newContext = origNew
}

console.log(`\n${MODE}: ${runs} runs, ${failures} failures`)
await browser.close()
process.exit(failures ? 1 : 0)
