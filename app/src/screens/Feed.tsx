import { useState } from 'react'
import { Heart, MapPin, Share2, Trophy } from 'lucide-react'
import { HOOD_SUMMARY } from '../data/hoods'
import { CHALLENGES, LEADERBOARD, POSTS } from '../data/social'
import { useGame, BADGES, type Planting } from '../state'
import { Tabs, TopBar } from '../components/Shell'
import { Avatar, PlantArt } from '../components/Art'
import { makeStory, shareStory } from '../components/story'
import { CONFIG } from '../config'

export default function Feed() {
  const { s, set, addBadge } = useGame()
  const [tab, setTab] = useState<'feed' | 'challenges'>('feed')
  const hood = s.hoodId ? HOOD_SUMMARY[s.hoodId]?.name : 'Belleville'
  const mine = s.plantings.map((p, i) => ({ id: p.id, who: 'You', color: 'var(--honey)', when: 'Just now', kind: 'planting' as const, text: `Unlocked planting #${i + 1}: “${p.name}” — ${p.partner} plants it within 3 weeks.`, plant: { type: p.type, name: p.plantName, stage: 1 }, likes: 3, street: p.addr ?? undefined, own: p }))
  const posts: (typeof POSTS[number] & { own?: Planting })[] = [...mine.reverse(), ...POSTS]
  const like = (id: string) => set((st) => ({ likes: st.likes.includes(id) ? st.likes.filter((x) => x !== id) : [...st.likes, id] }))

  return (
    <div className="screen with-tabs">
      <TopBar title={`${hood} community`} />
      <div className="pad stack" style={{ paddingTop: 0 }}>
        <div className="row" role="tablist">
          <button role="tab" aria-selected={tab === 'feed'} className={`chip ${tab === 'feed' ? 'sun' : ''}`} onClick={() => setTab('feed')}>Feed</button>
          <button role="tab" aria-selected={tab === 'challenges'} className={`chip ${tab === 'challenges' ? 'sun' : ''}`} onClick={() => setTab('challenges')}>Challenges & badges</button>
        </div>

        {tab === 'feed' && (
          <>
            <div className="card shadow" style={{ background: 'var(--lilac)' }}>
              <div className="row between"><span className="tiny">Neighbourhood challenge</span><span className="small">{CHALLENGES[0].ends}</span></div>
              <h3 style={{ margin: '4px 0 8px' }}>{CHALLENGES[0].title}</h3>
              <div className="meter"><i style={{ width: `${(CHALLENGES[0].done / CHALLENGES[0].goal) * 100}%` }} /></div>
              <p className="small" style={{ marginTop: 6 }}>{CHALLENGES[0].done}/{CHALLENGES[0].goal} tree bases planted by neighbours</p>
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
                    {p.kind === 'growth' && <span className="badge" style={{ background: '#9be2b9' }}>Growing</span>}
                  </div>
                  <p>{p.text}</p>
                  {p.plant && (
                    <div className="post-media row" style={{ background: '#fff', padding: 8, gap: 12 }}>
                      <PlantArt type={p.plant.type} stage={p.plant.stage} w={88} />
                      <div className="small"><b>{p.plant.name}</b><br /><span className="muted">{p.plant.stage <= 1 ? 'Planting scheduled' : `Month ${p.plant.stage === 4 ? 3 : 1} update`}</span></div>
                    </div>
                  )}
                  <div className="row" style={{ gap: 8 }}>
                    <button className="chip" onClick={() => like(p.id)} aria-pressed={liked} style={{ background: liked ? 'var(--petal)' : undefined }}><Heart size={14} fill={liked ? '#161320' : 'none'} /> {p.likes + (liked ? 1 : 0)}</button>
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
            <div className="card">
              <div className="row" style={{ gap: 8, marginBottom: 8 }}><Trophy size={18} /><h3>Neighbourhood league</h3></div>
              {LEADERBOARD.map((l, i) => (
                <div key={l.hood} className="row between" style={{ padding: '6px 0', borderTop: i ? '1px solid var(--soft-line)' : 0 }}>
                  <span><b>{i + 1}.</b> {l.hood}</span><span className="chip leaf">{l.plantings} plantings</span>
                </div>
              ))}
            </div>
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
      <Tabs />
    </div>
  )
}
