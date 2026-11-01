// VR mini-game e2e: for every Belleville mission, the VR plants must equal the mobile plants;
// then click every plant (real mouse clicks on the 3D pedestals), water, validate, reach the unlock scene.
// Usage: node tests/vr-missions-e2e.mjs <baseUrl>
import { chromium } from 'playwright'
const BASE = process.argv[2] ?? 'http://localhost:4173/ecoscape-vr/'
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const PED_X = [447, 640, 833], PED_Y = 430 // pedestal positions at 1280×720 in the game view
let fails = 0
for (const order of [[0, 1, 2], [2, 1, 0]]) for (let i = 1; i <= 8; i++) {
  const id = `belleville-m${i}`
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } })
  const p = await ctx.newPage()
  const errs = []; p.on('pageerror', (e) => errs.push(e.message))
  try {
    await p.goto(BASE)
    await p.evaluate((m) => localStorage.setItem('ecoscape-state-v1', JSON.stringify({ onboarded: true, city: 'paris', hoodId: 'belleville', activeMissionId: m })), id)
    // mobile plants for this mission
    await p.goto(`${BASE}?t=${Date.now()}#/mission/${id}`); await p.waitForTimeout(1200) // full load so the seeded state is read
    await p.getByRole('button', { name: /^Start$/ }).click(); await p.waitForTimeout(300)
    const mobile = (await p.locator('button.option h3').allInnerTexts()).join(' | ')
    // VR plants
    await p.goto(`${BASE}#/vr/game`); await p.waitForTimeout(6500)
    const summary = await p.locator('#vr-scene-summary').textContent()
    const vr = summary.match(/Plants: (.*?)\./)?.[1]
    if (!summary.includes(id)) throw new Error(`VR plays another mission: ${summary}`)
    if (vr !== mobile) throw new Error(`plants differ — mobile: ${mobile} / VR: ${vr}`)
    const steps = []
    for (const k of order) {
      const st = await p.locator('#vr-game-state').textContent()
      if (!st.startsWith('Step: choose')) break
      await p.mouse.click(PED_X[k], PED_Y); await p.waitForTimeout(700)
      const after = await p.locator('#vr-game-state').textContent()
      steps.push(after.startsWith('Step: water') ? `✓${vr.split(' | ')[k]}` : /Not this one/.test(after) ? `✗${vr.split(' | ')[k]}` : `?${after}`)
    }
    if (!(await p.locator('#vr-game-state').textContent()).startsWith('Step: water')) throw new Error('never reached watering: ' + steps.join(' → '))
    for (let w = 0; w < 3; w++) { await p.mouse.click(378, 443); await p.waitForTimeout(500) }
    if (!(await p.locator('#vr-game-state').textContent()).startsWith('Step: done')) throw new Error('watering did not complete')
    await p.mouse.click(372, 443); await p.waitForTimeout(2500)
    if (!p.url().includes('#/vr/unlock')) throw new Error('no unlock scene, url ' + p.url())
    const saved = await p.evaluate((m) => JSON.parse(localStorage.getItem('ecoscape-state-v1')).plantings.some((x) => x.missionId === m), id)
    if (!saved) throw new Error('planting not saved')
    if (errs.length) throw new Error('page errors: ' + errs.join(' / '))
    console.log(`PASS vr ${id} order=${order.join('')} plants=[${vr}] :: ${steps.join(' → ')} → unlock`)
  } catch (e) {
    fails++
    console.log(`FAIL vr ${id} :: ${e.message.split('\n')[0]}`)
    await p.screenshot({ path: `/tmp/claude-0/-root/c7fb2921-f883-436a-9120-f4e945b254cb/scratchpad/vrfail-${id}.png` }).catch(() => {})
  } finally { await ctx.close() }
}
console.log(`\nvr: 16 runs (8 missions × 2 orders), ${fails} failures`)
await b.close()
process.exit(fails ? 1 : 0)
