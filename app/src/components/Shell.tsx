import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Map, Newspaper, Sprout, UserRound } from 'lucide-react'
import { CONFIG } from '../config'
import { Logo } from './Art'

export const isEmbed = () => {
  try {
    return window.self !== window.top || new URLSearchParams(location.hash.split('?')[1] ?? '').has('embed')
  } catch {
    return true
  }
}

/** Phone-width column; on desktop a framed phone with a side panel. */
export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className={`shell-root ${isEmbed() ? 'embed' : ''}`} style={{ minHeight: '100%' }}>
      <div className="shell">
        <aside className="side">
          <div className="row"><Logo size={44} /><span className="tiny muted">Student prototype</span></div>
          <h2>EcoScape — Earn-to-Plant</h2>
          <p>Learn to care for a plant, earn a real one on your street. This is the mobile-web version — open this page on your phone for the real experience.</p>
          <div className="links">
            <Link className="btn honey" to="/vr">Open the VR premium version</Link>
            <Link className="btn" to="/compare">Mobile vs VR side by side</Link>
            <a className="btn ghost" href={`${import.meta.env.BASE_URL}brand/`}>Brand directions</a>
          </div>
          <p className="small muted" style={{ marginTop: 18 }}>Demo data. Map © OpenStreetMap contributors · OpenFreeMap. Trees, permits & cool islands: Ville de Paris open data (ODbL). Partners and sponsors shown are fictional.</p>
        </aside>
        <main className="phone">
          {CONFIG.showPrototypeRibbon && <div className="ribbon">PROTOTYPE</div>}
          {children}
        </main>
      </div>
    </div>
  )
}

export function Tabs() {
  const items = [
    { to: '/map', label: 'Map', Icon: Map },
    { to: '/feed', label: 'Community', Icon: Newspaper },
    { to: '/plantings', label: 'My plants', Icon: Sprout },
    { to: '/profile', label: 'Profile', Icon: UserRound },
  ]
  return (
    <nav className="tabs" aria-label="Main">
      {items.map(({ to, label, Icon }) => (
        <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'active' : '')}>
          <Icon size={22} strokeWidth={2.25} aria-hidden />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

export function TopBar({ title, left, right }: { title: ReactNode; left?: ReactNode; right?: ReactNode }) {
  return (
    <header className="topbar">
      <div className="row" style={{ minWidth: 0 }}>{left}<h1 className="title">{title}</h1></div>
      {right}
    </header>
  )
}
