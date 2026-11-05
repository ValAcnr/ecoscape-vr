import { chromium } from '/root/ecoscape-vr/app/node_modules/playwright/index.mjs'
const base = 'http://localhost:4173/ecoscape-vr/'
const S = '/tmp/claude-0/-root/c7fb2921-f883-436a-9120-f4e945b254cb/scratchpad'
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const p = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage()
await p.goto(base); await p.evaluate(() => localStorage.clear())
await p.goto(`${base}#/vr/game`); await p.reload(); await p.waitForTimeout(6000)
await p.screenshot({ path: `${S}/g0.png` })
await p.mouse.click(447, 420); await p.waitForTimeout(1500)
await p.screenshot({ path: `${S}/g1.png` })
for (let i = 0; i < 3; i++) { await p.mouse.click(378, 443); await p.waitForTimeout(600) }
await p.waitForTimeout(800); await p.screenshot({ path: `${S}/g2.png` })
await p.mouse.click(372, 443); await p.waitForTimeout(3500)
await p.screenshot({ path: `${S}/g3.png` })
console.log(p.url(), await p.evaluate(() => localStorage.getItem('ecoscape-state-v2')?.slice(0, 160)))
await b.close()
