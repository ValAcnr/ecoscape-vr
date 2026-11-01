import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import './styles.css'
import { GameProvider, useGame } from './state'
import { Shell } from './components/Shell'
import Onboarding from './screens/Onboarding'
import Neighbourhood from './screens/Neighbourhood'
import Mission from './screens/Mission'
import Unlock from './screens/Unlock'
import Plantings from './screens/Plantings'
import Feed from './screens/Feed'
import Profile from './screens/Profile'
import Sponsor from './screens/Sponsor'

const MapScreen = lazy(() => import('./screens/MapScreen'))
const VRApp = lazy(() => import('./vr/VRApp'))
const Compare = lazy(() => import('./compare/Compare'))

function Home() {
  const { s } = useGame()
  if (!s.onboarded) return <Navigate to="/welcome" replace />
  if (!s.hoodId) return <Navigate to="/hood" replace />
  return <Navigate to="/map" replace />
}

const Loading = () => <div style={{ display: 'grid', placeItems: 'center', height: '100%', fontWeight: 700 }}>Loading…</div>

function App() {
  return (
    <Routes>
      <Route path="/vr/*" element={<Suspense fallback={<Loading />}><VRApp /></Suspense>} />
      <Route path="/compare" element={<Suspense fallback={<Loading />}><Compare /></Suspense>} />
      <Route
        path="*"
        element={
          <Shell>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/welcome" element={<Onboarding />} />
              <Route path="/hood" element={<Neighbourhood />} />
              <Route path="/map" element={<Suspense fallback={<Loading />}><MapScreen /></Suspense>} />
              <Route path="/mission/:id" element={<Mission />} />
              <Route path="/unlock/:pid" element={<Unlock />} />
              <Route path="/plantings" element={<Plantings />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/sponsor" element={<Sponsor />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Shell>
        }
      />
    </Routes>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </GameProvider>
  </StrictMode>,
)
