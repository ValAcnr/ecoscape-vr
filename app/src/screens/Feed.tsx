import { useState } from 'react'
import { Heart, MapPin, Share2, TreeDeciduous, Trophy } from 'lucide-react'
import { HOOD_SUMMARY } from '../data/hoods'
import { social, type Post } from '../data/social'
import { useGame, BADGES, type Planting } from '../state'
import { Tabs, TopBar } from '../components/Shell'
import { Avatar, PlantArt } from '../components/Art'
import { makeStory, shareStory } from '../components/story'
import { CITIES, CONFIG } from '../config'

type Tab = 'feed' | 'league' | 'challenges'

export default function Feed() {
  const { s, set, addBadge } = useGame()
  const [tab, setTab] = useState<Tab>('feed')
  const { posts: POSTS, challenges: CHALLENGES, leaderboard: LEADERBOARD } = social(s.city)
  const hood = (s.hoodId && HOOD_SUMMARY[s.hoodId]?.name) || CITIES[s.city].label
  const mine = s.plantings.map((p, i) => ({ id: p.id, who: 'You', color: 'var(--honey)', when: 'Just now', kind: 'planting' as const, text: `Earned street tree #${i + 1}/${CONFIG.maxPlantings}: “${p.name}”, a ${p.plantName.toLowerCase()} — ${p.partner} plants it within 3 weeks and looks after it for ${CONFIG.careYears} years.`, plant: { type: p.type, name: p.name, species: p.plantName, stage: 1 }, likes: 3, street: p.addr ?? undefined, own: p }))
  const posts: (Post & { own?: Planting })[] = [...mine.reverse(), ...POSTS]
  const like = (id: string) => set((st) => ({ likes: st.likes.includes(id) ? st.likes.filter((x) => x !== id) : [...st.likes, id] }))

  // League: trees still alive, with the player's own trees counted in their neighbourhood
  const myByHood = s.plantings.reduce<Record<string, number>>((acc, p) => ({ ...acc, [p.hoodId]: (acc[p.hoodId] ?? 0) + 1 }), {})
  const rows = LEADERBOARD.map((l) => ({ ...l, alive: l.alive + (l.hoodId ? myByHood[l.hoodId] ?? 0 : 0), planted: l.planted + (l.hoodId ? myByHood[l.hoodId] ?? 0 : 0) }))
  if (s.hoodId && !rows.some((r) => r.hoodId === s.hoodId) && HOOD_SUMMARY[s.hoodId]) {
    const mineN = myByHood[s.hoodId] ?? 0
    rows.push({ hood: HOOD_SUMMARY[s.hoodId].name, hoodId: s.hoodId, alive: 12 + mineN, planted: 14 + mineN })
  }
  rows.sort((a, b) => b.alive - a.alive)

  const TABS: [Tab, string][] = [['feed', 'Feed'], ['league', 'League'], ['challenges', 'Challenges & badges']]
  return (
    <>
    <div className="screen with-tabs">
      <TopBar title={`${hood} community`} />
      <div className="pad stack" style={{ paddingTop: 0 }}>
        <div className="row wrap" role="tablist" style={{ gap: 6 }}>
          {TABS.map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} className={`chip ${tab === id ? 'sun' : ''}`} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>

        {tab === 'feed' && (
          <>
            <div className="card shadow" style={{ background: 'var(--lilac)' }}>
              <div className="row between"><span className="tiny">Neighbourhood challenge</span><span className="small">{CHALLENGES[0].ends}</span></div>
              <h3 style={{ margin: '4px 0 8px' }}>{CHALLENGES[0].title}</h3>
              <div className="meter"><i style={{ width: `${(CHALLENGES[0].done / CHALLENGES[0].goal) * 100}%` }} /></div>
              <p className="small" style={{ marginTop: 6 }}>{CHALLENGES[0].done}/{CHALLENGES[0].goal} street trees earned by neighbours</p>
            </div>
            {posts.map((p) => {
              const liked = s.likes.includes(p.id)
              return (
                <article key={p.id} className="card stack" style={{ gap: 10 }}>
                  <div className="row">
                    <Avatar name={p.who} color={p.color} />
                    <div style={{ flex: 1 }}>
                      <b>{p.who}</b> <span className="muted small">· {p.when}</span>
                      {p.street && <div className="row small muted" style={{ gap: 4 }}><MapPin size={12} /> {p.street}</div>}
                    </div>
                    {p.kind === 'badge' && <span className="badge">Badge</span>}
                    {p.kind === 'growth' && <span className="badge" style={{ background: '#a9bfac' }}>Growing</span>}
                  </div>
                  <p>{p.text}</p>
                  {p.plant && (
                    <div className="post-media row" style={{ background: '#fff', padding: 8, gap: 12 }}>
                      <PlantArt stage={p.plant.stage} w={88} variant={p.id.length + p.plant.name.length} />
                      <div className="small"><b>“{p.plant.name}”</b><br />{p.plant.species}<br /><span className="muted">{p.plant.stage <= 1 ? 'Planting scheduled' : p.plant.stage === 2 ? 'Inspection 1 passed' : 'Survived its first summer'}</span></div>
                    </div>
                  )}
                  <div className="row" style={{ gap: 8 }}>
                    <button className="chip" onClick={() => like(p.id)} aria-pressed={liked} style={{ background: liked ? 'var(--petal)' : undefined }}><Heart size={14} fill={liked ? '#14281d' : 'none'} /> {p.likes + (liked ? 1 : 0)}</button>
                    {p.own && (
                      <button className="chip" onClick={async () => { const own = p.own!; const b = await makeStory(own, hood ?? '', s.plantings.indexOf(own) + 1, CONFIG.maxPlantings); if (b) { await shareStory(b, own.name); set((st) => ({ shares: st.shares + 1 })); addBadge('sharer') } }}><Share2 size={14} /> Story</button>
                    )}
                  </div>
                </article>
              )
            })}
            <p className="small muted center">Community posts are illustrative (fictional neighbours).</p>
          </>
        )}

        {tab === 'league' && (
          <>
            <div className="card shadow">
              <div className="row" style={{ gap: 8, marginBottom: 4 }}><Trophy size={18} /><h3>Neighbourhood league</h3></div>
              <p className="small muted" style={{ marginBottom: 8 }}>Ranked by street trees <b>still alive</b> — not by trees planted. A tree only counts if the block keeps it watered and protected.</p>
              {rows.map((l, i) => {
                const me = l.hoodId === s.hoodId
                return (
                  <div key={l.hood} className={`league-row ${me ? 'mine' : ''}`}>
                    <span className="rank">{i + 1}</span>
                    <div>
                      <b>{l.hood}</b>{me && <span className="small"> · you</span>}
                      <div className="tiny muted">{l.planted} planted · {Math.round((l.alive / l.planted) * 100)}% still alive</div>
                    </div>
                    <span className="chip leaf"><TreeDeciduous size={14} /> {l.alive} alive</span>
                  </div>
                )
              })}
            </div>
            <p className="small muted center">Demo figures. Alive = checked at the partner NGO's last inspection (2 a year).</p>
          </>
        )}

        {tab === 'challenges' && (
          <>
            {CHALLENGES.map((c) => (
              <div key={c.id} className="card shadow">
                <div className="row between"><h3>{c.title}</h3><span className="small muted">{c.ends}</span></div>
                <p className="small" style={{ margin: '4px 0 8px' }}>{c.desc}</p>
                <div className="meter"><i style={{ width: `${(c.done / c.goal) * 100}%` }} /></div>
                <div className="row between small" style={{ marginTop: 6 }}><span>{c.done}/{c.goal}</span><span className="badge">{c.reward}</span></div>
              </div>
            ))}
            <h3>Badges to earn</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {Object.entries(BADGES).map(([id, b]) => (
                <div key={id} className="card" style={{ padding: 10, opacity: s.badges.includes(id) ? 1 : 0.55 }}>
                  <span className="badge" style={{ background: b.color }}>{b.label}</span>
                  <p className="small" style={{ marginTop: 6 }}>{b.desc}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
    <Tabs />
    </>
  )
}
