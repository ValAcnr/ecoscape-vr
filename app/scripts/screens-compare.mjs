// Screenshots of /compare for each journey step. Usage: node scripts/screens-compare.mjs [baseUrl] [outDir]
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
const BASE = process.argv[2] ?? 'http://localhost:4173/ecoscape-vr/'
const OUT = process.argv[3] ?? '../exports/screens/compare'
mkdirSync(OUT, { recursive: true })
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const p = await (await b.newContext({ viewport: { width: 1440, height: 980 } })).newPage()
const errs = []; p.on('pageerror', (e) => errs.push(e.message))
await p.goto(BASE); await p.evaluate(() => localStorage.clear())
await p.goto(`${BASE}#/compare`); await p.reload(); await p.waitForTimeout(9000)
await p.screenshot({ path: `${OUT}/01-compare-explore.png` })
for (const [i, name] of [[0, 'discover'], [2, 'learn'], [3, 'unlock']]) {
  await p.locator('nav[aria-label="Journey step"] button').nth(i).click(); await p.waitForTimeout(8000)
  await p.screenshot({ path: `${OUT}/0${i + 2}-compare-${name}.png` })
}
console.log('errors', errs.length ? errs : 'none')
await b.close()
