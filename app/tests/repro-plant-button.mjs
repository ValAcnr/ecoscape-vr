// Repro: pick a plant, then press "Plant it — next: watering". Real clicks/taps, desktop + mobile.
import { chromium } from 'playwright'
const BASE = process.argv[2] ?? 'https://valacnr.github.io/ecoscape-vr/'
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
for (const mode of ['mobile', 'desktop']) {
  for (const first of [0, 1, 2]) {
    const ctx = await b.newContext(mode === 'mobile' ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : { viewport: { width: 1280, height: 800 } })
    const p = await ctx.newPage()
    const errs = []; p.on('pageerror', (e) => errs.push(e.message))
    await p.goto(BASE); await p.evaluate(() => localStorage.clear()); await p.reload()
    await p.getByRole('button', { name: 'Skip' }).click()
    await p.getByRole('button', { name: /Belleville/ }).click()
    await p.waitForSelector('button.mk', { timeout: 20000 }); await p.waitForTimeout(2500)
    const press = (loc) => (mode === 'mobile' ? loc.tap() : loc.click())
    await press(p.locator('button.mk').first()); await p.waitForTimeout(400)
    await press(p.getByRole('button', { name: /Walk there/ })); await p.waitForTimeout(1600)
    await press(p.getByRole('button', { name: /Start mission/ })); await p.waitForTimeout(500)
    await press(p.getByRole('button', { name: /^Start$/ })); await p.waitForTimeout(400)
    const names = await p.locator('button.option h3').allInnerTexts()
    await press(p.locator('button.option').nth(first)); await p.waitForTimeout(400)
    const cls = await p.locator('button.option').nth(first).getAttribute('class')
    const next = p.getByRole('button', { name: /Plant it/ })
    const disabled = await next.isDisabled()
    await next.click({ trial: false, timeout: 3000, force: true }).catch(() => {})
    await p.waitForTimeout(500)
    const h2 = await p.locator('.phone .tiny').first().innerText()
    console.log(`${mode} first=${first} (${names[first]}) result=${cls.includes('right') ? 'RIGHT' : 'WRONG'} nextDisabled=${disabled} -> screen: "${h2}" ${errs.length ? 'ERR ' + errs : ''}`)
    await ctx.close()
  }
}
await b.close()
